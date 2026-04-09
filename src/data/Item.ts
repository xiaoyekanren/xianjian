/**
 * Item interface - Defines item properties
 * US-014: 物品系统实现
 */

import { StatusType } from '@/entities/Character';

/**
 * Item type categories
 */
export type ItemType = 'consumable' | 'weapon' | 'armor' | 'accessory' | 'key';

/**
 * Item effect configuration
 */
export interface ItemEffect {
  hp?: number;           // HP change (positive = heal, negative = damage)
  mp?: number;           // MP change (positive = restore, negative = consume)
  statusEffect?: {       // Status effect applied
    type: StatusType;
    duration: number;
    intensity: number;
  };
  removeStatus?: string[];  // Status effect names to remove (e.g., 'poison', 'paralyze')
}

/**
 * Equipment attribute bonuses
 */
export interface EquipmentBonus {
  hp?: number;           // Max HP bonus
  mp?: number;           // Max MP bonus
  attack?: number;       // Attack bonus
  defense?: number;      // Defense bonus
  speed?: number;        // Speed bonus
  luck?: number;         // Luck bonus
}

/**
 * Item interface
 */
export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  price: number;         // Buy price (sell price = price / 2)
  effect?: ItemEffect;   // Effect when used (for consumables)
  bonus?: EquipmentBonus; // Attribute bonuses (for equipment)
  usableInBattle?: boolean;  // Can be used in battle
  usableInMenu?: boolean;    // Can be used in menu
  targetCount?: number;      // Number of targets (1 = single, -1 = all)
}

/**
 * Inventory entry
 */
export interface InventoryEntry {
  itemId: string;
  quantity: number;
  equipped?: boolean;    // For equipment items
  equippedTo?: string;   // Character ID if equipped
}

/**
 * Item manager class
 * Handles item effects and equipment bonuses
 */
export class ItemManager {
  private items: Map<string, Item> = new Map();

  /**
   * Load items from configuration
   */
  loadItems(items: Item[]): void {
    for (const item of items) {
      this.items.set(item.id, item);
    }
  }

  /**
   * Get item by ID
   */
  getItem(id: string): Item | undefined {
    return this.items.get(id);
  }

  /**
   * Check if item can be used
   */
  canUse(item: Item, context: 'battle' | 'menu'): boolean {
    if (item.type !== 'consumable') return false;
    if (context === 'battle' && !item.usableInBattle) return false;
    if (context === 'menu' && !item.usableInMenu) return false;
    return true;
  }

  /**
   * Apply item effect to a character
   */
  applyEffect(item: Item, character: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    statusEffects: { type: StatusType; duration: number; intensity: number }[];
  }): {
    hpChange: number;
    mpChange: number;
    removedStatuses: string[];
    addedStatus: { type: StatusType; duration: number; intensity: number } | null;
  } {
    const result = {
      hpChange: 0,
      mpChange: 0,
      removedStatuses: [] as string[],
      addedStatus: null as { type: StatusType; duration: number; intensity: number } | null,
    };

    if (!item.effect) return result;

    // Apply HP change
    if (item.effect.hp) {
      const newHp = Math.min(character.maxHp, Math.max(0, character.hp + item.effect.hp));
      result.hpChange = newHp - character.hp;
    }

    // Apply MP change
    if (item.effect.mp) {
      const newMp = Math.min(character.maxMp, Math.max(0, character.mp + item.effect.mp));
      result.mpChange = newMp - character.mp;
    }

    // Remove status effects
    if (item.effect.removeStatus) {
      result.removedStatuses = item.effect.removeStatus;
    }

    // Add status effect
    if (item.effect.statusEffect) {
      result.addedStatus = item.effect.statusEffect;
    }

    return result;
  }

  /**
   * Calculate equipment bonuses for a character
   */
  calculateEquipmentBonus(equippedItems: Item[]): EquipmentBonus {
    const totalBonus: EquipmentBonus = {};

    for (const item of equippedItems) {
      if (item.bonus) {
        if (item.bonus.hp !== undefined) {
          totalBonus.hp = (totalBonus.hp ?? 0) + item.bonus.hp;
        }
        if (item.bonus.mp !== undefined) {
          totalBonus.mp = (totalBonus.mp ?? 0) + item.bonus.mp;
        }
        if (item.bonus.attack !== undefined) {
          totalBonus.attack = (totalBonus.attack ?? 0) + item.bonus.attack;
        }
        if (item.bonus.defense !== undefined) {
          totalBonus.defense = (totalBonus.defense ?? 0) + item.bonus.defense;
        }
        if (item.bonus.speed !== undefined) {
          totalBonus.speed = (totalBonus.speed ?? 0) + item.bonus.speed;
        }
        if (item.bonus.luck !== undefined) {
          totalBonus.luck = (totalBonus.luck ?? 0) + item.bonus.luck;
        }
      }
    }

    return totalBonus;
  }

  /**
   * Get sell price for an item
   */
  getSellPrice(item: Item): number {
    return Math.floor(item.price / 2);
  }
}