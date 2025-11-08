// src/pages/PlayerDashboard.tsx
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Player Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.username}!</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fight Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">⚔️</div>
              <h2 className="text-xl font-semibold mb-2">Enter the Arena</h2>
              <p className="text-gray-600 mb-4">Build decks and battle against dungeons to earn rewards!</p>
              <button
                onClick={() => navigate('/player/fight')}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors w-full"
              >
                Start Fighting
              </button>
            </div>
          </div>

          {/* Collection Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h2 className="text-xl font-semibold mb-2">My Collection</h2>
              <p className="text-gray-600 mb-4">View and manage your card collection</p>
              <button
                onClick={() => navigate('/player/fight')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors w-full"
              >
                View Collection
              </button>
            </div>
          </div>

          {/* Decks Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🃏</div>
              <h2 className="text-xl font-semibold mb-2">My Decks</h2>
              <p className="text-gray-600 mb-4">Create and manage your battle decks</p>
              <button
                onClick={() => navigate('/player/fight')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors w-full"
              >
                Manage Decks
              </button>
            </div>
          </div>
        </div>

        
      </main>
    </div>
  )
}

export default PlayerDashboard