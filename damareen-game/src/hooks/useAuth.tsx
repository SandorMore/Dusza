// src/hooks/useAuth.tsx
import { useState, useCallback } from 'react'
import { apiService } from '../services/api'
import type { RegisterFormData, LoginFormData, User, AuthResponse } from '../types/auth'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: string | null
  register: (data: RegisterFormData) => Promise<boolean>
  login: (data: LoginFormData) => Promise<boolean>
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(() => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const register = useCallback(async (data: RegisterFormData): Promise<boolean> => {
    setLoading(true)
    setError(null)
    console.log('Starting registration with:', data)
    
    try {
      const response: AuthResponse = await apiService.register(data)
      console.log('Registration response:', response)
      
      // MEGVÁLTOZOTT: tokens.accessToken használata
      if (response.message && response.message.includes('successfully')) {
        if (response.tokens?.accessToken && response.user) {
          localStorage.setItem('token', response.tokens.accessToken)
          localStorage.setItem('user', JSON.stringify(response.user))
          setUser(response.user)
          console.log('Registration successful, user saved to localStorage')
          return true
        }
      }
      
      // If we get here but have a message, it might still be successful
      if (response.message) {
        console.log('Registration has message but no tokens:', response.message)
        setError(response.message)
      } else {
        console.log('Registration failed - unexpected response format')
        setError('Registration failed - unexpected response')
      }
      return false
    } catch (err: unknown) {
      console.error('Registration error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Registration failed')
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (data: LoginFormData): Promise<boolean> => {
    setLoading(true)
    setError(null)
    console.log('Starting login with:', data)
    
    try {
      const response: AuthResponse = await apiService.login(data)
      console.log('Login response:', response)
      
      // MEGVÁLTOZOTT: tokens.accessToken használata
      if (response.message && response.message.includes('successfully')) {
        if (response.tokens?.accessToken && response.user) {
          localStorage.setItem('token', response.tokens.accessToken)
          localStorage.setItem('user', JSON.stringify(response.user))
          setUser(response.user)
          console.log('Login successful, user saved to localStorage')
          return true
        }
      }
      
      if (response.message) {
        console.log('Login has message but no tokens:', response.message)
        setError(response.message)
      } else {
        console.log('Login failed - unexpected response format')
        setError('Login failed - unexpected response')
      }
      return false
    } catch (err: unknown) {
      console.error('Login error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Login failed')
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken') // MEGVÁLTOZOTT: refreshToken is törlése
    setUser(null)
    window.location.href = '/login'
  }, [])

  const isAuthenticated = useCallback((): boolean => {
    return !!localStorage.getItem('token')
  }, [])

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated
  }
}