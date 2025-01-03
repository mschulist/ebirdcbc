import { useState } from 'react'
import { getCurrentProject } from '../navigation/ProjectSelector'
import { postServerRequest } from '@/networking/server_requests'
import { useRouter } from 'next/navigation'

export function AddTripReport() {
  const [tripReportNumber, setTripReportNumber] = useState<string>('')
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()

  return (
    <div className='flex flex-col w-1/3 items-center gap-3'>
      <h1 className='text-2xl font-semibold'>Add Trip Report</h1>
      <p className='text-sm text-gray-500'>
        Adds every checklist from the trip report to the project. If a checklist
        from the trip report already exists in the project, it will be skipped.
      </p>

      <p className='text-sm text-red-500'>
        Warning: if the eBird username and password are incorrect, this is
        undefined behavior and the tracks may not appear on the checklists. We
        need to sign in under the owner of the checklist to get the tracks.
      </p>

      <input
        type='text'
        placeholder='Trip Report #'
        className='input w-full'
        value={tripReportNumber}
        onChange={(e) => setTripReportNumber(e.target.value)}
      />
      <button
        className='btn btn-primary'
        disabled={tripReportNumber === ''}
        onClick={() =>
          addTripReport(tripReportNumber).then((succ) => setSuccess(succ))
        }
      >
        Add Trip Report
      </button>
      {success !== null && (
        <p className='text-sm text-center text-secondary'>{success}</p>
      )}
      <button
        onClick={() => router.push('/manage-project/checklists')}
        className='btn btn-secondary'
      >
        View checklists in more detail
      </button>
    </div>
  )
}

async function addTripReport(tripReportNumber: string) {
  const projectId = getCurrentProject()?.id
  if (!projectId) {
    return 'No project selected'
  }

  if (isNaN(parseInt(tripReportNumber))) {
    return 'Invalid trip report number'
  }

  const response = await postServerRequest(
    `add_trip_report?project_id=${projectId}&trip_report_id=${tripReportNumber}`,
    {}
  )
  if (response.status !== 200) {
    return 'Failed to add trip report'
  }
  return 'Adding trip report...may take a few minutes...'
}
