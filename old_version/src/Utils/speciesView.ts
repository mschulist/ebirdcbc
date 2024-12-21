import axios from "axios";
import ebirdcode from "@/app/Resources/ebirdCodes.json";
import { EbirdCode } from "./getPoints";
import distinctcolors from "distinct-colors";
import zip from "lodash/zip";
import listSpecies from "./listSpecies";

const ebirdcodes: EbirdCode = ebirdcode;

export default async function speciesView(
  specie: string,
  setMarkerColors = ([]) => {},
  setSpeciesMarkers = ([]) => {},
  setdeps = ([]) => {},
) {
  const points = await axios
    .get(`http://localhost:9000/get-points`)
    .then(async function (response) {
      console.log("GOT POINTS", response.data);

      // get the species from the database and format them into a string for the popup
      const species = [];
      for (let i = 0; i < response.data.length; i++) {
        const speciesList = [];
        for (
          let j = 0;
          j < response.data[i].responseChecklist.obs.length;
          j++
        ) {
          const sixcode: string =
            response.data[i].responseChecklist.obs[j].speciesCode;
          const name = ebirdcodes[sixcode];
          if (name === specie) {
            const count =
              response.data[i].responseChecklist.obs[j].howManyAtleast;
            const code = `${name} (${count})`;
            var comments = response.data[i].responseChecklist.obs[j].comments;
            if (comments === undefined) {
              speciesList.push(`${code}`);
            } else {
              speciesList.push(`${code} — ${comments}`);
            }
          }
        }
        species.push(speciesList.join("\n"));
      } // I realized this is useless because we already know the species, but whatever it adds more lines of code

      // get the lists that contain that species
      const contain = [];
      console.log(species);
      for (let i = 0; i < response.data.length; i++) {
        if (species[i] === "") {
          contain.push(false);
        } else {
          contain.push(true);
        }
      }

      const track = [];
      for (let i = 0; i < response.data.length; i++) {
        track.push(response.data[i].responseChecklist.track);
      }
      console.log("tracks", track);
      const locName = [];
      for (let i = 0; i < response.data.length; i++) {
        locName.push(response.data[i].responseChecklist.locName);
      }

      const coords = [];
      for (let i = 0; i < response.data.length; i++) {
        console.log("track", track[i].length === 0);
        if (track[i].length === 0) {
          coords.push(response.data[i].responseChecklist.coords);
        }
        if (track[i].length !== 0) {
          const median = Math.floor(track[i].length / 2);
          coords.push(track[i][median]);
        }
      }
      console.log("coords", coords);

      const countList = []; // actually the count here
      for (let i = 0; i < response.data.length; i++) {
        const counts = [];
        for (
          let j = 0;
          j < response.data[i].responseChecklist.obs.length;
          j++
        ) {
          const sixcode: string =
            response.data[i].responseChecklist.obs[j].speciesCode;
          const name = ebirdcodes[sixcode];
          if (name == specie) {
            const count =
              response.data[i].responseChecklist.obs[j].howManyAtleast;
            countList[i] = count;
          }
        }
      }

      // setCount(countList);

      const dependent = [];
      for (let i = 0; i < response.data.length; i++) {
        for (
          let j = 0;
          j < response.data[i].responseChecklist.obs.length;
          j++
        ) {
          const sixcode = response.data[i].responseChecklist.obs[j].speciesCode;
          const name = ebirdcodes[sixcode];
          if (name == specie) {
            const dep =
              response.data[i].responseChecklist.obs[j].speciesDependent;
            dependent[i] = dep;
          }
        }
      }

      const date = [];
      for (let i = 0; i < response.data.length; i++) {
        date.push(response.data[i].responseChecklist.obsDt);
      }
      const duration = [];
      for (let i = 0; i < response.data.length; i++) {
        duration.push(
          Math.round(response.data[i].responseChecklist.durationHrs * 60) +
            " mins"
        );
      }
      const ID = [];
      for (let i = 0; i < response.data.length; i++) {
        ID.push(response.data[i].responseChecklist.subId);
      }
      const notes = [];
      for (let i = 0; i < response.data.length; i++) {
        notes.push(response.data[i].responseChecklist.comments);
      }

      // get the observer from the database
      const observer = [];
      for (let i = 0; i < response.data.length; i++) {
        observer.push(response.data[i].responseChecklist.userDisplayName);
      }

      const listDependent = [];
      for (let i = 0; i < response.data.length; i++) {
        listDependent.push(response.data[i].responseChecklist.dependent);
      }

      const colorDeps = [];
      for (let i = 0; i < response.data.length; i++) {
        if (dependent[i] == undefined) {
          colorDeps[i] = String(listDependent[i]);
        } else {
          colorDeps[i] = String(dependent[i]);
        }
      }
      console.log("dependent", dependent);

      // setDepList(colorDeps);

      const colors = distinctcolors({
        count: response.data.length,
      });
      let hexcolors = [];
      for (let i = 0; i < colors.length; i++) {
        hexcolors[i] = colors[i].hex();
      }
      console.log(colors);
      const color: any = [];
      for (let i = 0; i < response.data.length; i++) {
        color.push(hexcolors[Number(colorDeps[i])]);
      }

      // countList is the list of counts for each observation
      let colorsForMarker = [];
      countList.map((count, index) => {
        colorsForMarker[count] = color[index];
      });

      setMarkerColors([]);
      return {
        coords: coords,
        dependent: dependent,
        date: date,
        duration: duration,
        ID: ID,
        notes: notes,
        species: species,
        observer: observer,
        locName: locName,
        track: track,
        color: color,
        contain: contain,
        counts: countList,
      };
    })
    .catch(function (error) {
      console.log(error);
    });
  console.log("points", points);
  if (points) {
    const data = zip(
      points.dependent,
      points.coords,
      points.date,
      points.duration,
      points.ID,
      points.species,
      points.notes,
      points.observer,
      points.locName,
      points.track,
      points.color,
      points.counts
    );
    console.log("contain", points.contain);
    const filtered_data = data.filter((_r, i) => points.contain[i]);
    console.log("filtered", filtered_data);
    setSpeciesMarkers(filtered_data);

    let dep_arr = ["Delete"]; // array of dependents
    for (let i = 0; i < data.length; i++) {
      dep_arr.push(String(i));
    }
    setdeps(dep_arr);
    await listSpecies();
  }
}
