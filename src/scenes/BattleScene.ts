/**
 * Battle Scene - Turn-based combat interface
 * US-006: 回合制战斗系统实现
 */

import Phaser from 'phaser';
import {
  BattleSystem,
  BattleConfig,
  BattleUnit,
  ActionType,
  StatusType,
} from '@/systems/BattleSystem';
import { Skill } from '@/data/Skill';

/**
 * Battle state enum
 */
enum BattleState {
  INIT = 'init',
  TURN_START = 'turn_start',
  PLAYER_SELECT_ACTION = 'player_select_action',
  PLAYER_SELECT_TARGET = 'player_select_target',
  PLAYER_SELECT_SKILL = 'player_select_skill',
  EXECUTE_ACTION = 'execute_action',
  ENEMY_TURN = 'enemy_turn',
  ROUND_END = 'round_end',
  BATTLE_END = 'battle_end',
}

/**
 * Selected action data
 */
interface SelectedAction {
  type: ActionType;
  skill?: Skill;
  itemId?: string;
}

/**
 * Battle Scene class
 * Displays turn-based battle interface with player party and enemies
 */
export class BattleScene extends Phaser.Scene {
  private battleSystem: BattleSystem;
  private battleState: BattleState = BattleState.INIT;
  private currentUnit: BattleUnit | null = null;
  private selectedAction: SelectedAction | null = null;
  private selectedTargets: string[] = [];
  private playerParty: BattleUnit[] = [];
  private enemies: BattleUnit[] = [];
  private actionIndex: number = 0;
  private skillIndex: number = 0;
  private targetIndex: number = 0;

  // UI elements
  private background: Phaser.GameObjects.Graphics | null = null;
  private unitSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private hpBars: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private mpBars: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private actionMenu: Phaser.GameObjects.Container | null = null;
  private actionButtons: Phaser.GameObjects.Text[] = [];
  private skillMenu: Phaser.GameObjects.Container | null = null;
  private skillButtons: Phaser.GameObjects.Text[] = [];
  private targetIndicator: Phaser.GameObjects.Graphics | null = null;
  private messageBox: Phaser.GameObjects.Container | null = null;
  private messageText: Phaser.GameObjects.Text | null = null;
  private turnOrderDisplay: Phaser.GameObjects.Container | null = null;

  // Cursors and input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  // Constants
  private readonly UNIT_WIDTH = 100;
  private readonly UNIT_HEIGHT = 120;
  private readonly BAR_WIDTH = 80;
  private readonly BAR_HEIGHT = 8;
  private readonly MESSAGE_BOX_HEIGHT = 150;

  // Demo data for testing
  private demoSkills: Skill[] = [
    { id: 'skill_sword', name: '御剑术', mpCost: 5, power: 30, element: 'physical', targetType: 'single' },
    { id: 'skill_fire', name: '火咒', mpCost: 10, power: 50, element: 'fire', targetType: 'single' },
    { id: 'skill_heal', name: '五气朝元', mpCost: 15, power: 40, element: 'healing', targetType: 'self' },
  ];

  constructor() {
    super({ key: 'BattleScene' });
    this.battleSystem = new BattleSystem();
  }

  init(config: BattleConfig): void {
    // Reset state
    this.battleState = BattleState.INIT;
    this.currentUnit = null;
    this.selectedAction = null;
    this.selectedTargets = [];
    this.actionIndex = 0;
    this.skillIndex = 0;
    this.targetIndex = 0;
    this.unitSprites.clear();
    this.hpBars.clear();
    this.mpBars.clear();

    // Initialize battle system
    this.battleSystem.initialize(config);

    // Store unit references
    this.playerParty = this.battleSystem.getAlivePlayerUnits();
    this.enemies = this.battleSystem.getAliveEnemyUnits();
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Create background
    this.createBackground();

    // Create unit displays
    this.createUnitDisplays();

    // Create UI elements
    this.createActionMenu();
    this.createSkillMenu();
    this.createMessageBox();
    this.createTurnOrderDisplay();

    // Setup input
    this.setupInput();

    // Start battle
    this.startBattle();

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  /**
   * Create battle background with Chinese-style decorations
   */
  private createBackground(): void {
    this.background = this.add.graphics();

    // Draw gradient background
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dark purple gradient
    this.background.fillStyle(0x1a1a2e, 1);
    this.background.fillRect(0, 0, width, height);

    // Add decorative border
    this.background.lineStyle(4, 0xD4A84B);
    this.background.strokeRect(20, 20, width - 40, height - 40);

    // Corner decorations
    const cornerSize = 40;
    this.background.fillStyle(0xD4A84B);

    // Top corners
    this.background.fillRect(20, 20, cornerSize, 4);
    this.background.fillRect(20, 20, 4, cornerSize);
    this.background.fillRect(width - 20 - cornerSize, 20, cornerSize, 4);
    this.background.fillRect(width - 24, 20, 4, cornerSize);

    // Bottom corners
    this.background.fillRect(20, height - 24, cornerSize, 4);
    this.background.fillRect(20, height - 20 - cornerSize, 4, cornerSize);
    this.background.fillRect(width - 20 - cornerSize, height - 24, cornerSize, 4);
    this.background.fillRect(width - 24, height - 20 - cornerSize, 4, cornerSize);

    this.background.setDepth(0);
  }

  /**
   * Create unit displays for player party and enemies
   */
  private createUnitDisplays(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Player party position (left side, bottom)
    const playerStartX = 100;
    const playerStartY = height - 300;
    const playerSpacingX = 120;

    // Enemy position (right side, top area)
    const enemyStartX = width - 200;
    const enemyStartY = 200;
    const enemySpacingX = 120;

    // Create player units
    for (let i = 0; i < this.playerParty.length; i++) {
      const unit = this.playerParty[i];
      const x = playerStartX + i * playerSpacingX;
      const y = playerStartY;
      this.createUnitSprite(unit, x, y, true);
    }

    // Create enemy units
    for (let i = 0; i < this.enemies.length; i++) {
      const unit = this.enemies[i];
      const x = enemyStartX - i * enemySpacingX;
      const y = enemyStartY;
      this.createUnitSprite(unit, x, y, false);
    }
  }

  /**
   * Create a single unit sprite with HP/MP bars
   */
  private createUnitSprite(unit: BattleUnit, x: number, y: number, isPlayer: boolean): void {
    const container = this.add.container(x, y);
    container.setDepth(10);

    // Unit sprite placeholder (colored rectangle with name)
    const spriteColor = isPlayer ? 0x4488ff : 0xff4444;
    const sprite = this.add.graphics();
    sprite.fillStyle(spriteColor, 1);
    sprite.fillRect(-40, -50, this.UNIT_WIDTH - 20, this.UNIT_HEIGHT - 40);
    sprite.lineStyle(2, 0xD4A84B);
    sprite.strokeRect(-40, -50, this.UNIT_WIDTH - 20, this.UNIT_HEIGHT - 40);
    container.add(sprite);

    // Unit name
    const nameText = this.add.text(0, 0, unit.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#FFFFFF',
    });
    nameText.setOrigin(0.5, 0.5);
    container.add(nameText);

    // HP bar
    const hpBar = this.add.graphics();
    this.updateHpBar(hpBar, unit);
    hpBar.setPosition(-40, 60);
    container.add(hpBar);
    this.hpBars.set(unit.id, hpBar);

    // HP text
    const hpText = this.add.text(0, 65, `HP: ${unit.hp}/${unit.maxHp}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#FFFFFF',
    });
    hpText.setOrigin(0.5, 0.5);
    container.add(hpText);

    // MP bar (only for player units with MP)
    if (unit.maxMp > 0) {
      const mpBar = this.add.graphics();
      this.updateMpBar(mpBar, unit);
      mpBar.setPosition(-40, 75);
      container.add(mpBar);
      this.mpBars.set(unit.id, mpBar);

      // MP text
      const mpText = this.add.text(0, 80, `MP: ${unit.mp}/${unit.maxMp}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: '#88ccff',
      });
      mpText.setOrigin(0.5, 0.5);
      container.add(mpText);
    }

    // Status effect indicators
    if (unit.statusEffects.length > 0) {
      const statusText = this.add.text(0, -60, this.getStatusText(unit), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: '#ffaa00',
        backgroundColor: '#333333',
        padding: { x: 2, y: 1 },
      });
      statusText.setOrigin(0.5, 0.5);
      container.add(statusText);
    }

    this.unitSprites.set(unit.id, container);
  }

  /**
   * Update HP bar graphics
   */
  private updateHpBar(bar: Phaser.GameObjects.Graphics, unit: BattleUnit): void {
    bar.clear();

    // Background
    bar.fillStyle(0x333333, 1);
    bar.fillRect(0, 0, this.BAR_WIDTH, this.BAR_HEIGHT);

    // HP fill
    const hpPercent = unit.hp / unit.maxHp;
    const hpColor = hpPercent > 0.5 ? 0x44ff44 : hpPercent > 0.25 ? 0xffff44 : 0xff4444;
    bar.fillStyle(hpColor, 1);
    bar.fillRect(0, 0, this.BAR_WIDTH * hpPercent, this.BAR_HEIGHT);

    // Border
    bar.lineStyle(1, 0xffffff, 0.5);
    bar.strokeRect(0, 0, this.BAR_WIDTH, this.BAR_HEIGHT);
  }

  /**
   * Update MP bar graphics
   */
  private updateMpBar(bar: Phaser.GameObjects.Graphics, unit: BattleUnit): void {
    bar.clear();

    // Background
    bar.fillStyle(0x333333, 1);
    bar.fillRect(0, 0, this.BAR_WIDTH, this.BAR_HEIGHT);

    // MP fill
    const mpPercent = unit.mp / unit.maxMp;
    bar.fillStyle(0x4488ff, 1);
    bar.fillRect(0, 0, this.BAR_WIDTH * mpPercent, this.BAR_HEIGHT);

    // Border
    bar.lineStyle(1, 0xffffff, 0.5);
    bar.strokeRect(0, 0, this.BAR_WIDTH, this.BAR_HEIGHT);
  }

  /**
   * Get status effect display text
   */
  private getStatusText(unit: BattleUnit): string {
    const statusNames: Record<StatusType, string> = {
      [StatusType.POISON]: '毒',
      [StatusType.PARALYZE]: '晕',
      [StatusType.SLEEP]: '眠',
      [StatusType.SILENCE]: '默',
      [StatusType.PROTECT]: '护',
      [StatusType.HASTE]: '速',
      [StatusType.REGEN]: '愈',
    };

    return unit.statusEffects.map(e => statusNames[e.type]).join(' ');
  }

  /**
   * Update all unit displays
   */
  private updateUnitDisplays(): void {
    // Update HP bars
    for (const unit of this.battleSystem.getAllAliveUnits()) {
      const hpBar = this.hpBars.get(unit.id);
      if (hpBar) {
        this.updateHpBar(hpBar, unit);
      }

      const mpBar = this.mpBars.get(unit.id);
      if (mpBar) {
        this.updateMpBar(mpBar, unit);
      }
    }

    // Remove dead unit sprites with fade effect
    for (const [id, container] of this.unitSprites.entries()) {
      const unit = this.battleSystem.getUnit(id);
      if (unit && unit.hp <= 0) {
        this.tweens.add({
          targets: container,
          alpha: 0,
          scale: 0.5,
          duration: 500,
          onComplete: () => {
            container.destroy();
            this.unitSprites.delete(id);
          },
        });
      }
    }
  }

  /**
   * Create action menu (Attack, Skill, Item, Defend, Flee)
   */
  private createActionMenu(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.actionMenu = this.add.container(width / 2 - 100, height - 150);
    this.actionMenu.setDepth(50);
    this.actionMenu.setVisible(false);

    const actions = [
      { type: ActionType.ATTACK, name: '攻击', color: '#FFFFFF' },
      { type: ActionType.SKILL, name: '仙术', color: '#88ccff' },
      { type: ActionType.ITEM, name: '道具', color: '#88ff88' },
      { type: ActionType.DEFEND, name: '防御', color: '#ffff88' },
      { type: ActionType.FLEE, name: '逃跑', color: '#ff8888' },
    ];

    this.actionButtons = [];

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];

      // Button background
      const bg = this.add.graphics();
      bg.fillStyle(0x2a2a4e, 0.9);
      bg.fillRect(0, i * 35, 200, 30);
      bg.lineStyle(1, 0x666688);
      bg.strokeRect(0, i * 35, 200, 30);
      this.actionMenu.add(bg);

      // Button text
      const text = this.add.text(100, i * 35 + 15, action.name, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: action.color,
      });
      text.setOrigin(0.5, 0.5);
      this.actionMenu.add(text);
      this.actionButtons.push(text);

      // Interactive
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => {
        this.actionIndex = i;
        this.updateActionSelection();
      });
      bg.on('pointerdown', () => {
        this.confirmAction();
      });
    }
  }

  /**
   * Create skill selection menu
   */
  private createSkillMenu(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.skillMenu = this.add.container(width / 2 + 100, height - 200);
    this.skillMenu.setDepth(55);
    this.skillMenu.setVisible(false);

    // Skill menu background
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x2a2a4e, 0.95);
    menuBg.fillRect(0, 0, 250, 200);
    menuBg.lineStyle(2, 0xD4A84B);
    menuBg.strokeRect(0, 0, 250, 200);
    this.skillMenu.add(menuBg);

    // Title
    const title = this.add.text(125, 15, '选择仙术', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#D4A84B',
    });
    title.setOrigin(0.5, 0.5);
    this.skillMenu.add(title);

    this.skillButtons = [];
  }

  /**
   * Populate skill menu with available skills
   */
  private populateSkillMenu(unit: BattleUnit): void {
    if (!this.skillMenu) return;

    // Clear existing skill buttons
    for (const button of this.skillButtons) {
      button.destroy();
    }
    this.skillButtons = [];

    // Use demo skills for testing (in full implementation, use unit.skills)
    const availableSkills = this.demoSkills;

    for (let i = 0; i < availableSkills.length; i++) {
      const skill = availableSkills[i];

      // Check MP availability
      const canUse = unit.mp >= skill.mpCost;
      const color = canUse ? '#FFFFFF' : '#666666';

      // Skill text
      const text = this.add.text(20, 40 + i * 30, `${skill.name} (MP:${skill.mpCost})`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color,
      });
      this.skillMenu.add(text);
      this.skillButtons.push(text);

      // Interactive background
      const bg = this.add.graphics();
      bg.fillStyle(0x333355, 0.5);
      bg.fillRect(10, 35 + i * 30, 230, 25);
      this.skillMenu.add(bg);

      if (canUse) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => {
          this.skillIndex = i;
          this.updateSkillSelection();
        });
        bg.on('pointerdown', () => {
          this.confirmSkill();
        });
      }
    }

    this.skillIndex = 0;
    this.updateSkillSelection();
  }

  /**
   * Create message box for battle messages
   */
  private createMessageBox(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.messageBox = this.add.container(20, height - this.MESSAGE_BOX_HEIGHT - 50);
    this.messageBox.setDepth(60);

    // Message box background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRect(0, 0, width - 40, this.MESSAGE_BOX_HEIGHT);
    bg.lineStyle(2, 0xD4A84B);
    bg.strokeRect(0, 0, width - 40, this.MESSAGE_BOX_HEIGHT);
    this.messageBox.add(bg);

    // Message text
    this.messageText = this.add.text(20, 20, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
      wordWrap: { width: width - 80 },
      lineSpacing: 6,
    });
    this.messageBox.add(this.messageText);
  }

  /**
   * Create turn order display
   */
  private createTurnOrderDisplay(): void {
    const width = this.cameras.main.width;

    this.turnOrderDisplay = this.add.container(width - 150, 80);
    this.turnOrderDisplay.setDepth(70);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a4e, 0.8);
    bg.fillRect(0, 0, 130, 100);
    bg.lineStyle(1, 0x666688);
    bg.strokeRect(0, 0, 130, 100);
    this.turnOrderDisplay.add(bg);

    // Title
    const title = this.add.text(65, 10, '行动顺序', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#D4A84B',
    });
    title.setOrigin(0.5, 0.5);
    this.turnOrderDisplay.add(title);
  }

  /**
   * Update turn order display
   */
  private updateTurnOrderDisplay(): void {
    if (!this.turnOrderDisplay) return;

    // Remove old turn entries
    const children = this.turnOrderDisplay.getAll();
    for (let i = 2; i < children.length; i++) {
      children[i].destroy();
    }

    const turnOrder = this.battleSystem.getTurnOrder();

    // Display next few turns
    const displayCount = Math.min(4, turnOrder.length);
    for (let i = 0; i < displayCount; i++) {
      const entry = turnOrder[i];
      const unit = this.battleSystem.getUnit(entry.unitId);

      if (unit) {
        const color = unit.isPlayer ? '#4488ff' : '#ff4444';
        const text = this.add.text(10, 25 + i * 18, `${i + 1}. ${unit.name}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '10px',
          color,
        });
        this.turnOrderDisplay.add(text);
      }
    }
  }

  /**
   * Setup input handling
   */
  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();

    this.wasdKeys = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Enter/Space to confirm
    this.input.keyboard!.on('keydown-ENTER', () => this.handleConfirm());
    this.input.keyboard!.on('keydown-SPACE', () => this.handleConfirm());

    // Escape to cancel
    this.input.keyboard!.on('keydown-ESC', () => this.handleCancel());
  }

  /**
   * Start battle
   */
  private startBattle(): void {
    this.battleState = BattleState.TURN_START;
    this.processTurn();
  }

  /**
   * Process current turn
   */
  private processTurn(): void {
    // Check battle end
    if (this.battleSystem.isBattleEnded()) {
      this.handleBattleEnd();
      return;
    }

    // Get current turn unit
    this.currentUnit = this.battleSystem.getCurrentTurnUnit();

    if (!this.currentUnit) {
      // End of round
      this.battleState = BattleState.ROUND_END;
      this.showMessage(`第 ${this.battleSystem.getRoundNumber()} 轮结束`);
      this.time.delayedCall(1000, () => {
        this.battleState = BattleState.TURN_START;
        this.processTurn();
      });
      return;
    }

    // Reset defending status
    this.battleSystem.resetDefending(this.currentUnit.id);

    // Update turn order display
    this.updateTurnOrderDisplay();

    // Highlight current unit
    this.highlightCurrentUnit();

    // Show turn message
    this.showMessage(`${this.currentUnit.name} 的回合`);

    if (this.currentUnit.isPlayer) {
      // Player turn - show action menu
      this.time.delayedCall(500, () => {
        this.battleState = BattleState.PLAYER_SELECT_ACTION;
        this.showActionMenu();
      });
    } else {
      // Enemy turn - AI action
      this.battleState = BattleState.ENEMY_TURN;
      this.time.delayedCall(1000, () => {
        this.executeEnemyTurn();
      });
    }
  }

  /**
   * Highlight current unit sprite
   */
  private highlightCurrentUnit(): void {
    // Reset all unit highlights
    for (const container of this.unitSprites.values()) {
      container.setScale(1);
    }

    // Highlight current unit
    if (this.currentUnit) {
      const container = this.unitSprites.get(this.currentUnit.id);
      if (container) {
        this.tweens.add({
          targets: container,
          scale: 1.1,
          duration: 200,
          yoyo: true,
        });
      }
    }
  }

  /**
   * Show action menu
   */
  private showActionMenu(): void {
    if (!this.actionMenu) return;
    this.actionMenu.setVisible(true);
    this.actionIndex = 0;
    this.updateActionSelection();
  }

  /**
   * Hide action menu
   */
  private hideActionMenu(): void {
    if (!this.actionMenu) return;
    this.actionMenu.setVisible(false);
  }

  /**
   * Update action button selection
   */
  private updateActionSelection(): void {
    for (let i = 0; i < this.actionButtons.length; i++) {
      if (i === this.actionIndex) {
        this.actionButtons[i].setColor('#D4A84B');
      } else {
        // Reset to original colors based on action type
        const colors = ['#FFFFFF', '#88ccff', '#88ff88', '#ffff88', '#ff8888'];
        this.actionButtons[i].setColor(colors[i]);
      }
    }
  }

  /**
   * Update skill button selection
   */
  private updateSkillSelection(): void {
    for (let i = 0; i < this.skillButtons.length; i++) {
      const skill = this.demoSkills[i];
      const canUse = this.currentUnit && this.currentUnit.mp >= skill.mpCost;
      if (i === this.skillIndex && canUse) {
        this.skillButtons[i].setColor('#D4A84B');
      } else if (canUse) {
        this.skillButtons[i].setColor('#FFFFFF');
      }
    }
  }

  /**
   * Handle confirm input
   */
  private handleConfirm(): void {
    switch (this.battleState) {
      case BattleState.PLAYER_SELECT_ACTION:
        this.confirmAction();
        break;
      case BattleState.PLAYER_SELECT_SKILL:
        this.confirmSkill();
        break;
      case BattleState.PLAYER_SELECT_TARGET:
        this.confirmTarget();
        break;
      case BattleState.BATTLE_END:
        this.exitBattle();
        break;
    }
  }

  /**
   * Handle cancel input
   */
  private handleCancel(): void {
    if (this.battleState === BattleState.PLAYER_SELECT_SKILL) {
      // Back to action menu
      if (this.skillMenu) this.skillMenu.setVisible(false);
      this.battleState = BattleState.PLAYER_SELECT_ACTION;
      this.showActionMenu();
    } else if (this.battleState === BattleState.PLAYER_SELECT_TARGET) {
      // Back to action/skill menu
      this.clearTargetIndicator();
      if (this.selectedAction?.type === ActionType.SKILL) {
        this.battleState = BattleState.PLAYER_SELECT_SKILL;
        if (this.skillMenu) this.skillMenu.setVisible(true);
      } else {
        this.battleState = BattleState.PLAYER_SELECT_ACTION;
        this.showActionMenu();
      }
    }
  }

  /**
   * Confirm selected action
   */
  private confirmAction(): void {
    const actions = [
      ActionType.ATTACK,
      ActionType.SKILL,
      ActionType.ITEM,
      ActionType.DEFEND,
      ActionType.FLEE,
    ];

    const selectedType = actions[this.actionIndex];
    this.selectedAction = { type: selectedType };

    this.hideActionMenu();

    switch (selectedType) {
      case ActionType.ATTACK:
        this.battleState = BattleState.PLAYER_SELECT_TARGET;
        this.showMessage('选择攻击目标');
        this.targetIndex = 0;
        this.showTargetIndicator();
        break;

      case ActionType.SKILL:
        this.battleState = BattleState.PLAYER_SELECT_SKILL;
        if (this.currentUnit) {
          this.populateSkillMenu(this.currentUnit);
        }
        if (this.skillMenu) this.skillMenu.setVisible(true);
        break;

      case ActionType.ITEM:
        // Placeholder - show message and return to action select
        this.showMessage('道具系统尚未实现');
        this.time.delayedCall(500, () => {
          this.battleState = BattleState.PLAYER_SELECT_ACTION;
          this.showActionMenu();
        });
        break;

      case ActionType.DEFEND:
        this.executeDefend();
        break;

      case ActionType.FLEE:
        this.executeFlee();
        break;
    }
  }

  /**
   * Confirm selected skill
   */
  private confirmSkill(): void {
    const skill = this.demoSkills[this.skillIndex];

    if (!this.currentUnit || this.currentUnit.mp < skill.mpCost) {
      this.showMessage('MP不足！');
      return;
    }

    this.selectedAction = { type: ActionType.SKILL, skill };
    if (this.skillMenu) this.skillMenu.setVisible(false);

    // Determine target type
    if (skill.targetType === 'self') {
      this.selectedTargets = [this.currentUnit.id];
      this.executeSkillAction();
    } else if (skill.targetType === 'all_enemy' || skill.targetType === 'all') {
      this.selectedTargets = this.enemies.map(e => e.id);
      this.executeSkillAction();
    } else {
      this.battleState = BattleState.PLAYER_SELECT_TARGET;
      this.showMessage('选择目标');
      this.targetIndex = 0;
      this.showTargetIndicator();
    }
  }

  /**
   * Confirm selected target
   */
  private confirmTarget(): void {
    if (this.selectedAction?.type === ActionType.SKILL) {
      this.selectedTargets = [this.enemies[this.targetIndex].id];
      this.executeSkillAction();
    } else {
      this.selectedTargets = [this.enemies[this.targetIndex].id];
      this.executeAttackAction();
    }
  }

  /**
   * Show target indicator on selected enemy
   */
  private showTargetIndicator(): void {
    this.clearTargetIndicator();

    const enemy = this.enemies[this.targetIndex];
    const container = this.unitSprites.get(enemy.id);

    if (container) {
      this.targetIndicator = this.add.graphics();
      this.targetIndicator.lineStyle(3, 0xD4A84B);
      this.targetIndicator.strokeRect(
        container.x - 50,
        container.y - 60,
        this.UNIT_WIDTH,
        this.UNIT_HEIGHT
      );
      this.targetIndicator.setDepth(15);
    }
  }

  /**
   * Clear target indicator
   */
  private clearTargetIndicator(): void {
    if (this.targetIndicator) {
      this.targetIndicator.destroy();
      this.targetIndicator = null;
    }
  }

  /**
   * Execute attack action
   */
  private executeAttackAction(): void {
    if (!this.currentUnit) return;

    this.clearTargetIndicator();
    this.battleState = BattleState.EXECUTE_ACTION;

    const action = this.battleSystem.executeAttack(
      this.currentUnit.id,
      this.selectedTargets[0]
    );

    this.showMessage(action.message);
    this.playAttackAnimation(this.currentUnit.id, this.selectedTargets[0]);

    this.time.delayedCall(1000, () => {
      this.updateUnitDisplays();
      this.finishTurn();
    });
  }

  /**
   * Execute skill action
   */
  private executeSkillAction(): void {
    if (!this.currentUnit || !this.selectedAction?.skill) return;

    this.clearTargetIndicator();
    this.battleState = BattleState.EXECUTE_ACTION;

    const action = this.battleSystem.executeSkill(
      this.currentUnit.id,
      this.selectedAction.skill,
      this.selectedTargets
    );

    this.showMessage(action.message);
    this.playSkillAnimation(this.currentUnit.id, this.selectedTargets);

    this.time.delayedCall(1500, () => {
      this.updateUnitDisplays();
      this.finishTurn();
    });
  }

  /**
   * Execute defend action
   */
  private executeDefend(): void {
    if (!this.currentUnit) return;

    this.battleState = BattleState.EXECUTE_ACTION;

    const action = this.battleSystem.executeDefend(this.currentUnit.id);
    this.showMessage(action.message);

    // Visual effect for defend
    const container = this.unitSprites.get(this.currentUnit.id);
    if (container) {
      this.tweens.add({
        targets: container,
        alpha: 0.7,
        duration: 200,
        yoyo: true,
      });
    }

    this.time.delayedCall(500, () => {
      this.finishTurn();
    });
  }

  /**
   * Execute flee attempt
   */
  private executeFlee(): void {
    if (!this.currentUnit) return;

    this.battleState = BattleState.EXECUTE_ACTION;

    const action = this.battleSystem.executeFlee(this.currentUnit.id);
    this.showMessage(action.message);

    this.time.delayedCall(500, () => {
      if (this.battleSystem.isBattleEnded()) {
        this.handleBattleEnd();
      } else {
        this.finishTurn();
      }
    });
  }

  /**
   * Execute enemy turn (AI)
   */
  private executeEnemyTurn(): void {
    if (!this.currentUnit) return;

    // Simple AI: Attack random alive player
    const alivePlayers = this.battleSystem.getAlivePlayerUnits();
    if (alivePlayers.length === 0) {
      this.handleBattleEnd();
      return;
    }

    const targetIndex = Math.floor(Math.random() * alivePlayers.length);
    const target = alivePlayers[targetIndex];

    const action = this.battleSystem.executeAttack(this.currentUnit.id, target.id);

    this.showMessage(action.message);
    this.playAttackAnimation(this.currentUnit.id, target.id);

    this.time.delayedCall(1000, () => {
      this.updateUnitDisplays();
      this.finishTurn();
    });
  }

  /**
   * Play attack animation
   */
  private playAttackAnimation(attackerId: string, targetId: string): void {
    const attackerSprite = this.unitSprites.get(attackerId);
    const targetSprite = this.unitSprites.get(targetId);

    if (attackerSprite) {
      // Attacker moves toward target
      const targetX = targetSprite ? targetSprite.x : attackerSprite.x;

      this.tweens.add({
        targets: attackerSprite,
        x: targetX - 50,
        duration: 150,
        yoyo: true,
        ease: 'Power2',
      });
    }

    if (targetSprite) {
      // Target shakes
      this.tweens.add({
        targets: targetSprite,
        x: targetSprite.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
      });
    }
  }

  /**
   * Play skill animation
   */
  private playSkillAnimation(casterId: string, targetIds: string[]): void {
    const casterSprite = this.unitSprites.get(casterId);

    if (casterSprite) {
      // Caster glow effect
      this.tweens.add({
        targets: casterSprite,
        alpha: 0.5,
        duration: 200,
        yoyo: true,
      });
    }

    // Show skill effect on targets
    for (const targetId of targetIds) {
      const targetSprite = this.unitSprites.get(targetId);
      if (targetSprite) {
        // Flash effect
        this.tweens.add({
          targets: targetSprite,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          repeat: 2,
        });
      }
    }
  }

  /**
   * Finish current turn and move to next
   */
  private finishTurn(): void {
    // Check battle end after action
    this.battleSystem.checkBattleEnd();

    if (this.battleSystem.isBattleEnded()) {
      this.handleBattleEnd();
      return;
    }

    // Move to next turn
    this.battleSystem.moveToNextTurn();

    this.battleState = BattleState.TURN_START;
    this.processTurn();
  }

  /**
   * Handle battle end
   */
  private handleBattleEnd(): void {
    this.battleState = BattleState.BATTLE_END;

    const result = this.battleSystem.getBattleResult();

    if (result) {
      if (result.victory) {
        this.showMessage(`战斗胜利！获得 ${result.expReward} 经验值，${result.goldReward} 金钱`);
      } else {
        this.showMessage('战斗失败...');
      }
    }

    // Fade out and return to previous scene
    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.exitBattle();
      });
    });
  }

  /**
   * Show message in message box
   */
  private showMessage(message: string): void {
    if (this.messageText) {
      this.messageText.setText(message);
    }
  }

  /**
   * Exit battle and return to WorldScene
   */
  private exitBattle(): void {
    const result = this.battleSystem.getBattleResult();

    // Resume WorldScene with battle result
    this.scene.stop();
    this.scene.resume('WorldScene', {
      battleResult: result,
    });
  }

  /**
   * Handle keyboard navigation for action menu
   */
  private handleActionNavigation(): void {
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      this.actionIndex = Math.max(0, this.actionIndex - 1);
      this.updateActionSelection();
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      this.actionIndex = Math.min(this.actionButtons.length - 1, this.actionIndex + 1);
      this.updateActionSelection();
    }
  }

  /**
   * Handle keyboard navigation for skill menu
   */
  private handleSkillNavigation(): void {
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      this.skillIndex = Math.max(0, this.skillIndex - 1);
      this.updateSkillSelection();
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      this.skillIndex = Math.min(this.skillButtons.length - 1, this.skillIndex + 1);
      this.updateSkillSelection();
    }
  }

  /**
   * Handle keyboard navigation for target selection
   */
  private handleTargetNavigation(): void {
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      this.targetIndex = Math.max(0, this.targetIndex - 1);
      this.showTargetIndicator();
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      this.targetIndex = Math.min(this.enemies.length - 1, this.targetIndex + 1);
      this.showTargetIndicator();
    }
  }

  /**
   * Update loop
   */
  update(): void {
    // Handle navigation based on current state
    switch (this.battleState) {
      case BattleState.PLAYER_SELECT_ACTION:
        this.handleActionNavigation();
        break;
      case BattleState.PLAYER_SELECT_SKILL:
        this.handleSkillNavigation();
        break;
      case BattleState.PLAYER_SELECT_TARGET:
        this.handleTargetNavigation();
        break;
    }
  }

  /**
   * Cleanup scene
   */
  shutdown(): void {
    this.unitSprites.clear();
    this.hpBars.clear();
    this.mpBars.clear();

    this.input.keyboard!.off('keydown-ENTER');
    this.input.keyboard!.off('keydown-SPACE');
    this.input.keyboard!.off('keydown-ESC');
  }
}