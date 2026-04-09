/**
 * Enemy entity types and management
 * US-051: 敌人数据配置
 * US-032: 锁妖塔敌人配置
 */

import enemiesData from '@/data/enemies.json';

/**
 * Enemy category types
 */
export type EnemyCategory = 'normal' | 'elite' | 'boss';

/**
 * Item drop entry for enemies
 */
export interface EnemyDrop {
  itemId: string;
  probability: number;
}

/**
 * Enemy data structure matching enemies.json
 */
export interface EnemyType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: EnemyCategory;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  luck: number;
  expReward: number;
  goldReward: number;
  drops?: EnemyDrop[];
  spriteKey?: string;
}

/**
 * Tower encounter group
 */
export interface EncounterGroup {
  enemyId: string;
  count: number;
}

/**
 * Tower level encounter configuration
 */
export interface TowerEncounter {
  level: number;
  name: string;
  enemies: string[];
  groups: EncounterGroup[];
  encounterRate: number;
  boss?: string;
  isBottom?: boolean;
}

/**
 * Enemy data from enemies.json
 */
export interface EnemiesData {
  enemies: EnemyType[];
  towerEncounters: TowerEncounter[];
}

/**
 * Enemy Manager class
 * Loads and manages enemy data from enemies.json
 */
export class EnemyManager {
  private enemies: Map<string, EnemyType> = new Map();
  private towerEncounters: Map<number, TowerEncounter> = new Map();

  constructor() {
    this.loadFromData(enemiesData as EnemiesData);
  }

  /**
   * Load enemy data from configuration
   */
  private loadFromData(data: EnemiesData): void {
    // Load all enemies
    for (const enemy of data.enemies) {
      this.enemies.set(enemy.id, enemy);
    }

    // Load tower encounters
    for (const encounter of data.towerEncounters) {
      this.towerEncounters.set(encounter.level, encounter);
    }
  }

  /**
   * Get enemy by ID
   */
  getEnemy(id: string): EnemyType | undefined {
    return this.enemies.get(id);
  }

  /**
   * Get all enemies
   */
  getAllEnemies(): EnemyType[] {
    return Array.from(this.enemies.values());
  }

  /**
   * Get enemies by category
   */
  getEnemiesByCategory(category: EnemyCategory): EnemyType[] {
    return Array.from(this.enemies.values()).filter(e => e.category === category);
  }

  /**
   * Get tower encounter for a level
   */
  getTowerEncounter(level: number): TowerEncounter | undefined {
    return this.towerEncounters.get(level);
  }

  /**
   * Get all tower encounters
   */
  getAllTowerEncounters(): TowerEncounter[] {
    return Array.from(this.towerEncounters.values());
  }

  /**
   * Generate random encounter group for tower level
   */
  generateRandomEncounter(level: number): EnemyType[] {
    const encounter = this.towerEncounters.get(level);
    if (!encounter) return [];

    // Randomly select one of the groups
    const group = encounter.groups[Math.floor(Math.random() * encounter.groups.length)];

    // Create enemy instances
    const result: EnemyType[] = [];
    for (let i = 0; i < group.count; i++) {
      const enemy = this.enemies.get(group.enemyId);
      if (enemy) {
        result.push(enemy);
      }
    }

    return result;
  }

  /**
   * Check if encounter should trigger based on rate
   */
  shouldEncounter(level: number): boolean {
    const encounter = this.towerEncounters.get(level);
    if (!encounter) return false;
    return Math.random() < encounter.encounterRate;
  }

  /**
   * Get boss for tower level if exists
   */
  getTowerBoss(level: number): EnemyType | undefined {
    const encounter = this.towerEncounters.get(level);
    if (!encounter || !encounter.boss) return undefined;
    return this.enemies.get(encounter.boss);
  }
}

// Singleton instance
export const enemyManager = new EnemyManager();

/**
 * Legacy Enemy interface for compatibility with BattleSystem
 */
export interface Enemy {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  expReward: number;
  goldReward: number;
}

/**
 * Enemy entity placeholder class
 */
export class EnemyEntity {
  // Placeholder for future expansion
}