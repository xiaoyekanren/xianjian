/**
 * Affection Scene - Relationship display interface
 * US-026: 好感度界面
 */

import Phaser from 'phaser';
import { AffectionSystem, AffectionCharacterId, AffectionLevel, COMBO_SKILL_REQUIREMENTS } from '@/systems/AffectionSystem';

/**
 * Affection scene configuration
 */
export interface AffectionSceneConfig {
  affectionSystem: AffectionSystem;
}

/**
 * Character display info
 */
interface CharacterDisplay {
  id: AffectionCharacterId;
  name: string;
  color: number;
}

/**
 * Combo skill display info
 */
interface ComboSkillDisplay {
  id: string;
  name: string;
  type: 'two_person' | 'four_person';
  participants: string[];
}

/**
 * Affection Scene class
 * Displays affection levels and combo skill unlock status
 */
export class AffectionScene extends Phaser.Scene {
  private affectionSystem: AffectionSystem | null = null;

  // UI elements
  private affectionContainers: Phaser.GameObjects.Container[] = [];
  private comboSkillContainers: Phaser.GameObjects.Container[] = [];

  // Character display configuration
  private readonly CHARACTERS: CharacterDisplay[] = [
    { id: 'zhao_linger', name: '赵灵儿', color: 0x66CCFF },
    { id: 'lin_yueru', name: '林月如', color: 0xFF66AA },
    { id: 'anu', name: '阿奴', color: 0x88FF88 },
  ];

  // Combo skill display configuration
  private readonly COMBO_SKILLS: ComboSkillDisplay[] = [
    { id: 'sword_dance', name: '剑舞乾坤', type: 'two_person', participants: ['赵灵儿', '林月如'] },
    { id: 'immortal_demon', name: '仙魔同归', type: 'two_person', participants: ['赵灵儿', '林月如'] },
    { id: 'spirit_storm', name: '灵神风暴', type: 'two_person', participants: ['赵灵儿', '阿奴'] },
    { id: 'shadow_blade', name: '影刃绝杀', type: 'two_person', participants: ['林月如', '阿奴'] },
    { id: 'four_directions', name: '四方合击', type: 'four_person', participants: ['四人'] },
    { id: 'nuwa_power', name: '女娲神威', type: 'four_person', participants: ['四人'] },
  ];

  // Level colors
  private readonly LEVEL_COLORS: Record<AffectionLevel, number> = {
    [AffectionLevel.COLD]: 0x888888,
    [AffectionLevel.NORMAL]: 0xFFFFFF,
    [AffectionLevel.FRIENDLY]: 0x88FF88,
    [AffectionLevel.CLOSE]: 0xFFAA88,
    [AffectionLevel.LOVE]: 0xFF66AA,
  };

  constructor() {
    super({ key: 'AffectionScene' });
  }

  init(config: AffectionSceneConfig): void {
    this.affectionSystem = config.affectionSystem;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.cameras.main.fadeIn(200);

    // Create UI structure
    this.createHeader();
    this.createAffectionPanels();
    this.createComboSkillPanel();
    this.createCloseButton();

    // Setup input
    this.setupInput();
  }

  /**
   * Create header with title
   */
  private createHeader(): void {
    const width = this.cameras.main.width;

    // Title
    const title = this.add.text(width / 2, 30, '好感度', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#D4A84B',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);

    // Border line
    const border = this.add.graphics();
    border.lineStyle(2, 0xD4A84B);
    border.lineBetween(50, 60, width - 50, 60);

    // Subtitle
    const subtitle = this.add.text(width / 2, 75, '好感度影响剧情走向和合体技解锁', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#888888',
    });
    subtitle.setOrigin(0.5, 0.5);
  }

  /**
   * Create affection panels for each character
   */
  private createAffectionPanels(): void {
    const startX = 60;
    const startY = 100;
    const panelWidth = 400;
    const panelHeight = 150;
    const spacing = 20;

    for (let i = 0; i < this.CHARACTERS.length; i++) {
      const char = this.CHARACTERS[i];
      const x = startX;
      const y = startY + i * (panelHeight + spacing);

      const container = this.createAffectionPanel(x, y, panelWidth, panelHeight, char);
      this.affectionContainers.push(container);
    }
  }

  /**
   * Create a single affection panel
   */
  private createAffectionPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    char: CharacterDisplay
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x222244, 0.9);
    bg.fillRoundedRect(0, 0, width, height, 8);
    bg.lineStyle(2, char.color);
    bg.strokeRoundedRect(0, 0, width, height, 8);
    container.add(bg);

    // Character name with color indicator
    const nameText = this.add.text(15, 15, char.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    });
    container.add(nameText);

    // Color indicator dot
    const dot = this.add.graphics();
    dot.fillStyle(char.color, 1);
    dot.fillCircle(width - 25, 25, 12);
    container.add(dot);

    // Get affection data
    const affection = this.affectionSystem?.getAffection(char.id) ?? 0;
    const level = this.affectionSystem?.getAffectionLevel(char.id) ?? AffectionLevel.COLD;
    const progress = this.affectionSystem?.getAffectionProgress(char.id) ?? { value: 0, level: AffectionLevel.COLD, nextLevel: null, progressToNext: 0 };

    // Level display
    const levelColorHex = this.colorToHex(this.LEVEL_COLORS[level]);
    const levelText = this.add.text(15, 50, `等级: ${level}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: levelColorHex,
    });
    container.add(levelText);

    // Progress bar background
    const barX = 15;
    const barY = 80;
    const barWidth = width - 30;
    const barHeight = 25;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x333333);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4);
    container.add(barBg);

    // Progress bar fill
    const barFill = this.add.graphics();
    const fillWidth = (affection / 100) * barWidth;
    barFill.fillStyle(char.color, 1);
    barFill.fillRoundedRect(barX, barY, Math.max(10, fillWidth), barHeight, 4);
    container.add(barFill);

    // Value text on bar
    const valueText = this.add.text(barX + barWidth / 2, barY + barHeight / 2, `${affection}/100`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    });
    valueText.setOrigin(0.5, 0.5);
    container.add(valueText);

    // Next level indicator
    const nextLevelText = this.add.text(15, 115,
      progress.nextLevel
        ? `下一等级: ${progress.nextLevel} (需 ${this.getThresholdForLevel(progress.nextLevel)} 点)`
        : '已达到最高等级',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#888888',
      }
    );
    container.add(nextLevelText);

    return container;
  }

  /**
   * Create combo skill panel
   */
  private createComboSkillPanel(): void {
    const x = 480;
    const y = 100;
    const width = 440;
    const height = 490;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x222244, 0.9);
    bg.fillRoundedRect(x, y, width, height, 8);
    bg.lineStyle(1, 0x666688);
    bg.strokeRoundedRect(x, y, width, height, 8);

    // Title
    const title = this.add.text(x + width / 2, y + 20, '合体技', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#D4A84B',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);

    // Separator
    const separator = this.add.graphics();
    separator.lineStyle(1, 0xD4A84B);
    separator.lineBetween(x + 15, y + 50, x + width - 15, y + 50);

    // Combo skills list
    const skillStartY = y + 70;
    const skillHeight = 70;

    for (let i = 0; i < this.COMBO_SKILLS.length; i++) {
      const skill = this.COMBO_SKILLS[i];
      const skillY = skillStartY + i * skillHeight;

      const isUnlocked = this.affectionSystem?.isComboSkillUnlocked(skill.id, COMBO_SKILL_REQUIREMENTS) ?? false;
      const container = this.createComboSkillItem(x + 15, skillY, width - 30, skillHeight - 10, skill, isUnlocked);
      this.comboSkillContainers.push(container);
    }
  }

  /**
   * Create a combo skill item
   */
  private createComboSkillItem(
    x: number,
    y: number,
    width: number,
    height: number,
    skill: ComboSkillDisplay,
    isUnlocked: boolean
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(isUnlocked ? 0x334455 : 0x222233, 1);
    bg.fillRoundedRect(0, 0, width, height, 5);
    bg.lineStyle(1, isUnlocked ? 0x88FF88 : 0x666688);
    bg.strokeRoundedRect(0, 0, width, height, 5);
    container.add(bg);

    // Skill name
    const nameColor = isUnlocked ? '#88FF88' : '#888888';
    const nameText = this.add.text(10, 10, skill.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: nameColor,
      fontStyle: isUnlocked ? 'bold' : 'normal',
    });
    container.add(nameText);

    // Type indicator
    const typeText = this.add.text(width - 10, 10, skill.type === 'four_person' ? '四人' : '双人', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#AAAAAA',
    });
    typeText.setOrigin(1, 0);
    container.add(typeText);

    // Participants
    const participantsText = this.add.text(10, 35, `参与者: ${skill.participants.join('、')}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#CCCCCC',
    });
    container.add(participantsText);

    // Unlock status
    const statusText = this.add.text(width - 10, height - 5, isUnlocked ? '已解锁' : '未解锁', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: isUnlocked ? '#88FF88' : '#FF8888',
    });
    statusText.setOrigin(1, 1);
    container.add(statusText);

    // If not unlocked, show requirements
    if (!isUnlocked) {
      const requirements = COMBO_SKILL_REQUIREMENTS[skill.id];
      const reqParts: string[] = [];

      for (const charId of Object.keys(requirements || {}) as AffectionCharacterId[]) {
        const charName = this.CHARACTERS.find(c => c.id === charId)?.name ?? charId;
        const required = requirements?.[charId] ?? 0;
        const current = this.affectionSystem?.getAffection(charId) ?? 0;
        const satisfied = current >= required;
        reqParts.push(`${charName}: ${current}/${required}${satisfied ? ' ✓' : ''}`);
      }

      if (reqParts.length > 0) {
        const reqText = this.add.text(10, height - 5, `需求: ${reqParts.join(' | ')}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#888888',
        });
        container.add(reqText);
      }
    }

    return container;
  }

  /**
   * Create close button
   */
  private createCloseButton(): void {
    const width = this.cameras.main.width;
    const y = 600;

    this.createButton(width / 2 - 60, y, '关闭', 0x884444, () => {
      this.closeScene();
    });
  }

  /**
   * Create a styled button
   */
  private createButton(x: number, y: number, label: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(0, 0, 120, 40, 5);
    bg.lineStyle(1, color + 0x222222);
    bg.strokeRoundedRect(0, 0, 120, 40, 5);

    const text = this.add.text(60, 20, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);

    // Make interactive
    const hitArea = this.add.rectangle(60, 20, 120, 40, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', callback);
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color + 0x333333, 1);
      bg.fillRoundedRect(0, 0, 120, 40, 5);
      bg.lineStyle(1, color + 0x444444);
      bg.strokeRoundedRect(0, 0, 120, 40, 5);
    });
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(0, 0, 120, 40, 5);
      bg.lineStyle(1, color + 0x222222);
      bg.strokeRoundedRect(0, 0, 120, 40, 5);
    });
    container.add(hitArea);

    return container;
  }

  /**
   * Setup keyboard input
   */
  private setupInput(): void {
    this.input.keyboard!.on('keydown-ESC', () => this.closeScene());
  }

  /**
   * Close affection scene
   */
  private closeScene(): void {
    this.cameras.main.fadeOut(200, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop();
      this.scene.resume('WorldScene');
    });
  }

  /**
   * Convert color number to hex string
   */
  private colorToHex(color: number): string {
    return '#' + color.toString(16).padStart(6, '0');
  }

  /**
   * Get threshold value for a level
   */
  private getThresholdForLevel(level: AffectionLevel): number {
    const thresholds: Record<AffectionLevel, number> = {
      [AffectionLevel.COLD]: 20,
      [AffectionLevel.NORMAL]: 40,
      [AffectionLevel.FRIENDLY]: 60,
      [AffectionLevel.CLOSE]: 80,
      [AffectionLevel.LOVE]: 100,
    };
    return thresholds[level];
  }

  /**
   * Cleanup scene
   */
  shutdown(): void {
    this.input.keyboard!.off('keydown-ESC');
  }
}