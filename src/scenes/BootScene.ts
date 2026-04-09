/**
 * Boot Scene - Loads game assets and shows loading progress
 * US-003: 启动场景和主菜单
 * US-009: 李逍遥角色实现 - Sprite and portrait generation
 */

import Phaser from 'phaser';
import { SpriteGenerator, CHARACTER_APPEARANCES, DEFAULT_SPRITE_CONFIG } from '@/utils/SpriteGenerator';
import { PortraitGenerator, PORTRAIT_APPEARANCES, DEFAULT_PORTRAIT_CONFIG } from '@/utils/PortraitGenerator';

export class BootScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.createLoadingUI();

    // Load progress events
    this.load.on('progress', (value: number) => {
      this.updateProgress(value);
    });

    this.load.on('complete', () => {
      this.onLoadComplete();
    });

    // Load placeholder assets - these will be replaced with real assets later
    this.loadPlaceholderAssets();
  }

  create(): void {
    // Generate placeholder character sprites and portraits
    this.generateCharacterAssets();

    // Fade out and transition to main menu
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }

  /**
   * Create loading UI elements
   */
  private createLoadingUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background color - dark purple for mystical atmosphere
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Loading bar background
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x222222, 1);
    this.loadingBar.fillRect(
      width / 4,
      height / 2 - 15,
      width / 2,
      30
    );

    // Progress bar (will be updated)
    this.progressBar = this.add.graphics();

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#D4A84B', // Gold color
    });
    this.loadingText.setOrigin(0.5, 0.5);

    // Percentage text
    this.percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#FFFFFF',
    });
    this.percentText.setOrigin(0.5, 0.5);

    // Title text - show game name during loading
    const titleText = this.add.text(width / 2, height / 3, '仙剑奇侠传', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '48px',
      color: '#D4A84B',
      fontStyle: 'bold',
    });
    titleText.setOrigin(0.5, 0.5);

    // Subtitle
    const subtitleText = this.add.text(width / 2, height / 3 + 60, '现代重制版', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#AAAAAA',
    });
    subtitleText.setOrigin(0.5, 0.5);
  }

  /**
   * Update progress bar and percentage
   */
  private updateProgress(value: number): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Clear and redraw progress bar
    this.progressBar.clear();
    this.progressBar.fillStyle(0xD4A84B, 1); // Gold color
    this.progressBar.fillRect(
      width / 4 + 5,
      height / 2 - 10,
      (width / 2 - 10) * value,
      20
    );

    // Update percentage text
    this.percentText.setText(Math.floor(value * 100) + '%');
  }

  /**
   * Handle load complete
   */
  private onLoadComplete(): void {
    this.loadingText.setText('加载完成!');
    this.percentText.setText('100%');
  }

  /**
   * Load placeholder assets for development
   * These will be replaced with proper assets in US-052
   */
  private loadPlaceholderAssets(): void {
    // Create placeholder textures using graphics
    // This allows the game to run without actual image files

    // For now, we'll create minimal placeholder data
    // Actual asset loading will be implemented when assets are available

    // Simulate some loading time for visual effect
    // In production, this would be actual asset files
    for (let i = 0; i < 5; i++) {
      this.load.image(`placeholder_${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    }
  }

  /**
   * Generate character sprite sheets and portraits
   * US-009: 李逍遥角色实现
   */
  private generateCharacterAssets(): void {
    // Generate sprite sheets for main characters
    const mainCharacters = ['li_xiaoyao', 'zhao_linger', 'lin_yueru', 'anu'];

    for (const characterId of mainCharacters) {
      const appearance = CHARACTER_APPEARANCES[characterId];
      if (appearance) {
        // Generate walking sprite sheet
        SpriteGenerator.generateSpriteSheet(
          this,
          `sprite_${characterId}`,
          appearance,
          DEFAULT_SPRITE_CONFIG
        );

        // Generate portrait set with all expressions
        const portraitAppearance = PORTRAIT_APPEARANCES[characterId];
        if (portraitAppearance) {
          PortraitGenerator.generatePortraitSet(
            this,
            characterId,
            portraitAppearance,
            DEFAULT_PORTRAIT_CONFIG
          );
        }
      }
    }

    // Generate NPC sprites
    const npcTypes = ['npc_villager', 'npc_elder'];
    for (const npcId of npcTypes) {
      const appearance = CHARACTER_APPEARANCES[npcId];
      if (appearance) {
        SpriteGenerator.generateSpriteSheet(
          this,
          `sprite_${npcId}`,
          appearance,
          DEFAULT_SPRITE_CONFIG
        );
      }
    }

    // Generate default player sprite (using li_xiaoyao)
    SpriteGenerator.generateSpriteSheet(
      this,
      'player',
      CHARACTER_APPEARANCES.li_xiaoyao,
      DEFAULT_SPRITE_CONFIG
    );
  }
}