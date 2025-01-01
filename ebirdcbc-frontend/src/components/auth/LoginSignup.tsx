'use client'

import { useState } from 'react'
import { Login } from '@/components/auth/Login'
import { Signup } from '@/components/auth/Signup'

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true)

  const toggleForm = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className='h-screen flex flex-col items-center justify-center'>
      {isLogin ? <Login /> : <Signup />}
      <button onClick={toggleForm} className='btn btn-ghost mt-4'>
        {isLogin ? 'Need to sign up?' : 'Already have an account?'}
      </button>
    </div>
  )
}
