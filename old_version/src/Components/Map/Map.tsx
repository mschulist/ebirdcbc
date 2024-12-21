/* eslint-disable react/jsx-key */
// import { TileLayer, Popup, Marker, Polyline, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import ChecklistPopup from "../ChecklistPopup/ChecklistPopup";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
  }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  {
    ssr: false,
  }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  {
    ssr: false,
  }
);

const center = [38, -122];

export interface MapProps {
  markers: any[][];
  speciesMarkers: any[][];
  markerColors: any;
  speciesMode: boolean;
  speciesForView: string;
  setSpeciesForView: (species: string) => void;
  setMarkerColors: (colors: any) => void;
  setSpeciesMarkers: (species: any) => void;
  setDeps: (deps: any) => void;
}

export default function Map({
  markers,
  speciesMarkers,
  markerColors,
  speciesMode,
  speciesForView,
  setSpeciesForView,
  setMarkerColors,
  setSpeciesMarkers,
  setDeps,
}: MapProps) {
  return (
    <MapContainer center={center} zoom={4}>
      <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

      {speciesMarkers.map((marker) => (
        <Marker position={marker[1]}>
          <ChecklistPopup
            checklistID={marker[4]}
            location={marker[8]}
            observer={marker[7]}
            date={marker[2]}
            duration={marker[3]}
            checklistComments={marker[6]}
            group={marker[0]}
            species={marker[5]}
            setMarkerColors={setMarkerColors}
            setSpeciesMarkers={setSpeciesMarkers}
            setDeps={setDeps}
          />
        </Marker>
      ))}
    </MapContainer>
  );
}
