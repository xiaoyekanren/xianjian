/**
 * Shop System - Buy/sell logic for shops
 * US-018: 商店系统实现
 */

import { Item, ItemManager } from '@/data/Item';

/**
 * Shop inventory entry
 */
export interface ShopEntry {
  itemId: string;
  quantity?: number;    // -1 = unlimited stock
  restockTime?: number; // Hours until restock (if limited)
}

/**
 * Shop data for a location
 */
export interface ShopData {
  id: string;
  name: string;
  location: string;     // Map ID where shop is located
  items: ShopEntry[];
  buysItems?: boolean;  // Whether shop accepts player sales
  buyCategories?: Item['type'][];  // Item types shop will buy
}

/**
 * Shop transaction result
 */
export interface ShopTransaction {
  success: boolean;
  message: string;
  goldChange: number;
  itemsChange: { itemId: string; quantity: number }[];
}

/**
 * Shop System class
 * Handles buying and selling transactions
 */
export class ShopSystem {
  private shops: Map<string, ShopData> = new Map();
  private itemManager: ItemManager;

  constructor(itemManager: ItemManager) {
    this.itemManager = itemManager;
  }

  /**
   * Load shop data from configuration
   */
  loadShops(shops: ShopData[]): void {
    for (const shop of shops) {
      this.shops.set(shop.id, shop);
    }
  }

  /**
   * Get shop by ID
   */
  getShop(id: string): ShopData | undefined {
    return this.shops.get(id);
  }

  /**
   * Get shops at a location
   */
  getShopsAtLocation(locationId: string): ShopData[] {
    const shops: ShopData[] = [];
    for (const shop of this.shops.values()) {
      if (shop.location === locationId) {
        shops.push(shop);
      }
    }
    return shops;
  }

  /**
   * Get item price for display
   */
  getItemPrice(itemId: string): { buy: number; sell: number } | null {
    const item = this.itemManager.getItem(itemId);
    if (!item) return null;

    return {
      buy: item.price,
      sell: this.itemManager.getSellPrice(item),
    };
  }

  /**
   * Buy item from shop
   */
  buyItem(
    shopId: string,
    itemId: string,
    quantity: number,
    playerGold: number,
    _playerInventory: { itemId: string; quantity: number }[]
  ): ShopTransaction {
    const shop = this.shops.get(shopId);
    const item = this.itemManager.getItem(itemId);

    if (!shop) {
      return {
        success: false,
        message: '商店不存在',
        goldChange: 0,
        itemsChange: [],
      };
    }

    if (!item) {
      return {
        success: false,
        message: '物品不存在',
        goldChange: 0,
        itemsChange: [],
      };
    }

    // Check if item is in shop inventory
    const shopEntry = shop.items.find(e => e.itemId === itemId);
    if (!shopEntry) {
      return {
        success: false,
        message: '商店没有此物品',
        goldChange: 0,
        itemsChange: [],
      };
    }

    // Check stock (if limited)
    if (shopEntry.quantity !== undefined && shopEntry.quantity !== -1) {
      if (shopEntry.quantity < quantity) {
        return {
          success: false,
          message: '库存不足',
          goldChange: 0,
          itemsChange: [],
        };
      }
    }

    // Calculate total cost
    const totalCost = item.price * quantity;

    // Check player gold
    if (playerGold < totalCost) {
      return {
        success: false,
        message: `金钱不足，需要 ${totalCost} 金币`,
        goldChange: 0,
        itemsChange: [],
      };
    }

    // Successful purchase
    return {
      success: true,
      message: `购买 ${item.name} ${quantity}个，花费 ${totalCost} 金币`,
      goldChange: -totalCost,
      itemsChange: [{ itemId, quantity }],
    };
  }

  /**
   * Sell item to shop
   */
  sellItem(
    shopId: string,
    itemId: string,
    quantity: number,
    playerInventory: { itemId: string; quantity: number }[]
  ): ShopTransaction {
    const shop = this.shops.get(shopId);
    const item = this.itemManager.getItem(itemId);

    if (!shop) {
      return {
        success: false,
        message: '商店不存在',
        goldChange: 0,
        itemsChange: [],
      };
    }

    if (!item) {
      return {
        success: false,
        message: '物品不存在',
        goldChange: 0,
        itemsChange: [],
      };
    }

    // Check if shop buys items
    if (!shop.buysItems) {
      return {
        success: false,
        message: '此商店不收购物品',
        goldChange: 0,
        itemsChange: [],
      };
    }

    // Check if shop accepts this item type
    if (shop.buyCategories && !shop.buyCategories.includes(item.type)) {
      return {
        success: false,
        message: '此商店不收购此类型物品',
        goldChange: 0,
        itemsChange: [],
      };
    }

    // Check player inventory
    const invEntry = playerInventory.find(e => e.itemId === itemId);
    if (!invEntry || invEntry.quantity < quantity) {
      return {
        success: false,
        message: '物品数量不足',
        goldChange: 0,
        itemsChange: [],
      };
    }

    // Key items cannot be sold
    if (item.type === 'key') {
      return {
        success: false,
        message: '剧情道具无法出售',
        goldChange: 0,
        itemsChange: [],
      };
    }

    // Calculate sell price
    const totalGain = this.itemManager.getSellPrice(item) * quantity;

    // Successful sale
    return {
      success: true,
      message: `出售 ${item.name} ${quantity}个，获得 ${totalGain} 金币`,
      goldChange: totalGain,
      itemsChange: [{ itemId, quantity: -quantity }],
    };
  }

  /**
   * Apply transaction to shop stock (if limited)
   */
  applyTransaction(shopId: string, itemId: string, quantity: number): void {
    const shop = this.shops.get(shopId);
    if (!shop) return;

    const entry = shop.items.find(e => e.itemId === itemId);
    if (!entry || entry.quantity === undefined || entry.quantity === -1) return;

    entry.quantity -= quantity;
    if (entry.quantity < 0) entry.quantity = 0;
  }

  /**
   * Get shop display info
   */
  getShopDisplayInfo(shopId: string): {
    name: string;
    items: { id: string; name: string; price: number; stock: number | null }[];
  } | null {
    const shop = this.shops.get(shopId);
    if (!shop) return null;

    const items = shop.items.map(entry => {
      const item = this.itemManager.getItem(entry.itemId);
      if (!item) return null;

      return {
        id: entry.itemId,
        name: item.name,
        price: item.price,
        stock: entry.quantity === -1 || entry.quantity === undefined ? null : entry.quantity,
      };
    }).filter((item): item is { id: string; name: string; price: number; stock: number | null } => item !== null);

    return {
      name: shop.name,
      items,
    };
  }
}