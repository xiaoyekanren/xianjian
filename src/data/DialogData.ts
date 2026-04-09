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