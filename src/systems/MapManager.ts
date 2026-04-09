/**
 * Map Manager - loads and manages map data from maps.json
 * US-029: 余杭镇地图实现
 */

import {
  MapData,
  MapLocation,
  MapTransitionData,
  MapEventData,
  NPCSpawnData,
  LayerType,
} from '@/data/MapData';

import mapsData from '@/data/maps.json';

/**
 * Maps JSON structure
 */
interface MapsJsonData {
  locations: MapLocation[];
  maps: MapData[];
}

/**
 * Map Manager class
 * Handles loading, caching, and accessing map data
 */
export class MapManager {
  private maps: Map<string, MapData>;
  private locations: Map<string, MapLocation>;
  private currentMapId: string;

  constructor() {
    this.maps = new Map();
    this.locations = new Map();
    this.currentMapId = '';

    // Load maps and locations from JSON
    this.loadFromData(mapsData as MapsJsonData);
  }

  /**
   * Load maps and locations from JSON data
   */
  private loadFromData(data: MapsJsonData): void {
    // Load locations
    for (const location of data.locations) {
      this.locations.set(location.id, location);
    }

    // Load maps
    for (const map of data.maps) {
      // Ensure layers have proper structure
      if (!map.layers) {
        map.layers = [];
      }
      // Ensure NPCs array exists
      if (!map.npcs) {
        map.npcs = [];
      }
      // Ensure transitions array exists
      if (!map.transitions) {
        map.transitions = [];
      }
      // Ensure events array exists
      if (!map.events) {
        map.events = [];
      }
      // Ensure collisions array exists
      if (!map.collisions) {
        map.collisions = [];
      }

      this.maps.set(map.id, map);
    }
  }

  /**
   * Get a map by ID
   */
  getMap(mapId: string): MapData | undefined {
    return this.maps.get(mapId);
  }

  /**
   * Get all maps for a location
   */
  getMapsForLocation(locationId: string): MapData[] {
    const location = this.locations.get(locationId);
    if (!location) return [];

    const result: MapData[] = [];
    for (const mapId of location.maps) {
      const map = this.maps.get(mapId);
      if (map) {
        result.push(map);
      }
    }
    return result;
  }

  /**
   * Get a location by ID
   */
  getLocation(locationId: string): MapLocation | undefined {
    return this.locations.get(locationId);
  }

  /**
   * Get the current map
   */
  getCurrentMap(): MapData | undefined {
    if (!this.currentMapId) return undefined;
    return this.maps.get(this.currentMapId);
  }

  /**
   * Set the current map
   */
  setCurrentMap(mapId: string): void {
    this.currentMapId = mapId;
  }

  /**
   * Get all locations
   */
  getAllLocations(): MapLocation[] {
    return Array.from(this.locations.values());
  }

  /**
   * Get all maps
   */
  getAllMaps(): MapData[] {
    return Array.from(this.maps.values());
  }

  /**
   * Get NPCs for a map
   */
  getNPCsForMap(mapId: string): NPCSpawnData[] {
    const map = this.maps.get(mapId);
    return map?.npcs || [];
  }

  /**
   * Get transitions for a map
   */
  getTransitionsForMap(mapId: string): MapTransitionData[] {
    const map = this.maps.get(mapId);
    return map?.transitions || [];
  }

  /**
   * Get events for a map
   */
  getEventsForMap(mapId: string): MapEventData[] {
    const map = this.maps.get(mapId);
    return map?.events || [];
  }

  /**
   * Find transition at specific coordinates
   */
  findTransitionAt(mapId: string, x: number, y: number): MapTransitionData | undefined {
    const transitions = this.getTransitionsForMap(mapId);
    return transitions.find(t => t.sourceX === x && t.sourceY === y);
  }

  /**
   * Get collision tile indices for a map
   */
  getCollisionTilesForMap(mapId: string): number[] {
    const map = this.maps.get(mapId);
    if (!map || !map.collisions) return [1, 2]; // Default walls and water

    const collisionTiles: number[] = [];
    for (const collision of map.collisions) {
      collisionTiles.push(...collision.tileIds);
    }
    return collisionTiles;
  }

  /**
   * Check if a tile position is walkable
   */
  isTileWalkable(mapId: string, x: number, y: number): boolean {
    const map = this.maps.get(mapId);
    if (!map) return false;

    // Check ground layer first
    const groundLayer = map.layers.find(l => l.type === LayerType.GROUND);
    if (groundLayer && groundLayer.tiles[y] && groundLayer.tiles[y][x] !== undefined) {
      const tileValue = groundLayer.tiles[y][x];
      if (this.isCollisionTile(mapId, tileValue)) {
        return false;
      }
    }

    // Check building layer for obstacles
    const buildingLayer = map.layers.find(l => l.type === LayerType.BUILDING);
    if (buildingLayer && buildingLayer.tiles[y] && buildingLayer.tiles[y][x] !== undefined) {
      const tileValue = buildingLayer.tiles[y][x];
      if (tileValue !== 0 && this.isCollisionTile(mapId, tileValue)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a tile value is a collision tile
   */
  private isCollisionTile(mapId: string, tileValue: number): boolean {
    const collisionTiles = this.getCollisionTilesForMap(mapId);
    return collisionTiles.includes(tileValue);
  }

  /**
   * Get map color theme
   */
  getMapColorTheme(mapId: string): { primary: string; secondary: string; accent: string } {
    const map = this.maps.get(mapId);
    return map?.colorTheme || {
      primary: '#D4A84B',
      secondary: '#8B4513',
      accent: '#F5DEB3',
    };
  }

  /**
   * Get map background color
   */
  getMapBackgroundColor(mapId: string): string {
    const map = this.maps.get(mapId);
    return map?.environment?.backgroundColor || '#2d2d44';
  }

  /**
   * Get shops for a location
   */
  getShopsForLocation(locationId: string): string[] {
    const location = this.locations.get(locationId);
    return location?.shops || [];
  }

  /**
   * Get inns for a location
   */
  getInnsForLocation(locationId: string): string[] {
    const location = this.locations.get(locationId);
    return location?.inns || [];
  }
}

/**
 * Default map manager instance
 */
export const mapManager = new MapManager();