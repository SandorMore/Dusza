import React, { useState, useEffect } from 'react'
import type { BattleResult, BattleRound, WorldCard } from '../types/game'
import { apiService } from '../services/api'
import './AnimatedBattleView.css'

interface AnimatedBattleViewProps {
  battleResult: BattleResult
  playerCards: WorldCard[]
  dungeonCards: WorldCard[]
  deckId: string
  dungeonId: string
  cardOrder: string[]
  onBattleComplete: (finalResult: BattleResult) => void
  onExit: () => void
}

const AnimatedBattleView: React.FC<AnimatedBattleViewProps> = ({
  battleResult,
  playerCards,
  dungeonCards,
  deckId,
  dungeonId,
  cardOrder,
  onBattleComplete,
  onExit
}) => {
  const [currentRound, setCurrentRound] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showAttack, setShowAttack] = useState(false)
  const [playerHealth, setPlayerHealth] = useState<number[]>([])
  const [dungeonHealth, setDungeonHealth] = useState<number[]>([])
  const [roundStarted, setRoundStarted] = useState(false)
  const [roundCompleted, setRoundCompleted] = useState(false)
  const [battleRounds, setBattleRounds] = useState<BattleRound[]>(battleResult.rounds)
  const [totalRounds, setTotalRounds] = useState(battleResult.totalRounds || battleResult.rounds.length)
  const [isFetchingRound, setIsFetchingRound] = useState(false)
  const [displayWhy, setDisplayWhy] = useState(false)
  const [displayAbleResult, setDisplayAbleResult] = useState(false)
  const [finalBattleResult, setFinalBattleResult] = useState<BattleResult | null>(null)
  const [isCalculatingFinal, setIsCalculatingFinal] = useState(false)

  useEffect(() => {
    setPlayerHealth(playerCards.map(card => card.health))
    setDungeonHealth(dungeonCards.map(card => card.health))
  }, [playerCards, dungeonCards])

  useEffect(() => {
    setDisplayAbleResult(false)
    setRoundStarted(false)
    setRoundCompleted(false)
    setIsAnimating(false)
    setShowAttack(false)
    setDisplayWhy(false)
  }, [currentRound])

  const handleNextRound = async () => {
    if (currentRound < totalRounds - 1 && roundCompleted && !isAnimating && !isFetchingRound) {
      setIsFetchingRound(true)
      try {
        const nextRoundData = await apiService.getNextRound(deckId, dungeonId, cardOrder, currentRound)
        setBattleRounds(prev => [...prev, nextRoundData.round])
        setCurrentRound(nextRoundData.roundIndex)
      } catch (error: any) {
        setCurrentRound(prev => prev + 1)
      } finally {
        setIsFetchingRound(false)
      }
    }
  }

  const handleStartRound = () => {
    if (isAnimating || roundStarted) return
    
    const round = battleRounds[currentRound]
    if (!round) return
    
    setRoundStarted(true)
    
    setIsAnimating(true)
    setShowAttack(true)

    const timer = setTimeout(() => {
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
      setDisplayAbleResult(true)
      setDisplayWhy(true)
      setTimeout(() => {
        setIsAnimating(false)
        setRoundCompleted(true)
        
        if (currentRound >= totalRounds - 1) {
          setTimeout(() => {
            calculateFinalResult()
          }, 1000)
        }
      }, 1500)
    }, 2000)

    return () => clearTimeout(timer)
  }

  const calculateFinalResult = async () => {
    if (isCalculatingFinal || finalBattleResult) return
    
    setIsCalculatingFinal(true)
    try {
      const finalResult = await apiService.completeBattle(deckId, dungeonId, cardOrder, battleRounds)
      setFinalBattleResult(finalResult.result)
    } catch (error: any) {
      const playerWinsCount = battleRounds.filter(r => r.playerWins).length
      const playerWins = playerWinsCount >= Math.ceil(battleRounds.length / 2)
      const localResult: BattleResult = {
        ...battleResult,
        playerWins,
        rounds: battleRounds
      }
      setFinalBattleResult(localResult)
    } finally {
      setIsCalculatingFinal(false)
    }
  }

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

  const handleViewRewards = () => {
    if (finalBattleResult) {
      onBattleComplete(finalBattleResult)
    }
  }

  const currentRoundData = battleRounds[currentRound]
  const isBattleComplete = currentRound >= totalRounds - 1 && !isAnimating && roundCompleted
  
  useEffect(() => {
    if (isBattleComplete && battleResult.playerWins === null && battleRounds.length === totalRounds && !finalBattleResult && !isCalculatingFinal) {
      calculateFinalResult()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBattleComplete, battleRounds.length, totalRounds, battleResult.playerWins, finalBattleResult, isCalculatingFinal])

  return (
    <div className="animated-battle-view">
      {/* Top Banner with Round Number */}
      <div className="battle-banner">
        <div className="round-indicator">
          {currentRound + 1}/{totalRounds}
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
                  <div className="card-label">{card.name}</div>
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

          {/* Sword Clashing GIF */}
          {showAttack && (
            <div className="sword-clash-container">
              <img 
                src="/assets/swordClashing.gif" 
                alt="Swords clashing" 
                className="sword-clash-gif"
              />
            </div>
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
          {!showAttack && currentRoundData  && displayAbleResult && (
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
                  <div className="card-label">{card.name}</div>
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
        {finalBattleResult ? (
          <div className="battle-complete">
            <div className={`final-result ${finalBattleResult.playerWins ? 'victory' : 'defeat'}`}>
              {finalBattleResult.playerWins ? '🎉 GLORIOUS VICTORY! 🎉' : '💀 VALIANT DEFEAT! 💀'}
            </div>
            <div className="control-buttons">
              <button onClick={handleViewRewards} className="btn-continue">
                {finalBattleResult.playerWins ? '🏆 View Rewards' : '📊 View Results'}
              </button>
              <button onClick={onExit} className="btn-exit">
                ⚔️ Exit Battle
              </button>
            </div>
          </div>
        ) : isCalculatingFinal ? (
          <div className="round-status">
            ⏳ Calculating final result...
          </div>
        ) : (
          <div className="round-info">
            {displayWhy && <div className="round-reason">{currentRoundData?.reason}</div>}
            {!roundStarted ? (
              <button
                onClick={handleStartRound}
                className="btn-start-round"
                disabled={isAnimating}
              >
                ⚔️ Start Round {currentRound + 1}
              </button>
            ) : isAnimating || showAttack ? (
              <div className="round-status">
                ⚔️ Battle in progress...
              </div>
            ) : roundCompleted ? (
              <div className="round-controls">
                {currentRound < totalRounds - 1 ? (
                  <button
                    onClick={handleNextRound}
                    className="btn-next-round"
                    disabled={isFetchingRound}
                  >
                    {isFetchingRound ? '⏳ Loading...' : '⏭️ Next Round'}
                  </button>
                ) : (
                  <div className="round-status">
                    ⏳ Finalizing battle...
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnimatedBattleView