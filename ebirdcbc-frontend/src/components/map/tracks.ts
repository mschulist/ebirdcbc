'use client'

import { IconLayer, PathLayer, TextLayer } from '@deck.gl/layers'
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
    if (!checklist.track_points) {
      return new IconLayer({
        id: `icon-layer-${i}`,
        data: [checklist],
        getPosition: (check: Checklist) => [
          check.location_coords[1],
          check.location_coords[0],
        ],
        iconAtlas:
          'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
        iconMapping:
          'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
        getColor: colors[i].rgb(),
        getIcon: () => 'marker',
        pickable: true,
        getSize: 40,
        onClick: (pickingInfo) => {
          if (selectedChecklist != null) return
          openModal()
          if (pickingInfo && pickingInfo.coordinate) {
            setSelectedChecklist(checklist)
          }
        },
      })
    }

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
      getWidth: 20,
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
      checklist.species.some((s) => s.species_name === selectedSpecies)
    )
    .map((checklist, i) => {
      const speciesGroup = checklist.species.find(
        (species) => species.species_name === selectedSpecies
      )?.group_number

      const speciesCount = checklist.species.find(
        (species) => species.species_name === selectedSpecies
      )?.count

      if (!speciesGroup) throw new Error('Species group not found')

      switch (true) {
        case !checklist.track_points:
          return new TextLayer({
            id: `text-layer-${i}`,
            data: [checklist],
            getPosition: (check: Checklist) => [
              check.location_coords[1],
              check.location_coords[0],
            ],
            outlineWidth: 2,
            fontSettings: { sdf: true },
            getText: () => speciesCount?.toString() || '',
            getSize: 32,
            getColor: colors[speciesGroup].rgb(),
            pickable: true,
            onClick: (pickingInfo) => {
              if (selectedChecklist != null) return
              openModal()
              if (pickingInfo && pickingInfo.coordinate) {
                setSelectedChecklist(checklist)
              }
            },
          })

        default:
          const pathLayer = new PathLayer({
            id: `line-layer-${i}`,
            data: [checklist],
            getPath: (check: Checklist) => {
              if (!check.track_points) {
                return [check.location_coords[1], check.location_coords[0]]
              }
              const path: [number, number][] = check.track_points.map(
                (point) => [point[1], point[0]]
              )
              return path
            },
            getColor: colors[speciesGroup].rgb(),
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

          const textLayer = new TextLayer({
            id: `text-layer-${i}`,
            data: [checklist],
            getPosition: (check: Checklist) => {
              if (!check.track_points) {
                return [
                  check.location_coords[1],
                  check.location_coords[0],
                  0.001,
                ]
              }
              const midIndex = Math.floor(check.track_points.length / 2)
              return [
                check.track_points[midIndex][1],
                check.track_points[midIndex][0],
                0.001,
              ]
            },
            getText: () => speciesCount?.toString() || '',
            getSize: 32,
            getColor: colors[speciesGroup].rgb(),
            outlineWidth: 2,
            fontSettings: { sdf: true },
          })

          return [pathLayer, textLayer]
      }
    })
    .flat()

  return layers
}
