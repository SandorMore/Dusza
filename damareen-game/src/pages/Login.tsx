// src/pages/Login.tsx
import React, { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { LoginFormData } from '../types/auth'

const Login: React.FC = () => {
  const { login, loading, error } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const success = await login(formData)
    
    if (success) {
      // Get the updated user from localStorage
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      
      // Redirect based on role
      if (user?.role === 'gameMaster') {
        window.location.href = '/game-master'
      } else {
        window.location.href = '/player' // or whatever your player dashboard route is
      }
    }
  }

  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <div className='flex justify-center items-center p-11 shadow-lg w-1/2'>
        <form onSubmit={handleSubmit} className='flex flex-col w-full'>
          <h1 className='text-[3rem] mb-4'>Bejelentkezés</h1>

          {error && (
            <div className='p-3 mb-4 rounded bg-red-100 text-red-800'>
              {error}
            </div>
          )}

          <div className='flex flex-col w-full mb-4'>
            <label className='text-[1.2rem] font-medium' htmlFor="email">Email</label>
            <input 
              id='email' 
              type="email" 
              placeholder='Email' 
              className='border p-2 rounded' 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-col w-full mb-6'>
            <label className='text-[1.2rem] font-medium' htmlFor="password">Jelszó</label>
            <input 
              id='password' 
              type="password" 
              placeholder='Password' 
              className='border p-2 rounded' 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            className='bg-black text-white p-3 rounded hover:bg-violet-600 disabled:bg-gray-400 transition-colors duration-200 font-medium' 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>

          <p className='mt-4 text-center text-gray-600'>
            Nincs fiókod?{' '}
            <a href="/register" className='text-violet-600 hover:underline font-medium'>
              Regisztrálj itt
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login