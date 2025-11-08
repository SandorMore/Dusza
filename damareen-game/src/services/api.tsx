// src/services/api.ts - UPDATED VERSION
import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { 
  AuthResponse, 
  RegisterFormData, 
  LoginFormData 
} from '../types/auth'
import type {
  WorldCardData,
  WorldCard,
  WorldCardsResponse,
  LeaderCardData,
  DungeonData,
  Dungeon,
  DungeonsResponse,
  GameEnvironmentData,
  GameEnvironment,
  GameEnvironmentsResponse,
  PlayerCollectionsResponse,
  PlayerDeckData,
  CreatePlayerDeckResponse,
  PlayerDecksResponse,
  BattleResponse,
  BattleRound
} from '../types/game'

// Response típusok
interface CreateWorldCardResponse {
  message: string
  card: WorldCard
}

interface CreateLeaderCardResponse {
  message: string
  card: WorldCard
}

interface CreateDungeonResponse {
  message: string
  dungeon: Dungeon
}

interface CreateGameEnvironmentResponse {
  message: string
  gameEnvironment: GameEnvironment
}

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        console.log('🔍 API Request - URL:', config.url, 'Token:', !!token)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data)
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }
  async applyReward(cardId: string, bonusType: 'damage' | 'health', bonusAmount: number): Promise<{message: string, card: any}> {
    const response: AxiosResponse<{message: string, card: any}> = await this.api.post('/player/apply-reward', {
      cardId,
      bonusType,
      bonusAmount
    });
    return response.data;
  }
  // Auth methods
  async register(userData: RegisterFormData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData)
    console.log('🔍 Register API válasz:', response.data)
    return response.data
  }

  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials)
    console.log('🔍 Login API válasz:', response.data)
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response: AxiosResponse<{ accessToken: string }> = await this.api.post('/auth/refresh-token', { refreshToken })
    return response.data
  }

  // Game Master methods
  async getWorldCards(): Promise<WorldCardsResponse> {
    const response: AxiosResponse<WorldCardsResponse> = await this.api.get('/game-master/world-cards')
    return response.data
  }

  async createWorldCard(cardData: WorldCardData): Promise<CreateWorldCardResponse> {
    try {
      console.log('🔍 Sending card data:', cardData);
      const response: AxiosResponse<CreateWorldCardResponse> = await this.api.post('/game-master/world-cards', cardData);
      console.log('✅ Card created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating world card:', error.response?.data || error.message);
      throw error;
    }
  }

  async createLeaderCard(leaderData: LeaderCardData): Promise<CreateLeaderCardResponse> {
    const response: AxiosResponse<CreateLeaderCardResponse> = await this.api.post('/game-master/world-cards/leader', leaderData)
    return response.data
  }
  async getAllCards(): Promise<WorldCardsResponse> {
    const response: AxiosResponse<WorldCardsResponse> = await this.api.get('/player/all-cards');
    return response.data;
  }

  async getAllDungeons(): Promise<DungeonsResponse> {
    const response: AxiosResponse<DungeonsResponse> = await this.api.get('/player/all-dungeons');
    return response.data;
  }

  async getAllGameEnvironments(): Promise<GameEnvironmentsResponse> {
    const response: AxiosResponse<GameEnvironmentsResponse> = await this.api.get('/player/all-game-environments');
    return response.data;
  }
  async createDungeon(dungeonData: DungeonData): Promise<CreateDungeonResponse> {
    const response: AxiosResponse<CreateDungeonResponse> = await this.api.post('/game-master/dungeons', dungeonData)
    return response.data
  }

  async getDungeons(): Promise<DungeonsResponse> {
    const response: AxiosResponse<DungeonsResponse> = await this.api.get('/game-master/dungeons')
    return response.data
  }

  async createGameEnvironment(environmentData: GameEnvironmentData): Promise<CreateGameEnvironmentResponse> {
    const response: AxiosResponse<CreateGameEnvironmentResponse> = await this.api.post('/game-master/game-environments', environmentData)
    return response.data
  }

  async getGameEnvironments(): Promise<GameEnvironmentsResponse> {
    const response: AxiosResponse<GameEnvironmentsResponse> = await this.api.get('/game-master/game-environments')
    return response.data
  }

  // Player methods
  async createPlayerDeck(deckData: PlayerDeckData): Promise<CreatePlayerDeckResponse> {
    const response: AxiosResponse<CreatePlayerDeckResponse> = await this.api.post('/player/decks', deckData)
    return response.data
  }

  async getPlayerDecks(): Promise<PlayerDecksResponse> {
    const response: AxiosResponse<PlayerDecksResponse> = await this.api.get('/player/decks')
    return response.data
  }

  async startBattle(deckId: string, dungeonId: string, cardOrder?: string[]): Promise<BattleResponse> {
    const response: AxiosResponse<BattleResponse> = await this.api.post('/player/battle', { 
      deckId, 
      dungeonId,
      ...(cardOrder && { cardOrder })
    })
    return response.data
  }

  async getNextRound(deckId: string, dungeonId: string, cardOrder: string[], currentRound: number): Promise<{message: string, round: BattleRound, roundIndex: number}> {
    const response: AxiosResponse<{message: string, round: BattleRound, roundIndex: number}> = await this.api.post('/player/battle/next-round', {
      deckId,
      dungeonId,
      cardOrder,
      currentRound
    })
    return response.data
  }

  async completeBattle(deckId: string, dungeonId: string, cardOrder: string[], rounds: BattleRound[]): Promise<BattleResponse> {
    const response: AxiosResponse<BattleResponse> = await this.api.post('/player/battle/complete', {
      deckId,
      dungeonId,
      cardOrder,
      rounds
    })
    return response.data
  }

  async getPlayerCollections(): Promise<PlayerCollectionsResponse> {
    const response: AxiosResponse<PlayerCollectionsResponse> = await this.api.get('/player/collections')
    return response.data
  }

  async updateCollectionCard(collectionId: string, cardId: string, bonusType: 'damage' | 'health', bonusAmount: number): Promise<{message: string}> {
    const response: AxiosResponse<{message: string}> = await this.api.put(`/player/collections/${collectionId}/cards/${cardId}`, {
      bonusType,
      bonusAmount
    })
    return response.data
  }

  // NEW: Player methods for accessing game data
  async getPlayerDungeons(): Promise<DungeonsResponse> {
    const response: AxiosResponse<DungeonsResponse> = await this.api.get('/player/dungeons')
    return response.data
  }

  async getPlayerWorldCards(): Promise<WorldCardsResponse> {
    const response: AxiosResponse<WorldCardsResponse> = await this.api.get('/player/world-cards')
    return response.data
  }

  async initializeStarterData(): Promise<{message: string, collection: any}> {
    const response: AxiosResponse<{message: string, collection: any}> = await this.api.post('/player/initialize-starter')
    return response.data
  }

  async testPlayerRoute(): Promise<{message: string, user: any}> {
    const response: AxiosResponse<{message: string, user: any}> = await this.api.get('/player/test')
    return response.data
  }

  async getTestDungeons(): Promise<DungeonsResponse> {
    const response: AxiosResponse<DungeonsResponse> = await this.api.get('/player/test-dungeons')
    return response.data
  }
}

export const apiService = new ApiService()