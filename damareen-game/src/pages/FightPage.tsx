// src/pages/FightPage.tsx - REFACTORED WITH COMPONENTS
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import Asd from '../pages/asd'
import BattlefieldTab from '../pages/BattlefieldTab'
import RoyalArchivesTab from '../pages/RoyalArchivesTab'
import KingdomLoreTab from '../pages/KingdomLoreTab'

const FightPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as 'decks' | 'battle' | 'collection' | 'allcards' | null
  const [activeTab, setActiveTab] = useState<'decks' | 'battle' | 'collection' | 'allcards'>(
    tabParam && ['decks', 'battle', 'collection', 'allcards'].includes(tabParam) ? tabParam : 'decks'
  )
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

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'decks' | 'battle' | 'collection' | 'allcards' | null
    if (tabParam && ['decks', 'battle', 'collection', 'allcards'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Update URL when active tab changes (but only if it's a valid tab)
  const handleTabChange = (tab: 'decks' | 'battle' | 'collection' | 'allcards') => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

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

      // Get all unique cards from player decks (since PlayerCollection was dropped)
      const allDeckCards: WorldCard[] = (decksRes.decks || []).flatMap(deck => deck.cards || [])
      // Remove duplicates by card _id
      const uniqueCardsMap = new Map<string, WorldCard>()
      allDeckCards.forEach(card => {
        if (card._id && !uniqueCardsMap.has(card._id)) {
          uniqueCardsMap.set(card._id, card)
        }
      })
      const playerCards: WorldCard[] = Array.from(uniqueCardsMap.values())
      console.log('🃏 Player cards loaded from decks:', playerCards.length);

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
      handleTabChange('battle')
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
      handleTabChange('battle')
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

      const result = await apiService.applyReward(
        cardId,
        battleResult.playerReward.bonusType,
        battleResult.playerReward.bonusAmount
      );

      console.log('✅ Reward API response:', result);
      setMessage('⚜️ ' + result.message);

      // Redirect to player dashboard after successful upgrade to prevent multiple upgrades
      setTimeout(() => {
        window.location.href = '/player';
      }, 1000); // Small delay to show the success message

    } catch (error: any) {
      console.error('❌ Error applying reward:', error);
      setMessage('❌ Error bestowing reward: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  }

  // Helper functions
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
              { id: 'decks' as const, label: ` War Formations (${playerDecks.length})`, icon: '🛡️' },
              { id: 'battle' as const, label: ' Battlefield', icon: '⚔️' },
              { id: 'collection' as const, label: ` Royal Archives (${availableCards.length})`, icon: '📜' },
              { id: 'allcards' as const, label: ` Kingdom Lore (${allGameCards.length})`, icon: '🏰' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-5 px-3 border-b-4 font-bold text-lg font-serif transition-all ${activeTab === tab.id
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
          <div className={`mb-6 p-4 rounded-xl border-2 font-bold text-center ${message.includes('❌')
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
              <Asd
                playerDecks={playerDecks}
                availableCards={availableCards}
                selectedDeck={selectedDeck}
                setSelectedDeck={setSelectedDeck}
                newDeckName={newDeckName}
                setNewDeckName={setNewDeckName}
                selectedCardsForDeck={selectedCardsForDeck}
                setSelectedCardsForDeck={setSelectedCardsForDeck}
                isCreatingDeck={isCreatingDeck}
                createDeck={createDeck}
                getTypeColor={getTypeColor}
                getTypeEmoji={getTypeEmoji}
                getCardRarityColor={getCardRarityColor}
              />
            )}

            {/* Battlefield Tab */}
            {activeTab === 'battle' && (
              <BattlefieldTab
                playerDecks={playerDecks}
                dungeons={dungeons}
                selectedDeck={selectedDeck}
                setSelectedDeck={setSelectedDeck}
                selectedDungeon={selectedDungeon}
                setSelectedDungeon={setSelectedDungeon}
                battleResult={battleResult}
                setBattleResult={setBattleResult}
                startBattle={startBattle}
                applyReward={applyReward}
                availableCards={availableCards}
                setActiveTab={handleTabChange}
                getTypeColor={getTypeColor}
                getTypeEmoji={getTypeEmoji}
                getDungeonColor={getDungeonColor}
                getCardRarityColor={getCardRarityColor}
              />
            )}

            {/* Royal Archives Tab */}
            {activeTab === 'collection' && (
              <RoyalArchivesTab
                availableCards={availableCards}
                loadData={loadData}
                getTypeColor={getTypeColor}
                getTypeEmoji={getTypeEmoji}
                getCardRarityColor={getCardRarityColor}
                setMessage={setMessage}  // Add this line
              />
            )}

            {/* Kingdom Lore Tab */}
            {activeTab === 'allcards' && (
              <KingdomLoreTab
                allGameCards={allGameCards}
                allGameDungeons={allGameDungeons}
                getTypeColor={getTypeColor}
                getTypeEmoji={getTypeEmoji}
                getDungeonColor={getDungeonColor}
                getCardRarityColor={getCardRarityColor}
              />
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