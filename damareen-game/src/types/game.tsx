// World Card Types
export interface WorldCardData {
  name: string
  damage: number
  health: number
  type: 'föld' | 'levegő' | 'víz' | 'tűz'
  isLeader?: boolean
  originalCard?: string
  boostType?: 'damage' | 'health'
}

export interface WorldCard extends WorldCardData {
  _id: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WorldCardsResponse {
  cards: WorldCard[]
}

// Leader Card Types
export interface LeaderCardData {
  originalCardId: string
  newName: string
  boostType: 'damage' | 'health'
}

export interface LeaderCardResponse {
  message: string
  card: WorldCard
}

// Dungeon Types
export interface DungeonData {
  name: string
  type: 'Egyszerű találkozás' | 'Kis kazamata' | 'Nagy kazamata'
  cardIds: string[]
}

export interface Dungeon {
  _id: string
  name: string
  type: string
  cards: WorldCard[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DungeonsResponse {
  dungeons: Dungeon[]
}

export interface DungeonResponse {
  message: string
  dungeon: Dungeon
}

// Game Environment Types
export interface GameEnvironmentData {
  name: string
  worldCardIds: string[]
  dungeonIds: string[]
  starterCollectionIds: string[]
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

export interface GameEnvironmentsResponse {
  environments: GameEnvironment[]
}

export interface GameEnvironmentResponse {
  message: string
  gameEnvironment: GameEnvironment
}