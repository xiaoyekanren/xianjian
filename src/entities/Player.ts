/**
 * Player entity - Main player character for world exploration
 * US-004: 地图探索场景实现
 */

import Phaser from 'phaser';
import { DEFAULT_TILE_SIZE } from '@/data/MapData';

/**
 * Player movement direction
 */
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * Player configuration
 */
export interface PlayerConfig {
  startX: number;
  startY: number;
  speed: number;
  spriteKey?: string;
}

/**
 * Default player configuration
 */
const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
  startX: 5,
  startY: 5,
  speed: 150,
};

/**
 * Player entity class
 * Manages player character movement, animation, and interaction
 */
export class Player {
  private scene: Phaser.Scene;
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private currentDirection: Direction = Direction.DOWN;
  private isMoving: boolean = false;
  private speed: number;
  private tileX: number;
  private tileY: number;

  constructor(scene: Phaser.Scene, config: Partial<PlayerConfig> = {}) {
    this.scene = scene;
    const finalConfig = { ...DEFAULT_PLAYER_CONFIG, ...config };
    this.speed = finalConfig.speed;
    this.tileX = finalConfig.startX;
    this.tileY = finalConfig.startY;

    this.createSprite(finalConfig);
    this.setupAnimations();
  }

  /**
   * Create the player sprite with physics
   */
  private createSprite(config: PlayerConfig): void {
    // Create sprite at tile position converted to pixel position
    const pixelX = config.startX * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;
    const pixelY = config.startY * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;

    // Create or use existing sprite texture
    const textureKey = config.spriteKey || 'player';

    // Check if texture exists, if not create placeholder
    if (!this.scene.textures.exists(textureKey)) {
      this.createPlaceholderTexture(textureKey);
    }

    this.sprite = this.scene.physics.add.sprite(pixelX, pixelY, textureKey);
    this.sprite.setCollideWorldBounds(true);

    // Set physics body size for tile-based movement
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(DEFAULT_TILE_SIZE - 4, DEFAULT_TILE_SIZE - 4);
    this.sprite.setDepth(10); // Player on top of map tiles
  }

  /**
   * Create placeholder texture for player
   */
  private createPlaceholderTexture(key: string): void {
    const graphics = this.scene.add.graphics();

    // Draw a simple character placeholder (blue colored)
    graphics.fillStyle(0x4488ff);
    graphics.fillRect(0, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

    // Add outline
    graphics.lineStyle(2, 0x2255aa);
    graphics.strokeRect(0, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

    // Generate texture
    graphics.generateTexture(key, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.destroy();
  }

  /**
   * Setup movement animations
   * Note: For placeholder, we'll just flip the sprite for direction
   */
  private setupAnimations(): void {
    // Placeholder animations - would use actual sprite frames later
    // For now, direction is handled by visual cues
  }

  /**
   * Move the player in a direction
   */
  move(direction: Direction): void {
    this.currentDirection = direction;
    this.isMoving = true;

    // Calculate velocity based on direction
    let velocityX = 0;
    let velocityY = 0;

    switch (direction) {
      case Direction.UP:
        velocityY = -this.speed;
        break;
      case Direction.DOWN:
        velocityY = this.speed;
        break;
      case Direction.LEFT:
        velocityX = -this.speed;
        break;
      case Direction.RIGHT:
        velocityX = this.speed;
        break;
    }

    this.sprite.setVelocity(velocityX, velocityY);

    // Update visual direction indicator
    this.updateDirectionVisual();
  }

  /**
   * Stop player movement
   */
  stop(): void {
    this.isMoving = false;
    this.sprite.setVelocity(0, 0);
  }

  /**
   * Update visual based on current direction
   */
  private updateDirectionVisual(): void {
    // Placeholder: scale sprite horizontally for left/right
    // Would use proper animation frames in production
    if (this.currentDirection === Direction.LEFT) {
      this.sprite.setScale(-1, 1);
    } else if (this.currentDirection === Direction.RIGHT) {
      this.sprite.setScale(1, 1);
    }
  }

  /**
   * Get current tile position
   */
  getTilePosition(): { x: number; y: number } {
    // Calculate tile position from sprite position
    this.tileX = Math.floor(this.sprite.x / DEFAULT_TILE_SIZE);
    this.tileY = Math.floor(this.sprite.y / DEFAULT_TILE_SIZE);
    return { x: this.tileX, y: this.tileY };
  }

  /**
   * Get pixel position
   */
  getPixelPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  /**
   * Set player position (teleport)
   */
  setPosition(tileX: number, tileY: number): void {
    this.tileX = tileX;
    this.tileY = tileY;
    const pixelX = tileX * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;
    const pixelY = tileY * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;
    this.sprite.setPosition(pixelX, pixelY);
  }

  /**
   * Get the sprite for collision setup
   */
  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  /**
   * Check if player is currently moving
   */
  isCurrentlyMoving(): boolean {
    return this.isMoving;
  }

  /**
   * Get current facing direction
   */
  getDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Check if player can interact (near an interactable)
   */
  canInteract(): boolean {
    return !this.isMoving;
  }

  /**
   * Update player state (called each frame)
   */
  update(): void {
    // Update tile position tracking
    this.getTilePosition();
  }

  /**
   * Enable/disable player input
   */
  setEnabled(enabled: boolean): void {
    if (!enabled) {
      this.stop();
    }
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.enable = enabled;
  }

  /**
   * Cleanup player
   */
  destroy(): void {
    this.sprite.destroy();
  }
}