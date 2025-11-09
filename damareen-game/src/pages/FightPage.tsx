/* eslint-disable @typescript-eslint/no-explicit-any */
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
import AboutTab from './about'

const FightPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as 'decks' | 'battle' | 'collection' | 'allcards' | null
  const [activeTab, setActiveTab] = useState<'decks' | 'battle' | 'collection' | 'allcards'| 'about'>(
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
        window.location.href = '/login'
      }
    }
  }, [])

  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'decks' | 'battle' | 'collection' | 'allcards' | null
    if (tabParam && ['decks', 'battle', 'collection', 'allcards'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const handleTabChange = (tab: 'decks' | 'battle' | 'collection' | 'allcards'| 'about') => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const loadData = async (): Promise<void> => {
    setLoading(true)
    setMessage('')
    try {
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

      const baseCards: WorldCard[] = (allCardsRes.cards || []).filter(card => 
        !card.isLeader && !card.originalCard
      )

      setAvailableCards(baseCards)

    } catch (error: any) {
      setMessage('Nem sikerült betölteni a játékadatokat: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const createDeck = async (): Promise<void> => {
    if (!newDeckName.trim() || selectedCardsForDeck.length === 0) {
      setMessage('Kérlek add meg a formáció nevét és válassz kártyákat')
      return
    }

    try {
      setIsCreatingDeck(true)
      await apiService.createPlayerDeck({
        name: newDeckName,
        cardIds: selectedCardsForDeck
      })
      setMessage('🎉 Formáció sikeresen kovácsolva!')
      setNewDeckName('')
      setSelectedCardsForDeck([])
      await loadData()
      setIsCreatingDeck(false)
      handleTabChange('battle')
    } catch (error: any) {
      setMessage('❌ Hiba a formáció kovácsolásakor: ' + (error.response?.data?.message || error.message))
      setIsCreatingDeck(false)
    }
  }

  const startBattle = async (cardOrder?: string[]): Promise<void> => {
    if (!selectedDeck || !selectedDungeon) {
      setMessage('Kérlek válassz egy harci formációt és egy kazamatát')
      return
    }

    const validCounts = [1, 4, 6]
    if (!validCounts.includes(selectedDeck.cards.length) || selectedDeck.cards.length !== selectedDungeon.cards.length) {
      setMessage(`❌ A harci formációnak és a kazamatának pontosan 1, 4 vagy 6 harcost kell tartalmaznia. Jelenleg: ${selectedDeck.cards.length} vs ${selectedDungeon.cards.length}`)
      return
    }

    setLoading(true)
    try {
      const battleRes = await apiService.startBattle(selectedDeck._id, selectedDungeon._id, cardOrder)
      setBattleResult(battleRes.result)
      setMessage(battleRes.message)
      handleTabChange('battle')
    } catch (error: any) {
      setMessage('❌ Hiba a csata kezdésekor: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const applyReward = async (cardId: string): Promise<void> => {
    if (!battleResult?.playerWins || !battleResult.playerReward) return

    try {
      setLoading(true);

      const result = await apiService.applyReward(
        cardId,
        battleResult.playerReward.bonusType,
        battleResult.playerReward.bonusAmount
      );

      setMessage('⚜️ ' + result.message);

      setTimeout(() => {
        window.location.href = '/player';
      }, 1000);

    } catch (error: any) {
      setMessage('❌ Hiba a jutalom odaítélésénél: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
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
          <p className="text-amber-800 font-serif text-lg">Csatamező előkészítése...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[url('/assets/paper-1074131_1280.png')] bg-cover bg-center">
      <header className="bg-gradient-to-r from-amber-800 to-amber-900 shadow-2xl border-b-4 border-amber-600">
        <div className="max-w-1xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-amber-100 font-serif tracking-wider">⚔️ Nagy Csatamező</h1>
              <p className="text-amber-200 font-medium mt-2">
                Üdvözöllek, {user.username}! Harcosok: {allGameCards.length} | Kazamaták: {allGameDungeons.length}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/player'}
                className="bg-blue-700 hover:bg-blue-800 text-amber-100 px-6 py-3 rounded-xl transition-all border-2 border-blue-600 font-bold shadow-lg"
              >
                🏰 Vissza a Várba
              </button>
              {collections.length === 0 && (
                <button
                  onClick={async () => {
                    try {
                      const result = await apiService.initializeStarterData();
                      setMessage(result.message);
                      await loadData();
                    } catch (error: any) {
                      setMessage('❌ Királyi Rendelkezés Hiba: ' + (error.response?.data?.message || error.message));
                    }
                  }}
                  className="bg-orange-700 hover:bg-orange-800 text-amber-100 px-6 py-3 rounded-xl transition-all border-2 border-orange-600 font-bold shadow-lg"
                >
                  ⚜️ Kezdő Harcosok Idézése
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      
      <div className="bg-gradient-to-r from-amber-700 to-amber-800">
        <div className="max-w-1xl mx-auto">
          <nav className="flex justify-center space-x-6">
            {[
              { id: 'decks' as const, label: ` Harci Formációk (${playerDecks.length})`, icon: '🛡️' },
              { id: 'battle' as const, label: ' Csatamező', icon: '⚔️' },
              { id: 'collection' as const, label: ` Királyi Archívum (${availableCards.length})`, icon: '📜' },
              { id: 'allcards' as const, label: ` Királyság Története (${allGameCards.length})`, icon: '🏰' },
              { id: 'about' as const, label: ' Névjegy', icon: '📖' }
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
            <span className="ml-4 text-amber-800 font-serif text-lg">Háborús tanács konzultálása...</span>
          </div>
        ) : (
          <>
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
                allGameCards={allGameCards}
                setActiveTab={handleTabChange}
                getTypeColor={getTypeColor}
                getTypeEmoji={getTypeEmoji}
                getDungeonColor={getDungeonColor}
                getCardRarityColor={getCardRarityColor}
              />
            )}

            {activeTab === 'collection' && (
              <RoyalArchivesTab
                availableCards={availableCards}
                loadData={loadData}
                getTypeColor={getTypeColor}
                getTypeEmoji={getTypeEmoji}
                getCardRarityColor={getCardRarityColor}
                setMessage={setMessage}
              />
            )}

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

            {activeTab === 'about' && (
              <AboutTab version="1.0.0" />
            )}
          </>
        )}
      </main>

    </div>
  )
}

export default FightPage