'use client'

import { Checklist } from '@/models/ebird'
import { useState, useEffect } from 'react'
import { fetchChecklistsAndSpecies } from '../map/Mapbox'
import { SingleChecklist } from './SingleChecklist'

export function Checklists() {
  const [checklists, setChecklists] = useState<Checklist[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchChecklistsAndSpecies().then((checklistsAndSpecies) => {
      const checklists = checklistsAndSpecies.checklists
      setChecklists(checklists)
      setLoading(false)
    })
  }, [])

  return (
    <>
      {loading ? (
        <div className='flex h-full justify-center items-center'>
          <span className='loading loading-dots loading-lg'></span>
        </div>
      ) : (
        <div className='h-5/6 overflow-auto flex'>
          <div className='flex flex-col gap-2 mx-32 p-4 h-full'>
            {checklists?.map((checklist) => (
              <SingleChecklist
                key={checklist.checklist_id}
                checklist={checklist}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
