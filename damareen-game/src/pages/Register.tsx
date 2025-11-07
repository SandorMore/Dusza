import React, { useState} from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { RegisterFormData } from '../types/auth'

const Register: React.FC = () => {
  const { register, loading, error } = useAuth()
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    role: 'player'
  })
  const [successMessage, setSuccessMessage] = useState<string>('')

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: id === 'role' ? value as 'player' | 'gameMaster' : value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSuccessMessage('')

    const success = await register(formData)
    
    if (success) {
      setSuccessMessage('Sikeres regisztráció! Átirányítás...')
      // Redirect will happen automatically through the hook
    }
  }

  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <div className='flex justify-center items-center p-11 shadow-lg w-1/2'>
        <form onSubmit={handleSubmit} className='flex flex-col w-full'>
          <h1 className='text-[3rem] mb-4'>Regisztráció</h1>

          {successMessage && (
            <div className='p-3 mb-4 rounded bg-green-100 text-green-800'>
              {successMessage}
            </div>
          )}

          {error && (
            <div className='p-3 mb-4 rounded bg-red-100 text-red-800'>
              {error}
            </div>
          )}

          <div className='flex flex-col w-full mb-4'>
            <label className='text-[1.2rem] font-medium' htmlFor="username">Felhasználónév</label>
            <input 
              id='username' 
              type="text" 
              placeholder='Username' 
              className='border p-2 rounded' 
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className='flex flex-col w-full mb-4'>
            <label className='text-[1.2rem] font-medium' htmlFor="password">Jelszó</label>
            <input 
              id='password' 
              type="password" 
              placeholder='Password' 
              className='border p-2 rounded' 
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className='flex flex-col w-full mb-6'>
            <label className='text-[1.2rem] font-medium' htmlFor="role">Szerepkör</label>
            <select 
              id="role"
              className='border p-2 rounded'
              value={formData.role}
              onChange={handleChange}
            >
              <option value="player">Játékos</option>
              <option value="gameMaster">Game Master</option>
            </select>
          </div>

          <button 
            className='bg-black text-white p-3 rounded hover:bg-violet-600 disabled:bg-gray-400 transition-colors duration-200 font-medium' 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Regisztrálás...' : 'Regisztráció'}
          </button>

          <p className='mt-4 text-center text-gray-600'>
            Van már fiókod?{' '}
            <a href="/login" className='text-violet-600 hover:underline font-medium'>
              Jelentkezz be itt
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register