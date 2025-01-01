'use client'

import { CreateUserRequest } from '@/models/auth'
import { postServerRequest } from '@/networking/server_requests'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Signup() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()

  async function handleSubmit() {
    setError('')

    try {
      const res = await addUser({ name, username, password })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('token', data.access_token)
        router.push('/')
        window.location.reload()
      } else {
        setError('Signup failed')
      }
    } catch (err) {
      setError('An error occurred during signup')
      console.error(err)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center gap-3'>
      <input
        type='name'
        name='name'
        value={name}
        placeholder='name'
        className='input input-bordered w-full max-w-xs text-white'
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type='username'
        name='username'
        value={username}
        placeholder='username'
        className='input input-bordered w-full max-w-xs text-white'
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type='password'
        name='password'
        value={password}
        placeholder='Password'
        className='input input-bordered w-full max-w-xs text-white'
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type='submit'
        className='btn btn-primary'
        onClick={handleSubmit}
        disabled={username === '' || password === '' || name === ''}
      >
        Signup
      </button>
      {error && <p className='text-red-500'>{error}</p>}
    </div>
  )
}

function addUser(user: CreateUserRequest): Promise<Response> {
  return postServerRequest('add_user', user)
}
