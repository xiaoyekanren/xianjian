/**
 * Intro Scene - Game introduction sequence
 * US-048: 开场动画
 */

import Phaser from 'phaser';

/**
 * Intro Scene class
 * Displays game intro sequence with skip option
 */
export class IntroScene extends Phaser.Scene {
  private canSkip: boolean = false;
  private skipText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'IntroScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    this.playIntroSequence();

    // Setup skip controls
    this.setupSkipControls();
  }

  /**
   * Play the full intro sequence
   */
  private playIntroSequence(): void {
    // Phase 1: Title fade in
    this.time.delayedCall(500, () => {
      this.showTitle();
    });

    // Phase 2: Nuwa legend (ink painting style)
    this.time.delayedCall(4000, () => {
      this.showNuwaLegend();
    });

    // Phase 3: Dream sequence intro
    this.time.delayedCall(9000, () => {
      this.showDreamIntro();
    });

    // Phase 4: Enable skip and start game
    this.time.delayedCall(14000, () => {
      this.enableSkip();
    });
  }

  /**
   * Show game title with fade in
   */
  private showTitle(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title background glow
    const glow = this.add.graphics();
    glow.fillStyle(0xD4A84B, 0.1);
    glow.fillCircle(width / 2, height / 2, 300);

    // Main title
    const title = this.add.text(width / 2, height / 2, '仙剑奇侠传', {
      fontSize: '72px',
      fontFamily: 'Arial, sans-serif',
      color: '#D4A84B',
      stroke: '#000000',
      strokeThickness: 6,
    });
    title.setOrigin(0.5, 0.5);
    title.setAlpha(0);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 2 + 60, '现代重制版', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
    });
    subtitle.setOrigin(0.5, 0.5);
    subtitle.setAlpha(0);

    // Fade in animation
    this.tweens.add({
      targets: [title, subtitle],
      alpha: 1,
      duration: 2000,
      ease: 'Power2',
    });

    // Floating animation
    this.tweens.add({
      targets: title,
      y: height / 2 - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Show Nuwa legend (ink painting style)
   */
  private showNuwaLegend(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fade out title
    this.cameras.main.fade(1000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.children.removeAll();

      // Ink background
      const inkBg = this.add.graphics();
      inkBg.fillStyle(0x1a1a2e, 1);
      inkBg.fillRect(0, 0, width, height);

      // Nuwa figure (simplified ink painting style)
      this.drawInkNuwa(width / 2, height / 2);

      // Legend text
      const legendText = [
        '上古时期，女娲补天，',
        '以五彩石填补苍穹之缺。',
        '',
        '其血脉传承至今，',
        '守护着世间安宁...',
      ];

      let delay = 0;
      for (let i = 0; i < legendText.length; i++) {
        const text = this.add.text(width / 2, height / 2 + 100 + i * 35, legendText[i], {
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif',
          color: '#E0E0E0',
        });
        text.setOrigin(0.5, 0.5);
        text.setAlpha(0);

        this.time.delayedCall(delay, () => {
          this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 500,
          });
        });
        delay += 600;
      }

      this.cameras.main.fadeIn(1000);
    });
  }

  /**
   * Draw simplified Nuwa figure in ink style
   */
  private drawInkNuwa(x: number, y: number): void {
    const graphics = this.add.graphics();

    // Body (flowing ink style - simplified)
    graphics.lineStyle(3, 0x333333, 0.8);
    graphics.lineBetween(x - 50, y - 80, x - 50, y + 80);

    // Head
    graphics.fillStyle(0x444444, 0.6);
    graphics.fillCircle(x, y - 100, 30);

    // Snake tail (Nuwa's iconic form - simplified)
    graphics.lineStyle(4, 0x555555, 0.7);
    graphics.lineBetween(x, y, x + 40, y + 100);
    graphics.lineBetween(x + 40, y + 100, x - 20, y + 120);

    // Add subtle animation
    this.tweens.add({
      targets: graphics,
      alpha: 0.9,
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Show dream intro (Li Xiaoyao's dream)
   */
  private showDreamIntro(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fade to dream scene
    this.cameras.main.fade(1000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.children.removeAll();

      // Dream-like background
      const dreamBg = this.add.graphics();
      dreamBg.fillStyle(0x2a1a3a, 1);
      dreamBg.fillRect(0, 0, width, height);

      // Mist effect
      for (let i = 0; i < 5; i++) {
        const mist = this.add.ellipse(
          Phaser.Math.Between(0, width),
          Phaser.Math.Between(0, height),
          Phaser.Math.Between(100, 300),
          Phaser.Math.Between(50, 150),
          0xFFFFFF,
          0.05
        );
        this.tweens.add({
          targets: mist,
          x: mist.x + Phaser.Math.Between(-50, 50),
          alpha: 0.02,
          duration: 3000,
          yoyo: true,
          repeat: -1,
        });
      }

      // Dream text
      const dreamText = [
        '余杭镇，一个平凡的夜晚...',
        '',
        '少年李逍遥在梦中，',
        '遇到了一位神秘的剑仙...',
      ];

      for (let i = 0; i < dreamText.length; i++) {
        const text = this.add.text(width / 2, 200 + i * 40, dreamText[i], {
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif',
          color: '#FFFFFF',
        });
        text.setOrigin(0.5, 0.5);
        text.setAlpha(0);

        this.tweens.add({
          targets: text,
          alpha: 1,
          duration: 1000,
          delay: i * 800,
        });
      }

      // Character silhouette hint
      const silhouette = this.add.graphics();
      silhouette.fillStyle(0x000000, 0.3);
      silhouette.fillEllipse(width / 2, height / 2 + 50, 100, 200);

      this.cameras.main.fadeIn(1000);
    });
  }

  /**
   * Enable skip functionality
   */
  private enableSkip(): void {
    this.canSkip = true;

    // Show skip hint
    this.skipText = this.add.text(
      this.cameras.main.width - 20,
      this.cameras.main.height - 20,
      '按 ESC 或 点击屏幕 跳过',
      {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#888888',
      }
    );
    this.skipText.setOrigin(1, 1);

    // Blinking animation
    this.tweens.add({
      targets: this.skipText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Auto-proceed after showing skip hint
    this.time.delayedCall(5000, () => {
      this.startGame();
    });
  }

  /**
   * Setup skip controls
   */
  private setupSkipControls(): void {
    // Keyboard skip
    this.input.keyboard?.on('keydown-ESC', () => {
      this.skipIntro();
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.skipIntro();
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.skipIntro();
    });

    // Mouse/touch skip
    this.input.on('pointerdown', () => {
      this.skipIntro();
    });
  }

  /**
   * Skip intro
   */
  private skipIntro(): void {
    if (this.canSkip) {
      this.startGame();
    }
  }

  /**
   * Start the game
   */
  private startGame(): void {
    this.cameras.main.fade(1000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene');
    });
  }
}