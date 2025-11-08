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
          console.log('User is not Game Master, redirecting...')
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
      
      console.log('📦 Cards response:', cardsRes)
      console.log('🏰 Dungeons response:', dungeonsRes)
      console.log('🌍 Environments response:', environmentsRes)
      
      setWorldCards(cardsRes.cards || [])
      setDungeons(dungeonsRes.dungeons || [])
      setEnvironments(environmentsRes.environments || [])
      
      console.log(`✅ Loaded: ${cardsRes.cards?.length || 0} cards, ${dungeonsRes.dungeons?.length || 0} dungeons, ${environmentsRes.environments?.length || 0} environments`)
      
    } catch (error) {
      console.error('❌ Error loading data:', error)
      setError('Failed to load game data. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCardCreated = () => {
    console.log('🔄 Refreshing cards after creation...')
    loadData()
  }

  const handleDungeonCreated = () => {
    console.log('🔄 Refreshing dungeons after creation...')
    loadData()
  }

  const handleEnvironmentCreated = () => {
    console.log('🔄 Refreshing environments after creation...')
    loadData()
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Game Master Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.username}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8">
            {[
              { id: 'cards' as const, label: `Cards (${worldCards.length})`, icon: '🃏' },
              { id: 'dungeons' as const, label: `Dungeons (${dungeons.length})`, icon: '🏰' },
              { id: 'environments' as const, label: `Environments (${environments.length})`, icon: '🌍' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            <span className="ml-4">Loading game data...</span>
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
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">All World Cards ({worldCards.length})</h2>
                    <span className="text-sm text-gray-500">
                      {worldCards.filter(card => card.isLeader).length} Leaders, 
                      {worldCards.filter(card => !card.isLeader).length} Regular
                    </span>
                  </div>
                  
                  {worldCards.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No cards found. Create your first world card!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {worldCards.map((card) => (
                        <div key={card._id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{card.name}</h3>
                            {card.isLeader && (
                              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                Leader
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>💥 Damage: {card.damage}</p>
                            <p>❤️ Health: {card.health}</p>
                            <p>🎯 Type: <span className="capitalize">{card.type}</span></p>
                            {card.boostType && (
                              <p>⚡ Boost: {card.boostType === 'damage' ? '2× Damage' : '2× Health'}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              Created: {new Date(card.createdAt).toLocaleDateString()}
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
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">All Dungeons ({dungeons.length})</h2>
                  
                  {dungeons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No dungeons found. Create your first dungeon!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dungeons.map((dungeon) => (
                        <div key={dungeon._id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="font-semibold text-lg mb-2">{dungeon.name}</h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📊 Type: {dungeon.type}</p>
                            <p>🃏 Cards: {dungeon.cards?.length || 0}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              Created: {new Date(dungeon.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {/* Show dungeon cards if available */}
                          {dungeon.cards && dungeon.cards.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-medium mb-2">Dungeon Cards:</p>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {dungeon.cards.map((card, index) => (
                                  <div key={card._id} className="flex justify-between text-xs">
                                    <span>{index + 1}. {card.name}</span>
                                    <span className={`px-1 rounded ${
                                      card.isLeader ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {card.isLeader ? 'Leader' : 'Regular'}
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
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">All Game Environments ({environments.length})</h2>
                  
                  {environments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No game environments found. Create your first environment!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {environments.map((env) => (
                        <div key={env._id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="font-semibold text-lg mb-2">{env.name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <p className="font-medium">🃏 World Cards: {env.worldCards?.length || 0}</p>
                              {env.worldCards && env.worldCards.length > 0 && (
                                <ul className="text-xs mt-1 space-y-1">
                                  {env.worldCards.slice(0, 3).map(card => (
                                    <li key={card._id}>• {card.name}</li>
                                  ))}
                                  {env.worldCards.length > 3 && (
                                    <li>... and {env.worldCards.length - 3} more</li>
                                  )}
                                </ul>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">🏰 Dungeons: {env.dungeons?.length || 0}</p>
                              {env.dungeons && env.dungeons.length > 0 && (
                                <ul className="text-xs mt-1 space-y-1">
                                  {env.dungeons.map(dungeon => (
                                    <li key={dungeon._id}>• {dungeon.name}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">🎯 Starter Cards: {env.starterCollection?.length || 0}</p>
                              {env.starterCollection && env.starterCollection.length > 0 && (
                                <ul className="text-xs mt-1 space-y-1">
                                  {env.starterCollection.slice(0, 3).map(card => (
                                    <li key={card._id}>• {card.name}</li>
                                  ))}
                                  {env.starterCollection.length > 3 && (
                                    <li>... and {env.starterCollection.length - 3} more</li>
                                  )}
                                </ul>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-3">
                            Created: {new Date(env.createdAt).toLocaleDateString()}
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
    </div>
  )
}

export default GameMasterDashboard