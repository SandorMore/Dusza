import React from 'react';
import type { Card } from '../types/types';
import { isLeaderCard } from '../utils/typeGuards';
import './BattleCard.css';

interface BattleCardProps {
  card: Card;
  isEnemy: boolean;
  isWinner: boolean;
  isAnimating: boolean;
}

const BattleCard: React.FC<BattleCardProps> = ({
  card,
  isEnemy,
  isWinner,
  isAnimating
}) => {
  const getTypeColor = (type: string) => {
    const colors = {
      'tűz': '#ff6b6b',
      'víz': '#4ecdc4',
      'föld': '#a17841',
      'levegő': '#87ceeb'
    };
    return colors[type as keyof typeof colors] || '#ccc';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'tűz': '🔥',
      'víz': '💧',
      'föld': '🌍',
      'levegő': '💨'
    };
    return icons[type as keyof typeof icons] || '❓';
  };

  return (
    <div className={`
      battle-card 
      ${isEnemy ? 'enemy' : 'player'}
      ${isWinner ? 'winner' : ''}
      ${isAnimating ? 'animating' : ''}
      ${isLeaderCard(card) ? 'leader' : ''}
    `}>
      <div className="card-header" style={{ borderColor: getTypeColor(card.type) }}>
        <h3 className="card-name">{card.name}</h3>
        {isLeaderCard(card) && <span className="leader-badge">👑</span>}
      </div>

      <div 
        className="card-type"
        style={{ backgroundColor: getTypeColor(card.type) }}
      >
        {getTypeIcon(card.type)} {card.type}
      </div>

      <div className="card-stats">
        <div className="stat damage">
          <span className="stat-icon">⚔️</span>
          <span className="stat-value">{card.damage}</span>
        </div>
        <div className="stat health">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{card.health}</span>
        </div>
      </div>

      {isAnimating && (
        <div className={`battle-animation ${isWinner ? 'win' : 'lose'}`}>
          {isWinner ? '⭐' : '💥'}
        </div>
      )}
    </div>
  );
};

export default BattleCard;