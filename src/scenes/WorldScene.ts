/**
 * World Scene - Tile-based map exploration
 * US-004: 地图探索场景实现
 * US-029: 余杭镇地图实现
 * US-035: 第一章剧情实现
 * US-036: 第二章剧情实现
 */

import Phaser from 'phaser';
import { Player, Direction } from '@/entities/Player';
import { NPC } from '@/entities/NPC';
import {
  MapData,
  TileType,
  DEFAULT_TILE_SIZE,
  MapTransitionData,
  LayerType,
} from '@/data/MapData';
import { mapManager } from '@/systems/MapManager';
import { storySystem, TriggerType, StoryEventType, parseStoryConfig } from '@/systems/StorySystem';
import storyData from '@/data/story.json';
import { DialogEndEvent } from '@/scenes/DialogScene';
import { enemyManager } from '@/entities/Enemy';
import { CharacterManager } from '@/entities/Character';
import { Skill, loadSkillsFromJson } from '@/data/Skill';
import { BattleConfig } from '@/systems/BattleSystem';
import charactersData from '@/data/characters.json';
import skillsData from '@/data/skills.json';

/**
 * World scene configuration passed from scene transition
 */
export interface WorldSceneConfig {
  mapId?: string;
  playerStartX?: number;
  playerStartY?: number;
}

/**
 * World Scene class
 * Handles tile-based map rendering, player movement, collisions, and interactions
 */
export class WorldScene extends Phaser.Scene {
  private player: Player | null = null;
  private npcs: NPC[] = [];
  private currentMap: MapData;
  private currentMapId: string;
  private tilemap: Phaser.Tilemaps.Tilemap | null = null;
  private collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private buildingLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private overlayLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private isTransitioning: boolean = false;
  private playerStartX: number;
  private playerStartY: number;
  private transitionPoints: { x: number; y: number; data: MapTransitionData }[] = [];
  private characterManager: CharacterManager;
  private allSkills: Skill[];

  constructor() {
    super({ key: 'WorldScene' });
    // Default to Yuhang Town main map
    this.currentMapId = 'yuhang_town_main';
    this.currentMap = mapManager.getMap(this.currentMapId) || this.createFallbackMap();
    this.playerStartX = 5;
    this.playerStartY = 10;

    // Initialize story system with story data
    storySystem.loadConfig(parseStoryConfig(storyData));

    // Initialize character system
    this.characterManager = new CharacterManager();
    this.characterManager.loadCharacterData(charactersData as unknown as Parameters<CharacterManager['loadCharacterData']>[0]);
    this.allSkills = loadSkillsFromJson(skillsData);
  }

  /**
   * Get default player party for battle
   * Returns Li Xiaoyao at level based on story progress
   */
  private getDefaultPlayerParty(): ReturnType<CharacterManager['createCharacter']>[] {
    // Get current chapter from story system
    const chapter = storySystem.getCurrentChapter();

    // Determine player level based on chapter
    // Chapter 0-1: Lv1, Chapter 2: Lv5, Chapter 3: Lv10, etc.
    const playerLevel = Math.max(1, chapter * 5);

    // Create Li Xiaoyao at appropriate level
    const liXiaoyao = this.characterManager.createCharacter('li_xiaoyao', playerLevel, this.allSkills);

    // For now, return single character party
    // TODO: Track party members in game state
    return [liXiaoyao];
  }

  /**
   * Create a fallback map if no map is found
   */
  private createFallbackMap(): MapData {
    return {
      id: 'fallback',
      name: 'Fallback',
      displayName: 'Fallback',
      locationId: 'fallback',
      width: 20,
      height: 15,
      tileWidth: DEFAULT_TILE_SIZE,
      tileHeight: DEFAULT_TILE_SIZE,
      layers: [
        {
          id: 'fallback_ground',
          name: 'ground',
          type: LayerType.GROUND,
          visible: true,
          opacity: 1,
          tiles: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          ],
        },
      ],
      npcs: [],
      transitions: [],
      events: [],
      collisions: [],
    };
  }

  init(data: WorldSceneConfig): void {
    // Load the specified map or use default
    if (data.mapId) {
      const map = mapManager.getMap(data.mapId);
      if (map) {
        this.currentMapId = data.mapId;
        this.currentMap = map;
        mapManager.setCurrentMap(data.mapId);
      }
    }

    this.playerStartX = data.playerStartX || 5;
    this.playerStartY = data.playerStartY || 10;
    this.isTransitioning = false;
    this.transitionPoints = [];

    // Check for story triggers on entering map
    this.checkStoryTriggerOnMapEntry();
  }

  /**
   * Check for story triggers when entering a map
   */
  private checkStoryTriggerOnMapEntry(): void {
    const triggerResult = storySystem.checkTrigger(TriggerType.ENTER_MAP, {
      mapId: this.currentMapId,
    });

    if (triggerResult) {
      console.log(`[WorldScene] Story trigger activated: ${triggerResult.nodeId}`);
      this.executeStoryNode(triggerResult.nodeId);
    }
  }

  /**
   * Execute a story node's events
   */
  private executeStoryNode(nodeId: string): void {
    if (storySystem.startNode(nodeId)) {
      // Get first event
      const event = storySystem.getNextEvent();
      if (event) {
        this.executeStoryEvent(event);
      }
    }
  }

  /**
   * Execute a single story event
   */
  private executeStoryEvent(event: { type: StoryEventType; data: Record<string, unknown>; waitForCompletion?: boolean }): void {
    switch (event.type) {
      case StoryEventType.DIALOG:
        // Start dialog scene
        if (event.data.dialogId) {
          this.scene.pause();
          this.scene.launch('DialogScene', {
            dialogId: event.data.dialogId as string,
            isStoryEvent: true,
          });
          this.scene.get('DialogScene').events.once('resume', (_data: DialogEndEvent) => {
            this.handleStoryEventComplete();
          });
        }
        break;

      case StoryEventType.BATTLE:
        // Start battle scene
        if (event.data.enemyIds) {
          // Get enemy data from enemyIds
          const enemyIdsArray = event.data.enemyIds as string[];
          const enemies = enemyIdsArray
            .map(id => enemyManager.getEnemy(id))
            .filter(e => e !== undefined)
            .map(enemy => ({
              id: enemy.id,
              name: enemy.displayName || enemy.name,
              hp: enemy.hp,
              maxHp: enemy.maxHp,
              attack: enemy.attack,
              defense: enemy.defense,
              speed: enemy.speed,
              luck: enemy.luck,
              expReward: enemy.expReward,
              goldReward: enemy.goldReward,
            }));

          if (enemies.length === 0) {
            console.error('[WorldScene] No valid enemies found for battle');
            this.handleStoryEventComplete();
            return;
          }

          // Get player party
          const playerParty = this.getDefaultPlayerParty();

          // Create battle config
          const battleConfig: BattleConfig = {
            enemies,
            playerParty,
            canFlee: false, // Story battles cannot be fled
          };

          this.scene.pause();
          this.scene.launch('BattleScene', battleConfig);
          this.scene.get('BattleScene').events.once('resume', () => {
            this.handleStoryEventComplete();
          });
        }
        break;

      case StoryEventType.SET_FLAG:
        // Set story flag
        if (event.data.flagName && event.data.flagValue !== undefined) {
          storySystem.setFlag(event.data.flagName as string, event.data.flagValue as boolean);
          this.handleStoryEventComplete();
        }
        break;

      case StoryEventType.CHAPTER_CHANGE:
        // Change chapter
        if (event.data.chapter !== undefined) {
          storySystem.setChapter(event.data.chapter as number);
          this.handleStoryEventComplete();
        }
        break;

      case StoryEventType.ADD_PARTY:
        // Add party member - handled by game state
        console.log(`[WorldScene] Party member added: ${event.data.characterId}`);
        this.handleStoryEventComplete();
        break;

      case StoryEventType.GET_ITEM:
        // Get item - handled by inventory system
        console.log(`[WorldScene] Item obtained: ${event.data.itemId}`);
        this.handleStoryEventComplete();
        break;

      default:
        // Skip unknown events
        this.handleStoryEventComplete();
        break;
    }
  }

  /**
   * Handle story event completion
   */
  private handleStoryEventComplete(): void {
    // Advance to next event
    if (storySystem.advanceEvent()) {
      const nextEvent = storySystem.getNextEvent();
      if (nextEvent) {
        this.executeStoryEvent(nextEvent);
      }
    } else {
      // Node completed, resume player
      if (this.player) {
        this.player.setEnabled(true);
      }
      this.scene.resume();
    }
  }

  create(): void {
    // Set background color from map environment
    const bgColor = mapManager.getMapBackgroundColor(this.currentMapId);
    this.cameras.main.setBackgroundColor(bgColor);

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
   * Create tilemap from map data with warm color theme
   */
  private createTilemap(): void {
    // Get color theme for this map
    const colorTheme = mapManager.getMapColorTheme(this.currentMapId);

    // Create a tilemap data structure using ground layer
    const groundLayer = this.currentMap.layers.find(l => l.type === LayerType.GROUND);
    if (!groundLayer) return;

    this.tilemap = this.make.tilemap({
      data: groundLayer.tiles,
      tileWidth: this.currentMap.tileWidth,
      tileHeight: this.currentMap.tileHeight,
    });

    // Create tileset texture dynamically with warm colors
    this.createTilesetTexture(colorTheme);

    // Add the tileset to the tilemap
    const tileset = this.tilemap.addTilesetImage('tiles', 'tiles');

    if (tileset) {
      // Create the ground layer
      this.collisionLayer = this.tilemap.createLayer(0, tileset, 0, 0);
      if (this.collisionLayer) {
        this.collisionLayer.setDepth(0);
        // Set collision for walls and other collision tiles
        const collisionTiles = mapManager.getCollisionTilesForMap(this.currentMapId);
        this.collisionLayer.setCollision(collisionTiles);
      }

      // Create building layer if exists
      const buildingLayerData = this.currentMap.layers.find(l => l.type === LayerType.BUILDING);
      if (buildingLayerData && buildingLayerData.visible) {
        // Create separate tileset for buildings
        this.createBuildingTilesetTexture(colorTheme);
        const buildingTileset = this.tilemap.addTilesetImage('building_tiles', 'building_tiles');
        if (buildingTileset) {
          // Create building layer using separate tilemap
          const buildingTilemap = this.make.tilemap({
            data: buildingLayerData.tiles,
            tileWidth: this.currentMap.tileWidth,
            tileHeight: this.currentMap.tileHeight,
          });
          this.buildingLayer = buildingTilemap.createLayer(0, buildingTileset, 0, 0);
          if (this.buildingLayer) {
            this.buildingLayer.setDepth(1);
            this.buildingLayer.setAlpha(buildingLayerData.opacity);
            // Building collision tiles (8 = building)
            if (buildingLayerData.collision) {
              this.buildingLayer.setCollision(buildingLayerData.collision.tileIds);
            }
          }
        }
      }

      // Create overlay layer if exists (trees, decorations)
      const overlayLayerData = this.currentMap.layers.find(l => l.type === LayerType.OVERLAY);
      if (overlayLayerData && overlayLayerData.visible) {
        this.createOverlayTilesetTexture(colorTheme);
        const overlayTileset = this.tilemap.addTilesetImage('overlay_tiles', 'overlay_tiles');
        if (overlayTileset) {
          const overlayTilemap = this.make.tilemap({
            data: overlayLayerData.tiles,
            tileWidth: this.currentMap.tileWidth,
            tileHeight: this.currentMap.tileHeight,
          });
          this.overlayLayer = overlayTilemap.createLayer(0, overlayTileset, 0, 0);
          if (this.overlayLayer) {
            this.overlayLayer.setDepth(2);
            this.overlayLayer.setAlpha(overlayLayerData.opacity);
          }
        }
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
   * Create tileset texture dynamically with warm colors for Yuhang Town
   * or mystical colors for Fairy Island (青绿, 淡蓝)
   */
  private createTilesetTexture(colorTheme: { primary: string; secondary: string; accent: string }): void {
    const graphics = this.add.graphics();

    // Convert hex colors to number
    const groundColor = Phaser.Display.Color.HexStringToColor(colorTheme.accent).color;
    const wallColor = Phaser.Display.Color.HexStringToColor(colorTheme.secondary).color;
    const doorColor = Phaser.Display.Color.HexStringToColor(colorTheme.primary).color;

    // Determine if this is a mystical location (Fairy Island) based on color theme
    // Fairy Island uses cyan/teal colors (#4ECDC4, #2E8B57, #B0E0E6)
    const isMystical = colorTheme.primary === '#4ECDC4' || colorTheme.primary === '#00BCD4';
    const waterColor = isMystical ? 0x4ECDC4 : 0x5588aa; // Cyan for mystical, blue for normal
    const waterShimmer = isMystical ? 0x80DEEA : 0x6699bb;

    // Tile 0: Ground (walkable) - warm light brown/tan or mystical light teal
    graphics.fillStyle(groundColor);
    graphics.fillRect(0, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    // Add subtle texture pattern
    graphics.fillStyle(groundColor + 0x111111);
    graphics.fillRect(2, 2, DEFAULT_TILE_SIZE / 2 - 2, DEFAULT_TILE_SIZE / 2 - 2);
    graphics.fillRect(DEFAULT_TILE_SIZE / 2 + 2, DEFAULT_TILE_SIZE / 2 + 2, DEFAULT_TILE_SIZE / 2 - 4, DEFAULT_TILE_SIZE / 2 - 4);

    // Tile 1: Wall (impassable) - warm brown or mystical green
    graphics.fillStyle(wallColor);
    graphics.fillRect(DEFAULT_TILE_SIZE, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.fillStyle(wallColor + 0x222222);
    graphics.fillRect(DEFAULT_TILE_SIZE + 4, 4, DEFAULT_TILE_SIZE - 8, DEFAULT_TILE_SIZE - 8);

    // Tile 2: Water (impassable) - mystical cyan or normal blue-green
    graphics.fillStyle(waterColor);
    graphics.fillRect(DEFAULT_TILE_SIZE * 2, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    // Add water shimmer effect
    graphics.fillStyle(waterShimmer);
    graphics.fillRect(DEFAULT_TILE_SIZE * 2 + 6, 6, 8, 4);
    graphics.fillRect(DEFAULT_TILE_SIZE * 2 + 18, 18, 6, 4);

    // Tile 3: Door - warm gold/brown frame or mystical cyan frame
    graphics.fillStyle(doorColor);
    graphics.fillRect(DEFAULT_TILE_SIZE * 3, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.fillStyle(0x442200);
    graphics.fillRect(DEFAULT_TILE_SIZE * 3 + 4, 2, DEFAULT_TILE_SIZE - 8, DEFAULT_TILE_SIZE - 4);
    graphics.lineStyle(2, doorColor);
    graphics.strokeRect(DEFAULT_TILE_SIZE * 3 + 6, 4, DEFAULT_TILE_SIZE - 12, DEFAULT_TILE_SIZE - 8);

    // Tile 4: Path - lighter ground
    graphics.fillStyle(groundColor + 0x0a0a0a);
    graphics.fillRect(DEFAULT_TILE_SIZE * 4, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.lineStyle(1, groundColor - 0x111111);
    graphics.strokeRect(DEFAULT_TILE_SIZE * 4 + 2, 2, DEFAULT_TILE_SIZE - 4, DEFAULT_TILE_SIZE - 4);

    // Tile 5: Transition point - subtle marker (door-like)
    graphics.fillStyle(doorColor - 0x222222);
    graphics.fillRect(DEFAULT_TILE_SIZE * 5, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.fillStyle(0x332211);
    graphics.fillRect(DEFAULT_TILE_SIZE * 5 + 8, 8, DEFAULT_TILE_SIZE - 16, DEFAULT_TILE_SIZE - 16);

    // Tile 6: NPC spawn - invisible marker
    graphics.fillStyle(groundColor);
    graphics.fillRect(DEFAULT_TILE_SIZE * 6, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

    // Generate texture with all ground tiles
    graphics.generateTexture('tiles', DEFAULT_TILE_SIZE * 7, DEFAULT_TILE_SIZE);
    graphics.destroy();
  }

  /**
   * Create building tileset texture with warm colors
   */
  private createBuildingTilesetTexture(colorTheme: { primary: string; secondary: string; accent: string }): void {
    const graphics = this.add.graphics();

    const buildingColor = Phaser.Display.Color.HexStringToColor(colorTheme.secondary).color;
    const roofColor = Phaser.Display.Color.HexStringToColor(colorTheme.primary).color;

    // Tile 0: Empty (no building)
    graphics.fillStyle(0x000000, 0);
    graphics.fillRect(0, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

    // Tile 8: Building wall - warm brown with frame
    graphics.fillStyle(buildingColor);
    graphics.fillRect(DEFAULT_TILE_SIZE * 8, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);
    graphics.fillStyle(buildingColor + 0x111111);
    graphics.fillRect(DEFAULT_TILE_SIZE * 8 + 2, 2, DEFAULT_TILE_SIZE - 4, DEFAULT_TILE_SIZE - 4);
    // Add window-like detail
    graphics.fillStyle(roofColor);
    graphics.fillRect(DEFAULT_TILE_SIZE * 8 + 8, 8, 8, 8);

    // Generate building texture
    graphics.generateTexture('building_tiles', DEFAULT_TILE_SIZE * 12, DEFAULT_TILE_SIZE);
    graphics.destroy();
  }

  /**
   * Create overlay tileset texture (trees, decorations, lotus flowers)
   */
  private createOverlayTilesetTexture(colorTheme: { primary: string; secondary: string; accent: string }): void {
    const graphics = this.add.graphics();

    // Tile 0: Empty
    graphics.fillStyle(0x000000, 0);
    graphics.fillRect(0, 0, DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

    // Tile 7: Tree - green with warm trunk
    // Tree trunk (brown)
    graphics.fillStyle(0x664422);
    graphics.fillRect(DEFAULT_TILE_SIZE * 7 + 10, 20, 12, 12);
    // Tree foliage (green)
    graphics.fillStyle(0x448844);
    graphics.fillCircle(DEFAULT_TILE_SIZE * 7 + 16, 12, 10);
    graphics.fillStyle(0x55aa55);
    graphics.fillCircle(DEFAULT_TILE_SIZE * 7 + 12, 14, 6);
    graphics.fillCircle(DEFAULT_TILE_SIZE * 7 + 20, 14, 6);

    // Tile 9: Lotus flower - for Fairy Island ponds (青绿, 粉色)
    // Lotus pad (green)
    graphics.fillStyle(0x2E8B57);
    graphics.fillCircle(DEFAULT_TILE_SIZE * 9 + 16, 20, 10);
    graphics.fillStyle(0x3CB371);
    graphics.fillCircle(DEFAULT_TILE_SIZE * 9 + 12, 18, 6);
    graphics.fillCircle(DEFAULT_TILE_SIZE * 9 + 20, 18, 6);
    // Lotus petals (pink)
    graphics.fillStyle(0xFFB6C1);
    graphics.fillCircle(DEFAULT_TILE_SIZE * 9 + 16, 12, 5);
    graphics.fillStyle(0xFFC0CB);
    graphics.fillEllipse(DEFAULT_TILE_SIZE * 9 + 12, 14, 4, 6);
    graphics.fillEllipse(DEFAULT_TILE_SIZE * 9 + 20, 14, 4, 6);
    graphics.fillEllipse(DEFAULT_TILE_SIZE * 9 + 16, 8, 4, 5);
    // Lotus center (yellow)
    graphics.fillStyle(0xFFD700);
    graphics.fillCircle(DEFAULT_TILE_SIZE * 9 + 16, 12, 2);

    // Tile 10: Chest - golden treasure box
    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(colorTheme.primary).color);
    graphics.fillRect(DEFAULT_TILE_SIZE * 10 + 4, 8, DEFAULT_TILE_SIZE - 8, DEFAULT_TILE_SIZE - 12);
    graphics.fillStyle(0x886622);
    graphics.fillRect(DEFAULT_TILE_SIZE * 10 + 8, 4, DEFAULT_TILE_SIZE - 16, 8);

    // Generate overlay texture
    graphics.generateTexture('overlay_tiles', DEFAULT_TILE_SIZE * 12, DEFAULT_TILE_SIZE);
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
    // Clear existing NPCs
    for (const npc of this.npcs) {
      npc.destroy();
    }
    this.npcs = [];

    // Create NPCs from current map data
    for (const npcSpawn of this.currentMap.npcs) {
      const npc = new NPC(this, {
        npcId: npcSpawn.npcId,
        name: npcSpawn.name,
        dialogId: npcSpawn.dialogId,
        x: npcSpawn.x,
        y: npcSpawn.y,
        direction: npcSpawn.direction,
        movementType: npcSpawn.movementType,
        movementRange: npcSpawn.movementRange,
      });
      this.npcs.push(npc);
    }
  }

  /**
   * Setup collision detection
   */
  private setupCollisions(): void {
    if (!this.player) return;

    // Player collides with collision layer (walls, water, etc.)
    if (this.collisionLayer) {
      this.physics.add.collider(this.player.getSprite(), this.collisionLayer);
    }

    // Player collides with building layer
    if (this.buildingLayer) {
      this.physics.add.collider(this.player.getSprite(), this.buildingLayer);
    }

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
    // Clear existing transition points
    this.transitionPoints = [];

    // Load transitions from current map
    const transitions = this.currentMap.transitions;
    for (const transition of transitions) {
      this.transitionPoints.push({
        x: transition.sourceX,
        y: transition.sourceY,
        data: transition,
      });
    }

    // Also check for transition tiles in tile data (tile type 5)
    const groundLayer = this.currentMap.layers.find(l => l.type === LayerType.GROUND);
    if (groundLayer) {
      for (let y = 0; y < groundLayer.tiles.length; y++) {
        for (let x = 0; x < groundLayer.tiles[y].length; x++) {
          if (groundLayer.tiles[y][x] === TileType.TRANSITION) {
            // Check if transition is already defined
            const existingTransition = this.transitionPoints.find(
              p => p.x === x && p.y === y
            );
            if (!existingTransition && this.currentMap.transitions.length > 0) {
              // Use first transition as default if no specific one defined
              const defaultTransition = this.currentMap.transitions[0];
              this.transitionPoints.push({
                x,
                y,
                data: defaultTransition,
              });
            }
          }
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
        // Check for story trigger on NPC interaction
        const triggerResult = storySystem.checkTrigger(TriggerType.INTERACT_NPC, {
          npcId: npc.getNPCId(),
        });

        if (triggerResult) {
          console.log(`[WorldScene] Story trigger activated for NPC: ${triggerResult.nodeId}`);
          this.executeStoryNode(triggerResult.nodeId);
          return;
        }

        // Default: trigger dialog with NPC
        this.triggerDialog(npc);
        return;
      }
    }
  }

  /**
   * Trigger dialog with NPC using DialogScene
   */
  private triggerDialog(npc: NPC): void {
    // Pause player movement
    if (this.player) {
      this.player.stop();
      this.player.setEnabled(false);
    }

    // Start interaction
    const interaction = npc.startInteraction();

    // Pause this scene and launch DialogScene
    this.scene.pause();
    this.scene.launch('DialogScene', {
      dialogId: interaction.dialogId,
      npcName: npc.getName(),
    });

    // Listen for dialog end event
    this.scene.get('DialogScene').events.once('resume', (data: DialogEndEvent) => {
      this.handleDialogEnd(data);
    });
  }

  /**
   * Handle dialog scene ending
   */
  private handleDialogEnd(endEvent: DialogEndEvent): void {
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

    // Handle events from dialog (in full implementation)
    if (endEvent.lastEvent) {
      console.log(`[WorldScene] Dialog ended with event: ${endEvent.lastEvent.type}`);
      // TODO: Handle events like item received, battle started, etc.
    }
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
      // Check if target map exists
      const targetMap = mapManager.getMap(transitionData.targetMapId);
      if (targetMap) {
        // Transition to new map
        this.scene.restart({
          mapId: transitionData.targetMapId,
          playerStartX: transitionData.targetX,
          playerStartY: transitionData.targetY,
        });
      } else {
        // Fallback: restart current map at new position
        console.warn(`Target map ${transitionData.targetMapId} not found, staying in current map`);
        this.scene.restart({
          mapId: this.currentMapId,
          playerStartX: transitionData.targetX,
          playerStartY: transitionData.targetY,
        });
      }
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