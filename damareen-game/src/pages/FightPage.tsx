// src/pages/FightPage.tsx - COMPLETE VERSION WITH FULL UI
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
  const [activeTab, setActiveTab] = useState<'decks' | 'battle' | 'collection'>('decks')
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
      
      const [decksRes, collectionsRes, dungeonsRes] = await Promise.all([
        apiService.getPlayerDecks(),
        apiService.getPlayerCollections(),
        apiService.getPlayerDungeons(),
      ])
      
      setPlayerDecks(decksRes.decks || [])
      setDungeons(dungeonsRes.dungeons || [])
      setCollections(collectionsRes.collections || [])
      
      const allCards: WorldCard[] = collectionsRes.collections?.flatMap(col => col.cards) || []
      setAvailableCards(allCards)
      
      console.log('✅ Loaded:', {
        decks: decksRes.decks?.length || 0,
        dungeons: dungeonsRes.dungeons?.length || 0,
        collections: collectionsRes.collections?.length || 0,
        availableCards: allCards.length
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
      setMessage('🎉 Deck created successfully!')
      setNewDeckName('')
      setSelectedCardsForDeck([])
      await loadData()
      setIsCreatingDeck(false)
      setActiveTab('battle')
    } catch (error: any) {
      setMessage('❌ Error creating deck: ' + (error.response?.data?.message || error.message))
      setIsCreatingDeck(false)
    }
  }

  const startBattle = async (): Promise<void> => {
    if (!selectedDeck || !selectedDungeon) {
      setMessage('Please select both a deck and a dungeon')
      return
    }

    if (selectedDeck.cards.length !== selectedDungeon.cards.length) {
      setMessage(`❌ Deck must have exactly ${selectedDungeon.cards.length} cards for this dungeon`)
      return
    }

    setLoading(true)
    try {
      const battleRes = await apiService.startBattle(selectedDeck._id, selectedDungeon._id)
      setBattleResult(battleRes.result)
      setMessage(battleRes.message)
      setActiveTab('battle')
    } catch (error: any) {
      setMessage('❌ Error starting battle: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const applyReward = async (cardId: string): Promise<void> => {
    if (!battleResult?.playerWins || !battleResult.playerReward) return

    try {
      const collectionId = collections[0]?._id
      if (!collectionId) {
        setMessage('No collection found')
        return
      }

      await apiService.updateCollectionCard(
        collectionId,
        cardId,
        battleResult.playerReward.bonusType,
        battleResult.playerReward.bonusAmount
      )
      setMessage('🎁 Reward applied successfully!')
      await loadData()
    } catch (error: any) {
      setMessage('❌ Error applying reward: ' + (error.response?.data?.message || error.message))
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
      case 'tűz': return 'bg-red-100 text-red-800 border-red-300'
      case 'víz': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'föld': return 'bg-green-100 text-green-800 border-green-300'
      case 'levegő': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTypeEmoji = (type: string): string => {
    switch (type) {
      case 'tűz': return '🔥'
      case 'víz': return '💧'
      case 'föld': return '🌍'
      case 'levegő': return '💨'
      default: return '❓'
    }
  }

  const getDungeonColor = (type: string): string => {
    switch (type) {
      case 'Egyszerű találkozás': return 'bg-green-50 border-green-200'
      case 'Kis kazamata': return 'bg-yellow-50 border-yellow-200'
      case 'Nagy kazamata': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">⚔️ Fight Arena</h1>
              <p className="text-gray-600">Welcome, {user.username}!</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = '/player'}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← Dashboard
              </button>
              {collections.length === 0 && (
                <button
                  onClick={async () => {
                    try {
                      const result = await apiService.initializeStarterData();
                      setMessage(result.message);
                      await loadData();
                    } catch (error: any) {
                      setMessage('❌ Error: ' + (error.response?.data?.message || error.message));
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🎁 Get Starter Cards
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8">
            {[
              { id: 'decks' as const, label: `🃏 My Decks (${playerDecks.length})`, icon: '🃏' },
              { id: 'battle' as const, label: '⚔️ Battle', icon: '⚔️' },
              { id: 'collection' as const, label: `📚 Collection (${availableCards.length})`, icon: '📚' }
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
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('❌') 
              ? 'bg-red-100 text-red-800 border border-red-300'
              : message.includes('🎉') || message.includes('🎁')
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            <span className="ml-4 text-gray-600">Loading...</span>
          </div>
        ) : (
          <>
            {/* Decks Tab */}
            {activeTab === 'decks' && (
              <div className="space-y-6">
                {/* Create New Deck Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">🃏 Create New Deck</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deck Name</label>
                      <input
                        type="text"
                        value={newDeckName}
                        onChange={(e) => setNewDeckName(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        placeholder="Enter deck name..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Cards ({selectedCardsForDeck.length} selected)
                        {availableCards.length === 0 && (
                          <span className="text-orange-600 text-sm ml-2">
                            No cards available. Click "Get Starter Cards" above!
                          </span>
                        )}
                      </label>
                      <div className="border border-gray-300 rounded-md p-4 max-h-96 overflow-y-auto bg-gray-50">
                        {availableCards.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No cards available in your collection.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableCards.map((card: WorldCard) => (
                              <div
                                key={card._id}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedCardsForDeck.includes(card._id)
                                    ? 'border-violet-500 bg-violet-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                                onClick={() => toggleCardForDeck(card._id)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{card.name}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className={`px-2 py-1 rounded text-xs ${getTypeColor(card.type)}`}>
                                        {getTypeEmoji(card.type)} {card.type}
                                      </span>
                                      {card.isLeader && (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                          👑 Leader
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right text-sm">
                                    <div className="text-red-600">💥 {card.damage}</div>
                                    <div className="text-green-600">❤️ {card.health}</div>
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
                      className="w-full bg-violet-500 text-white py-3 px-4 rounded-md hover:bg-violet-600 disabled:bg-gray-400 transition-colors font-medium"
                    >
                      {isCreatingDeck ? 'Creating Deck...' : '🎯 Create Deck'}
                    </button>
                  </div>
                </div>

                {/* Existing Decks Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">My Decks</h2>
                    <span className="text-sm text-gray-500">
                      {playerDecks.length} deck{playerDecks.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {playerDecks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg mb-2">No decks created yet</p>
                      <p className="text-sm">Create your first deck above to start battling!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {playerDecks.map((deck: PlayerDeck) => (
                        <div 
                          key={deck._id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            selectedDeck?._id === deck._id 
                              ? 'border-violet-500 bg-violet-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-violet-300 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedDeck(deck)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-lg text-gray-900">{deck.name}</h3>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {deck.cards.length} cards
                            </span>
                          </div>
                          
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {deck.cards.map((card: WorldCard, index: number) => (
                              <div key={card._id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-500 w-4">{index + 1}.</span>
                                  <span className="font-medium">{card.name}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <span className="text-red-500">💥{card.damage}</span>
                                  <span className="mx-1">|</span>
                                  <span className="text-green-500">❤️{card.health}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {selectedDeck?._id === deck._id && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <span className="text-xs text-violet-600 font-medium">✓ Selected for battle</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Battle Tab */}
            {activeTab === 'battle' && (
              <div className="space-y-6">
                {/* Battle Setup */}
                {!battleResult && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-6">⚔️ Prepare for Battle</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Deck Selection */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-900">🎯 Select Your Deck</h3>
                        {playerDecks.length === 0 ? (
                          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                            <p className="text-gray-500 mb-3">No decks available</p>
                            <button
                              onClick={() => setActiveTab('decks')}
                              className="bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 transition-colors"
                            >
                              Create Your First Deck
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {playerDecks.map((deck: PlayerDeck) => (
                              <div
                                key={deck._id}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedDeck?._id === deck._id 
                                    ? 'border-violet-500 bg-violet-50 shadow-md' 
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                                onClick={() => setSelectedDeck(deck)}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-semibold">{deck.name}</h4>
                                    <p className="text-sm text-gray-600">{deck.cards.length} cards</p>
                                  </div>
                                  {selectedDeck?._id === deck._id && (
                                    <span className="bg-violet-500 text-white text-xs px-2 py-1 rounded">Selected</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Dungeon Selection */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-900">🏰 Select Dungeon</h3>
                        {dungeons.length === 0 ? (
                          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                            <p className="text-gray-500">No dungeons available</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {dungeons.map((dungeon: Dungeon) => (
                              <div
                                key={dungeon._id}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedDungeon?._id === dungeon._id 
                                    ? 'border-violet-500 bg-violet-50 shadow-md' 
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                } ${getDungeonColor(dungeon.type)}`}
                                onClick={() => setSelectedDungeon(dungeon)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold">{dungeon.name}</h4>
                                    <p className="text-sm text-gray-600 capitalize">{dungeon.type}</p>
                                    <p className="text-xs text-gray-500">{dungeon.cards.length} cards</p>
                                  </div>
                                  {selectedDungeon?._id === dungeon._id && (
                                    <span className="bg-violet-500 text-white text-xs px-2 py-1 rounded">Selected</span>
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
                      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-lg mb-4 text-center">🎮 Battle Preview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-blue-800 mb-3">🎯 Your Deck</h4>
                            <div className="space-y-2">
                              {selectedDeck.cards.map((card: WorldCard, index: number) => (
                                <div key={card._id} className="flex justify-between items-center p-2 bg-white rounded border">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 w-4">{index + 1}.</span>
                                    <span className="font-medium text-sm">{card.name}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    <span className={`px-1 rounded ${getTypeColor(card.type)}`}>
                                      {getTypeEmoji(card.type)}
                                    </span>
                                    <span className="mx-1 text-red-500">💥{card.damage}</span>
                                    <span className="text-green-500">❤️{card.health}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-red-800 mb-3">🏰 Dungeon</h4>
                            <div className="space-y-2">
                              {selectedDungeon.cards.map((card: WorldCard, index: number) => (
                                <div key={card._id} className="flex justify-between items-center p-2 bg-white rounded border">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 w-4">{index + 1}.</span>
                                    <span className="font-medium text-sm">{card.name}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    <span className={`px-1 rounded ${getTypeColor(card.type)}`}>
                                      {getTypeEmoji(card.type)}
                                    </span>
                                    <span className="mx-1 text-red-500">💥{card.damage}</span>
                                    <span className="text-green-500">❤️{card.health}</span>
                                    {card.isLeader && (
                                      <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-1 rounded">👑</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-center">
                          <div className="text-sm text-gray-600 mb-3">
                            {selectedDeck.cards.length} vs {selectedDungeon.cards.length} cards
                          </div>
                          <button
                            onClick={startBattle}
                            disabled={!selectedDeck || !selectedDungeon || selectedDeck.cards.length !== selectedDungeon.cards.length}
                            className="bg-red-500 hover:bg-red-600 text-white py-3 px-8 rounded-lg disabled:bg-gray-400 transition-colors text-lg font-bold shadow-lg"
                          >
                            ⚔️ START BATTLE! ⚔️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Battle Results */}
                {battleResult && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-6">🏆 Battle Results</h2>
                    
                    {/* Overall Result */}
                    <div className={`p-6 rounded-lg mb-8 text-center ${
                      battleResult.playerWins 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200' 
                        : 'bg-gradient-to-r from-red-50 to-pink-100 border-2 border-red-200'
                    }`}>
                      <div className="text-2xl font-bold mb-2">
                        {battleResult.playerWins ? '🎉 VICTORY! 🎉' : '💀 DEFEAT! 💀'}
                      </div>
                      <div className="text-lg">
                        You won {battleResult.rounds.filter(r => r.playerWins).length} out of {battleResult.rounds.length} rounds
                      </div>
                    </div>

                    {/* Round Details */}
                    <div className="space-y-4 mb-8">
                      <h3 className="font-semibold text-lg">📊 Battle Rounds</h3>
                      {battleResult.rounds.map((round: BattleRound, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="text-sm font-medium mb-3 text-center bg-white py-1 rounded">
                            Round {index + 1}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {/* Player Card */}
                            <div className="text-center p-3 bg-white rounded border">
                              <div className="font-semibold text-blue-600">{round.playerCard.name}</div>
                              <div className="mt-2 space-y-1">
                                <div>💥 Damage: {round.playerCard.damage}</div>
                                <div>❤️ Health: {round.playerCard.health}</div>
                                <div className={`px-2 py-1 rounded text-xs inline-block ${getTypeColor(round.playerCard.type)}`}>
                                  {getTypeEmoji(round.playerCard.type)} {round.playerCard.type}
                                </div>
                              </div>
                            </div>
                            
                            {/* Result */}
                            <div className="text-center flex items-center justify-center">
                              <div className={`px-4 py-2 rounded-full font-bold ${
                                round.playerWins 
                                  ? 'bg-green-100 text-green-800 border border-green-300' 
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}>
                                {round.playerWins ? '✅ WIN' : '❌ LOSE'}
                              </div>
                            </div>
                            
                            {/* Dungeon Card */}
                            <div className="text-center p-3 bg-white rounded border">
                              <div className="font-semibold text-red-600">{round.dungeonCard.name}</div>
                              <div className="mt-2 space-y-1">
                                <div>💥 Damage: {round.dungeonCard.damage}</div>
                                <div>❤️ Health: {round.dungeonCard.health}</div>
                                <div className={`px-2 py-1 rounded text-xs inline-block ${getTypeColor(round.dungeonCard.type)}`}>
                                  {getTypeEmoji(round.dungeonCard.type)} {round.dungeonCard.type}
                                </div>
                                {round.dungeonCard.isLeader && (
                                  <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                                    👑 Leader
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mt-3 text-center bg-white p-2 rounded">
                            🎯 {round.reason}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reward Section */}
                    {battleResult.playerWins && battleResult.playerReward && (
                      <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-100 rounded-lg border border-yellow-200">
                        <h3 className="font-semibold text-lg mb-4 text-center">🎁 Victory Reward!</h3>
                        <p className="text-center mb-4">
                          You earned <span className="font-bold">+{battleResult.playerReward.bonusAmount} {battleResult.playerReward.bonusType}</span>!
                          Choose a card to apply the reward to:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                          {availableCards.map((card: WorldCard) => (
                            <button
                              key={card._id}
                              onClick={() => applyReward(card._id)}
                              className="p-3 border border-gray-300 rounded-lg text-left bg-white hover:bg-yellow-50 transition-colors"
                            >
                              <div className="font-medium">{card.name}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                Current: 💥{card.damage} ❤️{card.health}
                              </div>
                              <div className="text-xs text-green-600 font-medium mt-1">
                                After: 💥{card.damage + (battleResult.playerReward?.bonusType === 'damage' ? battleResult.playerReward.bonusAmount : 0)} ❤️{card.health + (battleResult.playerReward?.bonusType === 'health' ? battleResult.playerReward.bonusAmount : 0)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex justify-center space-x-4">
                      <button
                        onClick={() => {
                          setBattleResult(null);
                          setSelectedDeck(null);
                          setSelectedDungeon(null);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        🔄 Battle Again
                      </button>
                      <button
                        onClick={() => setActiveTab('decks')}
                        className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        🃏 Build New Deck
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collection Tab */}
            {activeTab === 'collection' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">📚 My Collection</h2>
                  <span className="text-sm text-gray-500">
                    {availableCards.length} card{availableCards.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {availableCards.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🃏</div>
                    <p className="text-lg text-gray-600 mb-4">Your collection is empty</p>
                    <button
                      onClick={async () => {
                        try {
                          const result = await apiService.initializeStarterData();
                          setMessage(result.message);
                          await loadData();
                        } catch (error: any) {
                          setMessage('❌ Error: ' + (error.response?.data?.message || error.message));
                        }
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      🎁 Get Starter Cards
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {availableCards.map((card: WorldCard) => (
                      <div key={card._id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900">{card.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${getTypeColor(card.type)}`}>
                            {getTypeEmoji(card.type)} {card.type}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-red-600 font-medium">💥 Damage</span>
                            <span className="font-bold">{card.damage}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600 font-medium">❤️ Health</span>
                            <span className="font-bold">{card.health}</span>
                          </div>
                          
                          {card.boostType && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                              <div className="text-xs text-blue-800 font-medium">
                                ⚡ {card.boostType === 'damage' ? '2× Damage' : '2× Health'}
                              </div>
                            </div>
                          )}
                          
                          {card.isLeader && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                              <div className="text-xs text-yellow-800 font-medium flex items-center">
                                👑 Leader Card
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
          </>
        )}
      </main>
    </div>
  )
}

export default FightPage