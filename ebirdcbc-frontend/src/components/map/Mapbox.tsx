'use client'

import Map from 'react-map-gl/maplibre'
import { getTrackLayers } from './tracks'
import { Checklist, ChecklistResponse, Species } from '@/models/ebird'
import { useState, useEffect } from 'react'
import { getServerRequest } from '@/networking/server_requests'
import DeckGL, { PickingInfo } from 'deck.gl'
import { getCurrentProject } from '../navigation/ProjectSelector'
import { PopupModal } from './PopupModal'

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
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(
    null
  )

  useEffect(() => {
    fetchChecklists().then((checklists) => setChecklists(checklists))
  }, [])

  function openModal() {
    const modal = document.getElementById('modal')
    if (modal) {
      const m = modal as HTMLDialogElement
      m.showModal()
    }
  }

  const layers = getTrackLayers(
    checklists,
    openModal,
    setSelectedChecklist,
    selectedChecklist
  )

  return (
    <div className='h-5/6'>
      <DeckGL
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        layers={layers}
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
          <PopupModal
            selectedChecklist={selectedChecklist}
            setSelectedChecklist={setSelectedChecklist}
          />
        </Map>
      </DeckGL>
    </div>
  )
}

export async function fetchChecklists() {
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
    return checklists as Checklist[]
  }
  throw new Error('Failed to fetch checklists')
}
