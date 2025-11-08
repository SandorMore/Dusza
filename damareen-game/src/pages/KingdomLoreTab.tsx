// src/components/KingdomLoreTab.tsx
import React from 'react'
import type { WorldCard, Dungeon } from '../types/game'

interface KingdomLoreTabProps {
  allGameCards: WorldCard[]
  allGameDungeons: Dungeon[]
  getTypeColor: (type: string) => string
  getTypeEmoji: (type: string) => string
  getDungeonColor: (type: string) => string
  getCardRarityColor: (card: WorldCard) => string
}

const KingdomLoreTab: React.FC<KingdomLoreTabProps> = ({
  allGameCards,
  allGameDungeons,
  getTypeColor,
  getTypeEmoji,
  getDungeonColor,
  getCardRarityColor
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-amber-100 font-serif">🏰 Kingdom Lore ({allGameCards.length})</h2>
        <div className="text-amber-200 font-bold">
          <span className="bg-yellow-700 text-amber-100 px-3 py-2 rounded-xl mr-3">
            👑 Commanders: {allGameCards.filter(c => c.isLeader).length}
          </span>
          <span className="bg-green-700 text-amber-100 px-3 py-2 rounded-xl">
            🏰 Dungeons: {allGameDungeons.length}
          </span>
        </div>
      </div>

      {/* Dungeons Section */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-amber-200 font-serif mb-6 text-center">🏰 Kingdom Dungeons</h3>
        {allGameDungeons.length === 0 ? (
          <div className="text-center py-12 text-amber-300">
            <p className="text-xl">No dungeons discovered in the kingdom yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allGameDungeons.map((dungeon: Dungeon) => (
              <div key={dungeon._id} className="border-2 border-purple-500 rounded-2xl p-6 bg-gradient-to-br from-purple-800 to-purple-900 hover:shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-amber-100 text-xl">{dungeon.name}</h4>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getDungeonColor(dungeon.type)}`}>
                    {dungeon.type}
                  </span>
                </div>
                <div className="text-amber-300 text-sm">
                  <div className="flex justify-between mb-3 font-bold">
                    <span>Guardians: {dungeon.cards.length}</span>
                    <span>Commanders: {dungeon.cards.filter(c => c.isLeader).length}</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {dungeon.cards.map((card: WorldCard, index: number) => (
                      <div key={card._id} className="flex justify-between items-center p-2 bg-purple-700 rounded-lg text-xs">
                        <span className="font-bold text-amber-100">{card.name}</span>
                        <span className="text-amber-300">
                          ⚔️{card.damage} ❤️{card.health}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Warriors Section */}
      <div>
        <h3 className="text-2xl font-bold text-amber-200 font-serif mb-6 text-center">🛡️ Kingdom Warriors</h3>
        {allGameCards.length === 0 ? (
          <div className="text-center py-12 text-amber-300">
            <p className="text-xl">No warriors recorded in the kingdom annals yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allGameCards.map((card: WorldCard) => (
              <div key={card._id} className={`border-2 rounded-2xl p-5 transition-all transform hover:scale-105 ${
                card.isLeader 
                  ? 'bg-gradient-to-br from-yellow-600 to-amber-700 border-yellow-500' 
                  : 'bg-gradient-to-br from-gray-700 to-gray-800 border-amber-500'
              } hover:shadow-2xl`}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-amber-100 text-lg">{card.name}</h4>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getTypeColor(card.type)}`}>
                      {getTypeEmoji(card.type)} {card.type}
                    </span>
                    {card.isLeader && (
                      <span className="bg-yellow-700 text-amber-100 text-xs px-2 py-1 rounded-lg font-bold">
                        👑 Commander
                      </span>
                    )}
                  </div>
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
                    <div className="bg-blue-700 border border-blue-500 rounded-xl p-3 mt-3">
                      <div className="text-xs text-blue-200 font-bold">
                        ⚡ {card.boostType === 'damage' ? '2× Might' : '2× Resilience'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default KingdomLoreTab