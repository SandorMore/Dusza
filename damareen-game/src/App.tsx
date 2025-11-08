// src/App.tsx
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import GameMasterDashboard from './pages/GameMasterDashboard'
import PlayerDashboard from './pages/PlayerDashboard'
import FightPage from './pages/FightPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/game-master" element={<GameMasterDashboard />} />
        <Route path="/player" element={<PlayerDashboard />} />
        <Route path="/player/fight" element={<FightPage />} />
      </Routes>
    </Router>
  )
}

export default App