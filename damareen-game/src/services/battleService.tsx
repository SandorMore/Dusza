import type { BattleResult, BattleRound, Card, BaseCard } from '../types/types';
import { TYPE_ADVANTAGES } from '../types/constants';

export class BattleService {
    static battle(playerDeck: BaseCard[], dungeonCards: Card[]): BattleResult {
        const rounds: BattleRound[] = [];

        for (let i = 0; i < playerDeck.length; i++) {
            const playerCard = playerDeck[i];
            const dungeonCard = dungeonCards[i];

            const round = this.battleRound(playerCard, dungeonCard);
            rounds.push(round);
        }

        const playerWins = rounds.filter(r => r.winner === 'player').length;
        const dungeonWins = rounds.filter(r => r.winner === 'dungeon').length;

        const winner = playerWins >= dungeonWins ? 'player' : 'dungeon';

        return {
            winner,
            rounds,
        };
    }
    private static battleRound(playerCard: BaseCard, dungeonCard: BaseCard): BattleRound {
        //1 sebzes
        if (playerCard.damage > dungeonCard.health) {
            return {
                playerCard,
                dungeonCard,
                winner: 'player',
                reason: 'damage'
            };
        }
        if (dungeonCard.damage > playerCard.health) {
            return {
                playerCard,
                dungeonCard,
                winner: 'dungeon',
                reason: 'damage'
            };
        }
        //2típus alapjan
        const isPlayerAdvantage = TYPE_ADVANTAGES[playerCard.type] === dungeonCard.type;
        const isDungeonAdvantage = TYPE_ADVANTAGES[dungeonCard.type] === playerCard.type;

        if (isPlayerAdvantage) {
            return {
                playerCard,
                dungeonCard,
                winner: 'player',
                reason: 'type'
            };
        }
        if (isDungeonAdvantage) {
            return {
                playerCard,
                dungeonCard,
                winner: 'dungeon',
                reason: 'type'
            };
        }
        return {
            playerCard,
            dungeonCard,
            winner: 'dungeon',
            reason: 'default'
        }
    }
    
}