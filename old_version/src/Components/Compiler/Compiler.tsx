"use client";

import axios from "axios";
import React, { use, useState } from "react";
// import Map from "@/Components/Map/Map";
import Header from "@/Components/Header/Header";
import dynamic from "next/dynamic";
import Head from "next/head";

const Map = dynamic(() => import("@/Components/Map/Map"), { ssr: false });

export default function Compiler() {
  const [checklists, setChecklists] = useState<string>("");
  const [species, setSpecies] = useState<any>({});
  const [speciesWithCountsStr, setSpeciesWithCounts] = useState<String[]>([]);
  const [markerColors, setMarkerColors] = useState<any>({});
  const [speciesMode, setSpeciesMode] = useState<boolean>(false);
  const [deps, setDeps] = useState<any>({});
  const [markers, setPoints] = useState<any[][]>([]);
  const [speciesForView, setSpeciesForView] = useState<string>("");
  const [speciesMarkers, setSpeciesMarkers] = useState([]);

  console.log(speciesMode);

  return (
    <>
      <div className="flex-col h-screen flex">
        <div className="flex-none">
          <Header
            setChecklists={setChecklists}
            checklists={checklists}
            setSpecies={setSpecies}
            species={species}
            setSpeciesWithCounts={setSpeciesWithCounts}
            speciesWithCountsStr={speciesWithCountsStr}
            setMarkerColors={setMarkerColors}
            markerColors={markerColors}
            setSpeciesMode={setSpeciesMode}
            speciesMode={speciesMode}
            setDeps={setDeps}
            deps={deps}
            setPoints={setPoints}
            markers={markers}
            setSpeciesForView={setSpeciesForView}
            speciesForView={speciesForView}
          />
        </div>
        <div className="flex-1">
          <Map
            setDeps={setDeps}
            setSpeciesForView={setSpeciesForView}
            markers={markers}
            speciesForView={speciesForView}
            setMarkerColors={setMarkerColors}
            markerColors={markerColors}
            speciesMode={speciesMode}
            speciesMarkers={speciesMarkers}
            setSpeciesMarkers={setSpeciesMarkers}
          />
        </div>
      </div>
    </>
  );
}
