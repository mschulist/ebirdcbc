'use client'

import { CreateProjectRequest } from '@/models/auth'
import { postServerRequest } from '@/networking/server_requests'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function CreateProject() {
  const [name, setName] = useState('')
  const [ebirdUsername, setEbirdUsername] = useState('')
  const [ebirdPassword, setEbirdPassword] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()

  async function handleSubmit() {
    setError('')

    try {
      const res = await addProject({
        name,
        ebird_username: ebirdUsername,
        ebird_password: ebirdPassword,
      })

      if (res.ok) {
        router.push('/')
        window.location.reload()
      } else {
        setError('An error occurred during project creation')
      }
    } catch (err) {
      setError('An error occurred during project creation')
      console.error(err)
    }
  }

  return (
    <div className='flex flex-col items-center h-full justify-center gap-3'>
      <input
        type='text'
        name='name'
        value={name}
        placeholder='Project Name'
        className='input input-bordered w-full max-w-xs text-white'
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type='text'
        name='ebirdUsername'
        value={ebirdUsername}
        placeholder='eBird Username'
        className='input input-bordered w-full max-w-xs text-white'
        onChange={(e) => setEbirdUsername(e.target.value)}
        required
      />
      <input
        type='password'
        name='ebirdPassword'
        value={ebirdPassword}
        placeholder='eBird Password'
        className='input input-bordered w-full max-w-xs text-white'
        onChange={(e) => setEbirdPassword(e.target.value)}
        required
      />
      <button
        type='submit'
        className='btn btn-primary'
        onClick={handleSubmit}
        disabled={name === '' || ebirdUsername === '' || ebirdPassword === ''}
      >
        Create Project
      </button>
      {error && <p className='text-red-500'>{error}</p>}
    </div>
  )
}

function addProject(project: CreateProjectRequest): Promise<Response> {
  return postServerRequest('add_project', project)
}
