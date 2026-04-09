/**
 * Save/Load Scene - Save slot management interface
 * US-017: 存档/读档界面
 */

import Phaser from 'phaser';
import { SaveSystem, SaveData, SaveSlotInfo } from '@/systems/SaveSystem';

/**
 * Save/Load mode
 */
type SaveLoadMode = 'save' | 'load';

/**
 * Save/Load scene configuration
 */
export interface SaveLoadSceneConfig {
  mode: SaveLoadMode;
  currentSaveData?: Omit<SaveData, 'slotId' | 'timestamp'>;
}

/**
 * Event emitted when save/load scene closes
 */
export interface SaveLoadCloseEvent {
  action: 'saved' | 'loaded' | 'cancelled';
  saveData?: SaveData;
}

/**
 * Save/Load Scene class
 * Manages save slots and save/load operations
 */
export class SaveLoadScene extends Phaser.Scene {
  private mode: SaveLoadMode = 'save';
  private currentSaveData?: Omit<SaveData, 'slotId' | 'timestamp'>;
  private slotInfos: SaveSlotInfo[] = [];
  private selectedSlotIndex: number = 0;

  // UI elements
  private slotContainers: Phaser.GameObjects.Container[] = [];
  private modeText: Phaser.GameObjects.Text | null = null;
  private messageText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'SaveLoadScene' });
  }

  init(config: SaveLoadSceneConfig): void {
    this.mode = config.mode;
    this.currentSaveData = config.currentSaveData;
    this.selectedSlotIndex = 0;
    this.slotInfos = SaveSystem.getAllSlotInfo();
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.cameras.main.fadeIn(200);

    // Create UI
    this.createHeader();
    this.createSlotList();
    this.createActionButtons();
    this.createMessageArea();

    // Setup input
    this.setupInput();

    // Update selection
    this.updateSlotSelection();
  }

  /**
   * Create header with title
   */
  private createHeader(): void {
    const width = this.cameras.main.width;

    // Title based on mode
    const title = this.mode === 'save' ? '存档' : '读档';
    this.modeText = this.add.text(width / 2, 40, title, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '36px',
      color: '#D4A84B',
      fontStyle: 'bold',
    });
    this.modeText.setOrigin(0.5, 0.5);

    // Instruction text
    const instruction = this.mode === 'save'
      ? '选择存档槽位进行保存'
      : '选择存档槽位进行读取';

    const instructionText = this.add.text(width / 2, 80, instruction, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#AAAAAA',
    });
    instructionText.setOrigin(0.5, 0.5);

    // Border line
    const border = this.add.graphics();
    border.lineStyle(2, 0xD4A84B);
    border.lineBetween(100, 110, width - 100, 110);
  }

  /**
   * Create save slot list
   */
  private createSlotList(): void {
    const startY = 140;
    const slotHeight = 100;
    const slotWidth = 700;
    const centerX = this.cameras.main.width / 2;

    for (let i = 0; i < this.slotInfos.length; i++) {
      const slotInfo = this.slotInfos[i];
      const y = startY + i * (slotHeight + 15);

      // Slot container
      const container = this.add.container(centerX - slotWidth / 2, y);

      // Slot background
      const bg = this.add.graphics();
      bg.fillStyle(0x222244, 0.9);
      bg.fillRoundedRect(0, 0, slotWidth, slotHeight, 8);
      bg.lineStyle(2, 0x666688);
      bg.strokeRoundedRect(0, 0, slotWidth, slotHeight, 8);
      container.add(bg);

      // Slot number
      const slotNumText = this.add.text(30, slotHeight / 2, `存档 ${i + 1}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#D4A84B',
        fontStyle: 'bold',
      });
      slotNumText.setOrigin(0, 0.5);
      container.add(slotNumText);

      if (slotInfo.exists) {
        // Play time
        const playTime = SaveSystem.formatPlayTime(slotInfo.playTime || 0);
        const timeText = this.add.text(180, 25, `游戏时间: ${playTime}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#FFFFFF',
        });
        container.add(timeText);

        // Chapter
        const chapterText = this.add.text(180, 50, `章节: ${slotInfo.currentChapter || 1}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#AAAAAA',
        });
        container.add(chapterText);

        // Timestamp
        const timestamp = SaveSystem.formatTimestamp(slotInfo.timestamp || 0);
        const dateText = this.add.text(180, 75, `保存时间: ${timestamp}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#888888',
        });
        container.add(dateText);

        // Location
        const mapText = this.add.text(450, 50, `地点: ${slotInfo.currentMap || '未知'}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: '#AAAAAA',
        });
        container.add(mapText);

        // Thumbnail placeholder (colored rectangle)
        const thumbnail = this.add.graphics();
        thumbnail.fillStyle(0x445566);
        thumbnail.fillRect(620, 15, 60, 70);
        thumbnail.lineStyle(1, 0x666688);
        thumbnail.strokeRect(620, 15, 60, 70);
        container.add(thumbnail);

        // Character icon placeholder
        const charIcon = this.add.text(650, 50, '👤', {
          fontSize: '30px',
        });
        charIcon.setOrigin(0.5, 0.5);
        container.add(charIcon);
      } else {
        // Empty slot
        const emptyText = this.add.text(slotWidth / 2, slotHeight / 2, '-- 空 --', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px',
          color: '#666666',
        });
        emptyText.setOrigin(0.5, 0.5);
        container.add(emptyText);
      }

      // Make interactive
      const hitArea = this.add.rectangle(slotWidth / 2, slotHeight / 2, slotWidth, slotHeight, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => {
        this.selectedSlotIndex = i;
        this.updateSlotSelection();
      });
      container.add(hitArea);

      this.slotContainers.push(container);
    }
  }

  /**
   * Create action buttons
   */
  private createActionButtons(): void {
    const width = this.cameras.main.width;
    const y = 680;

    // Main action button (Save/Load)
    const actionLabel = this.mode === 'save' ? '保存' : '读取';
    const actionColor = this.mode === 'save' ? 0x448844 : 0x444488;
    this.createButton(width / 2 - 130, y, actionLabel, actionColor, () => {
      this.handleAction();
    });

    // Delete button
    this.createButton(width / 2 + 20, y, '删除', 0x884444, () => {
      this.handleDelete();
    });

    // Close button
    this.createButton(width / 2 + 170, y, '关闭', 0x666666, () => {
      this.closeScene('cancelled');
    });
  }

  /**
   * Create a styled button
   */
  private createButton(x: number, y: number, label: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(0, 0, 120, 45, 5);
    bg.lineStyle(1, color + 0x222222);
    bg.strokeRoundedRect(0, 0, 120, 45, 5);

    const text = this.add.text(60, 22, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);

    // Make interactive
    const hitArea = this.add.rectangle(60, 22, 120, 45, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', callback);
    container.add(hitArea);

    return container;
  }

  /**
   * Create message area for feedback
   */
  private createMessageArea(): void {
    this.messageText = this.add.text(this.cameras.main.width / 2, 750, '', {
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
    // Navigation
    this.input.keyboard!.on('keydown-UP', () => this.navigateSlot(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.navigateSlot(1));
    this.input.keyboard!.on('keydown-W', () => this.navigateSlot(-1));
    this.input.keyboard!.on('keydown-S', () => this.navigateSlot(1));

    // Actions
    this.input.keyboard!.on('keydown-ENTER', () => this.handleAction());
    this.input.keyboard!.on('keydown-SPACE', () => this.handleAction());

    // Close
    this.input.keyboard!.on('keydown-ESC', () => this.closeScene('cancelled'));
  }

  /**
   * Navigate through slots
   */
  private navigateSlot(direction: number): void {
    this.selectedSlotIndex = Phaser.Math.Clamp(
      this.selectedSlotIndex + direction,
      0,
      this.slotInfos.length - 1
    );
    this.updateSlotSelection();
  }

  /**
   * Update slot selection visual
   */
  private updateSlotSelection(): void {
    for (let i = 0; i < this.slotContainers.length; i++) {
      const container = this.slotContainers[i];
      const bg = container.getAt(0) as Phaser.GameObjects.Graphics;

      bg.clear();
      if (i === this.selectedSlotIndex) {
        bg.fillStyle(0x334466, 1);
        bg.fillRoundedRect(0, 0, 700, 100, 8);
        bg.lineStyle(3, 0xD4A84B);
        bg.strokeRoundedRect(0, 0, 700, 100, 8);
      } else {
        bg.fillStyle(0x222244, 0.9);
        bg.fillRoundedRect(0, 0, 700, 100, 8);
        bg.lineStyle(2, 0x666688);
        bg.strokeRoundedRect(0, 0, 700, 100, 8);
      }
    }

    // Clear message
    this.showMessage('');
  }

  /**
   * Handle main action (save or load)
   */
  private handleAction(): void {
    const slotId = this.selectedSlotIndex + 1;
    const slotInfo = this.slotInfos[this.selectedSlotIndex];

    if (this.mode === 'save') {
      this.saveToSlot(slotId);
    } else {
      this.loadFromSlot(slotId, slotInfo);
    }
  }

  /**
   * Save to selected slot
   */
  private saveToSlot(slotId: number): void {
    if (!this.currentSaveData) {
      this.showMessage('错误: 无法获取当前游戏数据', 0xff4444);
      return;
    }

    const success = SaveSystem.save(slotId, this.currentSaveData);

    if (success) {
      this.showMessage('存档成功!', 0x44ff44);
      // Refresh slot info
      this.slotInfos = SaveSystem.getAllSlotInfo();
      this.refreshSlotDisplay();

      // Wait a moment then close
      this.time.delayedCall(1000, () => {
        this.closeScene('saved');
      });
    } else {
      this.showMessage('存档失败，请重试', 0xff4444);
    }
  }

  /**
   * Load from selected slot
   */
  private loadFromSlot(slotId: number, slotInfo: SaveSlotInfo): void {
    if (!slotInfo.exists) {
      this.showMessage('该槽位没有存档', 0xffaa44);
      return;
    }

    const saveData = SaveSystem.load(slotId);

    if (saveData) {
      this.showMessage('读取成功!', 0x44ff44);

      // Wait a moment then close with data
      this.time.delayedCall(500, () => {
        this.closeScene('loaded', saveData);
      });
    } else {
      this.showMessage('读取失败，存档可能已损坏', 0xff4444);
    }
  }

  /**
   * Handle delete action
   */
  private handleDelete(): void {
    const slotId = this.selectedSlotIndex + 1;
    const slotInfo = this.slotInfos[this.selectedSlotIndex];

    if (!slotInfo.exists) {
      this.showMessage('该槽位已经是空的', 0xffaa44);
      return;
    }

    // Delete the save
    const success = SaveSystem.delete(slotId);

    if (success) {
      this.showMessage('存档已删除', 0xffaa44);
      // Refresh slot info
      this.slotInfos = SaveSystem.getAllSlotInfo();
      this.refreshSlotDisplay();
    } else {
      this.showMessage('删除失败', 0xff4444);
    }
  }

  /**
   * Refresh slot display after changes
   */
  private refreshSlotDisplay(): void {
    // Recreate slot list
    for (const container of this.slotContainers) {
      container.destroy();
    }
    this.slotContainers = [];
    this.createSlotList();
    this.updateSlotSelection();
  }

  /**
   * Show message to user
   */
  private showMessage(text: string, color: number = 0xffffff): void {
    if (this.messageText) {
      const colorHex = '#' + color.toString(16).padStart(6, '0');
      this.messageText.setText(text);
      this.messageText.setColor(colorHex);
    }
  }

  /**
   * Close the scene
   */
  private closeScene(action: 'saved' | 'loaded' | 'cancelled', saveData?: SaveData): void {
    this.cameras.main.fadeOut(200, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      const closeEvent: SaveLoadCloseEvent = {
        action,
        saveData,
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
    this.input.keyboard!.off('keydown-UP');
    this.input.keyboard!.off('keydown-DOWN');
    this.input.keyboard!.off('keydown-W');
    this.input.keyboard!.off('keydown-S');
    this.input.keyboard!.off('keydown-ENTER');
    this.input.keyboard!.off('keydown-SPACE');
    this.input.keyboard!.off('keydown-ESC');
  }
}