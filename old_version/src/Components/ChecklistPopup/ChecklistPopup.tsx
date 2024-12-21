import { Popup } from "react-leaflet";
import { Group } from "../Group/Group";
import axios from "axios";
import getPoints from "@/Utils/getPoints";
import speciesView from "@/Utils/speciesView";

interface ChecklistPopupProps {
  checklistID: string;
  location: string;
  observer: string;
  date: string;
  duration: string;
  checklistComments: string;
  group: string;
  species: string;
  setMarkerColors: (colors: any) => void;
  setSpeciesMarkers: (markers: any[]) => void;
  setDeps: (deps: any) => void;
}

export default function ChecklistPopup({
  checklistID,
  location,
  observer,
  date,
  duration,
  checklistComments,
  group,
  species,
  setMarkerColors,
  setSpeciesMarkers,
  setDeps,
}: ChecklistPopupProps) {
  async function updateSpeciesDep(
    species: string,
    checklist: string,
    group: string
  ) {
    await axios
      .get(
        `api/speciesdep?species=${species}&checklist=${checklist}&group=${group}`
      )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
    getPoints();
    speciesView(species, setMarkerColors, setSpeciesMarkers, setDeps);
  }

  return (
    <Popup>
      <h3>Checklist ID: {checklistID}</h3>
      <h3>Location: {location}</h3>
      <h3>Observer: {observer}</h3>
      <h3>Date: {date}</h3>
      <h3>Duration: {duration}</h3>
      <h3>Checklist Comments: {checklistComments}</h3>
      <h3>Group: {group}</h3>
      <Group
        species={species}
        checklist={checklistID}
        onClick={updateSpeciesDep}
      />
    </Popup>
  );
}
