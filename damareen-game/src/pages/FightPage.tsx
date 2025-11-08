// src/pages/FightPage.tsx - MEDIEVAL STYLE WITH ALL CARDS
import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import type { 
  WorldCard, 
  Dungeon, 
  PlayerDeck, 
  PlayerCollection, 
  BattleResult, 
  BattleRound 
} from '../types/game'
import type { User } from '../types/auth'

const FightPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'decks' | 'battle' | 'collection' | 'allcards'>('decks')
  const [playerDecks, setPlayerDecks] = useState<PlayerDeck[]>([])
  const [dungeons, setDungeons] = useState<Dungeon[]>([])
  const [collections, setCollections] = useState<PlayerCollection[]>([])
  const [selectedDeck, setSelectedDeck] = useState<PlayerDeck | null>(null)
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null)
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [message, setMessage] = useState<string>('')
  const [newDeckName, setNewDeckName] = useState<string>('')
  const [selectedCardsForDeck, setSelectedCardsForDeck] = useState<string[]>([])
  const [availableCards, setAvailableCards] = useState<WorldCard[]>([])
  const [isCreatingDeck, setIsCreatingDeck] = useState<boolean>(false)
  const [allGameCards, setAllGameCards] = useState<WorldCard[]>([])
  const [allGameDungeons, setAllGameDungeons] = useState<Dungeon[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token) {
      window.location.href = '/login'
      return
    }

    if (userStr) {
      try {
        const userData: User = JSON.parse(userStr)
        setUser(userData)
        loadData()
      } catch (error) {
        console.error('Error parsing user data:', error)
        window.location.href = '/login'
      }
    }
  }, [])

  const loadData = async (): Promise<void> => {
    setLoading(true)
    setMessage('')
    try {
      console.log('🔄 Loading fight page data...')
      
      const [decksRes, collectionsRes, dungeonsRes, allCardsRes, allDungeonsRes] = await Promise.all([
        apiService.getPlayerDecks(),
        apiService.getPlayerCollections(),
        apiService.getPlayerDungeons(),
        apiService.getAllCards(),
        apiService.getAllDungeons()
      ])
      
      setPlayerDecks(decksRes.decks || [])
      setDungeons(dungeonsRes.dungeons || [])
      setCollections(collectionsRes.collections || [])
      setAllGameCards(allCardsRes.cards || [])
      setAllGameDungeons(allDungeonsRes.dungeons || [])
      
      // Make sure we're properly extracting cards from collections
      const playerCards: WorldCard[] = collectionsRes.collections?.flatMap(col => col.cards) || []
      console.log('🃏 Player cards loaded:', playerCards.length);
      console.log('🃏 Sample cards after load:', playerCards.slice(0, 3).map(c => ({name: c.name, damage: c.damage, health: c.health})));
      
      setAvailableCards(playerCards)
      
      console.log('✅ Loaded:', {
        decks: decksRes.decks?.length || 0,
        dungeons: dungeonsRes.dungeons?.length || 0,
        collections: collectionsRes.collections?.length || 0,
        availableCards: playerCards.length,
        allGameCards: allCardsRes.cards?.length || 0,
        allGameDungeons: allDungeonsRes.dungeons?.length || 0
      })
      
    } catch (error: any) {
      console.error('❌ Error loading data:', error)
      setMessage('Failed to load game data: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const createDeck = async (): Promise<void> => {
    if (!newDeckName.trim() || selectedCardsForDeck.length === 0) {
      setMessage('Please enter a deck name and select cards')
      return
    }

    try {
      setIsCreatingDeck(true)
      await apiService.createPlayerDeck({
        name: newDeckName,
        cardIds: selectedCardsForDeck
      })
      setMessage('🎉 Deck forged successfully!')
      setNewDeckName('')
      setSelectedCardsForDeck([])
      await loadData()
      setIsCreatingDeck(false)
      setActiveTab('battle')
    } catch (error: any) {
      setMessage('❌ Error forging deck: ' + (error.response?.data?.message || error.message))
      setIsCreatingDeck(false)
    }
  }

  const startBattle = async (): Promise<void> => {
    if (!selectedDeck || !selectedDungeon) {
      setMessage('Please select both a war formation and a dungeon')
      return
    }

    if (selectedDeck.cards.length !== selectedDungeon.cards.length) {
      setMessage(`❌ War formation must have exactly ${selectedDungeon.cards.length} warriors for this dungeon`)
      return
    }

    setLoading(true)
    try {
      const battleRes = await apiService.startBattle(selectedDeck._id, selectedDungeon._id)
      setBattleResult(battleRes.result)
      setMessage(battleRes.message)
      setActiveTab('battle')
    } catch (error: any) {
      setMessage('❌ Error commencing battle: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const applyReward = async (cardId: string): Promise<void> => {
    if (!battleResult?.playerWins || !battleResult.playerReward) return

    try {
      setLoading(true);
      console.log('🔄 Applying reward to card:', cardId);
      console.log('🎁 Reward details:', battleResult.playerReward);
      console.log('📊 Available cards BEFORE reward:', availableCards.map(c => ({name: c.name, damage: c.damage, health: c.health})));
      
      const result = await apiService.applyReward(
        cardId,
        battleResult.playerReward.bonusType,
        battleResult.playerReward.bonusAmount
      );
      
      console.log('✅ Reward API response:', result);
      setMessage('⚜️ ' + result.message);
      
      // Force reload the data to see updates
      console.log('🔄 Reloading data after reward...');
      await loadData();
      
      // Also log the current available cards to see if they updated
      console.log('📊 Available cards AFTER reward:', availableCards.map(c => ({name: c.name, damage: c.damage, health: c.health})));
      
    } catch (error: any) {
      console.error('❌ Error applying reward:', error);
      setMessage('❌ Error bestowing reward: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }

  const toggleCardForDeck = (cardId: string): void => {
    setSelectedCardsForDeck(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'tűz': return 'bg-red-800 text-amber-100 border-red-600'
      case 'víz': return 'bg-blue-800 text-amber-100 border-blue-600'
      case 'föld': return 'bg-green-800 text-amber-100 border-green-600'
      case 'levegő': return 'bg-gray-700 text-amber-100 border-gray-500'
      default: return 'bg-gray-700 text-amber-100 border-gray-500'
    }
  }

  const getTypeEmoji = (type: string): string => {
    switch (type) {
      case 'tűz': return '🔥'
      case 'víz': return '💧'
      case 'föld': return '🌍'
      case 'levegő': return '💨'
      default: return '⚔️'
    }
  }

  const getDungeonColor = (type: string): string => {
    switch (type) {
      case 'Egyszerű találkozás': return 'bg-green-800 text-amber-100 border-green-600'
      case 'Kis kazamata': return 'bg-yellow-800 text-amber-100 border-yellow-600'
      case 'Nagy kazamata': return 'bg-red-800 text-amber-100 border-red-600'
      default: return 'bg-gray-700 text-amber-100 border-gray-500'
    }
  }

  const getCardRarityColor = (card: WorldCard): string => {
    if (card.isLeader) return 'bg-gradient-to-br from-yellow-600 to-amber-700'
    if (card.boostType) return 'bg-gradient-to-br from-purple-700 to-purple-800'
    return 'bg-gradient-to-br from-gray-700 to-gray-800'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-serif text-lg">Preparing the battlefield...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      {/* Medieval Header */}
      <header className="bg-gradient-to-r from-amber-800 to-amber-900 shadow-2xl border-b-4 border-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-amber-100 font-serif tracking-wider">⚔️ Grand Battle Arena</h1>
              <p className="text-amber-200 font-medium mt-2">
                Hail, {user.username}! Warriors: {allGameCards.length} | Dungeons: {allGameDungeons.length}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/player'}
                className="bg-blue-700 hover:bg-blue-800 text-amber-100 px-6 py-3 rounded-xl transition-all border-2 border-blue-600 font-bold shadow-lg"
              >
                🏰 Return to Keep
              </button>
              {collections.length === 0 && (
                <button
                  onClick={async () => {
                    try {
                      const result = await apiService.initializeStarterData();
                      setMessage(result.message);
                      await loadData();
                    } catch (error: any) {
                      setMessage('❌ Royal Decree Error: ' + (error.response?.data?.message || error.message));
                    }
                  }}
                  className="bg-orange-700 hover:bg-orange-800 text-amber-100 px-6 py-3 rounded-xl transition-all border-2 border-orange-600 font-bold shadow-lg"
                >
                  ⚜️ Summon Starter Warriors
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Medieval Navigation Tabs */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-800 border-b-4 border-amber-600">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8">
            {[
              { id: 'decks' as const, label: `🛡️ War Formations (${playerDecks.length})`, icon: '🛡️' },
              { id: 'battle' as const, label: '⚔️ Battlefield', icon: '⚔️' },
              { id: 'collection' as const, label: `📜 Royal Archives (${availableCards.length})`, icon: '📜' },
              { id: 'allcards' as const, label: `🏰 Kingdom Lore (${allGameCards.length})`, icon: '🏰' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-5 px-3 border-b-4 font-bold text-lg font-serif transition-all ${
                  activeTab === tab.id
                    ? 'border-amber-300 text-amber-100 bg-amber-900/50'
                    : 'border-transparent text-amber-200 hover:text-amber-100 hover:border-amber-400'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 font-bold text-center ${
            message.includes('❌') 
              ? 'bg-red-800 text-amber-100 border-red-600' 
              : message.includes('🎉') || message.includes('⚜️')
              ? 'bg-green-800 text-amber-100 border-green-600'
              : 'bg-blue-800 text-amber-100 border-blue-600'
          }`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
            <span className="ml-4 text-amber-800 font-serif text-lg">Consulting the war council...</span>
          </div>
        ) : (
          <>
            {/* War Formations Tab */}
            {activeTab === 'decks' && (
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
                            No warriors available. Summon starter warriors above!
                          </span>
                        )}
                      </label>
                      <div className="border-2 border-amber-500 rounded-xl p-6 max-h-96 overflow-y-auto bg-gray-700/50">
                        {availableCards.length === 0 ? (
                          <div className="text-center py-12 text-amber-300">
                            <p className="text-xl mb-4">No warriors in your ranks</p>
                            <p className="text-lg">Summon your first warriors to begin your conquest!</p>
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
            )}

            {/* Battlefield Tab */}
            {activeTab === 'battle' && (
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
            )}

            {/* Royal Archives Tab */}
            {activeTab === 'collection' && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-4 border-amber-600">
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
                      onClick={async () => {
                        try {
                          const result = await apiService.initializeStarterData();
                          setMessage(result.message);
                          await loadData();
                        } catch (error: any) {
                          setMessage('❌ Royal Decree Error: ' + (error.response?.data?.message || error.message));
                        }
                      }}
                      className="bg-orange-700 hover:bg-orange-800 text-amber-100 px-8 py-4 rounded-xl transition-all border-2 border-orange-600 font-bold text-lg"
                    >
                      ⚜️ Summon Starter Warriors
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {availableCards.map((card: WorldCard) => (
                      <div key={card._id} className={`border-2 rounded-2xl p-5 transition-all transform hover:scale-105 ${getCardRarityColor(card)} border-amber-500 hover:shadow-2xl`}>
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
            )}

            {/* Kingdom Lore Tab */}
            {activeTab === 'allcards' && (
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
            )}
          </>
        )}
      </main>

      {/* Medieval Footer */}
      <footer className="bg-gradient-to-r from-amber-900 to-amber-800 border-t-4 border-amber-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-amber-200">
            <p className="font-serif text-lg">© 2024 Royal Card Battle Arena - All rights reserved by royal decree</p>
            <p className="text-amber-300 mt-2 font-bold">May your sword stay sharp and your formations stay mighty!</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default FightPage