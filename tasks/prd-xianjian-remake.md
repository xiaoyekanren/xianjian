# PRD: 仙剑奇侠传现代重制版

## Introduction

开发仙剑奇侠传1995年原版的现代重制版游戏。保持原版经典剧情和回合制战斗核心，使用Web技术（HTML5 + TypeScript + Phaser.js）重新设计画面和UI，采用现代扁平化卡通风格。目标是通过渐进式开发策略，完成完整重制版（约20-30小时游戏内容）。

---

## Goals

- 完全还原原版剧情（11章节+锁妖塔）
- 实现经典回合制战斗系统，支持四人战斗
- 采用现代扁平化卡通美术风格
- 实现好感度系统和合体技能
- 支持多结局（灵儿结局、月如结局、全员存活结局）
- 跨平台运行（PC/Mac/手机浏览器）
- 分阶段渐进式开发，每阶段有可玩版本

---

## User Stories

### US-001: 项目架构搭建
**Description:** As a developer, I need to set up the project structure so that development can proceed efficiently.

**Acceptance Criteria:**
- [ ] 创建项目目录结构（src/core, src/scenes, src/systems, src/entities, src/data）
- [ ] 配置package.json、tsconfig.json、vite.config.ts
- [ ] Phaser.js框架集成成功
- [ ] TypeScript编译通过
- [ ] 开发服务器可启动运行

### US-002: 游戏主控制器实现
**Description:** As a developer, I need a main game controller to manage the game lifecycle.

**Acceptance Criteria:**
- [ ] Game.ts实现游戏初始化和生命周期管理
- [ ] SceneManager.ts实现场景切换逻辑
- [ ] InputManager.ts处理键盘/触屏输入
- [ ] AudioManager.ts管理音效播放
- [ ] Typecheck passes

### US-003: 启动场景和主菜单
**Description:** As a player, I want to see a title screen and menu so I can start or continue the game.

**Acceptance Criteria:**
- [ ] BootScene.ts加载游戏资源并显示进度
- [ ] MainMenuScene.ts显示标题和菜单选项（新游戏、继续、设置）
- [ ] 菜单选项可通过键盘/点击选择
- [ ] 中文标题"仙剑奇侠传"正确显示
- [ ] Typecheck passes
- [ ] Verify in browser

### US-004: 地图探索场景实现
**Description:** As a player, I want to explore maps so I can move around towns and dungeons.

**Acceptance Criteria:**
- [ ] WorldScene.ts实现基于瓦片的地图渲染
- [ ] 玩家角色可在地图上四方向行走
- [ ] 碰撞检测阻止进入障碍区域
- [ ] 地图切换点可传送至其他地图
- [ ] NPC可交互触发对话
- [ ] Typecheck passes
- [ ] Verify in browser

### US-005: 对话系统实现
**Description:** As a player, I want to engage in dialogues so I can experience the story.

**Acceptance Criteria:**
- [ ] DialogScene.ts显示对话界面
- [ ] 显示说话者名字、头像、对话内容
- [ ] 支持表情切换（normal, happy, sad等）
- [ ] 选项对话支持玩家选择
- [ ] 对话可触发事件（获得物品、进入战斗等）
- [ ] Typecheck passes
- [ ] Verify in browser

### US-006: 回合制战斗系统实现
**Description:** As a player, I want to engage in turn-based combat so I can defeat enemies.

**Acceptance Criteria:**
- [ ] BattleScene.ts实现战斗场景
- [ ] 显示玩家队伍（最多4人）和敌人
- [ ] 玩家可选行动：攻击、仙术、道具、防御、逃跑
- [ ] 按速度值决定行动顺序
- [ ] 正确计算伤害（物理/仙术）
- [ ] 战斗胜利/失败判定
- [ ] Typecheck passes
- [ ] Verify in browser

### US-007: 战斗UI界面
**Description:** As a player, I want clear battle UI so I can easily control my characters.

**Acceptance Criteria:**
- [ ] 显示所有角色HP/MP状态条
- [ ] 行动按钮清晰可见且可点击
- [ ] 仙术选择菜单列出可用技能
- [ ] 敌人选择界面（单体/全体）
- [ ] 战斗消息显示区域
- [ ] Typecheck passes
- [ ] Verify in browser

### US-008: 角色数据系统
**Description:** As a developer, I need character data structures so the game can manage player and enemy stats.

**Acceptance Criteria:**
- [ ] Character接口定义完整属性（HP, MP, 攻击, 防御, 速度, 运气）
- [ ] 支持等级和成长系数
- [ ] 仙术列表和学习等级配置
- [ ] 装备槽位（武器、防具、饰品）
- [ ] characters.json配置四大主角数据
- [ ] Typecheck passes

### US-009: 李逍遥角色实现
**Description:** As a player, I want the main character Li Xiaoyao so I can start the game.

**Acceptance Criteria:**
- [ ] 李逍遥初始属性正确（HP120, MP30, 攻击18, 防御12）
- [ ] 学习御剑术（Lv1）、天师符法（Lv5）等仙术
- [ ] 成长系数配置正确
- [ ] 行走精灵图四方向动画
- [ ] 对话立绘和表情系统
- [ ] Typecheck passes

### US-010: 赵灵儿角色实现
**Description:** As a player, I want Zhao Ling'er as a party member with her unique skills.

**Acceptance Criteria:**
- [ ] 赵灵儿加入时属性正确（HP80, MP80高灵力）
- [ ] 五气朝元等恢复仙术
- [ ] 风咒、雷咒等攻击仙术学习等级配置
- [ ] 行走精灵图和立绘
- [ ] Typecheck passes

### US-011: 林月如角色实现
**Description:** As a player, I want Lin Yue Ru as a physical attack specialist.

**Acceptance Criteria:**
- [ ] 林月如Lv8加入时属性正确（高攻击）
- [ ] 七诀剑气等物理技能
- [ ] 苏州比武招亲剧情触发加入
- [ ] 锁妖塔牺牲剧情实现
- [ ] 行走精灵图和立绘
- [ ] Typecheck passes

### US-012: 阿奴角色实现
**Description:** As a player, I want A Nu as a support character with unique Miao skills.

**Acceptance Criteria:**
- [ ] 阿奴Lv15加入时属性正确（高速度、高运气）
- [ ] 鬼降、祭天等辅助/减益仙术
- [ ] 苗族篇加入剧情触发
- [ ] 行走精灵图和立绘
- [ ] Typecheck passes

### US-013: 仙术/技能系统
**Description:** As a player, I want to use skills in battle so I can deal more damage or heal.

**Acceptance Criteria:**
- [ ] Skill接口定义完整（名称、MP消耗、威力、属性、目标类型）
- [ ] 攻击仙术：御剑术、冰咒、雷咒、火咒、风咒等
- [ ] 恢复仙术：五气朝元、玄冰咒等
- [ ] 仙术特效动画显示
- [ ] skills.json配置完整仙术数据
- [ ] Typecheck passes

### US-014: 物品系统实现
**Description:** As a player, I want to use items so I can heal or equip better gear.

**Acceptance Criteria:**
- [ ] Item接口定义类型（消耗品、武器、防具、饰品、剧情道具）
- [ ] 消耗品效果配置（止血草HP+50等）
- [ ] 装备属性加成配置
- [ ] 物品可在战斗/菜单中使用
- [ ] items.json配置完整物品数据
- [ ] Typecheck passes

### US-015: 物品/装备管理界面
**Description:** As a player, I want to manage my inventory so I can use items and equip gear.

**Acceptance Criteria:**
- [ ] 显示所有物品列表
- [ ] 消耗品可使用并显示效果
- [ ] 装备可穿戴/卸下
- [ ] 显示物品描述和价格
- [ ] Typecheck passes
- [ ] Verify in browser

### US-016: 存档系统实现
**Description:** As a player, I want to save my progress so I can continue later.

**Acceptance Criteria:**
- [ ] SaveData接口定义完整存档内容
- [ ] 5个存档槽位
- [ ] 保存当前地图、位置、剧情进度
- [ ] 保存角色状态和物品
- [ ] 保存好感度数据
- [ ] localStorage持久化存储
- [ ] Typecheck passes

### US-017: 存档/读档界面
**Description:** As a player, I want to select save slots so I can manage multiple playthroughs.

**Acceptance Criteria:**
- [ ] 显示5个存档槽位及信息（时间、进度）
- [ ] 存档缩略图显示（可选）
- [ ] 空槽位可新建存档
- [ ] 已有槽位可读取或覆盖
- [ ] Typecheck passes
- [ ] Verify in browser

### US-018: 商店系统实现
**Description:** As a player, I want to buy/sell items so I can prepare for battles.

**Acceptance Criteria:**
- [ ] ShopSystem.ts实现买卖逻辑
- [ ] 显示商店物品列表和价格
- [ ] 购买扣款并添加物品
- [ ] 出售获得金钱
- [ ] shop.json配置各城镇商店数据
- [ ] Typecheck passes

### US-019: 商店界面
**Description:** As a player, I want a clear shop interface so I can easily buy items.

**Acceptance Criteria:**
- [ ] 物品名称、价格、数量清晰显示
- [ ] 当前金钱显示
- [ ] 购买/出售切换
- [ ] Typecheck passes
- [ ] Verify in browser

### US-020: 旅馆系统实现
**Description:** As a player, I want to rest at inns so I can fully recover HP/MP.

**Acceptance Criteria:**
- [ ] 旅馆可完全恢复HP/MP
- [ ] 解除所有负面状态
- [ ] 扣除住宿费用
- [ ] 自动存档
- [ ] Typecheck passes

### US-021: 状态效果系统
**Description:** As a player, I want status effects to affect combat so battles are more strategic.

**Acceptance Criteria:**
- [ ] 负面状态：中毒、眩晕、睡眠、沉默等
- [ ] 正面状态：防护、神行、回春等
- [ ] 状态持续回合数管理
- [ ] 状态图标显示
- [ ] 状态解除物品/仙术可用
- [ ] Typecheck passes

### US-022: 经验值与升级系统
**Description:** As a player, I want to level up so my characters become stronger.

**Acceptance Criteria:**
- [ ] 战斗胜利获得经验值和金钱
- [ ] 累计经验值达到阈值触发升级
- [ ] 升级时属性按成长系数提升
- [ ] 达到特定等级学会新仙术
- [ ] HP/MP恢复满
- [ ] 升级动画显示
- [ ] Typecheck passes

### US-023: 战斗掉落系统
**Description:** As a player, I want rewards after battles so I can gain items.

**Acceptance Criteria:**
- [ ] BattleReward接口定义奖励
- [ ] 物品掉落概率计算
- [ ] 战斗结束显示获得的EXP/Gold/Items
- [ ] Typecheck passes

### US-024: 宝箱系统
**Description:** As a player, I want to find treasure chests so I can get rewards.

**Acceptance Criteria:**
- [ ] TreasureBox接口定义位置和内容
- [ ] 宝箱可交互打开
- [ ] 打开后获得物品
- [ ] 已打开状态记录
- [ ] Typecheck passes

### US-025: 好感度系统实现
**Description:** As a player, I want to build relationships so I can unlock combo skills.

**Acceptance Criteria:**
- [ ] AffectionSystem管理三人好感度（0-100）
- [ ] 对话选择影响好感度
- [ ] 赠送礼物增加好感度
- [ ] 好感度等级划分（冷淡/普通/友好/亲密/深爱）
- [ ] Typecheck passes

### US-026: 好感度界面
**Description:** As a player, I want to view affection levels so I know my progress.

**Acceptance Criteria:**
- [ ] 显示三人好感度进度条
- [ ] 显示当前等级名称和颜色
- [ ] 显示已解锁/未解锁合体技
- [ ] Typecheck passes
- [ ] Verify in browser

### US-027: 合体技能系统
**Description:** As a player, I want combo skills so I can deal powerful attacks.

**Acceptance Criteria:**
- [ ] ComboSkill接口定义合体技
- [ ] 四人合体技：四方合击、女娲神威
- [ ] 双人合体技：剑舞乾坤、仙魔同归
- [ ] 好感度解锁条件判定
- [ ] 合体技华丽特效
- [ ] Typecheck passes

### US-028: 地图数据配置
**Description:** As a developer, I need map data so the game can render locations.

**Acceptance Criteria:**
- [ ] MapData接口定义地图结构
- [ ] 多层瓦片支持（地面/建筑/覆盖）
- [ ] 碰撞数据配置
- [ ] 地图事件配置
- [ ] 地图切换点配置
- [ ] maps.json配置所有地图数据
- [ ] Typecheck passes

### US-029: 余杭镇地图实现
**Description:** As a player, I want to explore Yuhang Town so I can start the game.

**Acceptance Criteria:**
- [ ] 余杭镇地图瓦片渲染正确
- [ ] 李逍遥家、酒馆等关键地点可进入
- [ ] NPC可交互（婶婶、醉道士等）
- [ ] 城镇色调温暖（暖黄、棕色）
- [ ] Typecheck passes
- [ ] Verify in browser

### US-030: 仙灵岛迷宫实现
**Description:** As a player, I want to explore Fairy Island so I can meet Ling'er.

**Acceptance Criteria:**
- [ ] 仙灵岛迷宫地图渲染
- [ ] 迷宫路径和机关
- [ ] 荷花池场景
- [ ] 遇赵灵儿剧情触发
- [ ] 神秘氛围色调（青绿、淡蓝）
- [ ] Typecheck passes
- [ ] Verify in browser

### US-031: 苏州城地图实现
**Description:** As a player, I want to explore Suzhou so I can join the martial arts contest.

**Acceptance Criteria:**
- [ ] 苏州城地图渲染
- [ ] 林家堡、客栈等地点
- [ ] 比武招亲场景触发
- [ ] 繁华色调（红色、金色）
- [ ] Typecheck passes
- [ ] Verify in browser

### US-032: 锁妖塔实现
**Description:** As a player, I want to explore the Demon Lock Tower so I can save Ling'er.

**Acceptance Criteria:**
- [ ] 锁妖塔5层+底层地图
- [ ] 各层敌人配置
- [ ] 机关解谜
- [ ] 找到灵儿剧情
- [ ] 月如牺牲剧情触发
- [ ] 压抑色调（深紫、黑色）
- [ ] Typecheck passes
- [ ] Verify in browser

### US-033: 苗族地图实现
**Description:** As a player, I want to explore Miao territory so I can collect Spirit Pearls.

**Acceptance Criteria:**
- [ ] 黑苗族、白苗族城镇地图
- [ ] 苗族圣地迷宫
- [ ] 五灵珠收集点
- [ ] 异域风情色调（翠绿、紫色）
- [ ] Typecheck passes
- [ ] Verify in browser

### US-034: 剧情脚本系统
**Description:** As a developer, I need story scripts so the narrative can be played.

**Acceptance Criteria:**
- [ ] story.json配置完整剧情节点
- [ ] 剧情触发条件配置
- [ ] 剧情事件（对话、战斗、获得物品）
- [ ] 剧情进度追踪
- [ ] Typecheck passes

### US-035: 第一章剧情实现
**Description:** As a player, I want to play Chapter 1 so I can start the story.

**Acceptance Criteria:**
- [ ] 李逍遥梦中习剑开场
- [ ] 婶婶生病事件
- [ ] 酒馆遇醉道士学会御剑术
- [ ] 仙灵岛遇赵灵儿
- [ ] 拜月教徒袭击
- [ ] 灵儿被绑架
- [ ] Typecheck passes

### US-036: 第二章剧情实现
**Description:** As a player, I want to play Chapter 2 so I can meet Lin Yue Ru.

**Acceptance Criteria:**
- [ ] 乘船赴苏州
- [ ] 比武招亲事件
- [ ] 战斗林月如BOSS
- [ ] 林月如加入队伍
- [ ] Typecheck passes

### US-037: 锁妖塔月如牺牲剧情
**Description:** As a player, I want to experience the tragic sacrifice scene.

**Acceptance Criteria:**
- [ ] 锁妖塔崩塌事件触发
- [ ] 月如牺牲对话序列播放
- [ ] 月如从队伍移除
- [ ] 获得月如遗物
- [ ] 情感冲击动画/音乐
- [ ] Typecheck passes

### US-038: 十年前回忆剧情
**Description:** As a player, I want to experience the flashback to understand the backstory.

**Acceptance Criteria:**
- [ ] 时光回溯触发条件
- [ ] 十年前南诏国场景
- [ ] 巫后剧情对话
- [ ] 水魔兽封印事件
- [ ] 获得水灵珠
- [ ] Typecheck passes

### US-039: 苗族篇剧情实现
**Description:** As a player, I want to play the Miao chapter so I can awaken Ling'er's power.

**Acceptance Criteria:**
- [ ] 黑苗族/白苗族冲突剧情
- [ ] 阿奴加入队伍
- [ ] 五灵珠收集任务
- [ ] 灵儿觉醒剧情
- [ ] Typecheck passes

### US-040: 最终决战实现
**Description:** As a player, I want the final battle so I can complete the game.

**Acceptance Criteria:**
- [ ] 拜月教总部地图
- [ ] 拜月教主BOSS（HP8000）
- [ ] 水魔兽召唤机制
- [ ] 四人合体技可用
- [ ] Typecheck passes

### US-041: 多结局系统
**Description:** As a player, I want different endings based on my choices.

**Acceptance Criteria:**
- [ ] 灵儿结局（默认）
- [ ] 月如结局（收集特定道具）
- [ ] 全员存活结局（好感度+道具条件）
- [ ] 结局判定逻辑
- [ ] 结局动画播放
- [ ] Typecheck passes

### US-042: 支线任务系统
**Description:** As a player, I want side quests so I can earn extra rewards.

**Acceptance Criteria:**
- [ ] SideQuest接口定义任务
- [ ] 任务步骤追踪
- [ ] 任务奖励发放
- [ ] quests.json配置支线任务
- [ ] Typecheck passes

### US-043: 小游戏系统
**Description:** As a player, I want mini-games so I can gamble for extra gold.

**Acceptance Criteria:**
- [ ] 猜大小游戏实现
- [ ] 翻牌配对游戏实现
- [ ] 赌注范围配置
- [ ] Typecheck passes

### US-044: 天气时间系统
**Description:** As a player, I want weather effects so the world feels dynamic.

**Acceptance Criteria:**
- [ ] 天气类型：晴天、雨天、雪天、雾天、夜晚
- [ ] 天气粒子效果显示
- [ ] 天气影响战斗（部分敌人增强）
- [ ] Typecheck passes

### US-045: 角色行走动画
**Description:** As a player, I want animated characters so movement looks natural.

**Acceptance Criteria:**
- [ ] 四方向行走动画（每方向4帧）
- [ ] 待机动画
- [ ] 奔跑动画（可选）
- [ ] 脚步音效
- [ ] Typecheck passes

### US-046: 战斗特效动画
**Description:** As a player, I want visual effects so combat feels exciting.

**Acceptance Criteria:**
- [ ] 物理攻击剑光特效
- [ ] 仙术特效（火球、冰晶、雷电）
- [ ] 合体技华丽全屏特效
- [ ] 受伤闪烁效果
- [ ] Typecheck passes

### US-047: 场景转场效果
**Description:** As a player, I want smooth transitions so scene changes feel natural.

**Acceptance Criteria:**
- [ ] 黑淡入淡出转场
- [ ] 白闪光（进入战斗）
- [ ] 水墨扩散（剧情转场）
- [ ] Typecheck passes

### US-048: 开场动画
**Description:** As a player, I want an intro sequence so the game starts dramatically.

**Acceptance Criteria:**
- [ ] 游戏标题淡入动画
- [ ] 女娲传说水墨画序幕
- [ ] 李逍遥梦境开场
- [ ] 可跳过选项
- [ ] Typecheck passes
- [ ] Verify in browser

### US-049: 新手引导系统
**Description:** As a new player, I want tutorials so I can learn the controls.

**Acceptance Criteria:**
- [ ] 游戏开始移动教学
- [ ] 第一次战斗教学
- [ ] 第一个城镇商店教学
- [ ] 仙术使用教学
- [ ] Typecheck passes

### US-050: 设置界面
**Description:** As a player, I want to adjust settings so the game suits my preferences.

**Acceptance Criteria:**
- [ ] 音乐/音效音量调节
- [ ] 窗口模式切换
- [ ] 键盘设置查看
- [ ] Typecheck passes
- [ ] Verify in browser

### US-051: 敌人数据配置
**Description:** As a developer, I need enemy data so battles can be configured.

**Acceptance Criteria:**
- [ ] Enemy接口定义敌人属性
- [ ] 普通敌人、精英敌人、BOSS分类
- [ ] enemies.json配置所有敌人数据
- [ ] Typecheck passes

### US-052: AI美术资源生成
**Description:** As a developer, I need AI-generated art assets so the game has visuals.

**Acceptance Criteria:**
- [ ] 角色立绘生成（李逍遥、灵儿、月如、阿奴）
- [ ] 角色行走精灵图生成
- [ ] 地图瓦片生成
- [ ] UI元素生成
- [ ] 特效素材生成
- [ ] 敌人图像生成

### US-053: 音效添加
**Description:** As a player, I want sound effects so the game feels immersive.

**Acceptance Criteria:**
- [ ] UI点击音效
- [ ] 战斗攻击/受伤音效
- [ ] 仙术释放音效
- [ ] 行走脚步音效
- [ ] 物品拾取音效
- [ ] Typecheck passes

---

## Functional Requirements

- FR-1: 游戏必须支持Web浏览器运行（Chrome, Firefox, Safari, Edge）
- FR-2: 游戏必须支持键盘和触屏输入
- FR-3: 战斗系统必须实现经典回合制逻辑
- FR-4: 战斗必须支持最多4人队伍
- FR-5: 对话系统必须支持选项分支影响剧情
- FR-6: 存档系统必须支持5个存档槽位
- FR-7: 好感度系统必须影响合体技解锁和结局
- FR-8: 物品系统必须支持消耗品、装备、剧情道具
- FR-9: 商店系统必须支持购买和出售
- FR-10: 旅馆系统必须完全恢复HP/MP
- FR-11: 升级系统必须按成长系数提升属性
- FR-12: 合体技必须依赖好感度解锁
- FR-13: 多结局必须根据好感度+道具条件判定
- FR-14: 地图必须支持多层瓦片渲染
- FR-15: 角色必须支持四方向行走动画
- FR-16: 仙术必须显示特效动画
- FR-17: 剧情必须还原原版11章节+锁妖塔
- FR-18: 月如牺牲剧情必须在锁妖塔触发
- FR-19: 阿奴必须在苗族篇加入
- FR-20: 五灵珠必须在苗族篇收集
- FR-21: 最终BOSS必须是拜月教主+水魔兽
- FR-22: 状态效果必须影响战斗表现
- FR-23: 战斗胜利必须获得经验值、金钱、物品掉落
- FR-24: 宝箱必须可交互打开
- FR-25: 支线任务必须追踪进度
- FR-26: 小游戏必须实现赌坊功能
- FR-27: 天气系统必须影响视觉和战斗
- FR-28: 转场必须平滑过渡
- FR-29: 新手引导必须覆盖核心操作
- FR-30: 设置必须支持音量调节

---

## Non-Goals (Out of Scope)

- 不实现配音系统
- 不实现在线多人功能
- 不实现移动APP原生版本（仅浏览器运行）
- 不实现成就系统
- 不实现排行榜
- 不实现内购付费系统
- 不实现社交分享功能
- 不实现自动战斗/AI控制
- 不实现动画视频过场（仅静态+特效）
- 不实现原版音乐重制（仅基础音效）

---

## Design Considerations

### UI/UX风格
- 扁平化卡通风格
- 中国风装饰元素（边角花纹）
- 柔和渐变背景
- 清晰图标和文字
- 金色主色调配合红色强调色

### 参考风格
- 角色设计：类似《阴阳师》扁平化风格
- 场景设计：简化版中国风场景
- UI设计：现代手游简洁UI加传统花纹

### 画面规格
- 基础分辨率：1920×1080 (16:9)
- 瓦片大小：48×48px
- 角色大小：64×64px
- 支持自适应缩放

---

## Technical Considerations

### 技术栈
- HTML5 + TypeScript + Phaser.js 3.x
- Vite构建工具
- localStorage存档

### 性能要求
- 初始加载时间 < 10秒
- 场景切换 < 1秒
- 60fps流畅运行
- 支持低端设备

### 约束
- 无后端服务器（纯前端）
- 存档限制localStorage容量
- 美术资源需AI生成或自行制作

---

## Success Metrics

- 完整还原原版剧情（11章节）
- 核心系统全部实现（战斗、对话、存档等）
- 四人战斗和合体技可用
- 多结局可触发
- 浏览器稳定运行无崩溃
- 游戏时长约20-30小时

---

## Open Questions

- AI美术生成具体使用哪些工具？
- 后期是否添加背景音乐？
- 是否需要打包成桌面/移动应用？
- 是否添加更多隐藏剧情？
- 是否添加难度选择？

---

## Development Phases (渐进式开发)

### Phase 1: 核心框架 + 第一章
- US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009
- US-013, US-014, US-016, US-022, US-028, US-029, US-030, US-034, US-035

### Phase 2: 扩展章节 (苏州、白河村)
- US-010, US-011, US-031, US-036
- US-018, US-019, US-020, US-024, US-042

### Phase 3: 中期章节 (将军坟、扬州、京城)
- US-021, US-023, US-037部分
- 更多地图和敌人数据

### Phase 4: 蜀山 + 锁妖塔
- US-032, US-037完整, US-027部分
- 高级仙术系统

### Phase 5: 十年前 + 苗族篇
- US-038, US-039, US-012, US-033
- 五灵珠系统

### Phase 6: 最终决战 + 结局
- US-040, US-041, US-027完整
- 四人合体技完整

### Phase 7: 美术优化 + 音效
- US-052, US-053, US-044, US-045, US-046, US-047, US-048

### Phase 8: 测试 + 优化
- US-049, US-050
- 性能优化和bug修复