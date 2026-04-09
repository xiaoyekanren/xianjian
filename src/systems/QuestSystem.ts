/**
 * Quest System - Side quest management
 * US-042: 支线任务系统
 */

import { StoryFlags } from '@/systems/SaveSystem';

/**
 * Quest status
 */
export enum QuestStatus {
  LOCKED = 'locked',       // Prerequisites not met
  AVAILABLE = 'available', // Can be started
  ACTIVE = 'active',       // Currently in progress
  COMPLETED = 'completed', // Successfully finished
  FAILED = 'failed',       // Failed (if failure is possible)
}

/**
 * Quest step types
 */
export enum QuestStepType {
  TALK_TO_NPC = 'talk_to_npc',       // Talk to specific NPC
  DEFEAT_ENEMY = 'defeat_enemy',     // Defeat specific enemy
  COLLECT_ITEM = 'collect_item',     // Collect/obtain item
  REACH_LOCATION = 'reach_location', // Reach specific map/location
  USE_ITEM = 'use_item',             // Use item
  COMPLETE_DIALOG = 'complete_dialog', // Complete dialog sequence
  FLAG_SET = 'flag_set',             // Story flag must be set
}

/**
 * Quest step definition
 */
export interface QuestStep {
  id: string;
  type: QuestStepType;
  description: string;          // Step description for UI
  targetId?: string;            // NPC ID, enemy ID, item ID, map ID, etc.
  targetCount?: number;         // Number required (e.g., defeat 3 enemies)
  currentCount?: number;        // Current progress
  targetMapId?: string;         // Map where step can be completed
  targetX?: number;             // Optional location coordinates
  targetY?: number;
  nextStepId?: string;          // Next step after completion
  optionalStepIds?: string[];   // Optional side steps
}

/**
 * Quest reward definition
 */
export interface QuestReward {
  exp?: number;                 // Experience points
  gold?: number;                // Gold
  items?: { itemId: string; quantity: number }[];  // Items
  affection?: { characterId: string; amount: number }[]; // Affection changes
  skills?: string[];            // Skill IDs learned
  flags?: { flagName: string; value: boolean }[];  // Story flags set
}

/**
 * Quest prerequisite
 */
export interface QuestPrerequisite {
  level?: number;               // Minimum player level
  completedQuests?: string[];   // Quests that must be completed first
  storyFlags?: string[];        // Required story flags
  items?: string[];             // Required items in inventory
}

/**
 * Quest definition
 */
export interface Quest {
  id: string;
  name: string;
  title: string;
  description: string;          // Full quest description
  summary: string;              // Short summary for quest log
  chapter?: number;             // Chapter when quest becomes available
  location?: string;            // Starting location
  giverNpcId?: string;          // NPC who gives the quest
  prerequisites?: QuestPrerequisite;
  steps: QuestStep[];           // Quest steps (sequential)
  rewards: QuestReward;
  timeLimit?: number;           // Optional time limit (in game minutes)
  repeatable?: boolean;         // Can be repeated
  hidden?: boolean;             // Hidden until prerequisites met
  failConditions?: {            // Conditions that cause quest failure
    storyFlags?: string[];      // Flags that must NOT be set
    timeExpired?: boolean;      // Fail if time limit expires
  };
}

/**
 * Active quest state
 */
export interface QuestState {
  questId: string;
  status: QuestStatus;
  currentStepId: string;
  stepProgress: Map<string, number>; // stepId -> currentCount
  startTime?: number;           // Game time when started
  completedTime?: number;       // Game time when completed
  failedTime?: number;          // Game time when failed
}

/**
 * Quest progress result
 */
export interface QuestProgressResult {
  questId: string;
  stepId: string;
  completed: boolean;
  questCompleted: boolean;
  message?: string;
}

/**
 * Quest System class
 * Manages side quests, progress tracking, and rewards
 */
export class QuestSystem {
  private quests: Map<string, Quest> = new Map();
  private questStates: Map<string, QuestState> = new Map();
  private completedQuests: Set<string> = new Set();

  /**
   * Load quests from configuration
   */
  loadQuests(quests: Quest[]): void {
    for (const quest of quests) {
      this.quests.set(quest.id, quest);
    }
    console.log(`Loaded ${this.quests.size} quests`);
  }

  /**
   * Load saved quest states
   */
  loadQuestStates(states: { questId: string; status: string; currentStepId: string; stepProgress: [string, number][]; completedQuests: string[] }[]): void {
    for (const state of states) {
      const progressMap = new Map<string, number>();
      for (const [stepId, count] of state.stepProgress) {
        progressMap.set(stepId, count);
      }
      this.questStates.set(state.questId, {
        questId: state.questId,
        status: state.status as QuestStatus,
        currentStepId: state.currentStepId,
        stepProgress: progressMap,
      });
    }
    this.completedQuests = new Set(states.flatMap(s => s.completedQuests || []));
  }

  /**
   * Get quest by ID
   */
  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  /**
   * Get all quests
   */
  getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  /**
   * Get quest state
   */
  getQuestState(questId: string): QuestState | undefined {
    return this.questStates.get(questId);
  }

  /**
   * Check if quest prerequisites are met
   */
  checkPrerequisites(questId: string, storyFlags: StoryFlags, inventory: { itemId: string }[], playerLevel: number): boolean {
    const quest = this.quests.get(questId);
    if (!quest || !quest.prerequisites) return true;

    const prereq = quest.prerequisites;

    // Check level
    if (prereq.level && playerLevel < prereq.level) {
      return false;
    }

    // Check completed quests
    if (prereq.completedQuests) {
      for (const requiredQuestId of prereq.completedQuests) {
        if (!this.completedQuests.has(requiredQuestId)) {
          return false;
        }
      }
    }

    // Check story flags
    if (prereq.storyFlags) {
      for (const flag of prereq.storyFlags) {
        if (!storyFlags[flag]) {
          return false;
        }
      }
    }

    // Check items
    if (prereq.items) {
      for (const itemId of prereq.items) {
        if (!inventory.some(item => item.itemId === itemId)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get quest status
   */
  getQuestStatus(questId: string, storyFlags: StoryFlags, inventory: { itemId: string }[], playerLevel: number): QuestStatus {
    // Check if already completed
    if (this.completedQuests.has(questId)) {
      return QuestStatus.COMPLETED;
    }

    // Check existing state
    const state = this.questStates.get(questId);
    if (state) {
      return state.status;
    }

    // Check if prerequisites met
    const quest = this.quests.get(questId);
    if (!quest) {
      return QuestStatus.LOCKED;
    }

    if (this.checkPrerequisites(questId, storyFlags, inventory, playerLevel)) {
      return QuestStatus.AVAILABLE;
    }

    return QuestStatus.LOCKED;
  }

  /**
   * Start a quest
   */
  startQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) {
      console.error(`Quest "${questId}" not found`);
      return false;
    }

    if (this.questStates.has(questId)) {
      console.log(`Quest "${questId}" is already active`);
      return false;
    }

    // Create initial state
    const initialState: QuestState = {
      questId,
      status: QuestStatus.ACTIVE,
      currentStepId: quest.steps[0]?.id || '',
      stepProgress: new Map(),
    };

    // Initialize step progress
    for (const step of quest.steps) {
      initialState.stepProgress.set(step.id, 0);
    }

    this.questStates.set(questId, initialState);
    console.log(`Quest "${quest.name}" started`);
    return true;
  }

  /**
   * Update quest step progress
   */
  updateProgress(
    questId: string,
    stepType: QuestStepType,
    targetId: string,
    storyFlags: StoryFlags
  ): QuestProgressResult | null {
    const state = this.questStates.get(questId);
    if (!state || state.status !== QuestStatus.ACTIVE) {
      return null;
    }

    const quest = this.quests.get(questId);
    if (!quest) return null;

    // Find current step
    const currentStep = quest.steps.find(s => s.id === state.currentStepId);
    if (!currentStep) return null;

    // Check if step matches
    if (currentStep.type !== stepType || currentStep.targetId !== targetId) {
      return null;
    }

    // Update progress
    const currentCount = state.stepProgress.get(currentStep.id) || 0;
    const targetCount = currentStep.targetCount || 1;
    const newCount = Math.min(currentCount + 1, targetCount);
    state.stepProgress.set(currentStep.id, newCount);

    // Check if step completed
    if (newCount >= targetCount) {
      return this.completeStep(questId, currentStep.id, storyFlags);
    }

    return {
      questId,
      stepId: currentStep.id,
      completed: false,
      questCompleted: false,
      message: `${currentStep.description} (${newCount}/${targetCount})`,
    };
  }

  /**
   * Complete a quest step
   */
  private completeStep(questId: string, stepId: string, _storyFlags: StoryFlags): QuestProgressResult {
    const state = this.questStates.get(questId);
    const quest = this.quests.get(questId);
    if (!state || !quest) {
      return { questId, stepId, completed: false, questCompleted: false };
    }

    // Find next step
    const stepIndex = quest.steps.findIndex(s => s.id === stepId);
    const nextStep = quest.steps[stepIndex + 1];

    if (nextStep) {
      // Move to next step
      state.currentStepId = nextStep.id;
      return {
        questId,
        stepId,
        completed: true,
        questCompleted: false,
        message: `完成: ${quest.steps[stepIndex].description}`,
      };
    } else {
      // Quest completed
      return this.completeQuest(questId);
    }
  }

  /**
   * Complete a quest
   */
  completeQuest(questId: string): QuestProgressResult {
    const state = this.questStates.get(questId);
    const quest = this.quests.get(questId);
    if (!state || !quest) {
      return { questId, stepId: '', completed: false, questCompleted: false };
    }

    // Update state
    state.status = QuestStatus.COMPLETED;
    state.completedTime = Date.now();
    this.completedQuests.add(questId);
    this.questStates.delete(questId);

    console.log(`Quest "${quest.name}" completed!`);

    return {
      questId,
      stepId: '',
      completed: true,
      questCompleted: true,
      message: `任务完成: ${quest.title}`,
    };
  }

  /**
   * Fail a quest
   */
  failQuest(questId: string, reason?: string): QuestProgressResult {
    const state = this.questStates.get(questId);
    const quest = this.quests.get(questId);
    if (!state || !quest) {
      return { questId, stepId: '', completed: false, questCompleted: false };
    }

    state.status = QuestStatus.FAILED;
    state.failedTime = Date.now();

    console.log(`Quest "${quest.name}" failed: ${reason || 'unknown reason'}`);

    return {
      questId,
      stepId: '',
      completed: false,
      questCompleted: false,
      message: `任务失败: ${reason || '条件未满足'}`,
    };
  }

  /**
   * Get quest rewards
   */
  getQuestRewards(questId: string): QuestReward | null {
    const quest = this.quests.get(questId);
    return quest?.rewards || null;
  }

  /**
   * Get all active quests
   */
  getActiveQuests(): { quest: Quest; state: QuestState }[] {
    const activeQuests: { quest: Quest; state: QuestState }[] = [];

    for (const [questId, state] of this.questStates) {
      if (state.status === QuestStatus.ACTIVE) {
        const quest = this.quests.get(questId);
        if (quest) {
          activeQuests.push({ quest, state });
        }
      }
    }

    return activeQuests;
  }

  /**
   * Get available quests
   */
  getAvailableQuests(storyFlags: StoryFlags, inventory: { itemId: string }[], playerLevel: number): Quest[] {
    const available: Quest[] = [];

    for (const quest of this.quests.values()) {
      if (this.completedQuests.has(quest.id)) continue;
      if (this.questStates.has(quest.id)) continue;

      if (this.checkPrerequisites(quest.id, storyFlags, inventory, playerLevel)) {
        available.push(quest);
      }
    }

    return available;
  }

  /**
   * Get completed quest IDs
   */
  getCompletedQuestIds(): string[] {
    return Array.from(this.completedQuests);
  }

  /**
   * Get quest progress for UI
   */
  getQuestProgress(questId: string): {
    quest: Quest;
    status: QuestStatus;
    currentStep: QuestStep | null;
    stepProgress: number;
    totalSteps: number;
  } | null {
    const quest = this.quests.get(questId);
    if (!quest) return null;

    const state = this.questStates.get(questId);
    const status = state?.status || (this.completedQuests.has(questId) ? QuestStatus.COMPLETED : QuestStatus.AVAILABLE);

    const currentStep = state ? quest.steps.find(s => s.id === state.currentStepId) || null : null;
    const currentStepIndex = currentStep ? quest.steps.findIndex(s => s.id === currentStep.id) : 0;

    return {
      quest,
      status,
      currentStep,
      stepProgress: currentStepIndex + 1,
      totalSteps: quest.steps.length,
    };
  }

  /**
   * Export quest states for saving
   */
  exportQuestStates(): {
    activeQuests: { questId: string; status: string; currentStepId: string; stepProgress: [string, number][] }[];
    completedQuests: string[];
  } {
    const activeQuests = Array.from(this.questStates.values()).map(state => ({
      questId: state.questId,
      status: state.status,
      currentStepId: state.currentStepId,
      stepProgress: Array.from(state.stepProgress.entries()),
    }));

    return {
      activeQuests,
      completedQuests: Array.from(this.completedQuests),
    };
  }

  /**
   * Reset quest system (for new game)
   */
  reset(): void {
    this.questStates.clear();
    this.completedQuests.clear();
  }
}

/**
 * Default quest system instance
 */
export const questSystem = new QuestSystem();