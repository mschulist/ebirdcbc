from typing import List
from supabase import create_client
from postgrest.types import CountMethod
from .models import Checklist, Species, User, Project
from fastapi import HTTPException

USERS_TABLE_NAME = "users"
PROJECTS_TABLE_NAME = "projects"
CHECKLIST_TABLE_NAME = "checklists"
SPECIES_TABLE_NAME = "species"


class CBCDB:
    def __init__(self, url: str, key: str):
        self.supabase = create_client(url, key)

    def get_user(self, username: str) -> User:
        """
        Get a user from the db by their username
        """
        user = (
            self.supabase.table(USERS_TABLE_NAME)
            .select("*")
            .eq("username", username)
            .execute()
        )
        if len(user.data) == 0:
            raise HTTPException(
                status_code=500, detail=f"user not found with username: {username}"
            )

        user_data = user.data[0]
        return User(
            id=user_data["id"],
            name=user_data["name"],
            username=user_data["username"],
            hashed_password=user_data["hashed_password"],
            allowed_project_ids=user_data["allowed_project_ids"],
        )

    def add_user(self, user: User):
        """
        Add a user to the database
        """
        # somewhat of a hack for now...
        user_json = user.model_dump()
        del user_json["id"]
        self.supabase.table(USERS_TABLE_NAME).insert(user_json).execute()

    def get_project(self, project_id: int, include_ebird_password=False) -> Project:
        projects = (
            self.supabase.table(PROJECTS_TABLE_NAME)
            .select("*")
            .eq("id", project_id)
            .execute()
            .data
        )
        if len(projects) == 0:
            raise HTTPException(
                status_code=500, detail=f"Project with id {project_id} not found"
            )
        project = projects[0]

        ebird_password = (
            project["ebird_encrypted_password"] if include_ebird_password else None
        )

        return Project(
            id=project["id"],
            name=project["name"],
            ebird_username=project["ebird_username"],
            ebird_encrypted_password=ebird_password,
        )

    def add_checklist(self, checklist: Checklist) -> int:
        """
        Adds a checklist to the database.

        Return:
            id of the added checklist
        """
        checklist_data = checklist.model_dump()
        del checklist_data["id"]
        data = (
            self.supabase.table(CHECKLIST_TABLE_NAME)
            .insert(checklist_data)
            .execute()
            .data
        )
        if len(data) == 0:
            raise ValueError("failed to add checklist")
        return data[0]["id"]

    def get_preexisting_checklists_count(self, project_id: int) -> int:
        """
        Returns the number of checklists under a given project
        """
        return (
            self.supabase.table(CHECKLIST_TABLE_NAME)
            .select("id", count=CountMethod.exact)
            .eq("project_id", project_id)
            .execute()
            .count
        ) or 0

    def add_species(self, species_list: List[Species]):
        """
        Adds many species to the database
        """
        species_data = []
        for species in species_list:
            specie = species.model_dump()
            del specie["id"]
            species_data.append(specie)

        self.supabase.table(SPECIES_TABLE_NAME).insert(species_data).execute()

    def get_checklists_by_project_id(self, project_id: int) -> List[Checklist]:
        """
        Gets all of the checklists by project id
        """
        checks = (
            self.supabase.table(CHECKLIST_TABLE_NAME)
            .select("*")
            .eq("project_id", project_id)
            .execute()
            .data
        )

        checklists = [Checklist(**check) for check in checks]
        return checklists

    def get_species_by_checklist_ids(self, checklist_ids: List[int]) -> List[Species]:
        """
        Gets all of the species by project id
        """
        data = (
            self.supabase.table(SPECIES_TABLE_NAME)
            .select("*")
            .in_("checklist_id", checklist_ids)
            .execute()
            .data
        )

        species = [Species(**dat) for dat in data]
        return species

    def update_species_group(self, species_id: int, new_group: int):
        """
        Update the group given the species id
        """
        (
            self.supabase.table(SPECIES_TABLE_NAME)
            .update({"group_number": new_group})
            .eq("id", species_id)
            .execute()
        )
