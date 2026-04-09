/**
 * Battle System - Turn-based combat logic
 * US-006: 回合制战斗系统实现
 */

import { Character } from '@/entities/Character';
import { Skill } from '@/data/Skill';

/**
 * Battle unit representing a character or enemy in battle
 */
export interface BattleUnit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  luck: number;
  isPlayer: boolean;
  isDefending: boolean;
  statusEffects: StatusEffect[];
  skills: Skill[];
  spriteKey?: string;
}

/**
 * Status effect types
 */
export enum StatusType {
  POISON = 'poison',       // 中毒 - 每回合损失HP
  PARALYZE = 'paralyze',   // 眩晕 - 无法行动
  SLEEP = 'sleep',         // 睡眠 - 无法行动，受攻击醒来
  SILENCE = 'silence',     // 沉默 - 无法使用仙术
  PROTECT = 'protect',     // 防护 - 减少受到的伤害
  HASTE = 'haste',         // 神行 - 提高速度
  REGEN = 'regen',         // 回春 - 每回合恢复HP
}

/**
 * Status effect instance
 */
export interface StatusEffect {
  type: StatusType;
  duration: number;  // Remaining turns
  intensity: number; // Effect strength
}

/**
 * Battle action types
 */
export enum ActionType {
  ATTACK = 'attack',     // 物理攻击
  SKILL = 'skill',       // 仙术
  ITEM = 'item',         // 使用道具
  DEFEND = 'defend',     // 防御
  FLEE = 'flee',         // 逃跑
}

/**
 * Target type for actions
 */
export enum TargetType {
  SINGLE = 'single',     // 单体
  ALL_ENEMY = 'all_enemy', // 敌方全体
  ALL_PLAYER = 'all_player', // 己方全体
  SELF = 'self',         // 自己
}

/**
 * Battle action
 */
export interface BattleAction {
  type: ActionType;
  actorId: string;
  targetIds: string[];
  skillId?: string;
  itemId?: string;
  damage?: number;
  healed?: number;
  message: string;
}

/**
 * Battle result
 */
export interface BattleResult {
  victory: boolean;
  expReward: number;
  goldReward: number;
  itemsReward: string[];
}

/**
 * Battle configuration passed to BattleScene
 */
export interface BattleConfig {
  enemies: EnemyData[];
  playerParty: Character[];
  battleId?: string;
  canFlee?: boolean;
}

/**
 * Enemy data for battle
 */
export interface EnemyData {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  luck: number;
  expReward: number;
  goldReward: number;
  itemDrops?: { itemId: string; probability: number }[];
  spriteKey?: string;
}

/**
 * Turn order entry
 */
export interface TurnEntry {
  unitId: string;
  order: number;
}

/**
 * Battle System class
 * Manages turn-based combat logic
 */
export class BattleSystem {
  private units: Map<string, BattleUnit> = new Map();
  private turnOrder: TurnEntry[] = [];
  private currentTurnIndex: number = 0;
  private roundNumber: number = 1;
  private actionQueue: BattleAction[] = [];
  private battleEnded: boolean = false;
  private battleResult: BattleResult | null = null;
  private canFlee: boolean = true;

  /**
   * Initialize battle with player party and enemies
   */
  initialize(config: BattleConfig): void {
    this.units.clear();
    this.turnOrder = [];
    this.currentTurnIndex = 0;
    this.roundNumber = 1;
    this.actionQueue = [];
    this.battleEnded = false;
    this.battleResult = null;
    this.canFlee = config.canFlee ?? true;

    // Add player party units
    for (const player of config.playerParty) {
      const unit: BattleUnit = {
        id: player.id,
        name: player.name,
        hp: player.hp,
        maxHp: player.maxHp,
        mp: player.mp,
        maxMp: player.maxMp,
        attack: player.attack,
        defense: player.defense,
        speed: player.speed,
        luck: player.luck,
        isPlayer: true,
        isDefending: false,
        statusEffects: [],
        skills: [], // Will be populated from character skills
      };
      this.units.set(unit.id, unit);
    }

    // Add enemy units
    for (const enemy of config.enemies) {
      const unit: BattleUnit = {
        id: enemy.id,
        name: enemy.name,
        hp: enemy.hp,
        maxHp: enemy.maxHp,
        mp: 0,
        maxMp: 0,
        attack: enemy.attack,
        defense: enemy.defense,
        speed: enemy.speed,
        luck: enemy.luck,
        isPlayer: false,
        isDefending: false,
        statusEffects: [],
        skills: [],
      };
      this.units.set(unit.id, unit);
    }

    // Calculate initial turn order
    this.calculateTurnOrder();
  }

  /**
   * Calculate turn order based on speed values
   * Higher speed = earlier action
   */
  calculateTurnOrder(): void {
    this.turnOrder = [];

    // Get all alive units
    const aliveUnits = this.getAllAliveUnits();

    // Sort by speed (descending), with luck as tiebreaker
    aliveUnits.sort((a, b) => {
      // Check for haste/paralyze status effects
      const aSpeed = this.getEffectiveSpeed(a);
      const bSpeed = this.getEffectiveSpeed(b);

      if (bSpeed !== aSpeed) {
        return bSpeed - aSpeed;
      }
      return b.luck - a.luck; // Tiebreaker by luck
    });

    // Assign turn order
    for (let i = 0; i < aliveUnits.length; i++) {
      this.turnOrder.push({
        unitId: aliveUnits[i].id,
        order: i + 1,
      });
    }
  }

  /**
   * Get effective speed considering status effects
   */
  private getEffectiveSpeed(unit: BattleUnit): number {
    let speed = unit.speed;

    for (const effect of unit.statusEffects) {
      if (effect.type === StatusType.HASTE) {
        speed *= 1.5; // 50% speed boost
      }
      if (effect.type === StatusType.PARALYZE) {
        speed = 0; // Cannot act
      }
    }

    return speed;
  }

  /**
   * Get all alive units
   */
  getAllAliveUnits(): BattleUnit[] {
    const alive: BattleUnit[] = [];
    for (const unit of this.units.values()) {
      if (unit.hp > 0) {
        alive.push(unit);
      }
    }
    return alive;
  }

  /**
   * Get all alive player units
   */
  getAlivePlayerUnits(): BattleUnit[] {
    return this.getAllAliveUnits().filter(u => u.isPlayer);
  }

  /**
   * Get all alive enemy units
   */
  getAliveEnemyUnits(): BattleUnit[] {
    return this.getAllAliveUnits().filter(u => !u.isPlayer);
  }

  /**
   * Get unit by ID
   */
  getUnit(id: string): BattleUnit | undefined {
    return this.units.get(id);
  }

  /**
   * Get current turn unit
   */
  getCurrentTurnUnit(): BattleUnit | null {
    if (this.currentTurnIndex >= this.turnOrder.length) {
      return null;
    }

    const entry = this.turnOrder[this.currentTurnIndex];
    const unit = this.units.get(entry.unitId);

    // Skip dead units
    if (unit && unit.hp <= 0) {
      this.moveToNextTurn();
      return this.getCurrentTurnUnit();
    }

    return unit ?? null;
  }

  /**
   * Move to next turn
   */
  moveToNextTurn(): void {
    this.currentTurnIndex++;

    // Check if round ended
    if (this.currentTurnIndex >= this.turnOrder.length) {
      this.endRound();
    }
  }

  /**
   * End current round and start new one
   */
  private endRound(): void {
    this.roundNumber++;
    this.currentTurnIndex = 0;

    // Process status effects
    for (const unit of this.units.values()) {
      if (unit.hp > 0) {
        this.processStatusEffects(unit);
      }
    }

    // Recalculate turn order for new round
    this.calculateTurnOrder();

    // Check battle end conditions
    this.checkBattleEnd();
  }

  /**
   * Process status effects at end of round
   */
  private processStatusEffects(unit: BattleUnit): void {
    for (const effect of unit.statusEffects) {
      effect.duration--;

      if (effect.duration <= 0) {
        // Remove expired effect
        unit.statusEffects = unit.statusEffects.filter(e => e !== effect);
        continue;
      }

      // Apply effect
      switch (effect.type) {
        case StatusType.POISON:
          const poisonDamage = Math.floor(unit.maxHp * 0.05 * effect.intensity);
          unit.hp = Math.max(0, unit.hp - poisonDamage);
          this.addAction({
            type: ActionType.SKILL,
            actorId: unit.id,
            targetIds: [unit.id],
            message: `${unit.name} 受到毒素伤害 ${poisonDamage}`,
            damage: poisonDamage,
          });
          break;

        case StatusType.REGEN:
          const regenHeal = Math.floor(unit.maxHp * 0.05 * effect.intensity);
          unit.hp = Math.min(unit.maxHp, unit.hp + regenHeal);
          this.addAction({
            type: ActionType.SKILL,
            actorId: unit.id,
            targetIds: [unit.id],
            message: `${unit.name} 恢复生命 ${regenHeal}`,
            healed: regenHeal,
          });
          break;
      }
    }
  }

  /**
   * Add action to queue
   */
  private addAction(action: BattleAction): void {
    this.actionQueue.push(action);
  }

  /**
   * Get pending actions
   */
  getPendingActions(): BattleAction[] {
    return [...this.actionQueue];
  }

  /**
   * Clear action queue
   */
  clearActions(): void {
    this.actionQueue = [];
  }

  /**
   * Execute attack action
   */
  executeAttack(actorId: string, targetId: string): BattleAction {
    const actor = this.units.get(actorId);
    const target = this.units.get(targetId);

    if (!actor || !target) {
      return {
        type: ActionType.ATTACK,
        actorId,
        targetIds: [targetId],
        message: '攻击失败',
      };
    }

    // Calculate damage
    let damage = this.calculatePhysicalDamage(actor, target);

    // Check for defending target
    if (target.isDefending) {
      damage = Math.floor(damage * 0.5);
    }

    // Apply damage
    target.hp = Math.max(0, target.hp - damage);

    // Wake sleeping targets
    if (target.statusEffects.some(e => e.type === StatusType.SLEEP)) {
      target.statusEffects = target.statusEffects.filter(e => e.type !== StatusType.SLEEP);
    }

    // Generate message
    const message = `${actor.name} 攻击 ${target.name}，造成 ${damage} 点伤害`;

    // Check for critical hit
    if (damage > actor.attack * 1.5) {
      return {
        type: ActionType.ATTACK,
        actorId,
        targetIds: [targetId],
        damage,
        message: `${message}（暴击！）`,
      };
    }

    return {
      type: ActionType.ATTACK,
      actorId,
      targetIds: [targetId],
      damage,
      message,
    };
  }

  /**
   * Execute multi-target attack action
   */
  executeMultiAttack(actorId: string, targetIds: string[]): BattleAction {
    const actor = this.units.get(actorId);

    if (!actor) {
      return {
        type: ActionType.ATTACK,
        actorId,
        targetIds,
        message: '攻击失败',
      };
    }

    let totalDamage = 0;
    const hitMessages: string[] = [];

    for (const targetId of targetIds) {
      const target = this.units.get(targetId);
      if (!target) continue;

      // Calculate damage for each target (slightly reduced for multi-target)
      let damage = Math.floor(this.calculatePhysicalDamage(actor, target) * 0.8);

      // Check for defending target
      if (target.isDefending) {
        damage = Math.floor(damage * 0.5);
      }

      // Apply damage
      target.hp = Math.max(0, target.hp - damage);
      totalDamage += damage;

      // Wake sleeping targets
      if (target.statusEffects.some(e => e.type === StatusType.SLEEP)) {
        target.statusEffects = target.statusEffects.filter(e => e.type !== StatusType.SLEEP);
      }

      hitMessages.push(`${target.name} ${damage}`);
    }

    return {
      type: ActionType.ATTACK,
      actorId,
      targetIds,
      damage: totalDamage,
      message: `${actor.name} 全体攻击！[${hitMessages.join(', ')}]`,
    };
  }

  /**
   * Execute skill action
   */
  executeSkill(actorId: string, skill: Skill, targetIds: string[]): BattleAction {
    const actor = this.units.get(actorId);

    if (!actor) {
      return {
        type: ActionType.SKILL,
        actorId,
        targetIds,
        skillId: skill.id,
        message: '仙术施放失败',
      };
    }

    // Check MP cost
    if (actor.mp < skill.mpCost) {
      return {
        type: ActionType.SKILL,
        actorId,
        targetIds,
        skillId: skill.id,
        message: `${actor.name} MP不足，无法使用 ${skill.name}`,
      };
    }

    // Consume MP
    actor.mp -= skill.mpCost;

    // Calculate total damage/healing
    let totalDamage = 0;
    let totalHealed = 0;
    const messages: string[] = [];

    for (const targetId of targetIds) {
      const target = this.units.get(targetId);
      if (!target) continue;

      // Check if skill is healing or damaging
      if (skill.targetType === 'self' || skill.targetType === 'all_player') {
        // Healing skill
        const healAmount = this.calculateSkillHeal(skill, actor, target);
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        totalHealed += healAmount;
        messages.push(`${target.name} 恢复 ${healAmount} HP`);
      } else {
        // Damaging skill
        let damage = this.calculateSkillDamage(skill, actor, target);

        // Check for defending target
        if (target.isDefending) {
          damage = Math.floor(damage * 0.5);
        }

        target.hp = Math.max(0, target.hp - damage);
        totalDamage += damage;
        messages.push(`${target.name} 受到 ${damage} 点伤害`);
      }
    }

    return {
      type: ActionType.SKILL,
      actorId,
      targetIds,
      skillId: skill.id,
      damage: totalDamage,
      healed: totalHealed,
      message: `${actor.name} 使用 ${skill.name}！${messages.join(', ')}`,
    };
  }

  /**
   * Execute defend action
   */
  executeDefend(actorId: string): BattleAction {
    const actor = this.units.get(actorId);

    if (!actor) {
      return {
        type: ActionType.DEFEND,
        actorId,
        targetIds: [],
        message: '防御失败',
      };
    }

    // Set defending status
    actor.isDefending = true;

    return {
      type: ActionType.DEFEND,
      actorId,
      targetIds: [],
      message: `${actor.name} 进入防御状态`,
    };
  }

  /**
   * Execute flee attempt
   */
  executeFlee(actorId: string): BattleAction {
    if (!this.canFlee) {
      return {
        type: ActionType.FLEE,
        actorId,
        targetIds: [],
        message: '此战无法逃跑！',
      };
    }

    const actor = this.units.get(actorId);

    if (!actor) {
      return {
        type: ActionType.FLEE,
        actorId,
        targetIds: [],
        message: '逃跑失败',
      };
    }

    // Calculate flee success based on luck and enemy levels
    const fleeChance = 0.3 + (actor.luck / 100) * 0.5;
    const fleeSuccess = Math.random() < fleeChance;

    if (fleeSuccess) {
      this.battleEnded = true;
      this.battleResult = {
        victory: false,
        expReward: 0,
        goldReward: 0,
        itemsReward: [],
      };

      return {
        type: ActionType.FLEE,
        actorId,
        targetIds: [],
        message: `${actor.name} 成功逃跑！`,
      };
    }

    return {
      type: ActionType.FLEE,
      actorId,
      targetIds: [],
      message: `${actor.name} 逃跑失败！`,
    };
  }

  /**
   * Calculate physical damage
   */
  private calculatePhysicalDamage(attacker: BattleUnit, target: BattleUnit): number {
    // Base damage = attack - defense
    let baseDamage = attacker.attack - target.defense;

    // Minimum damage of 1
    if (baseDamage < 1) baseDamage = 1;

    // Add variance (±20%)
    const variance = 0.2;
    const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
    let damage = Math.floor(baseDamage * randomFactor);

    // Check for critical hit based on luck
    const critChance = attacker.luck / 200; // Max 50% crit chance at luck 100
    if (Math.random() < critChance) {
      damage *= 2; // Critical hit doubles damage
    }

    return damage;
  }

  /**
   * Calculate skill damage
   */
  private calculateSkillDamage(skill: Skill, caster: BattleUnit, target: BattleUnit): number {
    // Skill damage = power + (caster.attack * 0.5) - target.defense
    let baseDamage = skill.power + Math.floor(caster.attack * 0.5) - target.defense;

    // Minimum damage
    if (baseDamage < 1) baseDamage = Math.floor(skill.power * 0.5);

    // Add variance (±15%)
    const variance = 0.15;
    const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
    let damage = Math.floor(baseDamage * randomFactor);

    return damage;
  }

  /**
   * Calculate skill healing
   */
  private calculateSkillHeal(skill: Skill, caster: BattleUnit, _target: BattleUnit): number {
    // Healing = power + (caster.luck * 0.5)
    let baseHeal = skill.power + Math.floor(caster.luck * 0.5);

    // Add variance (±10%)
    const variance = 0.1;
    const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
    let heal = Math.floor(baseHeal * randomFactor);

    return heal;
  }

  /**
   * Check battle end conditions
   */
  checkBattleEnd(): void {
    const alivePlayers = this.getAlivePlayerUnits();
    const aliveEnemies = this.getAliveEnemyUnits();

    if (alivePlayers.length === 0) {
      // Player defeat
      this.battleEnded = true;
      this.battleResult = {
        victory: false,
        expReward: 0,
        goldReward: 0,
        itemsReward: [],
      };
    } else if (aliveEnemies.length === 0) {
      // Player victory
      this.battleEnded = true;

      // Calculate rewards
      let totalExp = 0;
      let totalGold = 0;
      const items: string[] = [];

      // Sum rewards from all defeated enemies
      for (const unit of this.units.values()) {
        if (!unit.isPlayer && unit.hp <= 0) {
          // Get original enemy data - would need to store this
          // For now, use placeholder values
          totalExp += 10;
          totalGold += 5;
        }
      }

      this.battleResult = {
        victory: true,
        expReward: totalExp,
        goldReward: totalGold,
        itemsReward: items,
      };
    }
  }

  /**
   * Get round number
   */
  getRoundNumber(): number {
    return this.roundNumber;
  }

  /**
   * Get turn order
   */
  getTurnOrder(): TurnEntry[] {
    return [...this.turnOrder];
  }

  /**
   * Check if battle ended
   */
  isBattleEnded(): boolean {
    return this.battleEnded;
  }

  /**
   * Get battle result
   */
  getBattleResult(): BattleResult | null {
    return this.battleResult;
  }

  /**
   * Reset defending status at start of turn
   */
  resetDefending(unitId: string): void {
    const unit = this.units.get(unitId);
    if (unit) {
      unit.isDefending = false;
    }
  }

  /**
   * Apply status effect to unit
   */
  applyStatusEffect(unitId: string, effect: StatusEffect): void {
    const unit = this.units.get(unitId);
    if (unit) {
      unit.statusEffects.push(effect);
    }
  }

  /**
   * Get turn order position for a unit
   */
  getTurnPosition(unitId: string): number {
    for (let i = 0; i < this.turnOrder.length; i++) {
      if (this.turnOrder[i].unitId === unitId) {
        return i + 1;
      }
    }
    return 0;
  }
}