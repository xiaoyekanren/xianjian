/**
 * Portrait Generator - Creates placeholder portraits for character dialogs
 * US-009: 李逍遥角色实现
 */

import Phaser from 'phaser';
import { Expression } from '@/data/DialogData';

/**
 * Portrait configuration
 */
export interface PortraitConfig {
  size: number;            // Portrait diameter
  backgroundColor: number; // Background circle color
  borderColor: number;     // Border circle color
}

/**
 * Portrait appearance configuration
 */
export interface PortraitAppearanceConfig {
  skinColor: number;       // Face skin color
  hairColor: number;       // Hair color
  eyeColor: number;        // Eye color
  outfitColor: number;     // Main outfit/clothing color
  accentColor?: number;    // Detail accent color
  hasSword?: boolean;      // Weapon indicator
  gender?: 'male' | 'female';
}

/**
 * Default portrait configuration
 */
export const DEFAULT_PORTRAIT_CONFIG: PortraitConfig = {
  size: 150,
  backgroundColor: 0x333344,
  borderColor: 0xD4A84B,  // Gold border
};

/**
 * Predefined portrait appearances for each character
 */
export const PORTRAIT_APPEARANCES: Record<string, PortraitAppearanceConfig> = {
  li_xiaoyao: {
    skinColor: 0xffd4a0,     // Warm skin tone
    hairColor: 0x333333,     // Black hair
    eyeColor: 0x4444aa,      // Blue eyes
    outfitColor: 0x4488ff,   // Blue outfit
    accentColor: 0xD4A84B,   // Gold accent
    hasSword: true,
    gender: 'male',
  },
  zhao_linger: {
    skinColor: 0xffe4b0,     // Light skin tone
    hairColor: 0x444444,     // Dark hair
    eyeColor: 0x88aaff,      // Light blue eyes (magical)
    outfitColor: 0x88ccff,   // Light blue outfit
    accentColor: 0xff88aa,   // Pink accent
    gender: 'female',
  },
  lin_yueru: {
    skinColor: 0xffd4a0,     // Warm skin tone
    hairColor: 0x555555,     // Dark hair
    eyeColor: 0xaa4444,      // Brown eyes
    outfitColor: 0xff8844,   // Orange outfit
    accentColor: 0xD4A84B,   // Gold accent
    hasSword: true,
    gender: 'female',
  },
  anu: {
    skinColor: 0xeed4a0,     // Warm skin tone (Miao)
    hairColor: 0x664422,     // Brown hair
    eyeColor: 0x44aa44,      // Green eyes
    outfitColor: 0x88ff88,   // Green outfit
    accentColor: 0xffaa44,   // Orange accent
    gender: 'female',
  },
};

/**
 * Portrait Generator class
 * Creates placeholder portrait textures with expression variations
 */
export class PortraitGenerator {
  /**
   * Generate all expression portraits for a character
   */
  static generatePortraitSet(
    scene: Phaser.Scene,
    characterId: string,
    appearance: PortraitAppearanceConfig,
    config: PortraitConfig = DEFAULT_PORTRAIT_CONFIG
  ): void {
    // Generate portrait for each expression
    const expressions = [
      Expression.NORMAL,
      Expression.HAPPY,
      Expression.SAD,
      Expression.ANGRY,
      Expression.SURPRISED,
      Expression.THINKING,
      Expression.SHY,
    ];

    for (const expression of expressions) {
      const key = `portrait_${characterId}_${expression}`;
      PortraitGenerator.generatePortrait(scene, key, appearance, expression, config);
    }

    // Also generate a default portrait key (for backward compatibility)
    PortraitGenerator.generatePortrait(
      scene,
      `portrait_${characterId}`,
      appearance,
      Expression.NORMAL,
      config
    );
  }

  /**
   * Generate a single portrait texture
   */
  static generatePortrait(
    scene: Phaser.Scene,
    key: string,
    appearance: PortraitAppearanceConfig,
    expression: Expression,
    config: PortraitConfig
  ): void {
    // Skip if texture already exists
    if (scene.textures.exists(key)) return;

    const graphics = scene.add.graphics();
    const size = config.size;
    const centerX = size / 2;
    const centerY = size / 2;

    // Draw background circle
    graphics.fillStyle(config.backgroundColor, 1);
    graphics.fillCircle(centerX, centerY, size / 2);

    // Draw border
    graphics.lineStyle(3, config.borderColor);
    graphics.strokeCircle(centerX, centerY, size / 2);

    // Draw portrait content
    PortraitGenerator.drawPortraitContent(
      graphics,
      centerX,
      centerY,
      size,
      appearance,
      expression
    );

    // Generate texture
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * Draw portrait content (face, hair, outfit, expression)
   */
  private static drawPortraitContent(
    graphics: Phaser.GameObjects.Graphics,
    centerX: number,
    centerY: number,
    size: number,
    appearance: PortraitAppearanceConfig,
    expression: Expression
  ): void {
    // Draw outfit (bottom half)
    PortraitGenerator.drawOutfit(graphics, centerX, centerY, size, appearance);

    // Draw face (center)
    PortraitGenerator.drawFace(graphics, centerX, centerY, size, appearance, expression);

    // Draw hair (top)
    PortraitGenerator.drawHair(graphics, centerX, centerY, size, appearance);

    // Draw accent details
    if (appearance.accentColor) {
      PortraitGenerator.drawAccents(graphics, centerX, centerY, size, appearance);
    }
  }

  /**
   * Draw outfit/clothing
   */
  private static drawOutfit(
    graphics: Phaser.GameObjects.Graphics,
    centerX: number,
    centerY: number,
    size: number,
    appearance: PortraitAppearanceConfig
  ): void {
    // Outfit occupies bottom 40% of portrait
    const outfitHeight = size * 0.4;
    const outfitWidth = size * 0.6;
    const outfitY = centerY + size * 0.1;

    // Main outfit body
    graphics.fillStyle(appearance.outfitColor);
    graphics.fillEllipse(centerX, outfitY, outfitWidth, outfitHeight);

    // Outfit outline
    graphics.lineStyle(2, appearance.outfitColor - 0x222222);
    graphics.strokeEllipse(centerX, outfitY, outfitWidth, outfitHeight);

    // Collar detail
    graphics.fillStyle(appearance.accentColor || 0xffffff);
    graphics.fillTriangle(
      centerX - size * 0.08,
      centerY - size * 0.15,
      centerX,
      centerY - size * 0.05,
      centerX + size * 0.08,
      centerY - size * 0.15
    );
  }

  /**
   * Draw face with expression
   */
  private static drawFace(
    graphics: Phaser.GameObjects.Graphics,
    centerX: number,
    centerY: number,
    size: number,
    appearance: PortraitAppearanceConfig,
    expression: Expression
  ): void {
    // Face circle (centered)
    const faceRadius = size * 0.25;
    graphics.fillStyle(appearance.skinColor);
    graphics.fillCircle(centerX, centerY - size * 0.08, faceRadius);

    // Face outline
    graphics.lineStyle(1, appearance.skinColor - 0x222222);
    graphics.strokeCircle(centerX, centerY - size * 0.08, faceRadius);

    // Draw expression-specific features
    PortraitGenerator.drawExpression(
      graphics,
      centerX,
      centerY - size * 0.08,
      size,
      appearance,
      expression
    );
  }

  /**
   * Draw facial expression features
   */
  private static drawExpression(
    graphics: Phaser.GameObjects.Graphics,
    centerX: number,
    centerY: number,
    size: number,
    appearance: PortraitAppearanceConfig,
    expression: Expression
  ): void {
    const eyeOffset = size * 0.06;
    const eyeY = centerY - size * 0.04;

    // Eye base shape (varies by gender)
    const eyeWidth = size * 0.04;
    const eyeHeight = appearance.gender === 'female' ? size * 0.05 : size * 0.03;

    graphics.fillStyle(appearance.eyeColor);

    switch (expression) {
      case Expression.HAPPY:
        // Happy eyes (slightly curved upward)
        graphics.fillEllipse(centerX - eyeOffset, eyeY, eyeWidth, eyeHeight);
        graphics.fillEllipse(centerX + eyeOffset, eyeY, eyeWidth, eyeHeight);
        // Smile
        graphics.lineStyle(2, appearance.skinColor - 0x333333);
        graphics.beginPath();
        graphics.arc(centerX, centerY + size * 0.04, size * 0.08, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        break;

      case Expression.SAD:
        // Sad eyes (slightly curved downward)
        graphics.fillEllipse(centerX - eyeOffset, eyeY + 2, eyeWidth, eyeHeight * 0.7);
        graphics.fillEllipse(centerX + eyeOffset, eyeY + 2, eyeWidth, eyeHeight * 0.7);
        // Sad mouth
        graphics.lineStyle(2, appearance.skinColor - 0x333333);
        graphics.beginPath();
        graphics.arc(centerX, centerY + size * 0.08, size * 0.06, Math.PI + 0.3, -0.3);
        graphics.strokePath();
        break;

      case Expression.ANGRY:
        // Angry eyes (narrowed)
        graphics.fillRect(centerX - eyeOffset - eyeWidth / 2, eyeY, eyeWidth, eyeHeight * 0.5);
        graphics.fillRect(centerX + eyeOffset - eyeWidth / 2, eyeY, eyeWidth, eyeHeight * 0.5);
        // Angry eyebrows
        graphics.lineStyle(2, appearance.hairColor);
        graphics.lineBetween(centerX - eyeOffset - eyeWidth, eyeY - size * 0.04, centerX - eyeOffset + eyeWidth, eyeY - size * 0.02);
        graphics.lineBetween(centerX + eyeOffset - eyeWidth, eyeY - size * 0.02, centerX + eyeOffset + eyeWidth, eyeY - size * 0.04);
        // Angry mouth
        graphics.lineStyle(2, appearance.skinColor - 0x333333);
        graphics.lineBetween(centerX - size * 0.06, centerY + size * 0.06, centerX + size * 0.06, centerY + size * 0.04);
        break;

      case Expression.SURPRISED:
        // Wide eyes (circles)
        graphics.fillStyle(appearance.eyeColor);
        graphics.fillCircle(centerX - eyeOffset, eyeY, eyeWidth * 1.3);
        graphics.fillCircle(centerX + eyeOffset, eyeY, eyeWidth * 1.3);
        // Open mouth
        graphics.fillStyle(appearance.skinColor - 0x333333);
        graphics.fillEllipse(centerX, centerY + size * 0.06, size * 0.06, size * 0.04);
        break;

      case Expression.THINKING:
        // Normal eyes, looking slightly upward
        graphics.fillEllipse(centerX - eyeOffset, eyeY - 2, eyeWidth, eyeHeight);
        graphics.fillEllipse(centerX + eyeOffset, eyeY - 2, eyeWidth, eyeHeight);
        // Thinking mouth (slight curve)
        graphics.lineStyle(2, appearance.skinColor - 0x333333);
        graphics.lineBetween(centerX - size * 0.04, centerY + size * 0.05, centerX + size * 0.04, centerY + size * 0.05);
        break;

      case Expression.SHY:
        // Eyes looking down/away
        graphics.fillStyle(appearance.eyeColor);
        graphics.fillEllipse(centerX - eyeOffset - 2, eyeY + 2, eyeWidth, eyeHeight);
        graphics.fillEllipse(centerX + eyeOffset + 2, eyeY + 2, eyeWidth, eyeHeight);
        // Blush marks
        graphics.fillStyle(0xff8888, 0.3);
        graphics.fillEllipse(centerX - size * 0.12, centerY + size * 0.02, size * 0.04, size * 0.02);
        graphics.fillEllipse(centerX + size * 0.12, centerY + size * 0.02, size * 0.04, size * 0.02);
        // Small smile
        graphics.lineStyle(2, appearance.skinColor - 0x333333);
        graphics.beginPath();
        graphics.arc(centerX, centerY + size * 0.05, size * 0.05, 0.3, Math.PI - 0.3);
        graphics.strokePath();
        break;

      default:  // NORMAL
        // Normal eyes
        graphics.fillEllipse(centerX - eyeOffset, eyeY, eyeWidth, eyeHeight);
        graphics.fillEllipse(centerX + eyeOffset, eyeY, eyeWidth, eyeHeight);
        // Neutral mouth
        graphics.lineStyle(2, appearance.skinColor - 0x333333);
        graphics.lineBetween(centerX - size * 0.05, centerY + size * 0.05, centerX + size * 0.05, centerY + size * 0.05);
        break;
    }
  }

  /**
   * Draw hair
   */
  private static drawHair(
    graphics: Phaser.GameObjects.Graphics,
    centerX: number,
    centerY: number,
    size: number,
    appearance: PortraitAppearanceConfig
  ): void {
    const hairY = centerY - size * 0.2;
    const hairWidth = size * 0.35;
    const hairHeight = size * 0.2;

    graphics.fillStyle(appearance.hairColor);

    // Hair shape based on gender
    if (appearance.gender === 'female') {
      // Longer hair
      graphics.fillEllipse(centerX, hairY, hairWidth, hairHeight * 1.5);
      // Hair sides
      graphics.fillRect(centerX - hairWidth / 2, hairY - hairHeight / 4, size * 0.08, size * 0.35);
      graphics.fillRect(centerX + hairWidth / 2 - size * 0.08, hairY - hairHeight / 4, size * 0.08, size * 0.35);
    } else {
      // Shorter hair (male)
      graphics.fillEllipse(centerX, hairY, hairWidth, hairHeight);
      // Hair outline
      graphics.lineStyle(1, appearance.hairColor - 0x222222);
      graphics.strokeEllipse(centerX, hairY, hairWidth, hairHeight);
    }
  }

  /**
   * Draw accent details (accessories, etc.)
   */
  private static drawAccents(
    graphics: Phaser.GameObjects.Graphics,
    centerX: number,
    centerY: number,
    size: number,
    appearance: PortraitAppearanceConfig
  ): void {
    if (appearance.hasSword) {
      // Sword indicator (small sword icon on outfit)
      graphics.fillStyle(0xcccccc);
      graphics.fillRect(centerX + size * 0.15, centerY + size * 0.05, size * 0.03, size * 0.15);
      graphics.fillStyle(appearance.accentColor || 0xD4A84B);
      graphics.fillRect(centerX + size * 0.14, centerY + size * 0.18, size * 0.05, size * 0.03);
    }

    // Accent color trim on outfit
    if (appearance.accentColor) {
      graphics.fillStyle(appearance.accentColor);
      graphics.fillRect(centerX - size * 0.12, centerY + size * 0.1, size * 0.24, size * 0.04);
    }
  }
}