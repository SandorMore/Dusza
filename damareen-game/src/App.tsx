// src/App.tsx
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import GameMasterDashboard from './pages/GameMasterDashboard'
import { useAuth } from './hooks/useAuth'

// Simple component to check auth and redirect
const AuthRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  
  if (isAuthenticated()) {
    return user?.role === 'gameMaster' ? 
      <Navigate to="/game-master" /> : 
      <Navigate to="/player" />
  }
  
  return <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Game Master Dashboard - Protected */}
        <Route 
          path="/game-master" 
          element={<GameMasterDashboard />} 
        />
        
        {/* Player Dashboard - You'll need to create this */}
        <Route 
          path="/player" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Player Dashboard</h1>
                <p>Player features coming soon!</p>
              </div>
            </div>
          } 
        />
        
        {/* Default route - redirect based on auth */}
        <Route path="/dashboard" element={<AuthRedirect />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App