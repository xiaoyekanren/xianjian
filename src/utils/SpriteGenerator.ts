/**
 * Sprite Generator - Creates placeholder sprite sheets for character animations
 * US-009: 李逍遥角色实现
 */

import Phaser from 'phaser';

/**
 * Sprite frame configuration
 */
export interface SpriteFrameConfig {
  frameWidth: number;
  frameHeight: number;
  directions: number;  // Number of directions (4: up, down, left, right)
  framesPerDirection: number;  // Frames per direction for walk cycle
}

/**
 * Character appearance configuration for placeholder generation
 */
export interface CharacterAppearanceConfig {
  bodyColor: number;      // Main body color
  outlineColor: number;   // Outline/border color
  hairColor?: number;     // Hair color (optional)
  detailColor?: number;   // Detail/accent color (optional)
  hasSword?: boolean;     // For characters who carry weapons
  style?: 'male' | 'female' | 'child';  // Character style
}

/**
 * Default sprite frame configuration
 */
export const DEFAULT_SPRITE_CONFIG: SpriteFrameConfig = {
  frameWidth: 32,
  frameHeight: 32,
  directions: 4,
  framesPerDirection: 4,
};

/**
 * Predefined character appearances
 */
export const CHARACTER_APPEARANCES: Record<string, CharacterAppearanceConfig> = {
  li_xiaoyao: {
    bodyColor: 0x4488ff,      // Blue - protagonist
    outlineColor: 0x2255aa,
    hairColor: 0x333333,       // Dark hair
    detailColor: 0xD4A84B,     // Gold accent (sword hilt)
    hasSword: true,
    style: 'male',
  },
  zhao_linger: {
    bodyColor: 0x88ccff,      // Light blue - magical
    outlineColor: 0x5588cc,
    hairColor: 0x444444,       // Dark hair
    detailColor: 0xff88aa,     // Pink accent
    style: 'female',
  },
  lin_yueru: {
    bodyColor: 0xff8844,      // Orange - warrior
    outlineColor: 0xcc5522,
    hairColor: 0x555555,       // Dark hair
    detailColor: 0xD4A84B,     // Gold accent (sword)
    hasSword: true,
    style: 'female',
  },
  anu: {
    bodyColor: 0x88ff88,      // Green - Miao tribe
    outlineColor: 0x55aa55,
    hairColor: 0x664422,       // Brown hair
    detailColor: 0xffaa44,     // Orange accent
    style: 'female',
  },
  npc_villager: {
    bodyColor: 0x88cc66,      // Light green - common
    outlineColor: 0x55aa44,
    style: 'male',
  },
  npc_elder: {
    bodyColor: 0x888888,      // Gray - elder
    outlineColor: 0x555555,
    hairColor: 0xaaaaaa,       // Gray hair
    style: 'male',
  },
};

/**
 * Sprite Generator class
 * Creates placeholder sprite sheets for character animations
 */
export class SpriteGenerator {
  /**
   * Generate a complete sprite sheet for a character
   * Returns a canvas texture that can be used by Phaser
   */
  static generateSpriteSheet(
    scene: Phaser.Scene,
    key: string,
    appearance: CharacterAppearanceConfig,
    config: SpriteFrameConfig = DEFAULT_SPRITE_CONFIG
  ): void {
    const canvasWidth = config.frameWidth * config.framesPerDirection;
    const canvasHeight = config.frameHeight * config.directions;

    // Create canvas texture
    const graphics = scene.add.graphics();

    // Generate frames for each direction
    // Direction order: down (0), left (1), right (2), up (3)
    for (let dir = 0; dir < config.directions; dir++) {
      for (let frame = 0; frame < config.framesPerDirection; frame++) {
        const x = frame * config.frameWidth;
        const y = dir * config.frameHeight;

        SpriteGenerator.drawCharacterFrame(
          graphics,
          x,
          y,
          config.frameWidth,
          config.frameHeight,
          appearance,
          dir,
          frame
        );
      }
    }

    // Generate texture from graphics
    graphics.generateTexture(key, canvasWidth, canvasHeight);
    graphics.destroy();

    // Create animation frames
    SpriteGenerator.createAnimations(scene, key, config);
  }

  /**
   * Draw a single character frame
   */
  private static drawCharacterFrame(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    appearance: CharacterAppearanceConfig,
    direction: number,
    frame: number
  ): void {
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Walk cycle offset (0, 1, 2, 3 - alternating leg positions)
    const walkOffset = frame % 2 === 0 ? 0 : (frame === 1 ? 2 : -2);

    // Draw body based on style
    SpriteGenerator.drawBody(graphics, centerX, centerY, width, height, appearance, direction, walkOffset);

    // Draw hair
    if (appearance.hairColor) {
      SpriteGenerator.drawHair(graphics, centerX, centerY, width, height, appearance, direction);
    }

    // Draw details
    if (appearance.detailColor) {
      SpriteGenerator.drawDetails(graphics, centerX, centerY, width, height, appearance, direction);
    }

    // Draw weapon if applicable
    if (appearance.hasSword) {
      SpriteGenerator.drawSword(graphics, centerX, centerY, width, height, direction, walkOffset);
    }
  }

  /**
   * Draw character body
   */
  private static drawBody(
    graphics: Phaser.GameObjects.Graphics,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    appearance: CharacterAppearanceConfig,
    _direction: number,
    walkOffset: number
  ): void {
    const bodyWidth = width * 0.6;
    const bodyHeight = height * 0.7;

    // Draw outline
    graphics.lineStyle(2, appearance.outlineColor);

    // Body shape based on style
    if (appearance.style === 'female') {
      // More slender body
      graphics.fillStyle(appearance.bodyColor);
      graphics.fillEllipse(centerX, centerY + 2, bodyWidth * 0.8, bodyHeight);
      graphics.strokeEllipse(centerX, centerY + 2, bodyWidth * 0.8, bodyHeight);
    } else {
      // Male/default body
      graphics.fillStyle(appearance.bodyColor);
      graphics.fillRoundedRect(
        centerX - bodyWidth / 2,
        centerY - bodyHeight / 2,
        bodyWidth,
        bodyHeight,
        4
      );
      graphics.strokeRoundedRect(
        centerX - bodyWidth / 2,
        centerY - bodyHeight / 2,
        bodyWidth,
        bodyHeight,
        4
      );
    }

    // Draw legs with walk animation
    const legWidth = width * 0.15;
    const legHeight = height * 0.25;
    graphics.fillStyle(appearance.outlineColor);

    // Left leg
    graphics.fillRect(
      centerX - bodyWidth / 3 + walkOffset,
      centerY + bodyHeight / 2 - 2,
      legWidth,
      legHeight
    );

    // Right leg
    graphics.fillRect(
      centerX + bodyWidth / 3 - walkOffset,
      centerY + bodyHeight / 2 - 2,
      legWidth,
      legHeight
    );
  }

  /**
   * Draw hair
   */
  private static drawHair(
    graphics: Phaser.GameObjects.Graphics,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    appearance: CharacterAppearanceConfig,
    _direction: number
  ): void {
    const hairWidth = width * 0.5;
    const hairHeight = height * 0.25;
    const hairY = centerY - height * 0.35;

    graphics.fillStyle(appearance.hairColor!);

    // Hair style - same for all directions in placeholder
    graphics.fillEllipse(centerX, hairY, hairWidth * 1.1, hairHeight * 1.1);
  }

  /**
   * Draw character details (face, accessories)
   */
  private static drawDetails(
    graphics: Phaser.GameObjects.Graphics,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    appearance: CharacterAppearanceConfig,
    direction: number
  ): void {
    // Draw face details (eyes) for front/back views
    if (direction === 0) {  // Front view (down)
      graphics.fillStyle(0xffffff);
      // Eyes
      graphics.fillCircle(centerX - 3, centerY - height * 0.15, 2);
      graphics.fillCircle(centerX + 3, centerY - height * 0.15, 2);
    }

    // Draw accent color on clothing
    graphics.fillStyle(appearance.detailColor!);
    const accentY = centerY + height * 0.1;
    graphics.fillRect(centerX - width * 0.1, accentY, width * 0.2, height * 0.08);
  }

  /**
   * Draw sword for weapon-bearing characters
   */
  private static drawSword(
    graphics: Phaser.GameObjects.Graphics,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    direction: number,
    walkOffset: number
  ): void {
    const swordLength = height * 0.5;
    const swordWidth = width * 0.08;

    // Sword position varies by direction
    let swordX = centerX + width * 0.35;
    let swordY = centerY + walkOffset;

    if (direction === 1) {  // Left
      swordX = centerX - width * 0.35;
    } else if (direction === 3) {  // Up (back view)
      swordX = centerX + width * 0.3;
      swordY = centerY - height * 0.1;
    }

    // Sword blade (silver)
    graphics.fillStyle(0xcccccc);
    graphics.fillRect(swordX, swordY, swordWidth, swordLength);

    // Sword hilt (gold)
    graphics.fillStyle(0xD4A84B);
    graphics.fillRect(swordX - 2, swordY + swordLength - 4, swordWidth + 4, 6);
  }

  /**
   * Create Phaser animations from sprite sheet
   */
  private static createAnimations(
    scene: Phaser.Scene,
    key: string,
    config: SpriteFrameConfig
  ): void {
    // Animation frame rates
    const frameRate = 8;

    // Direction: down (row 0), left (row 1), right (row 2), up (row 3)
    const directions = ['down', 'left', 'right', 'up'];

    for (let dir = 0; dir < config.directions; dir++) {
      const animKey = `${key}_walk_${directions[dir]}`;

      // Generate frame indices for this direction
      const frames: number[] = [];
      for (let f = 0; f < config.framesPerDirection; f++) {
        frames.push(dir * config.framesPerDirection + f);
      }

      // Create animation
      if (!scene.anims.exists(animKey)) {
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(key, { frames }),
          frameRate,
          repeat: -1,
        });
      }
    }

    // Create idle animations (single frame per direction)
    for (let dir = 0; dir < config.directions; dir++) {
      const idleKey = `${key}_idle_${directions[dir]}`;
      if (!scene.anims.exists(idleKey)) {
        scene.anims.create({
          key: idleKey,
          frames: [{ key, frame: dir * config.framesPerDirection }],
          frameRate: 1,
          repeat: -1,
        });
      }
    }
  }
}