/**
 * Inn System - Rest and recovery at inns
 * US-020: 旅馆系统实现
 */

import { Character } from '@/entities/Character';
import { SaveSystem, SaveData } from './SaveSystem';

/**
 * Inn data for a location
 */
export interface InnData {
  id: string;
  name: string;
  location: string;   // Map ID where inn is located
  price: number;      // Cost per rest
  healPercent?: number;  // Percentage of HP/MP to heal (default 100%)
}

/**
 * Inn rest result
 */
export interface InnResult {
  success: boolean;
  message: string;
  goldSpent: number;
  charactersHealed: string[];
}

/**
 * Inn System class
 * Handles resting at inns for HP/MP recovery and status removal
 */
export class InnSystem {
  private inns: Map<string, InnData> = new Map();

  /**
   * Load inn data from configuration
   */
  loadInns(inns: InnData[]): void {
    for (const inn of inns) {
      this.inns.set(inn.id, inn);
    }
  }

  /**
   * Get inn by ID
   */
  getInn(id: string): InnData | undefined {
    return this.inns.get(id);
  }

  /**
   * Get inns at a location
   */
  getInnsAtLocation(locationId: string): InnData[] {
    const locationInns: InnData[] = [];
    for (const inn of this.inns.values()) {
      if (inn.location === locationId) {
        locationInns.push(inn);
      }
    }
    return locationInns;
  }

  /**
   * Rest at an inn
   */
  rest(
    innId: string,
    party: Character[],
    playerGold: number,
    saveData: Omit<SaveData, 'slotId' | 'timestamp'>
  ): InnResult {
    const inn = this.inns.get(innId);

    if (!inn) {
      return {
        success: false,
        message: '旅馆不存在',
        goldSpent: 0,
        charactersHealed: [],
      };
    }

    // Check if player can afford
    if (playerGold < inn.price) {
      return {
        success: false,
        message: `金钱不足，需要 ${inn.price} 金币`,
        goldSpent: 0,
        charactersHealed: [],
      };
    }

    // Heal all party members
    const healPercent = inn.healPercent ?? 100;
    const healedNames: string[] = [];

    for (const character of party) {
      // Restore HP/MP
      if (healPercent === 100) {
        character.hp = character.maxHp;
        character.mp = character.maxMp;
      } else {
        const hpHeal = Math.floor(character.maxHp * healPercent / 100);
        const mpHeal = Math.floor(character.maxMp * healPercent / 100);
        character.hp = Math.min(character.maxHp, character.hp + hpHeal);
        character.mp = Math.min(character.maxMp, character.mp + mpHeal);
      }

      // Remove all negative status effects
      character.statusEffects = [];

      healedNames.push(character.name);
    }

    // Auto-save after resting
    SaveSystem.quickSave(saveData);

    return {
      success: true,
      message: `在${inn.name}休息一晚，花费 ${inn.price} 金币。全员HP/MP完全恢复！`,
      goldSpent: inn.price,
      charactersHealed: healedNames,
    };
  }

  /**
   * Get inn price for display
   */
  getInnPrice(innId: string): number | null {
    const inn = this.inns.get(innId);
    return inn ? inn.price : null;
  }

  /**
   * Check if player can afford inn
   */
  canAfford(innId: string, playerGold: number): boolean {
    const inn = this.inns.get(innId);
    return inn ? playerGold >= inn.price : false;
  }
}

/**
 * Default inn configurations
 */
export const DEFAULT_INNS: InnData[] = [
  {
    id: 'yuhang_inn',
    name: '余杭客栈',
    location: 'yuhang_town',
    price: 50,
  },
  {
    id: 'suzhou_inn',
    name: '苏州客栈',
    location: 'suzhou_city',
    price: 100,
  },
  {
    id: 'miao_inn',
    name: '苗寨客栈',
    location: 'miao_village',
    price: 80,
  },
  {
    id: 'xianling_inn',
    name: '仙灵岛客栈',
    location: 'xianling_island',
    price: 200,
  },
];