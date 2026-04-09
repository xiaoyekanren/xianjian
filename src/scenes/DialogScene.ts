/**
 * Dialog Scene - Displays dialogue interface for NPC interactions
 * US-005: 对话系统实现
 * US-009: 李逍遥角色实现 - Portrait integration
 */

import Phaser from 'phaser';
import {
  DialogLine,
  DialogChoice,
  DialogState,
  DialogEvent,
  DialogEventType,
  Expression,
  DialogManager,
} from '@/data/DialogData';

/**
 * Dialog scene configuration passed from WorldScene
 */
export interface DialogSceneConfig {
  dialogId: string;
  npcName?: string;
  npcSpriteKey?: string;
}

/**
 * Event emitted when dialog ends
 */
export interface DialogEndEvent {
  lastEvent?: DialogEvent;
  completed: boolean;
}

/**
 * Dialog Scene class
 * Displays dialog interface with speaker info, choices, and handles events
 */
export class DialogScene extends Phaser.Scene {
  private dialogManager: DialogManager;
  private currentState: DialogState | null = null;
  private dialogBox: Phaser.GameObjects.Graphics | null = null;
  private nameText: Phaser.GameObjects.Text | null = null;
  private contentText: Phaser.GameObjects.Text | null = null;
  private avatarContainer: Phaser.GameObjects.Container | null = null;
  private choiceContainer: Phaser.GameObjects.Container | null = null;
  private choiceButtons: Phaser.GameObjects.Text[] = [];
  private selectedChoiceIndex: number = 0;
  private expressionIndicator: Phaser.GameObjects.Text | null = null;
  private eventQueue: DialogEvent[] = [];
  private lastEvent: DialogEvent | null = null;
  private typewriterText: string = '';
  private typewriterIndex: number = 0;
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;
  private promptText: Phaser.GameObjects.Text | null = null;

  // UI constants
  private readonly DIALOG_BOX_HEIGHT = 280;
  private readonly DIALOG_BOX_Y_RATIO = 0.7;
  private readonly AVATAR_SIZE = 150;
  private readonly CHOICE_BUTTON_HEIGHT = 40;

  constructor() {
    super({ key: 'DialogScene' });
    this.dialogManager = new DialogManager();
  }

  init(config: DialogSceneConfig): void {
    // Reset state
    this.currentState = null;
    this.eventQueue = [];
    this.lastEvent = null;
    this.selectedChoiceIndex = 0;
    this.typewriterText = '';
    this.typewriterIndex = 0;

    // Load the dialog sequence
    const dialog = this.dialogManager.getDialog(config.dialogId);
    if (dialog) {
      this.currentState = {
        currentSequence: dialog,
        currentLineIndex: 0,
        isPlaying: true,
        isWaitingForChoice: false,
        isWaitingForInput: false,
        selectedChoiceIndex: 0,
      };
    }
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#00000088');

    // Create dialog box UI
    this.createDialogBox();

    // Create avatar placeholder
    this.createAvatarContainer();

    // Setup input handling
    this.setupInput();

    // Show first line
    if (this.currentState) {
      this.showCurrentLine();
    }

    // Fade in
    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  /**
   * Create the main dialog box UI
   */
  private createDialogBox(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dialog box background
    this.dialogBox = this.add.graphics();

    // Background with gradient effect
    const boxY = height * this.DIALOG_BOX_Y_RATIO;
    const boxHeight = this.DIALOG_BOX_HEIGHT;

    // Draw background
    this.dialogBox.fillStyle(0x1a1a2e, 0.95);
    this.dialogBox.fillRect(
      0,
      boxY,
      width,
      boxHeight
    );

    // Draw border (Chinese style)
    this.dialogBox.lineStyle(3, 0xD4A84B); // Gold border
    this.dialogBox.strokeRect(
      10,
      boxY + 10,
      width - 20,
      boxHeight - 20
    );

    // Draw corner decorations
    this.drawCornerDecorations(boxY, width, boxHeight);

    this.dialogBox.setDepth(100);

    // Name text (above dialog box)
    this.nameText = this.add.text(
      50,
      boxY + 25,
      '',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#D4A84B',
        fontStyle: 'bold',
      }
    );
    this.nameText.setDepth(101);

    // Content text (dialog message)
    this.contentText = this.add.text(
      50,
      boxY + 60,
      '',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#FFFFFF',
        wordWrap: { width: width - 250 },
        lineSpacing: 8,
      }
    );
    this.contentText.setDepth(101);

    // Prompt text (press to continue)
    this.promptText = this.add.text(
      width - 180,
      boxY + boxHeight - 50,
      '按 Enter 继续',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#888888',
      }
    );
    this.promptText.setDepth(101);
    this.promptText.setOrigin(0.5, 0.5);

    // Animate prompt text (blink effect)
    this.tweens.add({
      targets: this.promptText,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Draw Chinese-style corner decorations
   */
  private drawCornerDecorations(boxY: number, width: number, boxHeight: number): void {
    if (!this.dialogBox) return;

    // Corner decoration size
    const cornerSize = 30;

    // Top-left corner
    this.dialogBox.fillStyle(0xD4A84B);
    this.dialogBox.fillRect(10, boxY + 10, cornerSize, 3);
    this.dialogBox.fillRect(10, boxY + 10, 3, cornerSize);

    // Top-right corner
    this.dialogBox.fillRect(width - 10 - cornerSize, boxY + 10, cornerSize, 3);
    this.dialogBox.fillRect(width - 13, boxY + 10, 3, cornerSize);

    // Bottom-left corner
    this.dialogBox.fillRect(10, boxY + boxHeight - 13, cornerSize, 3);
    this.dialogBox.fillRect(10, boxY + boxHeight - 10 - cornerSize, 3, cornerSize);

    // Bottom-right corner
    this.dialogBox.fillRect(width - 10 - cornerSize, boxY + boxHeight - 13, cornerSize, 3);
    this.dialogBox.fillRect(width - 13, boxY + boxHeight - 10 - cornerSize, 3, cornerSize);
  }

  /**
   * Create avatar container for portrait display
   */
  private createAvatarContainer(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const boxY = height * this.DIALOG_BOX_Y_RATIO;

    // Avatar container (right side of dialog box)
    this.avatarContainer = this.add.container(width - 80, boxY + 50);
    this.avatarContainer.setDepth(101);

    // Create placeholder avatar
    this.createPlaceholderAvatar();
  }

  /**
   * Create placeholder avatar with expression indicator
   */
  private createPlaceholderAvatar(): void {
    if (!this.avatarContainer) return;

    // Clear existing avatar elements
    this.avatarContainer.removeAll(true);

    // Avatar background circle
    const avatarBg = this.add.graphics();
    avatarBg.fillStyle(0x333344, 1);
    avatarBg.fillCircle(0, 0, this.AVATAR_SIZE / 2);
    avatarBg.lineStyle(2, 0xD4A84B);
    avatarBg.strokeCircle(0, 0, this.AVATAR_SIZE / 2);
    this.avatarContainer.add(avatarBg);

    // Avatar placeholder (colored based on speaker)
    const avatarPlaceholder = this.add.graphics();
    avatarPlaceholder.fillStyle(0x66aa88); // Default NPC color
    avatarPlaceholder.fillCircle(0, 0, this.AVATAR_SIZE / 2 - 5);
    this.avatarContainer.add(avatarPlaceholder);

    // Expression indicator text
    this.expressionIndicator = this.add.text(
      0,
      50,
      '',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#D4A84B',
        backgroundColor: '#1a1a2e',
        padding: { x: 4, y: 2 },
      }
    );
    this.expressionIndicator.setOrigin(0.5, 0.5);
    this.expressionIndicator.setVisible(false);
    this.avatarContainer.add(this.expressionIndicator);
  }

  /**
   * Update avatar based on speaker and expression
   * US-009: Uses portrait textures when available
   */
  private updateAvatar(speakerId: string, expression?: Expression): void {
    if (!this.avatarContainer) return;

    // Clear existing avatar elements
    this.avatarContainer.removeAll(true);

    // Try to use proper portrait texture
    const portraitKey = `portrait_${speakerId}_${expression || Expression.NORMAL}`;
    const defaultPortraitKey = `portrait_${speakerId}`;

    if (this.textures.exists(portraitKey)) {
      // Use expression-specific portrait
      const portrait = this.add.image(0, 0, portraitKey);
      portrait.setDisplaySize(this.AVATAR_SIZE, this.AVATAR_SIZE);
      this.avatarContainer.add(portrait);
    } else if (this.textures.exists(defaultPortraitKey)) {
      // Use default portrait
      const portrait = this.add.image(0, 0, defaultPortraitKey);
      portrait.setDisplaySize(this.AVATAR_SIZE, this.AVATAR_SIZE);
      this.avatarContainer.add(portrait);
    } else {
      // Fallback to placeholder colored circle (for NPCs without portraits)
      this.createFallbackAvatar(speakerId);
    }

    // Add expression indicator text (for non-normal expressions)
    if (expression && expression !== Expression.NORMAL) {
      this.expressionIndicator = this.add.text(
        0,
        50,
        this.getExpressionText(expression),
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#D4A84B',
          backgroundColor: '#1a1a2e',
          padding: { x: 4, y: 2 },
        }
      );
      this.expressionIndicator.setOrigin(0.5, 0.5);
      this.expressionIndicator.setVisible(true);
      if (this.avatarContainer) {
        this.avatarContainer.add(this.expressionIndicator);
      }
    }
  }

  /**
   * Create fallback avatar for speakers without proper portraits
   */
  private createFallbackAvatar(speakerId: string): void {
    if (!this.avatarContainer) return;

    // Different colors for different speaker types
    let avatarColor = 0x66aa88; // Default green (NPC)

    if (speakerId.startsWith('player') || speakerId === 'li_xiaoyao') {
      avatarColor = 0x4488ff; // Blue for player
    } else if (speakerId.startsWith('npc_elder')) {
      avatarColor = 0x888888; // Gray for elder
    } else if (speakerId.startsWith('npc_villager')) {
      avatarColor = 0x88cc66; // Light green for villagers
    }

    // Avatar background circle
    const avatarBg = this.add.graphics();
    avatarBg.fillStyle(0x333344, 1);
    avatarBg.fillCircle(0, 0, this.AVATAR_SIZE / 2);
    avatarBg.lineStyle(2, 0xD4A84B);
    avatarBg.strokeCircle(0, 0, this.AVATAR_SIZE / 2);
    this.avatarContainer.add(avatarBg);

    // Avatar placeholder
    const avatarPlaceholder = this.add.graphics();
    avatarPlaceholder.fillStyle(avatarColor);
    avatarPlaceholder.fillCircle(0, 0, this.AVATAR_SIZE / 2 - 5);
    this.avatarContainer.add(avatarPlaceholder);
  }

  /**
   * Get Chinese text for expression
   */
  private getExpressionText(expression: Expression): string {
    switch (expression) {
      case Expression.HAPPY: return '开心';
      case Expression.SAD: return '伤心';
      case Expression.ANGRY: return '生气';
      case Expression.SURPRISED: return '惊讶';
      case Expression.THINKING: return '思考';
      case Expression.SHY: return '害羞';
      default: return '';
    }
  }

  /**
   * Setup input handling
   */
  private setupInput(): void {
    // Enter/Space to advance dialog
    this.input.keyboard!.on('keydown-ENTER', () => this.handleAdvance());
    this.input.keyboard!.on('keydown-SPACE', () => this.handleAdvance());

    // Arrow keys for choice selection
    this.input.keyboard!.on('keydown-UP', () => this.handleChoiceNavigation(-1));
    this.input.keyboard!.on('keydown-DOWN', () => this.handleChoiceNavigation(1));
    this.input.keyboard!.on('keydown-W', () => this.handleChoiceNavigation(-1));
    this.input.keyboard!.on('keydown-S', () => this.handleChoiceNavigation(1));
  }

  /**
   * Handle dialog advancement
   */
  private handleAdvance(): void {
    if (!this.currentState) return;

    if (this.currentState.isWaitingForChoice) {
      // Confirm choice selection
      this.confirmChoice();
    } else if (this.currentState.isWaitingForInput) {
      // Stop typewriter and show full text if still typing
      if (this.typewriterTimer && this.typewriterIndex < this.typewriterText.length) {
        this.completeTypewriter();
      } else {
        // Advance to next line or end dialog
        this.advanceDialog();
      }
    }
  }

  /**
   * Complete typewriter effect immediately
   */
  private completeTypewriter(): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = null;
    }

    if (this.contentText) {
      this.contentText.setText(this.typewriterText);
    }
    this.typewriterIndex = this.typewriterText.length;
    this.currentState!.isWaitingForInput = true;
  }

  /**
   * Handle choice navigation with arrow keys
   */
  private handleChoiceNavigation(direction: number): void {
    if (!this.currentState || !this.currentState.isWaitingForChoice) return;

    const currentLine = this.getCurrentLine();
    if (!currentLine || !currentLine.choices) return;

    const numChoices = currentLine.choices.length;
    this.selectedChoiceIndex = Math.max(0, Math.min(numChoices - 1, this.selectedChoiceIndex + direction));

    this.updateChoiceSelection();
  }

  /**
   * Show the current dialog line
   */
  private showCurrentLine(): void {
    const line = this.getCurrentLine();
    if (!line) {
      this.endDialog();
      return;
    }

    // Update name
    if (this.nameText) {
      this.nameText.setText(line.speakerName);
    }

    // Update avatar
    this.updateAvatar(line.speakerId, line.expression);

    // Start typewriter effect for content
    this.startTypewriter(line.text);

    // Update prompt text
    if (this.promptText) {
      if (line.choices && line.choices.length > 0) {
        this.promptText.setText('↑↓ 选择  Enter 确认');
      } else {
        this.promptText.setText('按 Enter 继续');
      }
    }

    // Handle auto-advance
    if (line.autoAdvance && line.delay) {
      this.time.delayedCall(line.delay, () => {
        if (this.currentState && !this.currentState.isWaitingForChoice) {
          this.advanceDialog();
        }
      });
    }
  }

  /**
   * Get current dialog line
   */
  private getCurrentLine(): DialogLine | null {
    if (!this.currentState) return null;

    const sequence = this.currentState.currentSequence;
    const index = this.currentState.currentLineIndex;

    if (index >= sequence.lines.length) return null;
    return sequence.lines[index];
  }

  /**
   * Start typewriter effect for dialog text
   */
  private startTypewriter(text: string): void {
    this.typewriterText = text;
    this.typewriterIndex = 0;
    this.currentState!.isWaitingForInput = true;

    if (this.contentText) {
      this.contentText.setText('');
    }

    // Create typewriter timer
    this.typewriterTimer = this.time.addEvent({
      delay: 30, // 30ms per character
      callback: () => {
        if (this.typewriterIndex < text.length) {
          this.typewriterIndex++;
          if (this.contentText) {
            this.contentText.setText(text.substring(0, this.typewriterIndex));
          }
        } else {
          // Typewriter complete
          this.typewriterTimer?.destroy();
          this.typewriterTimer = null;
        }
      },
      repeat: text.length - 1,
    });
  }

  /**
   * Advance to next dialog line
   */
  private advanceDialog(): void {
    if (!this.currentState) return;

    const currentLine = this.getCurrentLine();
    if (!currentLine) {
      this.endDialog();
      return;
    }

    // Check for choices
    if (currentLine.choices && currentLine.choices.length > 0) {
      this.showChoices(currentLine.choices);
      return;
    }

    // Check for event on this line
    if (currentLine.event) {
      this.queueEvent(currentLine.event);
    }

    // Check for next dialog ID (branching)
    if (currentLine.nextDialogId) {
      const nextDialog = this.dialogManager.getDialog(currentLine.nextDialogId);
      if (nextDialog) {
        this.currentState.currentSequence = nextDialog;
        this.currentState.currentLineIndex = 0;
        this.showCurrentLine();
        return;
      }
    }

    // Advance to next line in sequence
    this.currentState.currentLineIndex++;

    if (this.currentState.currentLineIndex >= this.currentState.currentSequence.lines.length) {
      this.endDialog();
    } else {
      this.showCurrentLine();
    }
  }

  /**
   * Show player choices
   */
  private showChoices(choices: DialogChoice[]): void {
    this.currentState!.isWaitingForChoice = true;
    this.selectedChoiceIndex = 0;

    // Hide prompt text temporarily
    if (this.promptText) {
      this.promptText.setVisible(false);
    }

    // Create choice container
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const boxY = height * this.DIALOG_BOX_Y_RATIO;

    // Clear existing choices
    this.clearChoices();

    // Create choice container
    this.choiceContainer = this.add.container(50, boxY + 150);
    this.choiceContainer.setDepth(102);

    // Create choice buttons
    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];

      // Choice background
      const choiceBg = this.add.graphics();
      choiceBg.fillStyle(0x2a2a4e, 0.9);
      choiceBg.fillRect(0, i * this.CHOICE_BUTTON_HEIGHT + 5, width - 150, this.CHOICE_BUTTON_HEIGHT - 10);
      choiceBg.lineStyle(1, 0x666688);
      choiceBg.strokeRect(0, i * this.CHOICE_BUTTON_HEIGHT + 5, width - 150, this.CHOICE_BUTTON_HEIGHT - 10);
      this.choiceContainer.add(choiceBg);

      // Choice text
      const choiceText = this.add.text(
        15,
        i * this.CHOICE_BUTTON_HEIGHT + this.CHOICE_BUTTON_HEIGHT / 2,
        choice.text,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          color: '#FFFFFF',
        }
      );
      choiceText.setOrigin(0, 0.5);
      this.choiceContainer.add(choiceText);
      this.choiceButtons.push(choiceText);

      // Make choice interactive
      choiceBg.setInteractive({ useHandCursor: true });
      choiceBg.on('pointerover', () => {
        this.selectedChoiceIndex = i;
        this.updateChoiceSelection();
      });
      choiceBg.on('pointerdown', () => {
        this.confirmChoice();
      });
    }

    // Highlight first choice
    this.updateChoiceSelection();
  }

  /**
   * Update choice selection visual
   */
  private updateChoiceSelection(): void {
    if (!this.choiceContainer) return;

    // Update choice button colors
    for (let i = 0; i < this.choiceButtons.length; i++) {
      const button = this.choiceButtons[i];
      if (i === this.selectedChoiceIndex) {
        button.setColor('#D4A84B'); // Gold for selected
      } else {
        button.setColor('#FFFFFF'); // White for others
      }
    }
  }

  /**
   * Clear choice container
   */
  private clearChoices(): void {
    if (this.choiceContainer) {
      this.choiceContainer.destroy();
      this.choiceContainer = null;
    }
    this.choiceButtons = [];
  }

  /**
   * Confirm player choice
   */
  private confirmChoice(): void {
    if (!this.currentState || !this.currentState.isWaitingForChoice) return;

    const currentLine = this.getCurrentLine();
    if (!currentLine || !currentLine.choices) return;

    const selectedChoice = currentLine.choices[this.selectedChoiceIndex];

    // Queue event if choice has one
    if (selectedChoice.event) {
      this.queueEvent(selectedChoice.event);
    }

    // Clear choices
    this.clearChoices();

    // Show prompt text again
    if (this.promptText) {
      this.promptText.setVisible(true);
    }

    // Handle branching dialog
    if (selectedChoice.nextDialogId) {
      const nextDialog = this.dialogManager.getDialog(selectedChoice.nextDialogId);
      if (nextDialog) {
        this.currentState.currentSequence = nextDialog;
        this.currentState.currentLineIndex = 0;
        this.currentState.isWaitingForChoice = false;
        this.showCurrentLine();
        return;
      }
    }

    // No more dialog, end conversation
    this.currentState.isWaitingForChoice = false;
    this.endDialog();
  }

  /**
   * Queue an event for processing at dialog end
   */
  private queueEvent(event: DialogEvent): void {
    this.eventQueue.push(event);
  }

  /**
   * Process queued events
   */
  private processEvents(): DialogEvent | null {
    if (this.eventQueue.length === 0) return null;

    const lastEvent = this.eventQueue[this.eventQueue.length - 1];

    // Process events (in actual game, these would trigger real actions)
    for (const event of this.eventQueue) {
      switch (event.type) {
        case DialogEventType.GET_ITEM:
          // In full implementation: add item to inventory
          console.log(`[Dialog Event] Player received item: ${event.data?.itemId} (${event.data?.quantity || 1})`);
          this.dialogManager.setFlag('last_received_item', event.data?.itemId || '');
          break;

        case DialogEventType.SET_FLAG:
          // Set story flag
          if (event.data?.flagName) {
            this.dialogManager.setFlag(
              event.data.flagName,
              event.data.flagValue ?? true
            );
            console.log(`[Dialog Event] Set flag: ${event.data.flagName} = ${event.data.flagValue}`);
          }
          break;

        case DialogEventType.START_BATTLE:
          // In full implementation: start battle scene
          console.log(`[Dialog Event] Starting battle: ${event.data?.battleId}`);
          break;

        case DialogEventType.CHANGE_MAP:
          // In full implementation: transition to new map
          console.log(`[Dialog Event] Map change: ${event.data?.mapId}`);
          break;

        case DialogEventType.ADD_PARTY_MEMBER:
          // In full implementation: add character to party
          console.log(`[Dialog Event] Add party member: ${event.data?.characterId}`);
          break;

        case DialogEventType.HEAL:
          // In full implementation: heal party
          console.log(`[Dialog Event] Heal party: ${event.data?.healAmount}`);
          break;
      }
    }

    return lastEvent;
  }

  /**
   * End the dialog and return to WorldScene
   */
  private endDialog(): void {
    if (!this.currentState) return;

    this.currentState.isPlaying = false;

    // Process queued events
    this.lastEvent = this.processEvents();

    // Fade out
    this.cameras.main.fadeOut(200, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Emit end event to WorldScene
      const endEvent: DialogEndEvent = {
        lastEvent: this.lastEvent ?? undefined,
        completed: true,
      };

      // Resume WorldScene with event data
      this.scene.stop();
      this.scene.resume('WorldScene', endEvent);
    });
  }

  /**
   * Cleanup scene
   */
  shutdown(): void {
    // Stop typewriter timer
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = null;
    }

    // Clear choices
    this.clearChoices();

    // Remove keyboard listeners
    this.input.keyboard!.off('keydown-ENTER');
    this.input.keyboard!.off('keydown-SPACE');
    this.input.keyboard!.off('keydown-UP');
    this.input.keyboard!.off('keydown-DOWN');
    this.input.keyboard!.off('keydown-W');
    this.input.keyboard!.off('keydown-S');
  }

  /**
   * Get the dialog manager (for other scenes to access)
   */
  getDialogManager(): DialogManager {
    return this.dialogManager;
  }
}