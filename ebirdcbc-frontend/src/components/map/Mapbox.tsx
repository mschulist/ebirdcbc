'use client'

import Map from 'react-map-gl/maplibre'
import { getSpeciesModeTrackLayers, getTrackLayers } from './tracks'
import { Checklist, ChecklistResponse, Species } from '@/models/ebird'
import { useState, useEffect, useCallback } from 'react'
import {
  getServerRequest,
  postServerRequest,
} from '@/networking/server_requests'
import DeckGL, { IconLayer, PathLayer, PickingInfo, TextLayer } from 'deck.gl'
import { getCurrentProject } from '../navigation/ProjectSelector'
import { ChecklistPopupModal } from './ChecklistPopupModal'
import { SpeciesModeCheckbox } from './SpeciesModeCheckbox'
import { SpeciesPopupModal } from './SpeciesPopupModal'
import { SpeciesSelectorWithLabel } from './SpeciesModeSelector'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'get_your_own_key'

function getTooltip({ object }: PickingInfo<Checklist>) {
  if (!object) {
    return null
  }
  return (
    object && {
      html: `\
        <div>${object.location_name}</div>
    `,
      className: 'rounded-xl',
    }
  )
}

export function Mapbox() {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [species, setSpecies] = useState<Species[]>([])
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(
    null
  )
  const [speciesMode, setSpeciesMode] = useState<boolean>(false)
  const [selectedSpecies, setSelectedSpecies] = useState<string>()
  const [speciesModeLayers, setSpeciesModeLayers] = useState<
    (PathLayer | IconLayer | TextLayer)[]
  >([])
  const [totalForCurrentSpecies, setTotalForCurrentSpecies] =
    useState<number>(0)

  useEffect(() => {
    fetchChecklistsAndSpecies().then((checklistsAndSpecies) => {
      const checklists = checklistsAndSpecies.checklists
      const species = checklistsAndSpecies.species
      setChecklists(checklists)
      setSpecies(species)
      if (species.length > 0) {
        setSelectedSpecies(species[0].species_name)
      }
    })
  }, [])

  const openModal = useCallback(() => {
    const modal = document.getElementById('modal')
    if (modal) {
      const m = modal as HTMLDialogElement
      m.showModal()
    }
  }, [])

  const layers = getTrackLayers(
    checklists,
    openModal,
    setSelectedChecklist,
    selectedChecklist
  )

  useEffect(() => {
    if (selectedSpecies) {
      const layers = getSpeciesModeTrackLayers(
        checklists,
        selectedSpecies,
        openModal,
        selectedChecklist,
        setSelectedChecklist
      )
      setSpeciesModeLayers(layers)
    }
  }, [
    selectedSpecies,
    openModal,
    selectedChecklist,
    checklists,
    speciesMode,
    species,
  ])

  useEffect(() => {
    if (selectedSpecies) {
      setTotalForCurrentSpecies(getTotalForSpecies(species, selectedSpecies))
    }
  }, [selectedSpecies, species])

  async function handleUpdateGroup(specie: Species, newGroup: number) {
    const updatedSpecies = species.map((s) =>
      s.id === specie.id ? { ...s, group_number: newGroup } : s
    )
    setSpecies(updatedSpecies)

    const updatedChecklists = checklists.map((checklist) => {
      const updatedChecklistSpecies = checklist.species.map((s) =>
        s.id === specie.id ? { ...s, group_number: newGroup } : s
      )
      return {
        ...checklist,
        species: updatedChecklistSpecies,
      }
    })
    setChecklists(updatedChecklists)

    await updateGroupOfSpecies(specie, newGroup).then(() => {
      fetchChecklistsAndSpecies().then((checklistsAndSpecies) => {
        const checklists = checklistsAndSpecies.checklists
        const species = checklistsAndSpecies.species
        setChecklists(checklists)
        setSpecies(species)
      })
    })
  }

  return (
    <div className='relative h-full'>
      <div className='absolute top-2 left-4 z-10 flex space-y-2 gap-4 items-baseline'>
        <SpeciesModeCheckbox
          speciesMode={speciesMode}
          toggleSpeciesMode={() => setSpeciesMode(!speciesMode)}
        />
        {speciesMode && selectedSpecies && (
          <SpeciesSelectorWithLabel
            selectedSpecies={selectedSpecies}
            setSelectedSpecies={setSelectedSpecies}
            species={species}
            totalForCurrentSpecies={totalForCurrentSpecies}
          />
        )}
      </div>
      <DeckGL
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 11,
        }}
        layers={!speciesMode ? layers : speciesModeLayers}
        controller={{
          dragRotate: false,
          dragPan: selectedChecklist ? false : true,
          scrollZoom: selectedChecklist ? false : true,
          touchRotate: false,
          touchZoom: selectedChecklist ? false : true,
        }}
        pickingRadius={10}
        getTooltip={getTooltip}
      >
        <Map
          initialViewState={{
            longitude: -122.4,
            latitude: 37.8,
            zoom: 14,
          }}
          mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${MAPBOX_TOKEN}`}
        >
          {!speciesMode ? (
            <ChecklistPopupModal
              selectedChecklist={selectedChecklist}
              setSelectedChecklist={setSelectedChecklist}
            />
          ) : (
            <SpeciesPopupModal
              selectedChecklist={selectedChecklist}
              setSelectedChecklist={setSelectedChecklist}
              selectedSpecies={selectedSpecies}
              handleUpdateGroup={handleUpdateGroup}
            />
          )}
        </Map>
      </DeckGL>
    </div>
  )
}

export async function fetchChecklistsAndSpecies() {
  const projectId = getCurrentProject()?.id
  const response = await getServerRequest(
    `get_checklists_and_species?project_id=${projectId}`
  )
  if (response.ok) {
    const res = await response.json()
    const checklists_wo_species = res.checklists
    const species = res.species
    const checklists: Checklist[] = checklists_wo_species.map(
      (checklist: ChecklistResponse) => {
        const species_for_checklist = species.filter(
          (s: Species) => s.checklist_id === checklist.id
        )
        return {
          ...checklist,
          species: species_for_checklist,
        }
      }
    )
    const checks = checklists as Checklist[]
    const specs = species as Species[]
    return { checklists: checks, species: specs }
  }
  console.error('Failed to fetch checklists and species')
  return { checklists: [], species: [] }
}

async function updateGroupOfSpecies(species: Species, group: number) {
  const projectId = getCurrentProject()?.id
  if (!projectId) {
    return
  }
  const res = await postServerRequest(
    `update_species_group?project_id=${projectId}&species_id=${species.id}&new_group=${group}`,
    {}
  )
  if (res.status !== 200) {
    console.error('Failed to update group of species')
    throw new Error('Failed to update group of species')
  }
}

function getTotalForSpecies(species: Species[], selectedSpecies: string) {
  const speciesEntries = species.filter(
    (s) => s.species_name === selectedSpecies && s.group_number !== -1
  )

  const groupedSpecies = speciesEntries.reduce(
    (groups, species) => {
      const groupNum = species.group_number
      if (!groups[groupNum]) {
        groups[groupNum] = []
      }
      groups[groupNum].push(species)
      return groups
    },
    {} as Record<number, Species[]>
  )

  return Object.values(groupedSpecies).reduce((total, speciesGroup) => {
    const maxCount = Math.max(...speciesGroup.map((s) => s.count))
    return total + maxCount
  }, 0)
}
