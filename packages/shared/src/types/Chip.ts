export type ChipElement = 'none' | 'fire' | 'aqua' | 'elec' | 'wood';

export interface Chip {
  id: string;
  name: string;
  element: ChipElement;
  damage: number;
  effects: ChipEffect[];
  description: string;
}

export interface ChipEffect {
  type: 'damage' | 'heal' | 'panel_break' | 'area_effect' | 'buff' | 'debuff';
  value: number;
  areaSize?: 'single' | 'line' | 'area';
  areaRadius?: number;
}

export type ChipLibrary = Map<string, Chip>;
