import React, { useState, useEffect } from 'react';
import type { Card, Dungeon, BattleResult } from '../types/types';
import { BattleService } from '../services/battleService';
import BattleCard from './BattleCard';
import BattleLog from './BattleLog';
import './BattleView.css';

interface BattleViewProps {
  playerDeck: Card[];
  dungeon: Dungeon;
  onBattleEnd: (result: BattleResult) => void;
  onExit: () => void;
}

const BattleView: React.FC<BattleViewProps> = ({
  playerDeck,
  dungeon,
  onBattleEnd,
  onExit
}) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const result = BattleService.battle(playerDeck, dungeon.cards);
    setBattleResult(result);
  }, [playerDeck, dungeon]);

  const nextRound = () => {
    if (!battleResult || currentRound >= battleResult.rounds.length - 1) {
      onBattleEnd(battleResult!);
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentRound(prev => prev + 1);
      setIsAnimating(false);
    }, 1500);
  };

  if (!battleResult) {
    return <div className="battle-loading">Harc előkészítése...</div>;
  }

  const currentRoundData = battleResult.rounds[currentRound];
  const isBattleOver = currentRound >= battleResult.rounds.length - 1;

  return (
    <div className="battle-view">
      <div className="battle-header">
        <h2>{dungeon.name}</h2>
        <div className="battle-progress">
          {battleResult.rounds.map((_, index) => (
            <div
              key={index}
              className={`progress-step ${index <= currentRound ? 'active' : ''} ${
                battleResult.rounds[index].winner === 'player' ? 'player-win' : 'dungeon-win'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="battle-arena">
        <div className="enemy-side">
          <BattleCard
            card={currentRoundData.dungeonCard}
            isEnemy={true}
            isWinner={currentRoundData.winner === 'dungeon'}
            isAnimating={isAnimating}
          />
        </div>

        <div className="battle-center">
          <div className="vs-badge">VS</div>
          {currentRoundData.winner !== 'draw' && (
            <div className={`winner-announcement ${currentRoundData.winner}`}>
              {currentRoundData.winner === 'player' ? 'GYŐZELEM!' : 'VERESÉG!'}
            </div>
          )}
        </div>

        <div className="player-side">
          <BattleCard
            card={currentRoundData.playerCard}
            isEnemy={false}
            isWinner={currentRoundData.winner === 'player'}
            isAnimating={isAnimating}
          />
        </div>
      </div>

      <BattleLog
        rounds={battleResult.rounds}
        currentRound={currentRound}
        reason={currentRoundData.reason}
      />

      <div className="battle-controls">
        {!isBattleOver ? (
          <button
            onClick={nextRound}
            disabled={isAnimating}
            className="btn-next-round"
          >
            {isAnimating ? '...' : 'Következő Ütközet'}
          </button>
        ) : (
          <div className="battle-end">
            <h3 className={battleResult.winner === 'player' ? 'victory' : 'defeat'}>
              {battleResult.winner === 'player' ? '🎉 Győzelem!' : '💀 Vereség'}
            </h3>
            <button
              onClick={() => onBattleEnd(battleResult)}
              className="btn-continue"
            >
              Folytatás
            </button>
          </div>
        )}

        <button onClick={onExit} className="btn-exit">
          Kilépés
        </button>
      </div>
    </div>
  );
};

export default BattleView;