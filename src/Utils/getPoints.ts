import axios from "axios";
import ebirdcode from "@/app/Resources/ebirdCodes.json";
import distinctcolors from "distinct-colors";
import zip from "lodash/zip";
import listSpecies from "@/Utils/listSpecies";

interface EbirdCode {
  [key: string]: string;
}

export default async function getPoints() {
  // get the points from the database
  let hexcolors: any[] = [];
  const points = await axios
    .get(`api/getpoints`)
    .then(async function (response) {
      console.log("GOT POINTS", response.data);

      const track: String[] = [];
      for (let i = 0; i < response.data.length; i++) {
        track.push(response.data[i].responseChecklist.track);
      }
      const locName = [];
      for (let i = 0; i < response.data.length; i++) {
        locName.push(response.data[i].responseChecklist.locName);
      }
      const coords: String[] = [];
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
      const dependent: String[] = [];
      for (let i = 0; i < response.data.length; i++) {
        dependent.push(response.data[i].responseChecklist.dependent);
      }
      const date: String[] = [];
      for (let i = 0; i < response.data.length; i++) {
        date.push(response.data[i].responseChecklist.obsDt);
      }
      const duration: String[] = [];
      for (let i = 0; i < response.data.length; i++) {
        duration.push(
          Math.round(response.data[i].responseChecklist.durationHrs * 60) +
            " mins"
        );
      }
      const ID: String[] = [];
      for (let i = 0; i < response.data.length; i++) {
        ID.push(response.data[i].responseChecklist.subId);
      }
      const notes: String[] = [];
      for (let i = 0; i < response.data.length; i++) {
        notes.push(response.data[i].responseChecklist.comments);
      }
      // get the species from the database and format them into a string for the popup
      const species = [];
      for (let i = 0; i < response.data.length; i++) {
        const speciesList = [];
        for (
          let j = 0;
          j < response.data[i].responseChecklist.obs.length;
          j++
        ) {
          const ebirdcodes: EbirdCode = ebirdcode;
          const sixcode: string =
            response.data[i].responseChecklist.obs[j].speciesCode;
          const name: string = ebirdcodes[sixcode];
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
        species.push(speciesList.join("\n"));
      }
      // get the observer from the database
      const observer = [];
      for (let i = 0; i < response.data.length; i++) {
        observer.push(response.data[i].responseChecklist.userDisplayName);
      }

      const colors = distinctcolors({
        count: response.data.length,
      });
    //   let hexcolors = [];
      for (let i = 0; i < colors.length; i++) {
        hexcolors.push(colors[i].hex());
      }
      console.log(hexcolors);
      const color = [];
      for (let i = 0; i < response.data.length; i++) {
        color.push(
          hexcolors[Number(response.data[i].responseChecklist.dependent)]
        );
      }
    //   setColors(hexcolors);
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
      };
    })
    .catch(function (error) {
      console.log(error);
    });
  console.log(points);
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
      points.color
    );
    console.log(data);
    // setpoints(data);

    let dep_arr = ["Delete"]; // array of dependents
    for (let i = 0; i < data.length; i++) {
      dep_arr.push(String(i));
    }
    // setdeps(dep_arr);
    const {species, specieswithCounts} = await listSpecies();
    return {points: data, deps: dep_arr, colors: hexcolors, species: species, specieswithCounts: specieswithCounts};
  }
}
