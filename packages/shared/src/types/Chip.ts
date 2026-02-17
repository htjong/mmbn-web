export type ChipElement = 'normal' | 'fire' | 'aqua' | 'elec' | 'wood' | 'wind' | 'break' | 'cursor';

export interface Chip {
  id: string;
  name: string;
  element: ChipElement;
  damage: number;
  accuracy: number; // 0-100, percentage
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  effects: ChipEffect[];
  customCost: number; // Points needed to use
  description: string;
}

export interface ChipEffect {
  type: 'damage' | 'heal' | 'panel_break' | 'area_effect' | 'buff' | 'debuff';
  value: number;
  areaSize?: 'single' | 'line' | 'area';
  areaRadius?: number;
}

export type ChipLibrary = Map<string, Chip>;
