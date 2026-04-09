/**
 * Settings Scene - Game settings interface
 * US-050: 设置界面
 */

import Phaser from 'phaser';
import { SaveSystem, GameSettings, DEFAULT_SETTINGS } from '@/systems/SaveSystem';

/**
 * Settings Scene class
 * Displays and manages game settings
 */
export class SettingsScene extends Phaser.Scene {
  private settings: GameSettings;
  private volumeBars: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private volumeTexts: Map<string, Phaser.GameObjects.Text> = new Map();
  private currentSettingIndex: number = 0;
  private settingsItems: { key: string; label: string; type: 'slider' | 'toggle' | 'info' }[] = [];

  constructor() {
    super({ key: 'SettingsScene' });
    this.settings = { ...DEFAULT_SETTINGS };
  }

  create(): void {
    this.settings = SaveSystem.getSettings();

    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.cameras.main.fadeIn(200);

    this.createHeader();
    this.createSettingsItems();
    this.createButtons();
    this.setupInput();
  }

  /**
   * Create header with title
   */
  private createHeader(): void {
    const width = this.cameras.main.width;

    // Title background
    this.add.rectangle(width / 2, 50, width, 80, 0x2d2d44);

    // Title
    const title = this.add.text(width / 2, 50, '游戏设置', {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      color: '#D4A84B',
    });
    title.setOrigin(0.5, 0.5);

    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(2, 0xD4A84B, 1);
    line.lineBetween(100, 90, width - 100, 90);
  }

  /**
   * Create settings items
   */
  private createSettingsItems(): void {
    const itemHeight = 70;
    const itemWidth = 600;

    this.settingsItems = [
      { key: 'bgmVolume', label: '背景音乐音量', type: 'slider' },
      { key: 'sfxVolume', label: '音效音量', type: 'slider' },
      { key: 'textSpeed', label: '文字速度', type: 'slider' },
      { key: 'autoSave', label: '自动存档', type: 'toggle' },
      { key: 'controls', label: '键盘操作说明', type: 'info' },
    ];

    for (let i = 0; i < this.settingsItems.length; i++) {
      const item = this.settingsItems[i];
      const y = i * itemHeight;

      // Item background
      const bg = this.add.rectangle(0, y, itemWidth, itemHeight - 10, 0x3d3d5c);
      bg.setInteractive({ useHandCursor: true });

      // Label
      const label = this.add.text(-itemWidth / 2 + 20, y - 10, item.label, {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFFFFF',
      });
      label.setOrigin(0, 0.5);

      // Value display based on type
      switch (item.type) {
        case 'slider':
          this.createSlider(item.key, y, itemWidth);
          break;
        case 'toggle':
          this.createToggle(item.key, y, itemWidth);
          break;
        case 'info':
          this.createInfoDisplay(item.key, y, itemWidth);
          break;
      }

      // Add interactivity
      bg.on('pointerover', () => {
        bg.setFillStyle(0x4d4d6c);
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(0x3d3d5c);
      });
      bg.on('pointerdown', () => {
        this.handleItemClick(i);
      });
    }
  }

  /**
   * Create slider control
   */
  private createSlider(key: string, y: number, itemWidth: number): void {
    const value = this.settings[key as keyof GameSettings] as number;

    // Slider track
    const track = this.add.rectangle(itemWidth / 2 - 150, y, 200, 10, 0x666666);
    track.setOrigin(0, 0.5);

    // Slider fill
    const fill = this.add.rectangle(
      itemWidth / 2 - 150,
      y,
      value * 2,
      10,
      0xD4A84B
    );
    fill.setOrigin(0, 0.5);
    this.volumeBars.set(key, fill);

    // Value text
    const valueText = this.add.text(itemWidth / 2 + 70, y, `${value}%`, {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
    });
    valueText.setOrigin(0.5, 0.5);
    this.volumeTexts.set(key, valueText);
  }

  /**
   * Create toggle control
   */
  private createToggle(key: string, y: number, itemWidth: number): void {
    const value = this.settings[key as keyof GameSettings] as boolean;

    // Toggle background
    const toggleBg = this.add.rectangle(itemWidth / 2 - 50, y, 60, 30, value ? 0xD4A84B : 0x666666);
    toggleBg.setOrigin(0.5, 0.5);

    // Toggle knob
    const knob = this.add.circle(
      itemWidth / 2 - 50 + (value ? 15 : -15),
      y,
      12,
      0xFFFFFF
    );
    knob.setName(`${key}_knob`);

    // Status text
    const statusText = this.add.text(itemWidth / 2 + 70, y, value ? '开启' : '关闭', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: value ? '#88FF88' : '#888888',
    });
    statusText.setOrigin(0.5, 0.5);
    statusText.setName(`${key}_status`);
  }

  /**
   * Create info display
   */
  private createInfoDisplay(_key: string, y: number, itemWidth: number): void {
    const infoText = this.add.text(itemWidth / 2 - 50, y, '按 Enter 查看', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#88AAFF',
    });
    infoText.setOrigin(0.5, 0.5);
  }

  /**
   * Create buttons
   */
  private createButtons(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Save button
    const saveBtn = this.add.rectangle(width / 2 - 120, height - 80, 180, 50, 0x4CAF50);
    saveBtn.setInteractive({ useHandCursor: true });
    const saveText = this.add.text(width / 2 - 120, height - 80, '保存设置', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
    });
    saveText.setOrigin(0.5, 0.5);

    saveBtn.on('pointerover', () => saveBtn.setFillStyle(0x66BB6A));
    saveBtn.on('pointerout', () => saveBtn.setFillStyle(0x4CAF50));
    saveBtn.on('pointerdown', () => this.saveSettings());

    // Reset button
    const resetBtn = this.add.rectangle(width / 2 + 120, height - 80, 180, 50, 0xFF9800);
    resetBtn.setInteractive({ useHandCursor: true });
    const resetText = this.add.text(width / 2 + 120, height - 80, '恢复默认', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
    });
    resetText.setOrigin(0.5, 0.5);

    resetBtn.on('pointerover', () => resetBtn.setFillStyle(0xFFB74D));
    resetBtn.on('pointerout', () => resetBtn.setFillStyle(0xFF9800));
    resetBtn.on('pointerdown', () => this.resetSettings());

    // Close button
    const closeBtn = this.add.rectangle(width - 80, 50, 60, 40, 0xF44336);
    closeBtn.setInteractive({ useHandCursor: true });
    const closeText = this.add.text(width - 80, 50, '关闭', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
    });
    closeText.setOrigin(0.5, 0.5);

    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xEF5350));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0xF44336));
    closeBtn.on('pointerdown', () => this.closeScene());
  }

  /**
   * Setup keyboard input
   */
  private setupInput(): void {
    // Arrow keys navigation
    this.input.keyboard?.on('keydown-UP', () => this.navigateSettings(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.navigateSettings(1));
    this.input.keyboard?.on('keydown-W', () => this.navigateSettings(-1));
    this.input.keyboard?.on('keydown-S', () => this.navigateSettings(1));

    // Adjust values
    this.input.keyboard?.on('keydown-LEFT', () => this.adjustValue(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.adjustValue(1));
    this.input.keyboard?.on('keydown-A', () => this.adjustValue(-1));
    this.input.keyboard?.on('keydown-D', () => this.adjustValue(1));

    // Confirm/Enter
    this.input.keyboard?.on('keydown-ENTER', () => this.handleEnter());
    this.input.keyboard?.on('keydown-SPACE', () => this.handleEnter());

    // Close
    this.input.keyboard?.on('keydown-ESC', () => this.closeScene());
  }

  /**
   * Navigate settings
   */
  private navigateSettings(direction: number): void {
    this.currentSettingIndex = Phaser.Math.Clamp(
      this.currentSettingIndex + direction,
      0,
      this.settingsItems.length - 1
    );
  }

  /**
   * Adjust value
   */
  private adjustValue(direction: number): void {
    const item = this.settingsItems[this.currentSettingIndex];
    if (!item) return;

    if (item.type === 'slider') {
      const key = item.key as keyof GameSettings;
      const currentValue = this.settings[key] as number;
      let newValue = currentValue + direction * 10;

      // Text speed has different range (1-3)
      if (key === 'textSpeed') {
        newValue = Phaser.Math.Clamp(currentValue + direction, 1, 3);
      } else {
        newValue = Phaser.Math.Clamp(newValue, 0, 100);
      }

      this.settings[key] = newValue as never;
      this.updateSliderDisplay(item.key, newValue);
    }
  }

  /**
   * Update slider display
   */
  private updateSliderDisplay(key: string, value: number): void {
    const fill = this.volumeBars.get(key);
    const text = this.volumeTexts.get(key);

    if (fill) {
      // Text speed has different display
      if (key === 'textSpeed') {
        fill.width = (value / 3) * 200;
      } else {
        fill.width = value * 2;
      }
    }

    if (text) {
      if (key === 'textSpeed') {
        const speeds = ['慢', '普通', '快'];
        text.setText(speeds[value - 1] || '普通');
      } else {
        text.setText(`${value}%`);
      }
    }
  }

  /**
   * Handle item click
   */
  private handleItemClick(index: number): void {
    this.currentSettingIndex = index;
    this.handleEnter();
  }

  /**
   * Handle enter key
   */
  private handleEnter(): void {
    const item = this.settingsItems[this.currentSettingIndex];
    if (!item) return;

    if (item.type === 'toggle') {
      const key = item.key as keyof GameSettings;
      const currentValue = this.settings[key] as boolean;
      this.settings[key] = !currentValue as never;
      this.updateToggleDisplay(item.key, !currentValue);
    } else if (item.type === 'info') {
      this.showControlsInfo();
    }
  }

  /**
   * Update toggle display
   */
  private updateToggleDisplay(key: string, value: boolean): void {
    const knob = this.children.getByName(`${key}_knob`) as Phaser.GameObjects.Arc;
    const status = this.children.getByName(`${key}_status`) as Phaser.GameObjects.Text;

    if (knob) {
      this.tweens.add({
        targets: knob,
        x: knob.x + (value ? 30 : -30),
        duration: 150,
      });
    }

    if (status) {
      status.setText(value ? '开启' : '关闭');
      status.setColor(value ? '#88FF88' : '#888888');
    }
  }

  /**
   * Show controls info
   */
  private showControlsInfo(): void {
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.8
    );
    overlay.setInteractive();
    overlay.setDepth(100);

    // Info panel
    const panel = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      500,
      400,
      0x2d2d44
    );
    panel.setStrokeStyle(2, 0xD4A84B);
    panel.setDepth(101);

    // Title
    const title = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 160,
      '键盘操作说明',
      { fontSize: '28px', color: '#D4A84B' }
    );
    title.setOrigin(0.5);
    title.setDepth(102);

    // Controls list
    const controls = [
      '↑↓/WS - 上下移动/选择',
      '←→/AD - 左右移动/调整',
      'Enter/Space - 确认/交互',
      'ESC - 返回/关闭菜单',
      'T - 切换全体/单体攻击',
      'I - 打开物品栏',
      'S - 打开存档界面',
      '',
      '地图探索:',
      '方向键/WASD - 移动角色',
      'Enter/Space - 与NPC对话',
    ];

    for (let i = 0; i < controls.length; i++) {
      const line = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 110 + i * 30,
        controls[i],
        { fontSize: '18px', color: '#FFFFFF' }
      );
      line.setOrigin(0.5);
      line.setDepth(102);
    }

    // Close instruction
    const closeHint = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 160,
      '按任意键关闭',
      { fontSize: '16px', color: '#888888' }
    );
    closeHint.setOrigin(0.5);
    closeHint.setDepth(102);

    // Close on any key
    this.input.keyboard?.once('keydown', () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      closeHint.destroy();
      this.scene.restart({ settings: this.settings });
    });

    overlay.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      closeHint.destroy();
      this.scene.restart({ settings: this.settings });
    });
  }

  /**
   * Save settings
   */
  private saveSettings(): void {
    SaveSystem.saveSettings(this.settings);
    this.showMessage('设置已保存！', '#88FF88');
  }

  /**
   * Reset settings
   */
  private resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };

    // Update all displays
    for (const item of this.settingsItems) {
      if (item.type === 'slider') {
        this.updateSliderDisplay(item.key, this.settings[item.key as keyof GameSettings] as number);
      } else if (item.type === 'toggle') {
        this.updateToggleDisplay(item.key, this.settings[item.key as keyof GameSettings] as boolean);
      }
    }

    this.showMessage('已恢复默认设置', '#FFAA88');
  }

  /**
   * Show message
   */
  private showMessage(text: string, color: string): void {
    const msg = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 150,
      text,
      { fontSize: '24px', fontFamily: 'Arial, sans-serif', color }
    );
    msg.setOrigin(0.5);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: msg.y - 30,
      duration: 2000,
      onComplete: () => msg.destroy(),
    });
  }

  /**
   * Close scene
   */
  private closeScene(): void {
    this.cameras.main.fade(200, 0, 0, 0);
    this.time.delayedCall(200, () => {
      this.scene.stop();
    });
  }
}