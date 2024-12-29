from typing import List
from .models import Species
import polars as pl


def add_order_and_species(species: List[Species]):
    taxon = pl.read_csv("data/eBird_taxonomy_v2024.csv").select(
        pl.col("SPECIES_CODE"),
        pl.col("TAXON_ORDER"),
        pl.col("PRIMARY_COM_NAME"),
    )

    species_dicts = [spe.model_dump() for spe in species]

    species_df = pl.DataFrame(species_dicts)

    joined = species_df.join(
        taxon, left_on="species_code", right_on="SPECIES_CODE"
    ).rename({"TAXON_ORDER": "taxon_order", "PRIMARY_COM_NAME": "species_name"})

    return joined.to_dicts()
