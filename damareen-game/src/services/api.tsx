// src/services/api.ts
import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { 
  AuthResponse, 
  RegisterFormData, 
  LoginFormData 
} from '../types/auth'
import type {
  WorldCard,
  WorldCardData,
  WorldCardsResponse,
  LeaderCardData,
  Dungeon,
  DungeonData,
  DungeonsResponse,
  GameEnvironment,
  GameEnvironmentData,
  GameEnvironmentsResponse
} from '../types/game'

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
    return response.data
  }

  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials)
    return response.data
  }

  // Game Master methods
  async getWorldCards(): Promise<WorldCardsResponse> {
    const response: AxiosResponse<WorldCardsResponse> = await this.api.get('/game-master/world-cards')
    return response.data
  }

  async createWorldCard(cardData: WorldCardData): Promise<{ message: string; card: WorldCard }> {
    const response: AxiosResponse<{ message: string; card: WorldCard }> = await this.api.post('/game-master/world-cards', cardData)
    return response.data
  }

  async createLeaderCard(leaderData: LeaderCardData): Promise<{ message: string; card: WorldCard }> {
    const response: AxiosResponse<{ message: string; card: WorldCard }> = await this.api.post('/game-master/world-cards/leader', leaderData)
    return response.data
  }

  async createDungeon(dungeonData: DungeonData): Promise<{ message: string; dungeon: Dungeon }> {
    const response: AxiosResponse<{ message: string; dungeon: Dungeon }> = await this.api.post('/game-master/dungeons', dungeonData)
    return response.data
  }

  async getDungeons(): Promise<DungeonsResponse> {
    const response: AxiosResponse<DungeonsResponse> = await this.api.get('/game-master/dungeons')
    return response.data
  }

  async createGameEnvironment(environmentData: GameEnvironmentData): Promise<{ message: string; gameEnvironment: GameEnvironment }> {
    const response: AxiosResponse<{ message: string; gameEnvironment: GameEnvironment }> = await this.api.post('/game-master/game-environments', environmentData)
    return response.data
  }

  async getGameEnvironments(): Promise<GameEnvironmentsResponse> {
    const response: AxiosResponse<GameEnvironmentsResponse> = await this.api.get('/game-master/game-environments')
    return response.data
  }
}

export const apiService = new ApiService()