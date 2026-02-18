import { Chip } from '../types/Chip.js';

/**
 * Chip definitions based on Mega Man Battle Network 3
 * Damage values, elements, and effects match the original game.
 */
export const CHIPS: Record<string, Chip> = {
  cannon: {
    id: 'cannon',
    name: 'Cannon',
    element: 'none',
    damage: 40,

    effects: [
      {
        type: 'damage',
        value: 40,
        areaSize: 'single',
      },
    ],
    description: 'Cannon to attack 1 enemy',
  },
  hiCannon: {
    id: 'hiCannon',
    name: 'HiCannon',
    element: 'none',
    damage: 80,

    effects: [
      {
        type: 'damage',
        value: 80,
        areaSize: 'single',
      },
    ],
    description: 'Fires powerful cannon to attack 1 enemy',
  },
  mCannon: {
    id: 'mCannon',
    name: 'M-Cannon',
    element: 'none',
    damage: 120,

    effects: [
      {
        type: 'damage',
        value: 120,
        areaSize: 'single',
      },
    ],
    description: 'Fires mega cannon to attack 1 enemy',
  },
  sword: {
    id: 'sword',
    name: 'Sword',
    element: 'none',
    damage: 80,

    effects: [
      {
        type: 'damage',
        value: 80,
        areaSize: 'single',
      },
    ],
    description: 'Cuts 1 square ahead with a sword',
  },
  shockWave: {
    id: 'shockWave',
    name: 'ShockWave',
    element: 'none',
    damage: 60,

    effects: [
      {
        type: 'damage',
        value: 60,
        areaSize: 'line',
      },
    ],
    description: 'Sends a shockwave down the row',
  },
  areaGrab: {
    id: 'areaGrab',
    name: 'AreaGrab',
    element: 'none',
    damage: 0,

    effects: [
      {
        type: 'area_effect',
        value: 1,
        areaSize: 'area',
      },
    ],
    description: 'Steals 1 column of enemy area',
  },
};
