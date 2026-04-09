/**
 * Skill interface - Defines skill/spell properties
 * US-013: 仙术/技能系统
 */

import { StatusType } from '@/entities/Character';

/**
 * Target type for skills
 */
export type SkillTargetType = 'single' | 'all_enemy' | 'all_player' | 'self' | 'all';

/**
 * Status effect configuration on a skill
 */
export interface SkillStatusEffect {
  type: StatusType;
  duration: number;
  intensity: number;
}

/**
 * Skill interface
 */
export interface Skill {
  id: string;
  name: string;
  mpCost: number;
  power: number;
  element: string;
  targetType: SkillTargetType;
  targetTypeName?: string;  // Display name for target type (单体/全体/自身)
  description?: string;
  learnLevel?: number;
  statusEffect?: SkillStatusEffect;  // Status effect applied by this skill
  healing?: number;  // Healing power (if skill is healing type)
}

/**
 * Load skills from JSON data
 */
export function loadSkillsFromJson(jsonData: unknown): Skill[] {
  const data = jsonData as { skills: Skill[] };
  if (!data.skills || !Array.isArray(data.skills)) {
    console.warn('Invalid skills data format');
    return [];
  }
  return data.skills;
}