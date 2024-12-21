import axios from 'axios';

export default async function listSpecies(): Promise<{species: {}, specieswithCounts: String[]}> {
    const species = await axios.get(`api/getspecies`)
      .then(function (response) {
        console.log("GOT SPECIES", response.data);
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });

    const speciesList = [];
    for (let i = 0; i < species.length; i++) {
      speciesList.push(species[i].common_name);
    }

    const counts: String[] = [];
    for (let i = 0; i < species.length; i++) {
      counts.push(species[i].count);
    }

    const result: any = {};
    speciesList.forEach((x, i) => result[x] = counts[i]);
    // setSpecies(result);

    let speciesWithCounts = [];
    for (let i = 0; i < species.length; i++) {
      speciesWithCounts.push(`${speciesList[i]} (${species[i].count})`);
    }
    // setSpeciesWithCounts(speciesWithCounts);
    return {species: result, specieswithCounts: speciesWithCounts};
  }