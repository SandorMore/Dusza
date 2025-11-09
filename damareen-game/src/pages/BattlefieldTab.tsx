// src/components/BattlefieldTab.tsx
import React, { useState, useRef, useEffect } from 'react'
import type { WorldCard, PlayerDeck, Dungeon, BattleResult, BattleRound } from '../types/game'
import AnimatedBattleView from '../components/AnimatedBattleView'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate} from 'react-router-dom'

interface BattlefieldTabProps {
  playerDecks: PlayerDeck[]
  dungeons: Dungeon[]
  selectedDeck: PlayerDeck | null
  setSelectedDeck: (deck: PlayerDeck | null) => void
  selectedDungeon: Dungeon | null
  setSelectedDungeon: (dungeon: Dungeon | null) => void
  battleResult: BattleResult | null
  setBattleResult: (result: BattleResult | null) => void
  startBattle: (cardOrder: string[]) => Promise<void>
  applyReward: (cardId: string) => Promise<void>
  availableCards: WorldCard[]
  allGameCards: WorldCard[]
  setActiveTab: (tab: 'decks' | 'battle' | 'collection' | 'allcards') => void
  getTypeColor: (type: string) => string
  getTypeEmoji: (type: string) => string
  getDungeonColor: (type: string) => string
  getCardRarityColor: (card: WorldCard) => string
}

const SortableCard: React.FC<{
  card: WorldCard
  index: number
  getTypeColor: (t: string) => string
  getTypeEmoji: (t: string) => string
}> = ({ card, index, getTypeColor, getTypeEmoji }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex justify-between items-center p-4 bg-gray-700 rounded-xl border-2 border-blue-500 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center space-x-3 flex-1">
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
  )
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
  allGameCards,
  setActiveTab,
  getTypeColor,
  getTypeEmoji,
  getDungeonColor,
  getCardRarityColor
}) => {
  const [showAnimatedBattle, setShowAnimatedBattle] = useState(false)
  const [showUpgradePage, setShowUpgradePage] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [previewDeckCards, setPreviewDeckCards] = useState<WorldCard[]>([])
  const navigate = useNavigate()

  const handleApplyReward = async (cardId: string) => {
    try {
      await applyReward(cardId)
      setTimeout(() => {
        setShowUpgradePage(false)
        setBattleResult(null)
      }, 500)
    } catch (error) {
    }
  }

  // Initialize preview deck cards when selectedDeck changes
  useEffect(() => {
    if (selectedDeck) {
      setPreviewDeckCards([...selectedDeck.cards])
    }
  }, [selectedDeck])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )
  
  // DnD reorder handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = previewDeckCards.findIndex(card => card._id === active.id)
      const newIndex = previewDeckCards.findIndex(card => card._id === over.id)
      const newCards = arrayMove(previewDeckCards, oldIndex, newIndex)
      setPreviewDeckCards(newCards)
      if (selectedDeck) {
        setSelectedDeck({ ...selectedDeck, cards: newCards })
      }
    }
  }

  useEffect(() => {
    if (battleResult && !showAnimatedBattle && !showUpgradePage && !(battleResult.playerWins && battleResult.playerReward)) {
      setShowAnimatedBattle(true)
    }
  }, [battleResult, showAnimatedBattle, showUpgradePage])

  // Scroll to results when viewing results
  useEffect(() => {
    if (battleResult && !showAnimatedBattle && !showUpgradePage && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [battleResult, showAnimatedBattle, showUpgradePage])

  // Show animated battle view
  if (battleResult && showAnimatedBattle && selectedDeck && selectedDungeon) {
    return (
      <AnimatedBattleView
        battleResult={battleResult}
        playerCards={previewDeckCards}
        dungeonCards={selectedDungeon.cards}
        deckId={selectedDeck._id}
        dungeonId={selectedDungeon._id}
        cardOrder={previewDeckCards.map(card => card._id)}
        onBattleComplete={(finalResult) => {
          setBattleResult(finalResult)
          setShowAnimatedBattle(false)
          // If player won, show upgrade page directly
          if (finalResult.playerWins && finalResult.playerReward) {
            setShowUpgradePage(true)
          }
        }}
        onExit={() => {
          setShowAnimatedBattle(false)
          setShowUpgradePage(false)
          setBattleResult(null)
          setSelectedDeck(null)
          setSelectedDungeon(null)
        }}
      />
    )
  }

  // Show dedicated upgrade page if player won
  if (battleResult && showUpgradePage && battleResult.playerWins && battleResult.playerReward) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-br from-yellow-800 to-orange-900 rounded-2xl shadow-2xl p-8 border-4 border-yellow-600">
            <h2 className="text-3xl font-bold text-amber-100 font-serif mb-4 text-center">⚜️ Győzelmi Zsákmány!</h2>
            <p className="text-center mb-8 text-amber-200 text-xl">
              Kerestél <span className="font-bold text-yellow-300 text-2xl">+{battleResult.playerReward.bonusAmount} {battleResult.playerReward.bonusType === 'damage' ? 'sebzés' : 'életerő'}</span>!
            </p>
            <p className="text-center mb-8 text-amber-100 text-lg">
              Válassz egy harcost, akire ezt az áldást ruházod:
            </p>
            
            {allGameCards.length === 0 ? (
              <div className="text-center p-8 bg-gray-700/50 rounded-xl border-2 border-yellow-500">
                <p className="text-amber-300 text-lg mb-4">Nincs elérhető harcos a fejlesztéshez</p>
                <p className="text-amber-400 text-sm">A Game Master-eknek először kártyákat kell létrehozniuk!</p>
                <button
                  onClick={() => {
                    setShowUpgradePage(false)
                    setActiveTab('decks')
                  }}
                  className="mt-6 bg-amber-600 hover:bg-amber-700 text-amber-100 px-8 py-3 rounded-xl transition-all border-2 border-amber-500 font-bold"
                >
                  🛡️ Vissza a Formációkhoz
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {allGameCards.map((card: WorldCard) => (
                    <button
                      key={card._id}
                      onClick={() => handleApplyReward(card._id)}
                      className="p-6 rounded-xl text-left bg-gradient-to-br from-gray-700 to-gray-800 hover:from-yellow-900/50 hover:to-orange-900/50 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-bold text-amber-100 text-xl">{card.name}</div>
                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${getTypeColor(card.type)}`}>
                          {getTypeEmoji(card.type)}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-amber-300 text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span>Jelenlegi Sebzés:</span>
                            <span className="font-bold">⚔️{card.damage}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Jelenlegi Életerő:</span>
                            <span className="font-bold">❤️{card.health}</span>
                          </div>
                        </div>
                        <div className="border-t-2 border-yellow-500 pt-3">
                          <div className="text-green-300 font-bold text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span>Fejlesztés Után:</span>
                              <span className="text-lg">
                                ⚔️{card.damage + (battleResult.playerReward?.bonusType === 'damage' ? battleResult.playerReward.bonusAmount : 0)} 
                                {' '}❤️{card.health + (battleResult.playerReward?.bonusType === 'health' ? battleResult.playerReward.bonusAmount : 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <button
                    onClick={() => navigate("/player")}
                    className="bg-gray-600 hover:bg-gray-700 text-amber-100 px-8 py-3 rounded-xl transition-all border-2 border-gray-500 font-bold"
                  >
                    Fejlesztés Kihagyása
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Battle Preparation */}
      {!battleResult && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 ">
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-8 text-center">⚔️ Csata Előkészítése</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-bold text-xl text-amber-200 font-serif">🛡️ Válaszd ki a Harci Formációdat</h3>
              {playerDecks.length === 0 ? (
                <div className="p-8 rounded-2xl text-center bg-gray-700/30">
                  <p className="text-amber-300 mb-4 text-lg">Nincs elérhető formáció</p>
                  <button
                    onClick={() => setActiveTab('decks')}
                    className="bg-amber-600 hover:bg-amber-700 text-amber-100 px-6 py-3 rounded-xl transition-all border-2 border-amber-500 font-bold"
                  >
                    Kovácsold az Első Formációdat
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
                          : ' bg-gray-700/50 hover:border-amber-600'
                      }`}
                      onClick={() => setSelectedDeck(deck)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-amber-100 text-lg">{deck.name}</h4>
                          <p className="text-amber-300">{deck.cards.length} harcos</p>
                        </div>
                        {selectedDeck?._id === deck._id && (
                          <span className="bg-amber-600 text-amber-100 text-sm px-3 py-1 rounded-lg font-bold">Kiválasztva</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-xl text-amber-200 font-serif">🏰 Válaszd ki a Hódításodat</h3>
              {dungeons.length === 0 ? (
                <div className="p-8 border-4 border-dashed border-amber-500 rounded-2xl text-center bg-gray-700/30">
                  <p className="text-amber-300">Nincs elérhető kazamata a hódításhoz</p>
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
                          <p className="text-amber-400 text-sm">{dungeon.cards.length} őrző</p>
                        </div>
                        {selectedDungeon?._id === dungeon._id && (
                          <span className="bg-amber-600 text-amber-100 text-sm px-3 py-1 rounded-lg font-bold">Kiválasztva</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedDeck && selectedDungeon && (
            <div className=" mt-8 p-8 rounded-2xl border-4 border-">
              <h3 className="font-bold text-2xl text-amber-100 font-serif mb-6 text-center">🎯 Csata Előnézet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-blue-300 text-xl mb-4 font-serif">🛡️ A Formációd (Húzd és ejtsd)</h4>
                  <p className="text-amber-300 text-sm mb-3"></p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={previewDeckCards.map(c => c._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {previewDeckCards.map((card, index) => (
                          <SortableCard
                            key={card._id}
                            card={card}
                            index={index}
                            getTypeColor={getTypeColor}
                            getTypeEmoji={getTypeEmoji}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
                <div>
                  <h4 className="font-bold text-red-300 text-xl mb-4 font-serif">🏰 Kazamata Őrzői</h4>
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
                  {selectedDeck.cards.length} vs {selectedDungeon.cards.length} harcos
                </div>
                <button
                  onClick={() => startBattle(previewDeckCards.map(card => card._id))}
                  disabled={!selectedDeck || !selectedDungeon || ![1, 4, 6].includes(previewDeckCards.length) || previewDeckCards.length !== selectedDungeon.cards.length}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-amber-100 py-4 px-12 rounded-2xl disabled:bg-gray-600 transition-all text-xl font-bold border-2 border-red-500 shadow-2xl"
                >
                  ⚔️ CSATA KEZDÉSE! ⚔️
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Battle Results */}
      {battleResult && (
        <div ref={resultsRef} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
          <h2 className="text-2xl font-bold text-amber-100 font-serif mb-8 text-center">🏆 Csata Eredmények</h2>
          
          <div className={`p-8 rounded-2xl mb-8 text-center border-4 ${
            battleResult.playerWins 
              ? 'bg-gradient-to-r from-green-800 to-emerald-900 border-green-600' 
              : 'bg-gradient-to-r from-red-800 to-pink-900 border-red-600'
          }`}>
            <div className="text-3xl font-bold mb-4">
              {battleResult.playerWins ? '🎉 DICSŐSÉGES GYŐZELEM! 🎉' : '💀 BÁTORSÁGOS VERESÉG! 💀'}
            </div>
            <div className="text-xl text-amber-100">
              {battleResult.rounds.filter(r => r.playerWins).length} ütközetet nyertél {battleResult.rounds.length}-ből
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <h3 className="font-bold text-2xl text-amber-200 font-serif text-center">📜 Csata Ütközetei</h3>
            {battleResult.rounds.map((round: BattleRound, index: number) => (
              <div key={index} className="border-2 border-amber-500 rounded-2xl p-6 bg-gray-700/50">
                <div className="text-lg font-bold mb-4 text-center bg-amber-900/30 py-3 rounded-xl text-amber-100">
                  Ütközet {index + 1}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="text-center p-4 bg-gray-600 rounded-xl border-2 border-blue-500">
                    <div className="font-bold text-blue-300 text-lg">{round.playerCard.name}</div>
                    <div className="mt-3 space-y-2">
                      <div>⚔️ Erő: {round.playerCard.damage}</div>
                      <div>❤️ Élet: {round.playerCard.health}</div>
                      <div className={`px-3 py-1 rounded-lg font-bold inline-block ${getTypeColor(round.playerCard.type)}`}>
                        {getTypeEmoji(round.playerCard.type)} {round.playerCard.type}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center flex items-center justify-center">
                    <div className={`px-6 py-3 rounded-full font-bold text-lg border-2 ${
                      round.playerWins 
                        ? 'bg-green-800 text-amber-100 border-green-600' 
                        : 'bg-red-800 text-amber-100 border-red-600'
                    }`}>
                      {round.playerWins ? '✅ GYŐZELEM' : '❌ VERESÉG'}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-600 rounded-xl border-2 border-red-500">
                    <div className="font-bold text-red-300 text-lg">{round.dungeonCard.name}</div>
                    <div className="mt-3 space-y-2">
                      <div>⚔️ Erő: {round.dungeonCard.damage}</div>
                      <div>❤️ Élet: {round.dungeonCard.health}</div>
                      <div className={`px-3 py-1 rounded-lg font-bold inline-block ${getTypeColor(round.dungeonCard.type)}`}>
                        {getTypeEmoji(round.dungeonCard.type)} {round.dungeonCard.type}
                      </div>
                      {round.dungeonCard.isLeader && (
                        <div className="bg-yellow-700 text-amber-100 text-sm px-2 py-1 rounded-lg mt-2 font-bold">
                          👑 Őrző Parancsnok
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

          {battleResult.playerWins && battleResult.playerReward && (
            <div className="mt-8 p-8 bg-gradient-to-r from-yellow-800 to-orange-900 rounded-2xl border-4 border-yellow-600">
              <h3 className="font-bold text-2xl text-amber-100 font-serif mb-6 text-center">⚜️ Győzelmi Zsákmány!</h3>
              <p className="text-center mb-6 text-amber-200 text-lg">
                Kerestél <span className="font-bold text-yellow-300">+{battleResult.playerReward.bonusAmount} {battleResult.playerReward.bonusType === 'damage' ? 'sebzés' : 'életerő'}</span>!
                Ruházd ezt az áldást egy harcosodra:
              </p>
              {allGameCards.length === 0 ? (
                <div className="text-center p-8 bg-gray-700/50 rounded-xl border-2 border-yellow-500">
                  <p className="text-amber-300 text-lg mb-4">Nincs elérhető harcos a fejlesztéshez</p>
                  <p className="text-amber-400 text-sm">A Game Master-eknek először kártyákat kell létrehozniuk!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                  {allGameCards.map((card: WorldCard) => (
                    <button
                      key={card._id}
                      onClick={() => handleApplyReward(card._id)}
                      className="p-4 border-2 border-yellow-500 rounded-xl text-left bg-gray-700 hover:bg-yellow-900/30 transition-all"
                    >
                      <div className="font-bold text-amber-100 text-lg">{card.name}</div>
                      <div className="text-amber-300 text-sm mt-2">
                        Jelenleg: ⚔️{card.damage} ❤️{card.health}
                      </div>
                      <div className="text-green-300 font-bold text-sm mt-2">
                        Utána: ⚔️{card.damage + (battleResult.playerReward?.bonusType === 'damage' ? battleResult.playerReward.bonusAmount : 0)} ❤️{card.health + (battleResult.playerReward?.bonusType === 'health' ? battleResult.playerReward.bonusAmount : 0)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-center space-x-6">
            {battleResult.playerWins && battleResult.playerReward && !showUpgradePage && (
              <button
                onClick={() => setShowUpgradePage(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-yellow-500 font-bold text-lg"
              >
                ⚜️ Jutalom Igénylése
              </button>
            )}
            <button
              onClick={() => {
                setBattleResult(null);
                setShowUpgradePage(false);
                setSelectedDeck(null);
                setSelectedDungeon(null);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-gray-500 font-bold text-lg"
            >
              🔄 Újra Csata
            </button>
            <button
              onClick={() => {
                setShowUpgradePage(false);
                setActiveTab('decks');
              }}
              className="bg-amber-600 hover:bg-amber-700 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-amber-500 font-bold text-lg"
            >
              🛡️ Új Formáció Kovácsolása
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BattlefieldTab 