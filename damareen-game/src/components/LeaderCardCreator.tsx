// src/components/LeaderCardCreator.tsx
import React, { useState } from 'react'
import { apiService } from '../services/api'
import type { WorldCard, LeaderCardData } from '../types/game'

interface Props {
  worldCards: WorldCard[]
  onCardCreated: () => void
}

const LeaderCardCreator: React.FC<Props> = ({ worldCards, onCardCreated }) => {
  const [formData, setFormData] = useState<LeaderCardData>({
    originalCardId: '',
    newName: '',
    boostType: 'damage'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Filter only non-leader cards for conversion
  const regularCards = worldCards.filter(card => !card.isLeader)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await apiService.createLeaderCard(formData)
      setMessage('Leader card created successfully!')
      setFormData({ originalCardId: '', newName: '', boostType: 'damage' })
      onCardCreated()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage('Error creating leader card')
      }
    } finally {
      setLoading(false)
    }
  }

  const selectedCard = worldCards.find(card => card._id === formData.originalCardId)

  const handleBoostTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, boostType: e.target.value as 'damage' | 'health' })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Create Leader Card</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Base Card</label>
          <select
            required
            value={formData.originalCardId}
            onChange={(e) => setFormData({ ...formData, originalCardId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="">Choose a card to upgrade</option>
            {regularCards.map(card => (
              <option key={card._id} value={card._id}>
                {card.name} (DMG: {card.damage}, HP: {card.health}, {card.type})
              </option>
            ))}
          </select>
        </div>

        {selectedCard && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">Selected Card:</p>
            <p className="font-medium">{selectedCard.name}</p>
            <p className="text-sm">Damage: {selectedCard.damage} | Health: {selectedCard.health}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Leader Card Name</label>
          <input
            type="text"
            required
            value={formData.newName}
            onChange={(e) => setFormData({ ...formData, newName: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            placeholder="Enter new name for leader card"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Boost Type</label>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="damage"
                checked={formData.boostType === 'damage'}
                onChange={handleBoostTypeChange}
                className="text-violet-500 focus:ring-violet-500"
              />
              <span className="ml-2">Double Damage (2×)</span>
            </label>
            <label className="inline-flex items-center ml-6">
              <input
                type="radio"
                value="health"
                checked={formData.boostType === 'health'}
                onChange={handleBoostTypeChange}
                className="text-violet-500 focus:ring-violet-500"
              />
              <span className="ml-2">Double Health (2×)</span>
            </label>
          </div>
        </div>

        {selectedCard && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm font-medium text-blue-800">Preview:</p>
            <p className="text-sm">
              {formData.newName || 'New Leader'} - 
              Damage: {formData.boostType === 'damage' ? selectedCard.damage * 2 : selectedCard.damage} - 
              Health: {formData.boostType === 'health' ? selectedCard.health * 2 : selectedCard.health}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formData.originalCardId}
          className="w-full bg-violet-500 text-white py-2 px-4 rounded-md hover:bg-violet-600 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Creating Leader...' : 'Create Leader Card'}
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

export default LeaderCardCreator