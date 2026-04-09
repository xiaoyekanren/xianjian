/**
 * Ending System - Multi-ending determination and playback
 * US-041: 多结局系统
 */

import { AffectionData } from '@/systems/SaveSystem';
import { InventoryEntry } from '@/data/Item';

/**
 * Ending types
 */
export enum EndingType {
  LINGER_DEFAULT = 'linger_default',    // 灵儿结局（默认）
  YUERU_REUNION = 'yueru_reunion',      // 月如结局（收集特定道具）
  ALL_SURVIVE = 'all_survive',          // 全员存活结局（好感度+道具条件）
}

/**
 * Ending condition requirements
 */
export interface EndingCondition {
  // Required items in inventory
  requiredItems?: string[];
  // Minimum affection levels
  minAffection?: {
    zhao_linger?: number;
    lin_yueru?: number;
    anu?: number;
  };
  // Required story flags
  requiredFlags?: string[];
  // Special conditions
  hasYueruRelic?: boolean;
  allAffectionHigh?: boolean;  // All three at 亲密 or 深爱
}

/**
 * Ending configuration
 */
export interface EndingConfig {
  id: EndingType;
  name: string;
  title: string;
  description: string;
  condition: EndingCondition;
  dialogSequence: string[];  // Dialog IDs to play
  screenEffects?: {
    type: 'fade' | 'flash' | 'ink_spread';
    color?: string;
    duration?: number;
  }[];
  finalImage?: string;  // Final ending image/scene
  credits?: boolean;    // Show credits after ending
  priority: number;     // Higher priority endings checked first
}

/**
 * Ending determination result
 */
export interface EndingResult {
  ending: EndingType;
  name: string;
  title: string;
  conditionMet: string;  // Description of why this ending was chosen
  dialogSequence: string[];
}

/**
 * All endings configuration
 */
export const ENDINGS: EndingConfig[] = [
  {
    id: EndingType.ALL_SURVIVE,
    name: '全员存活',
    title: '女娲神迹·团圆',
    description: '所有人存活，圆满结局',
    condition: {
      requiredItems: ['yueru_relic', 'nuwa_amulet'],
      minAffection: {
        zhao_linger: 80,
        lin_yueru: 80,
        anu: 80,
      },
      requiredFlags: ['final_battle_complete'],
      allAffectionHigh: true,
    },
    dialogSequence: ['ending_all_survive_intro', 'ending_all_survive_reunion', 'ending_all_survive_final'],
    screenEffects: [
      { type: 'flash', color: '#FFD700', duration: 2000 },
      { type: 'fade', color: '#FFFFFF', duration: 1000 },
    ],
    finalImage: 'ending_all_survive',
    credits: true,
    priority: 100,
  },
  {
    id: EndingType.YUERU_REUNION,
    name: '月如重逢',
    title: '剑舞情缘·重逢',
    description: '月如通过遗物复活，与逍遥重逢',
    condition: {
      requiredItems: ['yueru_relic'],
      minAffection: {
        lin_yueru: 60,
      },
      requiredFlags: ['final_battle_complete'],
      hasYueruRelic: true,
    },
    dialogSequence: ['ending_yueru_intro', 'ending_yueru_reunion', 'ending_yueru_final'],
    screenEffects: [
      { type: 'ink_spread', duration: 1500 },
      { type: 'fade', color: '#FFC0CB', duration: 1000 },
    ],
    finalImage: 'ending_yueru',
    credits: true,
    priority: 50,
  },
  {
    id: EndingType.LINGER_DEFAULT,
    name: '灵儿结局',
    title: '女娲传承·永恒',
    description: '灵儿传承女娲之力，守护世间',
    condition: {
      requiredFlags: ['final_battle_complete'],
    },
    dialogSequence: ['ending_linger_intro', 'ending_linger_sacrifice', 'ending_linger_final'],
    screenEffects: [
      { type: 'fade', color: '#000000', duration: 1500 },
      { type: 'flash', color: '#E0F7FA', duration: 1000 },
    ],
    finalImage: 'ending_linger',
    credits: true,
    priority: 10,
  },
];

/**
 * Ending System class
 * Determines which ending to play based on game state
 */
export class EndingSystem {
  /**
   * Determine the ending based on game state
   */
  static determineEnding(
    inventory: InventoryEntry[],
    affection: AffectionData,
    storyFlags: Record<string, boolean>
  ): EndingResult {
    // Sort endings by priority (highest first)
    const sortedEndings = [...ENDINGS].sort((a, b) => b.priority - a.priority);

    for (const ending of sortedEndings) {
      if (this.meetsCondition(ending.condition, inventory, affection, storyFlags)) {
        return {
          ending: ending.id,
          name: ending.name,
          title: ending.title,
          conditionMet: this.getConditionDescription(ending),
          dialogSequence: ending.dialogSequence,
        };
      }
    }

    // Default to Ling'er ending if no conditions met
    const defaultEnding = ENDINGS.find(e => e.id === EndingType.LINGER_DEFAULT)!;
    return {
      ending: defaultEnding.id,
      name: defaultEnding.name,
      title: defaultEnding.title,
      conditionMet: '默认结局条件满足',
      dialogSequence: defaultEnding.dialogSequence,
    };
  }

  /**
   * Check if ending condition is met
   */
  private static meetsCondition(
    condition: EndingCondition,
    inventory: InventoryEntry[],
    affection: AffectionData,
    storyFlags: Record<string, boolean>
  ): boolean {
    // Check required flags
    if (condition.requiredFlags) {
      for (const flag of condition.requiredFlags) {
        if (!storyFlags[flag]) {
          return false;
        }
      }
    }

    // Check required items
    if (condition.requiredItems) {
      for (const itemId of condition.requiredItems) {
        const hasItem = inventory.some(entry => entry.itemId === itemId && entry.quantity > 0);
        if (!hasItem) {
          return false;
        }
      }
    }

    // Check minimum affection levels
    if (condition.minAffection) {
      if (condition.minAffection.zhao_linger && affection.zhao_linger < condition.minAffection.zhao_linger) {
        return false;
      }
      if (condition.minAffection.lin_yueru && affection.lin_yueru < condition.minAffection.lin_yueru) {
        return false;
      }
      if (condition.minAffection.anu && affection.anu < condition.minAffection.anu) {
        return false;
      }
    }

    // Check special conditions
    if (condition.hasYueruRelic) {
      const hasRelic = inventory.some(entry => entry.itemId === 'yueru_relic' && entry.quantity > 0);
      if (!hasRelic) {
        return false;
      }
    }

    // Check all affection high condition (all at 亲密 (60) or above)
    if (condition.allAffectionHigh) {
      if (affection.zhao_linger < 60 || affection.lin_yueru < 60 || affection.anu < 60) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get description of why ending was chosen
   */
  private static getConditionDescription(ending: EndingConfig): string {
    const parts: string[] = [];

    if (ending.condition.requiredItems) {
      parts.push(`持有${ending.condition.requiredItems.map(id => this.getItemName(id)).join('、')}`);
    }

    if (ending.condition.minAffection) {
      const affectionNames: string[] = [];
      if (ending.condition.minAffection.zhao_linger) {
        affectionNames.push(`赵灵儿好感度≥${ending.condition.minAffection.zhao_linger}`);
      }
      if (ending.condition.minAffection.lin_yueru) {
        affectionNames.push(`林月如好感度≥${ending.condition.minAffection.lin_yueru}`);
      }
      if (ending.condition.minAffection.anu) {
        affectionNames.push(`阿奴好感度≥${ending.condition.minAffection.anu}`);
      }
      if (affectionNames.length > 0) {
        parts.push(affectionNames.join('，'));
      }
    }

    if (parts.length === 0) {
      return '完成最终战斗';
    }

    return parts.join('，');
  }

  /**
   * Get item name by ID
   */
  private static getItemName(itemId: string): string {
    const itemNames: Record<string, string> = {
      'yueru_relic': '月如遗物',
      'nuwa_amulet': '女娲玉佩',
      'fire_pearl': '火灵珠',
      'water_pearl': '水灵珠',
      'wind_pearl': '风灵珠',
      'thunder_pearl': '雷灵珠',
      'earth_pearl': '土灵珠',
    };
    return itemNames[itemId] || itemId;
  }

  /**
   * Get ending config by type
   */
  static getEndingConfig(type: EndingType): EndingConfig | undefined {
    return ENDINGS.find(e => e.id === type);
  }

  /**
   * Get all ending types
   */
  static getAllEndingTypes(): EndingType[] {
    return ENDINGS.map(e => e.id);
  }

  /**
   * Get ending preview info for UI
   */
  static getEndingPreview(type: EndingType): {
    name: string;
    title: string;
    description: string;
  } {
    const ending = ENDINGS.find(e => e.id === type);
    if (!ending) {
      return {
        name: '未知',
        title: '未知结局',
        description: '',
      };
    }
    return {
      name: ending.name,
      title: ending.title,
      description: ending.description,
    };
  }

  /**
   * Check which endings are achievable with current state
   */
  static getAchievableEndings(
    inventory: InventoryEntry[],
    affection: AffectionData,
    storyFlags: Record<string, boolean>
  ): EndingType[] {
    return ENDINGS
      .filter(ending => this.meetsCondition(ending.condition, inventory, affection, storyFlags))
      .map(ending => ending.id);
  }

  /**
   * Get ending requirements description for UI
   */
  static getEndingRequirements(type: EndingType): string[] {
    const ending = ENDINGS.find(e => e.id === type);
    if (!ending) return [];

    const requirements: string[] = [];

    if (ending.condition.requiredItems) {
      requirements.push(`需要物品: ${ending.condition.requiredItems.map(id => this.getItemName(id)).join('、')}`);
    }

    if (ending.condition.minAffection) {
      if (ending.condition.minAffection.zhao_linger) {
        requirements.push(`赵灵儿好感度≥${ending.condition.minAffection.zhao_linger}（${this.getAffectionLevelName(ending.condition.minAffection.zhao_linger)}）`);
      }
      if (ending.condition.minAffection.lin_yueru) {
        requirements.push(`林月如好感度≥${ending.condition.minAffection.lin_yueru}（${this.getAffectionLevelName(ending.condition.minAffection.lin_yueru)}）`);
      }
      if (ending.condition.minAffection.anu) {
        requirements.push(`阿奴好感度≥${ending.condition.minAffection.anu}（${this.getAffectionLevelName(ending.condition.minAffection.anu)}）`);
      }
    }

    if (ending.condition.allAffectionHigh) {
      requirements.push('三人均达到亲密或深爱级别（≥60）');
    }

    if (requirements.length === 0) {
      requirements.push('完成最终战斗即可触发');
    }

    return requirements;
  }

  /**
   * Get affection level name for value
   */
  private static getAffectionLevelName(value: number): string {
    if (value >= 80) return '深爱';
    if (value >= 60) return '亲密';
    if (value >= 40) return '友好';
    if (value >= 20) return '普通';
    return '冷淡';
  }
}

/**
 * Default endings data for JSON export
 */
export const DEFAULT_ENDINGS_DATA = ENDINGS;