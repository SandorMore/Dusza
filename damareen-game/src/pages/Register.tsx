// src/pages/Register.tsx - Javított verzió
import React, { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { apiService } from '../services/api'
import type { RegisterFormData, AuthResponse } from '../types/auth'

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    role: 'player'
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: id === 'role' ? value as 'player' | 'gameMaster' : value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      console.log('Sending registration request...')
      const response: AuthResponse = await apiService.register(formData)
      console.log('Full API response:', response)
      
      // MEGVÁLTOZOTT: tokens.accessToken használata
      if (response.tokens?.accessToken) {
        localStorage.setItem('token', response.tokens.accessToken)
        console.log('AccessToken saved:', response.tokens.accessToken)
      } else {
        console.log('No accessToken in response!')
      }
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
        console.log('User saved:', response.user)
      } else {
        console.log('No user in response!')
      }
      
      if (response.tokens?.accessToken && response.user) {
        setMessage('Sikeres regisztráció! Átirányítás...')
        setTimeout(() => {
          const redirectTo = response.user?.role === 'gameMaster' ? '/game-master' : '/player'
          console.log('Redirecting to:', redirectTo)
          window.location.href = redirectTo
        }, 1500)
      } else {
        setMessage('Registration completed but missing tokens or user')
      }
    } catch (error: unknown) {
      console.error('Registration error:', error)
      setMessage('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <div className='flex justify-center items-center p-11 shadow-lg w-1/2'>
        <form onSubmit={handleSubmit} className='flex flex-col w-full'>
          <h1 className='text-[3rem] mb-4'>Regisztráció</h1>

          {message && (
            <div className={`p-3 mb-4 rounded ${
              message.includes('Sikeres') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
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