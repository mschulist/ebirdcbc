from typing import List, Optional, Tuple
from pydantic import BaseModel


class Checklist(BaseModel):
    id: Optional[int] = None
    project_id: int
    checklist_id: str
    location_name: str
    location_coords: List[float]
    comments: str
    track_points: Optional[List[Tuple[float, float]]]


class Species(BaseModel):
    id: Optional[int] = None
    checklist_id: int
    species_code: str
    comments: str | None
    count: int
    group_number: int


class Project(BaseModel):
    id: Optional[int] = None
    name: str
    ebird_username: str
    ebird_encrypted_password: Optional[str]


class User(BaseModel):
    id: Optional[int] = None
    name: str
    username: str
    hashed_password: str
    allowed_project_ids: List[int]


class TokenData(BaseModel):
    username: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    name: str
    username: str
