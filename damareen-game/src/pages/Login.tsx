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
    <div className="min-h-screen bg-[url('/assets/freepik__the-style-is-rich-with-textured-brushstrokes-deep-__21314.png')] bg-cover bg-center flex justify-center items-center py-12 px-4">
      <div className='backdrop-blur-sm bg-white/30 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md'>
        <form onSubmit={handleSubmit} className='flex flex-col w-full'>
          <h1 className='text-4xl font-bold text-amber-100 font-serif mb-2 text-center tracking-wider'>🏰 Castle Gates</h1>
          <p className='text-amber-200 text-center mb-8 font-serif'>Enter the realm, brave soul!</p>

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
            <label className='text-lg font-bold text-amber-100 font-serif mb-2' htmlFor="email">📧 Email</label>
            <input 
              id='email' 
              type="email" 
              placeholder='Enter your email' 
              className=' bg-amber-50 p-3 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500' 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-col w-full mb-8'>
            <label className='text-lg font-bold text-amber-100 font-serif mb-2' htmlFor="password">🔐 Jelszó</label>
            <input 
              id='password' 
              type="password" 
              placeholder='Enter your password' 
              className=' bg-amber-50 p-3 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500' 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            className='bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-100 p-4 rounded-xl disabled:bg-gray-600 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-amber-700/50' 
            type="submit"
            disabled={loading}
          >
            {loading ? '🔄 Entering...' : '⚔️ Enter Castle'}
          </button>

          <p className='mt-6 text-center text-amber-200 font-serif'>
            No account yet?{' '}
            <a href="/register" className='text-amber-100 hover:text-yellow-300 underline font-bold'>
              Join the realm
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login