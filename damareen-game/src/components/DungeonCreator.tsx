// src/components/DungeonCreator.tsx
import React, { useState } from 'react'
import { apiService } from '../services/api'
import type { WorldCard, DungeonData } from '../types/game'

interface Props {
  worldCards: WorldCard[]
  onDungeonCreated: () => void
}

const DungeonCreator: React.FC<Props> = ({ worldCards, onDungeonCreated }) => {
  const [formData, setFormData] = useState<DungeonData>({
    name: '',
    type: 'Egyszerű',
    cardIds: []
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      
      // Ensure leader is last before submitting
      const selectedCards = getSelectedCardsInOrder()
      const leaderIndex = selectedCards.findIndex(card => card.isLeader)
      
      let finalCardIds = formData.cardIds
      
      if (leaderIndex !== -1 && leaderIndex !== selectedCards.length - 1) {
        // Reorder the cardIds to put leader last
        const leaderCardId = formData.cardIds[leaderIndex]
        const nonLeaderCards = formData.cardIds.filter(id => id !== leaderCardId)
        finalCardIds = [...nonLeaderCards, leaderCardId]
      }

      const submissionData = {
        ...formData,
        cardIds: finalCardIds
      }
      
      await apiService.createDungeon(submissionData)
      
      setMessage('Dungeon created successfully!')
      setFormData({ name: '', type: 'Egyszerű', cardIds: [] })
      onDungeonCreated()
    } catch (error: unknown) {
      console.error('Dungeon creation error:', error)
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Error creating dungeon')
      }
    } finally {
      setLoading(false)
    }
  }

  const getRequiredCardCount = () => {
    switch (formData.type) {
      case 'Egyszerű': return 1
      case 'Kis kazamata': return 4
      case 'Nagy kazamata': return 6
      default: return 0
    }
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as DungeonData['type']
    setFormData({ ...formData, type: newType, cardIds: [] })
  }

  const requiredCount = getRequiredCardCount()
  const isValid = formData.cardIds.length === requiredCount

  const toggleCard = (cardId: string) => {
    setFormData(prev => {
      const newCardIds = prev.cardIds.includes(cardId)
        ? prev.cardIds.filter(id => id !== cardId)
        : [...prev.cardIds, cardId]
      
      return { ...prev, cardIds: newCardIds.slice(0, requiredCount) }
    })
  }

  const getSelectedCardsInOrder = (): WorldCard[] => {
    return formData.cardIds
      .map(id => worldCards.find(card => card._id === id))
      .filter((card): card is WorldCard => card !== undefined)
  }

  const moveCard = (currentIndex: number, newIndex: number) => {
    if (currentIndex === newIndex || currentIndex < 0 || newIndex < 0 || 
        currentIndex >= formData.cardIds.length || newIndex >= formData.cardIds.length) {
      return
    }

    setFormData(prev => {
      const newCardIds = [...prev.cardIds]
      const [movedCard] = newCardIds.splice(currentIndex, 1)
      newCardIds.splice(newIndex, 0, movedCard)
      return { ...prev, cardIds: newCardIds }
    })
  }

  const moveCardUp = (index: number) => {
    moveCard(index, index - 1)
  }

  const moveCardDown = (index: number) => {
    moveCard(index, index + 1)
  }

  const moveLeaderToLast = () => {
    const selectedCards = getSelectedCardsInOrder()
    const leaderIndex = selectedCards.findIndex(card => card.isLeader)
    
    if (leaderIndex !== -1 && leaderIndex !== selectedCards.length - 1) {
      moveCard(leaderIndex, selectedCards.length - 1)
    }
  }

  const selectedCards = getSelectedCardsInOrder()
  const hasLeader = selectedCards.some(card => card.isLeader)
  const isLeaderLast = selectedCards.length > 0 && selectedCards[selectedCards.length - 1]?.isLeader

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Kazamata Létrehozása</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Kazamata Neve</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            placeholder="Enter dungeon name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Kazamata Típusa</label>
          <select
            value={formData.type}
            onChange={handleTypeChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="Egyszerű találkozás">Egyszerű(1 card)</option>
            <option value="Kis kazamata">Kis Kazamata (3 regular + 1 leader)</option>
            <option value="Nagy kazamata">Nagy Kazamata (5 regular + 1 leader)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kártyák kiválasztása ({formData.cardIds.length}/{requiredCount})
          </label>
          <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
            {worldCards.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nincs elérhető kártya!</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {worldCards.map(card => (
                  <label key={card._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={formData.cardIds.includes(card._id)}
                      onChange={() => toggleCard(card._id)}
                      disabled={!formData.cardIds.includes(card._id) && formData.cardIds.length >= requiredCount}
                      className="text-violet-500 focus:ring-violet-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{card.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        (DMG: {card.damage}, HP: {card.health}, {card.type})
                        {card.isLeader && <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-1 rounded">Leader</span>}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedCards.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-blue-800">Kiválasztott Kártyák:</p>
              {hasLeader && !isLeaderLast && (
                <button
                  type="button"
                  onClick={moveLeaderToLast}
                  className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
                >
                  A vezér hátra helyezése
                </button>
              )}
            </div>
            <div className="space-y-2">
              {selectedCards.map((card, index) => (
                <div 
                  key={card._id} 
                  className="flex items-center justify-between p-2 bg-white rounded border shadow-sm"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-500 w-4 text-center">{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => moveCardUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-violet-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCardDown(index)}
                        disabled={index === selectedCards.length - 1}
                        className="p-1 text-gray-400 hover:text-violet-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                    <span className="font-medium">{card.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      card.isLeader ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {card.isLeader ? 'Leader' : 'Regular'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    DMG: {card.damage} | HP: {card.health}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Validation warnings */}
            {hasLeader && !isLeaderLast && (
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded text-sm">
                <strong>A vezérnek utolsónak kell lennie.</strong>
              </div>
            )}
            
            {formData.type === 'Kis kazamata' && selectedCards.length === 4 && (!hasLeader || !isLeaderLast) && (
              <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
                <strong>Helytelen kompozíció!</strong>
              </div>
            )}
            
            {formData.type === 'Nagy kazamata' && selectedCards.length === 6 && (!hasLeader || !isLeaderLast) && (
              <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
                <strong>Helytelen kompozíció!</strong>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-violet-500 text-white py-2 px-4 rounded-md hover:bg-violet-600 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Creating Dungeon...' : `Create ${formData.type}`}
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

export default DungeonCreator