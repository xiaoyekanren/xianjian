/**
 * Affection System - Relationship management for female characters
 * US-025: 好感度系统实现
 */

/**
 * Character IDs for affection tracking
 */
export type AffectionCharacterId = 'zhao_linger' | 'lin_yueru' | 'anu';

/**
 * Affection level names
 */
export enum AffectionLevel {
  COLD = '冷淡',       // 0-19
  NORMAL = '普通',     // 20-39
  FRIENDLY = '友好',   // 40-59
  CLOSE = '亲密',      // 60-79
  LOVE = '深爱',       // 80-100
}

/**
 * Affection level thresholds
 */
const AFFECTION_THRESHOLDS: { level: AffectionLevel; min: number; max: number }[] = [
  { level: AffectionLevel.COLD, min: 0, max: 19 },
  { level: AffectionLevel.NORMAL, min: 20, max: 39 },
  { level: AffectionLevel.FRIENDLY, min: 40, max: 59 },
  { level: AffectionLevel.CLOSE, min: 60, max: 79 },
  { level: AffectionLevel.LOVE, min: 80, max: 100 },
];

/**
 * Gift gift effectiveness for each character
 */
const GIFT_EFFECTIVENESS: Record<string, Record<AffectionCharacterId, number>> = {
  // Flowers are most effective for 赵灵儿
  'flower': { zhao_linger: 15, lin_yueru: 5, anu: 8 },
  // Jewelry is most effective for 林月如
  'jewelry': { zhao_linger: 8, lin_yueru: 15, anu: 5 },
  // Herbs are most effective for 阿奴
  'herb': { zhao_linger: 5, lin_yueru: 8, anu: 15 },
  // Generic gifts
  'candy': { zhao_linger: 10, lin_yueru: 10, anu: 10 },
  'book': { zhao_linger: 8, lin_yueru: 8, anu: 8 },
};

/**
 * Affection change result
 */
export interface AffectionChange {
  characterId: AffectionCharacterId;
  oldValue: number;
  newValue: number;
  change: number;
  levelUp?: boolean;
  oldLevel?: AffectionLevel;
  newLevel?: AffectionLevel;
}

/**
 * Affection System class
 * Manages relationship levels for the three female characters
 */
export class AffectionSystem {
  private affections: Record<AffectionCharacterId, number> = {
    zhao_linger: 0,
    lin_yueru: 0,
    anu: 0,
  };

  /**
   * Initialize affection values
   */
  constructor(initialAffections?: Partial<Record<AffectionCharacterId, number>>) {
    if (initialAffections) {
      for (const key of Object.keys(initialAffections) as AffectionCharacterId[]) {
        this.affections[key] = this.clampValue(initialAffections[key] ?? 0);
      }
    }
  }

  /**
   * Clamp affection value to 0-100
   */
  private clampValue(value: number): number {
    return Math.max(0, Math.min(100, value));
  }

  /**
   * Get affection value for a character
   */
  getAffection(characterId: AffectionCharacterId): number {
    return this.affections[characterId];
  }

  /**
   * Get all affection values
   */
  getAllAffections(): Record<AffectionCharacterId, number> {
    return { ...this.affections };
  }

  /**
   * Get affection level for a character
   */
  getAffectionLevel(characterId: AffectionCharacterId): AffectionLevel {
    const value = this.affections[characterId];
    for (const threshold of AFFECTION_THRESHOLDS) {
      if (value >= threshold.min && value <= threshold.max) {
        return threshold.level;
      }
    }
    return AffectionLevel.COLD;
  }

  /**
   * Get level info for a value
   */
  private getLevelInfo(value: number): { level: AffectionLevel; min: number; max: number } {
    for (const threshold of AFFECTION_THRESHOLDS) {
      if (value >= threshold.min && value <= threshold.max) {
        return threshold;
      }
    }
    return AFFECTION_THRESHOLDS[0];
  }

  /**
   * Add affection from dialog choice
   */
  addDialogAffection(
    characterId: AffectionCharacterId,
    choiceIndex: number,
    goodChoiceIndex: number
  ): AffectionChange {
    const oldValue = this.affections[characterId];
    const oldLevel = this.getLevelInfo(oldValue).level;

    // Good choice = +5, neutral = +2, bad = -3
    let change = 2; // neutral
    if (choiceIndex === goodChoiceIndex) {
      change = 5;
    } else if (choiceIndex < 0 || choiceIndex > goodChoiceIndex + 2) {
      change = -3;
    }

    const newValue = this.clampValue(oldValue + change);
    this.affections[characterId] = newValue;

    const newLevel = this.getLevelInfo(newValue).level;

    return {
      characterId,
      oldValue,
      newValue,
      change,
      levelUp: oldLevel !== newLevel,
      oldLevel,
      newLevel,
    };
  }

  /**
   * Add affection from gift
   */
  addGiftAffection(
    characterId: AffectionCharacterId,
    giftType: string
  ): AffectionChange {
    const oldValue = this.affections[characterId];
    const oldLevel = this.getLevelInfo(oldValue).level;

    // Get gift effectiveness
    const effectiveness = GIFT_EFFECTIVENESS[giftType]?.[characterId] ?? 5;
    const newValue = this.clampValue(oldValue + effectiveness);
    this.affections[characterId] = newValue;

    const newLevel = this.getLevelInfo(newValue).level;

    return {
      characterId,
      oldValue,
      newValue,
      change: effectiveness,
      levelUp: oldLevel !== newLevel,
      oldLevel,
      newLevel,
    };
  }

  /**
   * Add custom affection change
   */
  addAffection(characterId: AffectionCharacterId, amount: number): AffectionChange {
    const oldValue = this.affections[characterId];
    const oldLevel = this.getLevelInfo(oldValue).level;

    const newValue = this.clampValue(oldValue + amount);
    this.affections[characterId] = newValue;

    const newLevel = this.getLevelInfo(newValue).level;

    return {
      characterId,
      oldValue,
      newValue,
      change: amount,
      levelUp: oldLevel !== newLevel,
      oldLevel,
      newLevel,
    };
  }

  /**
   * Check if combo skill is unlocked
   * Combo skills require minimum affection levels
   */
  isComboSkillUnlocked(
    skillId: string,
    comboRequirements: Record<string, Partial<Record<AffectionCharacterId, number>>>
  ): boolean {
    const requirements = comboRequirements[skillId];
    if (!requirements) return false;

    for (const charId of Object.keys(requirements) as AffectionCharacterId[]) {
      if (this.affections[charId] < (requirements[charId] ?? 0)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get unlocked combo skills
   */
  getUnlockedComboSkills(
    comboRequirements: Record<string, Partial<Record<AffectionCharacterId, number>>>
  ): string[] {
    const unlocked: string[] = [];
    for (const skillId of Object.keys(comboRequirements)) {
      if (this.isComboSkillUnlocked(skillId, comboRequirements)) {
        unlocked.push(skillId);
      }
    }
    return unlocked;
  }

  /**
   * Set affection directly (for loading save data)
   */
  setAffection(characterId: AffectionCharacterId, value: number): void {
    this.affections[characterId] = this.clampValue(value);
  }

  /**
   * Set all affections (for loading save data)
   */
  setAllAffections(affections: Partial<Record<AffectionCharacterId, number>>): void {
    for (const key of Object.keys(affections) as AffectionCharacterId[]) {
      this.affections[key] = this.clampValue(affections[key] ?? 0);
    }
  }

  /**
   * Get affection progress for UI
   */
  getAffectionProgress(characterId: AffectionCharacterId): {
    value: number;
    level: AffectionLevel;
    nextLevel: AffectionLevel | null;
    progressToNext: number;
  } {
    const value = this.affections[characterId];
    const currentLevel = this.getLevelInfo(value);
    const levelIndex = AFFECTION_THRESHOLDS.indexOf(currentLevel);
    const nextThreshold = levelIndex < AFFECTION_THRESHOLDS.length - 1
      ? AFFECTION_THRESHOLDS[levelIndex + 1]
      : null;

    let progressToNext = 0;
    if (nextThreshold) {
      const rangeStart = currentLevel.max + 1;
      const rangeEnd = nextThreshold.max;
      progressToNext = (value - rangeStart + 1) / (rangeEnd - rangeStart + 1);
    } else {
      progressToNext = 1; // Max level
    }

    return {
      value,
      level: currentLevel.level,
      nextLevel: nextThreshold?.level ?? null,
      progressToNext: Math.max(0, Math.min(1, progressToNext)),
    };
  }
}

/**
 * Combo skill requirements for affection system
 */
export const COMBO_SKILL_REQUIREMENTS: Record<string, Partial<Record<AffectionCharacterId, number>>> = {
  // 双人合体技
  'sword_dance': { zhao_linger: 60, lin_yueru: 60 },      // 剑舞乾坤 (李逍遥+赵灵儿/林月如)
  'immortal_demon': { zhao_linger: 80, lin_yueru: 80 },   // 仙魔同归 (赵灵儿+林月如)
  'spirit_storm': { zhao_linger: 70, anu: 70 },           // 灵神风暴 (赵灵儿+阿奴)
  'shadow_blade': { lin_yueru: 70, anu: 70 },             // 影刃绝杀 (林月如+阿奴)

  // 四人合体技
  'four_directions': { zhao_linger: 50, lin_yueru: 50, anu: 50 },  // 四方合击
  'nuwa_power': { zhao_linger: 90, lin_yueru: 90, anu: 90 },       // 女娲神威
};