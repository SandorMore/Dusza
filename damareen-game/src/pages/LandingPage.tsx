// src/pages/LandingPage.tsx
import React from 'react'
import { useAuth } from '../hooks/useAuth'

const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Damareen
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A fantasy card collecting game
        </p>
        
        {isAuthenticated() ? (
          <div>
            <p className="mb-4">Welcome back, {user?.username}!</p>
            <div className="space-x-4">
              <a 
                href={user?.role === 'gameMaster' ? '/game-master' : '/player'}
                className="bg-violet-500 text-white px-6 py-3 rounded-lg hover:bg-violet-600 transition-colors"
              >
                Go to Dashboard
              </a>
              <a 
                href="/login" 
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  window.location.href = '/'
                }}
              >
                Logout
              </a>
            </div>
          </div>
        ) : (
          <div className="space-x-4">
            <a 
              href="/login" 
              className="bg-violet-500 text-white px-6 py-3 rounded-lg hover:bg-violet-600 transition-colors"
            >
              Login
            </a>
            <a 
              href="/register" 
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Register
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPage