// src/components/GameEnvironmentCreator.tsx
import React, { useState } from 'react'
import { apiService } from '../services/api'
import type { WorldCard, Dungeon, GameEnvironmentData } from '../types/game'

interface Props {
  worldCards: WorldCard[]
  dungeons: Dungeon[]
  onEnvironmentCreated: () => void
}

const GameEnvironmentCreator: React.FC<Props> = ({ worldCards, dungeons, onEnvironmentCreated }) => {
  const [formData, setFormData] = useState<GameEnvironmentData>({
    name: '',
    worldCardIds: [],
    dungeonIds: [],
    starterCollectionIds: []
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await apiService.createGameEnvironment(formData)
      setMessage('Game environment created successfully!')
      setFormData({ name: '', worldCardIds: [], dungeonIds: [], starterCollectionIds: [] })
      onEnvironmentCreated()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage('Error creating game environment')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string, field: 'worldCardIds' | 'dungeonIds' | 'starterCollectionIds') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter(itemId => itemId !== id)
        : [...prev[field], id]
    }))
  }

  const selectedWorldCards = worldCards.filter(card => formData.worldCardIds.includes(card._id))
  const selectedDungeons = dungeons.filter(dungeon => formData.dungeonIds.includes(dungeon._id))
  const selectedStarterCards = worldCards.filter(card => formData.starterCollectionIds.includes(card._id))

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Create Game Environment</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Environment Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            placeholder="Enter environment name"
          />
        </div>

        {/* World Cards Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            World Cards ({formData.worldCardIds.length} selected)
          </label>
          <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
            {worldCards.map(card => (
              <label key={card._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={formData.worldCardIds.includes(card._id)}
                  onChange={() => toggleSelection(card._id, 'worldCardIds')}
                  className="text-violet-500 focus:ring-violet-500"
                />
                <span>{card.name} ({card.type})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dungeons Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dungeons ({formData.dungeonIds.length} selected)
          </label>
          <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
            {dungeons.map(dungeon => (
              <label key={dungeon._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={formData.dungeonIds.includes(dungeon._id)}
                  onChange={() => toggleSelection(dungeon._id, 'dungeonIds')}
                  className="text-violet-500 focus:ring-violet-500"
                />
                <span>{dungeon.name} ({dungeon.type})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Starter Collection Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Starter Collection Cards ({formData.starterCollectionIds.length} selected)
          </label>
          <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
            {worldCards.map(card => (
              <label key={card._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={formData.starterCollectionIds.includes(card._id)}
                  onChange={() => toggleSelection(card._id, 'starterCollectionIds')}
                  className="text-violet-500 focus:ring-violet-500"
                />
                <span>{card.name} ({card.type})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        {(selectedWorldCards.length > 0 || selectedDungeons.length > 0 || selectedStarterCards.length > 0) && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">Environment Summary:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">World Cards: {selectedWorldCards.length}</p>
                <ul className="list-disc list-inside text-blue-700">
                  {selectedWorldCards.slice(0, 3).map(card => (
                    <li key={card._id}>{card.name}</li>
                  ))}
                  {selectedWorldCards.length > 3 && <li>...and {selectedWorldCards.length - 3} more</li>}
                </ul>
              </div>
              <div>
                <p className="font-medium">Dungeons: {selectedDungeons.length}</p>
                <ul className="list-disc list-inside text-blue-700">
                  {selectedDungeons.map(dungeon => (
                    <li key={dungeon._id}>{dungeon.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Starter Cards: {selectedStarterCards.length}</p>
                <ul className="list-disc list-inside text-blue-700">
                  {selectedStarterCards.slice(0, 3).map(card => (
                    <li key={card._id}>{card.name}</li>
                  ))}
                  {selectedStarterCards.length > 3 && <li>...and {selectedStarterCards.length - 3} more</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formData.name || formData.worldCardIds.length === 0}
          className="w-full bg-violet-500 text-white py-2 px-4 rounded-md hover:bg-violet-600 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Creating Environment...' : 'Create Game Environment'}
        </button>

        {message && (
          <div className={`p-3 rounded ${
            message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

export default GameEnvironmentCreator