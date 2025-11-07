import { CARD_CONSTRAINTS, DUNGEON_CARD_COUNTS } from '../types/constants';
import type { Card, Dungeon } from '../types/types';
import { isLeaderCard } from './typeGuards';

export const validateCard = (card: Omit<Card, 'id'>): string[] => {
  const errors: string[] = [];

  if (!card.name || card.name.length > CARD_CONSTRAINTS.NAME_MAX_LENGTH) {
    errors.push(`Név kötelező és maximum ${CARD_CONSTRAINTS.NAME_MAX_LENGTH} karakter`);
  }

  if (card.damage < CARD_CONSTRAINTS.DAMAGE_MIN || card.damage > CARD_CONSTRAINTS.DAMAGE_MAX) {
    errors.push(`Sebzés ${CARD_CONSTRAINTS.DAMAGE_MIN}-${CARD_CONSTRAINTS.DAMAGE_MAX} között legyen`);
  }

  if (card.health < CARD_CONSTRAINTS.HEALTH_MIN || card.health > CARD_CONSTRAINTS.HEALTH_MAX) {
    errors.push(`Életerő ${CARD_CONSTRAINTS.HEALTH_MIN}-${CARD_CONSTRAINTS.HEALTH_MAX} között legyen`);
  }

  return errors;
};

export const validateDungeon = (dungeon: Omit<Dungeon, 'id'>): string[] => {
  const errors: string[] = [];

  if (!dungeon.name) {
    errors.push('Kazamata név kötelező');
  }

  const expectedCount = DUNGEON_CARD_COUNTS[dungeon.type];
  if (dungeon.cards.length !== expectedCount) {
    errors.push(`${dungeon.type} kazamatának ${expectedCount} kártyája kell`);
  }

  // Kis és nagy kazamaták végén vezérkártya kell
  if (dungeon.type !== 'egyszerű') {
    const lastCard = dungeon.cards[dungeon.cards.length - 1];
    if (!lastCard || !isLeaderCard(lastCard)) {
      errors.push(`${dungeon.type} kazamata végén vezérkártya kell`);
    }
  }

  return errors;
};