// src/pages/Login.tsx - Javított verzió
import React, { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { apiService } from '../services/api'
import type { LoginFormData, AuthResponse } from '../types/auth'

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      console.log('🔍 Login küldés...', formData)
      const response: AuthResponse = await apiService.login(formData)
      console.log('✅ Backend válasz:', response)
      
      // MEGVÁLTOZOTT: tokens.accessToken használata
      if (response.tokens?.accessToken) {
        localStorage.setItem('token', response.tokens.accessToken)
        console.log('💾 AccessToken elmentve:', response.tokens.accessToken)
        
        // Refresh token is elmenthető
        if (response.tokens.refreshToken) {
          localStorage.setItem('refreshToken', response.tokens.refreshToken)
        }
      } else {
        console.log('❌ Nincs accessToken a válaszban!')
      }
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
        console.log('💾 User elmentve:', response.user)
      } else {
        console.log('❌ Nincs user a válaszban!')
      }
      
      // Ellenőrizzük, tényleg elmentődött-e
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      console.log('🔍 Ellenőrzés - Mentett token:', savedToken)
      console.log('🔍 Ellenőrzés - Mentett user:', savedUser)
      
      if (response.tokens?.accessToken && response.user) {
        setMessage('Sikeres bejelentkezés! Átirányítás...')
        setTimeout(() => {
          console.log('🚀 Átirányítás a /game-master-re...')
          window.location.href = '/game-master'
        }, 1000)
      } else {
        setMessage('Bejelentkezés sikeres, de hiányzó adatok')
      }
    } catch (error: unknown) {
      console.error('❌ Login hiba:', error)
      setMessage('Bejelentkezés sikertelen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <div className='flex justify-center items-center p-11 shadow-lg w-1/2'>
        <form onSubmit={handleSubmit} className='flex flex-col w-full'>
          <h1 className='text-[3rem] mb-4'>Bejelentkezés</h1>

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