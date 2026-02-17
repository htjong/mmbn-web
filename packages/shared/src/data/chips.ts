import { Chip } from '../types/Chip';

/**
 * Core chip definitions
 * Start with a few chips, expand to 200+ iteratively
 */
export const CHIPS: Record<string, Chip> = {
  cannon: {
    id: 'cannon',
    name: 'Cannon',
    element: 'normal',
    damage: 40,
    accuracy: 100,
    rarity: 'common',
    effects: [
      {
        type: 'damage',
        value: 40,
        areaSize: 'single',
      },
    ],
    customCost: 20,
    description: 'Basic shot. Deals 40 damage.',
  },
  cannonP: {
    id: 'cannonP',
    name: 'Cannon*',
    element: 'normal',
    damage: 60,
    accuracy: 100,
    rarity: 'uncommon',
    effects: [
      {
        type: 'damage',
        value: 60,
        areaSize: 'single',
      },
    ],
    customCost: 30,
    description: 'Powered up shot. Deals 60 damage.',
  },
  highCannon: {
    id: 'highCannon',
    name: 'High Cannon',
    element: 'normal',
    damage: 80,
    accuracy: 100,
    rarity: 'rare',
    effects: [
      {
        type: 'damage',
        value: 80,
        areaSize: 'single',
      },
    ],
    customCost: 40,
    description: 'Strong cannon shot. Deals 80 damage.',
  },
  sword: {
    id: 'sword',
    name: 'Sword',
    element: 'break',
    damage: 60,
    accuracy: 100,
    rarity: 'common',
    effects: [
      {
        type: 'damage',
        value: 60,
        areaSize: 'single',
      },
      {
        type: 'panel_break',
        value: 1,
      },
    ],
    customCost: 25,
    description: 'Slashing attack. Deals 60 damage and breaks panels.',
  },
  areaGrab: {
    id: 'areaGrab',
    name: 'Area Grab',
    element: 'normal',
    damage: 30,
    accuracy: 100,
    rarity: 'uncommon',
    effects: [
      {
        type: 'damage',
        value: 30,
        areaSize: 'area',
        areaRadius: 1,
      },
    ],
    customCost: 35,
    description: 'AOE attack. Deals 30 damage in area.',
  },
  shockWave: {
    id: 'shockWave',
    name: 'Shock Wave',
    element: 'elec',
    damage: 50,
    accuracy: 100,
    rarity: 'uncommon',
    effects: [
      {
        type: 'damage',
        value: 50,
        areaSize: 'line',
      },
    ],
    customCost: 30,
    description: 'Electrical attack. Deals 50 damage in line.',
  },
};
