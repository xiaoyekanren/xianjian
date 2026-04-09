/**
 * Shop Scene - Buy and sell items interface
 * US-019: 商店界面
 */

import Phaser from 'phaser';
import { Item, InventoryEntry, ItemManager } from '@/data/Item';
import { ShopSystem, ShopData, ShopTransaction } from '@/systems/ShopSystem';
import itemsData from '@/data/items.json';
import shopData from '@/data/shop.json';

/**
 * Shop mode
 */
type ShopMode = 'buy' | 'sell';

/**
 * Shop scene configuration
 */
export interface ShopSceneConfig {
  shopId: string;
  playerGold: number;
  inventory: InventoryEntry[];
}

/**
 * Event emitted when shop scene closes
 */
export interface ShopCloseEvent {
  gold: number;
  inventory: InventoryEntry[];
}

/**
 * Shop Scene class
 * Manages buying and selling items
 */
export class ShopScene extends Phaser.Scene {
  private shopId: string = '';
  private playerGold: number = 0;
  private inventory: InventoryEntry[] = [];
  private shopSystem: ShopSystem;
  private itemManager: ItemManager;
  private shopData: ShopData | null = null;
  private mode: ShopMode = 'buy';

  // State
  private selecteditemIndex: number = 0;
  private buyQuantity: number = 1;
  private displayItems: { item: Item; stock: number | null; playerQty?: number }[] = [];

  // UI elements
  private modeTabBuy: Phaser.GameObjects.Text | null = null;
  private modeTabSell: Phaser.GameObjects.Text | null = null;
  private itemListContainer: Phaser.GameObjects.Container | null = null;
  private detailContainer: Phaser.GameObjects.Container | null = null;
  private goldText: Phaser.GameObjects.Text | null = null;
  private quantityText: Phaser.GameObjects.Text | null = null;
  private messageText: Phaser.GameObjects.Text | null = null;
  private itemButtons: Phaser.GameObjects.Container[] = [];

  // UI constants
  private readonly ITEM_HEIGHT = 45;
  private readonly VISIBLE_ITEMS = 8;

  constructor() {
    super({ key: 'ShopScene' });
    this.itemManager = new ItemManager();
    this.itemManager.loadItems(itemsData as Item[]);
    this.shopSystem = new ShopSystem(this.itemManager);
    this.shopSystem.loadShops(shopData as ShopData[]);
  }

  init(config: ShopSceneConfig): void {
    this.shopId = config.shopId;
    this.playerGold = config.playerGold;
    this.inventory = [...config.inventory];
    this.shopData = this.shopSystem.getShop(this.shopId) || null;
    this.mode = 'buy';
    this.selecteditemIndex = 0;
    this.buyQuantity = 1;
  }

  create(): void {
    if (!this.shopData) {
      this.showMessage('商店数据不存在', 0xff4444);
      this.time.delayedCall(1500, () => this.closeScene());
      return;
    }

    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.cameras.main.fadeIn(200);

    // Create UI
    this.createHeader();
    this.createModeTabs();
    this.createItemList();
    this.createDetailPanel();
    this.createQuantitySelector();
    this.createActionButtons();
    this.createMessageArea();

    // Setup input
    this.setupInput();

    // Initial update
    this.updateItemList();
    this.updateSelection();
  }

  /**
   * Create header with shop name and gold
   */
  private createHeader(): void {
    const width = this.cameras.main.width;

    // Shop name
    const title = this.add.text(width / 2, 30, this.shopData!.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#D4A84B',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);

    // Gold display
    this.goldText = this.add.text(width - 30, 30, `金钱: ${this.playerGold}G`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#FFD700',
    });
    this.goldText.setOrigin(1, 0.5);

    // Border line
    const border = this.add.graphics();
    border.lineStyle(2, 0xD4A84B);
    border.lineBetween(50, 60, width - 50, 60);
  }

  /**
   * Create buy/sell mode tabs
   */
  private createModeTabs(): void {
    const startX = 60;
    const y = 75;

    // Buy tab
    const buyBg = this.add.graphics();
    buyBg.fillStyle(0x448844, 1);
    buyBg.fillRoundedRect(startX, y, 100, 35, 5);

    this.modeTabBuy = this.add.text(startX + 50, y + 17, '购买', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
    });
    this.modeTabBuy.setOrigin(0.5, 0.5);

    const buyHit = this.add.rectangle(startX + 50, y + 17, 100, 35, 0x000000, 0);
    buyHit.setInteractive({ useHandCursor: true });
    buyHit.on('pointerdown', () => this.setMode('buy'));

    // Sell tab
    const sellBg = this.add.graphics();
    sellBg.fillStyle(0x444488, 1);
    sellBg.fillRoundedRect(startX + 110, y, 100, 35, 5);

    this.modeTabSell = this.add.text(startX + 160, y + 17, '出售', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
    });
    this.modeTabSell.setOrigin(0.5, 0.5);

    const sellHit = this.add.rectangle(startX + 160, y + 17, 100, 35, 0x000000, 0);
    sellHit.setInteractive({ useHandCursor: true });
    sellHit.on('pointerdown', () => this.setMode('sell'));
  }

  /**
   * Set shop mode (buy/sell)
   */
  private setMode(mode: ShopMode): void {
    this.mode = mode;
    this.selecteditemIndex = 0;
    this.buyQuantity = 1;

    // Update tab visuals
    if (mode === 'buy') {
      this.modeTabBuy?.setColor('#FFFFFF');
      this.modeTabSell?.setColor('#AAAAAA');
    } else {
      this.modeTabBuy?.setColor('#AAAAAA');
      this.modeTabSell?.setColor('#FFFFFF');
    }

    this.updateItemList();
    this.updateSelection();
  }

  /**
   * Create scrollable item list
   */
  private createItemList(): void {
    const x = 60;
    const y = 125;
    const width = 500;
    const height = this.ITEM_HEIGHT * this.VISIBLE_ITEMS;

    // List background
    const bg = this.add.graphics();
    bg.fillStyle(0x222244, 0.9);
    bg.fillRoundedRect(x, y, width, height, 5);
    bg.lineStyle(1, 0x666688);
    bg.strokeRoundedRect(x, y, width, height, 5);

    // Item container
    this.itemListContainer = this.add.container(x + 10, y + 5);
  }

  /**
   * Create detail panel
   */
  private createDetailPanel(): void {
    const x = 580;
    const y = 125;
    const width = 340;
    const height = 250;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x222244, 0.9);
    bg.fillRoundedRect(x, y, width, height, 5);
    bg.lineStyle(1, 0x666688);
    bg.strokeRoundedRect(x, y, width, height, 5);

    // Detail container
    this.detailContainer = this.add.container(x + 15, y + 15);
  }

  /**
   * Create quantity selector
   */
  private createQuantitySelector(): void {
    const x = 580;
    const y = 395;

    // Label
    this.add.text(x + 15, y, '数量:', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
    });

    // Minus button
    this.createSmallButton(x + 100, y - 5, '-', 0x884444, () => {
      this.adjustQuantity(-1);
    });

    // Quantity display
    this.quantityText = this.add.text(x + 170, y, '1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#FFFFFF',
    });
    this.quantityText.setOrigin(0.5, 0);

    // Plus button
    this.createSmallButton(x + 220, y - 5, '+', 0x448844, () => {
      this.adjustQuantity(1);
    });

    // Max button
    this.createSmallButton(x + 280, y - 5, 'MAX', 0x444488, () => {
      this.setMaxQuantity();
    });
  }

  /**
   * Create a small button
   */
  private createSmallButton(x: number, y: number, label: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(0, 0, 50, 30, 3);

    const text = this.add.text(25, 15, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#FFFFFF',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);

    const hit = this.add.rectangle(25, 15, 50, 30, 0x000000, 0);
    hit.setInteractive({ useHandCursor: true });
    hit.on('pointerdown', callback);
    container.add(hit);

    return container;
  }

  /**
   * Create action buttons
   */
  private createActionButtons(): void {
    const width = this.cameras.main.width;
    const y = 520;

    // Confirm button
    this.createButton(width / 2 - 170, y, '确认', 0x448844, () => {
      this.handleTransaction();
    });

    // Cancel button
    this.createButton(width / 2 + 10, y, '离开', 0x884444, () => {
      this.closeScene();
    });
  }

  /**
   * Create a styled button
   */
  private createButton(x: number, y: number, label: string, color: number, callback: () => void): void {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(0, 0, 150, 45, 5);

    const text = this.add.text(75, 22, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#FFFFFF',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);

    const hit = this.add.rectangle(75, 22, 150, 45, 0x000000, 0);
    hit.setInteractive({ useHandCursor: true });
    hit.on('pointerdown', callback);
    container.add(hit);
  }

  /**
   * Create message area
   */
  private createMessageArea(): void {
    this.messageText = this.add.text(this.cameras.main.width / 2, 590, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
    });
    this.messageText.setOrigin(0.5, 0.5);
  }

  /**
   * Setup keyboard input
   */
  private setupInput(): void {
    this.input.keyboard!.on('keydown-UP', () => this.navigateItem(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.navigateItem(1));
    this.input.keyboard!.on('keydown-W', () => this.navigateItem(-1));
    this.input.keyboard!.on('keydown-S', () => this.navigateItem(1));

    this.input.keyboard!.on('keydown-LEFT', () => this.adjustQuantity(-1));
    this.input.keyboard!.on('keydown-RIGHT', () => this.adjustQuantity(1));
    this.input.keyboard!.on('keydown-A', () => this.adjustQuantity(-1));
    this.input.keyboard!.on('keydown-D', () => this.adjustQuantity(1));

    this.input.keyboard!.on('keydown-ENTER', () => this.handleTransaction());
    this.input.keyboard!.on('keydown-SPACE', () => this.handleTransaction());

    this.input.keyboard!.on('keydown-ESC', () => this.closeScene());
  }

  /**
   * Update item list based on mode
   */
  private updateItemList(): void {
    if (this.itemListContainer) {
      this.itemListContainer.removeAll(true);
    }
    this.itemButtons = [];
    this.displayItems = [];

    if (this.mode === 'buy') {
      // Show shop items
      for (const entry of this.shopData!.items) {
        const item = this.itemManager.getItem(entry.itemId);
        if (!item) continue;

        this.displayItems.push({
          item,
          stock: entry.quantity === -1 || entry.quantity === undefined ? null : entry.quantity,
        });
      }
    } else {
      // Show player items that shop will buy
      for (const entry of this.inventory) {
        const item = this.itemManager.getItem(entry.itemId);
        if (!item) continue;

        // Check if shop accepts this item type
        if (this.shopData!.buyCategories && !this.shopData!.buyCategories.includes(item.type)) {
          continue;
        }

        // Key items can't be sold
        if (item.type === 'key') continue;

        this.displayItems.push({
          item,
          stock: null,
          playerQty: entry.quantity,
        });
      }
    }

    // Create item buttons
    for (let i = 0; i < this.displayItems.length && i < this.VISIBLE_ITEMS; i++) {
      const { item, stock, playerQty } = this.displayItems[i];
      const y = i * this.ITEM_HEIGHT;

      const container = this.add.container(0, y);

      // Background
      const bg = this.add.graphics();
      bg.fillStyle(0x333355, 1);
      bg.fillRoundedRect(0, 0, 480, this.ITEM_HEIGHT - 5, 3);
      container.add(bg);

      // Item name
      const nameText = this.add.text(10, (this.ITEM_HEIGHT - 5) / 2, item.name, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#FFFFFF',
      });
      nameText.setOrigin(0, 0.5);
      container.add(nameText);

      // Price
      const price = this.mode === 'buy' ? item.price : Math.floor(item.price / 2);
      const priceText = this.add.text(300, (this.ITEM_HEIGHT - 5) / 2, `${price}G`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#FFD700',
      });
      priceText.setOrigin(0, 0.5);
      container.add(priceText);

      // Stock/Quantity
      if (this.mode === 'buy' && stock !== null) {
        const stockText = this.add.text(400, (this.ITEM_HEIGHT - 5) / 2, `库存: ${stock}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#AAAAAA',
        });
        stockText.setOrigin(0, 0.5);
        container.add(stockText);
      } else if (this.mode === 'sell' && playerQty !== undefined) {
        const qtyText = this.add.text(400, (this.ITEM_HEIGHT - 5) / 2, `持有: ${playerQty}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#AAAAAA',
        });
        qtyText.setOrigin(0, 0.5);
        container.add(qtyText);
      }

      // Make interactive
      const hit = this.add.rectangle(240, (this.ITEM_HEIGHT - 5) / 2, 480, this.ITEM_HEIGHT - 5, 0x000000, 0);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        this.selecteditemIndex = i;
        this.updateSelection();
      });
      container.add(hit);

      this.itemListContainer!.add(container);
      this.itemButtons.push(container);
    }
  }

  /**
   * Navigate through items
   */
  private navigateItem(direction: number): void {
    const maxIndex = Math.min(this.displayItems.length - 1, this.VISIBLE_ITEMS - 1);
    this.selecteditemIndex = Phaser.Math.Clamp(this.selecteditemIndex + direction, 0, maxIndex);
    this.buyQuantity = 1;
    this.updateSelection();
  }

  /**
   * Adjust quantity
   */
  private adjustQuantity(delta: number): void {
    this.buyQuantity = Phaser.Math.Clamp(this.buyQuantity + delta, 1, this.getMaxQuantity());
    if (this.quantityText) {
      this.quantityText.setText(this.buyQuantity.toString());
    }
  }

  /**
   * Set maximum quantity
   */
  private setMaxQuantity(): void {
    this.buyQuantity = this.getMaxQuantity();
    if (this.quantityText) {
      this.quantityText.setText(this.buyQuantity.toString());
    }
  }

  /**
   * Get maximum purchasable/sellable quantity
   */
  private getMaxQuantity(): number {
    if (this.displayItems.length === 0 || this.selecteditemIndex >= this.displayItems.length) {
      return 1;
    }

    const { item, stock, playerQty } = this.displayItems[this.selecteditemIndex];

    if (this.mode === 'buy') {
      // Max based on gold and stock
      const maxByGold = Math.floor(this.playerGold / item.price);
      const maxByStock = stock !== null ? stock : 99;
      return Math.min(maxByGold, maxByStock, 99);
    } else {
      // Max based on inventory
      return playerQty || 1;
    }
  }

  /**
   * Update selection visual
   */
  private updateSelection(): void {
    for (let i = 0; i < this.itemButtons.length; i++) {
      const container = this.itemButtons[i];
      const bg = container.getAt(0) as Phaser.GameObjects.Graphics;

      bg.clear();
      if (i === this.selecteditemIndex) {
        bg.fillStyle(0x445588, 1);
        bg.fillRoundedRect(0, 0, 480, this.ITEM_HEIGHT - 5, 3);
        bg.lineStyle(2, 0xD4A84B);
        bg.strokeRoundedRect(0, 0, 480, this.ITEM_HEIGHT - 5, 3);
      } else {
        bg.fillStyle(0x333355, 1);
        bg.fillRoundedRect(0, 0, 480, this.ITEM_HEIGHT - 5, 3);
      }
    }

    this.updateDetailPanel();
    this.buyQuantity = 1;
    if (this.quantityText) {
      this.quantityText.setText('1');
    }
  }

  /**
   * Update detail panel
   */
  private updateDetailPanel(): void {
    if (!this.detailContainer) return;

    this.detailContainer.removeAll(true);

    if (this.displayItems.length === 0 || this.selecteditemIndex >= this.displayItems.length) {
      const emptyText = this.add.text(155, 110, '无物品', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#888888',
      });
      emptyText.setOrigin(0.5, 0.5);
      this.detailContainer.add(emptyText);
      return;
    }

    const { item } = this.displayItems[this.selecteditemIndex];

    // Item name
    const nameText = this.add.text(0, 0, item.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#D4A84B',
      fontStyle: 'bold',
    });
    this.detailContainer.add(nameText);

    // Type
    const typeNames: Record<string, string> = {
      consumable: '消耗品',
      weapon: '武器',
      armor: '防具',
      accessory: '饰品',
      key: '剧情道具',
    };
    const typeText = this.add.text(220, 5, typeNames[item.type] || item.type, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#888888',
    });
    this.detailContainer.add(typeText);

    // Description
    const descText = this.add.text(0, 40, item.description, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#CCCCCC',
      wordWrap: { width: 310 },
    });
    this.detailContainer.add(descText);

    // Price info
    const buyPrice = item.price;
    const sellPrice = Math.floor(item.price / 2);
    const priceText = this.add.text(0, 100, `购买价格: ${buyPrice}G\n出售价格: ${sellPrice}G`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#FFD700',
    });
    this.detailContainer.add(priceText);

    // Effects/Bonuses
    let effectY = 150;

    if (item.effect) {
      const effects: string[] = [];
      if (item.effect.hp) effects.push(`HP ${item.effect.hp > 0 ? '+' : ''}${item.effect.hp}`);
      if (item.effect.mp) effects.push(`MP ${item.effect.mp > 0 ? '+' : ''}${item.effect.mp}`);
      if (effects.length > 0) {
        const effectText = this.add.text(0, effectY, `效果: ${effects.join(', ')}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#88FF88',
        });
        this.detailContainer.add(effectText);
        effectY += 20;
      }
    }

    if (item.bonus) {
      const bonuses: string[] = [];
      if (item.bonus.attack) bonuses.push(`攻击 +${item.bonus.attack}`);
      if (item.bonus.defense) bonuses.push(`防御 +${item.bonus.defense}`);
      if (bonuses.length > 0) {
        const bonusText = this.add.text(0, effectY, `属性: ${bonuses.join(', ')}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#88AAFF',
        });
        this.detailContainer.add(bonusText);
      }
    }
  }

  /**
   * Handle buy/sell transaction
   */
  private handleTransaction(): void {
    if (this.displayItems.length === 0 || this.selecteditemIndex >= this.displayItems.length) {
      return;
    }

    const { item } = this.displayItems[this.selecteditemIndex];
    let result: ShopTransaction;

    if (this.mode === 'buy') {
      result = this.shopSystem.buyItem(
        this.shopId,
        item.id,
        this.buyQuantity,
        this.playerGold,
        this.inventory
      );

      if (result.success) {
        // Apply purchase
        this.playerGold += result.goldChange;

        // Add to inventory
        const existingEntry = this.inventory.find(e => e.itemId === item.id);
        if (existingEntry) {
          existingEntry.quantity += this.buyQuantity;
        } else {
          this.inventory.push({ itemId: item.id, quantity: this.buyQuantity });
        }

        // Update shop stock
        this.shopSystem.applyTransaction(this.shopId, item.id, this.buyQuantity);
      }
    } else {
      result = this.shopSystem.sellItem(
        this.shopId,
        item.id,
        this.buyQuantity,
        this.inventory
      );

      if (result.success) {
        // Apply sale
        this.playerGold += result.goldChange;

        // Remove from inventory
        const entry = this.inventory.find(e => e.itemId === item.id);
        if (entry) {
          entry.quantity -= this.buyQuantity;
          if (entry.quantity <= 0) {
            const index = this.inventory.indexOf(entry);
            if (index >= 0) {
              this.inventory.splice(index, 1);
            }
          }
        }
      }
    }

    // Show result message
    if (result.success) {
      this.showMessage(result.message, 0x44ff44);
      this.updateGoldDisplay();
      this.updateItemList();
      this.buyQuantity = 1;
      if (this.quantityText) {
        this.quantityText.setText('1');
      }
    } else {
      this.showMessage(result.message, 0xff4444);
    }
  }

  /**
   * Update gold display
   */
  private updateGoldDisplay(): void {
    if (this.goldText) {
      this.goldText.setText(`金钱: ${this.playerGold}G`);
    }
  }

  /**
   * Show message
   */
  private showMessage(text: string, color: number = 0xffffff): void {
    if (this.messageText) {
      const colorHex = '#' + color.toString(16).padStart(6, '0');
      this.messageText.setText(text);
      this.messageText.setColor(colorHex);

      // Clear after 2 seconds
      this.time.delayedCall(2000, () => {
        if (this.messageText) {
          this.messageText.setText('');
        }
      });
    }
  }

  /**
   * Close the scene
   */
  private closeScene(): void {
    this.cameras.main.fadeOut(200, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      const closeEvent: ShopCloseEvent = {
        gold: this.playerGold,
        inventory: this.inventory,
      };

      this.scene.stop();
      this.scene.resume('WorldScene', closeEvent);
    });
  }

  /**
   * Cleanup scene
   */
  shutdown(): void {
    this.input.keyboard!.off('keydown-UP');
    this.input.keyboard!.off('keydown-DOWN');
    this.input.keyboard!.off('keydown-W');
    this.input.keyboard!.off('keydown-S');
    this.input.keyboard!.off('keydown-LEFT');
    this.input.keyboard!.off('keydown-RIGHT');
    this.input.keyboard!.off('keydown-A');
    this.input.keyboard!.off('keydown-D');
    this.input.keyboard!.off('keydown-ENTER');
    this.input.keyboard!.off('keydown-SPACE');
    this.input.keyboard!.off('keydown-ESC');
  }
}