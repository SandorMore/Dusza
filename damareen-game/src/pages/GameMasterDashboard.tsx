// src/pages/GameMasterDashboard.tsx
import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import WorldCardCreator from '../components/WorldCardCreator'
import LeaderCardCreator from '../components/LeaderCardCreator'
import DungeonCreator from './../components/DungeonCreator'
import GameEnvironmentCreator from '../components/GameEnvironmentCreator'
import type { WorldCard, Dungeon, GameEnvironment } from '../types/game'
import type { User } from '../types/auth'

const GameMasterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cards' | 'dungeons' | 'environments'>('cards')
  const [worldCards, setWorldCards] = useState<WorldCard[]>([])
  const [dungeons, setDungeons] = useState<Dungeon[]>([])
  const [environments, setEnvironments] = useState<GameEnvironment[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Check if user is authenticated and is a Game Master
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token) {
      console.log('No token found, redirecting to login...')
      window.location.href = '/login'
      return
    }

    if (userStr) {
      try {
        const userData: User = JSON.parse(userStr)
        setUser(userData)
        
        if (userData.role !== 'gameMaster') {
          window.location.href = '/player'
          return
        }
        
        // Load data after user is confirmed to be Game Master
        loadData()
      } catch (error) {
        console.error('Error parsing user data:', error)
        window.location.href = '/login'
        return
      }
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('🔄 Loading all game data...')
      
      const [cardsRes, dungeonsRes, environmentsRes] = await Promise.all([
        apiService.getWorldCards(),
        apiService.getDungeons(),
        apiService.getGameEnvironments()
      ])

      
      setWorldCards(cardsRes.cards || [])
      setDungeons(dungeonsRes.dungeons || [])
      setEnvironments(environmentsRes.environments || [])      
    } catch (error) {
      setError('Failed to load game data. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCardCreated = () => {
    loadData()
  }

  const handleDungeonCreated = () => {
    loadData()
  }

  const handleEnvironmentCreated = () => {
    loadData()
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-serif text-lg">...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      {/* Medieval Header */}
      <header className="bg-gradient-to-r from-amber-800 to-amber-900 shadow-2xl border-b-4 border-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-amber-100 font-serif tracking-wider">Játékmesteri felület</h1>
              <p className="text-amber-200 font-medium mt-2">Helló, {user.username}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadData}
                className="bg-blue-700 hover:bg-blue-800 text-amber-100 px-6 py-3 rounded-xl transition-all border-2 border-blue-600 font-bold shadow-lg"
                disabled={loading}
              >
                {loading ? 'Újratöltés...' : 'Archívum újratöltése'}
              </button>
              <button
                onClick={logout}
                className="bg-red-700 hover:bg-red-800 text-amber-100 px-6 py-3 rounded-xl transition-all border-2 border-red-600 font-bold shadow-lg"
              >
                Felület elhagyása
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-800 text-amber-100 border-4 border-red-600 px-6 py-4 rounded-xl font-bold text-center">
            {error}
          </div>
        </div>
      )}

      {/* Medieval Navigation Tabs */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-800 border-b-4 border-amber-600">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8">
            {[
              { id: 'cards' as const, label: `Kártyák: (${worldCards.length})`, icon: '🃏' },
              { id: 'dungeons' as const, label: `Kazamaták: (${dungeons.length})`, icon: '🏰' },
              { id: 'environments' as const, label: `Környezetek: (${environments.length})`, icon: '🌍' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-5 px-3 border-b-4 font-bold text-lg font-serif transition-all ${
                  activeTab === tab.id
                    ? 'border-amber-300 text-amber-100 bg-amber-900/50'
                    : 'border-transparent text-amber-200 hover:text-amber-100 hover:border-amber-400'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
            <span className="ml-4 text-amber-800 font-serif text-lg">Töltés...</span>
          </div>
        ) : (
          <>
            {/* Cards Tab */}
            {activeTab === 'cards' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <WorldCardCreator onCardCreated={handleCardCreated} />
                  <LeaderCardCreator 
                    worldCards={worldCards} 
                    onCardCreated={handleCardCreated} 
                  />
                </div>
                
                {/* Cards List */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-amber-100 font-serif">Minden kártya ({worldCards.length})</h2>
                    <span className="text-amber-300 font-bold">
                      {worldCards.filter(card => card.isLeader).length} Vezérek, 
                      {' '}{worldCards.filter(card => !card.isLeader).length} Általános
                    </span>
                  </div>
                  
                  {worldCards.length === 0 ? (
                    <div className="text-center py-8 text-amber-300 bg-gray-700/30 rounded-xl border-2 border-amber-500">
                      <p className="text-lg font-serif">Nincsenek még kártyák! Csinálj!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {worldCards.map((card) => (
                        <div key={card._id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-5 border-4 border-amber-500 shadow-lg hover:shadow-amber-500/50 transition-all hover:scale-105">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-amber-100 font-serif">{card.name}</h3>
                            {card.isLeader && (
                              <span className="inline-block bg-gradient-to-r from-yellow-600 to-amber-700 text-amber-100 text-xs px-3 py-1 rounded-lg font-bold">
                                Vezér
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-amber-200 space-y-2">
                            <p className="flex justify-between"><span>⚔️ Sebzés:</span> <span className="font-bold text-red-300">{card.damage}</span></p>
                            <p className="flex justify-between"><span>❤️ Életerő:</span> <span className="font-bold text-green-300">{card.health}</span></p>
                            <p className="flex justify-between"><span>🎯 Típus:</span> <span className="font-bold capitalize">{card.type}</span></p>
                            {card.boostType && (
                              <p className="flex justify-between"><span>⚡ Fejlesztés:</span> <span className="font-bold text-yellow-300">{card.boostType === 'damage' ? '2× Damage' : '2× Health'}</span></p>
                            )}
                            <p className="text-xs text-amber-400 mt-3 pt-2 border-t border-amber-600">
                              Készítve: {new Date(card.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dungeons Tab */}
            {activeTab === 'dungeons' && (
              <div className="space-y-8">
                <DungeonCreator 
                  worldCards={worldCards}
                  onDungeonCreated={handleDungeonCreated}
                />
                
                {/* Dungeons List */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
                  <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6">Minden kazamata ({dungeons.length})</h2>
                  
                  {dungeons.length === 0 ? (
                    <div className="text-center py-8 text-amber-300 bg-gray-700/30 rounded-xl border-2 border-amber-500">
                      <p className="text-lg font-serif">Nincsenek kazamaták. Csinálj egyet!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dungeons.map((dungeon) => (
                        <div key={dungeon._id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border-4 border-amber-500 shadow-lg hover:shadow-amber-500/50 transition-all hover:scale-105">
                          <h3 className="font-bold text-xl text-amber-100 font-serif mb-4">{dungeon.name}</h3>
                          <div className="text-sm text-amber-200 space-y-2 mb-4">
                            <p className="flex justify-between"><span>📊 Típus:</span> <span className="font-bold capitalize">{dungeon.type}</span></p>
                            <p className="flex justify-between"><span>🃏 Kártyák:</span> <span className="font-bold text-blue-300">{dungeon.cards?.length || 0}</span></p>
                            <p className="text-xs text-amber-400 mt-3 pt-2 border-t border-amber-600">
                              Készítve: {new Date(dungeon.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {/* Show dungeon cards if available */}
                          {dungeon.cards && dungeon.cards.length > 0 && (
                            <div className="mt-4 pt-4 border-t-2 border-amber-600">
                              <p className="text-sm font-bold text-amber-200 mb-3">Kazamata őrzők:</p>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {dungeon.cards.map((card, index) => (
                                  <div key={card._id} className="flex justify-between items-center text-xs bg-gray-600/50 p-2 rounded">
                                    <span className="text-amber-200">{index + 1}. {card.name}</span>
                                    <span className={`px-2 py-1 rounded font-bold ${
                                      card.isLeader ? 'bg-yellow-700 text-amber-100' : 'bg-gray-600 text-amber-200'
                                    }`}>
                                      {card.isLeader ? 'Vezér' : 'Átlagos'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Environments Tab */}
            {activeTab === 'environments' && (
              <div className="space-y-8">
                <GameEnvironmentCreator 
                  worldCards={worldCards}
                  dungeons={dungeons}
                  onEnvironmentCreated={handleEnvironmentCreated}
                />
                
                {/* Environments List */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
                  <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6">Minden környezet({environments.length})</h2>
                  
                  {environments.length === 0 ? (
                    <div className="text-center py-8 text-amber-300 bg-gray-700/30 rounded-xl border-2 border-amber-500">
                      <p className="text-lg font-serif">Nincs környezet! Csinálj egyet!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {environments.map((env) => (
                        <div key={env._id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border-4 border-amber-500 shadow-lg hover:shadow-amber-500/50 transition-all">
                          <h3 className="font-bold text-xl text-amber-100 font-serif mb-4">{env.name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-4">
                            <div className="bg-gray-600/50 rounded-lg p-4 border-2 border-amber-600">
                              <p className="font-bold text-amber-200 mb-2">Kártyák: <span className="text-blue-300">{env.worldCards?.length || 0}</span></p>
                              {env.worldCards && env.worldCards.length > 0 && (
                                <ul className="text-xs mt-2 space-y-1 text-amber-300">
                                  {env.worldCards.slice(0, 3).map(card => (
                                    <li key={card._id}>• {card.name}</li>
                                  ))}
                                  {env.worldCards.length > 3 && (
                                    <li className="text-amber-400">... és {env.worldCards.length - 3} több</li>
                                  )}
                                </ul>
                              )}
                            </div>
                            <div className="bg-gray-600/50 rounded-lg p-4 border-2 border-amber-600">
                              <p className="font-bold text-amber-200 mb-2">Kazamaták: <span className="text-red-300">{env.dungeons?.length || 0}</span></p>
                              {env.dungeons && env.dungeons.length > 0 && (
                                <ul className="text-xs mt-2 space-y-1 text-amber-300">
                                  {env.dungeons.map(dungeon => (
                                    <li key={dungeon._id}>• {dungeon.name}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div className="bg-gray-600/50 rounded-lg p-4 border-2 border-amber-600">
                              <p className="font-bold text-amber-200 mb-2">Kezdő kártyák: <span className="text-green-300">{env.starterCollection?.length || 0}</span></p>
                              {env.starterCollection && env.starterCollection.length > 0 && (
                                <ul className="text-xs mt-2 space-y-1 text-amber-300">
                                  {env.starterCollection.slice(0, 3).map(card => (
                                    <li key={card._id}>• {card.name}</li>
                                  ))}
                                  {env.starterCollection.length > 3 && (
                                    <li className="text-amber-400">... és {env.starterCollection.length - 3} több</li>
                                  )}
                                </ul>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-amber-400 mt-4 pt-3 border-t border-amber-600">
                            Készítve: {new Date(env.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Medieval Footer */}
      <footer className="bg-gradient-to-r from-amber-900 to-amber-800 border-t-4 border-amber-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-amber-200">
            <p className="text-amber-300 mt-2 font-bold">Te alakíthatod a játékot!</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default GameMasterDashboard