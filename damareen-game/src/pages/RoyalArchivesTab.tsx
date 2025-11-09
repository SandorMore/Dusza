// src/components/RoyalArchivesTab.tsx
import React from 'react'
import { apiService } from '../services/api'
import type { WorldCard } from '../types/game'

interface RoyalArchivesTabProps {
  availableCards: WorldCard[]
  loadData: () => Promise<void>
  getTypeColor: (type: string) => string
  getTypeEmoji: (type: string) => string
  getCardRarityColor: (card: WorldCard) => string
  setMessage: (message: string) => void
}

const RoyalArchivesTab: React.FC<RoyalArchivesTabProps> = ({
  availableCards,
  loadData,
  getTypeColor,
  getTypeEmoji,
  getCardRarityColor,
  setMessage
}) => {
  const handleInitializeStarterData = async (): Promise<void> => {
    try {
      const result = await apiService.initializeStarterData();
      setMessage(result.message);
      await loadData();
    } catch (error: any) {
      setMessage('❌ Royal Decree Error: ' + (error.response?.data?.message || error.message));
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 ">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-amber-100 font-serif">📜 Royal Archives</h2>
        <div className="flex space-x-4">
          <button
            onClick={loadData}
            className="bg-blue-700 hover:bg-blue-800 text-amber-100 px-6 py-3 rounded-xl transition-all border-2 border-blue-600 font-bold"
          >
            🔄 Update Archives
          </button>
          <span className="text-amber-200 font-bold text-lg">
            {availableCards.length} warrior{availableCards.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {availableCards.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🛡️</div>
          <p className="text-xl text-amber-300 mb-6">Your archives are empty</p>
          <button
            onClick={handleInitializeStarterData}
            className="bg-orange-700 hover:bg-orange-800 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-orange-600 font-bold text-lg"
          >
            ⚜️ Summon Starter Warriors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableCards.map((card: WorldCard) => (
            <div key={card._id} className={`border-2 rounded-2xl p-5 transition-all transform hover:scale-105 ${getCardRarityColor(card)} hover:shadow-2xl`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-amber-100 text-lg">{card.name}</h3>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getTypeColor(card.type)}`}>
                  {getTypeEmoji(card.type)} {card.type}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-red-300 font-bold">⚔️ Might</span>
                  <span className="font-bold text-amber-100">{card.damage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-300 font-bold">❤️ Resilience</span>
                  <span className="font-bold text-amber-100">{card.health}</span>
                </div>
                
                {card.boostType && (
                  <div className="bg-purple-700 border border-purple-500 rounded-xl p-3 mt-3">
                    <div className="text-xs text-purple-200 font-bold">
                      ⚡ {card.boostType === 'damage' ? '2× Might' : '2× Resilience'}
                    </div>
                  </div>
                )}
                
                {card.isLeader && (
                  <div className="bg-yellow-700 border border-yellow-500 rounded-xl p-3 mt-3">
                    <div className="text-xs text-yellow-200 font-bold flex items-center">
                      👑 Formation Commander
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RoyalArchivesTab