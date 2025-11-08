// src/pages/PlayerDashboard.tsx - MEDIEVAL STYLE
import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '../types/auth'

const PlayerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const userStr = localStorage.getItem('user')
  const user: User | null = userStr ? JSON.parse(userStr) : null

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      {/* Medieval Header with Banner */}
      <header className="bg-gradient-to-r from-amber-800 to-amber-900 shadow-lg border-b-4 border-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-amber-100 font-serif tracking-wider">🏰 Royal Command Post</h1>
              <p className="text-amber-200 font-medium mt-2">Hail, {user?.username}! The kingdom awaits your valor!</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-700 hover:bg-red-800 text-amber-100 px-6 py-3 rounded-lg transition-colors border-2 border-red-600 font-bold shadow-lg hover:shadow-red-800/50"
            >
              ⚔️ Leave Castle
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Medieval Banner */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl shadow-2xl border-4 border-amber-500 p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-amber-100 font-serif tracking-wide">
            🛡️ Choose Your Quest, Brave Warrior! 🛡️
          </h2>
          <p className="text-amber-200 mt-2 text-lg">
            Forge your destiny in the halls of battle and glory!
          </p>
        </div>

        {/* Quest Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Battle Arena Card */}
          <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-2xl shadow-2xl p-8 hover:shadow-red-900/50 transition-all duration-300 border-4 border-red-600 hover:scale-105 transform">
            <div className="text-center">
              <div className="text-6xl mb-6 filter drop-shadow-lg">⚔️</div>
              <h2 className="text-2xl font-bold text-amber-100 font-serif mb-4 tracking-wide">Grand Arena</h2>
              <p className="text-amber-200 mb-6 leading-relaxed">
                Test your mettle against fearsome dungeon guardians! Forge your deck and claim victory in epic battles!
              </p>
              <button
                onClick={() => navigate('/player/fight')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-amber-100 px-8 py-4 rounded-xl transition-all duration-300 border-2 border-red-500 font-bold text-lg w-full shadow-lg hover:shadow-red-700/50"
              >
                🏹 Enter Arena
              </button>
            </div>
          </div>

          {/* Royal Collection Card */}
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl shadow-2xl p-8 hover:shadow-blue-900/50 transition-all duration-300 border-4 border-blue-600 hover:scale-105 transform">
            <div className="text-center">
              <div className="text-6xl mb-6 filter drop-shadow-lg">📜</div>
              <h2 className="text-2xl font-bold text-amber-100 font-serif mb-4 tracking-wide">Royal Archives</h2>
              <p className="text-amber-200 mb-6 leading-relaxed">
                Browse your collection of legendary cards. Study your warriors and plan your strategies!
              </p>
              <button
                onClick={() => navigate('/player/fight')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-amber-100 px-8 py-4 rounded-xl transition-all duration-300 border-2 border-blue-500 font-bold text-lg w-full shadow-lg hover:shadow-blue-700/50"
              >
                🏛️ View Archives
              </button>
            </div>
          </div>

          {/* War Room Card */}
          <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-2xl shadow-2xl p-8 hover:shadow-green-900/50 transition-all duration-300 border-4 border-green-600 hover:scale-105 transform">
            <div className="text-center">
              <div className="text-6xl mb-6 filter drop-shadow-lg">🛡️</div>
              <h2 className="text-2xl font-bold text-amber-100 font-serif mb-4 tracking-wide">War Room</h2>
              <p className="text-amber-200 mb-6 leading-relaxed">
                Forge your battle formations! Create and command your decks of mighty warriors and cunning mages!
              </p>
              <button
                onClick={() => navigate('/player/fight')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-amber-100 px-8 py-4 rounded-xl transition-all duration-300 border-2 border-green-500 font-bold text-lg w-full shadow-lg hover:shadow-green-700/50"
              >
                ⚒️ Forge Decks
              </button>
            </div>
          </div>
        </div>

        {/* Medieval Footer Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Panel */}
          <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-xl p-6 border-4 border-amber-600 shadow-lg">
            <h3 className="text-xl font-bold text-amber-100 font-serif mb-4 text-center">🏆 Your Legend</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-amber-200">
                <span>Battles Fought:</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between text-amber-200">
                <span>Victories:</span>
                <span className="font-bold text-green-300">8</span>
              </div>
              <div className="flex justify-between text-amber-200">
                <span>Cards Collected:</span>
                <span className="font-bold text-blue-300">24</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Medieval Footer */}
      <footer className="bg-gradient-to-r from-amber-900 to-amber-800 border-t-4 border-amber-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-amber-200">
            <p className="font-serif">©Damareen - All rights reserved by royal decree</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PlayerDashboard