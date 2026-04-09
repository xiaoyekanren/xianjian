/**
 * Inventory Scene - Item and equipment management interface
 * US-015: 物品/装备管理界面
 */

import Phaser from 'phaser';
import { Item, ItemType, InventoryEntry, ItemManager } from '@/data/Item';
import { Character } from '@/entities/Character';
import itemsData from '@/data/items.json';

/**
 * Inventory scene configuration
 */
export interface InventorySceneConfig {
  inventory: InventoryEntry[];
  characters: Character[];
  gold: number;
}

/**
 * Item category filter tabs
 */
type ItemCategory = 'all' | 'consumable' | 'weapon' | 'armor' | 'accessory' | 'key';

/**
 * Event emitted when inventory scene closes
 */
export interface InventoryCloseEvent {
  inventory: InventoryEntry[];
  characters: Character[];
  gold: number;
}

/**
 * Inventory Scene class
 * Manages item usage and equipment management
 */
export class InventoryScene extends Phaser.Scene {
  private inventory: InventoryEntry[] = [];
  private characters: Character[] = [];
  private gold: number = 0;
  private itemManager: ItemManager;

  // UI elements
  private categoryTabs: Phaser.GameObjects.Text[] = [];
  private itemListContainer: Phaser.GameObjects.Container | null = null;
  private detailContainer: Phaser.GameObjects.Container | null = null;
  private characterSelectContainer: Phaser.GameObjects.Container | null = null;
  private goldText: Phaser.GameObjects.Text | null = null;

  // State
  private currentCategory: ItemCategory = 'all';
  private selectedItemIndex: number = 0;
  private selectedCharacterIndex: number = 0;
  private filteredItems: { entry: InventoryEntry; item: Item }[] = [];
  private itemButtons: Phaser.GameObjects.Container[] = [];

  // UI constants
  private readonly ITEM_HEIGHT = 40;
  private readonly VISIBLE_ITEMS = 8;

  constructor() {
    super({ key: 'InventoryScene' });
    this.itemManager = new ItemManager();
    this.itemManager.loadItems(itemsData as Item[]);
  }

  init(config: InventorySceneConfig): void {
    this.inventory = [...config.inventory];
    this.characters = config.characters.map(c => ({ ...c }));
    this.gold = config.gold;
    this.currentCategory = 'all';
    this.selectedItemIndex = 0;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.cameras.main.fadeIn(200);

    // Create UI structure
    this.createHeader();
    this.createCategoryTabs();
    this.createItemList();
    this.createDetailPanel();
    this.createCharacterSelect();
    this.createButtons();

    // Setup input
    this.setupInput();

    // Initial update
    this.updateItemList();

    // Keyboard navigation
    this.selectedItemIndex = 0;
    this.updateItemSelection();
  }

  /**
   * Create header with title and gold display
   */
  private createHeader(): void {
    const width = this.cameras.main.width;

    // Title
    const title = this.add.text(width / 2, 30, '物品栏', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#D4A84B',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);

    // Gold display
    this.goldText = this.add.text(width - 30, 30, `金钱: ${this.gold}`, {
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
   * Create category filter tabs
   */
  private createCategoryTabs(): void {
    const categories: { key: ItemCategory; label: string }[] = [
      { key: 'all', label: '全部' },
      { key: 'consumable', label: '消耗品' },
      { key: 'weapon', label: '武器' },
      { key: 'armor', label: '防具' },
      { key: 'accessory', label: '饰品' },
      { key: 'key', label: '剧情' },
    ];

    const startX = 60;
    const y = 90;
    const tabWidth = 80;

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const x = startX + i * (tabWidth + 10);

      // Tab background
      const bg = this.add.graphics();
      bg.fillStyle(0x2a2a4e, 1);
      bg.fillRoundedRect(x, y, tabWidth, 35, 5);
      bg.lineStyle(1, 0x666688);
      bg.strokeRoundedRect(x, y, tabWidth, 35, 5);

      // Tab text
      const text = this.add.text(x + tabWidth / 2, y + 17, cat.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#FFFFFF',
      });
      text.setOrigin(0.5, 0.5);

      // Make interactive
      const hitArea = this.add.rectangle(x + tabWidth / 2, y + 17, tabWidth, 35, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => {
        this.selectCategory(cat.key);
      });

      this.categoryTabs.push(text);
    }
  }

  /**
   * Create scrollable item list
   */
  private createItemList(): void {
    const x = 60;
    const y = 140;
    const width = 400;
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
   * Create detail panel for selected item
   */
  private createDetailPanel(): void {
    const x = 480;
    const y = 140;
    const width = 400;
    const height = 200;

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
   * Create character selection panel
   */
  private createCharacterSelect(): void {
    const x = 480;
    const y = 360;
    const width = 400;
    const height = 150;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x222244, 0.9);
    bg.fillRoundedRect(x, y, width, height, 5);
    bg.lineStyle(1, 0x666688);
    bg.strokeRoundedRect(x, y, width, height, 5);

    // Character select container
    this.characterSelectContainer = this.add.container(x + 15, y + 15);
  }

  /**
   * Create action buttons
   */
  private createButtons(): void {
    // Use/Equip button
    this.createButton(480, 520, '使用/装备', 0x448844, () => {
      this.handleUseOrEquip();
    });

    // Sort button
    this.createButton(640, 520, '整理', 0x444488, () => {
      this.sortInventory();
    });

    // Close button
    this.createButton(800, 520, '关闭', 0x884444, () => {
      this.closeScene();
    });
  }

  /**
   * Create a styled button
   */
  private createButton(x: number, y: number, label: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(0, 0, 120, 40, 5);
    bg.lineStyle(1, color + 0x222222);
    bg.strokeRoundedRect(0, 0, 120, 40, 5);

    const text = this.add.text(60, 20, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);

    // Make interactive
    const hitArea = this.add.rectangle(60, 20, 120, 40, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', callback);
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color + 0x333333, 1);
      bg.fillRoundedRect(0, 0, 120, 40, 5);
      bg.lineStyle(1, color + 0x444444);
      bg.strokeRoundedRect(0, 0, 120, 40, 5);
    });
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(0, 0, 120, 40, 5);
      bg.lineStyle(1, color + 0x222222);
      bg.strokeRoundedRect(0, 0, 120, 40, 5);
    });
    container.add(hitArea);

    return container;
  }

  /**
   * Setup keyboard input
   */
  private setupInput(): void {
    // Category switching (1-6)
    this.input.keyboard!.on('keydown-ONE', () => this.selectCategory('all'));
    this.input.keyboard!.on('keydown-TWO', () => this.selectCategory('consumable'));
    this.input.keyboard!.on('keydown-THREE', () => this.selectCategory('weapon'));
    this.input.keyboard!.on('keydown-FOUR', () => this.selectCategory('armor'));
    this.input.keyboard!.on('keydown-FIVE', () => this.selectCategory('accessory'));
    this.input.keyboard!.on('keydown-SIX', () => this.selectCategory('key'));

    // Navigation
    this.input.keyboard!.on('keydown-UP', () => this.navigateItem(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.navigateItem(1));
    this.input.keyboard!.on('keydown-W', () => this.navigateItem(-1));
    this.input.keyboard!.on('keydown-S', () => this.navigateItem(1));

    // Character selection
    this.input.keyboard!.on('keydown-LEFT', () => this.navigateCharacter(-1));
    this.input.keyboard!.on('keydown-RIGHT', () => this.navigateCharacter(1));
    this.input.keyboard!.on('keydown-A', () => this.navigateCharacter(-1));
    this.input.keyboard!.on('keydown-D', () => this.navigateCharacter(1));

    // Actions
    this.input.keyboard!.on('keydown-ENTER', () => this.handleUseOrEquip());
    this.input.keyboard!.on('keydown-SPACE', () => this.handleUseOrEquip());

    // Close
    this.input.keyboard!.on('keydown-ESC', () => this.closeScene());
  }

  /**
   * Select a category filter
   */
  private selectCategory(category: ItemCategory): void {
    this.currentCategory = category;
    this.selectedItemIndex = 0;

    // Update tab visuals
    const categoryOrder: ItemCategory[] = ['all', 'consumable', 'weapon', 'armor', 'accessory', 'key'];
    const index = categoryOrder.indexOf(category);

    for (let i = 0; i < this.categoryTabs.length; i++) {
      if (i === index) {
        this.categoryTabs[i].setColor('#D4A84B');
      } else {
        this.categoryTabs[i].setColor('#FFFFFF');
      }
    }

    this.updateItemList();
    this.updateItemSelection();
  }

  /**
   * Update item list based on current category
   */
  private updateItemList(): void {
    // Clear existing items
    if (this.itemListContainer) {
      this.itemListContainer.removeAll(true);
    }
    this.itemButtons = [];
    this.filteredItems = [];

    // Filter items by category
    for (const entry of this.inventory) {
      const item = this.itemManager.getItem(entry.itemId);
      if (!item) continue;

      if (this.currentCategory === 'all' || item.type === this.currentCategory) {
        this.filteredItems.push({ entry, item });
      }
    }

    // Create item buttons
    for (let i = 0; i < this.filteredItems.length && i < this.VISIBLE_ITEMS; i++) {
      const { entry, item } = this.filteredItems[i];
      const y = i * this.ITEM_HEIGHT;

      // Item button container
      const btnContainer = this.add.container(0, y);

      // Background
      const bg = this.add.graphics();
      bg.fillStyle(0x333355, 1);
      bg.fillRoundedRect(0, 0, 380, this.ITEM_HEIGHT - 5, 3);
      btnContainer.add(bg);

      // Item name
      const nameText = this.add.text(10, (this.ITEM_HEIGHT - 5) / 2, item.name, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#FFFFFF',
      });
      nameText.setOrigin(0, 0.5);
      btnContainer.add(nameText);

      // Quantity (for non-equipment or equipped indicator)
      if (item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory') {
        const qtyText = this.add.text(300, (this.ITEM_HEIGHT - 5) / 2, `x${entry.quantity}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#AAAAAA',
        });
        qtyText.setOrigin(0, 0.5);
        btnContainer.add(qtyText);
      } else if (entry.equipped) {
        const eqText = this.add.text(300, (this.ITEM_HEIGHT - 5) / 2, '装备中', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#88FF88',
        });
        eqText.setOrigin(0, 0.5);
        btnContainer.add(eqText);
      }

      // Make interactive
      const hitArea = this.add.rectangle(190, (this.ITEM_HEIGHT - 5) / 2, 380, this.ITEM_HEIGHT - 5, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => {
        this.selectedItemIndex = i;
        this.updateItemSelection();
      });
      btnContainer.add(hitArea);

      this.itemListContainer!.add(btnContainer);
      this.itemButtons.push(btnContainer);
    }

    // Update detail panel
    this.updateDetailPanel();
  }

  /**
   * Update item selection visual
   */
  private updateItemSelection(): void {
    for (let i = 0; i < this.itemButtons.length; i++) {
      const container = this.itemButtons[i];
      const bg = container.getAt(0) as Phaser.GameObjects.Graphics;

      bg.clear();
      if (i === this.selectedItemIndex) {
        bg.fillStyle(0x445588, 1);
        bg.fillRoundedRect(0, 0, 380, this.ITEM_HEIGHT - 5, 3);
        bg.lineStyle(2, 0xD4A84B);
        bg.strokeRoundedRect(0, 0, 380, this.ITEM_HEIGHT - 5, 3);
      } else {
        bg.fillStyle(0x333355, 1);
        bg.fillRoundedRect(0, 0, 380, this.ITEM_HEIGHT - 5, 3);
      }
    }

    // Update detail panel
    this.updateDetailPanel();
    this.updateCharacterSelect();
  }

  /**
   * Navigate through items
   */
  private navigateItem(direction: number): void {
    const maxIndex = Math.min(this.filteredItems.length - 1, this.VISIBLE_ITEMS - 1);
    this.selectedItemIndex = Phaser.Math.Clamp(this.selectedItemIndex + direction, 0, maxIndex);
    this.updateItemSelection();
  }

  /**
   * Navigate through characters
   */
  private navigateCharacter(direction: number): void {
    this.selectedCharacterIndex = Phaser.Math.Clamp(
      this.selectedCharacterIndex + direction,
      0,
      this.characters.length - 1
    );
    this.updateCharacterSelect();
  }

  /**
   * Update detail panel with selected item info
   */
  private updateDetailPanel(): void {
    if (!this.detailContainer) return;

    this.detailContainer.removeAll(true);

    if (this.filteredItems.length === 0 || this.selectedItemIndex >= this.filteredItems.length) {
      const emptyText = this.add.text(185, 85, '没有物品', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#888888',
      });
      emptyText.setOrigin(0.5, 0.5);
      this.detailContainer.add(emptyText);
      return;
    }

    const { item } = this.filteredItems[this.selectedItemIndex];

    // Item name
    const nameText = this.add.text(0, 0, item.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#D4A84B',
      fontStyle: 'bold',
    });
    this.detailContainer.add(nameText);

    // Type
    const typeNames: Record<ItemType, string> = {
      consumable: '消耗品',
      weapon: '武器',
      armor: '防具',
      accessory: '饰品',
      key: '剧情道具',
    };
    const typeText = this.add.text(250, 5, typeNames[item.type], {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#888888',
    });
    this.detailContainer.add(typeText);

    // Description
    const descText = this.add.text(0, 35, item.description, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#CCCCCC',
      wordWrap: { width: 370 },
    });
    this.detailContainer.add(descText);

    // Price
    const priceText = this.add.text(0, 70, `价格: ${item.price}G (出售: ${Math.floor(item.price / 2)}G)`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#FFD700',
    });
    this.detailContainer.add(priceText);

    // Effect/Bonus info
    let effectY = 95;

    if (item.effect) {
      const effects: string[] = [];
      if (item.effect.hp) effects.push(`HP ${item.effect.hp > 0 ? '+' : ''}${item.effect.hp}`);
      if (item.effect.mp) effects.push(`MP ${item.effect.mp > 0 ? '+' : ''}${item.effect.mp}`);
      if (item.effect.removeStatus) effects.push(`解除 ${item.effect.removeStatus.join(', ')}`);
      if (item.effect.statusEffect) effects.push(`附加状态效果`);

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
      if (item.bonus.hp) bonuses.push(`HP +${item.bonus.hp}`);
      if (item.bonus.mp) bonuses.push(`MP +${item.bonus.mp}`);
      if (item.bonus.attack) bonuses.push(`攻击 +${item.bonus.attack}`);
      if (item.bonus.defense) bonuses.push(`防御 +${item.bonus.defense}`);
      if (item.bonus.speed) bonuses.push(`速度 +${item.bonus.speed}`);
      if (item.bonus.luck) bonuses.push(`运气 +${item.bonus.luck}`);

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
   * Update character selection panel
   */
  private updateCharacterSelect(): void {
    if (!this.characterSelectContainer) return;

    this.characterSelectContainer.removeAll(true);

    // Title
    const titleText = this.add.text(185, 0, '选择角色', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#D4A84B',
    });
    titleText.setOrigin(0.5, 0);
    this.characterSelectContainer.add(titleText);

    if (this.characters.length === 0) {
      const emptyText = this.add.text(185, 60, '无角色', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#888888',
      });
      emptyText.setOrigin(0.5, 0.5);
      this.characterSelectContainer.add(emptyText);
      return;
    }

    // Character buttons
    const charWidth = 90;
    const startX = (370 - this.characters.length * charWidth) / 2;

    for (let i = 0; i < this.characters.length; i++) {
      const char = this.characters[i];
      const x = startX + i * charWidth;

      // Selection background
      const bg = this.add.graphics();
      if (i === this.selectedCharacterIndex) {
        bg.fillStyle(0x445588, 1);
        bg.lineStyle(2, 0xD4A84B);
      } else {
        bg.fillStyle(0x333355, 1);
      }
      bg.fillRoundedRect(x, 30, charWidth - 5, 100, 5);
      if (i === this.selectedCharacterIndex) {
        bg.strokeRoundedRect(x, 30, charWidth - 5, 100, 5);
      }
      this.characterSelectContainer.add(bg);

      // Character name
      const nameText = this.add.text(x + (charWidth - 5) / 2, 50, char.name, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#FFFFFF',
      });
      nameText.setOrigin(0.5, 0.5);
      this.characterSelectContainer.add(nameText);

      // HP/MP bars
      const hpRatio = char.hp / char.maxHp;
      const mpRatio = char.mp / char.maxMp;

      // HP bar
      const hpBarBg = this.add.graphics();
      hpBarBg.fillStyle(0x333333);
      hpBarBg.fillRect(x + 5, 70, charWidth - 15, 8);
      this.characterSelectContainer.add(hpBarBg);

      const hpBar = this.add.graphics();
      hpBar.fillStyle(hpRatio > 0.5 ? 0x44FF44 : hpRatio > 0.25 ? 0xFFFF44 : 0xFF4444);
      hpBar.fillRect(x + 5, 70, (charWidth - 15) * hpRatio, 8);
      this.characterSelectContainer.add(hpBar);

      // MP bar
      const mpBarBg = this.add.graphics();
      mpBarBg.fillStyle(0x333333);
      mpBarBg.fillRect(x + 5, 82, charWidth - 15, 8);
      this.characterSelectContainer.add(mpBarBg);

      const mpBar = this.add.graphics();
      mpBar.fillStyle(0x4488FF);
      mpBar.fillRect(x + 5, 82, (charWidth - 15) * mpRatio, 8);
      this.characterSelectContainer.add(mpBar);

      // Level
      const levelText = this.add.text(x + (charWidth - 5) / 2, 100, `Lv.${char.level}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#AAAAAA',
      });
      levelText.setOrigin(0.5, 0.5);
      this.characterSelectContainer.add(levelText);

      // Make interactive
      const hitArea = this.add.rectangle(x + (charWidth - 5) / 2, 80, charWidth - 5, 100, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => {
        this.selectedCharacterIndex = i;
        this.updateCharacterSelect();
      });
      this.characterSelectContainer.add(hitArea);
    }
  }

  /**
   * Handle use or equip action
   */
  private handleUseOrEquip(): void {
    if (this.filteredItems.length === 0 || this.selectedItemIndex >= this.filteredItems.length) return;
    if (this.characters.length === 0) return;

    const { entry, item } = this.filteredItems[this.selectedItemIndex];
    const character = this.characters[this.selectedCharacterIndex];

    if (item.type === 'consumable') {
      this.useConsumable(entry, item, character);
    } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
      this.toggleEquipment(entry, item, character);
    }
  }

  /**
   * Use a consumable item
   */
  private useConsumable(entry: InventoryEntry, item: Item, character: Character): void {
    if (!this.itemManager.canUse(item, 'menu')) return;

    // Apply effect
    const result = this.itemManager.applyEffect(item, character);

    // Update character stats
    character.hp = Math.min(character.maxHp, Math.max(0, character.hp + result.hpChange));
    character.mp = Math.min(character.maxMp, Math.max(0, character.mp + result.mpChange));

    // Remove status effects
    for (const status of result.removedStatuses) {
      character.statusEffects = character.statusEffects.filter(e => e.type !== status);
    }

    // Add status effect if any
    if (result.addedStatus) {
      character.statusEffects.push(result.addedStatus);
    }

    // Decrease quantity
    entry.quantity--;
    if (entry.quantity <= 0) {
      const index = this.inventory.findIndex(e => e.itemId === entry.itemId);
      if (index >= 0) {
        this.inventory.splice(index, 1);
      }
    }

    // Update UI
    this.updateItemList();
    this.updateCharacterSelect();
    this.updateGoldDisplay();
  }

  /**
   * Toggle equipment on a character
   */
  private toggleEquipment(entry: InventoryEntry, item: Item, character: Character): void {
    if (entry.equipped && entry.equippedTo === character.id) {
      // Unequip
      entry.equipped = false;
      entry.equippedTo = undefined;
    } else {
      // Unequip from previous character if any
      if (entry.equipped && entry.equippedTo) {
        entry.equipped = false;
        entry.equippedTo = undefined;
      }

      // Find and unequip existing item of same type
      for (const invEntry of this.inventory) {
        const invItem = this.itemManager.getItem(invEntry.itemId);
        if (invItem && invItem.type === item.type && invEntry.equipped && invEntry.equippedTo === character.id) {
          invEntry.equipped = false;
          invEntry.equippedTo = undefined;
        }
      }

      // Equip
      entry.equipped = true;
      entry.equippedTo = character.id;
    }

    // Update UI
    this.updateItemList();
    this.updateCharacterSelect();
  }

  /**
   * Sort inventory by type and name
   */
  private sortInventory(): void {
    const typeOrder: ItemType[] = ['consumable', 'weapon', 'armor', 'accessory', 'key'];

    this.inventory.sort((a, b) => {
      const itemA = this.itemManager.getItem(a.itemId);
      const itemB = this.itemManager.getItem(b.itemId);
      if (!itemA || !itemB) return 0;

      const typeDiff = typeOrder.indexOf(itemA.type) - typeOrder.indexOf(itemB.type);
      if (typeDiff !== 0) return typeDiff;

      return itemA.name.localeCompare(itemB.name, 'zh-CN');
    });

    this.updateItemList();
  }

  /**
   * Update gold display
   */
  private updateGoldDisplay(): void {
    if (this.goldText) {
      this.goldText.setText(`金钱: ${this.gold}`);
    }
  }

  /**
   * Close inventory scene
   */
  private closeScene(): void {
    this.cameras.main.fadeOut(200, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      const closeEvent: InventoryCloseEvent = {
        inventory: this.inventory,
        characters: this.characters,
        gold: this.gold,
      };

      this.scene.stop();
      this.scene.resume('WorldScene', closeEvent);
    });
  }

  /**
   * Cleanup scene
   */
  shutdown(): void {
    // Remove keyboard listeners
    this.input.keyboard!.off('keydown-ONE');
    this.input.keyboard!.off('keydown-TWO');
    this.input.keyboard!.off('keydown-THREE');
    this.input.keyboard!.off('keydown-FOUR');
    this.input.keyboard!.off('keydown-FIVE');
    this.input.keyboard!.off('keydown-SIX');
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