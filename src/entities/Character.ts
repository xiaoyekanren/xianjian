// Character entity placeholder
// Will define player and NPC entities

export interface Character {
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
  level: number;
}

export class CharacterEntity {
  // Placeholder for US-008 implementation
}