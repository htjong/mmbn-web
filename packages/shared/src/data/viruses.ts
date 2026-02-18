export interface VirusTemplate {
  id: string;
  name: string;
  hp: number;
  attack: number;
  behavior: 'aggressive' | 'defensive' | 'random';
  dropChips: string[];
}

/**
 * Core virus definitions
 */
export const VIRUSES: Record<string, VirusTemplate> = {
  mettaur: {
    id: 'mettaur',
    name: 'Mettaur',
    hp: 40,
    attack: 20,
    behavior: 'defensive',
    dropChips: ['cannon', 'sword'],
  },
  bunny: {
    id: 'bunny',
    name: 'Bunny',
    hp: 40,
    attack: 30,
    behavior: 'aggressive',
    dropChips: ['cannon', 'hiCannon'],
  },
  canodumb: {
    id: 'canodumb',
    name: 'Canodumb',
    hp: 60,
    attack: 40,
    behavior: 'aggressive',
    dropChips: ['shockWave', 'mCannon'],
  },
};
