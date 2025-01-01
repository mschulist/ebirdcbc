from typing import List, Optional, Sequence
from .models import Checklist, Species, User, Project
from fastapi import HTTPException
from .ebird_auth import encrypt_password
from sqlmodel import create_engine, Session, select, col
from sqlalchemy.orm.attributes import flag_modified


class CBCDB:
    def __init__(self, postgres_url: str):
        self.engine = create_engine(postgres_url)

    def get_user(self, username: str) -> User:
        """
        Get a user from the db by their username
        """
        with Session(self.engine) as session:
            user = session.exec(select(User).where(User.username == username)).first()
            if not user:
                raise HTTPException(
                    status_code=500, detail=f"user not found with username: {username}"
                )
            return user

    def add_user(self, user: User):
        """
        Add a user to the database
        """
        with Session(self.engine) as session:
            user.id = None
            session.add(user)
            session.commit()

    def get_project(self, project_id: int, include_ebird_password=False) -> Project:
        with Session(self.engine) as session:
            project = session.exec(
                select(Project).where(Project.id == project_id)
            ).first()
            if not project:
                raise HTTPException(
                    status_code=500, detail=f"Project with id {project_id} not found"
                )
            if not include_ebird_password:
                project.ebird_encrypted_password = None
            return project

    def update_project(self, project: Project):
        """
        Updates a project

        If ebird password is passed, then we update the password

        Otherwise we leave the password alone
        """
        with Session(self.engine) as session:
            if project.ebird_encrypted_password is not None:
                project.ebird_encrypted_password = encrypt_password(
                    project.ebird_encrypted_password
                )
            session.add(project)
            session.commit()
            session.refresh(project)

    def add_checklist(self, checklist: Checklist) -> Optional[int]:
        """
        Adds a checklist to the database.

        Return:
            id of the added checklist
        """
        with Session(self.engine) as session:
            checklist.id = None
            session.add(checklist)
            session.commit()
            session.refresh(checklist)
            return checklist.id

    def get_preexisting_checklists(self, project_id: int) -> Sequence[str]:
        """
        Returns the checklists under a given project
        """
        with Session(self.engine) as session:
            statement = select(Checklist.checklist_id).where(
                Checklist.project_id == project_id
            )
            result = session.exec(statement).all()
            return result

    def add_species(self, species_list: List[Species]):
        """
        Adds many species to the database
        """
        with Session(self.engine) as session:
            for sp in species_list:
                sp.id = None
                session.add(sp)
            session.commit()

    def get_checklists_by_project_id(self, project_id: int) -> Sequence[Checklist]:
        """
        Gets all of the checklists by project id
        """
        with Session(self.engine) as session:
            statement = select(Checklist).where(Checklist.project_id == project_id)
            checks = session.exec(statement).all()
            return checks

    def get_species_by_checklist_ids(
        self, checklist_ids: List[int]
    ) -> Sequence[Species]:
        """
        Gets all of the species by project id
        """
        with Session(self.engine) as session:
            statement = select(Species).where(
                col(Species.checklist_id).in_(checklist_ids)
            )
            species_data = session.exec(statement).all()
            return species_data

    def update_species_group(self, species_id: int, new_group: int):
        """
        Update the group given the species id
        """
        with Session(self.engine) as session:
            spec = session.exec(select(Species).where(Species.id == species_id)).first()
            if not spec:
                raise HTTPException(status_code=500, detail="Species not found")
            spec.group_number = new_group
            session.commit()
            session.refresh(spec)

    def add_project(self, project: Project):
        """
        Add a project to the database
        """
        with Session(self.engine) as session:
            session.add(project)
            session.commit()
            return project.id

    def update_allowed_projects(self, user_id: int, project_id: int):
        """
        Updates the allowed projects for a user
        """
        with Session(self.engine) as session:
            user = session.exec(select(User).where(User.id == user_id)).first()
            if not user:
                return False
            user.allowed_project_ids.append(project_id)
            flag_modified(user, "allowed_project_ids")
            session.add(user)
            session.commit()
            session.refresh(user)
            return True
