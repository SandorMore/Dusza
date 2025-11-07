export type CardType = 'tűz' | 'víz' | 'föld' | 'levegő';

export interface BaseCard {
  id: string;
  name: string;
  damage: number;
  health: number;
  type: CardType;
}

export interface LeaderCard extends BaseCard {
  isLeader: true;
  baseCardId: string;
  doubleDamage: boolean;
  doubleHealth: boolean;
}

export type Card = BaseCard | LeaderCard;

export type DungeonType = {
  id: string;
  name: string;
  difficulty: number;
  cards: Card[];
  reward: {
    type: 'damage' | 'health';
    value: number;
  };
}

export interface PlayerCollection {
  id: string;
  name: string;
  cards: BaseCard[];
}

export interface Deck {
  id: string;
  name: string;
  cards: BaseCard[];
}

export interface BattleResult {
  winner: 'player' | 'dungeon';
  rounds: BattleRound[];
}

export interface BattleRound {
  playerCard: BaseCard;
  dungeonCard: Card;
  winner: 'player' | 'dungeon';
  reason: 'damage' | 'type' | 'default';
}

export interface GameWorld {
  id: string;
  name: string;
  cards: Card[];
  dungeons: DungeonType[];
  playerCollections: PlayerCollection[];
}