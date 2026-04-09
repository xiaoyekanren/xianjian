/**
 * Story System - manages story nodes, trigger conditions, and progress
 * US-034: 剧情脚本系统
 */

import { StoryFlags } from '@/systems/SaveSystem';

/**
 * Story chapter enum
 */
export enum StoryChapter {
  PROLOGUE = 0,      // 梦中习剑
  CHAPTER_1 = 1,     // 仙灵岛遇灵儿
  CHAPTER_2 = 2,     // 苏州比武招亲
  CHAPTER_3 = 3,     // 锁妖塔
  CHAPTER_4 = 4,     // 苗族圣地
  CHAPTER_5 = 5,     // 结局
}

/**
 * Trigger condition types for story nodes
 */
export enum TriggerType {
  ENTER_MAP = 'enter_map',         // Player enters a map
  EXIT_MAP = 'exit_map',           // Player exits a map
  INTERACT_NPC = 'interact_npc',   // Player interacts with NPC
  INTERACT_OBJECT = 'interact_object', // Player interacts with object
  BATTLE_END = 'battle_end',       // Battle ends
  FLAG_SET = 'flag_set',           // Story flag is set
  ITEM_GET = 'item_get',           // Player obtains an item
  PARTY_MEMBER = 'party_member',   // Character joins/leaves party
  LOCATION = 'location',           // Player at specific location
  CHAPTER = 'chapter',             // Current chapter matches
  TIME = 'time',                   // Time-based trigger
}

/**
 * Trigger condition for a story node
 */
export interface StoryTrigger {
  type: TriggerType;
  data: {
    mapId?: string;
    npcId?: string;
    objectId?: string;
    battleId?: string;
    flagName?: string;
    flagValue?: boolean;
    itemId?: string;
    characterId?: string;
    x?: number;
    y?: number;
    chapter?: number;
    minTime?: number;
    maxTime?: number;
  };
  negate?: boolean;  // If true, trigger when condition is NOT met
}

/**
 * Story event types
 */
export enum StoryEventType {
  DIALOG = 'dialog',           // Start dialog sequence
  BATTLE = 'battle',           // Start battle
  GET_ITEM = 'get_item',       // Give player item
  SET_FLAG = 'set_flag',       // Set story flag
  CHANGE_MAP = 'change_map',   // Change map
  ADD_PARTY = 'add_party',     // Add party member
  REMOVE_PARTY = 'remove_party', // Remove party member
  HEAL = 'heal',               // Heal party
  CHAPTER_CHANGE = 'chapter_change', // Advance chapter
  CAMERA = 'camera',           // Camera movement/effect
  WAIT = 'wait',               // Wait for time
  PLAY_SOUND = 'play_sound',   // Play sound effect
  SCREEN_EFFECT = 'screen_effect', // Screen effect (fade, flash)
}

/**
 * Story event configuration
 */
export interface StoryEvent {
  type: StoryEventType;
  order: number;  // Execution order
  data: {
    dialogId?: string;
    battleId?: string;
    enemyIds?: string[];
    itemId?: string;
    quantity?: number;
    flagName?: string;
    flagValue?: boolean;
    mapId?: string;
    targetX?: number;
    targetY?: number;
    characterId?: string;
    healAmount?: number;
    healFull?: boolean;
    chapter?: number;
    cameraX?: number;
    cameraY?: number;
    duration?: number;
    soundId?: string;
    effectType?: 'fade' | 'flash' | 'shake';
    effectColor?: string;
    effectDuration?: number;
  };
  waitForCompletion?: boolean;  // Wait for this event to finish before next
}

/**
 * Story node - a single plot point/event
 */
export interface StoryNode {
  id: string;
  chapter: StoryChapter;
  title: string;            // Node title for debugging
  description?: string;     // Brief description
  triggers: StoryTrigger[]; // Conditions that activate this node
  events: StoryEvent[];     // Events to execute when triggered
  requiredFlags?: string[]; // Required flags to be set
  requiredItems?: string[]; // Required items in inventory
  requiredParty?: string[]; // Required party members
  blockingNodes?: string[]; // Nodes that must be completed first
  repeatable?: boolean;     // Can trigger multiple times
  priority?: number;        // Higher priority = check first
  onCompleteFlags?: string[]; // Flags set when node completes
  nextNode?: string;        // Next story node to queue
}

/**
 * Story progress tracking
 */
export interface StoryProgress {
  currentNode: string | null;
  completedNodes: Set<string>;
  activeFlags: StoryFlags;
  currentChapter: StoryChapter;
  queuedNodes: string[];
  triggeredEvents: Set<string>;
}

/**
 * Story configuration from JSON (raw format with string types)
 */
export interface StoryConfigJson {
  nodes: unknown[];
  chapters: {
    id: number;
    name: string;
    description: string;
    startNode?: string;
  }[];
}

/**
 * Parse JSON story config into proper TypeScript format
 */
export function parseStoryConfig(json: unknown): StoryConfig {
  // Cast the JSON data - the runtime will work correctly
  const data = json as StoryConfig;

  // Validate basic structure
  if (!data.nodes || !data.chapters) {
    console.warn('Invalid story config: missing nodes or chapters');
    return { nodes: [], chapters: [] };
  }

  return data;
}

/**
 * Story configuration (parsed format)
 */
export interface StoryConfig {
  nodes: StoryNode[];
  chapters: {
    id: StoryChapter;
    name: string;
    description: string;
    startNode?: string;
  }[];
}

/**
 * Result of checking triggers
 */
export interface TriggerResult {
  triggered: boolean;
  nodeId: string;
  triggerIndex: number;
}

/**
 * Result of executing events
 */
export interface EventResult {
  success: boolean;
  eventId: string;
  eventType: StoryEventType;
  data?: unknown;
}

/**
 * Story System class
 * Manages story nodes, triggers, and progress tracking
 */
export class StorySystem {
  private nodes: Map<string, StoryNode>;
  private progress: StoryProgress;
  private config: StoryConfig | null;
  private pendingEvents: StoryEvent[];
  private currentEventIndex: number;
  private isExecuting: boolean;

  constructor(config?: StoryConfig) {
    this.nodes = new Map();
    this.config = null;
    this.pendingEvents = [];
    this.currentEventIndex = 0;
    this.isExecuting = false;

    // Initialize progress
    this.progress = {
      currentNode: null,
      completedNodes: new Set(),
      activeFlags: {},
      currentChapter: StoryChapter.PROLOGUE,
      queuedNodes: [],
      triggeredEvents: new Set(),
    };

    if (config) {
      this.loadConfig(config);
    }
  }

  /**
   * Load story configuration
   */
  loadConfig(config: StoryConfig): void {
    this.config = config;

    // Load all nodes
    for (const node of config.nodes) {
      this.nodes.set(node.id, node);
    }

    console.log(`Loaded ${this.nodes.size} story nodes`);
  }

  /**
   * Get current progress state
   */
  getProgress(): StoryProgress {
    return {
      ...this.progress,
      completedNodes: new Set(this.progress.completedNodes),
      triggeredEvents: new Set(this.progress.triggeredEvents),
    };
  }

  /**
   * Set progress from saved data
   */
  setProgress(flags: StoryFlags, chapter: number, completedNodes: string[]): void {
    this.progress.activeFlags = flags;
    this.progress.currentChapter = chapter;
    this.progress.completedNodes = new Set(completedNodes);
  }

  /**
   * Get all completed nodes
   */
  getCompletedNodes(): string[] {
    return Array.from(this.progress.completedNodes);
  }

  /**
   * Get current chapter
   */
  getCurrentChapter(): StoryChapter {
    return this.progress.currentChapter;
  }

  /**
   * Set current chapter
   */
  setChapter(chapter: StoryChapter): void {
    this.progress.currentChapter = chapter;
  }

  /**
   * Get story flag value
   */
  getFlag(flagName: string): boolean {
    return this.progress.activeFlags[flagName] === true;
  }

  /**
   * Set story flag
   */
  setFlag(flagName: string, value: boolean = true): void {
    this.progress.activeFlags[flagName] = value;
    console.log(`Flag set: ${flagName} = ${value}`);

    // Check for flag-triggered nodes
    this.checkTrigger(TriggerType.FLAG_SET, { flagName, flagValue: value });
  }

  /**
   * Check if a node can be triggered
   */
  canTriggerNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // Check if already completed and not repeatable
    if (this.progress.completedNodes.has(nodeId) && !node.repeatable) {
      return false;
    }

    // Check blocking nodes
    if (node.blockingNodes) {
      for (const blockingId of node.blockingNodes) {
        if (!this.progress.completedNodes.has(blockingId)) {
          return false;
        }
      }
    }

    // Check required flags
    if (node.requiredFlags) {
      for (const flag of node.requiredFlags) {
        if (!this.getFlag(flag)) {
          return false;
        }
      }
    }

    // Check required chapter
    if (node.chapter !== this.progress.currentChapter) {
      return false;
    }

    return true;
  }

  /**
   * Check triggers for a specific trigger type
   */
  checkTrigger(triggerType: TriggerType, data: StoryTrigger['data']): TriggerResult | null {
    // Sort nodes by priority (higher first)
    const sortedNodes = Array.from(this.nodes.values())
      .filter(n => this.canTriggerNode(n.id))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const node of sortedNodes) {
      for (let i = 0; i < node.triggers.length; i++) {
        const trigger = node.triggers[i];

        if (trigger.type !== triggerType) continue;

        const matches = this.matchesTrigger(trigger, data);

        // Apply negation if specified
        const triggered = trigger.negate ? !matches : matches;

        if (triggered) {
          console.log(`Story node "${node.id}" triggered by ${triggerType}`);
          return {
            triggered: true,
            nodeId: node.id,
            triggerIndex: i,
          };
        }
      }
    }

    return null;
  }

  /**
   * Check if trigger data matches
   */
  private matchesTrigger(trigger: StoryTrigger, data: StoryTrigger['data']): boolean {
    switch (trigger.type) {
      case TriggerType.ENTER_MAP:
        return trigger.data.mapId === data.mapId;

      case TriggerType.INTERACT_NPC:
        return trigger.data.npcId === data.npcId;

      case TriggerType.INTERACT_OBJECT:
        return trigger.data.objectId === data.objectId;

      case TriggerType.BATTLE_END:
        return trigger.data.battleId === data.battleId;

      case TriggerType.FLAG_SET:
        return trigger.data.flagName === data.flagName &&
               trigger.data.flagValue === data.flagValue;

      case TriggerType.ITEM_GET:
        return trigger.data.itemId === data.itemId;

      case TriggerType.PARTY_MEMBER:
        return trigger.data.characterId === data.characterId;

      case TriggerType.LOCATION:
        return trigger.data.mapId === data.mapId &&
               trigger.data.x === data.x &&
               trigger.data.y === data.y;

      case TriggerType.CHAPTER:
        return trigger.data.chapter === this.progress.currentChapter;

      default:
        return false;
    }
  }

  /**
   * Start executing a story node
   */
  startNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      console.error(`Story node "${nodeId}" not found`);
      return false;
    }

    if (!this.canTriggerNode(nodeId)) {
      console.log(`Cannot trigger node "${nodeId}" - conditions not met`);
      return false;
    }

    // Set as current node
    this.progress.currentNode = nodeId;
    this.progress.queuedNodes = [];

    // Queue events for execution
    this.pendingEvents = node.events.sort((a, b) => a.order - b.order);
    this.currentEventIndex = 0;
    this.isExecuting = true;

    console.log(`Starting story node: ${nodeId} (${node.title})`);
    return true;
  }

  /**
   * Get next pending event to execute
   */
  getNextEvent(): StoryEvent | null {
    if (!this.isExecuting || this.currentEventIndex >= this.pendingEvents.length) {
      return null;
    }

    return this.pendingEvents[this.currentEventIndex];
  }

  /**
   * Advance to next event
   */
  advanceEvent(): boolean {
    this.currentEventIndex++;

    if (this.currentEventIndex >= this.pendingEvents.length) {
      this.completeCurrentNode();
      return false;
    }

    return true;
  }

  /**
   * Complete the current node
   */
  private completeCurrentNode(): void {
    if (!this.progress.currentNode) return;

    const node = this.nodes.get(this.progress.currentNode);
    if (node) {
      // Mark as completed
      this.progress.completedNodes.add(node.id);

      // Set completion flags
      if (node.onCompleteFlags) {
        for (const flag of node.onCompleteFlags) {
          this.setFlag(flag, true);
        }
      }

      // Queue next node
      if (node.nextNode) {
        this.progress.queuedNodes.push(node.nextNode);
      }

      console.log(`Completed story node: ${node.id}`);
    }

    this.progress.currentNode = null;
    this.pendingEvents = [];
    this.currentEventIndex = 0;
    this.isExecuting = false;
  }

  /**
   * Check if currently executing a node
   */
  isExecutingNode(): boolean {
    return this.isExecuting;
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): StoryNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes for a chapter
   */
  getNodesForChapter(chapter: StoryChapter): StoryNode[] {
    return Array.from(this.nodes.values()).filter(n => n.chapter === chapter);
  }

  /**
   * Get chapter info
   */
  getChapterInfo(chapter: StoryChapter): { name: string; description: string } | undefined {
    return this.config?.chapters.find(c => c.id === chapter);
  }

  /**
   * Get start node for a chapter
   */
  getChapterStartNode(chapter: StoryChapter): string | undefined {
    const chapterInfo = this.config?.chapters.find(c => c.id === chapter);
    return chapterInfo?.startNode;
  }

  /**
   * Get progress percentage for a chapter
   */
  getChapterProgress(chapter: StoryChapter): number {
    const chapterNodes = this.getNodesForChapter(chapter);
    if (chapterNodes.length === 0) return 100;

    const completed = chapterNodes.filter(n => this.progress.completedNodes.has(n.id)).length;
    return Math.round((completed / chapterNodes.length) * 100);
  }

  /**
   * Get all available nodes that can be triggered now
   */
  getAvailableNodes(): StoryNode[] {
    return Array.from(this.nodes.values())
      .filter(n => this.canTriggerNode(n.id))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Reset progress (for new game)
   */
  reset(): void {
    this.progress = {
      currentNode: null,
      completedNodes: new Set(),
      activeFlags: {},
      currentChapter: StoryChapter.PROLOGUE,
      queuedNodes: [],
      triggeredEvents: new Set(),
    };
    this.pendingEvents = [];
    this.currentEventIndex = 0;
    this.isExecuting = false;
  }

  /**
   * Export progress for saving
   */
  exportProgress(): {
    flags: StoryFlags;
    chapter: number;
    completedNodes: string[];
    currentNode: string | null;
    queuedNodes: string[];
  } {
    return {
      flags: this.progress.activeFlags,
      chapter: this.progress.currentChapter,
      completedNodes: Array.from(this.progress.completedNodes),
      currentNode: this.progress.currentNode,
      queuedNodes: this.progress.queuedNodes,
    };
  }
}

/**
 * Default story system instance (will be loaded with config)
 */
export const storySystem = new StorySystem();