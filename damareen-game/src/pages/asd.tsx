// src/components/WarFormationsTab.tsx
import React from 'react'
import type { WorldCard, PlayerDeck } from '../types/game'

interface WarFormationsTabProps {
  playerDecks: PlayerDeck[]
  availableCards: WorldCard[]
  selectedDeck: PlayerDeck | null
  setSelectedDeck: (deck: PlayerDeck) => void
  newDeckName: string
  setNewDeckName: (name: string) => void
  selectedCardsForDeck: string[]
  setSelectedCardsForDeck: (cards: string[] | ((prev: string[]) => string[])) => void
  isCreatingDeck: boolean
  createDeck: () => Promise<void>
  getTypeColor: (type: string) => string
  getTypeEmoji: (type: string) => string
  getCardRarityColor: (card: WorldCard) => string
}

const WarFormationsTab: React.FC<WarFormationsTabProps> = ({
  playerDecks,
  availableCards,
  selectedDeck,
  setSelectedDeck,
  newDeckName,
  setNewDeckName,
  selectedCardsForDeck,
  setSelectedCardsForDeck,
  isCreatingDeck,
  createDeck,
  getTypeColor,
  getTypeEmoji,
  getCardRarityColor
}) => {
  const toggleCardForDeck = (cardId: string): void => {
    setSelectedCardsForDeck(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  return (
    <div className="space-y-8">
      {/* Forge New War Formation */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
        <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6 text-center">🛡️ Forge New War Formation</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-amber-200 mb-3 font-serif">Formation Name</label>
            <input
              type="text"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              className="w-full bg-gray-700 border-2 border-amber-500 rounded-xl px-4 py-3 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 font-serif"
              placeholder="Enter formation name..."
            />
          </div>
          
          <div>
            <label className="block text-lg font-medium text-amber-200 mb-3 font-serif">
              Select Warriors ({selectedCardsForDeck.length} chosen)
              {availableCards.length === 0 && (
                <span className="text-orange-300 text-sm ml-3 font-normal">
                  No base warriors available. Game Masters must create cards first!
                </span>
              )}
            </label>
            <div className="border-2 border-amber-500 rounded-xl p-6 max-h-96 overflow-y-auto bg-gray-700/50">
              {availableCards.length === 0 ? (
                <div className="text-center py-12 text-amber-300">
                  <p className="text-xl mb-4">No base warriors available</p>
                  <p className="text-lg">Game Masters must create base cards first!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCards.map((card: WorldCard) => (
                    <div
                      key={card._id}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                        selectedCardsForDeck.includes(card._id)
                          ? 'border-amber-400 bg-amber-900/30 shadow-lg'
                          : `${getCardRarityColor(card)} border-amber-600 hover:border-amber-400`
                      }`}
                      onClick={() => toggleCardForDeck(card._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-amber-100 text-lg">{card.name}</h3>
                          <div className="flex items-center space-x-2 mt-2">
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
                        <div className="text-right text-sm">
                          <div className="text-red-300 font-bold">⚔️ {card.damage}</div>
                          <div className="text-green-300 font-bold">❤️ {card.health}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={createDeck}
            disabled={!newDeckName.trim() || selectedCardsForDeck.length === 0 || isCreatingDeck}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-100 py-4 px-6 rounded-xl disabled:bg-gray-600 transition-all border-2 border-amber-500 font-bold text-lg shadow-lg"
          >
            {isCreatingDeck ? '⚒️ Forging Formation...' : '⚒️ Forge War Formation'}
          </button>
        </div>
      </div>

      {/* Existing War Formations */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber-100 font-serif">My War Formations</h2>
          <span className="text-amber-200 font-bold">
            {playerDecks.length} formation{playerDecks.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {playerDecks.length === 0 ? (
          <div className="text-center py-12 text-amber-300">
            <p className="text-xl mb-4">No formations forged yet</p>
            <p className="text-lg">Forge your first war formation above to commence battle!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playerDecks.map((deck: PlayerDeck) => (
              <div 
                key={deck._id}
                className={`border-4 rounded-2xl p-6 cursor-pointer transition-all transform hover:scale-105 ${
                  selectedDeck?._id === deck._id 
                    ? 'border-amber-400 bg-amber-900/30 shadow-2xl' 
                    : 'border-amber-600 bg-gray-700/50 hover:border-amber-400 hover:shadow-lg'
                }`}
                onClick={() => setSelectedDeck(deck)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-amber-100 text-xl">{deck.name}</h3>
                  <span className="bg-blue-700 text-amber-100 text-sm px-3 py-1 rounded-lg font-bold">
                    {deck.cards.length} warriors
                  </span>
                </div>
                
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {deck.cards.map((card: WorldCard, index: number) => (
                    <div key={card._id} className="flex justify-between items-center p-3 bg-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-amber-300 w-6 text-sm">{index + 1}.</span>
                        <span className="font-bold text-amber-100">{card.name}</span>
                      </div>
                      <div className="text-xs text-amber-300">
                        <span className="text-red-300">⚔️{card.damage}</span>
                        <span className="mx-2">|</span>
                        <span className="text-green-300">❤️{card.health}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedDeck?._id === deck._id && (
                  <div className="mt-4 pt-4 border-t border-amber-500">
                    <span className="text-amber-300 font-bold text-sm">✓ Chosen for battle</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WarFormationsTab