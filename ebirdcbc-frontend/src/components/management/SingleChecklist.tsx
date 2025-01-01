import { Checklist } from '@/models/ebird'
import { postServerRequest } from '@/networking/server_requests'
import Link from 'next/link'
import { useState } from 'react'

type SingleChecklistProps = {
  checklist: Checklist
}

export function SingleChecklist(props: SingleChecklistProps) {
  const [confirmRefresh, setConfirmRefresh] = useState(false)

  function handleRefreshChecklist() {
    if (!confirmRefresh) {
      setConfirmRefresh(true)
    } else {
      reGetChecklist(props.checklist)
      setConfirmRefresh(false)
    }
  }

  function handleCancelRefresh() {
    setConfirmRefresh(false)
  }

  return (
    <div className='flex gap-2 shadow-lg p-4 rounded-lg bg-gray-900 items-center'>
      <Link
        href={`https://ebird.org/checklist/${props.checklist.checklist_id}`}
        target='_blank'
        className='hover:text-blue-500 transition-colors duration-200 whitespace-nowrap'
      >
        Checklist ID: {props.checklist.checklist_id}
      </Link>
      <div className='divider divider-horizontal m-0' />
      <span>{props.checklist.location_name}</span>
      <div className='divider divider-horizontal m-0' />
      {props.checklist.datetime && (
        <div>{new Date(props.checklist.datetime).toLocaleString()}</div>
      )}
      <div className='divider divider-horizontal m-0' />
      {!confirmRefresh && (
        <button
          onClick={() => setConfirmRefresh(true)}
          className='btn hover:bg-purple-500 btn-outline'
        >
          Refresh Checklist
        </button>
      )}
      {confirmRefresh && (
        <>
          <div className='tooltip' data-tip='Coming soon!'>
            <button
              onClick={handleRefreshChecklist}
              className='btn btn-outline hover:bg-green-500'
              disabled
            >
              {"Yes, I'm sure"}
            </button>
          </div>
          <button
            onClick={handleCancelRefresh}
            className='btn hover:bg-purple-500 btn-outline bg-red-500'
          >
            Cancel
          </button>
        </>
      )}
    </div>
  )
}

async function reGetChecklist(checklist: Checklist) {
  const projectId = checklist.project_id
  const checklistId = checklist.checklist_id
  const response = await postServerRequest(
    `upsert_checklist?project_id=${projectId}&checklist_id=${checklistId}`,
    {}
  )
  if (response.status !== 200) {
    return false
  }
  return true
}
