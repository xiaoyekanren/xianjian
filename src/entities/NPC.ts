/**
 * NPC entity - Non-player characters for world interaction
 * US-004: 地图探索场景实现
 */

import Phaser from 'phaser';
import { DEFAULT_TILE_SIZE, NPCSpawnData } from '@/data/MapData';

/**
 * NPC state
 */
export enum NPCState {
  IDLE = 'idle',
  WALKING = 'walking',
  INTERACTING = 'interacting',
}

/**
 * NPC configuration
 */
export interface NPCConfig extends NPCSpawnData {
  wanderRange?: number;      // How far NPC can wander from spawn point
  interactable?: boolean;    // Can player interact with this NPC
  stationary?: boolean;      // NPC doesn't move
}

/**
 * Default NPC configuration
 */
const DEFAULT_NPC_CONFIG: Partial<NPCConfig> = {
  wanderRange: 0,
  interactable: true,
  stationary: true,
};

/**
 * NPC interaction event
 */
export interface NPCInteractionEvent {
  npc: NPC;
  dialogId: string;
}

/**
 * NPC entity class
 * Manages NPC behavior, interaction, and display
 */
export class NPC {
  private scene: Phaser.Scene;
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private config: NPCConfig;
  private state: NPCState = NPCState.IDLE;
  private interactionZone: Phaser.GameObjects.Zone | null = null;
  private nameText: Phaser.GameObjects.Text | null = null;
  private interactionIndicator: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, config: NPCConfig) {
    this.scene = scene;
    this.config = { ...DEFAULT_NPC_CONFIG, ...config };

    this.createSprite();
    this.setupInteraction();
    this.setupNameDisplay();
  }

  /**
   * Create NPC sprite
   */
  private createSprite(): void {
    const pixelX = this.config.x * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;
    const pixelY = this.config.y * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;

    const textureKey = this.config.spriteKey || `npc_${this.config.npcId}`;

    // Create placeholder texture if not exists
    if (!this.scene.textures.exists(textureKey)) {
      this.createPlaceholderTexture(textureKey);
    }

    this.sprite = this.scene.physics.add.sprite(pixelX, pixelY, textureKey);
    this.sprite.setImmovable(true);
    this.sprite.setDepth(10);

    // Setup physics body
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(DEFAULT_TILE_SIZE - 4, DEFAULT_TILE_SIZE - 4);
  }

  /**
   * Create placeholder texture for NPC
   */
  private createPlaceholderTexture(key: string): void {
    const graphics = this.scene.add.graphics();

    // Draw a simple NPC placeholder (green/teal colored)
    graphics.fillStyle(0x44aa88);
    graphics.fillRect(0, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

    // Add outline
    graphics.lineStyle(2, 0x226644);
    graphics.strokeRect(0, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

    // Generate texture
    graphics.generateTexture(key, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.destroy();
  }

  /**
   * Setup interaction zone around NPC
   */
  private setupInteraction(): void {
    if (!this.config.interactable) return;

    // Create interaction zone (larger than sprite for easier interaction)
    const zoneSize = DEFAULT_TILE_SIZE * 1.5;
    const pixelX = this.config.x * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;
    const pixelY = this.config.y * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;

    this.interactionZone = this.scene.add.zone(pixelX, pixelY, zoneSize, zoneSize);
    this.scene.physics.world.enable(this.interactionZone);
    const zoneBody = this.interactionZone.body as Phaser.Physics.Arcade.Body;
    zoneBody.moves = false;

    // Create interaction indicator (small icon above NPC)
    this.createInteractionIndicator();
  }

  /**
   * Create interaction indicator
   */
  private createInteractionIndicator(): void {
    this.interactionIndicator = this.scene.add.graphics();
    const pixelX = this.config.x * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;
    const pixelY = this.config.y * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;

    // Draw a small "!" indicator above NPC
    this.interactionIndicator.fillStyle(0xD4A84B, 1); // Gold color
    this.interactionIndicator.fillCircle(pixelX, pixelY - DEFAULT_TILE_SIZE, 5);

    this.interactionIndicator.setDepth(15);
  }

  /**
   * Setup name display above NPC
   */
  private setupNameDisplay(): void {
    const pixelX = this.config.x * DEFAULT_TILE_SIZE + DEFAULT_TILE_SIZE / 2;
    const pixelY = this.config.y * DEFAULT_TILE_SIZE - DEFAULT_TILE_SIZE / 2;

    this.nameText = this.scene.add.text(pixelX, pixelY, this.config.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#FFFFFF',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 },
    });
    this.nameText.setOrigin(0.5, 0.5);
    this.nameText.setDepth(15);
  }

  /**
   * Check if player is near for interaction
   */
  canInteractWith(playerX: number, playerY: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      playerX, playerY
    );
    return distance < DEFAULT_TILE_SIZE * 1.5;
  }

  /**
   * Start interaction with NPC
   */
  startInteraction(): NPCInteractionEvent {
    this.state = NPCState.INTERACTING;
    this.hideInteractionIndicator();

    return {
      npc: this,
      dialogId: this.config.dialogId,
    };
  }

  /**
   * End interaction
   */
  endInteraction(): void {
    this.state = NPCState.IDLE;
    this.showInteractionIndicator();
  }

  /**
   * Show interaction indicator
   */
  private showInteractionIndicator(): void {
    if (this.interactionIndicator) {
      this.interactionIndicator.setVisible(true);
    }
  }

  /**
   * Hide interaction indicator
   */
  private hideInteractionIndicator(): void {
    if (this.interactionIndicator) {
      this.interactionIndicator.setVisible(false);
    }
  }

  /**
   * Get sprite for collision
   */
  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  /**
   * Get interaction zone
   */
  getInteractionZone(): Phaser.GameObjects.Zone | null {
    return this.interactionZone;
  }

  /**
   * Get NPC ID
   */
  getId(): string {
    return this.config.npcId;
  }

  /**
   * Get NPC ID (alias for getId)
   */
  getNPCId(): string {
    return this.config.npcId;
  }

  /**
   * Get NPC name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get dialog ID
   */
  getDialogId(): string {
    return this.config.dialogId;
  }

  /**
   * Get current state
   */
  getState(): NPCState {
    return this.state;
  }

  /**
   * Get tile position
   */
  getTilePosition(): { x: number; y: number } {
    return { x: this.config.x, y: this.config.y };
  }

  /**
   * Update NPC state (called each frame)
   */
  update(): void {
    // Placeholder for NPC behavior
    // Could implement wandering AI here
  }

  /**
   * Cleanup NPC
   */
  destroy(): void {
    this.sprite.destroy();
    if (this.interactionZone) {
      this.interactionZone.destroy();
    }
    if (this.nameText) {
      this.nameText.destroy();
    }
    if (this.interactionIndicator) {
      this.interactionIndicator.destroy();
    }
  }
}