from typing import Sequence
from .models import Checklist, Species
import polars as pl
from pathlib import Path


def create_species_summary(species: Sequence[Species]):
    """
    Given a list of species, create the output summary
    """
    taxon_filepath = Path(__file__).parent.parent / "data" / "eBird_taxonomy_v2024.csv"
    taxon = pl.read_csv(taxon_filepath).select(
        pl.col("SPECIES_CODE"),
        pl.col("TAXON_ORDER"),
        pl.col("PRIMARY_COM_NAME"),
    )

    species_list = [specie.model_dump() for specie in species]

    # group_number = -1 means that we want to remove that observation
    species_df = pl.DataFrame(species_list).filter(pl.col("group_number") != -1)

    grouped_species = (
        (
            species_df.group_by(["species_code", "group_number"])
            .agg(pl.col("count").max())
            .group_by(["species_code"])
            .agg(pl.col("count").sum())
        )
        .join(taxon, left_on="species_code", right_on="SPECIES_CODE")
        .sort(pl.col("TAXON_ORDER"))
        .select(["PRIMARY_COM_NAME", "species_code", "count"])
        .rename({"PRIMARY_COM_NAME": "common_name"})
    )

    return grouped_species


def create_effort_summary(checklists: Sequence[Checklist]):
    """
    Given a list of checklists, return the summary of the effort

    Effort is the number of hours spent birding as well as the number of distance traveled
    """
    hours = 0.0
    kms = 0.0
    for check in checklists:
        hours += check.duration_hr or 0.0
        kms += check.distance_km or 0.0

    return hours, kms
