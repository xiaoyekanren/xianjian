/**
 * Character entity and data structures
 * US-008: 角色数据系统
 */

import { Skill } from '@/data/Skill';

/**
 * Equipment slot types
 */
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

/**
 * Equipment configuration
 */
export interface Equipment {
  weaponId?: string;
  armorId?: string;
  accessoryId?: string;
}

/**
 * Growth coefficients for stat increases per level
 */
export interface GrowthCoefficients {
  hp: number;      // HP growth per level
  mp: number;      // MP growth per level
  attack: number;  // Attack growth per level
  defense: number; // Defense growth per level
  speed: number;   // Speed growth per level
  luck: number;    // Luck growth per level
}

/**
 * Skill learn entry - when a character learns a skill
 */
export interface SkillLearnEntry {
  skillId: string;
  learnLevel: number;  // Level at which this skill is learned
}

/**
 * Character base data - configuration from characters.json
 */
export interface CharacterData {
  id: string;
  name: string;
  description?: string;
  baseStats: {
    hp: number;
    mp: number;
    attack: number;
    defense: number;
    speed: number;
    luck: number;
  };
  growthCoefficients: GrowthCoefficients;
  skills: SkillLearnEntry[];
  initialEquipment?: Equipment;
  portrait?: string;     // Portrait image key for dialog
  sprite?: string;       // Walking sprite key
}

/**
 * Character runtime state - actual character instance in game
 */
export interface Character {
  id: string;
  name: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  luck: number;
  equipment: Equipment;
  learnedSkills: string[];  // IDs of learned skills
  availableSkills: Skill[]; // Skills available at current level
  statusEffects: StatusEffect[];
  portrait?: string;
  sprite?: string;
}

/**
 * Status effect on a character
 */
export interface StatusEffect {
  type: StatusType;
  duration: number;
  intensity: number;
}

/**
 * Status effect types
 */
export enum StatusType {
  POISON = 'poison',
  PARALYZE = 'paralyze',
  SLEEP = 'sleep',
  SILENCE = 'silence',
  PROTECT = 'protect',
  HASTE = 'haste',
  REGEN = 'regen',
}

/**
 * Character manager class
 * Handles character creation, leveling, and skill learning
 */
export class CharacterManager {
  private characterDataMap: Map<string, CharacterData> = new Map();

  /**
   * Load character data from configuration
   */
  loadCharacterData(data: CharacterData[]): void {
    for (const charData of data) {
      this.characterDataMap.set(charData.id, charData);
    }
  }

  /**
   * Get character base data by ID
   */
  getCharacterData(id: string): CharacterData | undefined {
    return this.characterDataMap.get(id);
  }

  /**
   * Create a character instance at a given level
   */
  createCharacter(id: string, level: number = 1, skills: Skill[]): Character {
    const data = this.characterDataMap.get(id);
    if (!data) {
      throw new Error(`Character data not found: ${id}`);
    }

    // Calculate stats based on level and growth coefficients
    const stats = this.calculateStatsAtLevel(data, level);

    // Determine learned skills at this level
    const learnedSkills = data.skills
      .filter(s => s.learnLevel <= level)
      .map(s => s.skillId);

    // Get available skills
    const availableSkills = skills.filter(s => learnedSkills.includes(s.id));

    return {
      id,
      name: data.name,
      level,
      exp: this.calculateExpForLevel(level),
      hp: stats.maxHp,
      maxHp: stats.maxHp,
      mp: stats.maxMp,
      maxMp: stats.maxMp,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      luck: stats.luck,
      equipment: data.initialEquipment ?? {},
      learnedSkills,
      availableSkills,
      statusEffects: [],
      portrait: data.portrait,
      sprite: data.sprite,
    };
  }

  /**
   * Calculate stats at a given level
   */
  private calculateStatsAtLevel(data: CharacterData, level: number): {
    maxHp: number;
    maxMp: number;
    attack: number;
    defense: number;
    speed: number;
    luck: number;
  } {
    const growth = data.growthCoefficients;
    const base = data.baseStats;

    // Stats = base + (level - 1) * growth
    return {
      maxHp: base.hp + (level - 1) * growth.hp,
      maxMp: base.mp + (level - 1) * growth.mp,
      attack: base.attack + (level - 1) * growth.attack,
      defense: base.defense + (level - 1) * growth.defense,
      speed: base.speed + (level - 1) * growth.speed,
      luck: base.luck + (level - 1) * growth.luck,
    };
  }

  /**
   * Calculate EXP required for a given level
   * Formula: EXP = level^2 * 100 (common JRPG pattern)
   */
  private calculateExpForLevel(level: number): number {
    if (level <= 1) return 0;
    return (level - 1) * (level - 1) * 100;
  }

  /**
   * Calculate EXP required to reach next level
   */
  getExpToNextLevel(currentLevel: number): number {
    return this.calculateExpForLevel(currentLevel + 1);
  }

  /**
   * Check if character can level up
   */
  canLevelUp(character: Character): boolean {
    const expNeeded = this.getExpToNextLevel(character.level);
    return character.exp >= expNeeded;
  }

  /**
   * Level up a character
   */
  levelUp(character: Character, allSkills: Skill[]): Character {
    const data = this.characterDataMap.get(character.id);
    if (!data) return character;

    const newLevel = character.level + 1;
    const newStats = this.calculateStatsAtLevel(data, newLevel);

    // Check for new skills learned at this level
    const newlyLearnedSkills = data.skills
      .filter(s => s.learnLevel === newLevel)
      .map(s => s.skillId);

    const learnedSkills = [...character.learnedSkills, ...newlyLearnedSkills];
    const availableSkills = allSkills.filter(s => learnedSkills.includes(s.id));

    return {
      ...character,
      level: newLevel,
      maxHp: newStats.maxHp,
      maxMp: newStats.maxMp,
      hp: newStats.maxHp,  // Full HP/MP on level up
      mp: newStats.maxMp,
      attack: newStats.attack,
      defense: newStats.defense,
      speed: newStats.speed,
      luck: newStats.luck,
      learnedSkills,
      availableSkills,
    };
  }

  /**
   * Add EXP to character and check for level ups
   */
  addExp(character: Character, expGain: number, allSkills: Skill[]): {
    character: Character;
    leveledUp: boolean;
    newSkills: string[];
  } {
    let current = { ...character, exp: character.exp + expGain };
    let leveledUp = false;
    const newSkills: string[] = [];

    // Check for multiple level ups
    while (this.canLevelUp(current)) {
      const data = this.characterDataMap.get(character.id);
      if (!data) break;

      const nextLevel = current.level + 1;
      const skillsAtLevel = data.skills
        .filter(s => s.learnLevel === nextLevel)
        .map(s => s.skillId);

      current = this.levelUp(current, allSkills);
      leveledUp = true;
      newSkills.push(...skillsAtLevel);
    }

    return { character: current, leveledUp, newSkills };
  }
}