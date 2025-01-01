from datetime import timedelta, datetime
from typing import Annotated
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
from .lib.models import Project, Token, User, UserResponse
from .lib.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    hash_password,
)
from .lib.db import CBCDB
from .lib.trip_report import get_trip_report_checklists
from .lib.get_checklist import add_checklists_information
from .lib.summary import create_species_summary, create_effort_summary
from .lib.taxon import add_order_and_species
import os


url = os.getenv("SUPABASE_URL") or "test"
key = os.getenv("SUPABASE_KEY") or "test"

ACCESS_TOKEN_EXPIRE_MINUTES = 180

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = CBCDB(url, key)


def authorize_project_access(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
) -> int:
    """
    Given a project_id, current_user, and db, check if the user has access to the project.

    Returns the project id.
    """
    project = db.get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="project not found")
    if project.id is None:
        raise HTTPException(status_code=400)

    if project_id not in current_user.allowed_project_ids:
        raise HTTPException(status_code=403, detail="Forbidden")

    return project.id


@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="Bearer")


@app.get("/users/me")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    return UserResponse(name=current_user.name, username=current_user.username)


@app.post("/add_user")
async def add_user(name: str, username: str, password: str):
    hashed_password = hash_password(password)
    user = User(
        id=None,
        name=name,
        username=username,
        hashed_password=hashed_password,
        allowed_project_ids=[],
    )
    db.add_user(user)
    return {"message": "successfully added user to database", "success": True}


@app.post("/my_projects")
async def my_projects(current_user: Annotated[User, Depends(get_current_user)]):
    if current_user.id is None:
        raise HTTPException(status_code=400, detail="user has no id")

    projects_ids = current_user.allowed_project_ids
    projects = [db.get_project(i) for i in projects_ids]
    return projects


@app.post("/update_project")
async def update_project(
    project_id: Annotated[int, Depends(authorize_project_access)],
    project: Project,
):
    db.update_project(project)

    return {"message": "successfully updated project"}


@app.post("/add_trip_report")
async def add_trip_report(
    project_id: Annotated[int, Depends(authorize_project_access)],
    trip_report_id: int,
    background_tasks: BackgroundTasks,
):
    async def add_checks():
        checklists = await get_trip_report_checklists(trip_report_id)
        project = db.get_project(project_id, True)
        await add_checklists_information(checklists, project, db)
        print("finished adding checklists")

    background_tasks.add_task(add_checks)

    return {"message": "started to add checklists"}


@app.get("/get_checklists_and_species")
async def get_checklists_and_species(
    project_id: Annotated[int, Depends(authorize_project_access)],
):
    checklists = db.get_checklists_by_project_id(project_id)
    if len(checklists) == 0:
        return {"checklists": [], "species": []}
    checklist_ids = [
        checklist.id for checklist in checklists if checklist.id is not None
    ]
    species = db.get_species_by_checklist_ids(checklist_ids)

    species_with_tax_info = add_order_and_species(species)

    return {"checklists": checklists, "species": species_with_tax_info}


@app.post("/update_species_group")
async def update_species_group(
    project_id: Annotated[int, Depends(authorize_project_access)],
    species_id: int,
    new_group: int,
):
    db.update_species_group(species_id, new_group)


@app.post("/get_summary")
async def get_summary(
    project_id: Annotated[int, Depends(authorize_project_access)],
):
    """
    Get the final output summary for the project
    """

    checklists = db.get_checklists_by_project_id(project_id)
    checklist_ids = [
        checklist.id for checklist in checklists if checklist.id is not None
    ]
    species = db.get_species_by_checklist_ids(checklist_ids)

    summary = create_species_summary(species)

    return summary.to_dicts()


@app.post("/get_summary_csv")
async def get_summary_csv(
    project_id: Annotated[int, Depends(authorize_project_access)],
):
    """
    Get the final output summary for the project
    """

    project = db.get_project(project_id)

    checklists = db.get_checklists_by_project_id(project_id)
    checklist_ids = [
        checklist.id for checklist in checklists if checklist.id is not None
    ]
    species = db.get_species_by_checklist_ids(checklist_ids)

    summary = create_species_summary(species)

    effort_hrs, effort_kms = create_effort_summary(checklists)

    stream = io.StringIO()
    summary.write_csv(stream)
    stream.write(f"\nParty Hours: {effort_hrs}\nParty Kilometers: {effort_kms}\n")

    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = (
        f"attachment; filename=cbc_summary_{project.name}_{datetime.now().strftime("%Y-%m-%d_%H-%M")}.csv"
    )
    return response


@app.post("/upsert_checklist")
async def upsert_checklist(
    project_id: Annotated[int, Depends(authorize_project_access)],
    checklist_id: str,
):
    """
    "Re add" a checklist to a project.

    If the checklist is already in the project, we will update it
    although this will remove all of the species groupings for the checklist
    that we are updating.

    If the checklist does not exist, we will get the data for it and add it to the
    database.
    """
    _ = db.get_project(project_id)
    raise HTTPException(
        status_code=501, detail="Upsert checklist is not yet implemented"
    )
