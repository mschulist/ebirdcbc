'use client'

import { useState } from 'react'
import { getCurrentProject } from '../navigation/ProjectSelector'
import { postServerRequest } from '@/networking/server_requests'

export function AddUser() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    addUser(username).then((res) => {
      console.log(res)
      if (res) {
        setError(res)
      } else {
        setUsername('')
        setError('')
      }
    })
  }

  return (
    <div className='flex flex-col gap-4 items-center'>
      <div className='text-lg'>Add user to project</div>
      <div>
        <label className='block text-sm font-medium mb-1'>Username</label>
        <input
          type='text'
          placeholder='username'
          className='input w-full'
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>
      <button
        className='btn btn-primary'
        onClick={handleSubmit}
        disabled={!username}
      >
        Add User
      </button>
      {error && <div className='text-red-500'>{error}</div>}
    </div>
  )
}

async function addUser(username: string) {
  const projectId = getCurrentProject()?.id
  if (!projectId) {
    return
  }
  const response = await postServerRequest(
    `add_user_to_project?project_id=${projectId}&username_to_add=${username}`,
    {}
  )
  const res = await response.json()
  if (response.status !== 200) {
    return res.detail
  }
  return null
}
