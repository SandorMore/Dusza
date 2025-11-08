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
    <div className='min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex justify-center items-center py-12 px-4'>
      <div className='bg-gradient-to-br from-amber-800 to-amber-900 rounded-2xl shadow-2xl p-8 md:p-12 w-full max-w-md border-4 border-amber-600'>
        <form onSubmit={handleSubmit} className='flex flex-col w-full'>
          <h1 className='text-4xl font-bold text-amber-100 font-serif mb-2 text-center tracking-wider'>⚜️ Join the Realm</h1>
          <p className='text-amber-200 text-center mb-8 font-serif'>Forge your legend today!</p>

          {message && (
            <div className={`p-4 mb-6 rounded-xl border-2 font-bold text-center ${
              message.includes('Sikeres') 
                ? 'bg-green-800 text-amber-100 border-green-600' 
                : 'bg-red-800 text-amber-100 border-red-600'
            }`}>
              {message}
            </div>
          )}

          <div className='flex flex-col w-full mb-6'>
            <label className='text-lg font-bold text-amber-100 font-serif mb-2' htmlFor="username">👤 Felhasználónév</label>
            <input 
              id='username' 
              type="text" 
              placeholder='Enter your username' 
              className='border-2 border-amber-600 bg-amber-50 p-3 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500' 
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-col w-full mb-6'>
            <label className='text-lg font-bold text-amber-100 font-serif mb-2' htmlFor="email">📧 Email</label>
            <input 
              id='email' 
              type="email" 
              placeholder='Enter your email' 
              className='border-2 border-amber-600 bg-amber-50 p-3 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500' 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-col w-full mb-6'>
            <label className='text-lg font-bold text-amber-100 font-serif mb-2' htmlFor="password">🔐 Jelszó</label>
            <input 
              id='password' 
              type="password" 
              placeholder='Enter your password (min 6 chars)' 
              className='border-2 border-amber-600 bg-amber-50 p-3 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500' 
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className='flex flex-col w-full mb-8'>
            <label className='text-lg font-bold text-amber-100 font-serif mb-2' htmlFor="role">👑 Szerepkör</label>
            <select 
              id="role"
              className='border-2 border-amber-600 bg-amber-50 p-3 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 font-bold'
              value={formData.role}
              onChange={handleChange}
            >
              <option value="player">⚔️ Játékos</option>
              <option value="gameMaster">👑 Game Master</option>
            </select>
          </div>

          <button 
            className='bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-100 p-4 rounded-xl disabled:bg-gray-600 transition-all duration-200 font-bold text-lg border-2 border-amber-500 shadow-lg hover:shadow-amber-700/50' 
            type="submit"
            disabled={loading}
          >
            {loading ? '🔄 Forging...' : '⚜️ Join the Realm'}
          </button>

          <p className='mt-6 text-center text-amber-200 font-serif'>
            Already have an account?{' '}
            <a href="/login" className='text-amber-100 hover:text-yellow-300 underline font-bold'>
              Enter the castle
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register