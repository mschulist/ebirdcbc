from typing import List
from .models import Project, Checklist, Species
from .ebird_auth import decrypt_password
from .get_track import get_track
import requests
from .db import CBCDB
import os


async def add_checklists_information(
    checklist_ids: List[str], project: Project, db: CBCDB
):
    """
    Given a list of checklist ids, retrieve all of the relevant information about them
    and add it to the database
    """
    api_key = os.getenv("EBIRD_API_KEY") or "key"

    if project.id is None:
        raise ValueError("project id is None!")
    # we need to decrypt the password to get the tracks
    ebird_username = project.ebird_username
    if project.ebird_encrypted_password is None:
        raise ValueError("ebird password cannot be None")
    ebird_password = decrypt_password(project.ebird_encrypted_password)

    tracks_map = await get_track(ebird_username, ebird_password, checklist_ids)

    preexisting_checklist_ids = [
        c["checklist_id"] for c in db.get_preexisting_checklists(project.id)
    ]
    num_new_checklists = 0
    for checklist in checklist_ids:
        if checklist in preexisting_checklist_ids:
            print(f"skipping checklist id {checklist} b/c it already exists")
            continue
        checklist_info, location_info = ebird_api_checklist(checklist, api_key)
        track = tracks_map.get(checklist, None)

        lon = (location_info["bounds"]["minX"] + location_info["bounds"]["maxX"]) / 2
        lat = (location_info["bounds"]["minY"] + location_info["bounds"]["maxY"]) / 2

        check = Checklist(
            id=None,
            project_id=project.id,
            location_name=location_info["result"],
            location_coords=[lat, lon],
            comments=checklist_info.get("comments", None),
            track_points=track,
            checklist_id=checklist,
            distance_km=checklist_info.get("effortDistanceKm", None),
            duration_hr=checklist_info.get("durationHrs", None),
            datetime=checklist_info.get("obsDt", None),
            num_observers=checklist_info.get("numObservers", None),
        )
        checklist_id = db.add_checklist(check)

        species_list: List[Species] = []

        for specie in checklist_info["obs"]:
            species_list.append(
                Species(
                    species_code=specie["speciesCode"],
                    checklist_id=checklist_id,
                    count=specie["howManyAtleast"],
                    comments=specie.get("comments", None),
                    group_number=num_new_checklists + len(preexisting_checklist_ids),
                )
            )

        db.add_species(species_list)
        # if we successfully added the checklist, we increment the number of new checklists
        num_new_checklists += 1


def ebird_api_checklist(checklist_id: str, api_key: str):
    """
    Using the eBird API, get the checklist information (location, species, etc...)

    Returns:
        checklist_info, location_info
    """
    url = f"https://api.ebird.org/v2/product/checklist/view/{checklist_id}"
    checklist_info = requests.get(url, headers={"X-eBirdApiToken": api_key}).json()

    location_id = checklist_info["locId"]

    location_url = f"https://api.ebird.org/v2/ref/region/info/{location_id}"
    location_info = requests.get(
        location_url, headers={"X-eBirdApiToken": api_key}
    ).json()
    return checklist_info, location_info
