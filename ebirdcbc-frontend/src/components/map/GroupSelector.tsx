'use client'

import { useState } from 'react'
import { Checklist, Species } from '@/models/ebird'
import { getCurrentProject } from '../navigation/ProjectSelector'
import { postServerRequest } from '@/networking/server_requests'

type GroupSelectorProps = {
  checklist: Checklist
  maxGroups: number
  selectedSpecies: string | undefined
  fetchChecklists: () => void
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
    setSelectedGroup(group)
    if (species) {
      updateGroupOfSpecies(species, group)
    }
    props.fetchChecklists()
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
  }
}
