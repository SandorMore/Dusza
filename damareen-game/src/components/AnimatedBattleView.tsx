import React, { useState, useEffect } from 'react'
import type { BattleResult, BattleRound, WorldCard } from '../types/game'
import './AnimatedBattleView.css'

interface AnimatedBattleViewProps {
  battleResult: BattleResult
  playerCards: WorldCard[]
  dungeonCards: WorldCard[]
  onBattleComplete: () => void
  onExit: () => void
}

const AnimatedBattleView: React.FC<AnimatedBattleViewProps> = ({
  battleResult,
  playerCards,
  dungeonCards,
  onBattleComplete,
  onExit
}) => {
  const [currentRound, setCurrentRound] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showAttack, setShowAttack] = useState(false)
  const [playerHealth, setPlayerHealth] = useState<number[]>([])
  const [dungeonHealth, setDungeonHealth] = useState<number[]>([])

  useEffect(() => {
    // Initialize health arrays
    setPlayerHealth(playerCards.map(card => card.health))
    setDungeonHealth(dungeonCards.map(card => card.health))
  }, [playerCards, dungeonCards])

  useEffect(() => {
    if (currentRound < battleResult.rounds.length) {
      // Start attack animation
      setIsAnimating(true)
      setShowAttack(true)

      // After attack animation, update health
      const timer = setTimeout(() => {
        const round = battleResult.rounds[currentRound]
        
        setPlayerHealth(prev => {
          const newHealth = [...prev]
          newHealth[currentRound] = Math.max(0, (newHealth[currentRound] || playerCards[currentRound]?.health || 0) - round.dungeonCardDamage)
          return newHealth
        })
        
        setDungeonHealth(prev => {
          const newHealth = [...prev]
          newHealth[currentRound] = Math.max(0, (newHealth[currentRound] || dungeonCards[currentRound]?.health || 0) - round.playerCardDamage)
          return newHealth
        })
        
        setShowAttack(false)

        // Wait before next round or completion
        setTimeout(() => {
          setIsAnimating(false)
          if (currentRound < battleResult.rounds.length - 1) {
            // Auto-advance to next round after a delay
            setTimeout(() => {
              setCurrentRound(prev => prev + 1)
            }, 1000)
          }
        }, 500)
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [currentRound, battleResult.rounds, playerCards, dungeonCards])

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'tűz': return '#ef4444'
      case 'víz': return '#3b82f6'
      case 'föld': return '#22c55e'
      case 'levegő': return '#a3a3a3'
      default: return '#6b7280'
    }
  }

  const getTypeEmoji = (type: string): string => {
    switch (type) {
      case 'tűz': return '🔥'
      case 'víz': return '💧'
      case 'föld': return '🌍'
      case 'levegő': return '💨'
      default: return '⚔️'
    }
  }

  const currentRoundData = battleResult.rounds[currentRound]
  const isBattleComplete = currentRound >= battleResult.rounds.length - 1 && !isAnimating

  return (
    <div className="animated-battle-view">
      {/* Top Banner with Round Number */}
      <div className="battle-banner">
        <div className="round-indicator">
          {currentRound + 1}-{battleResult.rounds.length}
        </div>
      </div>

      <div className="battle-container">
        {/* Left Sidebar - Player Cards */}
        <div className="player-sidebar">
          {playerCards.map((card, index) => {
            const isActive = index === currentRound
            const health = playerHealth[index] ?? card.health
            const isDefeated = health <= 0

            return (
              <div
                key={card._id || index}
                className={`player-card-slot ${isActive ? 'active' : ''} ${isDefeated ? 'defeated' : ''}`}
              >
                {isActive && (
                  <div className="card-label">Név</div>
                )}
                <div className="card-stats-display">
                  <div className="stat-line">
                    <span className="stat-label">Damage</span>
                    <span className="stat-value">{card.damage}</span>
                  </div>
                  <div className="stat-line">
                    <span className="stat-label">Health</span>
                    <span className={`stat-value health ${isDefeated ? 'zero' : ''}`}>
                      {health}
                    </span>
                  </div>
                </div>
                {isActive && (
                  <div className="card-type-badge" style={{ backgroundColor: getTypeColor(card.type) }}>
                    {getTypeEmoji(card.type)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Central Battle Area */}
        <div className="battle-center">
          {/* Player Central Card */}
          <div className={`central-card player-card ${isAnimating && showAttack ? 'attacking' : ''}`}>
            {currentRoundData && (
              <>
                <div className="central-card-name">{currentRoundData.playerCard.name}</div>
                <div className="central-card-stats">
                  <div className="central-stat">
                    <span className="stat-icon">⚔️</span>
                    <span className="stat-number">{currentRoundData.playerCard.damage}</span>
                  </div>
                  <div className="central-stat">
                    <span className="stat-icon">❤️</span>
                    <span className={`stat-number ${(playerHealth[currentRound] ?? currentRoundData.playerCard.health) <= 0 ? 'zero' : ''}`}>
                      {playerHealth[currentRound] ?? currentRoundData.playerCard.health}
                    </span>
                  </div>
                </div>
                <div className="central-card-type" style={{ backgroundColor: getTypeColor(currentRoundData.playerCard.type) }}>
                  {getTypeEmoji(currentRoundData.playerCard.type)}
                </div>
              </>
            )}
          </div>

          {/* Attack Arrows */}
          {showAttack && (
            <>
              <svg className="attack-arrow arrow-left" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <filter id="glow-amber">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <marker id="arrowhead-amber" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto">
                    <polygon points="0 0, 12 4, 0 8" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
                  </marker>
                </defs>
                <path
                  d="M 0 20 Q 30 0, 50 20 T 100 20"
                  stroke="#fbbf24"
                  strokeWidth="4"
                  fill="none"
                  markerEnd="url(#arrowhead-amber)"
                  className="arrow-path"
                  filter="url(#glow-amber)"
                />
              </svg>
              <svg className="attack-arrow arrow-right" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <filter id="glow-blue">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <marker id="arrowhead-blue" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto">
                    <polygon points="0 0, 12 4, 0 8" fill="#3b82f6" stroke="#1e40af" strokeWidth="1"/>
                  </marker>
                </defs>
                <path
                  d="M 100 20 Q 70 0, 50 20 T 0 20"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  fill="none"
                  markerEnd="url(#arrowhead-blue)"
                  className="arrow-path"
                  filter="url(#glow-blue)"
                />
              </svg>
            </>
          )}

          {/* Dungeon Central Card */}
          <div className={`central-card dungeon-card ${isAnimating && showAttack ? 'attacking' : ''}`}>
            {currentRoundData && (
              <>
                <div className="central-card-name">{currentRoundData.dungeonCard.name}</div>
                <div className="central-card-stats">
                  <div className="central-stat">
                    <span className="stat-icon">⚔️</span>
                    <span className="stat-number">{currentRoundData.dungeonCard.damage}</span>
                  </div>
                  <div className="central-stat">
                    <span className="stat-icon">❤️</span>
                    <span className={`stat-number ${(dungeonHealth[currentRound] ?? currentRoundData.dungeonCard.health) <= 0 ? 'zero' : ''}`}>
                      {dungeonHealth[currentRound] ?? currentRoundData.dungeonCard.health}
                    </span>
                  </div>
                </div>
                <div className="central-card-type" style={{ backgroundColor: getTypeColor(currentRoundData.dungeonCard.type) }}>
                  {getTypeEmoji(currentRoundData.dungeonCard.type)}
                </div>
                {currentRoundData.dungeonCard.isLeader && (
                  <div className="leader-badge">👑</div>
                )}
              </>
            )}
          </div>

          {/* Round Result Display */}
          {!showAttack && currentRoundData && (
            <div className={`round-result ${currentRoundData.playerWins ? 'player-win' : 'dungeon-win'}`}>
              {currentRoundData.playerWins ? '✅ Victory' : '❌ Defeat'}
            </div>
          )}
        </div>

        {/* Right Sidebar - Dungeon Cards */}
        <div className="dungeon-sidebar">
          {dungeonCards.map((card, index) => {
            const isActive = index === currentRound
            const health = dungeonHealth[index] ?? card.health
            const isDefeated = health <= 0

            return (
              <div
                key={card._id || index}
                className={`dungeon-card-slot ${isActive ? 'active' : ''} ${isDefeated ? 'defeated' : ''}`}
              >
                {isActive && (
                  <div className="card-label">Név</div>
                )}
                <div className="card-stats-display">
                  <div className="stat-line">
                    <span className="stat-label">Damage</span>
                    <span className="stat-value">{card.damage}</span>
                  </div>
                  <div className="stat-line">
                    <span className="stat-label">Health</span>
                    <span className={`stat-value health ${isDefeated ? 'zero' : ''}`}>
                      {health}
                    </span>
                  </div>
                </div>
                {isActive && (
                  <div className="card-type-badge" style={{ backgroundColor: getTypeColor(card.type) }}>
                    {getTypeEmoji(card.type)}
                  </div>
                )}
                {card.isLeader && (
                  <div className="leader-indicator">👑</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Battle Controls */}
      <div className="battle-controls">
        {isBattleComplete ? (
          <div className="battle-complete">
            <div className={`final-result ${battleResult.playerWins ? 'victory' : 'defeat'}`}>
              {battleResult.playerWins ? '🎉 GLORIOUS VICTORY! 🎉' : '💀 VALIANT DEFEAT! 💀'}
            </div>
            <div className="control-buttons">
              <button onClick={onBattleComplete} className="btn-continue">
                ⚜️ View Results
              </button>
              <button onClick={onExit} className="btn-exit">
                ⚔️ Exit Battle
              </button>
            </div>
          </div>
        ) : (
          <div className="round-info">
            <div className="round-reason">{currentRoundData?.reason}</div>
            {!isAnimating && (
              <button
                onClick={() => setCurrentRound(prev => Math.min(prev + 1, battleResult.rounds.length - 1))}
                className="btn-next-round"
                disabled={isAnimating}
              >
                ⚔️ Next Round
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnimatedBattleView

