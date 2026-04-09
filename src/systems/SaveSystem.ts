/**
 * Save System - localStorage-based save/load functionality
 * US-016: 存档系统实现
 */

import { Character } from '@/entities/Character';
import { InventoryEntry } from '@/data/Item';

/**
 * Character position on map
 */
export interface MapPosition {
  x: number;
  y: number;
}

/**
 * Story progress flags
 */
export interface StoryFlags {
  [flagId: string]: boolean;
}

/**
 * Affection data for three female characters
 */
export interface AffectionData {
  zhao_linger: number;  // 0-100
  lin_yueru: number;    // 0-100
  anu: number;          // 0-100
}

/**
 * Save data structure
 */
export interface SaveData {
  slotId: number;           // 1-5
  timestamp: number;        // Unix timestamp
  playTime: number;         // Total play time in seconds

  // Map data
  currentMap: string;
  playerPosition: MapPosition;

  // Story progress
  storyFlags: StoryFlags;
  currentChapter: number;

  // Party data
  partyMembers: string[];   // Character IDs in party
  characters: Character[];  // Full character data

  // Inventory
  inventory: InventoryEntry[];
  gold: number;

  // Affection
  affection: AffectionData;

  // Settings
  settings: GameSettings;
}

/**
 * Game settings
 */
export interface GameSettings {
  bgmVolume: number;        // 0-100
  sfxVolume: number;        // 0-100
  textSpeed: number;        // 1-3 (slow/normal/fast)
  autoSave: boolean;
}

/**
 * Default game settings
 */
export const DEFAULT_SETTINGS: GameSettings = {
  bgmVolume: 80,
  sfxVolume: 80,
  textSpeed: 2,
  autoSave: true,
};

/**
 * Save slot info (for displaying in UI)
 */
export interface SaveSlotInfo {
  slotId: number;
  exists: boolean;
  timestamp?: number;
  playTime?: number;
  currentChapter?: number;
  partyLeader?: string;
  currentMap?: string;
}

/**
 * Save System class
 * Manages save/load operations via localStorage
 */
export class SaveSystem {
  private static readonly SAVE_KEY_PREFIX = 'xianjian_save_';
  private static readonly SETTINGS_KEY = 'xianjian_settings';
  private static readonly MAX_SLOTS = 5;

  /**
   * Get storage key for a slot
   */
  private static getSlotKey(slotId: number): string {
    return `${this.SAVE_KEY_PREFIX}${slotId}`;
  }

  /**
   * Save game to a slot
   */
  static save(slotId: number, data: Omit<SaveData, 'slotId' | 'timestamp'>): boolean {
    if (slotId < 1 || slotId > this.MAX_SLOTS) {
      console.error(`Invalid slot ID: ${slotId}`);
      return false;
    }

    const saveData: SaveData = {
      ...data,
      slotId,
      timestamp: Date.now(),
    };

    try {
      const json = JSON.stringify(saveData);
      localStorage.setItem(this.getSlotKey(slotId), json);
      console.log(`Game saved to slot ${slotId}`);
      return true;
    } catch (error) {
      console.error(`Failed to save game:`, error);
      return false;
    }
  }

  /**
   * Load game from a slot
   */
  static load(slotId: number): SaveData | null {
    if (slotId < 1 || slotId > this.MAX_SLOTS) {
      console.error(`Invalid slot ID: ${slotId}`);
      return null;
    }

    try {
      const json = localStorage.getItem(this.getSlotKey(slotId));
      if (!json) {
        console.log(`No save data in slot ${slotId}`);
        return null;
      }

      const data = JSON.parse(json) as SaveData;
      console.log(`Game loaded from slot ${slotId}`);
      return data;
    } catch (error) {
      console.error(`Failed to load game:`, error);
      return null;
    }
  }

  /**
   * Delete a save slot
   */
  static delete(slotId: number): boolean {
    if (slotId < 1 || slotId > this.MAX_SLOTS) {
      console.error(`Invalid slot ID: ${slotId}`);
      return false;
    }

    try {
      localStorage.removeItem(this.getSlotKey(slotId));
      console.log(`Save slot ${slotId} deleted`);
      return true;
    } catch (error) {
      console.error(`Failed to delete save:`, error);
      return false;
    }
  }

  /**
   * Get info for all save slots
   */
  static getAllSlotInfo(): SaveSlotInfo[] {
    const slots: SaveSlotInfo[] = [];

    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      slots.push(this.getSlotInfo(i));
    }

    return slots;
  }

  /**
   * Get info for a single slot
   */
  static getSlotInfo(slotId: number): SaveSlotInfo {
    const data = this.load(slotId);

    if (!data) {
      return {
        slotId,
        exists: false,
      };
    }

    return {
      slotId,
      exists: true,
      timestamp: data.timestamp,
      playTime: data.playTime,
      currentChapter: data.currentChapter,
      partyLeader: data.partyMembers[0],
      currentMap: data.currentMap,
    };
  }

  /**
   * Check if a slot has save data
   */
  static hasSave(slotId: number): boolean {
    return localStorage.getItem(this.getSlotKey(slotId)) !== null;
  }

  /**
   * Get game settings
   */
  static getSettings(): GameSettings {
    try {
      const json = localStorage.getItem(this.SETTINGS_KEY);
      if (!json) {
        return DEFAULT_SETTINGS;
      }
      return JSON.parse(json) as GameSettings;
    } catch (error) {
      console.error(`Failed to load settings:`, error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save game settings
   */
  static saveSettings(settings: GameSettings): boolean {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error(`Failed to save settings:`, error);
      return false;
    }
  }

  /**
   * Quick save to slot 1 (auto-save)
   */
  static quickSave(data: Omit<SaveData, 'slotId' | 'timestamp'>): boolean {
    return this.save(1, data);
  }

  /**
   * Quick load from slot 1
   */
  static quickLoad(): SaveData | null {
    return this.load(1);
  }

  /**
   * Format play time for display
   */
  static formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}