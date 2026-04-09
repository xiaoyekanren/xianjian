/**
 * Battle Reward System - Drop calculations for battle victories
 * US-023: 战斗掉落系统
 */

/**
 * Item drop entry
 */
export interface ItemDrop {
  itemId: string;
  probability: number;  // 0-1, chance of dropping
  quantity?: { min: number; max: number };  // Quantity range
}

/**
 * Battle reward configuration
 */
export interface BattleReward {
  exp: number;
  gold: number;
  items: ItemDrop[];
  guaranteedItems?: string[];  // Items that always drop
}

/**
 * Calculated battle reward result
 */
export interface BattleRewardResult {
  exp: number;
  gold: number;
  items: { itemId: string; quantity: number }[];
  messages: string[];
}

/**
 * Enemy drop table entry
 */
export interface EnemyDropTable {
  enemyId: string;
  reward: BattleReward;
}

/**
 * Battle Reward System class
 * Handles drop probability and reward calculation
 */
export class BattleRewardSystem {
  private dropTables: Map<string, BattleReward> = new Map();

  /**
   * Load drop tables from configuration
   */
  loadDropTables(tables: EnemyDropTable[]): void {
    for (const table of tables) {
      this.dropTables.set(table.enemyId, table.reward);
    }
  }

  /**
   * Get drop table for an enemy
   */
  getDropTable(enemyId: string): BattleReward | undefined {
    return this.dropTables.get(enemyId);
  }

  /**
   * Calculate random drop based on probability
   */
  private rollDrop(drop: ItemDrop): { itemId: string; quantity: number } | null {
    // Roll probability
    if (Math.random() > drop.probability) {
      return null;
    }

    // Determine quantity
    let quantity = 1;
    if (drop.quantity) {
      quantity = Math.floor(Math.random() * (drop.quantity.max - drop.quantity.min + 1)) + drop.quantity.min;
    }

    return { itemId: drop.itemId, quantity };
  }

  /**
   * Calculate rewards for a single enemy
   */
  calculateEnemyReward(enemyId: string): BattleRewardResult {
    const dropTable = this.dropTables.get(enemyId);

    if (!dropTable) {
      return {
        exp: 0,
        gold: 0,
        items: [],
        messages: [],
      };
    }

    const items: { itemId: string; quantity: number }[] = [];
    const messages: string[] = [];

    // Process random drops
    for (const drop of dropTable.items) {
      const result = this.rollDrop(drop);
      if (result) {
        items.push(result);
      }
    }

    // Add guaranteed items
    if (dropTable.guaranteedItems) {
      for (const itemId of dropTable.guaranteedItems) {
        const existing = items.find(i => i.itemId === itemId);
        if (existing) {
          existing.quantity++;
        } else {
          items.push({ itemId, quantity: 1 });
        }
      }
    }

    // Build messages
    if (dropTable.exp > 0) {
      messages.push(`获得经验: ${dropTable.exp}`);
    }
    if (dropTable.gold > 0) {
      messages.push(`获得金钱: ${dropTable.gold}`);
    }
    for (const item of items) {
      messages.push(`获得物品: ${item.itemId} x${item.quantity}`);
    }

    return {
      exp: dropTable.exp,
      gold: dropTable.gold,
      items,
      messages,
    };
  }

  /**
   * Calculate rewards for all defeated enemies
   */
  calculateTotalReward(enemyIds: string[]): BattleRewardResult {
    let totalExp = 0;
    let totalGold = 0;
    const allItems: Map<string, number> = new Map();
    const messages: string[] = [];

    for (const enemyId of enemyIds) {
      const reward = this.calculateEnemyReward(enemyId);
      totalExp += reward.exp;
      totalGold += reward.gold;

      for (const item of reward.items) {
        const current = allItems.get(item.itemId) ?? 0;
        allItems.set(item.itemId, current + item.quantity);
      }
    }

    // Build summary messages
    if (totalExp > 0) {
      messages.push(`获得经验: ${totalExp}`);
    }
    if (totalGold > 0) {
      messages.push(`获得金钱: ${totalGold}`);
    }
    for (const [itemId, quantity] of allItems) {
      messages.push(`获得物品: ${itemId} x${quantity}`);
    }

    return {
      exp: totalExp,
      gold: totalGold,
      items: Array.from(allItems.entries()).map(([itemId, quantity]) => ({ itemId, quantity })),
      messages,
    };
  }

  /**
   * Add a drop table programmatically
   */
  addDropTable(enemyId: string, reward: BattleReward): void {
    this.dropTables.set(enemyId, reward);
  }
}

/**
 * Default drop tables for common enemies
 */
export const DEFAULT_DROP_TABLES: EnemyDropTable[] = [
  {
    enemyId: 'slime',
    reward: {
      exp: 10,
      gold: 5,
      items: [
        { itemId: 'zhixuecao', probability: 0.3 },
      ],
    },
  },
  {
    enemyId: 'wolf',
    reward: {
      exp: 20,
      gold: 15,
      items: [
        { itemId: 'zhixuecao', probability: 0.5 },
        { itemId: 'leather_armor', probability: 0.1 },
      ],
    },
  },
  {
    enemyId: 'bandit',
    reward: {
      exp: 35,
      gold: 30,
      items: [
        { itemId: 'jinchuangyao', probability: 0.4 },
        { itemId: 'iron_sword', probability: 0.05 },
      ],
    },
  },
  {
    enemyId: 'demon',
    reward: {
      exp: 50,
      gold: 40,
      items: [
        { itemId: 'lingxindan', probability: 0.3 },
        { itemId: 'spirit_amulet', probability: 0.1 },
      ],
    },
  },
  {
    enemyId: 'boss_bandit_leader',
    reward: {
      exp: 200,
      gold: 150,
      items: [
        { itemId: 'dahuangdan', probability: 1.0 },
      ],
      guaranteedItems: ['bronze_sword', 'gold_ring'],
    },
  },
  {
    enemyId: 'boss_demon_king',
    reward: {
      exp: 500,
      gold: 400,
      items: [
        { itemId: 'tianxin_dan', probability: 1.0, quantity: { min: 2, max: 3 } },
      ],
      guaranteedItems: ['tianshi_sword', 'nuwa_amulet'],
    },
  },
];