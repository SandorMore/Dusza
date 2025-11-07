import type {Card, LeaderCard, BaseCard, CardType} from "../types/types";

export function isLeaderCard(card: Card): card is LeaderCard {
    return (card as LeaderCard).isLeader === true;
}
export function isBaseCard(card: Card): card is BaseCard {
    return !isLeaderCard(card);
}
export const isValidCardType = (type: string): type is CardType => {
  return ['tűz', 'víz', 'föld', 'levegő'].includes(type);
};