/**
 * Asset Generator - AI-generated art asset management
 * US-052: AI美术资源生成
 *
 * This system provides interfaces and configurations for managing
 * procedurally generated or AI-generated art assets.
 */

/**
 * Asset type enumeration
 */
export enum AssetType {
  CHARACTER_PORTRAIT = 'character_portrait',
  CHARACTER_SPRITE = 'character_sprite',
  ENEMY_SPRITE = 'enemy_sprite',
  MAP_TILE = 'map_tile',
  UI_ELEMENT = 'ui_element',
  BATTLE_EFFECT = 'battle_effect',
  ITEM_ICON = 'item_icon',
}

/**
 * Character portrait configuration
 */
export interface CharacterPortraitConfig {
  characterId: string;
  name: string;
  expressions: string[];
  style: 'anime' | 'realistic' | 'chibi';
  colorScheme: {
    hair: string;
    eyes: string;
    skin: string;
    clothes: string;
  };
}

/**
 * Character sprite configuration
 */
export interface CharacterSpriteConfig {
  characterId: string;
  name: string;
  direction: '4-way' | '8-way';
  frameCount: number;
  style: 'pixel' | 'hd' | '3d-render';
  size: { width: number; height: number };
  animationSpeed: number;
}

/**
 * Enemy sprite configuration
 */
export interface EnemySpriteConfig {
  enemyId: string;
  name: string;
  category: 'normal' | 'elite' | 'boss';
  size: { width: number; height: number };
  animations: string[];
}

/**
 * Map tile configuration
 */
export interface MapTileConfig {
  tileId: string;
  name: string;
  type: 'ground' | 'building' | 'decoration' | 'water' | 'collision';
  variations: number;
  size: number;
}

/**
 * UI element configuration
 */
export interface UIElementConfig {
  elementId: string;
  name: string;
  type: 'button' | 'panel' | 'icon' | 'frame' | 'background';
  style: 'classic' | 'modern' | 'fantasy' | 'minimal';
  size: { width: number; height: number };
}

/**
 * Battle effect configuration
 */
export interface BattleEffectConfig {
  effectId: string;
  name: string;
  type: 'physical' | 'fire' | 'ice' | 'lightning' | 'wind' | 'heal' | 'special';
  frames: number;
  size: { width: number; height: number };
}

/**
 * Generated asset metadata
 */
export interface GeneratedAsset {
  key: string;
  type: AssetType;
  path: string;
  width: number;
  height: number;
  frameCount?: number;
  generated: boolean;
  timestamp: number;
}

/**
 * Character portrait configurations
 */
export const CHARACTER_PORTRAITS: CharacterPortraitConfig[] = [
  {
    characterId: 'li_xiaoyao',
    name: '李逍遥',
    expressions: ['normal', 'happy', 'sad', 'angry', 'surprised', 'thinking', 'shy'],
    style: 'anime',
    colorScheme: { hair: '#2F1810', eyes: '#8B4513', skin: '#F5D0C5', clothes: '#4169E1' },
  },
  {
    characterId: 'zhao_linger',
    name: '赵灵儿',
    expressions: ['normal', 'happy', 'sad', 'angry', 'surprised', 'thinking', 'shy'],
    style: 'anime',
    colorScheme: { hair: '#1C1C1C', eyes: '#4169E1', skin: '#FFF0E6', clothes: '#98FB98' },
  },
  {
    characterId: 'lin_yueru',
    name: '林月如',
    expressions: ['normal', 'happy', 'sad', 'angry', 'surprised', 'thinking', 'shy'],
    style: 'anime',
    colorScheme: { hair: '#8B0000', eyes: '#228B22', skin: '#F5D0C5', clothes: '#FF69B4' },
  },
  {
    characterId: 'anu',
    name: '阿奴',
    expressions: ['normal', 'happy', 'sad', 'angry', 'surprised', 'thinking', 'shy'],
    style: 'anime',
    colorScheme: { hair: '#2F1810', eyes: '#DAA520', skin: '#DEB887', clothes: '#9932CC' },
  },
];

/**
 * Character sprite configurations
 */
export const CHARACTER_SPRITES: CharacterSpriteConfig[] = [
  {
    characterId: 'li_xiaoyao',
    name: '李逍遥',
    direction: '4-way',
    frameCount: 4,
    style: 'pixel',
    size: { width: 32, height: 48 },
    animationSpeed: 150,
  },
  {
    characterId: 'zhao_linger',
    name: '赵灵儿',
    direction: '4-way',
    frameCount: 4,
    style: 'pixel',
    size: { width: 32, height: 48 },
    animationSpeed: 150,
  },
  {
    characterId: 'lin_yueru',
    name: '林月如',
    direction: '4-way',
    frameCount: 4,
    style: 'pixel',
    size: { width: 32, height: 48 },
    animationSpeed: 150,
  },
  {
    characterId: 'anu',
    name: '阿奴',
    direction: '4-way',
    frameCount: 4,
    style: 'pixel',
    size: { width: 32, height: 48 },
    animationSpeed: 150,
  },
];

/**
 * Enemy sprite configurations
 */
export const ENEMY_SPRITES: EnemySpriteConfig[] = [
  { enemyId: 'ghost', name: '幽灵', category: 'normal', size: { width: 48, height: 48 }, animations: ['idle', 'attack', 'hurt', 'die'] },
  { enemyId: 'skeleton', name: '骷髅', category: 'normal', size: { width: 48, height: 48 }, animations: ['idle', 'attack', 'hurt', 'die'] },
  { enemyId: 'demon', name: '妖魔', category: 'normal', size: { width: 64, height: 64 }, animations: ['idle', 'attack', 'hurt', 'die'] },
  { enemyId: 'gargoyle', name: '石像鬼', category: 'elite', size: { width: 64, height: 64 }, animations: ['idle', 'attack', 'hurt', 'die'] },
  { enemyId: 'shadow', name: '暗影', category: 'elite', size: { width: 64, height: 64 }, animations: ['idle', 'attack', 'hurt', 'die'] },
  { enemyId: 'boss_guardian', name: '守护者', category: 'boss', size: { width: 96, height: 96 }, animations: ['idle', 'attack', 'skill', 'hurt', 'die'] },
  { enemyId: 'boss_demon_king', name: '妖王', category: 'boss', size: { width: 128, height: 128 }, animations: ['idle', 'attack', 'skill', 'hurt', 'die'] },
  { enemyId: 'baiyue_leader', name: '拜月教主', category: 'boss', size: { width: 128, height: 128 }, animations: ['idle', 'attack', 'skill', 'hurt', 'die'] },
];

/**
 * Map tile configurations
 */
export const MAP_TILES: MapTileConfig[] = [
  { tileId: 'grass', name: '草地', type: 'ground', variations: 4, size: 32 },
  { tileId: 'path', name: '道路', type: 'ground', variations: 2, size: 32 },
  { tileId: 'water', name: '水面', type: 'water', variations: 4, size: 32 },
  { tileId: 'wall', name: '墙壁', type: 'collision', variations: 8, size: 32 },
  { tileId: 'building', name: '建筑', type: 'building', variations: 16, size: 32 },
  { tileId: 'tree', name: '树木', type: 'decoration', variations: 4, size: 32 },
  { tileId: 'flower', name: '花朵', type: 'decoration', variations: 6, size: 32 },
];

/**
 * UI element configurations
 */
export const UI_ELEMENTS: UIElementConfig[] = [
  { elementId: 'button_primary', name: '主按钮', type: 'button', style: 'fantasy', size: { width: 200, height: 50 } },
  { elementId: 'button_secondary', name: '次要按钮', type: 'button', style: 'fantasy', size: { width: 150, height: 40 } },
  { elementId: 'panel_main', name: '主面板', type: 'panel', style: 'fantasy', size: { width: 400, height: 300 } },
  { elementId: 'panel_dialog', name: '对话面板', type: 'panel', style: 'fantasy', size: { width: 600, height: 150 } },
  { elementId: 'icon_item', name: '物品图标', type: 'icon', style: 'fantasy', size: { width: 48, height: 48 } },
  { elementId: 'icon_skill', name: '技能图标', type: 'icon', style: 'fantasy', size: { width: 48, height: 48 } },
  { elementId: 'frame_golden', name: '金色边框', type: 'frame', style: 'fantasy', size: { width: 64, height: 64 } },
];

/**
 * Battle effect configurations
 */
export const BATTLE_EFFECTS: BattleEffectConfig[] = [
  { effectId: 'slash', name: '斩击', type: 'physical', frames: 8, size: { width: 96, height: 96 } },
  { effectId: 'fire_ball', name: '火球', type: 'fire', frames: 12, size: { width: 64, height: 64 } },
  { effectId: 'ice_crystal', name: '冰晶', type: 'ice', frames: 10, size: { width: 64, height: 64 } },
  { effectId: 'lightning', name: '闪电', type: 'lightning', frames: 6, size: { width: 96, height: 128 } },
  { effectId: 'wind_blade', name: '风刃', type: 'wind', frames: 8, size: { width: 96, height: 48 } },
  { effectId: 'heal', name: '治愈', type: 'heal', frames: 12, size: { width: 64, height: 64 } },
  { effectId: 'nuwa_power', name: '女娲神威', type: 'special', frames: 24, size: { width: 256, height: 256 } },
];

/**
 * Asset Generator class
 * Manages asset generation configuration and metadata
 */
export class AssetGenerator {
  private generatedAssets: Map<string, GeneratedAsset> = new Map();

  /**
   * Get asset key for a specific asset
   */
  getAssetKey(type: AssetType, id: string, variant?: string): string {
    const base = `${type}_${id}`;
    return variant ? `${base}_${variant}` : base;
  }

  /**
   * Register a generated asset
   */
  registerAsset(asset: GeneratedAsset): void {
    this.generatedAssets.set(asset.key, asset);
  }

  /**
   * Check if asset is generated
   */
  isAssetGenerated(key: string): boolean {
    const asset = this.generatedAssets.get(key);
    return asset?.generated ?? false;
  }

  /**
   * Get asset metadata
   */
  getAssetMetadata(key: string): GeneratedAsset | undefined {
    return this.generatedAssets.get(key);
  }

  /**
   * Get all generated assets
   */
  getAllGeneratedAssets(): GeneratedAsset[] {
    return Array.from(this.generatedAssets.values());
  }

  /**
   * Get all assets by type
   */
  getAssetsByType(type: AssetType): GeneratedAsset[] {
    return Array.from(this.generatedAssets.values()).filter(a => a.type === type);
  }

  /**
   * Generate placeholder asset key
   */
  generatePlaceholderKey(type: AssetType, id: string): string {
    return `placeholder_${type}_${id}`;
  }

  /**
   * Check if using placeholder
   */
  isPlaceholder(key: string): boolean {
    return key.startsWith('placeholder_');
  }

  /**
   * Export asset registry
   */
  exportRegistry(): GeneratedAsset[] {
    return Array.from(this.generatedAssets.values());
  }

  /**
   * Import asset registry
   */
  importRegistry(assets: GeneratedAsset[]): void {
    for (const asset of assets) {
      this.generatedAssets.set(asset.key, asset);
    }
  }
}

/**
 * Default asset generator instance
 */
export const assetGenerator = new AssetGenerator();