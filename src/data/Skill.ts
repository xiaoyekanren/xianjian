// Skill interface placeholder
// Will define skills for US-013

export interface Skill {
  id: string;
  name: string;
  mpCost: number;
  power: number;
  element: string;
  targetType: 'single' | 'all' | 'self';
}