/**
 * Animation System - Character and battle animation management
 * US-045: 角色行走动画
 * US-046: 战斗特效动画
 * US-047: 场景转场效果
 */

import Phaser from 'phaser';

/**
 * Animation direction
 */
export enum Direction {
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  UP = 'up',
}

/**
 * Animation type
 */
export enum AnimationType {
  IDLE = 'idle',
  WALK = 'walk',
  RUN = 'run',
  ATTACK = 'attack',
  SKILL = 'skill',
  HURT = 'hurt',
  DIE = 'die',
}

/**
 * Character animation configuration
 */
export interface CharacterAnimationConfig {
  characterId: string;
  frameWidth: number;
  frameHeight: number;
  framesPerDirection: number;
  frameRate: number;
}

/**
 * Battle effect types
 */
export enum BattleEffectType {
  // Physical attacks
  SWORD_SLASH = 'sword_slash',
  SWORD_STAB = 'sword_stab',

  // Element skills
  FIRE_BALL = 'fire_ball',
  ICE_CRYSTAL = 'ice_crystal',
  LIGHTNING = 'lightning',
  WIND_BLADE = 'wind_blade',
  EARTH_SPIKE = 'earth_spike',

  // Combo skills
  SWORD_DANCE = 'sword_dance',
  IMMORTAL_DEMON = 'immortal_demon',
  FOUR_DIRECTIONS = 'four_directions',
  NUWA_POWER = 'nuwa_power',

  // Status effects
  POISON = 'poison',
  HEAL = 'heal',
  SHIELD = 'shield',
}

/**
 * Battle effect configuration
 */
export interface BattleEffectConfig {
  type: BattleEffectType;
  duration: number;        // Duration in ms
  targetX: number;
  targetY: number;
  sourceX?: number;
  sourceY?: number;
  intensity?: number;      // 0.0-1.0
  color?: string;
  scale?: number;
}

/**
 * Transition effect types
 */
export enum TransitionType {
  FADE_BLACK = 'fade_black',
  FADE_WHITE = 'fade_white',
  FLASH = 'flash',
  INK_SPREAD = 'ink_spread',
  SHAKE = 'shake',
}

/**
 * Transition configuration
 */
export interface TransitionConfig {
  type: TransitionType;
  duration: number;        // Duration in ms
  color?: string;
  intensity?: number;
}

/**
 * Animation System class
 * Manages character animations and battle effects
 */
export class AnimationSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ==================== Character Animations (US-045) ====================

  /**
   * Create character walk animations
   */
  createCharacterAnimations(config: CharacterAnimationConfig): void {
    const { characterId, framesPerDirection, frameRate } = config;

    // Animation frame indices: row 0=down, 1=left, 2=right, 3=up
    const directions = [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP];

    for (let row = 0; row < 4; row++) {
      const direction = directions[row];
      const startFrame = row * framesPerDirection;

      // Walk animation (frames 0-3 of each row)
      this.scene.anims.create({
        key: `${characterId}_walk_${direction}`,
        frames: this.scene.anims.generateFrameNumbers(characterId, {
          start: startFrame,
          end: startFrame + framesPerDirection - 1,
        }),
        frameRate,
        repeat: -1,
      });

      // Idle animation (first frame of each direction)
      this.scene.anims.create({
        key: `${characterId}_idle_${direction}`,
        frames: this.scene.anims.generateFrameNumbers(characterId, {
          start: startFrame,
          end: startFrame,
        }),
        frameRate: 1,
        repeat: 0,
      });

      // Run animation (same as walk but faster)
      this.scene.anims.create({
        key: `${characterId}_run_${direction}`,
        frames: this.scene.anims.generateFrameNumbers(characterId, {
          start: startFrame,
          end: startFrame + framesPerDirection - 1,
        }),
        frameRate: frameRate * 1.5,
        repeat: -1,
      });
    }
  }

  /**
   * Play character animation
   */
  playAnimation(
    sprite: Phaser.GameObjects.Sprite,
    characterId: string,
    type: AnimationType,
    direction: Direction
  ): void {
    const animKey = `${characterId}_${type}_${direction}`;
    if (this.scene.anims.exists(animKey)) {
      sprite.play(animKey);
    }
  }

  /**
   * Stop character animation
   */
  stopAnimation(sprite: Phaser.GameObjects.Sprite): void {
    sprite.stop();
  }

  /**
   * Get direction from velocity
   */
  getDirectionFromVelocity(vx: number, vy: number): Direction {
    if (Math.abs(vx) > Math.abs(vy)) {
      return vx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else if (vy !== 0) {
      return vy > 0 ? Direction.DOWN : Direction.UP;
    }
    return Direction.DOWN;
  }

  // ==================== Battle Effects (US-046) ====================

  /**
   * Create battle effect
   */
  createBattleEffect(config: BattleEffectConfig): Phaser.GameObjects.Container {
    const container = this.scene.add.container(config.targetX, config.targetY);

    switch (config.type) {
      case BattleEffectType.SWORD_SLASH:
        this.createSlashEffect(container, config);
        break;
      case BattleEffectType.FIRE_BALL:
        this.createFireEffect(container, config);
        break;
      case BattleEffectType.ICE_CRYSTAL:
        this.createIceEffect(container, config);
        break;
      case BattleEffectType.LIGHTNING:
        this.createLightningEffect(container, config);
        break;
      case BattleEffectType.NUWA_POWER:
        this.createUltimateEffect(container, config);
        break;
      case BattleEffectType.HEAL:
        this.createHealEffect(container, config);
        break;
      default:
        this.createDefaultEffect(container, config);
    }

    // Auto-destroy after duration
    this.scene.time.delayedCall(config.duration, () => {
      container.destroy();
    });

    return container;
  }

  /**
   * Create sword slash effect
   */
  private createSlashEffect(container: Phaser.GameObjects.Container, config: BattleEffectConfig): void {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(3, 0xFFFFFF, 1);
    graphics.beginPath();
    graphics.arc(0, 0, 50, -Math.PI / 4, Math.PI / 4, false);
    graphics.strokePath();
    container.add(graphics);

    // Slash animation
    this.scene.tweens.add({
      targets: graphics,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: config.duration,
      ease: 'Power2',
    });
  }

  /**
   * Create fire effect
   */
  private createFireEffect(container: Phaser.GameObjects.Container, config: BattleEffectConfig): void {
    const colors = [0xFF6600, 0xFF3300, 0xFFFF00];

    for (let i = 0; i < 10; i++) {
      const particle = this.scene.add.circle(
        Phaser.Math.Between(-30, 30),
        Phaser.Math.Between(-30, 30),
        Phaser.Math.Between(5, 15),
        colors[Math.floor(Math.random() * colors.length)]
      );
      particle.setAlpha(0.8);
      container.add(particle);

      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 50,
        alpha: 0,
        scale: 0.5,
        duration: config.duration / 2,
        delay: i * 50,
      });
    }
  }

  /**
   * Create ice effect
   */
  private createIceEffect(container: Phaser.GameObjects.Container, config: BattleEffectConfig): void {
    // Ice crystals
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const crystal = this.scene.add.polygon(
        Math.cos(angle) * 40,
        Math.sin(angle) * 40,
        [0, -20, 10, 0, 0, 20, -10, 0],
        0x88CCFF
      );
      crystal.setAlpha(0.7);
      container.add(crystal);

      this.scene.tweens.add({
        targets: crystal,
        scale: 1.5,
        alpha: 0,
        rotation: Math.PI,
        duration: config.duration,
      });
    }
  }

  /**
   * Create lightning effect
   */
  private createLightningEffect(container: Phaser.GameObjects.Container, config: BattleEffectConfig): void {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(4, 0xFFFF00, 1);

    // Draw lightning bolt
    const points: number[] = [0, -80];
    let x = 0;
    for (let y = -70; y < 80; y += 20) {
      x += Phaser.Math.Between(-20, 20);
      points.push(x, y);
    }
    graphics.beginPath();
    graphics.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      graphics.lineTo(points[i], points[i + 1]);
    }
    graphics.strokePath();
    container.add(graphics);

    // Flash effect
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: config.duration / 3,
      yoyo: true,
      repeat: 2,
    });
  }

  /**
   * Create ultimate effect (combo skill)
   */
  private createUltimateEffect(container: Phaser.GameObjects.Container, config: BattleEffectConfig): void {
    // Screen flash
    const flash = this.scene.add.rectangle(
      -config.targetX,
      -config.targetY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xFFD700,
      0.5
    );
    container.add(flash);

    // Energy rings
    for (let i = 0; i < 5; i++) {
      const ring = this.scene.add.circle(0, 0, 20 + i * 30, 0xFFD700, 0);
      ring.setStrokeStyle(3, 0xFFD700, 1 - i * 0.15);
      container.add(ring);

      this.scene.tweens.add({
        targets: ring,
        scale: 3,
        alpha: 0,
        duration: config.duration,
        delay: i * 100,
      });
    }

    // Flash fade
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: config.duration / 2,
    });
  }

  /**
   * Create heal effect
   */
  private createHealEffect(container: Phaser.GameObjects.Container, config: BattleEffectConfig): void {
    // Rising particles
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.text(
        Phaser.Math.Between(-20, 20),
        30,
        '+',
        { fontSize: '24px', color: '#88FF88' }
      );
      container.add(particle);

      this.scene.tweens.add({
        targets: particle,
        y: -50,
        alpha: 0,
        duration: config.duration,
        delay: i * 100,
      });
    }
  }

  /**
   * Create default effect
   */
  private createDefaultEffect(container: Phaser.GameObjects.Container, config: BattleEffectConfig): void {
    const circle = this.scene.add.circle(0, 0, 30, 0xFFFFFF, 0.5);
    container.add(circle);

    this.scene.tweens.add({
      targets: circle,
      scale: 2,
      alpha: 0,
      duration: config.duration,
    });
  }

  /**
   * Create hurt flash effect on sprite
   */
  createHurtFlash(sprite: Phaser.GameObjects.Sprite): void {
    const originalTint = sprite.tint;

    // Flash red
    this.scene.tweens.add({
      targets: sprite,
      tint: 0xFF0000,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        sprite.setTint(originalTint);
      },
    });
  }

  // ==================== Transition Effects (US-047) ====================

  /**
   * Create transition effect
   */
  createTransition(config: TransitionConfig): Promise<void> {
    return new Promise((resolve) => {
      switch (config.type) {
        case TransitionType.FADE_BLACK:
          this.createFadeTransition(config, 0x000000, resolve);
          break;
        case TransitionType.FADE_WHITE:
          this.createFadeTransition(config, 0xFFFFFF, resolve);
          break;
        case TransitionType.FLASH:
          this.createFlashTransition(config, resolve);
          break;
        case TransitionType.INK_SPREAD:
          this.createInkSpreadTransition(config, resolve);
          break;
        case TransitionType.SHAKE:
          this.createShakeTransition(config, resolve);
          break;
        default:
          resolve();
      }
    });
  }

  /**
   * Create fade transition
   */
  private createFadeTransition(
    config: TransitionConfig,
    color: number,
    resolve: () => void
  ): void {
    const camera = this.scene.cameras.main;

    camera.fadeOut(config.duration / 2, color);
    camera.once('camerafadeoutcomplete', () => {
      camera.fadeIn(config.duration / 2, color);
      camera.once('camerafadeincomplete', resolve);
    });
  }

  /**
   * Create flash transition
   */
  private createFlashTransition(config: TransitionConfig, resolve: () => void): void {
    const overlay = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      Phaser.Display.Color.HexStringToColor(config.color || '#FFFFFF').color,
      0
    );
    overlay.setScrollFactor(0);
    overlay.setDepth(1000);

    this.scene.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: config.duration / 2,
      yoyo: true,
      onComplete: () => {
        overlay.destroy();
        resolve();
      },
    });
  }

  /**
   * Create ink spread transition
   */
  private createInkSpreadTransition(config: TransitionConfig, resolve: () => void): void {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;
    const maxSize = Math.max(this.scene.cameras.main.width, this.scene.cameras.main.height) * 1.5;

    const circle = this.scene.add.circle(centerX, centerY, 0, 0x000000);
    circle.setScrollFactor(0);
    circle.setDepth(1000);

    this.scene.tweens.add({
      targets: circle,
      radius: maxSize,
      duration: config.duration,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.scene.tweens.add({
          targets: circle,
          alpha: 0,
          duration: config.duration / 2,
          onComplete: () => {
            circle.destroy();
            resolve();
          },
        });
      },
    });
  }

  /**
   * Create shake transition
   */
  private createShakeTransition(config: TransitionConfig, resolve: () => void): void {
    this.scene.cameras.main.shake(config.duration, config.intensity || 0.01);
    this.scene.time.delayedCall(config.duration, resolve);
  }
}