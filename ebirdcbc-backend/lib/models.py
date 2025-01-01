from typing import List, Optional
from pydantic import BaseModel
from sqlmodel import Field, SQLModel, Column, JSON


class Checklist(SQLModel, table=True):
    __tablename__ = "checklists"  # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(index=True, foreign_key="projects.id")
    checklist_id: str = Field(index=True)
    location_name: str = Field()
    location_coords: List[float] = Field(sa_column=Column(JSON))
    comments: Optional[str] = Field()
    track_points: Optional[List[List[float]]] = Field(sa_column=Column(JSON))
    datetime: str | None = Field()
    num_observers: int = Field()
    duration_hr: float | None = Field()
    distance_km: float | None = Field()


class Species(SQLModel, table=True):
    __tablename__ = "species"  # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    checklist_id: int = Field(foreign_key="checklists.id")
    species_code: str = Field()
    comments: str | None = Field()
    count: int = Field()
    group_number: int = Field()


class Project(SQLModel, table=True):
    __tablename__ = "projects"  # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field()
    ebird_username: str = Field()
    ebird_encrypted_password: Optional[str] = Field()


class User(SQLModel, table=True):
    __tablename__ = "users"  # type: ignore

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field()
    username: str = Field(unique=True)
    hashed_password: str = Field()
    allowed_project_ids: List[int] = Field(sa_column=Column(JSON))


class TokenData(BaseModel):
    username: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    name: str
    username: str


class eBirdCredentials(BaseModel):
    ebird_username: str
    ebird_password: str


class CreateUserRequest(BaseModel):
    name: str
    username: str
    password: str


class CreateProjectRequest(BaseModel):
    name: str
    ebird_username: str
    ebird_password: str
