/**
 * Main Menu Scene - Displays title and menu options
 * US-003: 启动场景和主菜单
 */

import Phaser from 'phaser';

interface MenuOption {
  text: string;
  action: () => void;
  y: number;
}

export class MainMenuScene extends Phaser.Scene {
  private menuOptions: MenuOption[] = [];
  private selectedIndex: number = 0;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private keyboard!: Phaser.Input.Keyboard.KeyboardPlugin;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private selectKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    // Setup keyboard input
    this.setupInput();

    // Create background
    this.createBackground();

    // Create title
    this.createTitle();

    // Create menu options
    this.createMenuOptions();

    // Fade in effect
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Initial selection highlight
    this.updateSelection();
  }

  /**
   * Setup keyboard input handlers
   */
  private setupInput(): void {
    this.keyboard = this.input.keyboard!;

    // Cursor keys for navigation
    this.cursors = this.keyboard.createCursorKeys();

    // Enter key for selection
    this.enterKey = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Space key for selection (alternative)
    this.selectKey = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Also handle W/S keys for WASD navigation
    const wKey = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const sKey = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // Up navigation
    this.cursors.up.on('down', () => this.navigateUp());
    wKey.on('down', () => this.navigateUp());

    // Down navigation
    this.cursors.down.on('down', () => this.navigateDown());
    sKey.on('down', () => this.navigateDown());

    // Selection
    this.enterKey.on('down', () => this.selectOption());
    this.selectKey.on('down', () => this.selectOption());
  }

  /**
   * Create gradient-like background
   */
  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dark mystical background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Add decorative border elements (Chinese style)
    const graphics = this.add.graphics();

    // Gold border lines
    graphics.lineStyle(3, 0xD4A84B, 1);
    graphics.strokeRect(50, 50, width - 100, height - 100);

    // Inner decorative frame
    graphics.lineStyle(1, 0x8B6914, 0.5);
    graphics.strokeRect(70, 70, width - 140, height - 140);

    // Corner decorations (simple geometric patterns)
    const cornerSize = 30;
    graphics.fillStyle(0xD4A84B, 1);

    // Top-left corner
    graphics.fillRect(50, 50, cornerSize, 5);
    graphics.fillRect(50, 50, 5, cornerSize);

    // Top-right corner
    graphics.fillRect(width - 50 - cornerSize, 50, cornerSize, 5);
    graphics.fillRect(width - 55, 50, 5, cornerSize);

    // Bottom-left corner
    graphics.fillRect(50, height - 55, cornerSize, 5);
    graphics.fillRect(50, height - 50 - cornerSize, 5, cornerSize);

    // Bottom-right corner
    graphics.fillRect(width - 50 - cornerSize, height - 55, cornerSize, 5);
    graphics.fillRect(width - 55, height - 50 - cornerSize, 5, cornerSize);
  }

  /**
   * Create game title
   */
  private createTitle(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Main title - Chinese characters
    this.titleText = this.add.text(width / 2, height / 3, '仙剑奇侠传', {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: '72px',
      color: '#D4A84B',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 5,
        fill: true,
      },
    });
    this.titleText.setOrigin(0.5, 0.5);

    // Subtitle
    this.subtitleText = this.add.text(width / 2, height / 3 + 80, '现代重制版', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#AAAAAA',
    });
    this.subtitleText.setOrigin(0.5, 0.5);

    // Add subtle floating animation to title
    this.tweens.add({
      targets: this.titleText,
      y: height / 3 - 5,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Create menu options
   */
  private createMenuOptions(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const startY = height / 2 + 50;
    const spacing = 60;

    this.menuOptions = [
      {
        text: '新游戏',
        action: () => this.startNewGame(),
        y: startY,
      },
      {
        text: '继续',
        action: () => this.continueGame(),
        y: startY + spacing,
      },
      {
        text: '设置',
        action: () => this.openSettings(),
        y: startY + spacing * 2,
      },
    ];

    // Create text objects for each option
    this.menuOptions.forEach((option, index) => {
      const text = this.add.text(width / 2, option.y, option.text, {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fontSize: '32px',
        color: '#FFFFFF',
      });
      text.setOrigin(0.5, 0.5);
      text.setInteractive({ useHandCursor: true });

      // Click handler
      text.on('pointerdown', () => {
        this.selectedIndex = index;
        this.updateSelection();
        this.selectOption();
      });

      // Hover effect
      text.on('pointerover', () => {
        this.selectedIndex = index;
        this.updateSelection();
      });

      this.menuTexts.push(text);
    });

    // Add instruction text at bottom
    const instructionText = this.add.text(
      width / 2,
      height - 100,
      '使用 ↑↓ 或 W/S 选择，按 Enter 或 点击 确认',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#888888',
      }
    );
    instructionText.setOrigin(0.5, 0.5);
  }

  /**
   * Navigate up in menu
   */
  private navigateUp(): void {
    this.selectedIndex--;
    if (this.selectedIndex < 0) {
      this.selectedIndex = this.menuOptions.length - 1;
    }
    this.updateSelection();
  }

  /**
   * Navigate down in menu
   */
  private navigateDown(): void {
    this.selectedIndex++;
    if (this.selectedIndex >= this.menuOptions.length) {
      this.selectedIndex = 0;
    }
    this.updateSelection();
  }

  /**
   * Update visual selection state
   */
  private updateSelection(): void {
    this.menuTexts.forEach((text, index) => {
      if (index === this.selectedIndex) {
        // Selected state
        text.setColor('#D4A84B');
        text.setFontSize('36px');

        // Add subtle scale animation
        this.tweens.add({
          targets: text,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100,
          ease: 'Power2',
        });
      } else {
        // Unselected state
        text.setColor('#FFFFFF');
        text.setFontSize('32px');
        text.setScale(1, 1);
      }
    });
  }

  /**
   * Select current option
   */
  private selectOption(): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.menuOptions.length) {
      this.menuOptions[this.selectedIndex].action();
    }
  }

  /**
   * Start new game
   */
  private startNewGame(): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // For now, show a placeholder message
      // Will transition to WorldScene when US-004 is implemented
      this.showMessage('新游戏功能将在后续版本实现...');
    });
  }

  /**
   * Continue saved game
   */
  private continueGame(): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // For now, show a placeholder message
      // Will open save menu when US-017 is implemented
      this.showMessage('存档功能将在后续版本实现...');
    });
  }

  /**
   * Open settings
   */
  private openSettings(): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // For now, show a placeholder message
      // Will open settings when US-050 is implemented
      this.showMessage('设置功能将在后续版本实现...');
    });
  }

  /**
   * Show a temporary message
   */
  private showMessage(message: string): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create message box background
    const boxWidth = 400;
    const boxHeight = 100;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 0.9);
    graphics.fillRect(boxX, boxY, boxWidth, boxHeight);
    graphics.lineStyle(2, 0xD4A84B, 1);
    graphics.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Message text
    const messageText = this.add.text(width / 2, height / 2, message, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#FFFFFF',
    });
    messageText.setOrigin(0.5, 0.5);

    // Fade back in
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Return to menu after delay
    this.time.delayedCall(2000, () => {
      graphics.destroy();
      messageText.destroy();
    });
  }

  /**
   * Cleanup on scene shutdown
   */
  shutdown(): void {
    // Remove keyboard event listeners
    if (this.cursors) {
      this.cursors.up.off('down');
      this.cursors.down.off('down');
    }
    if (this.enterKey) {
      this.enterKey.off('down');
    }
    if (this.selectKey) {
      this.selectKey.off('down');
    }
  }
}