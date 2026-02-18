import { Chip, ChipElement } from '../types/Chip.js';

/**
 * Chip execution and damage calculation
 *
 * MMBN3 element system:
 * - Fire beats Wood (2x)
 * - Wood beats Elec (2x)
 * - Elec beats Aqua (2x)
 * - Aqua beats Fire (2x)
 * - None is neutral against everything
 */
export class ChipSystem {
  static calculateDamage(chip: Chip, targetElement: ChipElement): number {
    let damage = chip.damage;

    const effectiveness = this.getElementEffectiveness(chip.element, targetElement);
    damage = Math.floor(damage * effectiveness);

    return damage;
  }

  static getElementEffectiveness(source: ChipElement, target: ChipElement): number {
    if (source === 'none' || target === 'none') return 1.0;

    const advantages: Partial<Record<ChipElement, ChipElement>> = {
      fire: 'wood',
      wood: 'elec',
      elec: 'aqua',
      aqua: 'fire',
    };

    if (advantages[source] === target) return 2.0;
    if (advantages[target] === source) return 0.5;

    return 1.0;
  }

  static cloneChip(chip: Chip): Chip {
    return JSON.parse(JSON.stringify(chip));
  }
}
