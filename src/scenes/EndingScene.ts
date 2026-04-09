/**
 * Ending Scene - Multi-ending playback and display
 * US-041: 多结局系统
 */

import Phaser from 'phaser';
import {
  EndingSystem,
  EndingType,
  EndingResult,
  EndingConfig,
} from '@/systems/EndingSystem';
import { AffectionData } from '@/systems/SaveSystem';
import { InventoryEntry } from '@/data/Item';
import { storySystem } from '@/systems/StorySystem';

/**
 * Ending scene configuration
 */
export interface EndingSceneConfig {
  inventory: InventoryEntry[];
  affection: AffectionData;
  storyFlags: Record<string, boolean>;
}

/**
 * Ending Scene class
 * Displays ending cutscene based on game conditions
 */
export class EndingScene extends Phaser.Scene {
  private endingResult: EndingResult | null = null;
  private endingConfig: EndingConfig | null = null;
  private currentDialogIndex: number = 0;

  constructor() {
    super({ key: 'EndingScene' });
  }

  init(config: EndingSceneConfig): void {
    // Determine which ending to play
    this.endingResult = EndingSystem.determineEnding(
      config.inventory,
      config.affection,
      config.storyFlags
    );

    this.endingConfig = EndingSystem.getEndingConfig(this.endingResult.ending) || null;

    console.log(`Ending determined: ${this.endingResult.name} (${this.endingResult.title})`);
    console.log(`Condition met: ${this.endingResult.conditionMet}`);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    // Create the ending display
    this.createEndingTitle();
    this.playEndingSequence();
  }

  /**
   * Create ending title display
   */
  private createEndingTitle(): void {
    const width = this.cameras.main.width;

    // Title background
    this.add.rectangle(width / 2, 100, width, 150, 0x1a1a2e, 0.8);

    // Ending title
    const titleText = this.add.text(width / 2, 80, this.endingResult?.title || '结局', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#D4A84B',
      stroke: '#000000',
      strokeThickness: 4,
    });
    titleText.setOrigin(0.5, 0.5);

    // Subtitle with ending name
    const subtitleText = this.add.text(width / 2, 130, `—— ${this.endingResult?.name || ''} ——`, {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
    });
    subtitleText.setOrigin(0.5, 0.5);
  }

  /**
   * Play the ending sequence
   */
  private playEndingSequence(): void {
    // Play screen effects first if configured
    if (this.endingConfig?.screenEffects && this.endingConfig.screenEffects.length > 0) {
      this.playScreenEffects(0, () => {
        this.startDialogSequence();
      });
    } else {
      this.startDialogSequence();
    }
  }

  /**
   * Play screen effects sequentially
   */
  private playScreenEffects(index: number, onComplete: () => void): void {
    if (!this.endingConfig?.screenEffects || index >= this.endingConfig.screenEffects.length) {
      onComplete();
      return;
    }

    const effect = this.endingConfig.screenEffects[index];
    const duration = effect.duration || 1000;
    const color = effect.color || '#FFFFFF';

    switch (effect.type) {
      case 'fade':
        this.cameras.main.fade(duration, ...this.parseColor(color), true);
        this.time.delayedCall(duration, () => {
          this.cameras.main.fadeIn(duration, ...this.parseColor(color));
          this.time.delayedCall(duration, () => {
            this.playScreenEffects(index + 1, onComplete);
          });
        });
        break;

      case 'flash':
        const flashOverlay = this.add.rectangle(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          this.cameras.main.width,
          this.cameras.main.height,
          Phaser.Display.Color.HexStringToColor(color).color
        );
        flashOverlay.setAlpha(0);
        flashOverlay.setDepth(100);

        this.tweens.add({
          targets: flashOverlay,
          alpha: { from: 0, to: 1 },
          duration: duration / 2,
          yoyo: true,
          onComplete: () => {
            flashOverlay.destroy();
            this.playScreenEffects(index + 1, onComplete);
          },
        });
        break;

      case 'ink_spread':
        // Simulate ink spread effect with expanding circles
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const inkColor = Phaser.Display.Color.HexStringToColor('#E0E0E0').color;

        for (let i = 0; i < 5; i++) {
          const circle = this.add.circle(centerX, centerY, 10, inkColor);
          circle.setAlpha(0.3);
          circle.setDepth(100);

          this.tweens.add({
            targets: circle,
            radius: 500 + i * 100,
            alpha: 0,
            duration: duration,
            delay: i * 100,
            onComplete: () => {
              circle.destroy();
              if (i === 4) {
                this.playScreenEffects(index + 1, onComplete);
              }
            },
          });
        }
        break;

      default:
        this.playScreenEffects(index + 1, onComplete);
    }
  }

  /**
   * Parse color string to RGB values
   */
  private parseColor(color: string): [number, number, number] {
    const parsed = Phaser.Display.Color.HexStringToColor(color);
    return [parsed.red, parsed.green, parsed.blue];
  }

  /**
   * Start dialog sequence for ending
   */
  private startDialogSequence(): void {
    if (!this.endingResult || this.endingResult.dialogSequence.length === 0) {
      this.showEndingFinal();
      return;
    }

    this.currentDialogIndex = 0;
    this.playNextDialog();
  }

  /**
   * Play next dialog in sequence
   */
  private playNextDialog(): void {
    if (!this.endingResult || this.currentDialogIndex >= this.endingResult.dialogSequence.length) {
      this.showEndingFinal();
      return;
    }

    const dialogId = this.endingResult.dialogSequence[this.currentDialogIndex];

    // Launch DialogScene as overlay
    this.scene.launch('DialogScene', {
      dialogId,
      parentScene: 'EndingScene',
    });

    // Listen for dialog end
    this.scene.get('DialogScene').events.once('dialogend', () => {
      this.currentDialogIndex++;
      this.time.delayedCall(500, () => {
        this.playNextDialog();
      });
    });
  }

  /**
   * Show ending final image/scene
   */
  private showEndingFinal(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create final scene display
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Generate placeholder final image based on ending type
    this.createFinalImage();

    // Show ending message
    const finalMessage = this.add.text(width / 2, height - 100, '感谢游玩', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#D4A84B',
      stroke: '#000000',
      strokeThickness: 2,
    });
    finalMessage.setOrigin(0.5, 0.5);

    // Play credits if configured
    if (this.endingConfig?.credits) {
      this.time.delayedCall(3000, () => {
        this.playCredits();
      });
    } else {
      this.time.delayedCall(5000, () => {
        this.returnToMainMenu();
      });
    }
  }

  /**
   * Create placeholder final image based on ending type
   */
  private createFinalImage(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Different visual for each ending type
    let bgColor = 0x1a1a2e;
    let accentColor = 0xD4A84B;
    let finalText = '';

    switch (this.endingResult?.ending) {
      case EndingType.LINGER_DEFAULT:
        bgColor = 0x0D1A2D;
        accentColor = 0x4ECDC4;
        finalText = '灵儿的祝福永存';
        break;

      case EndingType.YUERU_REUNION:
        bgColor = 0x2D1A2D;
        accentColor = 0xFF66AA;
        finalText = '月如的重逢';
        break;

      case EndingType.ALL_SURVIVE:
        bgColor = 0x1A2D1A;
        accentColor = 0xFFD700;
        finalText = '团圆的喜悦';
        break;
    }

    // Background
    this.add.rectangle(width / 2, height / 2 - 50, width, height - 200, bgColor);

    // Decorative frame
    const frame = this.add.graphics();
    frame.lineStyle(3, accentColor, 1);
    frame.strokeRect(width / 2 - 200, height / 2 - 250, 400, 300);

    // Corner decorations
    const corners = [
      { x: width / 2 - 200, y: height / 2 - 250 },
      { x: width / 2 + 200, y: height / 2 - 250 },
      { x: width / 2 - 200, y: height / 2 + 50 },
      { x: width / 2 + 200, y: height / 2 + 50 },
    ];

    for (const corner of corners) {
      const cornerDeco = this.add.graphics();
      cornerDeco.fillStyle(accentColor, 1);
      cornerDeco.fillRect(corner.x - 5, corner.y - 5, 10, 10);
    }

    // Final text
    const textDisplay = this.add.text(width / 2, height / 2 - 100, finalText, {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      color: Phaser.Display.Color.IntegerToColor(accentColor).rgba,
      stroke: '#000000',
      strokeThickness: 3,
    });
    textDisplay.setOrigin(0.5, 0.5);

    // Add subtle floating animation
    this.tweens.add({
      targets: textDisplay,
      y: height / 2 - 95,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Play credits sequence
   */
  private playCredits(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fade to black
    this.cameras.main.fade(1000, 0, 0, 0);

    this.time.delayedCall(1000, () => {
      // Clear current content
      this.children.removeAll();

      // Credits background
      this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

      // Credits title
      const creditsTitle = this.add.text(width / 2, -100, '制作人员', {
        fontSize: '48px',
        fontFamily: 'Arial, sans-serif',
        color: '#D4A84B',
      });
      creditsTitle.setOrigin(0.5, 0.5);

      // Credits content
      const creditsContent = [
        '原作：仙剑奇侠传',
        '开发：Claude Code',
        '剧本改编：AI Assistant',
        '美术设计：AI Generated',
        '音乐音效：待添加',
        '',
        '感谢游玩',
        '',
        '仙剑奇侠传 现代重制版',
        '2026',
      ];

      const creditsTexts: Phaser.GameObjects.Text[] = [];
      for (let i = 0; i < creditsContent.length; i++) {
        const text = this.add.text(width / 2, height + i * 40, creditsContent[i], {
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif',
          color: i === 0 || i === creditsContent.length - 3 ? '#D4A84B' : '#FFFFFF',
        });
        text.setOrigin(0.5, 0.5);
        creditsTexts.push(text);
      }

      // Scroll credits
      this.tweens.add({
        targets: [creditsTitle, ...creditsTexts],
        y: '-=800',
        duration: 10000,
        ease: 'Linear',
        onComplete: () => {
          this.returnToMainMenu();
        },
      });

      // Fade in
      this.cameras.main.fadeIn(1000);
    });
  }

  /**
   * Return to main menu after ending
   */
  private returnToMainMenu(): void {
    // Set ending completed flag
    if (this.endingResult) {
      storySystem.setFlag(`ending_${this.endingResult.ending}`, true);
    }

    // Fade out
    this.cameras.main.fade(1000, 0, 0, 0);

    this.time.delayedCall(1000, () => {
      this.scene.stop('DialogScene');
      this.scene.start('MainMenuScene');
    });
  }
}