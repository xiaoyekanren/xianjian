/**
 * Map data types and interfaces
 * US-028: 地图数据配置 - 多层瓦片支持、碰撞数据、地图事件、切换点
 */

/**
 * Tile types for the map
 */
export enum TileType {
  GROUND = 0,      // Walkable ground (地面)
  WALL = 1,        // impassable wall/obstacle (墙)
  WATER = 2,       // Water (impassable without special ability) (水)
  DOOR = 3,        // Door/entrance (门)
  PATH = 4,        // Path/walkable (路)
  TRANSITION = 5,  // Map transition point (切换点)
  NPC_SPAWN = 6,   // NPC spawn point (NPC出生点)
  TREE = 7,        // Tree/vegetation (树)
  BUILDING = 8,    // Building structure (建筑)
  FENCE = 9,       // Fence/barrier (栏杆)
  CHEST = 10,      // Treasure chest (宝箱)
  EVENT = 11,      // Event trigger point (事件触发点)
}

/**
 * Map layer types (地图层类型)
 */
export enum LayerType {
  GROUND = 'ground',     // 地面层 - 基础可通行区域
  BUILDING = 'building', // 建筑层 - 墙壁、房屋等障碍物
  OVERLAY = 'overlay',   // 覆盖层 - 树木、装饰物等
  EVENT = 'event',       // 事件层 - 事件触发区域
}

/**
 * Tile properties (瓦片属性)
 */
export interface TileProperties {
  type: TileType;
  walkable: boolean;
  interactive?: boolean;
  collisionGroup?: string;   // 碰撞组名称
  collisionOffset?: {        // 碰撞偏移（用于非完整碰撞）
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Map transition data (地图切换数据)
 */
export interface MapTransitionData {
  id: string;               // 切换点唯一标识
  targetMapId: string;      // 目标地图ID
  targetX: number;          // 目标X坐标
  targetY: number;          // 目标Y坐标
  sourceX: number;          // 源地图X坐标
  sourceY: number;          // 源地图Y坐标
  direction?: 'up' | 'down' | 'left' | 'right';  // 切换方向
  requireFlag?: string;     // 需要的故事标志
  requireItem?: string;     // 需要的道具
}

/**
 * Map event data (地图事件数据)
 */
export interface MapEventData {
  id: string;               // 事件唯一标识
  type: MapEventType;       // 事件类型
  x: number;                // 事件触发X坐标
  y: number;                // 事件触发Y坐标
  triggerType: EventTriggerType;  // 触发方式
  triggerOnEnter?: boolean; // 进入时触发
  triggerOnInteract?: boolean; // 交互时触发
  dialogId?: string;        // 对话ID
  battleId?: string;        // 战斗ID
  treasureId?: string;      // 宝箱ID
  requireFlag?: string;     // 需要的故事标志
  setFlag?: string;         // 设置的故事标志
  removeFlag?: string;      // 移除的故事标志
  oneTime?: boolean;        // 是否一次性事件
  priority?: number;        // 事件优先级
}

/**
 * Map event types (地图事件类型)
 */
export enum MapEventType {
  DIALOG = 'dialog',        // 对话事件
  BATTLE = 'battle',        // 战斗事件
  TREASURE = 'treasure',    // 宝箱事件
  CUTSCENE = 'cutscene',    // 剧情事件
  SHOP = 'shop',            // 商店事件
  INN = 'inn',              // 客栈事件
  TELEPORT = 'teleport',    // 传送事件
  NPC_INTERACT = 'npc_interact', // NPC交互
  STORY_PROGRESS = 'story_progress', // 故事进度事件
}

/**
 * Event trigger types (事件触发类型)
 */
export enum EventTriggerType {
  ON_ENTER = 'on_enter',    // 进入区域触发
  ON_INTERACT = 'on_interact', // 交互触发（按键）
  ON_TOUCH = 'on_touch',    // 碰触触发
  AUTO = 'auto',            // 自动触发
}

/**
 * NPC spawn configuration (NPC出生配置)
 */
export interface NPCSpawnData {
  npcId: string;            // NPC唯一标识
  name: string;             // NPC名称
  dialogId: string;         // 默认对话ID
  x: number;                // 出生X坐标
  y: number;                // 出生Y坐标
  spriteKey?: string;       // 精灵资源键
  direction?: 'up' | 'down' | 'left' | 'right';  // 朝向
  movementType?: NPCMovementType; // 移动类型
  movementRange?: number;   // 移动范围
  interactEvent?: MapEventData; // 交互事件
  requireFlag?: string;     // 需要的故事标志才显示
  shopId?: string;          // 如果是商店NPC
}

/**
 * NPC movement types (NPC移动类型)
 */
export enum NPCMovementType {
  STATIC = 'static',        // 静止不动
  RANDOM = 'random',        // 随机移动
  PATROL = 'patrol',        //巡逻移动
  FOLLOW = 'follow',        // 跟随玩家
}

/**
 * Collision data (碰撞数据)
 */
export interface CollisionData {
  layerId: string;          // 所属层ID
  tileIds: number[];        // 碰撞瓦片ID列表
  collisionBoxes?: CollisionBox[]; // 自定义碰撞区域
}

/**
 * Collision box (碰撞区域)
 */
export interface CollisionBox {
  x: number;                // 区域起始X（瓦片坐标）
  y: number;                // 区域起始Y（瓦片坐标）
  width: number;            // 区域宽度（瓦片数）
  height: number;           // 区域高度（瓦片数）
  type: 'full' | 'partial'; // 碰撞类型
}

/**
 * Map layer data (地图层数据)
 */
export interface MapLayer {
  id: string;               // 层唯一标识
  name: string;             // 层名称
  type: LayerType;          // 层类型
  tiles: number[][];        // 瓦片数据（二维数组）
  visible: boolean;         // 是否可见
  opacity: number;          // 透明度 (0-1)
  properties?: Record<string, TileProperties>; //瓦片属性
  collision?: CollisionData; // 碰撞数据
}

/**
 * Map environment settings (地图环境设置)
 */
export interface MapEnvironment {
  timeOfDay?: 'day' | 'night' | 'dusk' | 'dawn'; // 时间
  weather?: 'clear' | 'rain' | 'snow' | 'fog';   // 天气
  ambientColor?: string;    // 环境光颜色
  backgroundColor?: string; // 背景颜色
  bgm?: string;             // 背景音乐ID
}

/**
 * Complete map data structure (完整地图数据结构)
 */
export interface MapData {
  id: string;               // 地图唯一标识
  name: string;             // 地图名称
  displayName: string;      // 显示名称（中文）
  description?: string;     // 地图描述
  locationId: string;       // 所属地点ID
  chapter?: number;         // 所属章节
  width: number;            // 地图宽度（瓦片数）
  height: number;           // 地图高度（瓦片数）
  tileWidth: number;        // 瓦片宽度（像素）
  tileHeight: number;       // 瓦片高度（像素）
  layers: MapLayer[];       // 地图层数据
  npcs: NPCSpawnData[];     // NPC出生数据
  transitions: MapTransitionData[]; // 地图切换点
  events: MapEventData[];   // 地图事件
  collisions: CollisionData[]; // 碰撞数据
  environment?: MapEnvironment; // 环境设置
  colorTheme?: {            // 颜色主题
    primary: string;        // 主色调
    secondary: string;      // 辅色调
    accent: string;         // 强调色
  };
}

/**
 * Map location data (地图地点数据)
 */
export interface MapLocation {
  id: string;               // 地点唯一标识
  name: string;             // 地点名称
  displayName: string;      // 显示名称
  maps: string[];           // 包含的地图ID列表
  shops?: string[];         // 商店ID列表
  inns?: string[];          // 客栈ID列表
}

/**
 * Default tile size for the game
 */
export const DEFAULT_TILE_SIZE = 32;

/**
 * Check if a tile type is walkable
 */
export function isTileWalkable(tileType: TileType): boolean {
  return tileType === TileType.GROUND ||
         tileType === TileType.PATH ||
         tileType === TileType.DOOR ||
         tileType === TileType.TRANSITION;
}

/**
 * Get tile type from tile value
 */
export function getTileTypeFromValue(value: number): TileType {
  switch (value) {
    case 0: return TileType.GROUND;
    case 1: return TileType.WALL;
    case 2: return TileType.WATER;
    case 3: return TileType.DOOR;
    case 4: return TileType.PATH;
    case 5: return TileType.TRANSITION;
    case 6: return TileType.NPC_SPAWN;
    case 7: return TileType.TREE;
    case 8: return TileType.BUILDING;
    case 9: return TileType.FENCE;
    case 10: return TileType.CHEST;
    case 11: return TileType.EVENT;
    default: return TileType.GROUND;
  }
}

/**
 * Get layer type from string value
 */
export function getLayerTypeFromValue(value: string): LayerType {
  switch (value) {
    case 'ground': return LayerType.GROUND;
    case 'building': return LayerType.BUILDING;
    case 'overlay': return LayerType.OVERLAY;
    case 'event': return LayerType.EVENT;
    default: return LayerType.GROUND;
  }
}