"use client";

import axios from "axios";
import React, { use, useState } from "react";
import getPoints from "@/Utils/getPoints";

export default function Header() {
  const [checklists, setChecklists] = useState<string>("");
  const [species, setSpecies] = useState<any>({});
  const [speciesWithCountsStr, setSpeciesWithCounts] = useState<String[]>([]);
  const [markerColors, setMarkerColors] = useState<any>({});
  const [speciesMode, setSpeciesMode] = useState<boolean>(false);
  const [deps, setDeps] = useState<any>({});
  const [markers, setPoints] = useState<any[][]>([]);

  async function findChecklists() {
    let response: String[];
    if (!checklists.includes("S")) {
      response = await axios
        .get(`api/tripreport?number=${checklists}`)
        .then((response) => {
          console.log(response.data);
          return response.data;
        });
    } else {
      response = checklists.replace(/\s/g, "").split(",");
    }
    return response;
  }

  async function putChecklists(checklists: string) {
    await axios
      .put(`api/addchecklists?checklists=${checklists}`)
      .then((response) => {
        console.log(response);
      });
  }

  const addChecklists = async (e: React.FormEvent) => {
    console.log("addChecklists");
    e.preventDefault();
    const checklists = await findChecklists();
    const checklistsString = JSON.stringify(checklists);
    await putChecklists(checklistsString);
    const pointsData = await getPoints();
    if (pointsData) {
      setDeps(pointsData.deps);
      setPoints(pointsData.points);
      setMarkerColors(pointsData.colors);
      setSpecies(pointsData.species);
      setSpeciesWithCounts(pointsData.specieswithCounts);
    }
  };

  let clear = async () => {
    // clear the database
    await axios
      .post("api/clear")
      .then(function (response) {
        console.log("CLEARED", response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <div className="flex">
      <div className="flex-1">
        1.) Input the checklist IDs or trip report number in the text box. Then
        submit. <br></br>
        3.) Sign into your account when the window open. Do not touch the chrome
        window while it collects the tracks. <br></br>
        3.) Navigate to the points and click on them to see the species and
        notes. Select the 'group' status for each point to group overlapping
        points together.<br></br>
        4.) Species Mode allows you to go species by species when grouping
        checklists. <br></br>
        5.) Click "Get Species" to get the species from the database and compile
        them into a CSV file that will download.<br></br>
      </div>
      <div className="flex-1">
        <form onSubmit={addChecklists}>
          <label>
            <input
              type="text"
              value={checklists}
              placeholder="Checklists IDs (comma delimited) or Trip Report"
              onChange={(e) => setChecklists(e.target.value)}
            />
          </label>
          <input type="submit" className="cursor-pointer p-1.5"/>
        </form>
      </div>
      <div className="flex-1">
        <button
          onClick={() => {
            const confirm = window.confirm(
              "Are you sure you want to clear the database?"
            );
            if (confirm) {
              clear();
            }
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
