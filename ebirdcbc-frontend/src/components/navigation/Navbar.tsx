'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '../auth/Auth'
import { getCurrentProject, ProjectSelector } from './ProjectSelector'
import { UserIcon } from './UserIcon'
import Image from 'next/image'
import { postServerRequest } from '@/networking/server_requests'

export function Navbar() {
  const user = useAuth()

  function handleDownloadSummary() {
    downloadSummary()
  }

  const router = useRouter()
  return (
    <div>
      {user ? (
        <div className='navbar px-8 flex items-center justify-between'>
          <div className='flex'>
            <Image
              src='/logo.png'
              alt='logo'
              width={75}
              height={75}
              className='rounded-lg my-2 cursor-pointer transition-opacity duration-200 hover:opacity-80 hover:shadow-lg'
              onClick={() => router.push('/')}
            />
          </div>
          <div className='flex justify-end items-center gap-4'>
            <button
              onClick={handleDownloadSummary}
              className='btn hover:bg-purple-500 btn-ghost'
            >
              Download Summary
            </button>
            <button
              onClick={() => router.push('/manage-project')}
              className='btn hover:bg-purple-500 btn-ghost'
            >
              Manage Project
            </button>
            <ProjectSelector />
            <UserIcon />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}

async function downloadSummary() {
  const projectId = getCurrentProject()?.id
  if (!projectId) {
    return
  }
  const response = await postServerRequest(
    `get_summary_csv?project_id=${projectId}`,
    {}
  )
  if (response.status === 200) {
    const blob = await response.blob()
    const contentDisposition = response.headers.get('content-disposition')
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]
      : 'summary.csv'
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()

    window.URL.revokeObjectURL(url)

    return true
  }
}
