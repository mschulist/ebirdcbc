'use client'

import { useState } from 'react'
import { Checklist, Species } from '@/models/ebird'
type GroupSelectorProps = {
  checklist: Checklist
  maxGroups: number
  selectedSpecies: string | undefined
  handleUpdateGroup: (species: Species, newGroup: number) => void
}

export function GroupSelector(props: GroupSelectorProps) {
  const species = props.checklist.species.find(
    (species) => species.species_name === props.selectedSpecies
  )

  const [selectedGroup, setSelectedGroup] = useState<number>(
    species?.group_number || 1
  )

  const groups = Array.from({ length: props.maxGroups }, (_, i) => i + 1)

  if (selectedGroup > props.maxGroups) {
    groups.push(selectedGroup)
  }

  const handleGroupClick = (group: number) => {
    if (species) {
      props.handleUpdateGroup(species, group)
      setSelectedGroup(group)
    }
  }

  return (
    <div className='flex flex-row justify-evenly w-full p-2 flex-wrap'>
      {groups.map((group) => (
        <button
          key={group}
          onClick={() => handleGroupClick(group)}
          className={`btn btn-outline p-2 m-1 ${selectedGroup === group ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Group {group}
        </button>
      ))}
    </div>
  )
}
