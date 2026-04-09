/**
 * Tutorial System - New player guidance
 * US-049: 新手引导系统
 */

import { StoryFlags } from '@/systems/SaveSystem';

/**
 * Tutorial step types
 */
export enum TutorialStepType {
  MOVEMENT = 'movement',           // 移动教学
  BATTLE = 'battle',               // 战斗教学
  SHOP = 'shop',                   // 商店教学
  SKILL = 'skill',                 // 仙术教学
  INVENTORY = 'inventory',         // 物品教学
  DIALOG = 'dialog',               // 对话教学
  SAVE = 'save',                   // 存档教学
}

/**
 * Tutorial step configuration
 */
export interface TutorialStep {
  id: string;
  type: TutorialStepType;
  title: string;
  description: string;
  triggers: {
    mapId?: string;
    npcId?: string;
    firstBattle?: boolean;
    firstShop?: boolean;
    firstSkill?: boolean;
    storyFlag?: string;
  };
  highlight?: {
    elementType: 'button' | 'area' | 'character' | 'menu';
    position: { x: number; y: number };
    size?: { width: number; height: number };
  };
  autoAdvance?: boolean;
  delay?: number;
}

/**
 * Tutorial state
 */
export interface TutorialState {
  completedTutorials: Set<string>;
  currentTutorial: string | null;
  tutorialQueue: string[];
  skipAll: boolean;
}

/**
 * Default tutorial steps
 */
const DEFAULT_TUTORIALS: TutorialStep[] = [
  {
    id: 'tutorial_movement',
    type: TutorialStepType.MOVEMENT,
    title: '移动教学',
    description: '使用 方向键 或 WASD 移动角色。靠近NPC后按 空格键 或 Enter 进行对话。',
    triggers: {
      mapId: 'yuhang_town_main',
    },
    autoAdvance: false,
  },
  {
    id: 'tutorial_dialog',
    type: TutorialStepType.DIALOG,
    title: '对话教学',
    description: '按 空格键 或 Enter 推进对话。使用 ↑↓ 或 WS 选择选项。',
    triggers: {
      storyFlag: 'first_dialog',
    },
    autoAdvance: false,
  },
  {
    id: 'tutorial_battle',
    type: TutorialStepType.BATTLE,
    title: '战斗教学',
    description: '使用 ↑↓ 选择行动，←→ 选择目标。按 Enter 确认选择。T键可切换单体/全体攻击模式。',
    triggers: {
      firstBattle: true,
    },
    autoAdvance: false,
  },
  {
    id: 'tutorial_skill',
    type: TutorialStepType.SKILL,
    title: '仙术教学',
    description: '选择"仙术"后，选择要使用的仙术。注意MP消耗！每个仙术有不同的目标类型和效果。',
    triggers: {
      firstSkill: true,
    },
    autoAdvance: false,
  },
  {
    id: 'tutorial_shop',
    type: TutorialStepType.SHOP,
    title: '商店教学',
    description: '在商店中可以购买和出售物品。使用 ↑↓ 选择物品，A/D 调整数量。确认购买后金钱会自动扣除。',
    triggers: {
      firstShop: true,
    },
    autoAdvance: false,
  },
  {
    id: 'tutorial_inventory',
    type: TutorialStepType.INVENTORY,
    title: '物品教学',
    description: '按 I 键打开物品栏。消耗品可以恢复HP/MP，装备可以提升角色属性。',
    triggers: {
      mapId: 'yuhang_town_main',
    },
    autoAdvance: false,
  },
  {
    id: 'tutorial_save',
    type: TutorialStepType.SAVE,
    title: '存档教学',
    description: '按 S 键打开存档界面。选择一个存档槽位保存游戏进度。建议定期存档！',
    triggers: {
      mapId: 'yuhang_town_main',
    },
    autoAdvance: false,
  },
];

/**
 * Tutorial System class
 * Manages tutorial display and progress
 */
export class TutorialSystem {
  private tutorials: Map<string, TutorialStep> = new Map();
  private state: TutorialState;
  private onTutorialShow: ((tutorial: TutorialStep) => void) | null = null;

  constructor() {
    this.state = {
      completedTutorials: new Set(),
      currentTutorial: null,
      tutorialQueue: [],
      skipAll: false,
    };

    // Load default tutorials
    for (const tutorial of DEFAULT_TUTORIALS) {
      this.tutorials.set(tutorial.id, tutorial);
    }
  }

  /**
   * Set callback for showing tutorial
   */
  setShowCallback(callback: (tutorial: TutorialStep) => void): void {
    this.onTutorialShow = callback;
  }

  /**
   * Check and trigger tutorials based on game state
   */
  checkTriggers(
    currentMap: string,
    storyFlags: StoryFlags,
    isFirstBattle: boolean,
    isFirstShop: boolean,
    isFirstSkill: boolean
  ): TutorialStep | null {
    if (this.state.skipAll) return null;

    for (const [id, tutorial] of this.tutorials) {
      // Skip completed tutorials
      if (this.state.completedTutorials.has(id)) continue;

      // Check triggers
      const triggers = tutorial.triggers;
      let triggered = false;

      if (triggers.mapId && triggers.mapId === currentMap) {
        triggered = true;
      }

      if (triggers.firstBattle && isFirstBattle) {
        triggered = true;
      }

      if (triggers.firstShop && isFirstShop) {
        triggered = true;
      }

      if (triggers.firstSkill && isFirstSkill) {
        triggered = true;
      }

      if (triggers.storyFlag && storyFlags[triggers.storyFlag]) {
        triggered = true;
      }

      if (triggered) {
        this.state.currentTutorial = id;
        if (this.onTutorialShow) {
          this.onTutorialShow(tutorial);
        }
        return tutorial;
      }
    }

    return null;
  }

  /**
   * Complete current tutorial
   */
  completeCurrentTutorial(): void {
    if (this.state.currentTutorial) {
      this.state.completedTutorials.add(this.state.currentTutorial);
      this.state.currentTutorial = null;
    }
  }

  /**
   * Skip all tutorials
   */
  skipAllTutorials(): void {
    this.state.skipAll = true;
    for (const id of this.tutorials.keys()) {
      this.state.completedTutorials.add(id);
    }
    this.state.currentTutorial = null;
  }

  /**
   * Get tutorial by ID
   */
  getTutorial(id: string): TutorialStep | undefined {
    return this.tutorials.get(id);
  }

  /**
   * Check if tutorial is completed
   */
  isCompleted(id: string): boolean {
    return this.state.completedTutorials.has(id);
  }

  /**
   * Get all tutorials
   */
  getAllTutorials(): TutorialStep[] {
    return Array.from(this.tutorials.values());
  }

  /**
   * Get completed tutorial IDs
   */
  getCompletedTutorials(): string[] {
    return Array.from(this.state.completedTutorials);
  }

  /**
   * Load tutorial state from save
   */
  loadState(completedTutorials: string[], skipAll: boolean): void {
    this.state.completedTutorials = new Set(completedTutorials);
    this.state.skipAll = skipAll;
  }

  /**
   * Export tutorial state for save
   */
  exportState(): {
    completedTutorials: string[];
    skipAll: boolean;
  } {
    return {
      completedTutorials: Array.from(this.state.completedTutorials),
      skipAll: this.state.skipAll,
    };
  }

  /**
   * Reset tutorial system
   */
  reset(): void {
    this.state = {
      completedTutorials: new Set(),
      currentTutorial: null,
      tutorialQueue: [],
      skipAll: false,
    };
  }

  /**
   * Add custom tutorial
   */
  addTutorial(tutorial: TutorialStep): void {
    this.tutorials.set(tutorial.id, tutorial);
  }

  /**
   * Get tutorial display content
   */
  getTutorialDisplayContent(id: string): {
    title: string;
    description: string;
    type: TutorialStepType;
  } | null {
    const tutorial = this.tutorials.get(id);
    if (!tutorial) return null;

    return {
      title: tutorial.title,
      description: tutorial.description,
      type: tutorial.type,
    };
  }

  /**
   * Get next uncompleted tutorial
   */
  getNextUncompletedTutorial(): TutorialStep | null {
    for (const tutorial of DEFAULT_TUTORIALS) {
      if (!this.state.completedTutorials.has(tutorial.id)) {
        return tutorial;
      }
    }
    return null;
  }

  /**
   * Get tutorial progress
   */
  getProgress(): {
    completed: number;
    total: number;
    percentage: number;
  } {
    const total = this.tutorials.size;
    const completed = this.state.completedTutorials.size;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  }
}

/**
 * Default tutorial system instance
 */
export const tutorialSystem = new TutorialSystem();