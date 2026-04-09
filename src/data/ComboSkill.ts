/**
 * Combo Skill System - Combined attacks requiring multiple characters
 * US-027: 合体技能系统
 */

import { Skill } from '@/data/Skill';
import { AffectionCharacterId } from '@/systems/AffectionSystem';

/**
 * Combo skill participant
 */
export interface ComboParticipant {
  characterId: string;
  mpCost: number;
  required: boolean;  // If true, must be alive and in battle to use
}

/**
 * Combo skill extends regular skill with multi-character requirements
 */
export interface ComboSkill extends Skill {
  type: 'combo';
  participants: ComboParticipant[];
  affectionRequirements?: Partial<Record<AffectionCharacterId, number>>;
  animationType: 'flashy' | 'spectacular' | 'ultimate';
}

/**
 * Combo skill execution result
 */
export interface ComboSkillResult {
  success: boolean;
  message: string;
  damage: number;
  healed: number;
  participantsUsed: string[];
  mpConsumed: Record<string, number>;
}

/**
 * Combo skill requirement check result
 */
export interface ComboSkillCheck {
  available: boolean;
  reason?: string;
  missingParticipants?: string[];
  missingAffection?: Partial<Record<AffectionCharacterId, number>>;
}

/**
 * Default combo skills configuration
 * These are powerful combined attacks requiring multiple party members
 */
export const DEFAULT_COMBO_SKILLS: ComboSkill[] = [
  // === 双人合体技 ===
  {
    id: 'sword_dance',
    name: '剑舞乾坤',
    type: 'combo',
    mpCost: 35,  // Total MP cost shared
    power: 150,
    element: '物理',
    targetType: 'all_enemy',
    targetTypeName: '全体',
    description: '李逍遥与林月如联手施展的剑术，剑影如舞，威力惊人',
    participants: [
      { characterId: 'li_xiaoyao', mpCost: 18, required: true },
      { characterId: 'lin_yueru', mpCost: 17, required: true },
    ],
    affectionRequirements: { zhao_linger: 60, lin_yueru: 60 },
    animationType: 'flashy',
  },
  {
    id: 'immortal_demon',
    name: '仙魔同归',
    type: 'combo',
    mpCost: 45,
    power: 180,
    element: '灵力',
    targetType: 'all_enemy',
    targetTypeName: '全体',
    description: '赵灵儿与林月如联手施展，仙魔之力交汇，毁灭性打击',
    participants: [
      { characterId: 'zhao_linger', mpCost: 25, required: true },
      { characterId: 'lin_yueru', mpCost: 20, required: true },
    ],
    affectionRequirements: { zhao_linger: 80, lin_yueru: 80 },
    animationType: 'flashy',
  },
  {
    id: 'spirit_storm',
    name: '灵神风暴',
    type: 'combo',
    mpCost: 40,
    power: 160,
    element: '灵力',
    targetType: 'all_enemy',
    targetTypeName: '全体',
    description: '赵灵儿与阿奴联手施展的灵力风暴',
    participants: [
      { characterId: 'zhao_linger', mpCost: 22, required: true },
      { characterId: 'anu', mpCost: 18, required: true },
    ],
    affectionRequirements: { zhao_linger: 70, anu: 70 },
    animationType: 'flashy',
  },
  {
    id: 'shadow_blade',
    name: '影刃绝杀',
    type: 'combo',
    mpCost: 38,
    power: 145,
    element: '物理',
    targetType: 'all_enemy',
    targetTypeName: '全体',
    description: '林月如与阿奴联手施展的暗影剑术',
    participants: [
      { characterId: 'lin_yueru', mpCost: 20, required: true },
      { characterId: 'anu', mpCost: 18, required: true },
    ],
    affectionRequirements: { lin_yueru: 70, anu: 70 },
    animationType: 'flashy',
  },

  // === 四人合体技 ===
  {
    id: 'four_directions',
    name: '四方合击',
    type: 'combo',
    mpCost: 80,
    power: 250,
    element: '物理',
    targetType: 'all_enemy',
    targetTypeName: '全体',
    description: '四人联手施展的合击技，四方之力汇聚一处',
    participants: [
      { characterId: 'li_xiaoyao', mpCost: 20, required: true },
      { characterId: 'zhao_linger', mpCost: 20, required: true },
      { characterId: 'lin_yueru', mpCost: 20, required: true },
      { characterId: 'anu', mpCost: 20, required: true },
    ],
    affectionRequirements: { zhao_linger: 50, lin_yueru: 50, anu: 50 },
    animationType: 'spectacular',
  },
  {
    id: 'nuwa_power',
    name: '女娲神威',
    type: 'combo',
    mpCost: 120,
    power: 400,
    element: '灵力',
    targetType: 'all_enemy',
    targetTypeName: '全体',
    description: '四人终极合体技，召唤女娲神力，天地变色',
    participants: [
      { characterId: 'li_xiaoyao', mpCost: 30, required: true },
      { characterId: 'zhao_linger', mpCost: 40, required: true },
      { characterId: 'lin_yueru', mpCost: 25, required: true },
      { characterId: 'anu', mpCost: 25, required: true },
    ],
    affectionRequirements: { zhao_linger: 90, lin_yueru: 90, anu: 90 },
    animationType: 'ultimate',
  },
];

/**
 * Combo Skill System class
 * Manages combo skill availability and execution
 */
export class ComboSkillSystem {
  private comboSkills: ComboSkill[] = [];

  /**
   * Initialize with combo skills
   */
  constructor(skills: ComboSkill[] = DEFAULT_COMBO_SKILLS) {
    this.comboSkills = skills;
  }

  /**
   * Get all combo skills
   */
  getAllComboSkills(): ComboSkill[] {
    return [...this.comboSkills];
  }

  /**
   * Get combo skill by ID
   */
  getComboSkill(skillId: string): ComboSkill | undefined {
    return this.comboSkills.find(s => s.id === skillId);
  }

  /**
   * Check if combo skill can be used
   * Returns availability status and reason if unavailable
   */
  checkComboSkillAvailability(
    skillId: string,
    partyMembers: string[],
    partyMp: Record<string, number>,
    affectionLevels: Partial<Record<AffectionCharacterId, number>>
  ): ComboSkillCheck {
    const skill = this.getComboSkill(skillId);
    if (!skill) {
      return { available: false, reason: '合体技不存在' };
    }

    // Check all required participants are alive and in battle
    const missingParticipants: string[] = [];
    for (const participant of skill.participants) {
      if (participant.required) {
        const memberInParty = partyMembers.includes(participant.characterId);
        if (!memberInParty) {
          missingParticipants.push(participant.characterId);
        } else {
          // Check MP
          const currentMp = partyMp[participant.characterId] ?? 0;
          if (currentMp < participant.mpCost) {
            missingParticipants.push(`${participant.characterId} (MP不足)`);
          }
        }
      }
    }

    if (missingParticipants.length > 0) {
      return {
        available: false,
        reason: '参与者不在队伍中或MP不足',
        missingParticipants,
      };
    }

    // Check affection requirements
    if (skill.affectionRequirements) {
      const missingAffection: Partial<Record<AffectionCharacterId, number>> = {};
      for (const charId of Object.keys(skill.affectionRequirements) as AffectionCharacterId[]) {
        const required = skill.affectionRequirements[charId] ?? 0;
        const current = affectionLevels[charId] ?? 0;
        if (current < required) {
          missingAffection[charId] = required - current;
        }
      }

      if (Object.keys(missingAffection).length > 0) {
        return {
          available: false,
          reason: '好感度未达标',
          missingAffection,
        };
      }
    }

    return { available: true };
  }

  /**
   * Get available combo skills for current party
   */
  getAvailableComboSkills(
    partyMembers: string[],
    partyMp: Record<string, number>,
    affectionLevels: Partial<Record<AffectionCharacterId, number>>
  ): ComboSkill[] {
    return this.comboSkills.filter(skill => {
      const check = this.checkComboSkillAvailability(
        skill.id,
        partyMembers,
        partyMp,
        affectionLevels
      );
      return check.available;
    });
  }

  /**
   * Get combo skill display info for UI
   */
  getComboSkillDisplayInfo(
    skillId: string,
    partyMembers: string[],
    partyMp: Record<string, number>,
    affectionLevels: Partial<Record<AffectionCharacterId, number>>
  ): {
    skill: ComboSkill;
    available: boolean;
    participantsStatus: { characterId: string; inParty: boolean; hasMp: boolean }[];
    affectionStatus: { characterId: AffectionCharacterId; current: number; required: number }[];
  } {
    const skill = this.getComboSkill(skillId);
    if (!skill) {
      throw new Error(`Combo skill ${skillId} not found`);
    }

    const check = this.checkComboSkillAvailability(skillId, partyMembers, partyMp, affectionLevels);

    // Build participant status
    const participantsStatus = skill.participants.map(p => ({
      characterId: p.characterId,
      inParty: partyMembers.includes(p.characterId),
      hasMp: (partyMp[p.characterId] ?? 0) >= p.mpCost,
    }));

    // Build affection status
    const affectionStatus: { characterId: AffectionCharacterId; current: number; required: number }[] = [];
    if (skill.affectionRequirements) {
      for (const charId of Object.keys(skill.affectionRequirements) as AffectionCharacterId[]) {
        affectionStatus.push({
          characterId: charId,
          current: affectionLevels[charId] ?? 0,
          required: skill.affectionRequirements[charId] ?? 0,
        });
      }
    }

    return {
      skill,
      available: check.available,
      participantsStatus,
      affectionStatus,
    };
  }

  /**
   * Calculate combo skill damage
   * Combo skills have bonus damage based on number of participants
   */
  calculateComboDamage(skill: ComboSkill, participantStats: { attack: number }[]): number {
    // Base damage from skill power
    let baseDamage = skill.power;

    // Add attack contribution from all participants
    for (const stats of participantStats) {
      baseDamage += Math.floor(stats.attack * 0.3);
    }

    // Combo bonus: +20% for each additional participant beyond 2
    const participantCount = skill.participants.length;
    const comboBonus = 1 + (participantCount - 2) * 0.2;

    // Apply variance (±10%)
    const variance = 0.1;
    const randomFactor = 1 + (Math.random() * 2 - 1) * variance;

    return Math.floor(baseDamage * comboBonus * randomFactor);
  }
}