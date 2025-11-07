import React from 'react';
import type { BattleRound } from '../types/types';
import './BattleLog.css';

interface BattleLogProps {
  rounds: BattleRound[];
  currentRound: number;
  reason: string;
}

const BattleLog: React.FC<BattleLogProps> = ({ rounds, currentRound, reason }) => {
  const getReasonText = (reason: string) => {
    const reasons = {
      'damage': 'Sebzési fölény',
      'type': 'Típus előny',
      'default': 'Kazamata előny'
    };
    return reasons[reason as keyof typeof reasons] || reason;
  };

  return (
    <div className="battle-log">
      <h4>Harc Napló</h4>
      <div className="log-entries">
        {rounds.slice(0, currentRound + 1).map((round, index) => (
          <div
            key={index}
            className={`log-entry ${index === currentRound ? 'current' : ''} ${
              round.winner === 'player' ? 'player-win' : 'dungeon-win'
            }`}
          >
            <span className="round-number">{index + 1}. kör</span>
            <span className="battle-info">
              {round.playerCard.name} vs {round.dungeonCard.name}
            </span>
            <span className={`result ${round.winner}`}>
              {round.winner === 'player' ? '✓' : '✗'}
            </span>
            {index === currentRound && (
              <span className="reason">({getReasonText(reason)})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleLog;