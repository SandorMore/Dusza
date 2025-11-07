import { useState, useCallback } from 'react'
import { apiService } from '../services/api'
import type { RegisterFormData, LoginFormData, User, AuthResponse } from '../types/auth'

// Add proper error types
interface ApiError {
  response?: {
    data?: {
      message: string
    }
  }
  message: string
}

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
    
    try {
      const response: AuthResponse = await apiService.register(data)
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
        return true
      }
      return false
    } catch (err: unknown) {
      // Proper error handling with type guards
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const apiError = err as ApiError
        const errorMessage = apiError.response?.data?.message || 'Registration failed'
        setError(errorMessage)
      } else if (err instanceof Error) {
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
    
    try {
      const response: AuthResponse = await apiService.login(data)
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
        return true
      }
      return false
    } catch (err: unknown) {
      // Proper error handling with type guards
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const apiError = err as ApiError
        const errorMessage = apiError.response?.data?.message || 'Login failed'
        setError(errorMessage)
      } else if (err instanceof Error) {
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