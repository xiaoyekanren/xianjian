/**
 * World Scene - Tile-based map exploration
 * US-004: 地图探索场景实现
 */

import Phaser from 'phaser';
import { Player, Direction } from '@/entities/Player';
import { NPC } from '@/entities/NPC';
import {
  MapData,
  TileType,
  DEFAULT_TILE_SIZE,
  MapTransitionData,
} from '@/data/MapData';

/**
 * World scene configuration passed from scene transition
 */
export interface WorldSceneConfig {
  mapId?: string;
  playerStartX?: number;
  playerStartY?: number;
}

/**
 * Simple demo map data for testing
 */
const DEMO_MAP: MapData = {
  id: 'demo_town',
  name: '测试城镇',
  width: 20,
  height: 15,
  tileWidth: DEFAULT_TILE_SIZE,
  tileHeight: DEFAULT_TILE_SIZE,
  layers: [
    {
      name: 'ground',
      tiles: [
        // Row 0-2: walls
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // Row 3-12: walkable ground with some obstacles
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        // Row 13-14: walls
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
    },
  ],
  npcs: [
    {
      npcId: 'npc_villager_1',
      name: '村民',
      dialogId: 'dialog_villager_1',
      x: 6,
      y: 8,
    },
    {
      npcId: 'npc_villager_2',
      name: '老者',
      dialogId: 'dialog_elder_1',
      x: 11,
      y: 8,
    },
  ],
  transitions: [
    {
      targetMapId: 'demo_house',
      targetX: 5,
      targetY: 8,
    },
  ],
};

/**
 * World Scene class
 * Handles tile-based map rendering, player movement, collisions, and interactions
 */
export class WorldScene extends Phaser.Scene {
  private player: Player | null = null;
  private npcs: NPC[] = [];
  private currentMap: MapData;
  private tilemap: Phaser.Tilemaps.Tilemap | null = null;
  private collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private isTransitioning: boolean = false;
  private playerStartX: number;
  private playerStartY: number;
  private transitionPoints: { x: number; y: number; data: MapTransitionData }[] = [];

  constructor() {
    super({ key: 'WorldScene' });
    this.currentMap = DEMO_MAP;
    this.playerStartX = 5;
    this.playerStartY = 5;
  }

  init(data: WorldSceneConfig): void {
    // Use default map for now (demo_town)
    this.playerStartX = data.playerStartX || 5;
    this.playerStartY = data.playerStartY || 5;
    this.isTransitioning = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#2d2d44');

    // Create tilemap and render map
    this.createTilemap();

    // Create player
    this.createPlayer();

    // Create NPCs
    this.createNPCs();

    // Setup collision detection
    this.setupCollisions();

    // Setup input
    this.setupInput();

    // Setup map transition detection
    this.setupMapTransitions();

    // Fade in transition
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  /**
   * Create tilemap from map data
   */
  private createTilemap(): void {
    // Create a tilemap data structure
    this.tilemap = this.make.tilemap({
      data: this.currentMap.layers[0].tiles,
      tileWidth: this.currentMap.tileWidth,
      tileHeight: this.currentMap.tileHeight,
    });

    // Create tileset texture dynamically
    this.createTilesetTexture();

    // Add the tileset to the tilemap
    const tileset = this.tilemap.addTilesetImage('tiles', 'tiles');

    if (tileset) {
      // Create the layer
      this.collisionLayer = this.tilemap.createLayer(0, tileset, 0, 0);

      if (this.collisionLayer) {
        this.collisionLayer.setDepth(0);

        // Set collision for wall tiles (tile index 1)
        this.collisionLayer.setCollisionByProperty({ collides: true });
        this.collisionLayer.setCollision([1, 2]); // Walls and water
      }
    }

    // Set world bounds based on map size
    this.physics.world.setBounds(
      0, 0,
      this.currentMap.width * DEFAULT_TILE_SIZE,
      this.currentMap.height * DEFAULT_TILE_SIZE
    );
  }

  /**
   * Create tileset texture dynamically
   */
  private createTilesetTexture(): void {
    const graphics = this.add.graphics();

    // Tile 0: Ground (walkable) - light brown/tan
    graphics.fillStyle(0x887766);
    graphics.fillRect(0, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.fillStyle(0x998877);
    graphics.fillRect(2, 2, DEFAULT_TILE_SIZE - 4, DEFAULT_TILE_SIZE - 4);

    // Tile 1: Wall (impassable) - dark gray
    graphics.fillStyle(0x444444);
    graphics.fillRect(DEFAULT_TILE_SIZE, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.fillStyle(0x555555);
    graphics.fillRect(DEFAULT_TILE_SIZE + 2, 2, DEFAULT_TILE_SIZE - 4, DEFAULT_TILE_SIZE - 4);

    // Tile 2: Water (impassable) - blue
    graphics.fillStyle(0x4488cc);
    graphics.fillRect(DEFAULT_TILE_SIZE * 2, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

    // Tile 3: Door - brown with frame
    graphics.fillStyle(0x664422);
    graphics.fillRect(DEFAULT_TILE_SIZE * 3, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.lineStyle(2, 0x886644);
    graphics.strokeRect(DEFAULT_TILE_SIZE * 3 + 4, 4, DEFAULT_TILE_SIZE - 8, DEFAULT_TILE_SIZE - 4);

    // Tile 4: Path - lighter ground
    graphics.fillStyle(0xaa9988);
    graphics.fillRect(DEFAULT_TILE_SIZE * 4, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

    // Tile 5: Transition point - special marker
    graphics.fillStyle(0x887766);
    graphics.fillRect(DEFAULT_TILE_SIZE * 5, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.fillStyle(0xD4A84B, 0.5); // Semi-transparent gold
    graphics.fillRect(DEFAULT_TILE_SIZE * 5 + 4, 4, DEFAULT_TILE_SIZE - 8, DEFAULT_TILE_SIZE - 8);

    // Tile 6: NPC spawn - special marker (invisible, just for data)
    graphics.fillStyle(0x887766);
    graphics.fillRect(DEFAULT_TILE_SIZE * 6, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

    // Generate texture with all tiles
    graphics.generateTexture('tiles', DEFAULT_TILE_SIZE * 7, DEFAULT_TILE_SIZE);
    graphics.destroy();
  }

  /**
   * Create player entity
   */
  private createPlayer(): void {
    this.player = new Player(this, {
      startX: this.playerStartX,
      startY: this.playerStartY,
    });
  }

  /**
   * Create NPCs from map data
   */
  private createNPCs(): void {
    for (const npcSpawn of this.currentMap.npcs) {
      const npc = new NPC(this, npcSpawn);
      this.npcs.push(npc);
    }
  }

  /**
   * Setup collision detection
   */
  private setupCollisions(): void {
    if (!this.player || !this.collisionLayer) return;

    // Player collides with collision layer (walls, water, etc.)
    this.physics.add.collider(this.player.getSprite(), this.collisionLayer);

    // Player collides with NPCs
    for (const npc of this.npcs) {
      this.physics.add.collider(this.player.getSprite(), npc.getSprite());
    }
  }

  /**
   * Setup input handling
   */
  private setupInput(): void {
    // Setup cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Setup WASD keys
    this.wasdKeys = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Setup interaction key (Enter/Space/C)
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);

    // Setup interaction key listeners
    this.interactKey.on('down', () => {
      this.handleInteraction();
    });
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.handleInteraction();
    });
    this.input.keyboard!.on('keydown-C', () => {
      this.handleInteraction();
    });
  }

  /**
   * Setup map transition detection
   */
  private setupMapTransitions(): void {
    // Check for transition tiles in map
    const tiles = this.currentMap.layers[0].tiles;
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        if (tiles[y][x] === TileType.TRANSITION) {
          this.transitionPoints.push({
            x,
            y,
            data: this.currentMap.transitions[0], // Use first transition config
          });
        }
      }
    }
  }

  /**
   * Handle NPC interaction
   */
  private handleInteraction(): void {
    if (!this.player || this.isTransitioning) return;

    const playerPos = this.player.getPixelPosition();
    const playerDir = this.player.getDirection();

    // Calculate interaction point based on player direction
    const interactX = playerPos.x + (playerDir === Direction.RIGHT ? DEFAULT_TILE_SIZE :
                                     playerDir === Direction.LEFT ? -DEFAULT_TILE_SIZE : 0);
    const interactY = playerPos.y + (playerDir === Direction.DOWN ? DEFAULT_TILE_SIZE :
                                     playerDir === Direction.UP ? -DEFAULT_TILE_SIZE : 0);

    // Check if any NPC is near the interaction point
    for (const npc of this.npcs) {
      if (npc.canInteractWith(interactX, interactY)) {
        this.triggerDialog(npc);
        return;
      }
    }
  }

  /**
   * Trigger dialog with NPC
   */
  private triggerDialog(npc: NPC): void {
    // Pause player movement
    if (this.player) {
      this.player.stop();
      this.player.setEnabled(false);
    }

    // Start dialog scene (placeholder - would use DialogScene later)
    const interaction = npc.startInteraction();

    // For now, show a simple dialog box
    this.showSimpleDialog(npc.getName(), `与${npc.getName()}对话...\n对话ID: ${interaction.dialogId}`);
  }

  /**
   * Show simple dialog box (placeholder)
   */
  private showSimpleDialog(name: string, message: string): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dialog box background
    const dialogBox = this.add.graphics();
    dialogBox.fillStyle(0x000000, 0.8);
    dialogBox.fillRect(width * 0.1, height * 0.7, width * 0.8, height * 0.25);
    dialogBox.lineStyle(2, 0xD4A84B);
    dialogBox.strokeRect(width * 0.1, height * 0.7, width * 0.8, height * 0.25);
    dialogBox.setDepth(100);

    // Name text
    const nameText = this.add.text(width * 0.15, height * 0.73, name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#D4A84B',
      fontStyle: 'bold',
    });
    nameText.setDepth(101);

    // Message text
    const messageText = this.add.text(width * 0.15, height * 0.78, message, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
      wordWrap: { width: width * 0.7 },
    });
    messageText.setDepth(101);

    // Close instruction
    const closeText = this.add.text(width * 0.85, height * 0.92, '按Enter关闭', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#AAAAAA',
    });
    closeText.setOrigin(1, 0.5);
    closeText.setDepth(101);

    // Setup close handler
    const closeDialog = () => {
      dialogBox.destroy();
      nameText.destroy();
      messageText.destroy();
      closeText.destroy();

      // Resume player
      if (this.player) {
        this.player.setEnabled(true);
      }

      // End NPC interaction
      for (const npc of this.npcs) {
        if (npc.getState() === 'interacting') {
          npc.endInteraction();
        }
      }

      this.input.keyboard!.off('keydown-ENTER', closeDialog);
      this.input.keyboard!.off('keydown-SPACE', closeDialog);
    };

    this.input.keyboard!.once('keydown-ENTER', closeDialog);
    this.input.keyboard!.once('keydown-SPACE', closeDialog);
  }

  /**
   * Handle map transition
   */
  private handleMapTransition(transitionData: MapTransitionData): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Fade out
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Transition to new map (for now, same map with different position)
      // In full implementation, would load different map data
      this.scene.restart({
        mapId: transitionData.targetMapId,
        playerStartX: transitionData.targetX,
        playerStartY: transitionData.targetY,
      });
    });
  }

  /**
   * Update loop - handle movement and checks
   */
  update(): void {
    if (!this.player || this.isTransitioning) return;

    // Handle movement input
    this.handleMovement();

    // Update player
    this.player.update();

    // Update NPCs
    for (const npc of this.npcs) {
      npc.update();
    }

    // Check for map transitions
    this.checkMapTransitions();
  }

  /**
   * Handle movement input
   */
  private handleMovement(): void {
    if (!this.player) return;

    let direction: Direction | null = null;

    // Check cursor keys and WASD
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      direction = Direction.LEFT;
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      direction = Direction.RIGHT;
    }

    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      direction = Direction.UP;
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      direction = Direction.DOWN;
    }

    // Apply movement
    if (direction) {
      this.player.move(direction);
    } else {
      this.player.stop();
    }
  }

  /**
   * Check if player is on a transition tile
   */
  private checkMapTransitions(): void {
    if (!this.player || this.isTransitioning) return;

    const playerTile = this.player.getTilePosition();

    for (const point of this.transitionPoints) {
      if (playerTile.x === point.x && playerTile.y === point.y) {
        this.handleMapTransition(point.data);
        return;
      }
    }
  }

  /**
   * Cleanup scene
   */
  shutdown(): void {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    for (const npc of this.npcs) {
      npc.destroy();
    }
    this.npcs = [];

    if (this.tilemap) {
      this.tilemap.destroy();
    }
  }
}