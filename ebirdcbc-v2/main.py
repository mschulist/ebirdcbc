from datetime import timedelta
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from .lib.models import Token, User, UserResponse
from .lib.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    hash_password,
)
from .lib.db import CBCDB
from .lib.trip_report import get_trip_report_checklists
from .lib.get_checklist import add_checklists_information
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


@app.post("/add_trip_report")
async def add_trip_report(
    project_id: Annotated[int, Depends(authorize_project_access)],
    trip_report_id: int,
):
    checklists = await get_trip_report_checklists(trip_report_id)
    project = db.get_project(project_id, True)
    await add_checklists_information(checklists, project, db)

    return {"message": "successfully added checklists"}


@app.get("/get_checklists_and_species")
async def get_checklists_and_species(
    project_id: Annotated[int, Depends(authorize_project_access)],
):
    checklists = db.get_checklists_by_project_id(project_id)
    checklist_ids = [
        checklist.id for checklist in checklists if checklist.id is not None
    ]
    species = db.get_species_by_checklist_ids(checklist_ids)

    return {"checklists": checklists, "species": species}
