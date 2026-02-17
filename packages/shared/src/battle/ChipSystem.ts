import { Chip, ChipElement } from '../types/Chip.js';

/**
 * Chip execution and damage calculation
 */
export class ChipSystem {
  static calculateDamage(chip: Chip, targetElement: ChipElement, hitAccuracy: boolean = true): number {
    let damage = chip.damage;

    // Element effectiveness
    const effectiveness = this.getElementEffectiveness(chip.element, targetElement);
    damage = Math.floor(damage * effectiveness);

    // Accuracy check
    if (!hitAccuracy && Math.random() > chip.accuracy / 100) {
      return 0;
    }

    return damage;
  }

  static getElementEffectiveness(source: ChipElement, target: ChipElement): number {
    // Element advantage system (simplified)
    const advantages: Record<ChipElement, ChipElement[]> = {
      fire: ['wood', 'break'],
      aqua: ['fire', 'elec'],
      elec: ['aqua'],
      wood: ['aqua'],
      wind: ['normal'],
      break: ['elec'],
      normal: [],
      cursor: [],
    };

    return advantages[source]?.includes(target) ? 1.5 : 1.0;
  }

  static cloneChip(chip: Chip): Chip {
    return JSON.parse(JSON.stringify(chip));
  }
}
