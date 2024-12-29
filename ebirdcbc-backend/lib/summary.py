from typing import List
from .models import Species
import polars as pl


def create_species_summary(species: List[Species]):
    """
    Given a list of species, create the output summary
    """

    taxon = pl.read_csv("data/eBird_taxonomy_v2024.csv").select(
        pl.col("SPECIES_CODE"),
        pl.col("TAXON_ORDER"),
        pl.col("PRIMARY_COM_NAME"),
    )

    species_list = [specie.model_dump() for specie in species]

    species_df = pl.DataFrame(species_list)

    grouped_species = (
        (
            species_df.group_by(["species_code", "group_number"])
            .agg(pl.col("count").sum())
            .group_by(["species_code"])
            .agg(pl.col("count").sum())
        )
        .join(taxon, left_on="species_code", right_on="SPECIES_CODE")
        .sort(pl.col("TAXON_ORDER"))
        .select(["PRIMARY_COM_NAME", "species_code", "count"])
        .rename({"PRIMARY_COM_NAME": "common_name"})
    )

    return grouped_species
