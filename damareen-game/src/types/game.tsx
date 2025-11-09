// src/types/game.ts
export interface WorldCard {
  _id: string
  name: string
  damage: number
  health: number
  type: 'föld' | 'levegő' | 'víz' | 'tűz'
  isLeader?: boolean
  originalCard?: string
  boostType?: 'damage' | 'health'
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WorldCardData {
  name: string
  damage: number
  health: number
  type: 'föld' | 'levegő' | 'víz' | 'tűz'
}

export interface LeaderCardData {
  originalCardId: string
  newName: string
  boostType: 'damage' | 'health'
}

export interface Dungeon {
  _id: string
  name: string
  type: 'Egyszerű' | 'Kis kazamata' | 'Nagy kazamata'
  cards: WorldCard[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DungeonData {
  name: string
  type: 'Egyszerű' | 'Kis kazamata' | 'Nagy kazamata'
  cardIds: string[]
}

export interface GameEnvironment {
  _id: string
  name: string
  worldCards: WorldCard[]
  dungeons: Dungeon[]
  starterCollection: WorldCard[]
  createdBy: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GameEnvironmentData {
  name: string
  worldCardIds: string[]
  dungeonIds: string[]
  starterCollectionIds: string[]
}

// Response types
export interface WorldCardsResponse {
  cards: WorldCard[]
}

export interface DungeonsResponse {
  dungeons: Dungeon[]
}

export interface GameEnvironmentsResponse {
  environments: GameEnvironment[]
}

export interface ApiResponse<T> {
  message: string
  data?: T
}
export interface PlayerDeck {
  _id: string
  name: string
  cards: WorldCard[]
  cardIds: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PlayerDeckData {
  name: string
  cardIds: string[]
}

export interface BattleResult {
  playerWins: boolean | null
  rounds: BattleRound[]
  totalRounds?: number
  currentRound?: number
  playerReward?: {
    cardId: string
    bonusType: 'damage' | 'health'
    bonusAmount: number
  }
}

export interface BattleRound {
  playerCard: WorldCard
  dungeonCard: WorldCard
  playerWins: boolean
  reason: string
  playerCardDamage: number
  dungeonCardDamage: number
}

export interface PlayerCollection {
  _id: string
  name: string
  cards: WorldCard[]
  createdBy: string
  createdAt: string
  updatedAt: string
}
export interface CreatePlayerDeckResponse {
  message: string
  deck: PlayerDeck
}

export interface PlayerDecksResponse {
  decks: PlayerDeck[]
}

export interface BattleResponse {
  message: string
  result: BattleResult
}

export interface PlayerCollectionsResponse {
  collections: PlayerCollection[]
}