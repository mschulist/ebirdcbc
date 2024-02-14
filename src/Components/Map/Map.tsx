import {
  MapContainer,
  TileLayer,
  Popup,
  Marker,
  Polyline,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

export default function Map() {
  return (
    <MapContainer center={[38, -122]} zoom={4}>
      <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
    </MapContainer>
  );
}
