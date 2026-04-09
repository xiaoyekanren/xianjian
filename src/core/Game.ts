/**
 * Game Controller - Main game initialization and lifecycle management
 * US-002: 游戏主控制器实现
 */

import Phaser from 'phaser';
import { SceneManager } from './SceneManager';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';

/**
 * Game configuration interface
 */
export interface GameConfig {
  width: number;
  height: number;
  backgroundColor: string;
  parent: string;
  pixelArt: boolean;
}

/**
 * Default game configuration
 */
const DEFAULT_CONFIG: GameConfig = {
  width: 1920,
  height: 1080,
  backgroundColor: '#2d2d44',
  parent: 'game-container',
  pixelArt: false,
};

/**
 * Main Game Controller class
 * Manages game initialization, lifecycle, and core systems
 */
export class Game {
  private phaserGame: Phaser.Game;
  private sceneManager: SceneManager;
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private config: GameConfig;

  constructor(customConfig?: Partial<GameConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.phaserGame = this.createPhaserGame();
    this.sceneManager = new SceneManager(this.phaserGame);
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
  }

  /**
   * Create the Phaser game instance with full configuration
   */
  private createPhaserGame(): Phaser.Game {
    const phaserConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: this.config.parent,
      width: this.config.width,
      height: this.config.height,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      backgroundColor: this.config.backgroundColor,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [],
      render: {
        pixelArt: this.config.pixelArt,
        antialias: !this.config.pixelArt,
      },
    };

    return new Phaser.Game(phaserConfig);
  }

  /**
   * Get the Phaser game instance
   */
  getPhaserGame(): Phaser.Game {
    return this.phaserGame;
  }

  /**
   * Get the Scene Manager
   */
  getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  /**
   * Get the Input Manager
   */
  getInputManager(): InputManager {
    return this.inputManager;
  }

  /**
   * Get the Audio Manager
   */
  getAudioManager(): AudioManager {
    return this.audioManager;
  }

  /**
   * Pause the game
   */
  pause(): void {
    this.phaserGame.pause();
  }

  /**
   * Resume the game
   */
  resume(): void {
    this.phaserGame.resume();
  }

  /**
   * Check if the game is paused
   */
  isPaused(): boolean {
    return this.phaserGame.isPaused;
  }

  /**
   * Get game dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.config.width,
      height: this.config.height,
    };
  }

  /**
   * Destroy the game and cleanup resources
   */
  destroy(): void {
    this.audioManager.cleanup();
    this.inputManager.cleanup();
    this.phaserGame.destroy(true);
  }
}