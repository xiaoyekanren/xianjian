/**
 * Map data types and interfaces
 * US-004: 地图探索场景实现
 */

/**
 * Tile types for the map
 */
export enum TileType {
  GROUND = 0,      // Walkable ground
  WALL = 1,        // impassable wall/obstacle
  WATER = 2,       // Water (impassable without special ability)
  DOOR = 3,        // Door/entrance
  PATH = 4,        // Path/walkable
  TRANSITION = 5,  // Map transition point
  NPC_SPAWN = 6,   // NPC spawn point
}

/**
 * Tile properties
 */
export interface TileProperties {
  type: TileType;
  walkable: boolean;
  interactive?: boolean;
  transitionData?: MapTransitionData;
}

/**
 * Map transition data
 */
export interface MapTransitionData {
  targetMapId: string;
  targetX: number;
  targetY: number;
}

/**
 * NPC spawn configuration
 */
export interface NPCSpawnData {
  npcId: string;
  name: string;
  dialogId: string;
  x: number;
  y: number;
  spriteKey?: string;
}

/**
 * Map layer data
 */
export interface MapLayer {
  name: string;
  tiles: number[][];
  properties?: Record<string, TileProperties>;
}

/**
 * Complete map data structure
 */
export interface MapData {
  id: string;
  name: string;
  width: number;          // Number of tiles horizontally
  height: number;         // Number of tiles vertically
  tileWidth: number;      // Pixel width of each tile
  tileHeight: number;     // Pixel height of each tile
  layers: MapLayer[];
  npcs: NPCSpawnData[];
  transitions: MapTransitionData[];
}

/**
 * Default tile size for the game
 */
export const DEFAULT_TILE_SIZE = 32;

/**
 * Check if a tile type is walkable
 */
export function isTileWalkable(tileType: TileType): boolean {
  return tileType === TileType.GROUND ||
         tileType === TileType.PATH ||
         tileType === TileType.DOOR ||
         tileType === TileType.TRANSITION;
}

/**
 * Get tile type from tile value
 */
export function getTileTypeFromValue(value: number): TileType {
  switch (value) {
    case 0: return TileType.GROUND;
    case 1: return TileType.WALL;
    case 2: return TileType.WATER;
    case 3: return TileType.DOOR;
    case 4: return TileType.PATH;
    case 5: return TileType.TRANSITION;
    case 6: return TileType.NPC_SPAWN;
    default: return TileType.GROUND;
  }
}