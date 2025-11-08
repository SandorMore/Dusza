// src/pages/LandingPage.tsx
import React from 'react'
import { useAuth } from '../hooks/useAuth'

const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen bg-[url('/assets/freepik__the-style-is-rich-with-textured-brushstrokes-deep-__21312.png')] bg-cover bg-center flex flex-col items-center justify-center">
      <div className="text-center max-w-4xl p-5 md:p-10 backdrop-blur-sm bg-white/30 rounded-3xl shadow-2xl">
        <h1 className="text-5xl md:text-6xl font-bold text-amber-800 font-serif mb-6 tracking-wider">
           Welcome to Damareen
        </h1>
        <p className="text-2xl md:text-3xl text-amber-800 font-serif mb-12">
          A realm of fantasy card battles and legendary warriors
        </p>
        
        {isAuthenticated() ? (
          <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
            <p className="text-2xl text-amber-100 font-serif mb-6">Welcome, {user?.username}!</p>
            <div className="space-x-4">
              <a 
                href={user?.role === 'gameMaster' ? '/game-master' : '/player'}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-amber-500 font-bold text-lg shadow-lg hover:shadow-amber-700/50"
              >
                🏰 Enter Your Keep
              </a>
              <a 
                href="/login" 
                className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-red-600 font-bold text-lg shadow-lg hover:shadow-red-800/50"
                onClick={(e) => {
                  e.preventDefault()
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  window.location.href = '/'
                }}
              >
                ⚔️ Leave Realm
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-2xl shadow-2xl p-8">
            <p className="text-xl text-amber-200 font-serif mb-8">Begin your legendary journey!</p>
            <div className="space-x-4">
              <a 
                href="/login" 
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-amber-500 font-bold text-lg shadow-lg hover:shadow-amber-700/50"
              >
                🏰 Enter Castle
              </a>
              <a 
                href="/register" 
                className="bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-blue-600 font-bold text-lg shadow-lg hover:shadow-blue-800/50"
              >
                ⚜️ Join the Realm
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPage