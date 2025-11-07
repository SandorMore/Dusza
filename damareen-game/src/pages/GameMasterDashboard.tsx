// src/pages/GameMasterDashboard.tsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import WorldCardCreator from '../components/WorldCardCreator'
import LeaderCardCreator from '../components/LeaderCardCreator'
import DungeonCreator from '../components/DungeonCreator'
import GameEnvironmentCreator from './../components/GameEnvironmentCreator'
import type { WorldCard, Dungeon, GameEnvironment } from '../types/game'

const GameMasterDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'cards' | 'dungeons' | 'environments'>('cards')
  const [worldCards, setWorldCards] = useState<WorldCard[]>([])
  const [dungeons, setDungeons] = useState<Dungeon[]>([])
  const [environments, setEnvironments] = useState<GameEnvironment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [cardsRes, dungeonsRes, environmentsRes] = await Promise.all([
        apiService.getWorldCards(),
        apiService.getDungeons(),
        apiService.getGameEnvironments()
      ])
      
      setWorldCards(cardsRes.cards || [])
      setDungeons(dungeonsRes.dungeons || [])
      setEnvironments(environmentsRes.environments || [])
    } catch (error) {
      console.error('Error loading data:', error)
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

  if (!user || user.role !== 'gameMaster') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">You need to be a Game Master to access this page.</p>
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
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8">
            {[
              { id: 'cards' as const, label: 'Cards', icon: '🃏' },
              { id: 'dungeons' as const, label: 'Dungeons', icon: '🏰' },
              { id: 'environments' as const, label: 'Environments', icon: '🌍' }
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
                  <h2 className="text-xl font-semibold mb-4">Your World Cards ({worldCards.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {worldCards.map((card) => (
                      <div key={card._id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <h3 className="font-semibold text-lg">{card.name}</h3>
                        <div className="text-sm text-gray-600 mt-2">
                          <p>Damage: {card.damage}</p>
                          <p>Health: {card.health}</p>
                          <p>Type: {card.type}</p>
                          {card.isLeader && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                              Leader
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <h2 className="text-xl font-semibold mb-4">Your Dungeons ({dungeons.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dungeons.map((dungeon) => (
                      <div key={dungeon._id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <h3 className="font-semibold text-lg">{dungeon.name}</h3>
                        <p className="text-gray-600">Type: {dungeon.type}</p>
                        <p className="text-gray-600">Cards: {dungeon.cards?.length || 0}</p>
                      </div>
                    ))}
                  </div>
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
                  <h2 className="text-xl font-semibold mb-4">Your Game Environments ({environments.length})</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {environments.map((env) => (
                      <div key={env._id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <h3 className="font-semibold text-lg">{env.name}</h3>
                        <p className="text-gray-600">World Cards: {env.worldCards?.length || 0}</p>
                        <p className="text-gray-600">Dungeons: {env.dungeons?.length || 0}</p>
                        <p className="text-gray-600">Starter Cards: {env.starterCollection?.length || 0}</p>
                      </div>
                    ))}
                  </div>
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