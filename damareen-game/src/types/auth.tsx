export interface User {
  id: string
  username: string
  email: string
  role: 'player' | 'gameMaster'
}

export interface AuthResponse {
  message: string
  token?: string
  user?: User
  error?: string
}

export interface RegisterFormData {
  username: string
  email: string
  password: string
  role: 'player' | 'gameMaster'
}

export interface LoginFormData {
  email: string
  password: string
}

// types/api.ts
export interface ApiError {
  message: string
  error?: string
}