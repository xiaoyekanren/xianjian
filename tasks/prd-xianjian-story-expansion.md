# PRD: 仙剑奇侠传完整剧情章节补充

## Introduction

为仙剑奇侠传现代重制版补充原版游戏缺失的11个剧情章节，修复当前从"苏州比武招亲"直接跳到"锁妖塔"的剧情断裂问题。需要完整还原原版剧情的地图、敌人、角色、对话和故事节点，确保剧情链完整连贯。

## Goals

- 将 story.json 从当前的 6 章 31 节点扩展为完整的 11 章 80+ 节点
- 补充 15+ 新地图（白河村、隐龙窟、鬼阴山、扬州城、京城、蜀山、神木林等）
- 添加 20+ 新敌人（蛇妖男、狐妖女、石长老、女飞贼、金翅凤凰、麒麟等BOSS）
- 添加 10+ 新角色（韩梦慈、苏媚、刘晋元、彩依、石长老、姬三娘等）
- 完整还原原版对话和剧情触发条件
- 调整现有章节编号和优先级以适配新的11章结构

## User Stories

### US-001: 重构章节结构
**Description:** 作为开发者，我需要将现有6章结构扩展为11章，并重新编号现有节点。

**Acceptance Criteria:**
- [ ] 创建新的章节定义（序章 + 11章 + 结局 = 13个章节定义）
- [ ] 调整现有节点的 chapter 字段以匹配新结构
- [ ] 更新节点的 priority 字段确保正确触发顺序
- [ ] story.json 格式验证通过（jq 解析无错误）
- [ ] Typecheck passes

### US-002: 添加白河村地图数据
**Description:** 作为开发者，我需要添加白河村及相关地点的完整地图数据。

**Acceptance Criteria:**
- [ ] 添加白河村主地图（baihe_village_main）
- [ ] 添加白河村医馆（baihe_clinic）
- [ ] 添加韩医仙家（baihe_han_home）
- [ ] 每个地图包含：layers, npcs, transitions, treasures, colorTheme, environment
- [ ] 地图尺寸和瓦片数据完整
- [ ] maps.json 格式验证通过

### US-003: 添加隐龙窟地图数据
**Description:** 作为开发者，我需要添加隐龙窟迷宫及BOSS房间地图。

**Acceptance Criteria:**
- [ ] 添加隐龙窟入口（yinlong_entrance）
- [ ] 添加隐龙窟迷宫层（yinlong_maze_1, yinlong_maze_2, yinlong_maze_3）
- [ ] 添加蛇妖男房间（yinlong_snake_boss）
- [ ] 添加狐妖女房间（yinlong_fox_boss）
- [ ] 添加被囚村民房间（yinlong_prison）
- [ ] maps.json 格式验证通过

### US-004: 添加鬼阴山/鬼阴坛地图数据
**Description:** 作为开发者，我需要添加鬼阴山和鬼阴坛的地图数据。

**Acceptance Criteria:**
- [ ] 添加鬼阴山山道（guiyin_mountain_path）
- [ ] 添加鬼阴山山洞（guiyin_cave_1, guiyin_cave_2）
- [ ] 添加鬼阴坛大殿（guiyin_altar）
- [ ] 添加石长老战斗场景（guiyin_shi_elder_arena）
- [ ] maps.json 格式验证通过

### US-005: 添加扬州城地图数据
**Description:** 作为开发者，我需要添加扬州城的完整地图数据。

**Acceptance Criteria:**
- [ ] 添加扬州城主街（yangzhou_main）
- [ ] 添加扬州客栈（yangzhou_inn）
- [ ] 添加扬州衙门（yangzhou_yamen）
- [ ] 添加扬州妓院（yangzhou_brothel）
- [ ] 添加女飞贼追逐场景（yangzhou_thief_chase）
- [ ] maps.json 格式验证通过

### US-006: 添加京城/刘家庄地图数据
**Description:** 作为开发者，我需要添加京城和刘家庄的地图数据。

**Acceptance Criteria:**
- [ ] 添加京城主街（jingcheng_main）
- [ ] 添加刘家庄园（liu_manor）
- [ ] 添加刘晋元书房（liu_study）
- [ ] 添加彩依房间（caiyi_room）
- [ ] 添加蝴蝶谷（butterfly_valley）
- [ ] maps.json 格式验证通过

### US-007: 添加蜀山地图数据
**Description:** 作为开发者，我需要添加蜀山派相关地图。

**Acceptance Criteria:**
- [ ] 添加蜀山山门（shushan_gate）
- [ ] 添加蜀山大殿（shushan_hall）
- [ ] 添加蜀山剑阁（shushan_sword_pavilion）
- [ ] 添加锁妖塔入口（从蜀山进入）
- [ ] maps.json 格式验证通过

### US-008: 添加神木林/麒麟洞地图数据
**Description:** 作为开发者，我需要添加神木林和麒麟洞地图。

**Acceptance Criteria:**
- [ ] 添加神木林入口（shenmu_entrance）
- [ ] 添加神木林迷宫层（shenmu_forest_1, shenmu_forest_2）
- [ ] 添加金翅凤凰巢（shenmu_phoenix_nest）
- [ ] 添加麒麟洞入口（qilin_cave_entrance）
- [ ] 添加麒麟洞深处（qilin_cave_deep）
- [ ] maps.json 格式验证通过

### US-009: 添加大理/女娲神殿地图数据
**Description:** 作为开发者，我需要添加大理城和女娲神殿地图。

**Acceptance Criteria:**
- [ ] 添加大理城主街（dali_main）
- [ ] 添加女娲神殿入口（nuwa_temple_entrance）
- [ ] 添加女娲神殿内殿（nuwa_temple_inner）
- [ ] 添加回魂仙梦祭坛（nuwa_dream_altar）
- [ ] 添加十年前南诏国场景（nanzhao_10_years_palace）
- [ ] maps.json 格式验证通过

### US-010: 添加试炼窟地图数据
**Description:** 作为开发者，我需要添加试炼窟迷宫地图。

**Acceptance Criteria:**
- [ ] 添加试炼窟入口（shilian_cave_entrance）
- [ ] 添加试炼窟迷宫层（shilian_cave_1 至 shilian_cave_5）
- [ ] 添加终极仙术学习室（shilian_skill_room）
- [ ] maps.json 格式验证通过

### US-011: 添加白河村剧情节点
**Description:** 作为开发者，我需要添加白河村篇的完整剧情节点。

**Acceptance Criteria:**
- [ ] 节点：到达白河村（enter_baihe_village）
- [ ] 节点：韩医仙求助（han_doctor_plea）
- [ ] 节点：得知韩梦慈被抓（mengci_captured）
- [ ] 节点：决定前往隐龙窟（decide_yinlong）
- [ ] 所有节点包含正确的 triggers, events, priority
- [ ] story.json 格式验证通过

### US-012: 添加隐龙窟剧情节点
**Description:** 作为开发者，我需要添加隐龙窟救人剧情。

**Acceptance Criteria:**
- [ ] 节点：进入隐龙窟（enter_yinlong）
- [ ] 节点：蛇妖男BOSS战（snake_boss_battle）
- [ ] 节点：狐妖女BOSS战（fox_boss_battle）
- [ ] 节点：救出韩梦慈（rescue_mengci）
- [ ] 节点：苏媚初次登场（sumei_first_appear）
- [ ] 节点：返回白河村（return_baihe）
- [ ] story.json 格式验证通过

### US-013: 添加鬼阴山剧情节点
**Description:** 作为开发者，我需要添加鬼阴山遭遇石长老的剧情。

**Acceptance Criteria:**
- [ ] 节点：进入鬼阴山（enter_guiyin）
- [ ] 节点：遭遇石长老（meet_shi_elder）
- [ ] 节点：石长老强行带走灵儿（linger_taken）
- [ ] 节点：逍遥月如悲痛（xiaoyao_yueru_grief）
- [ ] 这是关键转折点，灵儿离队
- [ ] story.json 格式验证通过

### US-014: 添加扬州城剧情节点
**Description:** 作为开发者，我需要添加扬州城女飞贼剧情。

**Acceptance Criteria:**
- [ ] 节点：进入扬州城（enter_yangzhou）
- [ ] 节点：女飞贼事件开始（thief_event_start）
- [ ] 节点：追逐女飞贼（chase_thief）
- [ ] 节点：女飞贼BOSS战（thief_boss_battle）
- [ ] 节点：获得赃物（get_stolen_item）
- [ ] story.json 格式验证通过

### US-015: 添加京城彩依剧情节点
**Description:** 作为开发者，我需要添加京城刘家庄彩依剧情。

**Acceptance Criteria:**
- [ ] 节点：进入京城（enter_jingcheng）
- [ ] 节点：遇见刘晋元（meet_liu_jinyuan）
- [ ] 节点：发现彩依异常（caiyi_strange）
- [ ] 节点：彩依真实身份（caiyi_true_form）
- [ ] 节点：彩依牺牲救晋元（caiyi_sacrifice）
- [ ] 节点：获得物品（get_caiyi_item）
- [ ] story.json 格式验证通过

### US-016: 添加蜀山剧情节点
**Description:** 作为开发者，我需要添加蜀山派剧情。

**Acceptance Criteria:**
- [ ] 节点：到达蜀山（arrive_shushan）
- [ ] 节点：拜见掌门（meet_shushan_leader）
- [ ] 节点：了解锁妖塔真相（learn_suoyaota_truth）
- [ ] 节点：决定进入锁妖塔（decide_enter_tower）
- [ ] story.json 格式验证通过

### US-017: 添加神木林/麒麟洞剧情节点
**Description:** 作为开发者，我需要添加风灵珠获取和麒麟角剧情。

**Acceptance Criteria:**
- [ ] 节点：进入神木林（enter_shenmu）
- [ ] 节点：金翅凤凰BOSS战（phoenix_battle）
- [ ] 节点：获得风灵珠（get_wind_pearl）
- [ ] 节点：阿奴正式加入（anu_join）
- [ ] 节点：进入麒麟洞（enter_qilin）
- [ ] 节点：麒麟BOSS战（qilin_battle）
- [ ] 节点：获得麒麟角（get_qilin_horn）
- [ ] story.json 格式验证通过

### US-018: 添加大理/回魂仙梦剧情节点
**Description:** 作为开发者，我需要添加大理和十年前剧情。

**Acceptance Criteria:**
- [ ] 节点：到达大理（arrive_dali）
- [ ] 节点：女娲神殿祈祷（nuwa_temple_pray）
- [ ] 节点：回魂仙梦（dream_of_past）
- [ ] 节点：十年前南诏国（nanzhao_10_years）
- [ ] 节点：见证巫后封印水魔兽（wuhou_seal_water_demon）
- [ ] 节点：获得水灵珠（get_water_pearl）
- [ ] story.json 格式验证通过

### US-019: 添加试炼窟剧情节点
**Description:** 作为开发者，我需要添加试炼窟学习终极仙术剧情。

**Acceptance Criteria:**
- [ ] 节点：进入试炼窟（enter_shilian）
- [ ] 节点：通过试炼（pass_trials）
- [ ] 节点：学习酒神咒（learn_jiushen）
- [ ] 节点：学习乾坤一掷（learn_qiankun）
- [ ] story.json 格式验证通过

### US-020: 添加水灵珠剧情节点
**Description:** 作为开发者，我需要添加水灵珠单独收集剧情。

**Acceptance Criteria:**
- [ ] 节点：发现水灵珠线索（water_pearl_clue）
- [ ] 节点：寻找水灵珠（search_water_pearl）
- [ ] 节点：获得水灵珠（obtain_water_pearl）
- [ ] 集齐五灵珠触发最终决战
- [ ] story.json 格式验证通过

### US-021: 添加新敌人数据 - 白河村/隐龙窟
**Description:** 作为开发者，我需要添加白河村和隐龙窟的敌人数据。

**Acceptance Criteria:**
- [ ] 添加蛇妖男BOSS（enemy_snake_demon）：HP 800，攻击高，会毒攻击
- [ ] 添加狐妖女BOSS（enemy_fox_demon）：HP 600，会魅惑和法术
- [ ] 添加隐龙窟小怪：蛇妖、狐狸精、洞穴蝙蝠
- [ ] 添加敌人掉落物品和经验值
- [ ] enemies.json 格式验证通过

### US-022: 添加新敌人数据 - 鬼阴山
**Description:** 作为开发者，我需要添加鬼阴山敌人。

**Acceptance Criteria:**
- [ ] 添加石长老BOSS（enemy_shi_elder）：HP 2000，极高攻防，无法击败的剧情战
- [ ] 添加鬼阴山小怪：山贼、野狼、山精
- [ ] enemies.json 格式验证通过

### US-023: 添加新敌人数据 - 扬州城
**Description:** 作为开发者，我需要添加扬州城敌人。

**Acceptance Criteria:**
- [ ] 添加女飞贼BOSS（enemy_female_thief）：HP 500，速度快，会偷窃
- [ ] 添加姬三娘BOSS（enemy_ji_sanniang）：HP 800，妓院老鸨
- [ ] enemies.json 格式验证通过

### US-024: 添加新敌人数据 - 京城/彩依
**Description:** 作为开发者，我需要添加京城敌人。

**Acceptance Criteria:**
- [ ] 添加蝴蝶精·彩依BOSS（enemy_caiyi_butterfly）：HP 1000，剧情BOSS
- [ ] 添加毒蜘蛛（enemy_poison_spider）：彩依变身前的战斗
- [ ] enemies.json 格式验证通过

### US-025: 添加新敌人数据 - 神木林/麒麟洞
**Description:** 作为开发者，我需要添加神木林和麒麟洞敌人。

**Acceptance Criteria:**
- [ ] 添加金翅凤凰BOSS（enemy_golden_phoenix）：HP 1500，风系攻击
- [ ] 添加麒麟BOSS（enemy_qilin）：HP 1200，火系攻击
- [ ] 添加神木林小怪：树妖、精灵、飞鸟
- [ ] 添加麒麟洞小怪：火精灵、熔岩怪
- [ ] enemies.json 格式验证通过

### US-026: 添加新角色数据
**Description:** 作为开发者，我需要添加新NPC和剧情角色。

**Acceptance Criteria:**
- [ ] 添加韩梦慈（npc_han_mengci）：白河村医女
- [ ] 添加韩医仙（npc_han_doctor）：韩梦慈之父
- [ ] 添加苏媚（npc_sumei）：蛇妖之女，后续重要角色
- [ ] 添加石长老（npc_shi_elder）：苗疆长老，反派
- [ ] 添加刘晋元（npc_liu_jinyuan）：逍遥表哥
- [ ] 添加彩依（npc_caiyi）：蝴蝶精，悲剧角色
- [ ] 添加姬三娘（npc_ji_sanniang）：扬州名妓
- [ ] 添加巫后（npc_wuhou）：灵儿之母
- [ ] characters.json 格式验证通过

### US-027: 添加白河村对话数据
**Description:** 作为开发者，我需要添加白河村篇的完整对话。

**Acceptance Criteria:**
- [ ] 对话：韩医仙诉说病情（han_doctor_story）
- [ ] 对话：得知韩梦慈被抓（mengci_captured_news）
- [ ] 对话：决定救人（rescue_decision）
- [ ] 对话：隐龙窟救人成功（rescue_success）
- [ ] DialogData.ts 编译通过

### US-028: 添加鬼阴山对话数据
**Description:** 作为开发者，我需要添加鬼阴山关键对话。

**Acceptance Criteria:**
- [ ] 对话：石长老现身（shi_elder_appear）
- [ ] 对话：石长老要带走灵儿（shi_elder_take_linger）
- [ ] 对话：逍遥月如战斗失败（battle_failed）
- [ ] 对话：灵儿被带走（linger_taken_away）
- [ ] 这是对话高潮，需要情感渲染
- [ ] DialogData.ts 编译通过

### US-029: 添加扬州城对话数据
**Description:** 作为开发者，我需要添加扬州城对话。

**Acceptance Criteria:**
- [ ] 对话：进入扬州城感叹繁华（enter_yangzhou_marvel）
- [ ] 对话：女飞贼出现（thief_appear）
- [ ] 对话：追逐对话（chase_dialogue）
- [ ] 对话：抓住女飞贼（caught_thief）
- [ ] DialogData.ts 编译通过

### US-030: 添加京城彩依对话数据
**Description:** 作为开发者，我需要添加京城彩依催泪剧情对话。

**Acceptance Criteria:**
- [ ] 对话：遇见刘晋元（meet_jinyuan）
- [ ] 对话：彩依与晋元的故事（caiyi_jinyuan_story）
- [ ] 对话：彩依真实身份揭露（caiyi_reveal）
- [ ] 对话：彩依决定牺牲（caiyi_sacrifice_decision）
- [ ] 对话：彩依牺牲（caiyi_death）- 催泪高潮
- [ ] DialogData.ts 编译通过

### US-031: 添加蜀山对话数据
**Description:** 作为开发者，我需要添加蜀山对话。

**Acceptance Criteria:**
- [ ] 对话：蜀山掌门接待（shushan_welcome）
- [ ] 对话：讲述锁妖塔历史（suoyaota_history）
- [ ] 对话：告知灵儿被关押（linger_imprisoned）
- [ ] 对话：决定营救（rescue_decision）
- [ ] DialogData.ts 编译通过

### US-032: 添加支线任务数据
**Description:** 作为开发者，我需要添加各章节的支线任务。

**Acceptance Criteria:**
- [ ] 任务：白河村采药（baihe_herbs）
- [ ] 任务：隐龙窟救人（yinlong_rescue）
- [ ] 任务：扬州抓贼（yangzhou_catch_thief）
- [ ] 任务：京城寻物（jingcheng_find_item）
- [ ] 任务：试炼窟挑战（shilian_challenge）
- [ ] quests.json 格式验证通过

### US-033: 更新现有地图完整性
**Description:** 作为开发者，我需要检查并补全现有地图的数据。

**Acceptance Criteria:**
- [ ] 检查所有现有地图是否有完整的 layers 数据
- [ ] 检查所有地图是否有 npcs 配置
- [ ] 检查所有地图是否有 transitions 配置
- [ ] 检查所有地图是否有 treasures 配置
- [ ] maps.json 格式验证通过

### US-034: 验证剧情链完整性
**Description:** 作为开发者，我需要验证所有剧情节点形成完整链条。

**Acceptance Criteria:**
- [ ] 所有节点都有正确的 nextNode 或 end 标记
- [ ] 所有节点都有正确的 blockingNodes 配置
- [ ] 从序章到结局可以完整遍历
- [ ] 关键道具获取（五灵珠）有正确标记
- [ ] Typecheck passes

## Functional Requirements

- FR-1: story.json 必须包含 13 个章节定义（序章 + 11章 + 结局）
- FR-2: 每个剧情节点必须有唯一的 id，格式为 `story_chX_eventName`
- FR-3: 每个地图必须有唯一的 id，格式为 `location_type`
- FR-4: 每个敌人必须有唯一的 id，格式为 `enemy_name`
- FR-5: 每个角色必须有唯一的 id，格式为 `npc_name`
- FR-6: BOSS 战必须有正确的 battle 事件类型配置
- FR-7: 道具获取必须有 get_item 事件类型配置
- FR-8: 角色加入/离开必须有 party_member 事件配置
- FR-9: 章节切换必须有 chapter_change 事件配置
- FR-10: 所有 JSON 文件必须通过 jq 格式验证

## Non-Goals (Out of Scope)

- 不修改现有战斗系统的核心逻辑
- 不添加新的UI界面
- 不修改存档系统结构
- 不添加新的仙术系统（只添加学习触发）
- 不添加语音配音

## Design Considerations

### 地图设计规范
- 地图尺寸：主城 40x30，迷宫层 25x25，BOSS房 15x15
- 瓦片大小：32x32 像素
- 色彩主题：每个地点有独特的 colorTheme
- 环境音效：每个地图有 bgm 配置

### 敌人平衡参考
| 类型 | HP | 攻击 | 防御 | 经验 |
|------|-----|------|------|------|
| 小怪 | 50-150 | 10-20 | 5-10 | 15-40 |
| 精英 | 200-400 | 25-40 | 15-25 | 80-150 |
| BOSS | 500-2000 | 30-80 | 20-50 | 200-500 |

### 剧情节点优先级
- 优先级 100-90：主线必触发
- 优先级 89-70：支线可触发
- 优先级 69-50：隐藏内容

## Technical Considerations

### 数据文件依赖关系
```
characters.json ──┐
                  ├──> DialogData.ts
enemies.json ─────┤
                  │
maps.json ────────┼──> story.json
                  │
items.json ───────┘
```

### 章节编号映射
| 新编号 | 章节名称 | 原编号 |
|--------|----------|--------|
| 0 | 序章 | 0 |
| 1 | 仙灵岛 | 1 |
| 2 | 苏州 | 2 |
| 3 | 白河村 | 新增 |
| 4 | 隐龙窟 | 新增 |
| 5 | 鬼阴山 | 新增 |
| 6 | 扬州城 | 新增 |
| 7 | 京城 | 新增 |
| 8 | 蜀山 | 新增 |
| 9 | 锁妖塔 | 3 |
| 10 | 神木林/大理 | 新增 |
| 11 | 试炼窟/苗疆 | 4 |
| 12 | 结局 | 5 |

## Success Metrics

- 剧情节点从 31 个增加到 80+ 个
- 地图数量从当前增加到 50+
- 敌人种类增加到 40+
- 所有章节可完整游玩
- 无剧情断裂或跳跃
- 所有BOSS战可正常触发和完成

## Open Questions

- 石长老战斗是否设计为必败的剧情战？
- 彩依牺牲后是否有隐藏复活剧情？
- 苏媚在后续剧情中是否有更多戏份？
- 试炼窟终极仙术是否需要特殊条件解锁？
- 十年前回魂仙梦是否有时间限制？

## Appendix: 完整章节列表

### 序章：梦中习剑
- 李逍遥梦中习剑
- 婶婶生病
- 醉道士传授御剑术

### 第一章：仙灵岛
- 前往仙灵岛
- 迷宫探索
- 遇见赵灵儿
- 拜月教徒袭击
- 灵儿被抓

### 第二章：苏州
- 比武招亲
- 遇见林月如
- 月如加入队伍

### 第三章：白河村
- 到达白河村
- 韩医仙求助
- 得知韩梦慈被抓

### 第四章：隐龙窟
- 迷宫探索
- 蛇妖男BOSS战
- 狐妖女BOSS战
- 救出韩梦慈
- 苏媚初次登场

### 第五章：鬼阴山
- 穿越鬼阴山
- 遭遇石长老
- 灵儿被强行带走（关键转折）

### 第六章：扬州城
- 进入扬州
- 女飞贼事件
- 姬三娘剧情
- 继续追寻灵儿

### 第七章：京城
- 遇见表哥刘晋元
- 认识彩依
- 彩依真实身份
- 彩依牺牲救晋元（经典催泪）

### 第八章：蜀山
- 到达蜀山派
- 了解锁妖塔真相
- 准备营救灵儿

### 第九章：锁妖塔
- 进入锁妖塔
- 逐层挑战
- 找到灵儿
- 月如牺牲（另一催泪点）

### 第十章：神木林/大理
- 神木林获取风灵珠
- 阿奴正式加入
- 麒麟洞获取麒麟角
- 女娲神殿回魂仙梦
- 十年前见证巫后封印
- 获取水灵珠

### 第十一章：试炼窟/苗疆
- 试炼窟学习终极仙术
- 集齐五灵珠
- 最终决战准备
- 拜月教总部决战

### 结局
- 根据好感度的多结局