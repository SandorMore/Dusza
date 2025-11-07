import type { Card, CardType } from "./types";

export const CARD_CONSTANTS = {
    NAME_MAX_LENGTH: 16,
    MIN_DAMAGE: 2,
    MAX_DAMAGE: 100,
    MIN_HEALTH: 1,
    MAX_HEALTH: 100,
} as const;

export const DUNGEON_CARD_COUNTS = {
    "egyszerű": 1,
    "kis": 4,
    "nagy": 6,
} as const;

export const REWARDS = {
    "egyszerű": {type: "damage", value: 1},
    "kis": {type: "health", value: 2},
    "nagy": {type: "damage", value: 3},
} as const;

export const TYPE_ADVANTAGES: Record<CardType, CardType> = {
    "tűz": "föld",
    "víz": "levegő",
    "föld": "víz",
    "levegő": "tűz",
} as const;