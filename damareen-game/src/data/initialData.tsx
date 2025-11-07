// import type { GameWorld, BaseCard, LeaderCard, DungeonType, Deck } from '../types/types';

// export const createInitialWorld = (): GameWorld => {
//   // const baseCards: BaseCard[] = [
//   //   { id: '1', name: 'Aragorn', damage: 2, health: 5, type: 'tűz' },
//   //   { id: '2', name: 'ObiWan', damage: 2, health: 2, type: 'föld' },
//   //   { id: '3', name: 'Eowyn', damage: 2, health: 5, type: 'víz' },
//   //   { id: '4', name: 'Kira', damage: 2, health: 7, type: 'levegő' },
//   //   { id: '5', name: 'TulArak', damage: 2, health: 4, type: 'föld' },
//   //   { id: '6', name: 'Sadan', damage: 2, health: 4, type: 'levegő' },
//   //   { id: '7', name: 'Corky', damage: 2, health: 4, type: 'föld' },
//   // ];

//   // const leaderCards: LeaderCard[] = [
//   //   {
//   //     id: 'l1',
//   //     name: 'Darth ObiWan',
//   //     damage: 4,
//   //     health: 2,
//   //     type: 'föld',
//   //     baseCardId: '2',
//   //     isLeader: true,
//   //     doubleDamage: true,
//   //     doubleHealth: false
//   //   }
//   // ];

//   // const dungeons = [
//   //   {
//   //     id: 'd1',
//   //     name: 'A mélység királynője',
//   //     type: 'nagy' as DungeonType,
//   //     cards: [
//   //       baseCards[0], // Aragorn
//   //       baseCards[2], // Eowyn
//   //       baseCards[1], // ObiWan
//   //       baseCards[3], // Kira
//   //       baseCards[4], // TulArak
//   //       leaderCards[0] // Darth ObiWan
//   //     ],
//   //     reward: {
//   //       type: 'damage' as const,
//   //       value: 3
//   //     }
//   //   },
//   //   {
//   //     id: 'd2',
//   //     name: 'Tűz szörnyetege',
//   //     type: 'egyszerű' as DungeonType,
//   //     cards: [baseCards[0]], // Aragorn
//   //     reward: {
//   //       type: 'damage' as const,
//   //       value: 1
//   //     }
//   //   },
//   //   {
//   //     id: 'd3',
//   //     name: 'Vízi csapda',
//   //     type: 'kis' as DungeonType,
//   //     cards: [
//   //       baseCards[2],
//   //       baseCards[5], 
//   //       baseCards[6], 
//   //       leaderCards[0] 
//   //     ],
//   //     reward: {
//   //       type: 'health' as const,
//   //       value: 2
//   //     }
//   //   }
//   // ];

//   // const playerCollections = [
//   //   {
//   //     id: 'p1',
//   //     name: 'Alap gyűjtemény',
//   //     cards: [baseCards[0], baseCards[5], baseCards[6], baseCards[3]] 
//   //   }
//   // ];

//   // return {
//   //   id: 'world1',
//   //   name: 'Kezdő világ',
//   //   cards: [...baseCards, ...leaderCards],
//   //   dungeons,
//   //   playerCollections
//   // };
// };

// export const createInitialDecks = (collection: BaseCard[]): Deck[] => [
//   {
//     id: 'deck1',
//     name: 'Alap pakli',
//     cards: [collection[0], collection[1], collection[2], collection[3]] 
//   }
// ];