/**
 * Scene Manager - Handles scene switching and transitions
 * US-002: 场景切换逻辑
 */

import Phaser from 'phaser';

/**
 * Scene key type for all game scenes
 */
export type SceneKey = 'Boot' | 'MainMenu' | 'World' | 'Dialog' | 'Battle' | 'Pause' | 'Save' | 'Shop';

/**
 * Scene transition options
 */
export interface SceneTransitionOptions {
  duration?: number;
  fadeOut?: boolean;
  fadeIn?: boolean;
  data?: object;
}

/**
 * Scene Manager class
 * Manages scene registration, switching, and transitions
 */
export class SceneManager {
  private game: Phaser.Game;
  private currentSceneKey: SceneKey | null = null;
  private sceneHistory: SceneKey[] = [];
  private maxHistoryLength: number = 10;

  constructor(game: Phaser.Game) {
    this.game = game;
  }

  /**
   * Get the Phaser scene manager
   */
  private getPhaserSceneManager(): Phaser.Scenes.SceneManager {
    return this.game.scene;
  }

  /**
   * Get the currently active scene
   */
  getCurrentScene(): Phaser.Scene | null {
    if (!this.currentSceneKey) return null;
    return this.getPhaserSceneManager().getScene(this.currentSceneKey);
  }

  /**
   * Get the current scene key
   */
  getCurrentSceneKey(): SceneKey | null {
    return this.currentSceneKey;
  }

  /**
   * Switch to a new scene with optional transition effects
   */
  switchTo(targetScene: SceneKey, options: SceneTransitionOptions = {}): void {
    const {
      duration = 500,
      fadeOut = true,
      fadeIn = true,
      data = {},
    } = options;

    const currentScene = this.getCurrentScene();

    // Add to history
    if (this.currentSceneKey) {
      this.addToHistory(this.currentSceneKey);
    }

    // Handle transition with fade effects
    if (currentScene && fadeOut) {
      currentScene.cameras.main.fadeOut(duration, 0, 0, 0);

      currentScene.cameras.main.once('camerafadeoutcomplete', () => {
        this.performSceneSwitch(targetScene, data, fadeIn, duration);
      });
    } else {
      this.performSceneSwitch(targetScene, data, fadeIn, duration);
    }
  }

  /**
   * Perform the actual scene switch
   */
  private performSceneSwitch(
    targetScene: SceneKey,
    data: object,
    fadeIn: boolean,
    duration: number
  ): void {
    // Stop current scene if exists
    if (this.currentSceneKey) {
      this.getPhaserSceneManager().stop(this.currentSceneKey);
    }

    // Start new scene with data
    this.getPhaserSceneManager().start(targetScene, data);
    this.currentSceneKey = targetScene;

    // Apply fade in if requested
    if (fadeIn) {
      const newScene = this.getPhaserSceneManager().getScene(targetScene);
      if (newScene) {
        // Wait for scene to be ready before fading in
        newScene.events.once('ready', () => {
          newScene.cameras.main.fadeIn(duration, 0, 0, 0);
        });
      }
    }
  }

  /**
   * Pause current scene and overlay another scene
   * Used for menus, dialogs, etc.
   */
  pauseAndOverlay(overlayScene: SceneKey, data: object = {}): void {
    const phaserManager = this.getPhaserSceneManager();

    if (this.currentSceneKey) {
      phaserManager.pause(this.currentSceneKey);
    }

    // Use 'run' to launch overlay scene in parallel
    phaserManager.run(overlayScene, { data });
  }

  /**
   * Resume the paused scene and close overlay
   */
  resumeFromOverlay(overlayScene: SceneKey): void {
    const phaserManager = this.getPhaserSceneManager();

    phaserManager.stop(overlayScene);

    if (this.currentSceneKey) {
      phaserManager.resume(this.currentSceneKey);
    }
  }

  /**
   * Go back to the previous scene
   */
  goBack(options: SceneTransitionOptions = {}): void {
    const previousScene = this.sceneHistory.pop();
    if (previousScene) {
      this.switchTo(previousScene, { ...options, data: {} });
    }
  }

  /**
   * Check if there's a previous scene in history
   */
  canGoBack(): boolean {
    return this.sceneHistory.length > 0;
  }

  /**
   * Add scene to history
   */
  private addToHistory(sceneKey: SceneKey): void {
    this.sceneHistory.push(sceneKey);

    // Limit history length
    if (this.sceneHistory.length > this.maxHistoryLength) {
      this.sceneHistory.shift();
    }
  }

  /**
   * Get scene history
   */
  getHistory(): SceneKey[] {
    return [...this.sceneHistory];
  }

  /**
   * Clear scene history
   */
  clearHistory(): void {
    this.sceneHistory = [];
  }

  /**
   * Sleep a scene (pause but keep in memory)
   */
  sleepScene(sceneKey: SceneKey): void {
    this.getPhaserSceneManager().sleep(sceneKey);
  }

  /**
   * Wake a sleeping scene
   */
  wakeScene(sceneKey: SceneKey, data: object = {}): void {
    this.getPhaserSceneManager().wake(sceneKey, data);
    this.currentSceneKey = sceneKey;
  }

  /**
   * Check if a scene is active
   */
  isSceneActive(sceneKey: SceneKey): boolean {
    const scene = this.getPhaserSceneManager().getScene(sceneKey);
    return scene ? scene.scene.isActive() : false;
  }

  /**
   * Check if a scene is sleeping
   */
  isSceneSleeping(sceneKey: SceneKey): boolean {
    const scene = this.getPhaserSceneManager().getScene(sceneKey);
    return scene ? scene.scene.isSleeping() : false;
  }

  /**
   * Bring a scene to top (for layered scenes)
   */
  bringToTop(sceneKey: SceneKey): void {
    this.getPhaserSceneManager().bringToTop(sceneKey);
  }
}