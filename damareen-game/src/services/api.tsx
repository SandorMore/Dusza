// src/services/api.ts - Teljesen típusbiztos verzió
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
  GameEnvironmentsResponse
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
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
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
    const response: AxiosResponse<CreateWorldCardResponse> = await this.api.post('/game-master/world-cards', cardData)
    return response.data
  }

  async createLeaderCard(leaderData: LeaderCardData): Promise<CreateLeaderCardResponse> {
    const response: AxiosResponse<CreateLeaderCardResponse> = await this.api.post('/game-master/world-cards/leader', leaderData)
    return response.data
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
}

export const apiService = new ApiService()