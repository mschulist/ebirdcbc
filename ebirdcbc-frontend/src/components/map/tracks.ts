'use client'

import { IconLayer, PathLayer, TextLayer } from '@deck.gl/layers'
import { Checklist } from '@/models/ebird'
import distinctColors from 'distinct-colors'
import chroma from 'chroma-js'

export function getTrackLayers(
  checklists: Checklist[],
  openModal: () => void,
  setSelectedChecklist: (checklist: Checklist) => void,
  selectedChecklist: Checklist | null
) {
  const colors = distinctColors({ count: checklists.length })

  const layers = checklists.map((checklist, i) => {
    if (!checklist.track_points || checklist.track_points.length < 4) {
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
        getSize: 60,
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
      getWidth: 12,
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
  const colorMap = new Map<number, chroma.Color>()
  colors.forEach((color, index) => {
    colorMap.set(index, color.alpha(1))
  })
  colorMap.set(-1, chroma([255, 0, 0, 0.5]))

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

      if (speciesGroup == undefined || speciesCount == undefined) {
        throw new Error('Species group not found')
      }

      switch (true) {
        case !checklist.track_points || checklist.track_points.length < 4:
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
            getColor: () => {
              const color = colorMap.get(speciesGroup)?.rgba() || [0, 0, 0, 1]
              return [color[0], color[1], color[2], color[3] * 255]
            },
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
            getColor: () => {
              const color = colorMap.get(speciesGroup)?.rgba() || [0, 0, 0, 1]
              return [color[0], color[1], color[2], color[3] * 255]
            },
            getWidth: 12,
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
            pickable: true,
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
            getColor: () => {
              const color = colorMap.get(speciesGroup)?.rgba() || [0, 0, 0, 1]
              return [color[0], color[1], color[2], color[3] * 255]
            },
            outlineWidth: 2,
            fontSettings: { sdf: true },
            onClick: (pickingInfo) => {
              if (selectedChecklist != null) return
              openModal()
              if (pickingInfo && pickingInfo.coordinate) {
                setSelectedChecklist(checklist)
              }
            },
          })

          return [pathLayer, textLayer]
      }
    })
    .flat()

  return layers
}
