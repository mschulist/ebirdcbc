import getDbPoints from "@/Utils/getDbPoints";
import type { NextApiRequest, NextApiResponse } from "next";
import DataFrame from "dataframe-js";

export async function GET() {
  const data = await getSpecies();
  return Response.json(data);
}

async function getSpecies() {
  const data = await getDbPoints();
  // console.log(data);
  let distanceDaySum = 0;
  let distanceNightSum = 0;
  const weather = await getWeather(
    data[0].responseChecklist.coords[0],
    data[0].responseChecklist.coords[1],
    data[0].responseChecklist.obsDt.substring(0, 10)
  );
  console.log(weather);
  const sunriseHour = weather[0][0];
  const sunriseMinute = weather[0][1];
  const sunsetHour = weather[1][0];
  const sunsetMinute = weather[1][1];
  for (let i = 0; i < data.length; i++) {
    const distance = data[i].responseChecklist.effortDistanceKm;
    const hours = +data[i].responseChecklist.obsDt.substring(11, 13);
    const minutes = +data[i].responseChecklist.obsDt.substring(14, 16);
    console.log(hours, minutes);
    if (distance !== undefined) {
      if (
        (hours < sunriseHour && minutes < sunriseMinute) ||
        (hours > sunsetHour && minutes > sunsetMinute)
      ) {
        distanceNightSum += distance;
      } else {
        distanceDaySum += distance;
      }
    }
  }
  distanceDaySum = Math.round(distanceDaySum * 100) / 100;
  distanceNightSum = Math.round(distanceNightSum * 100) / 100;
  console.log(distanceDaySum);
  console.log(distanceNightSum);

  var obs = [];
  for (let i = 0; i < data.length; i++) {
    const observ = data[i].responseChecklist.obs;
    const species = [];
    for (let j = 0; j < observ.length; j++) {
      const code = observ[j].speciesCode;
      const count = observ[j].howManyAtleast;
      species.push(JSON.parse(`{"${code}": ${count}}`));
    }
    obs.push(species);
  }
  // get the deps on a species level first
  const speciesDeps = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].responseChecklist.obs.length; j++) {
      const dep = data[i].responseChecklist.obs[j].speciesDependent;
      speciesDeps.push(dep);
    }
  }
  //console.log("speciesDeps", speciesDeps);

  // get the deps on a checklist level
  const deps = [];
  for (let i = 0; i < obs.length; i++) {
    for (let j = 0; j < obs[i].length; j++) {
      const dep = data[i].responseChecklist.dependent;
      deps.push(dep);
    }
  }
  // console.log("deps", deps);

  for (let i = 0; i < deps.length; i++) {
    if (speciesDeps[i] != undefined) {
      deps[i] = speciesDeps[i];
    }
  }

  // console.log("true", deps.length == speciesDeps.length);

  // get the checklist that the dep is from
  const checklist = [];
  for (let i = 0; i < obs.length; i++) {
    for (let j = 0; j < obs[i].length; j++) {
      const dep = data[i].responseChecklist.obs[j].subId;
      checklist.push(dep);
    }
  }
  // console.log("checklist", checklist);

  // take from "GCKI: 1" to {species: "GCKI", count: 1}
  var obs = obs.flat(1);
  const species = [];
  for (let i = 0; i < obs.length; i++) {
    species.push(Object.keys(obs[i])[0]);
  }
  const counts = [];
  for (let i = 0; i < obs.length; i++) {
    counts.push(Object.values(obs[i])[0]);
  }
  const names = [];
  for (let i = 0; i < species.length; i++) {
    names.push(ebirdcode[species[i]]);
  }

  const position = [];
  for (let i = 0; i < species.length; i++) {
    position.push(ebirdTaxonomy[species[i]]);
  }
  // console.log("position", position);

  // console.log(obs.length);
  //console.log(data);
  const df = new DataFrame({
    count: counts,
    species: species,
    common_name: names,
    dependent: deps,
    taxPos: position,
    checklist: checklist,
  });
  df.show();
  // console.log(df.dim());
  df.sortBy("taxPos");

  // agg by 'species' and get the checklists as a string for that species
  const checklistString = df.toArray();
  // console.log(checklistString);

  // get the list of checklists sorted by species
  let checklistBySpecies = [];
  for (let i = 0; i < checklistString.length; i++) {
    checklistBySpecies.push(checklistString[i][5]);
  }
  // console.log(checklistBySpecies);

  // get the number of times each species was seen
  const checklistCount = df
    .groupBy("species")
    .aggregate((group: any) => group.count())
    .toArray();
  const speciesCounts = [];
  for (let i = 0; i < checklistCount.length; i++) {
    speciesCounts.push(checklistCount[i][1]);
  }
  // console.log(speciesCounts);

  // get the list of checklists for each species
  const checklistList = [];
  for (let i = 0; i < speciesCounts.length; i++) {
    let speciesChecks = [];
    for (let j = 0; j < speciesCounts[i]; j++) {
      speciesChecks.push(checklistBySpecies[0]);
    }
  } // NOT WORKING YET

  const speciesList = df
    .filter((row: any) => row.get("dependent") !== "Delete")
    .groupBy("dependent", "species", "common_name")
    .aggregate((group: any) => {
      const sum = group.stat.max("count");
      const checklists = group.select("checklist").toArray();
      return [sum, checklists];
    })
    .rename("aggregation", "count_checklists")
    .withColumn("count", (row: any) => row.get("count_checklists")[0])
    .withColumn(
      "checklists",
      (row: any) => "(" + String(row.get("count_checklists")[1]) + ")"
    )
    .groupBy("species", "common_name")
    .aggregate((group: any) => {
      const sum = group.stat.sum("count");
      const checklists = [].concat(...group.select("checklists").toArray());
      // console.log(checklists);
      return [sum, checklists];
    })
    .rename("aggregation", "count_checklists")
    .withColumn("count", (row: any) => row.get("count_checklists")[0])
    .withColumn("checklists", (row: any) => String(row.get("count_checklists")[1]))
    .select("species", "common_name", "count", "checklists");
  speciesList.show();
  const speciesListCollection = speciesList.toCollection();
  // console.log(speciesListCollection);
  return speciesListCollection;
}
