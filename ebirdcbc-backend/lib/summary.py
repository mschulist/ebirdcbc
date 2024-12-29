from typing import List
from .models import Species
import polars as pl


def create_species_summary(species: List[Species]):
    """
    Given a list of species, create the output summary
    """
    species_list = [specie.model_dump() for specie in species]

    species_df = pl.DataFrame(species_list)

    grouped_species = (
        species_df.group_by(["species_code", "group_number"])
        .agg(pl.col("count").sum())
        .group_by(["species_code"])
        .agg(pl.col("count").sum())
    )
    return grouped_species
