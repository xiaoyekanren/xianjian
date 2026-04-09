/**
 * Input Manager - Handles keyboard and touch input
 * US-002: 键盘/触屏输入处理
 */

import Phaser from 'phaser';

/**
 * Input action types
 */
export type InputAction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'confirm'
  | 'cancel'
  | 'menu'
  | 'pause'
  | 'action';

/**
 * Key binding configuration
 */
export interface KeyBinding {
  key: string;
  action: InputAction;
}

/**
 * Default key bindings for the game
 */
const DEFAULT_KEY_BINDINGS: KeyBinding[] = [
  { key: 'UP', action: 'up' },
  { key: 'W', action: 'up' },
  { key: 'DOWN', action: 'down' },
  { key: 'S', action: 'down' },
  { key: 'LEFT', action: 'left' },
  { key: 'A', action: 'left' },
  { key: 'RIGHT', action: 'right' },
  { key: 'D', action: 'right' },
  { key: 'ENTER', action: 'confirm' },
  { key: 'SPACE', action: 'confirm' },
  { key: 'Z', action: 'confirm' },
  { key: 'ESC', action: 'cancel' },
  { key: 'X', action: 'cancel' },
  { key: 'M', action: 'menu' },
  { key: 'P', action: 'pause' },
  { key: 'C', action: 'action' },
];

/**
 * Input callback function type
 */
export type InputCallback = (action: InputAction, isDown: boolean) => void;

/**
 * Input Manager class
 * Handles unified keyboard and touch input for the game
 */
export class InputManager {
  private keyBindings: KeyBinding[];
  private actionCallbacks: Map<InputAction, InputCallback[]>;
  private keyStates: Map<string, boolean>;
  private enabled: boolean = true;

  // Touch gesture tracking
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchThreshold: number = 30;
  private touchEnabled: boolean = true;

  constructor() {
    this.keyBindings = [...DEFAULT_KEY_BINDINGS];
    this.actionCallbacks = new Map();
    this.keyStates = new Map();
  }

  /**
   * Initialize input listeners for a specific scene
   */
  initializeForScene(scene: Phaser.Scene): void {
    this.setupKeyboardInput(scene);
    this.setupTouchInput(scene);
  }

  /**
   * Setup keyboard input handling
   */
  private setupKeyboardInput(scene: Phaser.Scene): void {
    if (!scene.input.keyboard) return;

    const keyboard = scene.input.keyboard;

    // Setup key listeners for each binding
    for (const binding of this.keyBindings) {
      const keyObj = keyboard.addKey(binding.key);

      // Track key down
      keyObj.on('down', () => {
        if (!this.enabled) return;
        this.keyStates.set(binding.key, true);
        this.dispatchAction(binding.action, true);
      });

      // Track key up
      keyObj.on('up', () => {
        if (!this.enabled) return;
        this.keyStates.set(binding.key, false);
        this.dispatchAction(binding.action, false);
      });
    }
  }

  /**
   * Setup touch input handling using pointer events
   */
  private setupTouchInput(scene: Phaser.Scene): void {
    // Use pointer events for touch handling
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.enabled || !this.touchEnabled) return;
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
    });

    // Touch end - detect swipe gestures
    scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.enabled || !this.touchEnabled) return;

      const deltaX = pointer.x - this.touchStartX;
      const deltaY = pointer.y - this.touchStartY;

      // Check for swipe gestures
      if (Math.abs(deltaX) > this.touchThreshold || Math.abs(deltaY) > this.touchThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            this.dispatchAction('right', true);
            setTimeout(() => this.dispatchAction('right', false), 100);
          } else {
            this.dispatchAction('left', true);
            setTimeout(() => this.dispatchAction('left', false), 100);
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            this.dispatchAction('down', true);
            setTimeout(() => this.dispatchAction('down', false), 100);
          } else {
            this.dispatchAction('up', true);
            setTimeout(() => this.dispatchAction('up', false), 100);
          }
        }
      } else {
        // Tap gesture - treat as confirm
        this.dispatchAction('confirm', true);
        setTimeout(() => this.dispatchAction('confirm', false), 100);
      }
    });
  }

  /**
   * Register a callback for a specific input action
   */
  onAction(action: InputAction, callback: InputCallback): void {
    const callbacks = this.actionCallbacks.get(action) || [];
    callbacks.push(callback);
    this.actionCallbacks.set(action, callbacks);
  }

  /**
   * Remove a callback for a specific input action
   */
  offAction(action: InputAction, callback: InputCallback): void {
    const callbacks = this.actionCallbacks.get(action) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.actionCallbacks.set(action, callbacks);
    }
  }

  /**
   * Dispatch an action to all registered callbacks
   */
  private dispatchAction(action: InputAction, isDown: boolean): void {
    const callbacks = this.actionCallbacks.get(action) || [];
    for (const callback of callbacks) {
      callback(action, isDown);
    }
  }

  /**
   * Check if a specific key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keyStates.get(key) || false;
  }

  /**
   * Check if an action is currently active
   */
  isActionActive(action: InputAction): boolean {
    // Find all keys mapped to this action
    for (const binding of this.keyBindings) {
      if (binding.action === action && this.keyStates.get(binding.key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Enable/disable input handling
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if input is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable/disable touch input
   */
  setTouchEnabled(enabled: boolean): void {
    this.touchEnabled = enabled;
  }

  /**
   * Set custom key bindings
   */
  setKeyBindings(bindings: KeyBinding[]): void {
    this.keyBindings = bindings;
  }

  /**
   * Get current key bindings
   */
  getKeyBindings(): KeyBinding[] {
    return [...this.keyBindings];
  }

  /**
   * Add a new key binding
   */
  addKeyBinding(binding: KeyBinding): void {
    this.keyBindings.push(binding);
  }

  /**
   * Remove a key binding
   */
  removeKeyBinding(key: string): void {
    this.keyBindings = this.keyBindings.filter(b => b.key !== key);
  }

  /**
   * Set touch threshold for gesture detection
   */
  setTouchThreshold(threshold: number): void {
    this.touchThreshold = threshold;
  }

  /**
   * Cleanup input manager
   */
  cleanup(): void {
    this.actionCallbacks.clear();
    this.keyStates.clear();
    this.enabled = false;
  }

  /**
   * Get all actions that are currently active
   */
  getActiveActions(): InputAction[] {
    const activeActions: InputAction[] = [];
    for (const binding of this.keyBindings) {
      if (this.keyStates.get(binding.key)) {
        activeActions.push(binding.action);
      }
    }
    return activeActions;
  }
}