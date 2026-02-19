/**
 * Shared mock data for Storybook stories.
 * Keep in sync with chip data shapes but decoupled from live game data.
 */
import type { Chip } from '@mmbn/shared';

export const mockChips: Chip[] = [
  {
    id: 'cannon',
    name: 'Cannon',
    element: 'none',
    damage: 40,
    effects: [{ type: 'damage', value: 40 }],
    description: 'Fires a single cannon blast forward.',
  },
  {
    id: 'heatshot',
    name: 'HeatShot',
    element: 'fire',
    damage: 40,
    effects: [{ type: 'damage', value: 40 }],
    description: 'Fire shot spreads to the panel behind.',
  },
  {
    id: 'bubbler',
    name: 'Bubbler',
    element: 'aqua',
    damage: 50,
    effects: [{ type: 'damage', value: 50 }],
    description: 'Water bubble hits one enemy.',
  },
  {
    id: 'thunder',
    name: 'Thunder',
    element: 'elec',
    damage: 80,
    effects: [{ type: 'damage', value: 80 }],
    description: 'Lightning hits all enemies in a column.',
  },
  {
    id: 'woodtower',
    name: 'WoodTower',
    element: 'wood',
    damage: 60,
    effects: [{ type: 'damage', value: 60 }],
    description: 'Wooden pillar erupts from the ground.',
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    element: 'none',
    damage: 50,
    effects: [{ type: 'damage', value: 50 }],
    description: 'Shotgun blast that pierces through.',
  },
  {
    id: 'fireblazer',
    name: 'FireBlazer',
    element: 'fire',
    damage: 60,
    effects: [{ type: 'damage', value: 60 }],
    description: 'Blazing fire covers three panels.',
  },
  {
    id: 'icewave',
    name: 'IceWave',
    element: 'aqua',
    damage: 70,
    effects: [{ type: 'damage', value: 70 }],
    description: 'Ice wave freezes enemy in place.',
  },
  {
    id: 'zapring',
    name: 'ZapRing',
    element: 'elec',
    damage: 40,
    effects: [{ type: 'damage', value: 40 }],
    description: 'Electric ring that stuns on hit.',
  },
  {
    id: 'leafshield',
    name: 'LeafShield',
    element: 'wood',
    damage: 20,
    effects: [{ type: 'damage', value: 20 }],
    description: 'Shield of leaves blocks one attack.',
  },
];

/** Convenience: chips keyed by element */
export const chipByElement = Object.fromEntries(mockChips.map((c) => [c.element, c])) as Record<
  Chip['element'],
  Chip
>;
