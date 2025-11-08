// src/components/BattlefieldTab.tsx
import React from 'react'
import type { WorldCard, PlayerDeck, Dungeon, BattleResult, BattleRound } from '../types/game'

interface BattlefieldTabProps {
  playerDecks: PlayerDeck[]
  dungeons: Dungeon[]
  selectedDeck: PlayerDeck | null
  setSelectedDeck: (deck: PlayerDeck | null) => void
  selectedDungeon: Dungeon | null
  setSelectedDungeon: (dungeon: Dungeon | null) => void
  battleResult: BattleResult | null
  setBattleResult: (result: BattleResult | null) => void
  startBattle: () => Promise<void>
  applyReward: (cardId: string) => Promise<void>
  availableCards: WorldCard[]
  setActiveTab: (tab: 'decks' | 'battle' | 'collection' | 'allcards') => void
  getTypeColor: (type: string) => string
  getTypeEmoji: (type: string) => string
  getDungeonColor: (type: string) => string
  getCardRarityColor: (card: WorldCard) => string
}

const BattlefieldTab: React.FC<BattlefieldTabProps> = ({
  playerDecks,
  dungeons,
  selectedDeck,
  setSelectedDeck,
  selectedDungeon,
  setSelectedDungeon,
  battleResult,
  setBattleResult,
  startBattle,
  applyReward,
  availableCards,
  setActiveTab,
  getTypeColor,
  getTypeEmoji,
  getDungeonColor,
  getCardRarityColor
}) => {
  return (
    <div className="space-y-8">
      {/* Battle Preparation */}
      {!battleResult && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-8 text-center">⚔️ Prepare for Battle</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* War Formation Selection */}
            <div className="space-y-6">
              <h3 className="font-bold text-xl text-amber-200 font-serif">🛡️ Choose Your War Formation</h3>
              {playerDecks.length === 0 ? (
                <div className="p-8 border-4 border-dashed border-amber-500 rounded-2xl text-center bg-gray-700/30">
                  <p className="text-amber-300 mb-4 text-lg">No formations available</p>
                  <button
                    onClick={() => setActiveTab('decks')}
                    className="bg-amber-600 hover:bg-amber-700 text-amber-100 px-6 py-3 rounded-xl transition-all border-2 border-amber-500 font-bold"
                  >
                    Forge Your First Formation
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {playerDecks.map((deck: PlayerDeck) => (
                    <div
                      key={deck._id}
                      className={`p-5 border-4 rounded-2xl cursor-pointer transition-all ${
                        selectedDeck?._id === deck._id 
                          ? 'border-amber-400 bg-amber-900/30 shadow-2xl' 
                          : 'border-amber-600 bg-gray-700/50 hover:border-amber-400'
                      }`}
                      onClick={() => setSelectedDeck(deck)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-amber-100 text-lg">{deck.name}</h4>
                          <p className="text-amber-300">{deck.cards.length} warriors</p>
                        </div>
                        {selectedDeck?._id === deck._id && (
                          <span className="bg-amber-600 text-amber-100 text-sm px-3 py-1 rounded-lg font-bold">Chosen</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dungeon Selection */}
            <div className="space-y-6">
              <h3 className="font-bold text-xl text-amber-200 font-serif">🏰 Choose Your Conquest</h3>
              {dungeons.length === 0 ? (
                <div className="p-8 border-4 border-dashed border-amber-500 rounded-2xl text-center bg-gray-700/30">
                  <p className="text-amber-300">No dungeons available for conquest</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {dungeons.map((dungeon: Dungeon) => (
                    <div
                      key={dungeon._id}
                      className={`p-5 border-4 rounded-2xl cursor-pointer transition-all ${
                        selectedDungeon?._id === dungeon._id 
                          ? 'border-amber-400 bg-amber-900/30 shadow-2xl' 
                          : 'border-amber-600 bg-gray-700/50 hover:border-amber-400'
                      } ${getDungeonColor(dungeon.type)}`}
                      onClick={() => setSelectedDungeon(dungeon)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-amber-100 text-lg">{dungeon.name}</h4>
                          <p className="text-amber-300 capitalize">{dungeon.type}</p>
                          <p className="text-amber-400 text-sm">{dungeon.cards.length} guardians</p>
                        </div>
                        {selectedDungeon?._id === dungeon._id && (
                          <span className="bg-amber-600 text-amber-100 text-sm px-3 py-1 rounded-lg font-bold">Chosen</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Battle Preview */}
          {selectedDeck && selectedDungeon && (
            <div className="mt-8 p-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl border-4 border-blue-600">
              <h3 className="font-bold text-2xl text-amber-100 font-serif mb-6 text-center">🎯 Battle Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-blue-300 text-xl mb-4 font-serif">🛡️ Your Formation</h4>
                  <div className="space-y-3">
                    {selectedDeck.cards.map((card: WorldCard, index: number) => (
                      <div key={card._id} className="flex justify-between items-center p-4 bg-gray-700 rounded-xl border-2 border-blue-500">
                        <div className="flex items-center space-x-3">
                          <span className="text-amber-300 w-6">{index + 1}.</span>
                          <span className="font-bold text-amber-100">{card.name}</span>
                        </div>
                        <div className="text-sm text-amber-300">
                          <span className={`px-2 py-1 rounded-lg ${getTypeColor(card.type)}`}>
                            {getTypeEmoji(card.type)}
                          </span>
                          <span className="mx-2 text-red-300">⚔️{card.damage}</span>
                          <span className="text-green-300">❤️{card.health}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-red-300 text-xl mb-4 font-serif">🏰 Dungeon Guardians</h4>
                  <div className="space-y-3">
                    {selectedDungeon.cards.map((card: WorldCard, index: number) => (
                      <div key={card._id} className="flex justify-between items-center p-4 bg-gray-700 rounded-xl border-2 border-red-500">
                        <div className="flex items-center space-x-3">
                          <span className="text-amber-300 w-6">{index + 1}.</span>
                          <span className="font-bold text-amber-100">{card.name}</span>
                        </div>
                        <div className="text-sm text-amber-300">
                          <span className={`px-2 py-1 rounded-lg ${getTypeColor(card.type)}`}>
                            {getTypeEmoji(card.type)}
                          </span>
                          <span className="mx-2 text-red-300">⚔️{card.damage}</span>
                          <span className="text-green-300">❤️{card.health}</span>
                          {card.isLeader && (
                            <span className="ml-2 bg-yellow-700 text-amber-100 text-xs px-2 py-1 rounded-lg">👑</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <div className="text-amber-300 text-lg mb-4 font-bold">
                  {selectedDeck.cards.length} vs {selectedDungeon.cards.length} warriors
                </div>
                <button
                  onClick={startBattle}
                  disabled={!selectedDeck || !selectedDungeon || selectedDeck.cards.length !== selectedDungeon.cards.length}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-amber-100 py-4 px-12 rounded-2xl disabled:bg-gray-600 transition-all text-xl font-bold border-2 border-red-500 shadow-2xl"
                >
                  ⚔️ COMMENCE BATTLE! ⚔️
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Battle Results */}
      {battleResult && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-8 text-center">🏆 Battle Results</h2>
          
          {/* Overall Result */}
          <div className={`p-8 rounded-2xl mb-8 text-center border-4 ${
            battleResult.playerWins 
              ? 'bg-gradient-to-r from-green-800 to-emerald-900 border-green-600' 
              : 'bg-gradient-to-r from-red-800 to-pink-900 border-red-600'
          }`}>
            <div className="text-3xl font-bold mb-4">
              {battleResult.playerWins ? '🎉 GLORIOUS VICTORY! 🎉' : '💀 VALIANT DEFEAT! 💀'}
            </div>
            <div className="text-xl text-amber-100">
              You claimed {battleResult.rounds.filter(r => r.playerWins).length} out of {battleResult.rounds.length} engagements
            </div>
          </div>

          {/* Engagement Details */}
          <div className="space-y-6 mb-8">
            <h3 className="font-bold text-2xl text-amber-200 font-serif text-center">📜 Battle Engagements</h3>
            {battleResult.rounds.map((round: BattleRound, index: number) => (
              <div key={index} className="border-2 border-amber-500 rounded-2xl p-6 bg-gray-700/50">
                <div className="text-lg font-bold mb-4 text-center bg-amber-900/30 py-3 rounded-xl text-amber-100">
                  Engagement {index + 1}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  {/* Your Warrior */}
                  <div className="text-center p-4 bg-gray-600 rounded-xl border-2 border-blue-500">
                    <div className="font-bold text-blue-300 text-lg">{round.playerCard.name}</div>
                    <div className="mt-3 space-y-2">
                      <div>⚔️ Might: {round.playerCard.damage}</div>
                      <div>❤️ Resilience: {round.playerCard.health}</div>
                      <div className={`px-3 py-1 rounded-lg font-bold inline-block ${getTypeColor(round.playerCard.type)}`}>
                        {getTypeEmoji(round.playerCard.type)} {round.playerCard.type}
                      </div>
                    </div>
                  </div>
                  
                  {/* Result */}
                  <div className="text-center flex items-center justify-center">
                    <div className={`px-6 py-3 rounded-full font-bold text-lg border-2 ${
                      round.playerWins 
                        ? 'bg-green-800 text-amber-100 border-green-600' 
                        : 'bg-red-800 text-amber-100 border-red-600'
                    }`}>
                      {round.playerWins ? '✅ VICTORY' : '❌ DEFEAT'}
                    </div>
                  </div>
                  
                  {/* Dungeon Guardian */}
                  <div className="text-center p-4 bg-gray-600 rounded-xl border-2 border-red-500">
                    <div className="font-bold text-red-300 text-lg">{round.dungeonCard.name}</div>
                    <div className="mt-3 space-y-2">
                      <div>⚔️ Might: {round.dungeonCard.damage}</div>
                      <div>❤️ Resilience: {round.dungeonCard.health}</div>
                      <div className={`px-3 py-1 rounded-lg font-bold inline-block ${getTypeColor(round.dungeonCard.type)}`}>
                        {getTypeEmoji(round.dungeonCard.type)} {round.dungeonCard.type}
                      </div>
                      {round.dungeonCard.isLeader && (
                        <div className="bg-yellow-700 text-amber-100 text-sm px-2 py-1 rounded-lg mt-2 font-bold">
                          👑 Guardian Commander
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-amber-300 mt-4 text-center bg-amber-900/30 p-3 rounded-xl">
                  🎯 {round.reason}
                </div>
              </div>
            ))}
          </div>

          {/* Victory Rewards */}
          {battleResult.playerWins && battleResult.playerReward && (
            <div className="mt-8 p-8 bg-gradient-to-r from-yellow-800 to-orange-900 rounded-2xl border-4 border-yellow-600">
              <h3 className="font-bold text-2xl text-amber-100 font-serif mb-6 text-center">⚜️ Victory Spoils!</h3>
              <p className="text-center mb-6 text-amber-200 text-lg">
                You earned <span className="font-bold text-yellow-300">+{battleResult.playerReward.bonusAmount} {battleResult.playerReward.bonusType}</span>!
                Bestow this boon upon one of your warriors:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                {availableCards.map((card: WorldCard) => (
                  <button
                    key={card._id}
                    onClick={() => applyReward(card._id)}
                    className="p-4 border-2 border-yellow-500 rounded-xl text-left bg-gray-700 hover:bg-yellow-900/30 transition-all"
                  >
                    <div className="font-bold text-amber-100 text-lg">{card.name}</div>
                    <div className="text-amber-300 text-sm mt-2">
                      Current: ⚔️{card.damage} ❤️{card.health}
                    </div>
                    <div className="text-green-300 font-bold text-sm mt-2">
                      After: ⚔️{card.damage + (battleResult.playerReward?.bonusType === 'damage' ? battleResult.playerReward.bonusAmount : 0)} ❤️{card.health + (battleResult.playerReward?.bonusType === 'health' ? battleResult.playerReward.bonusAmount : 0)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center space-x-6">
            <button
              onClick={() => {
                setBattleResult(null);
                setSelectedDeck(null);
                setSelectedDungeon(null);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-gray-500 font-bold text-lg"
            >
              🔄 Battle Again
            </button>
            <button
              onClick={() => setActiveTab('decks')}
              className="bg-amber-600 hover:bg-amber-700 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-amber-500 font-bold text-lg"
            >
              🛡️ Forge New Formation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BattlefieldTab