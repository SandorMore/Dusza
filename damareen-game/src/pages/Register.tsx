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
      const response: AuthResponse = await apiService.register(formData)
      
      if (response.tokens?.accessToken) {
        localStorage.setItem('token', response.tokens.accessToken)
      }
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      
      if (response.tokens?.accessToken && response.user) {
        setMessage('Sikeres regisztráció! Átirányítás...')
        setTimeout(() => {
          const redirectTo = response.user?.role === 'gameMaster' ? '/game-master' : '/player'
          window.location.href = redirectTo
        }, 1500)
      } else {
        setMessage('Regisztráció befejezve, de hiányoznak a tokenek vagy a felhasználó')
      }
    } catch (error: unknown) {
      setMessage('Regisztráció sikertelen')
    } finally {
      setLoading(false)
    }
    
  }

  return (
    <div className="min-h-screen bg-[url('/public/assets/freepik__the-style-is-rich-with-textured-brushstrokes-deep-__21311.png')] bg-cover bg-center flex justify-center items-center py-12 px-4">
      <div className='backdrop-blur-sm bg-white/30 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md'>
        <form onSubmit={handleSubmit} className='flex flex-col w-full'>
          <h1 className='text-4xl font-bold text-amber-100 font-serif mb-2 text-center tracking-wider'>⚜️ <br /> Csatlakozz a Birodalomhoz</h1>
          <p className='text-amber-200 text-center mb-8 font-serif'>Kovácsold meg a legendádat ma!</p>

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
              placeholder='Add meg a felhasználóneved' 
              className=' bg-amber-50 p-3 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500' 
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
              placeholder='Add meg az email címed' 
              className=' bg-amber-50 p-3 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500' 
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
              placeholder='Add meg a jelszavad (min 6 karakter)' 
              className=' bg-amber-50 p-3 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500' 
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
              className=' bg-amber-50 p-3 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-500 font-bold'
              value={formData.role}
              onChange={handleChange}
            >
              <option value="player">⚔️ Játékos</option>
              <option value="gameMaster">👑 Game Master</option>
            </select>
          </div>

          <button 
            className='bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-100 p-4 rounded-xl disabled:bg-gray-600 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-amber-700/50' 
            type="submit"
            disabled={loading}
          >
            {loading ? '🔄 Kovácsolás...' : '⚜️ Csatlakozás a Birodalomhoz'}
          </button>

          <p className='mt-6 text-center text-amber-200 font-serif'>
            Már van fiókod?{' '}
            <a href="/login" className='text-amber-100 hover:text-yellow-300 underline font-bold'>
              Belépés a várba
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register