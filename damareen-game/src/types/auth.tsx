// src/types/auth.ts - Frissítsd a típusdefiníciót
export interface User {
  id: string
  username: string
  email: string
  role: 'player' | 'gameMaster'
}

export interface Tokens {
  accessToken: string
  refreshToken: string
  accessTokenExpires: string
  refreshTokenExpires: string
}

export interface AuthResponse {
  message: string
  tokens?: Tokens  // MEGVÁLTOZOTT: tokens objektum
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