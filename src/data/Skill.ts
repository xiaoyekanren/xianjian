/**
 * Skill interface - Defines skill/spell properties
 * US-013: 仙术/技能系统
 */

/**
 * Target type for skills
 */
export type SkillTargetType = 'single' | 'all_enemy' | 'all_player' | 'self' | 'all';

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
  description?: string;
  learnLevel?: number;
}