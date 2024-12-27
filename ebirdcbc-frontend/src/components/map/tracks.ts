'use client'

import { PathLayer } from 'deck.gl'
import { Checklist } from '@/models/ebird'
import distinctColors from 'distinct-colors'

export function getTrackLayers(
  checklists: Checklist[],
  openModal: () => void,
  setSelectedChecklist: (checklist: Checklist) => void,
  selectedChecklist: Checklist | null
) {
  const colors = distinctColors({ count: checklists.length })

  const layers = checklists.map((checklist, i) => {
    return new PathLayer({
      id: `line-layer-${i}`,
      data: [checklist],
      getPath: (check: Checklist) => {
        if (!check.track_points) {
          return [check.location_coords[1], check.location_coords[0]]
        }
        const path: [number, number][] = check.track_points.map((point) => [
          point[1],
          point[0],
        ])
        return path
      },
      getColor: colors[i].rgb(),
      getWidth: 15,
      pickable: true,
      onClick: (pickingInfo) => {
        if (selectedChecklist != null) return
        openModal()
        if (pickingInfo && pickingInfo.coordinate) {
          setSelectedChecklist(checklist)
        }
      },
    })
  })

  return layers
}

export function getSpeciesModeTrackLayers(
  checklists: Checklist[],
  selectedSpecies: string,
  openModal: () => void,
  selectedChecklist: Checklist | null,
  setSelectedChecklist: (checklist: Checklist) => void
) {
  const colors = distinctColors({ count: checklists.length })

  const layers = checklists
    .filter((checklist) =>
      checklist.species.some((s) => s.species_code === selectedSpecies)
    )
    .map((checklist, i) => {
      return new PathLayer({
        id: `line-layer-${i}`,
        data: [checklist],
        getPath: (check: Checklist) => {
          if (!check.track_points) {
            return [check.location_coords[1], check.location_coords[0]]
          }
          const path: [number, number][] = check.track_points.map((point) => [
            point[1],
            point[0],
          ])
          return path
        },
        getColor: colors[i].rgb(),
        getWidth: 15,
        pickable: true,
        onClick: (pickingInfo) => {
          if (selectedChecklist != null) return
          openModal()
          if (pickingInfo && pickingInfo.coordinate) {
            setSelectedChecklist(checklist)
          }
        },
      })
    })

  return layers
}
