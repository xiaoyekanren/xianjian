/**
 * Dialog data types and interfaces
 * US-005: 对话系统实现
 */

/**
 * Character expression/emotion types
 */
export enum Expression {
  NORMAL = 'normal',
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  SURPRISED = 'surprised',
  THINKING = 'thinking',
  SHY = 'shy',
}

/**
 * Dialog event types that can be triggered
 */
export enum DialogEventType {
  NONE = 'none',
  GET_ITEM = 'get_item',       // Player receives an item
  START_BATTLE = 'start_battle', // Start a battle
  SET_FLAG = 'set_flag',        // Set a story flag
  CHANGE_MAP = 'change_map',    // Change to a different map
  ADD_PARTY_MEMBER = 'add_party_member', // Add character to party
  REMOVE_PARTY_MEMBER = 'remove_party_member', // Remove from party
  HEAL = 'heal',               // Heal party
  SHOW_CHOICE = 'show_choice', // Show player choice options
}

/**
 * Dialog event configuration
 */
export interface DialogEvent {
  type: DialogEventType;
  data?: {
    itemId?: string;
    quantity?: number;
    battleId?: string;
    flagName?: string;
    flagValue?: boolean | number | string;
    mapId?: string;
    targetX?: number;
    targetY?: number;
    characterId?: string;
    healAmount?: number;
  };
}

/**
 * Dialog choice option
 */
export interface DialogChoice {
  text: string;
  nextDialogId?: string;  // Dialog to show after this choice
  event?: DialogEvent;    // Event triggered by this choice
}

/**
 * Single dialog line/message
 */
export interface DialogLine {
  speakerId: string;      // ID of the speaker (character/npc)
  speakerName: string;    // Display name
  text: string;           // The dialog text content
  expression?: Expression; // Speaker's expression for this line
  avatarKey?: string;     // Avatar/portrait sprite key
  choices?: DialogChoice[]; // Optional choices for player
  event?: DialogEvent;    // Optional event triggered after this line
  nextDialogId?: string;  // Next dialog line to show (if no choices)
  autoAdvance?: boolean;  // Auto advance after delay
  delay?: number;         // Delay before auto advance (ms)
}

/**
 * Complete dialog sequence
 */
export interface DialogSequence {
  id: string;
  lines: DialogLine[];
  loop?: boolean;         // Whether dialog can be repeated
  priority?: number;      // Priority for automatic triggers
}

/**
 * Dialog state during playback
 */
export interface DialogState {
  currentSequence: DialogSequence;
  currentLineIndex: number;
  isPlaying: boolean;
  isWaitingForChoice: boolean;
  isWaitingForInput: boolean;
  selectedChoiceIndex: number;
}

/**
 * Demo dialog data for testing
 */
export const DEMO_DIALOGS: DialogSequence[] = [
  // Yuhang Town dialogs - US-029
  {
    id: 'yuhang_aunt_intro',
    lines: [
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '逍遥，你又出去闲逛了？',
        expression: Expression.NORMAL,
        nextDialogId: 'yuhang_aunt_intro_2',
      },
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '家里还有好多事情要做呢，别总想着出去玩。',
        expression: Expression.ANGRY,
        nextDialogId: 'yuhang_aunt_intro_3',
      },
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '不过我看你这身手越来越敏捷了，是不是偷偷练剑去了？',
        expression: Expression.HAPPY,
        choices: [
          {
            text: '是的，婶婶，我在练习御剑术',
            nextDialogId: 'yuhang_aunt_proud',
          },
          {
            text: '没有，只是随便走走',
            nextDialogId: 'yuhang_aunt_worry',
          },
        ],
      },
    ],
  },
  {
    id: 'yuhang_aunt_proud',
    lines: [
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '好孩子，练剑是好事，但也要注意安全。',
        expression: Expression.HAPPY,
        nextDialogId: 'yuhang_aunt_proud_2',
      },
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '你父亲当年也是一位侠客，希望能继承他的遗志。',
        expression: Expression.SAD,
      },
    ],
  },
  {
    id: 'yuhang_aunt_worry',
    lines: [
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '你这孩子，总是不让我放心...',
        expression: Expression.SAD,
        nextDialogId: 'yuhang_aunt_worry_2',
      },
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '快去酒馆看看吧，听说那里有个奇怪的道士。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'yuhang_drunkard_intro',
    lines: [
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '好酒...真是好酒啊...',
        expression: Expression.HAPPY,
        nextDialogId: 'yuhang_drunkard_intro_2',
      },
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '年轻人，我看你骨骼惊奇，是个练剑的好苗子。',
        expression: Expression.NORMAL,
        nextDialogId: 'yuhang_drunkard_intro_3',
      },
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '要不要跟我学一套御剑术？',
        expression: Expression.THINKING,
        choices: [
          {
            text: '愿意请教！',
            nextDialogId: 'yuhang_drunkard_teach',
            event: { type: DialogEventType.SET_FLAG, data: { flagName: 'learned_yujianshu', flagValue: true } },
          },
          {
            text: '您喝多了吧...',
            nextDialogId: 'yuhang_drunkard_refuse',
          },
        ],
      },
    ],
  },
  {
    id: 'yuhang_drunkard_teach',
    lines: [
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '好！既然你有心求学，我便教你这套御剑术。',
        expression: Expression.HAPPY,
        nextDialogId: 'yuhang_drunkard_teach_2',
      },
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '记住，剑由心发，意到剑到。心中无剑，方能御剑。',
        expression: Expression.NORMAL,
        nextDialogId: 'yuhang_drunkard_teach_3',
      },
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '你已经学会了御剑术的基本要领，继续练习吧。',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'yuhang_drunkard_refuse',
    lines: [
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '哼，你这年轻人不识货...',
        expression: Expression.ANGRY,
        nextDialogId: 'yuhang_drunkard_refuse_2',
      },
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '罢了罢了，再喝一壶酒去...',
        expression: Expression.SAD,
      },
    ],
  },
  {
    id: 'tavern_drunkard_talk',
    lines: [
      {
        speakerId: 'tavern_drunkard',
        speakerName: '醉道士',
        text: '又是你啊，年轻人。',
        expression: Expression.NORMAL,
        nextDialogId: 'tavern_drunkard_talk_2',
      },
      {
        speakerId: 'tavern_drunkard',
        speakerName: '醉道士',
        text: '这酒馆的酒不错，陪我喝一杯？',
        expression: Expression.HAPPY,
        choices: [
          {
            text: '好吧，我陪您喝一杯',
            nextDialogId: 'tavern_drunkard_drink',
          },
          {
            text: '抱歉，我还有事',
          },
        ],
      },
    ],
  },
  {
    id: 'tavern_drunkard_drink',
    lines: [
      {
        speakerId: 'tavern_drunkard',
        speakerName: '醉道士',
        text: '哈哈哈！好酒量！来，这壶酒送你。',
        expression: Expression.HAPPY,
        event: { type: DialogEventType.GET_ITEM, data: { itemId: 'lingxincao', quantity: 1 } },
      },
    ],
  },
  {
    id: 'yuhang_villager_1',
    lines: [
      {
        speakerId: 'yuhang_villager_1',
        speakerName: '村民',
        text: '你好啊，年轻人！你是李家的侄儿吧？',
        expression: Expression.HAPPY,
        nextDialogId: 'yuhang_villager_1_2',
      },
      {
        speakerId: 'yuhang_villager_1',
        speakerName: '村民',
        text: '听说最近镇上有些奇怪的人来往，小心点。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'yuhang_shopkeeper',
    lines: [
      {
        speakerId: 'yuhang_shopkeeper',
        speakerName: '杂货铺老板',
        text: '欢迎光临！需要什么？',
        expression: Expression.HAPPY,
        event: { type: DialogEventType.SHOW_CHOICE },
      },
    ],
  },
  // Fairy Island dialogs - US-030
  {
    id: 'xianling_arrive',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '你来到了传说中的仙灵岛...',
        expression: Expression.NORMAL,
        nextDialogId: 'xianling_arrive_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '这里雾气缭绕，灵气充盈，仿佛与世隔绝的仙境。',
        expression: Expression.NORMAL,
        nextDialogId: 'xianling_arrive_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这就是仙灵岛吗...真美啊。',
        expression: Expression.SURPRISED,
        nextDialogId: 'xianling_arrive_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '听说这里有仙女居住，不知道是不是真的...',
        expression: Expression.THINKING,
      },
    ],
  },
  {
    id: 'meet_linger_cutscene',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '你穿过荷花池，看到前方有一位少女...',
        expression: Expression.NORMAL,
        nextDialogId: 'meet_linger_cutscene_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '她肌肤胜雪，容颜如玉，仿佛不食人间烟火的仙女。',
        expression: Expression.NORMAL,
        nextDialogId: 'meet_linger_cutscene_3',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '啊！你是谁？怎么会在这里？',
        expression: Expression.SURPRISED,
        nextDialogId: 'meet_linger_cutscene_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '在下李逍遥，从余杭镇来此寻找仙药...',
        expression: Expression.NORMAL,
        nextDialogId: 'meet_linger_cutscene_5',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '仙药？你是为了救治你婶婶来的吗？',
        expression: Expression.NORMAL,
        nextDialogId: 'meet_linger_cutscene_6',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '正是！姑娘如何得知？',
        expression: Expression.SURPRISED,
        nextDialogId: 'meet_linger_cutscene_7',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '我...我只是感觉到了你的善意。',
        expression: Expression.SHY,
        nextDialogId: 'meet_linger_cutscene_8',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '既然你是为了救人而来，我可以帮你。',
        expression: Expression.NORMAL,
        choices: [
          {
            text: '多谢姑娘相助！',
            nextDialogId: 'meet_linger_help',
            event: { type: DialogEventType.SET_FLAG, data: { flagName: 'linger_helps', flagValue: true } },
          },
          {
            text: '姑娘是...仙女吗？',
            nextDialogId: 'meet_linger_fairy',
          },
        ],
      },
    ],
  },
  {
    id: 'meet_linger_help',
    lines: [
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '跟我来吧，我带你去见姥姥。',
        expression: Expression.HAPPY,
        event: { type: DialogEventType.SET_FLAG, data: { flagName: 'met_linger', flagValue: true } },
      },
    ],
  },
  {
    id: 'meet_linger_fairy',
    lines: [
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '我...我只是这里的守护者之一。',
        expression: Expression.SHY,
        nextDialogId: 'meet_linger_fairy_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '走吧，我带你去见姥姥，她会帮你的。',
        expression: Expression.NORMAL,
        event: { type: DialogEventType.SET_FLAG, data: { flagName: 'met_linger', flagValue: true } },
      },
    ],
  },
  {
    id: 'meet_linger_intro',
    lines: [
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '你...还在这里啊。',
        expression: Expression.SHY,
        nextDialogId: 'meet_linger_intro_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '姥姥说，如果你需要帮助，可以随时找她。',
        expression: Expression.NORMAL,
      },
    ],
  },
  // Suzhou City dialogs - US-031
  {
    id: 'suzhou_arrive',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '你来到了繁华的苏州城...',
        expression: Expression.NORMAL,
        nextDialogId: 'suzhou_arrive_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '街道熙熙攘攘，商铺林立，处处洋溢着热闹的气息。',
        expression: Expression.NORMAL,
        nextDialogId: 'suzhou_arrive_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这就是苏州城吗？比余杭镇热闹多了！',
        expression: Expression.SURPRISED,
        nextDialogId: 'suzhou_arrive_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '听说林家堡在这里举办比武招亲，去看看吧。',
        expression: Expression.THINKING,
      },
    ],
  },
  {
    id: 'suzhou_crowd_gossip',
    lines: [
      {
        speakerId: 'suzhou_crowd_1',
        speakerName: '路人',
        text: '你听说了吗？林家堡在举办比武招亲！',
        expression: Expression.HAPPY,
        nextDialogId: 'suzhou_crowd_gossip_2',
      },
      {
        speakerId: 'suzhou_crowd_1',
        speakerName: '路人',
        text: '林家千金林月如，听说是个绝世美女呢！',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'suzhou_crowd_gossip_2',
    lines: [
      {
        speakerId: 'suzhou_crowd_2',
        speakerName: '路人',
        text: '听说很多武林高手都来参加比武招亲。',
        expression: Expression.NORMAL,
        nextDialogId: 'suzhou_crowd_gossip_2_2',
      },
      {
        speakerId: 'suzhou_crowd_2',
        speakerName: '路人',
        text: '不过林家千金的武功也很厉害，上次打败了不少挑战者！',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'suzhou_guard_intro',
    lines: [
      {
        speakerId: 'suzhou_guard',
        speakerName: '守卫',
        text: '欢迎来到苏州城！请遵守城内规矩。',
        expression: Expression.NORMAL,
        nextDialogId: 'suzhou_guard_intro_2',
      },
      {
        speakerId: 'suzhou_guard',
        speakerName: '守卫',
        text: '林家堡正在举办比武招亲，你可以去看看。',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'suzhou_shopkeeper_intro',
    lines: [
      {
        speakerId: 'suzhou_shopkeeper',
        speakerName: '杂货商',
        text: '客人！要买点什么吗？我们这里有苏州特产！',
        expression: Expression.HAPPY,
        event: { type: DialogEventType.SHOW_CHOICE },
      },
    ],
  },
  {
    id: 'suzhou_arena_announce',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '前方传来一阵喧闹声...',
        expression: Expression.NORMAL,
        nextDialogId: 'suzhou_arena_announce_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '「林家堡比武招亲！谁能击败林家千金，便可成为林家女婿！」',
        expression: Expression.NORMAL,
        nextDialogId: 'suzhou_arena_announce_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '比武招亲？有意思，去看看吧！',
        expression: Expression.THINKING,
        event: { type: DialogEventType.SET_FLAG, data: { flagName: 'can_enter_arena', flagValue: true } },
      },
    ],
  },
  {
    id: 'lin_butler_intro',
    lines: [
      {
        speakerId: 'lin_butler',
        speakerName: '管家',
        text: '欢迎来到林家堡！',
        expression: Expression.NORMAL,
        nextDialogId: 'lin_butler_intro_2',
      },
      {
        speakerId: 'lin_butler',
        speakerName: '管家',
        text: '我家老爷正在举办比武招亲，有兴趣参加吗？',
        expression: Expression.THINKING,
        choices: [
          {
            text: '当然有兴趣！',
            nextDialogId: 'lin_butler_welcome',
          },
          {
            text: '只是来看看',
            nextDialogId: 'lin_butler_visit',
          },
        ],
      },
    ],
  },
  {
    id: 'lin_butler_welcome',
    lines: [
      {
        speakerId: 'lin_butler',
        speakerName: '管家',
        text: '很好！请前往擂台区，我家千金正在那里等候。',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'lin_butler_visit',
    lines: [
      {
        speakerId: 'lin_butler',
        speakerName: '管家',
        text: '没关系，随便参观吧。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'lin_yueru_first_meet',
    lines: [
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '哼，又一个来凑热闹的？',
        expression: Expression.ANGRY,
        nextDialogId: 'lin_yueru_first_meet_2',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '想娶我？先在擂台上打败我再说！',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'inn_keeper_intro',
    lines: [
      {
        speakerId: 'inn_keeper',
        speakerName: '客栈老板',
        text: '欢迎光临苏州客栈！',
        expression: Expression.HAPPY,
        nextDialogId: 'inn_keeper_intro_2',
      },
      {
        speakerId: 'inn_keeper',
        speakerName: '客栈老板',
        text: '要住店还是吃饭？我们这里有最好的服务！',
        expression: Expression.NORMAL,
        event: { type: DialogEventType.SHOW_CHOICE },
      },
    ],
  },
  {
    id: 'inn_guest_chat',
    lines: [
      {
        speakerId: 'inn_guest',
        speakerName: '客商',
        text: '你是外地来的吧？第一次来苏州？',
        expression: Expression.NORMAL,
        nextDialogId: 'inn_guest_chat_2',
      },
      {
        speakerId: 'inn_guest',
        speakerName: '客商',
        text: '我告诉你，林家堡的比武招亲可是大事，千万别错过！',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'arena_announcer_intro',
    lines: [
      {
        speakerId: 'arena_announcer',
        speakerName: '擂台主持',
        text: '各位武林同道！欢迎来到林家堡比武招亲！',
        expression: Expression.HAPPY,
        nextDialogId: 'arena_announcer_intro_2',
      },
      {
        speakerId: 'arena_announcer',
        speakerName: '擂台主持',
        text: '谁能击败林家千金林月如，便可成为林家女婿！',
        expression: Expression.NORMAL,
        nextDialogId: 'arena_announcer_intro_3',
      },
      {
        speakerId: 'arena_announcer',
        speakerName: '擂台主持',
        text: '有意挑战者，请上台！',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'arena_challenger_intro',
    lines: [
      {
        speakerId: 'arena_challenger',
        speakerName: '挑战者',
        text: '哼，林家千金的武功果然厉害...',
        expression: Expression.SAD,
        nextDialogId: 'arena_challenger_intro_2',
      },
      {
        speakerId: 'arena_challenger',
        speakerName: '挑战者',
        text: '我已经输了三次了，看来这辈子娶不到她了。',
        expression: Expression.SAD,
      },
    ],
  },
  {
    id: 'arena_yueru_ready',
    lines: [
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '哼，你是来挑战我的吗？',
        expression: Expression.ANGRY,
        nextDialogId: 'arena_yueru_ready_2',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '那就上台吧，让我看看你的本事！',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'arena_biwu_zhaqin',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '你走上擂台，看到林月如正站在中央...',
        expression: Expression.NORMAL,
        nextDialogId: 'arena_biwu_zhaqin_2',
      },
      {
        speakerId: 'arena_announcer',
        speakerName: '擂台主持',
        text: '又有一位勇士上台挑战！',
        expression: Expression.HAPPY,
        nextDialogId: 'arena_biwu_zhaqin_3',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '你是何人？敢来挑战我？',
        expression: Expression.NORMAL,
        nextDialogId: 'arena_biwu_zhaqin_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '在下李逍遥，从余杭镇来。',
        expression: Expression.NORMAL,
        nextDialogId: 'arena_biwu_zhaqin_5',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '哼，余杭镇的小子？好，让我看看你的本事！',
        expression: Expression.ANGRY,
        nextDialogId: 'arena_biwu_zhaqin_6',
      },
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '战斗即将开始！',
        expression: Expression.NORMAL,
        choices: [
          {
            text: '开始战斗！',
            nextDialogId: 'arena_battle_start',
            event: { type: DialogEventType.START_BATTLE, data: { battleId: 'arena_lin_yueru' } },
          },
          {
            text: '先观察一下',
            nextDialogId: 'arena_observe',
          },
        ],
      },
    ],
  },
  {
    id: 'arena_battle_start',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '战斗开始！林月如拔剑向你冲来...',
        expression: Expression.NORMAL,
        event: { type: DialogEventType.SET_FLAG, data: { flagName: 'arena_battle_started', flagValue: true } },
      },
    ],
  },
  {
    id: 'arena_observe',
    lines: [
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '让我先看看她的剑法...',
        expression: Expression.THINKING,
        nextDialogId: 'arena_observe_2',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '不敢动手？那就下去吧！',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'arena_win',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '',
        text: '你击败了林月如！全场一片哗然...',
        expression: Expression.NORMAL,
        nextDialogId: 'arena_win_2',
      },
      {
        speakerId: 'arena_announcer',
        speakerName: '擂台主持',
        text: '胜者诞生！李逍遥成为林家女婿！',
        expression: Expression.HAPPY,
        nextDialogId: 'arena_win_3',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '我...输了？没想到你竟然...',
        expression: Expression.SURPRISED,
        nextDialogId: 'arena_win_4',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '好吧，按照约定，我林月如认输。',
        expression: Expression.SHY,
        event: { type: DialogEventType.ADD_PARTY_MEMBER, data: { characterId: 'lin_yueru' } },
      },
    ],
  },
  {
    id: 'arena_lose',
    lines: [
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '哼，看来你还不够资格娶我。',
        expression: Expression.ANGRY,
        nextDialogId: 'arena_lose_2',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '回去练练再来吧。',
        expression: Expression.NORMAL,
      },
    ],
  },
  // Original demo dialogs
  {
    id: 'dialog_villager_1',
    lines: [
      {
        speakerId: 'npc_villager_1',
        speakerName: '村民',
        text: '你好，年轻人！欢迎来到我们的城镇。',
        expression: Expression.HAPPY,
        nextDialogId: 'dialog_villager_1_2',
      },
      {
        speakerId: 'npc_villager_1',
        speakerName: '村民',
        text: '这个城镇虽然不大，但这里的人都很友善。',
        expression: Expression.NORMAL,
        nextDialogId: 'dialog_villager_1_3',
      },
      {
        speakerId: 'npc_villager_1',
        speakerName: '村民',
        text: '你要去哪里呢？',
        expression: Expression.THINKING,
        choices: [
          {
            text: '我想探索一下城镇',
            nextDialogId: 'dialog_villager_1_explore',
          },
          {
            text: '请问有什么值得注意的地方吗？',
            nextDialogId: 'dialog_villager_1_tips',
          },
          {
            text: '没什么，谢谢你的热情！',
            event: { type: DialogEventType.GET_ITEM, data: { itemId: 'healing_herb', quantity: 1 } },
          },
        ],
      },
    ],
  },
  {
    id: 'dialog_villager_1_explore',
    lines: [
      {
        speakerId: 'npc_villager_1',
        speakerName: '村民',
        text: '城镇中心有一个广场，那里经常有活动。',
        expression: Expression.NORMAL,
        nextDialogId: 'dialog_villager_1_explore_2',
      },
      {
        speakerId: 'npc_villager_1',
        speakerName: '村民',
        text: '东南角有家杂货店，可以买些补给品。',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'dialog_villager_1_tips',
    lines: [
      {
        speakerId: 'npc_villager_1',
        speakerName: '村民',
        text: '城镇北边的山上有些强盗出没，小心点。',
        expression: Expression.SAD,
        nextDialogId: 'dialog_villager_1_tips_2',
      },
      {
        speakerId: 'npc_villager_1',
        speakerName: '村民',
        text: '不过你看起来很有实力，应该没问题。',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'dialog_elder_1',
    lines: [
      {
        speakerId: 'npc_elder_1',
        speakerName: '老者',
        text: '年轻人，我看你气宇轩昂，定是位侠客。',
        expression: Expression.NORMAL,
        nextDialogId: 'dialog_elder_1_2',
      },
      {
        speakerId: 'npc_elder_1',
        speakerName: '老者',
        text: '这附近有一片神秘的山林，传说藏着宝物...',
        expression: Expression.THINKING,
        nextDialogId: 'dialog_elder_1_3',
      },
      {
        speakerId: 'npc_elder_1',
        speakerName: '老者',
        text: '要不要去看看？',
        expression: Expression.NORMAL,
        choices: [
          {
            text: '好，我去看看！',
            event: { type: DialogEventType.SET_FLAG, data: { flagName: 'elder_hint_given', flagValue: true } },
          },
          {
            text: '多谢指点，改日再去。',
          },
        ],
      },
    ],
  },

  // Tower dialogs - US-032 锁妖塔实现
  {
    id: 'tower_entrance_warning',
    lines: [
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这里就是传说中的锁妖塔...',
        expression: Expression.SURPRISED,
        nextDialogId: 'tower_entrance_warning_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '阴森的气息弥漫四周，每一层都可能有危险。',
        expression: Expression.NORMAL,
        nextDialogId: 'tower_entrance_warning_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿一定就在深处，我必须找到她！',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'tower_puzzle_hint_1',
    lines: [
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这里有一个奇怪的开关...',
        expression: Expression.THINKING,
        nextDialogId: 'tower_puzzle_hint_1_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '看来需要按正确的顺序操作才能打开通道。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'tower_puzzle_hint_2',
    lines: [
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这些火炬...有些熄灭了，有些还在燃烧。',
        expression: Expression.THINKING,
        nextDialogId: 'tower_puzzle_hint_2_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '也许点燃所有火炬就能解开谜题。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'tower_puzzle_hint_3',
    lines: [
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这道门上有一个奇怪的钥匙孔...',
        expression: Expression.THINKING,
        nextDialogId: 'tower_puzzle_hint_3_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '需要找到对应的钥匙才能继续前进。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'tower_puzzle_hint_4',
    lines: [
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这道石门看起来很沉重...',
        expression: Expression.THINKING,
        nextDialogId: 'tower_puzzle_hint_4_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '也许附近有机关可以打开它。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'tower_find_linger',
    lines: [
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥...',
        expression: Expression.SAD,
        nextDialogId: 'tower_find_linger_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '我被女娲封印在这里，无法离开...',
        expression: Expression.SAD,
        nextDialogId: 'tower_find_linger_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿！我来救你了！',
        expression: Expression.ANGRY,
        nextDialogId: 'tower_find_linger_4',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '要解除封印，必须击败塔底的妖王...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'tower_find_linger_cutscene',
    lines: [
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '终于...终于找到你了，灵儿！',
        expression: Expression.SURPRISED,
        nextDialogId: 'tower_find_linger_cutscene_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥...你怎么会来到这里？',
        expression: Expression.SAD,
        nextDialogId: 'tower_find_linger_cutscene_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '我经历了千辛万苦，只为了找到你！',
        expression: Expression.ANGRY,
        nextDialogId: 'tower_find_linger_cutscene_4',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥...谢谢你...',
        expression: Expression.HAPPY,
        nextDialogId: 'tower_find_linger_cutscene_5',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '但我被困在封印之中，只有击败妖王才能解脱。',
        expression: Expression.NORMAL,
        nextDialogId: 'tower_find_linger_cutscene_6',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '放心，我一定会击败妖王，带你离开这里！',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'tower_yueru_sacrifice_cutscene',
    lines: [
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '逍遥，小心！妖王的攻击太强了！',
        expression: Expression.SURPRISED,
        nextDialogId: 'tower_yueru_sacrifice_cutscene_2',
      },
      {
        speakerId: 'tower_boss',
        speakerName: '妖王',
        text: '哈哈哈...你们这些蝼蚁，竟敢挑战我！',
        expression: Expression.ANGRY,
        nextDialogId: 'tower_yueru_sacrifice_cutscene_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '（妖王的力量太强了...我们必须小心应对）',
        expression: Expression.THINKING,
        nextDialogId: 'tower_yueru_sacrifice_cutscene_4',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '逍遥，我来挡住这一击！',
        expression: Expression.ANGRY,
        nextDialogId: 'tower_yueru_sacrifice_cutscene_5',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '月如！不要！',
        expression: Expression.SURPRISED,
        nextDialogId: 'tower_yueru_sacrifice_cutscene_6',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '逍遥...灵儿...我...',
        expression: Expression.SAD,
        nextDialogId: 'tower_yueru_sacrifice_cutscene_7',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '这是我...最后一次保护你了...',
        expression: Expression.SAD,
        nextDialogId: 'tower_yueru_sacrifice_cutscene_8',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '月如！！！',
        expression: Expression.SAD,
        event: {
          type: DialogEventType.SET_FLAG,
          data: { flagName: 'yueru_sacrificed', flagValue: true },
        },
      },
    ],
  },
  // US-037: 月如牺牲后续 - Tower collapse aftermath
  {
    id: 'tower_yueru_sacrifice_aftermath',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '锁妖塔剧烈震动，开始崩塌...',
        expression: Expression.NORMAL,
        nextDialogId: 'tower_yueru_sacrifice_aftermath_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '在最后一刻，林月如用自己的生命，挡住了致命的一击...',
        expression: Expression.SAD,
        nextDialogId: 'tower_yueru_sacrifice_aftermath_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '月如......为什么...为什么要这样做...',
        expression: Expression.SAD,
        nextDialogId: 'tower_yueru_sacrifice_aftermath_4',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥...月如姐姐是为了保护我们...',
        expression: Expression.SAD,
        nextDialogId: 'tower_yueru_sacrifice_aftermath_5',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '她的牺牲...我们会永远记住...',
        expression: Expression.NORMAL,
        nextDialogId: 'tower_yueru_sacrifice_aftermath_6',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '（握紧月如留下的遗物）月如，我会带着你的心愿，继续走下去...',
        expression: Expression.NORMAL,
        nextDialogId: 'tower_yueru_sacrifice_aftermath_7',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿，我们必须离开这里，去苗疆寻找五灵珠，完成月如的遗愿。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'tower_boss_victory',
    lines: [
      {
        speakerId: 'tower_boss',
        speakerName: '妖王',
        text: '不可能...我竟然被击败了...',
        expression: Expression.SAD,
        nextDialogId: 'tower_boss_victory_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '终于...妖王被消灭了！',
        expression: Expression.HAPPY,
        nextDialogId: 'tower_boss_victory_3',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '封印解除了...我可以自由了！',
        expression: Expression.HAPPY,
      },
    ],
  },
  // Miao Territory dialogs - US-033
  {
    id: 'black_miao_arrive',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '你来到了黑苗族的聚居地。',
        expression: Expression.NORMAL,
        nextDialogId: 'black_miao_arrive_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这里就是黑苗族了...气氛有些压抑。',
        expression: Expression.THINKING,
      },
    ],
  },
  {
    id: 'black_miao_guard_intro',
    lines: [
      {
        speakerId: 'black_miao_guard',
        speakerName: '黑苗族守卫',
        text: '外乡人，报上名来！',
        expression: Expression.ANGRY,
        nextDialogId: 'black_miao_guard_intro_2',
      },
      {
        speakerId: 'black_miao_guard',
        speakerName: '黑苗族守卫',
        text: '...既然是来找灵珠的，那就进去吧。但要小心，不要惹事。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'black_miao_elder_intro',
    lines: [
      {
        speakerId: 'black_miao_elder',
        speakerName: '黑苗族长老',
        text: '外乡人，欢迎来到我们黑苗族。',
        expression: Expression.NORMAL,
        nextDialogId: 'black_miao_elder_intro_2',
      },
      {
        speakerId: 'black_miao_elder',
        speakerName: '黑苗族长老',
        text: '灵珠是我们苗族的神圣宝物，分散在圣地各处。',
        expression: Expression.THINKING,
        nextDialogId: 'black_miao_elder_intro_3',
      },
      {
        speakerId: 'black_miao_elder',
        speakerName: '黑苗族长老',
        text: '只有真正的英雄才能集齐五灵珠，唤醒女娲后人的力量。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'black_miao_woman_intro',
    lines: [
      {
        speakerId: 'black_miao_woman',
        speakerName: '黑苗族女子',
        text: '你是来找灵珠的吗？',
        expression: Expression.NORMAL,
        nextDialogId: 'black_miao_woman_intro_2',
      },
      {
        speakerId: 'black_miao_woman',
        speakerName: '黑苗族女子',
        text: '听说圣地里有很多机关，要小心啊。',
        expression: Expression.SAD,
      },
    ],
  },
  {
    id: 'black_miao_leader_intro',
    lines: [
      {
        speakerId: 'black_miao_leader',
        speakerName: '黑苗族首领',
        text: '我就是黑苗族的首领。你来此地有何目的？',
        expression: Expression.NORMAL,
        choices: [
          {
            text: '我来寻找灵珠',
            nextDialogId: 'black_miao_leader_help',
          },
          {
            text: '只是路过看看',
            nextDialogId: 'black_miao_leader_pass',
          },
        ],
      },
    ],
  },
  {
    id: 'black_miao_leader_help',
    lines: [
      {
        speakerId: 'black_miao_leader',
        speakerName: '黑苗族首领',
        text: '灵珠是神圣之物，但既然你有此决心，我祝你成功。',
        expression: Expression.NORMAL,
        nextDialogId: 'black_miao_leader_help_2',
      },
      {
        speakerId: 'black_miao_leader',
        speakerName: '黑苗族首领',
        text: '圣地在村子北边，但那里机关重重，你要小心。',
        expression: Expression.THINKING,
      },
    ],
  },
  {
    id: 'black_miao_leader_pass',
    lines: [
      {
        speakerId: 'black_miao_leader',
        speakerName: '黑苗族首领',
        text: '哼，随便看看吧。但不要在我们村里惹事。',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'black_miao_shopkeeper_intro',
    lines: [
      {
        speakerId: 'black_miao_shopkeeper',
        speakerName: '商铺老板',
        text: '外乡人，要买点什么？',
        expression: Expression.NORMAL,
        nextDialogId: 'black_miao_shopkeeper_intro_2',
      },
      {
        speakerId: 'black_miao_shopkeeper',
        speakerName: '商铺老板',
        text: '我们这里有苗族的特产，都是很珍贵的物品。',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'black_miao_innkeeper_intro',
    lines: [
      {
        speakerId: 'black_miao_innkeeper',
        speakerName: '客栈老板',
        text: '累了吗？要在这里休息一下吗？',
        expression: Expression.NORMAL,
        event: { type: DialogEventType.HEAL, data: {} },
      },
    ],
  },
  {
    id: 'white_miao_arrive',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '你来到了白苗族的聚居地。',
        expression: Expression.NORMAL,
        nextDialogId: 'white_miao_arrive_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '白苗族...这里看起来更加和平。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'white_miao_guard_intro',
    lines: [
      {
        speakerId: 'white_miao_guard',
        speakerName: '白苗族守卫',
        text: '欢迎来到白苗族！请问有何贵干？',
        expression: Expression.HAPPY,
        nextDialogId: 'white_miao_guard_intro_2',
      },
      {
        speakerId: 'white_miao_guard',
        speakerName: '白苗族守卫',
        text: '我们白苗族向来好客，请随意参观。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'white_miao_elder_intro',
    lines: [
      {
        speakerId: 'white_miao_elder',
        speakerName: '白苗族长老',
        text: '外乡人，欢迎来到我们白苗族。',
        expression: Expression.HAPPY,
        nextDialogId: 'white_miao_elder_intro_2',
      },
      {
        speakerId: 'white_miao_elder',
        speakerName: '白苗族长老',
        text: '五灵珠是上古神物，分别代表火、水、风、雷、土五种元素。',
        expression: Expression.THINKING,
        nextDialogId: 'white_miao_elder_intro_3',
      },
      {
        speakerId: 'white_miao_elder',
        speakerName: '白苗族长老',
        text: '只有集齐五灵珠，才能唤醒女娲后人的真正力量。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'anu_family_intro',
    lines: [
      {
        speakerId: 'anu_family',
        speakerName: '阿奴家人',
        text: '你认识阿奴吗？她是我们的骄傲！',
        expression: Expression.HAPPY,
        nextDialogId: 'anu_family_intro_2',
      },
      {
        speakerId: 'anu_family',
        speakerName: '阿奴家人',
        text: '阿奴虽然年纪小，但已经学会了很多苗族的神仙术。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'white_miao_leader_intro',
    lines: [
      {
        speakerId: 'white_miao_leader',
        speakerName: '白苗族首领',
        text: '外乡人，欢迎来到我们白苗族。我是这里的首领。',
        expression: Expression.HAPPY,
        nextDialogId: 'white_miao_leader_intro_2',
      },
      {
        speakerId: 'white_miao_leader',
        speakerName: '白苗族首领',
        text: '如果你是来找灵珠的，我可以告诉你一些有用的信息。',
        expression: Expression.NORMAL,
        nextDialogId: 'white_miao_leader_intro_3',
      },
      {
        speakerId: 'white_miao_leader',
        speakerName: '白苗族首领',
        text: '圣地里有五颗灵珠，分布在迷宫的各个角落。',
        expression: Expression.THINKING,
      },
    ],
  },
  {
    id: 'white_miao_shopkeeper_intro',
    lines: [
      {
        speakerId: 'white_miao_shopkeeper',
        speakerName: '商铺老板',
        text: '欢迎光临！我们这里有各种苗族特产。',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'white_miao_innkeeper_intro',
    lines: [
      {
        speakerId: 'white_miao_innkeeper',
        speakerName: '客栈老板',
        text: '旅途辛苦了，要在这里休息吗？',
        expression: Expression.NORMAL,
        event: { type: DialogEventType.HEAL, data: {} },
      },
    ],
  },
  {
    id: 'sacred_entrance_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '你来到了苗族圣地的入口。',
        expression: Expression.NORMAL,
        nextDialogId: 'sacred_entrance_intro_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这里就是圣地了...感觉很神圣。',
        expression: Expression.THINKING,
        nextDialogId: 'sacred_entrance_intro_3',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '迷宫中藏有五灵珠，但要小心机关陷阱。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'shrine_guardian_intro',
    lines: [
      {
        speakerId: 'shrine_guardian',
        speakerName: '圣地守护者',
        text: '勇士，你已经来到了圣地神殿。',
        expression: Expression.NORMAL,
        nextDialogId: 'shrine_guardian_intro_2',
      },
      {
        speakerId: 'shrine_guardian',
        speakerName: '圣地守护者',
        text: '五灵珠分别代表火、水、风、雷、土五种元素力量。',
        expression: Expression.THINKING,
        nextDialogId: 'shrine_guardian_intro_3',
      },
      {
        speakerId: 'shrine_guardian',
        speakerName: '圣地守护者',
        text: '只有集齐五灵珠，才能唤醒女娲后人的力量，打败拜月教主。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'shrine_awaken_linger_cutscene',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '五灵珠散发出璀璨的光芒，环绕在赵灵儿周围...',
        expression: Expression.NORMAL,
        nextDialogId: 'shrine_awaken_linger_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '我感觉...一股强大的力量正在觉醒...',
        expression: Expression.SURPRISED,
        nextDialogId: 'shrine_awaken_linger_3',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '这是...女娲的力量！我终于觉醒了！',
        expression: Expression.HAPPY,
        nextDialogId: 'shrine_awaken_linger_4',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '赵灵儿的真正力量觉醒了，她现在可以使用更强大的仙术！',
        expression: Expression.NORMAL,
      },
    ],
  },
  // Chapter 1 Story Dialogs - US-035
  {
    id: 'prologue_dream',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '夜深人静，李逍遥陷入了梦境...',
        expression: Expression.NORMAL,
        nextDialogId: 'prologue_dream_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '梦中，一位白衣剑客在月光下舞剑，剑光如虹...',
        expression: Expression.NORMAL,
        nextDialogId: 'prologue_dream_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这剑法...好精妙！我也要学会它！',
        expression: Expression.SURPRISED,
        nextDialogId: 'prologue_dream_4',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '梦中习剑，虽然只是虚幻，但剑法的精髓已印入脑海...',
        expression: Expression.NORMAL,
        nextDialogId: 'prologue_dream_5',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '嗯...天亮了...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'ch1_aunt_sick',
    lines: [
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '咳咳咳...',
        expression: Expression.SAD,
        nextDialogId: 'ch1_aunt_sick_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '婶婶！您怎么了？',
        expression: Expression.SURPRISED,
        nextDialogId: 'ch1_aunt_sick_3',
      },
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '逍遥...我这病越来越重了...',
        expression: Expression.SAD,
        nextDialogId: 'ch1_aunt_sick_4',
      },
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '听说仙灵岛上有一种仙药，能治百病...',
        expression: Expression.NORMAL,
        nextDialogId: 'ch1_aunt_sick_5',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '婶婶，我去仙灵岛为您寻药！',
        expression: Expression.NORMAL,
        nextDialogId: 'ch1_aunt_sick_6',
      },
      {
        speakerId: 'yuhang_aunt',
        speakerName: '婶婶',
        text: '好孩子...但是仙灵岛路途遥远，你要小心...',
        expression: Expression.SAD,
      },
    ],
  },
  {
    id: 'ch1_drunkard_teach',
    lines: [
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '年轻人，要去仙灵岛？那地方可不容易去...',
        expression: Expression.THINKING,
        nextDialogId: 'ch1_drunkard_teach_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '我必须去，婶婶病重，需要仙灵岛的仙药！',
        expression: Expression.NORMAL,
        nextDialogId: 'ch1_drunkard_teach_3',
      },
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '好吧，我看你心诚，教你一套御剑术，可以御剑飞往仙灵岛。',
        expression: Expression.NORMAL,
        nextDialogId: 'ch1_drunkard_teach_4',
      },
      {
        speakerId: 'yuhang_drunkard',
        speakerName: '醉道士',
        text: '记住，剑由心发，意到剑到。心中无剑，方能御剑。',
        expression: Expression.HAPPY,
        event: { type: DialogEventType.SET_FLAG, data: { flagName: 'learned_yujianshu', flagValue: true } },
      },
    ],
  },
  {
    id: 'ch1_enter_xianling',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '御剑飞行，李逍遥来到了仙灵岛...',
        expression: Expression.NORMAL,
        nextDialogId: 'ch1_enter_xianling_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这就是传说中的仙灵岛...真是美如仙境！',
        expression: Expression.SURPRISED,
        nextDialogId: 'ch1_enter_xianling_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '我得小心前进，寻找仙药的踪迹...',
        expression: Expression.THINKING,
      },
    ],
  },
  {
    id: 'ch1_maze_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '仙灵岛迷宫，传说中仙女居住的地方...',
        expression: Expression.NORMAL,
        nextDialogId: 'ch1_maze_intro_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这迷宫好复杂...还遇到一些奇怪的怪物！',
        expression: Expression.SURPRISED,
      },
    ],
  },
  {
    id: 'ch1_baiyue_attack',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '突然，一群黑衣人闯入仙灵岛！',
        expression: Expression.NORMAL,
        nextDialogId: 'ch1_baiyue_attack_2',
      },
      {
        speakerId: 'baiyue_cultist',
        speakerName: '拜月教徒',
        text: '赵灵儿！教主命令我们带回你！',
        expression: Expression.ANGRY,
        nextDialogId: 'ch1_baiyue_attack_3',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '你们...你们是什么人？',
        expression: Expression.SURPRISED,
        nextDialogId: 'ch1_baiyue_attack_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿，快躲开！我来对付他们！',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'ch1_linger_captured',
    lines: [
      {
        speakerId: 'baiyue_cultist',
        speakerName: '拜月教徒',
        text: '哈哈哈！李逍遥，你虽然有些本事，但救不了她！',
        expression: Expression.ANGRY,
        nextDialogId: 'ch1_linger_captured_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥...救我...',
        expression: Expression.SAD,
        nextDialogId: 'ch1_linger_captured_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿！我一定会救你回来！',
        expression: Expression.ANGRY,
        nextDialogId: 'ch1_linger_captured_4',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '拜月教徒带走了赵灵儿，李逍遥必须踏上寻找她的旅程...',
        expression: Expression.NORMAL,
        event: { type: DialogEventType.SET_FLAG, data: { flagName: 'linger_captured', flagValue: true } },
      },
    ],
  },
  // US-038: 十年前回忆剧情 - Flashback dialogs
  {
    id: 'flashback_trigger_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '你们来到了苗族圣地神殿，五灵珠的力量在此汇聚...',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_trigger_intro_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '这里...我感觉到一股熟悉的力量...',
        expression: Expression.SURPRISED,
        nextDialogId: 'flashback_trigger_intro_3',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '似乎有什么记忆正在苏醒...',
        expression: Expression.THINKING,
        nextDialogId: 'flashback_trigger_intro_4',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '灵珠的光芒闪烁，时光的力量开始涌动...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'flashback_nanzhao_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '一阵光芒过后，你发现自己来到了一个陌生的地方...',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_nanzhao_intro_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这是...哪里？为什么周围的景象如此不同？',
        expression: Expression.SURPRISED,
        nextDialogId: 'flashback_nanzhao_intro_3',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '这里是十年前的南诏国...女娲后人的故乡。',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_nanzhao_intro_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '十年前？难道我穿越了时光？',
        expression: Expression.SURPRISED,
      },
    ],
  },
  {
    id: 'flashback_wuhou_meet',
    lines: [
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '你是...来自未来的旅人？',
        expression: Expression.SURPRISED,
        nextDialogId: 'flashback_wuhou_meet_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '您是...巫后？传说中的女娲后人？',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_wuhou_meet_3',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '是的，我是南诏国的巫后，也是灵儿的母亲。',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_wuhou_meet_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿的母亲？！',
        expression: Expression.SURPRISED,
        nextDialogId: 'flashback_wuhou_meet_5',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '你来自未来，一定是为了某个重要的事情...',
        expression: Expression.THINKING,
        nextDialogId: 'flashback_wuhou_meet_6',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '让我带你去看一看即将发生的事...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'wuhou_intro',
    lines: [
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '我是南诏国的巫后，守护着这片土地的安宁。',
        expression: Expression.NORMAL,
        nextDialogId: 'wuhou_intro_2',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '但最近，一股邪恶的力量正在逼近...',
        expression: Expression.SAD,
      },
    ],
  },
  {
    id: 'nanzhao_king_intro',
    lines: [
      {
        speakerId: 'nanzhao_king',
        speakerName: '南诏王',
        text: '我的王国是这片土地上最繁荣的国家。',
        expression: Expression.NORMAL,
        nextDialogId: 'nanzhao_king_intro_2',
      },
      {
        speakerId: 'nanzhao_king',
        speakerName: '南诏王',
        text: '但有巫后守护着我们，任何邪恶都无法入侵。',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'nanzhao_guard_intro',
    lines: [
      {
        speakerId: 'nanzhao_guard',
        speakerName: '侍卫',
        text: '你好，外乡人。这里是南诏国王宫。',
        expression: Expression.NORMAL,
        nextDialogId: 'nanzhao_guard_intro_2',
      },
      {
        speakerId: 'nanzhao_guard',
        speakerName: '侍卫',
        text: '王宫内有巫后大人守护，十分安全。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'flashback_water_beast_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '巫后带领你来到了南诏国的圣地...',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_water_beast_intro_2',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '这里...就是水魔兽将要苏醒的地方。',
        expression: Expression.SAD,
        nextDialogId: 'flashback_water_beast_intro_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '水魔兽？那是什么？',
        expression: Expression.THINKING,
        nextDialogId: 'flashback_water_beast_intro_4',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '水魔兽是上古时代的凶兽，被封印在此地。',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_water_beast_intro_5',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '但拜月教主正在试图解开它的封印...',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'flashback_wuhou_seal',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '突然，天空乌云密布，水魔兽开始苏醒！',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_wuhou_seal_2',
      },
      {
        speakerId: 'water_beast',
        speakerName: '水魔兽',
        text: '吼！！！',
        expression: Expression.ANGRY,
        nextDialogId: 'flashback_wuhou_seal_3',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '不好！水魔兽已经开始苏醒了！',
        expression: Expression.SURPRISED,
        nextDialogId: 'flashback_wuhou_seal_4',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '我必须用尽所有力量重新封印它！',
        expression: Expression.ANGRY,
        nextDialogId: 'flashback_wuhou_seal_5',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '水灵珠...请赐予我力量！',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_wuhou_seal_6',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '巫后聚集全身力量，与水灵珠融为一体...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'flashback_wuhou_sacrifice',
    lines: [
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '水魔兽，接受女娲后人的封印吧！',
        expression: Expression.ANGRY,
        nextDialogId: 'flashback_wuhou_sacrifice_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '一道蓝光从天而降，水魔兽被重新封印！',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_wuhou_sacrifice_3',
      },
      {
        speakerId: 'water_beast',
        speakerName: '水魔兽',
        text: '吼...！',
        expression: Expression.SAD,
        nextDialogId: 'flashback_wuhou_sacrifice_4',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '逍遥...请收下这颗水灵珠...',
        expression: Expression.SAD,
        nextDialogId: 'flashback_wuhou_sacrifice_5',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '这是我...留给灵儿...最后的遗产...',
        expression: Expression.SAD,
        nextDialogId: 'flashback_wuhou_sacrifice_6',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '巫后...！',
        expression: Expression.SAD,
        nextDialogId: 'flashback_wuhou_sacrifice_7',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '巫后将水灵珠交给李逍遥，她的身体渐渐消失...',
        expression: Expression.NORMAL,
        event: { type: DialogEventType.GET_ITEM, data: { itemId: 'water_pearl', quantity: 1 } },
      },
    ],
  },
  {
    id: 'flashback_water_beast_seal_scene',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '你来到了封印水魔兽的核心位置...',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_water_beast_seal_scene_2',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '这里就是我将要封印水魔兽的地方...',
        expression: Expression.SAD,
        nextDialogId: 'flashback_water_beast_seal_scene_3',
      },
      {
        speakerId: 'wuhou',
        speakerName: '巫后',
        text: '你必须亲眼见证这一切...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'flashback_return',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '时光回溯的力量开始消退...',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_return_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '巫后...她的牺牲...我终于明白了。',
        expression: Expression.SAD,
        nextDialogId: 'flashback_return_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '水灵珠...我会用它来完成使命。',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_return_4',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '光芒再次闪烁，你即将返回现代...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'flashback_aftermath',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '时光回溯结束，你回到了苗族圣地神殿。',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_aftermath_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥...我刚才感觉到...母亲的气息...',
        expression: Expression.SAD,
        nextDialogId: 'flashback_aftermath_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿...我见到了你的母亲，巫后大人。',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_aftermath_4',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '母亲...她为了封印水魔兽，牺牲了自己...',
        expression: Expression.SAD,
        nextDialogId: 'flashback_aftermath_5',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥，水灵珠...是母亲留给我的遗产。',
        expression: Expression.NORMAL,
        nextDialogId: 'flashback_aftermath_6',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '是的，我们现在已经集齐了五灵珠！',
        expression: Expression.HAPPY,
        nextDialogId: 'flashback_aftermath_7',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '五灵珠集齐，灵儿的力量开始觉醒...',
        expression: Expression.NORMAL,
      },
    ],
  },
  // US-039: Miao Chapter dialogs
  {
    id: 'miao_enter',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '你踏入了苗疆的土地，空气中弥漫着神秘的气息。',
        expression: Expression.NORMAL,
        nextDialogId: 'miao_enter_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这里就是苗疆了...我们要在这里收集五灵珠。',
        expression: Expression.NORMAL,
        nextDialogId: 'miao_enter_3',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥，我感觉到...这里的力量与我血脉相连。',
        expression: Expression.THINKING,
      },
    ],
  },
  {
    id: 'miao_conflict_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '你来到了黑苗族的聚居地，感受到两族之间紧张的氛围。',
        expression: Expression.NORMAL,
        nextDialogId: 'miao_conflict_intro_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '黑苗族和白苗族之间似乎有很大的矛盾...',
        expression: Expression.THINKING,
      },
    ],
  },
  {
    id: 'miao_conflict_black_leader',
    lines: [
      {
        speakerId: 'black_miao_leader',
        speakerName: '黑苗族首领',
        text: '外乡人，你来这里做什么？',
        expression: Expression.ANGRY,
        nextDialogId: 'miao_conflict_black_leader_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '首领大人，我们是为收集五灵珠而来，并无恶意。',
        expression: Expression.NORMAL,
        nextDialogId: 'miao_conflict_black_leader_3',
      },
      {
        speakerId: 'black_miao_leader',
        speakerName: '黑苗族首领',
        text: '灵珠...那是我们苗族的圣物！你们外乡人凭什么拿走？',
        expression: Expression.ANGRY,
        nextDialogId: 'miao_conflict_black_leader_4',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '首领大人...我是女娲的后人，灵珠与我的血脉相连。',
        expression: Expression.NORMAL,
        nextDialogId: 'miao_conflict_black_leader_5',
      },
      {
        speakerId: 'black_miao_leader',
        speakerName: '黑苗族首领',
        text: '女娲后人...？如果是真的，那就去圣地证明你的力量！',
        expression: Expression.SURPRISED,
      },
    ],
  },
  {
    id: 'miao_conflict_white_leader',
    lines: [
      {
        speakerId: 'white_miao_leader',
        speakerName: '白苗族首领',
        text: '我听说了你们的来意。既然是女娲后人，我们愿意帮助你们。',
        expression: Expression.HAPPY,
        nextDialogId: 'miao_conflict_white_leader_2',
      },
      {
        speakerId: 'white_miao_leader',
        speakerName: '白苗族首领',
        text: '圣地中藏有火、风、雷、土四颗灵珠，水灵珠则在时光回溯中获得。',
        expression: Expression.NORMAL,
        nextDialogId: 'miao_conflict_white_leader_3',
      },
      {
        speakerId: 'white_miao_leader',
        speakerName: '白苗族首领',
        text: '我的女儿阿奴可以引导你们进入圣地。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'anu_join_intro',
    lines: [
      {
        speakerId: 'anu',
        speakerName: '阿奴',
        text: '嘿！我是阿奴，白苗族首领的女儿！听说你们要收集灵珠？',
        expression: Expression.HAPPY,
        nextDialogId: 'anu_join_intro_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '阿奴？你就是白苗族首领的女儿？',
        expression: Expression.SURPRISED,
        nextDialogId: 'anu_join_intro_3',
      },
      {
        speakerId: 'anu',
        speakerName: '阿奴',
        text: '对啊！我从小就学会了很多苗族的神仙术，可以帮你们打败守护灵珠的怪物！',
        expression: Expression.HAPPY,
        nextDialogId: 'anu_join_intro_4',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '阿奴妹妹...谢谢你愿意帮助我们。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'anu_join_accept',
    lines: [
      {
        speakerId: 'anu',
        speakerName: '阿奴',
        text: '好！我们一起去圣地，收集五灵珠！',
        expression: Expression.HAPPY,
        nextDialogId: 'anu_join_accept_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '阿奴加入了队伍。',
        expression: Expression.NORMAL,
        event: { type: DialogEventType.ADD_PARTY_MEMBER, data: { characterId: 'anu' } },
      },
    ],
  },
  {
    id: 'pearl_fire_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '你来到了圣地迷宫的第一层，感受到炙热的气息。',
        expression: Expression.NORMAL,
        nextDialogId: 'pearl_fire_intro_2',
      },
      {
        speakerId: 'anu',
        speakerName: '阿奴',
        text: '这里就是火灵珠的守护地！小心，火之守护者很强！',
        expression: Expression.SURPRISED,
      },
    ],
  },
  {
    id: 'pearl_fire_obtained',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '火之守护者被击败！你获得了火灵珠！',
        expression: Expression.NORMAL,
        nextDialogId: 'pearl_fire_obtained_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '第一颗灵珠到手！继续前进！',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'pearl_wind_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '圣地迷宫第二层，狂风呼啸。',
        expression: Expression.NORMAL,
        nextDialogId: 'pearl_wind_intro_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '风灵珠就在这里...我能感觉到它的气息。',
        expression: Expression.THINKING,
      },
    ],
  },
  {
    id: 'pearl_wind_obtained',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '风之守护者被击败！你获得了风灵珠！',
        expression: Expression.NORMAL,
        nextDialogId: 'pearl_wind_obtained_2',
      },
      {
        speakerId: 'anu',
        speakerName: '阿奴',
        text: '两颗了！还差三颗！',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'pearl_thunder_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '圣地迷宫第三层，雷声轰鸣。',
        expression: Expression.NORMAL,
        nextDialogId: 'pearl_thunder_intro_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '雷灵珠...这里的守护者肯定更强！',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'pearl_thunder_obtained',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '雷之守护者被击败！你获得了雷灵珠！',
        expression: Expression.NORMAL,
        nextDialogId: 'pearl_thunder_obtained_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '三颗灵珠...还差土灵珠和水灵珠。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'pearl_earth_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '圣地迷宫最深处，大地之力涌动。',
        expression: Expression.NORMAL,
        nextDialogId: 'pearl_earth_intro_2',
      },
      {
        speakerId: 'anu',
        speakerName: '阿奴',
        text: '土灵珠就在这里！这是我们最后的挑战！',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'pearl_earth_obtained',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '土之守护者被击败！你获得了土灵珠！',
        expression: Expression.NORMAL,
        nextDialogId: 'pearl_earth_obtained_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '四颗灵珠到手！现在去神殿寻找水灵珠！',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'miao_pearls_complete',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '你已经收集了火、风、雷、土四颗灵珠！',
        expression: Expression.NORMAL,
        nextDialogId: 'miao_pearls_complete_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥...我还感觉到水灵珠的气息，它似乎在...过去。',
        expression: Expression.THINKING,
        nextDialogId: 'miao_pearls_complete_3',
      },
      {
        speakerId: 'anu',
        speakerName: '阿奴',
        text: '圣地神殿有时光回溯的力量！也许在那里可以找到水灵珠！',
        expression: Expression.NORMAL,
        nextDialogId: 'miao_pearls_complete_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '好！我们去圣地神殿！',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'linger_awakening_start',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '五灵珠齐聚，灵儿身上的女娲之力开始觉醒！',
        expression: Expression.NORMAL,
        nextDialogId: 'linger_awakening_start_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '啊...我的身体...感觉有什么力量在涌动...',
        expression: Expression.SURPRISED,
      },
    ],
  },
  {
    id: 'linger_awakening_power',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '五灵珠的光芒汇聚在灵儿身上，她的女娲血脉彻底觉醒！',
        expression: Expression.NORMAL,
        nextDialogId: 'linger_awakening_power_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '这是...母亲的力量...女娲神力！我现在可以...与拜月教主一战了！',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'linger_awakening_complete',
    lines: [
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥，阿奴...我已经觉醒了女娲之力。让我们一起去打败拜月教主！',
        expression: Expression.NORMAL,
        nextDialogId: 'linger_awakening_complete_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿...太好了！我们一起去！',
        expression: Expression.HAPPY,
        nextDialogId: 'linger_awakening_complete_3',
      },
      {
        speakerId: 'anu',
        speakerName: '阿奴',
        text: '终于可以决战了！拜月教主，等着我们！',
        expression: Expression.HAPPY,
      },
    ],
  },
  // US-040: Final Battle dialogs
  {
    id: 'final_battle_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '四人来到拜月教总部祭坛，拜月教主正在等待...',
        expression: Expression.NORMAL,
        nextDialogId: 'final_battle_intro_2',
      },
      {
        speakerId: 'baiyue_leader',
        speakerName: '拜月教主',
        text: '哈哈哈！你们终于来了。今天，我将召唤水魔兽，毁灭这个世界！',
        expression: Expression.ANGRY,
        nextDialogId: 'final_battle_intro_3',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '拜月教主，你为了权力不惜召唤水魔兽，会害死无数无辜的人！',
        expression: Expression.ANGRY,
        nextDialogId: 'final_battle_intro_4',
      },
      {
        speakerId: 'baiyue_leader',
        speakerName: '拜月教主',
        text: '哼，女娲后人...你以为你能阻止我吗？今天就是你的末日！',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'baiyue_summons_beast',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '拜月教主虽然受了伤，但他依然大笑...',
        expression: Expression.NORMAL,
        nextDialogId: 'baiyue_summons_beast_2',
      },
      {
        speakerId: 'baiyue_leader',
        speakerName: '拜月教主',
        text: '哈哈哈！你们以为这就结束了？水魔兽，出来吧！',
        expression: Expression.ANGRY,
        nextDialogId: 'baiyue_summons_beast_3',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '祭坛上裂开一道巨大的裂缝，远古的水魔兽从深渊中爬出！',
        expression: Expression.NORMAL,
        nextDialogId: 'baiyue_summons_beast_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这就是传说中的水魔兽...它的力量太强大了！',
        expression: Expression.SURPRISED,
      },
    ],
  },
  {
    id: 'final_battle_combo_hint',
    lines: [
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '水魔兽的力量与拜月教主融合，我们必须合力才能击败他！',
        expression: Expression.NORMAL,
        nextDialogId: 'final_battle_combo_hint_2',
      },
      {
        speakerId: 'anu',
        speakerName: '阿奴',
        text: '灵儿姐姐，我们可以使用四人合体技！女娲神威！',
        expression: Expression.HAPPY,
        nextDialogId: 'final_battle_combo_hint_3',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '大家一起！集中力量！',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'final_battle_end',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '四人合力施展女娲神威，光芒笼罩整个祭坛...',
        expression: Expression.NORMAL,
        nextDialogId: 'final_battle_end_2',
      },
      {
        speakerId: 'baiyue_leader',
        speakerName: '拜月教主',
        text: '不可能...不可能！女娲的力量...我...不甘心！',
        expression: Expression.SURPRISED,
        nextDialogId: 'final_battle_end_3',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '拜月教主和水魔兽在光芒中消散，祭坛恢复了宁静。',
        expression: Expression.NORMAL,
        nextDialogId: 'final_battle_end_4',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '终于...结束了。逍遥哥哥，我们做到了。',
        expression: Expression.HAPPY,
        nextDialogId: 'final_battle_end_5',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿，月如，阿奴...谢谢你们一直陪在我身边。',
        expression: Expression.HAPPY,
        nextDialogId: 'final_battle_end_6',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '四人的冒险到此结束，新的故事即将开始...',
        expression: Expression.NORMAL,
      },
    ],
  },
  // Bai Yue HQ dialogs
  {
    id: 'baiyue_guard_intro',
    lines: [
      {
        speakerId: 'baiyue_guard',
        speakerName: '拜月教徒',
        text: '这里是拜月教的圣地，禁止外人进入！',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'baiyue_priest_intro',
    lines: [
      {
        speakerId: 'baiyue_priest',
        speakerName: '拜月教长老',
        text: '教主大人正在祭坛等待，你们这些入侵者不会有好下场！',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'baiyue_leader_intro',
    lines: [
      {
        speakerId: 'baiyue_leader',
        speakerName: '拜月教主',
        text: '你们终于来了...哈哈哈！今天就是你们的末日！',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'final_battle_start',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '进入祭坛，决战即将开始...',
        expression: Expression.NORMAL,
      },
    ],
  },
  // Ending dialogs - US-041: 多结局系统
  // Default ending - 灵儿结局
  {
    id: 'ending_linger_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '拜月教主终于倒下，但战斗的代价是沉重的...',
        expression: Expression.NORMAL,
        nextDialogId: 'ending_linger_intro_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥...我必须传承女娲之力，拯救这个世界...',
        expression: Expression.SAD,
        nextDialogId: 'ending_linger_intro_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿！难道没有其他办法吗？',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'ending_linger_sacrifice',
    lines: [
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '这是我的命运...作为女娲后人，我必须守护这片大地。',
        expression: Expression.NORMAL,
        nextDialogId: 'ending_linger_sacrifice_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥，请不要忘记我...我会永远守护着你...',
        expression: Expression.SAD,
        nextDialogId: 'ending_linger_sacrifice_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿...！我永远不会忘记你！',
        expression: Expression.SAD,
      },
    ],
  },
  {
    id: 'ending_linger_final',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '灵儿化身为光，融入了天地之间...',
        expression: Expression.NORMAL,
        nextDialogId: 'ending_linger_final_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '她的身影消失在光芒中，只留下一颗晶莹的水灵珠。',
        expression: Expression.NORMAL,
        nextDialogId: 'ending_linger_final_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿...我会带着你的祝福，继续前行。',
        expression: Expression.SAD,
      },
    ],
  },
  // Yueru ending - 月如重逢
  {
    id: 'ending_yueru_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '战斗结束后，你取出月如遗物，心中涌起无尽的思念...',
        expression: Expression.NORMAL,
        nextDialogId: 'ending_yueru_intro_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '月如...我多希望能再见你一面...',
        expression: Expression.SAD,
        nextDialogId: 'ending_yueru_intro_3',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '遗物散发出温暖的光芒，仿佛回应着你的呼唤...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'ending_yueru_reunion',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '光芒中，一个熟悉的身影渐渐显现...',
        expression: Expression.NORMAL,
        nextDialogId: 'ending_yueru_reunion_2',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '逍遥...是你吗？我好像做了一个很长的梦...',
        expression: Expression.SURPRISED,
        nextDialogId: 'ending_yueru_reunion_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '月如！真的是你！你回来了！',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'ending_yueru_final',
    lines: [
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '逍遥，你一直守护着我...我终于能再次见到你了。',
        expression: Expression.HAPPY,
        nextDialogId: 'ending_yueru_final_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '月如，让我们一起，重新开始...',
        expression: Expression.HAPPY,
        nextDialogId: 'ending_yueru_final_3',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '月光如水，剑影温柔，两人的身影交织在一起...',
        expression: Expression.NORMAL,
      },
    ],
  },
  // All survive ending - 全员存活
  {
    id: 'ending_all_survive_intro',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '女娲之力觉醒，奇迹降临...',
        expression: Expression.NORMAL,
        nextDialogId: 'ending_all_survive_intro_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥...还有大家...我感受到一股强大的力量...',
        expression: Expression.SURPRISED,
        nextDialogId: 'ending_all_survive_intro_3',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '女娲玉佩与月如遗物同时闪耀，交织成神奇的光辉...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'ending_all_survive_reunion',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '光芒中，月如的身影重现...',
        expression: Expression.NORMAL,
        nextDialogId: 'ending_all_survive_reunion_2',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '逍遥...灵儿...阿奴...你们都还在！',
        expression: Expression.HAPPY,
        nextDialogId: 'ending_all_survive_reunion_3',
      },
      {
        speakerId: 'anu',
        speakerName: '阿奴',
        text: '月如姐姐！你真的回来了！',
        expression: Expression.HAPPY,
        nextDialogId: 'ending_all_survive_reunion_4',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '月如...我们终于又能相聚了。',
        expression: Expression.HAPPY,
      },
    ],
  },
  {
    id: 'ending_all_survive_final',
    lines: [
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿、月如、阿奴...谢谢你们一直陪着我。',
        expression: Expression.HAPPY,
        nextDialogId: 'ending_all_survive_final_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥，我们一起，守护这片大地。',
        expression: Expression.NORMAL,
        nextDialogId: 'ending_all_survive_final_3',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '四人并肩站立，夕阳洒下金色的光芒...',
        expression: Expression.NORMAL,
        nextDialogId: 'ending_all_survive_final_4',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '这就是他们的故事，一段关于爱与守护的传奇...',
        expression: Expression.NORMAL,
      },
    ],
  },
  // US-027: 白河村对话
  {
    id: 'han_doctor_story',
    lines: [
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '少侠，我有一事相求...',
        expression: Expression.SAD,
        nextDialogId: 'han_doctor_story_2',
      },
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '我女儿梦慈，被隐龙窟的妖魔抓去了...',
        expression: Expression.SAD,
        nextDialogId: 'han_doctor_story_3',
      },
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '隐龙窟深处有两条妖魔，一条蛇妖，一条狐妖...',
        expression: Expression.NORMAL,
        nextDialogId: 'han_doctor_story_4',
      },
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '少侠若能救回我女儿，我愿倾尽所有报答！',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'mengci_captured_news',
    lines: [
      {
        speakerId: 'han_mother',
        speakerName: '韩母',
        text: '梦慈啊...我的梦慈啊...',
        expression: Expression.SAD,
        nextDialogId: 'mengci_captured_news_2',
      },
      {
        speakerId: 'han_mengci',
        speakerName: '村民',
        text: '听说那隐龙窟里妖魔横行，没人敢进去...',
        expression: Expression.NORMAL,
        nextDialogId: 'mengci_captured_news_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '不管多危险，我都要去救她！',
        expression: Expression.NORMAL,
      },
    ],
  },
  // US-028: 鬼阴山对话
  {
    id: 'shi_elder_appear',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '前方出现一个黑袍老者...',
        expression: Expression.NORMAL,
        nextDialogId: 'shi_elder_appear_2',
      },
      {
        speakerId: 'shi_elder',
        speakerName: '石长老',
        text: '李逍遥，我等你很久了...',
        expression: Expression.NORMAL,
        nextDialogId: 'shi_elder_appear_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '你是谁？为什么要等我？',
        expression: Expression.SURPRISED,
        nextDialogId: 'shi_elder_appear_4',
      },
      {
        speakerId: 'shi_elder',
        speakerName: '石长老',
        text: '我是拜月教主的使者，奉命带走赵灵儿...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'shi_elder_take_linger',
    lines: [
      {
        speakerId: 'shi_elder',
        speakerName: '石长老',
        text: '赵灵儿，你身为女娲后人，必须回到南诏国...',
        expression: Expression.NORMAL,
        nextDialogId: 'shi_elder_take_linger_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '我不去！我要和逍遥哥哥在一起！',
        expression: Expression.ANGRY,
        nextDialogId: 'shi_elder_take_linger_3',
      },
      {
        speakerId: 'shi_elder',
        speakerName: '石长老',
        text: '这是命运，你无法抗拒...',
        expression: Expression.NORMAL,
        nextDialogId: 'shi_elder_take_linger_4',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '休想！我们绝不会让你带走灵儿！',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'linger_taken_away',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '石长老施展法术，一股黑雾笼罩住灵儿...',
        expression: Expression.NORMAL,
        nextDialogId: 'linger_taken_away_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥...救我...',
        expression: Expression.SAD,
        nextDialogId: 'linger_taken_away_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿！！',
        expression: Expression.SURPRISED,
        nextDialogId: 'linger_taken_away_4',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '灵儿的身影消失在黑雾中...',
        expression: Expression.NORMAL,
        nextDialogId: 'linger_taken_away_5',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '逍遥，我们要去救灵儿，不管天涯海角！',
        expression: Expression.NORMAL,
      },
    ],
  },
  // US-029: 扬州城对话
  {
    id: 'enter_yangzhou_marvel',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '扬州城，繁华的商业之都...',
        expression: Expression.NORMAL,
        nextDialogId: 'enter_yangzhou_marvel_2',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这扬州城真是繁华啊！人来人往，商铺林立...',
        expression: Expression.NORMAL,
        nextDialogId: 'enter_yangzhou_marvel_3',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '我们先找个落脚的地方吧...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'thief_appear',
    lines: [
      {
        speakerId: 'yangzhou_magistrate',
        speakerName: '扬州知府',
        text: '最近城里有个女飞贼作案多起，百姓人心惶惶...',
        expression: Expression.NORMAL,
        nextDialogId: 'thief_appear_2',
      },
      {
        speakerId: 'yangzhou_magistrate',
        speakerName: '扬州知府',
        text: '两位侠士若能帮忙捉拿，必有重赏！',
        expression: Expression.NORMAL,
        nextDialogId: 'thief_appear_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '女飞贼？有意思，我们来看看是谁敢在这扬州城作案！',
        expression: Expression.NORMAL,
      },
    ],
  },
  // US-030: 京城彩依对话
  {
    id: 'caiyi_jinyuan_story',
    lines: [
      {
        speakerId: 'liu_jinyuan',
        speakerName: '刘晋元',
        text: '咳咳...咳咳...',
        expression: Expression.SAD,
        nextDialogId: 'caiyi_jinyuan_story_2',
      },
      {
        speakerId: 'caiyi',
        speakerName: '彩依',
        text: '晋元...你病得这么重...',
        expression: Expression.SAD,
        nextDialogId: 'caiyi_jinyuan_story_3',
      },
      {
        speakerId: 'liu_jinyuan',
        speakerName: '刘晋元',
        text: '彩依，自从遇见你，我的病似乎好了一些...',
        expression: Expression.NORMAL,
        nextDialogId: 'caiyi_jinyuan_story_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '这位姑娘是...？',
        expression: Expression.NORMAL,
        nextDialogId: 'caiyi_jinyuan_story_5',
      },
      {
        speakerId: 'liu_jinyuan',
        speakerName: '刘晋元',
        text: '这是我妻子彩依，她对我照顾得无微不至...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'caiyi_reveal',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '深夜，彩依独自来到晋元的房间...',
        expression: Expression.NORMAL,
        nextDialogId: 'caiyi_reveal_2',
      },
      {
        speakerId: 'caiyi',
        speakerName: '彩依',
        text: '晋元的病越来越重了...唯有用我千年修为...',
        expression: Expression.SAD,
        nextDialogId: 'caiyi_reveal_3',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '彩依的身影开始变化，一只美丽的蝴蝶显现...',
        expression: Expression.NORMAL,
        nextDialogId: 'caiyi_reveal_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '彩依...你竟然是...蝴蝶精？！',
        expression: Expression.SURPRISED,
        nextDialogId: 'caiyi_reveal_5',
      },
      {
        speakerId: 'caiyi',
        speakerName: '彩依',
        text: '李逍遥，我不是妖魔，我只是想救晋元...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'caiyi_death',
    lines: [
      {
        speakerId: 'caiyi',
        speakerName: '彩依',
        text: '我愿用我千年的修为，换晋元一生的平安...',
        expression: Expression.SAD,
        nextDialogId: 'caiyi_death_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '彩依化作一只美丽的蝴蝶，飞向晋元...',
        expression: Expression.NORMAL,
        nextDialogId: 'caiyi_death_3',
      },
      {
        speakerId: 'liu_jinyuan',
        speakerName: '刘晋元',
        text: '彩依！！不要离开我！！',
        expression: Expression.SAD,
        nextDialogId: 'caiyi_death_4',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '彩依化作蝴蝶，永远守护在晋元身边...',
        expression: Expression.NORMAL,
        nextDialogId: 'caiyi_death_5',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '彩依...为了爱情，你甘愿放弃千年修为...',
        expression: Expression.SAD,
      },
    ],
  },
  // US-031: 蜀山对话
  {
    id: 'shushan_welcome',
    lines: [
      {
        speakerId: 'shushan_disciple',
        speakerName: '蜀山弟子',
        text: '欢迎来到蜀山剑派！',
        expression: Expression.NORMAL,
        nextDialogId: 'shushan_welcome_2',
      },
      {
        speakerId: 'shushan_disciple',
        speakerName: '蜀山弟子',
        text: '两位侠士前来，有何贵干？',
        expression: Expression.NORMAL,
        nextDialogId: 'shushan_welcome_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '我们听说锁妖塔中有人被囚禁，特来求救...',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'suoyaota_history',
    lines: [
      {
        speakerId: 'shushan_elder',
        speakerName: '蜀山长老',
        text: '锁妖塔乃蜀山历代剑仙建造，用于封印妖魔...',
        expression: Expression.NORMAL,
        nextDialogId: 'suoyaota_history_2',
      },
      {
        speakerId: 'shushan_elder',
        speakerName: '蜀山长老',
        text: '赵灵儿...她确实是女娲后人，被我们误认为妖魔...',
        expression: Expression.NORMAL,
        nextDialogId: 'suoyaota_history_3',
      },
      {
        speakerId: 'shushan_elder',
        speakerName: '蜀山长老',
        text: '若你们能证明她并非妖魔，我们愿放她离去...',
        expression: Expression.NORMAL,
        nextDialogId: 'suoyaota_history_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '灵儿是女娲后人，不是妖魔！我一定要救她！',
        expression: Expression.NORMAL,
      },
    ],
  },
  // US-001: 白河村/隐龙窟剧情对话
  {
    id: 'han_doctor_plea',
    lines: [
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '少侠...少侠！',
        expression: Expression.SAD,
        nextDialogId: 'han_doctor_plea_2',
      },
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '求求你，救救我女儿！',
        expression: Expression.SAD,
        nextDialogId: 'han_doctor_plea_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '韩大夫，您慢慢说，到底发生了什么事？',
        expression: Expression.NORMAL,
        nextDialogId: 'han_doctor_plea_4',
      },
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '我女儿梦慈...被隐龙窟的妖魔掳走了！',
        expression: Expression.SAD,
      },
    ],
  },
  {
    id: 'han_doctor_explain_yinlong',
    lines: [
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '隐龙窟在白河村北边，那里常年迷雾笼罩...',
        expression: Expression.NORMAL,
        nextDialogId: 'han_doctor_explain_yinlong_2',
      },
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '传说窟中住着两条妖魔，一条蛇妖，一条狐妖...',
        expression: Expression.NORMAL,
        nextDialogId: 'han_doctor_explain_yinlong_3',
      },
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '它们每隔一段时间就会出来掳掠年轻女子...',
        expression: Expression.SAD,
        nextDialogId: 'han_doctor_explain_yinlong_4',
      },
      {
        speakerId: 'han_doctor',
        speakerName: '韩医仙',
        text: '没有人敢进去救人，进去的人都没能活着出来...',
        expression: Expression.SAD,
        nextDialogId: 'han_doctor_explain_yinlong_5',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '不管有多危险，我都要去试试！',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'baihe_village_arrive',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '一行人来到了白河村...',
        expression: Expression.NORMAL,
        nextDialogId: 'baihe_village_arrive_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥，这里好像很安静...',
        expression: Expression.NORMAL,
        nextDialogId: 'baihe_village_arrive_3',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '村子里的人似乎都心事重重...',
        expression: Expression.THINKING,
        nextDialogId: 'baihe_village_arrive_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '我们去医馆打听一下情况吧。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'yinlong_cave_entrance',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '隐龙窟的入口弥漫着诡异的气息...',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_cave_entrance_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '这里...有种很不好的感觉...',
        expression: Expression.SAD,
        nextDialogId: 'yinlong_cave_entrance_3',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '小心些，不知道会有什么妖魔在等着我们。',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_cave_entrance_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '大家准备好了吗？我们进去！',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'yinlong_snake_appear',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '一条巨大的蛇妖从黑暗中现身！',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_snake_appear_2',
      },
      {
        speakerId: 'snake_demon',
        speakerName: '蛇妖',
        text: '哈哈哈...又有人类送上门来了！',
        expression: Expression.ANGRY,
        nextDialogId: 'yinlong_snake_appear_3',
      },
      {
        speakerId: 'snake_demon',
        speakerName: '蛇妖',
        text: '正好，我的肚子饿了...',
        expression: Expression.ANGRY,
        nextDialogId: 'yinlong_snake_appear_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '妖孽！你掳掠村民女子，今日我必除你！',
        expression: Expression.ANGRY,
      },
    ],
  },
  {
    id: 'yinlong_snake_defeated',
    lines: [
      {
        speakerId: 'snake_demon',
        speakerName: '蛇妖',
        text: '可恶...你们...你们竟敢...',
        expression: Expression.SAD,
        nextDialogId: 'yinlong_snake_defeated_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '蛇妖倒在血泊中，再也无力作恶...',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_snake_defeated_3',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '哼，这种妖孽，早该被除掉了。',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_snake_defeated_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '我们继续前进，狐妖肯定还在深处。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'yinlong_fox_appear',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '一阵诡异的笑声从深处传来...',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_fox_appear_2',
      },
      {
        speakerId: 'fox_demon',
        speakerName: '狐妖',
        text: '哟，你们打败了那条蠢蛇？',
        expression: Expression.HAPPY,
        nextDialogId: 'yinlong_fox_appear_3',
      },
      {
        speakerId: 'fox_demon',
        speakerName: '狐妖',
        text: '不过...你们以为这样就结束了？',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_fox_appear_4',
      },
      {
        speakerId: 'fox_demon',
        speakerName: '狐妖',
        text: '我可不是那么容易对付的...',
        expression: Expression.ANGRY,
        nextDialogId: 'yinlong_fox_appear_5',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '这狐妖...浑身散发着妖气，小心！',
        expression: Expression.SURPRISED,
      },
    ],
  },
  {
    id: 'yinlong_fox_defeated',
    lines: [
      {
        speakerId: 'fox_demon',
        speakerName: '狐妖',
        text: '不...不可能...我怎么会...',
        expression: Expression.SAD,
        nextDialogId: 'yinlong_fox_defeated_2',
      },
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '狐妖的身影渐渐消失在黑暗中...',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_fox_defeated_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '终于...这两条妖孽都被除掉了。',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_fox_defeated_4',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '现在我们可以去救那些被掳的女子了。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'yinlong_maze_warning',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '隐龙窟深处是一个复杂的迷宫...',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_maze_warning_2',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '逍遥哥哥，这里的道路很复杂...',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_maze_warning_3',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '我感觉...有些女子被囚禁在深处...',
        expression: Expression.THINKING,
        nextDialogId: 'yinlong_maze_warning_4',
      },
      {
        speakerId: 'lin_yueru',
        speakerName: '林月如',
        text: '我们要小心，不要迷失方向。',
        expression: Expression.NORMAL,
      },
    ],
  },
  {
    id: 'yinlong_rescue_mengci',
    lines: [
      {
        speakerId: 'narrator',
        speakerName: '旁白',
        text: '在一间囚室中，你们发现了一位年轻女子...',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_rescue_mengci_2',
      },
      {
        speakerId: 'han_mengci',
        speakerName: '韩梦慈',
        text: '你们...你们是来救我的吗？',
        expression: Expression.SURPRISED,
        nextDialogId: 'yinlong_rescue_mengci_3',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '韩姑娘，你父亲委托我们来救你。',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_rescue_mengci_4',
      },
      {
        speakerId: 'han_mengci',
        speakerName: '韩梦慈',
        text: '父亲...父亲还好吗？',
        expression: Expression.SAD,
      },
    ],
  },
  {
    id: 'yinlong_mengci_thank',
    lines: [
      {
        speakerId: 'han_mengci',
        speakerName: '韩梦慈',
        text: '多谢少侠相救...',
        expression: Expression.NORMAL,
        nextDialogId: 'yinlong_mengci_thank_2',
      },
      {
        speakerId: 'han_mengci',
        speakerName: '韩梦慈',
        text: '若不是你们，我恐怕再也见不到父亲了...',
        expression: Expression.SAD,
        nextDialogId: 'yinlong_mengci_thank_3',
      },
      {
        speakerId: 'zhao_linger',
        speakerName: '赵灵儿',
        text: '韩姑娘，你安全了，我们带你回去。',
        expression: Expression.HAPPY,
        nextDialogId: 'yinlong_mengci_thank_4',
      },
      {
        speakerId: 'li_xiaoyao',
        speakerName: '李逍遥',
        text: '走吧，你父亲一定在焦急地等着你。',
        expression: Expression.NORMAL,
      },
    ],
  },
];

/**
 * Dialog manager - handles dialog loading and state
 */
export class DialogManager {
  private dialogs: Map<string, DialogSequence>;
  private globalFlags: Map<string, boolean | number | string>;

  constructor(dialogs: DialogSequence[] = DEMO_DIALOGS) {
    this.dialogs = new Map();
    this.globalFlags = new Map();

    // Load all dialogs
    for (const dialog of dialogs) {
      this.dialogs.set(dialog.id, dialog);
    }
  }

  /**
   * Get a dialog sequence by ID
   */
  getDialog(id: string): DialogSequence | undefined {
    return this.dialogs.get(id);
  }

  /**
   * Get a specific dialog line
   */
  getDialogLine(sequenceId: string, lineIndex: number): DialogLine | undefined {
    const sequence = this.dialogs.get(sequenceId);
    if (!sequence || lineIndex >= sequence.lines.length) return undefined;
    return sequence.lines[lineIndex];
  }

  /**
   * Get next dialog line based on current state
   */
  getNextLine(state: DialogState): DialogLine | undefined {
    const sequence = state.currentSequence;
    const nextIndex = state.currentLineIndex + 1;

    if (nextIndex >= sequence.lines.length) return undefined;
    return sequence.lines[nextIndex];
  }

  /**
   * Set a global flag
   */
  setFlag(name: string, value: boolean | number | string): void {
    this.globalFlags.set(name, value);
  }

  /**
   * Get a global flag
   */
  getFlag(name: string): boolean | number | string | undefined {
    return this.globalFlags.get(name);
  }

  /**
   * Check if a flag is set to a specific value
   */
  checkFlag(name: string, value: boolean | number | string): boolean {
    return this.globalFlags.get(name) === value;
  }

  /**
   * Check if all flags in conditions are satisfied
   */
  checkConditions(conditions: Record<string, boolean | number | string>): boolean {
    for (const [name, value] of Object.entries(conditions)) {
      if (!this.checkFlag(name, value)) return false;
    }
    return true;
  }

  /**
   * Add a new dialog sequence
   */
  addDialog(dialog: DialogSequence): void {
    this.dialogs.set(dialog.id, dialog);
  }

  /**
   * Get all global flags
   */
  getAllFlags(): Map<string, boolean | number | string> {
    return this.globalFlags;
  }
}