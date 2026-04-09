/**
 * Treasure System - Treasure chest management
 * US-024: 宝箱系统
 */

/**
 * Treasure content types
 */
export interface TreasureContent {
  itemId?: string;
  quantity?: number;
  gold?: number;
  exp?: number;
  skillId?: string;  // Learn a skill directly
}

/**
 * Treasure box data
 */
export interface TreasureBox {
  id: string;             // Unique identifier
  mapId: string;          // Map where chest is located
  x: number;              // X position on map
  y: number;              // Y position on map
  contents: TreasureContent[];
  requireItem?: string;   // Item required to open (e.g., key)
  requireFlag?: string;   // Story flag required to appear
  hidden?: boolean;       // Hidden until discovered
}

/**
 * Treasure open result
 */
export interface TreasureResult {
  success: boolean;
  message: string;
  items: { itemId: string; quantity: number }[];
  gold: number;
  exp: number;
  skills: string[];
  alreadyOpened: boolean;
}

/**
 * Treasure System class
 * Manages treasure chests and their state
 */
export class TreasureSystem {
  private treasures: Map<string, TreasureBox> = new Map();
  private openedChests: Set<string> = new Set();  // Set of opened treasure IDs

  /**
   * Load treasure data from configuration
   */
  loadTreasures(treasures: TreasureBox[]): void {
    for (const treasure of treasures) {
      this.treasures.set(treasure.id, treasure);
    }
  }

  /**
   * Load opened chest state (from save data)
   */
  loadOpenedState(openedIds: string[]): void {
    this.openedChests = new Set(openedIds);
  }

  /**
   * Get opened chest IDs (for save data)
   */
  getOpenedState(): string[] {
    return Array.from(this.openedChests);
  }

  /**
   * Get treasure by ID
   */
  getTreasure(id: string): TreasureBox | undefined {
    return this.treasures.get(id);
  }

  /**
   * Get treasures at a map location
   */
  getTreasuresAtMap(mapId: string): TreasureBox[] {
    const mapTreasures: TreasureBox[] = [];
    for (const treasure of this.treasures.values()) {
      if (treasure.mapId === mapId) {
        mapTreasures.push(treasure);
      }
    }
    return mapTreasures;
  }

  /**
   * Check if treasure can be opened
   */
  canOpen(
    treasureId: string,
    playerItems: string[],
    storyFlags: Record<string, boolean>
  ): { canOpen: boolean; reason: string } {
    const treasure = this.treasures.get(treasureId);

    if (!treasure) {
      return { canOpen: false, reason: '宝箱不存在' };
    }

    if (this.openedChests.has(treasureId)) {
      return { canOpen: false, reason: '宝箱已打开' };
    }

    if (treasure.requireItem && !playerItems.includes(treasure.requireItem)) {
      return { canOpen: false, reason: '需要特定道具才能打开' };
    }

    if (treasure.requireFlag && !storyFlags[treasure.requireFlag]) {
      return { canOpen: false, reason: '现在无法打开' };
    }

    return { canOpen: true, reason: '' };
  }

  /**
   * Open a treasure chest
   */
  openTreasure(
    treasureId: string,
    playerItems: string[],
    storyFlags: Record<string, boolean>
  ): TreasureResult {
    const canOpenResult = this.canOpen(treasureId, playerItems, storyFlags);

    if (!canOpenResult.canOpen) {
      return {
        success: false,
        message: canOpenResult.reason,
        items: [],
        gold: 0,
        exp: 0,
        skills: [],
        alreadyOpened: this.openedChests.has(treasureId),
      };
    }

    const treasure = this.treasures.get(treasureId)!;

    // Mark as opened
    this.openedChests.add(treasureId);

    // Collect contents
    const items: { itemId: string; quantity: number }[] = [];
    let gold = 0;
    let exp = 0;
    const skills: string[] = [];

    for (const content of treasure.contents) {
      if (content.itemId && content.quantity) {
        items.push({ itemId: content.itemId, quantity: content.quantity });
      }
      if (content.gold) {
        gold += content.gold;
      }
      if (content.exp) {
        exp += content.exp;
      }
      if (content.skillId) {
        skills.push(content.skillId);
      }
    }

    // Build message
    const messages: string[] = [];
    if (items.length > 0) {
      messages.push(`获得物品: ${items.map(i => `${i.itemId}x${i.quantity}`).join(', ')}`);
    }
    if (gold > 0) {
      messages.push(`获得金钱: ${gold}`);
    }
    if (exp > 0) {
      messages.push(`获得经验: ${exp}`);
    }
    if (skills.length > 0) {
      messages.push(`学会仙术: ${skills.join(', ')}`);
    }

    return {
      success: true,
      message: messages.length > 0 ? messages.join('\n') : '宝箱是空的',
      items,
      gold,
      exp,
      skills,
      alreadyOpened: false,
    };
  }

  /**
   * Check if chest is opened
   */
  isOpened(treasureId: string): boolean {
    return this.openedChests.has(treasureId);
  }

  /**
   * Reset all chest states (for new game)
   */
  resetAll(): void {
    this.openedChests.clear();
  }

  /**
   * Get visible treasures at a map (filtering hidden/requirements)
   */
  getVisibleTreasures(mapId: string, storyFlags: Record<string, boolean>): TreasureBox[] {
    const mapTreasures = this.getTreasuresAtMap(mapId);
    return mapTreasures.filter(treasure => {
      if (treasure.hidden && !this.openedChests.has(treasure.id)) {
        return false;
      }
      if (treasure.requireFlag && !storyFlags[treasure.requireFlag]) {
        return false;
      }
      return true;
    });
  }
}

/**
 * Demo treasure configuration
 */
export const DEMO_TREASURES: TreasureBox[] = [
  {
    id: 'yuhang_chest_1',
    mapId: 'yuhang_town',
    x: 5,
    y: 3,
    contents: [
      { itemId: 'zhixuecao', quantity: 3 },
      { gold: 50 },
    ],
  },
  {
    id: 'yuhang_chest_2',
    mapId: 'yuhang_town',
    x: 12,
    y: 8,
    contents: [
      { itemId: 'iron_sword', quantity: 1 },
    ],
    requireItem: 'key_jiuguan',
  },
  {
    id: 'xianling_chest_1',
    mapId: 'xianling_island',
    x: 8,
    y: 5,
    contents: [
      { itemId: 'spirit_amulet', quantity: 1 },
      { exp: 100 },
    ],
  },
  {
    id: 'suzhou_chest_1',
    mapId: 'suzhou_city',
    x: 10,
    y: 7,
    contents: [
      { gold: 200 },
      { itemId: 'jinchuangyao', quantity: 5 },
    ],
  },
  {
    id: 'miao_chest_1',
    mapId: 'miao_village',
    x: 6,
    y: 4,
    contents: [
      { itemId: 'miao_blade', quantity: 1 },
      { skillId: 'guijiang' },
    ],
    requireFlag: 'miao_alliance',
  },
];