'use client'

import Map from 'react-map-gl/maplibre'
import { getSpeciesModeTrackLayers, getTrackLayers } from './tracks'
import { Checklist, ChecklistResponse, Species } from '@/models/ebird'
import { useState, useEffect, useCallback } from 'react'
import { getServerRequest } from '@/networking/server_requests'
import DeckGL, { PathLayer, PickingInfo } from 'deck.gl'
import { getCurrentProject } from '../navigation/ProjectSelector'
import { ChecklistPopupModal } from './ChecklistPopupModal'
import { SpeciesModeCheckbox } from './SpeciesModeCheckbox'
import { SpeciesSelector } from './SpeciesSelector'
import { SpeciesPopupModal } from './SpeciesPopupModal'

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
  const [speciesModeLayers, setSpeciesModeLayers] = useState<PathLayer[]>([])

  useEffect(() => {
    fetchChecklistsAndSpecies().then((checklistsAndSpecies) => {
      const checklists = checklistsAndSpecies.checklists
      const species = checklistsAndSpecies.species
      setChecklists(checklists)
      setSpecies(species)
      setSelectedSpecies(species[0].species_code)
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
  }, [selectedSpecies, openModal])

  return (
    <div className='h-5/6 relative'>
      <div className='absolute top-2 left-4 z-10 flex space-y-2 gap-4 items-baseline'>
        <SpeciesModeCheckbox
          speciesMode={speciesMode}
          toggleSpeciesMode={() => setSpeciesMode(!speciesMode)}
        />
        {speciesMode && selectedSpecies && (
          <div className='flex flex-col space-y-2'>
            <div className='flex items-center space-x-2'>
              <SpeciesSelector
                selectedSpecies={selectedSpecies}
                setSelectedSpecies={setSelectedSpecies}
                species={species}
              />
              <span className='text-black text-lg'>
                Selected Species: {selectedSpecies}
              </span>
            </div>
          </div>
        )}
      </div>
      <DeckGL
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 11,
        }}
        layers={!speciesMode ? layers : speciesModeLayers}
        controller={selectedChecklist ? false : true}
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
              fetchChecklists={() => fetchChecklistsAndSpecies()}
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
  throw new Error('Failed to fetch checklists')
}