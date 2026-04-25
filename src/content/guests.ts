export interface GuestArchive {
  threshold: number; // Affinity level required to unlock
  title: string;     // Title of the memory fragment
  content: string;   // The unlocked background story
}

export interface DialogueOption {
  text: string;
  nextId?: string; // If undefined, ends dialogue and goes to mixing
  affinityChange?: number;
}

export interface DialogueNode {
  id: string;
  text: string;
  options: DialogueOption[];
}

// A full dialogue tree starting from a specific node
export interface DialogueTree {
  rootId: string;
  nodes: Record<string, DialogueNode>;
}

// Type for dialogue entries in affinity levels (can be a simple string or a complex tree)
export type DialogueEntry = string | DialogueTree;

export interface GuestData {
  id: string;
  name: string;
  title: string;
  basePatience: number;
  bio: string;       // Publicly visible short bio
  archives: GuestArchive[];
  dialogues: {
    enter: string[]; // Generic enter dialogues
    perfect: string;
    good: string;
    bad: string;
    // Affinity-driven dynamic dialogues
    affinityLevels: {
      neutral: DialogueEntry[];  // 0-20
      friendly: DialogueEntry[]; // 21-50
      trusted: DialogueEntry[];  // 51-80
      resonant: DialogueEntry[]; // 81+
    };
  };
  preferredWave: {
    lowTemp?: boolean;
    highSparkle?: boolean;
  };
}

export const GuestsDB: Record<string, GuestData> = {
  "mechanic_01": {
    id: "mechanic_01", name: "老陈", title: "个体维修店主",
    basePatience: 100,
    bio: "在三区经营着一家名为“老陈精修”的店。他那双沾满机油的手，能让任何老机器焕发新生。",
    archives: [
      { threshold: 20, title: "匠人的坚持", content: "他曾是天际重工的高级技术主管，因为不满公司“计划报废”的策略而辞职。他来到三区开店，是为了证明好东西可以用一辈子。" },
      { threshold: 50, title: "快慢之间", content: "他最烦心的是“快节奏”对传统的冲击。现在的年轻人喜欢换发光的塑料外壳，却不在意核心轴承的润滑。他担心效率会磨灭掉所有温情。" },
      { threshold: 80, title: "旧时光的碎片", content: "他地下室里有一台老旧的扫地机器人，那是他刚工作时送给母亲的礼物。他一直在寻找停产的芯片修复它，想留住那段纯粹的旧时光。" }
    ],
    dialogues: {
      enter: [
        "今天三区的信号灯又坏了，堵了半小时，给我来杯顺滑的。",
        "现在的年轻人，义体坏了就知道换新的，没人愿意修了。唉。",
        "老板，有不含合成色素的酒吗？最近胃不太舒服。",
        "刚给邻居王婶修好了她那台古董洗碗机，累死我了。",
        "关节润滑液不够了，懂我意思吧？",
        "吧台还有空位吗？我需要个不用听金属摩擦声的地方。",
        "老规矩，只要不是机油味，什么都行。"
      ],
      perfect: "哈... 神经都舒展开了。这是小费。",
      good: "还行，比昨天机油味好点。",
      bad: "你在逗我？这玩意儿比冷却液还涩。",
      affinityLevels: {
        neutral: [
          "这种老酒吧的味道，比那些连锁店强多了。",
          "今天天际重工又发新公告了，又要强制更新固件，真麻烦。",
          "别看我的手，机油是勤奋的勋章。",
          "这种地方，最适合像我这样的人躲起来。",
          "少说话，多倒酒，对谁都有好处。",
          {
            rootId: "chen_neutral_tree_1",
            nodes: {
              "chen_neutral_tree_1": {
                id: "chen_neutral_tree_1",
                text: "今天有个小伙子拿着一个快报废的军用神经接驳器来找我，说是能在黑市卖个好价钱。",
                options: [
                  { text: "你收了吗？", nextId: "chen_neutral_tree_1_a", affinityChange: 5 },
                  { text: "这听起来像是个麻烦。", nextId: "chen_neutral_tree_1_b" },
                  { text: "不管这些，想喝点什么？" } // undefined nextId -> end dialogue
                ]
              },
              "chen_neutral_tree_1_a": {
                id: "chen_neutral_tree_1_a",
                text: "当然没有。那种东西上面都带着追踪器，我可不想明天就被执法队破门而入。不过那小子看起来挺急需钱的...",
                options: [
                  { text: "每个人都有自己的难处。", nextId: "chen_neutral_tree_1_end", affinityChange: 5 },
                  { text: "不惹麻烦是明智的。" }
                ]
              },
              "chen_neutral_tree_1_b": {
                id: "chen_neutral_tree_1_b",
                text: "大麻烦。黑市里流出来的军用货，十有八九沾着血。我干这行这么久，这点嗅觉还是有的。",
                options: [
                  { text: "那还是别碰为妙。" }
                ]
              },
              "chen_neutral_tree_1_end": {
                id: "chen_neutral_tree_1_end",
                text: "是啊... 难处。好了，不说这些了，给我来杯酒，把这机油味压下去。",
                options: [
                  { text: "马上就好。" }
                ]
              }
            }
          }
        ],
        friendly: [
          "你这调酒的动作，让我想起以前实验室里的精密操作，挺赏心悦目的。",
          "最近物价又涨了，连润滑油都贵了三成，日子得紧着点过了。",
          "有时候觉得，修好一个东西带来的成就感，比发奖金还高兴。",
          "你调酒的手势让我想起我以前带过的徒弟，虽然他已经去大公司赚大钱了。",
          "有时候觉得，这杯子里的波纹比我的扫描仪更准。"
        ],
        trusted: [
          "其实大公司里也有好人，只是大家都得按规矩办事。我那时候太倔了。",
          "我地下室里那台老伙计，今天终于动了一下，虽然只是转了个圈。",
          "调酒师，你说... 如果大家都只追求快，最后会不会把自己也给跑丢了？",
          "三区的风越来越冷了。有时候我会想，如果当初我妥协了，现在会不会坐在市中心喝最好的白兰地？",
          "这是我最后的一点私藏，别告诉别人。"
        ],
        resonant: [
          "谢谢你听我唠叨这些陈芝麻烂谷子的事。这杯酒，喝着心里暖和。",
          "明天我打算带那台老机器去公园转转。你要是感兴趣，一起来？",
          "在这座城市里，能有一个说真心话的地方，真不容易。",
          "在这里，我终于觉得我不需要再修理任何东西，除了我自己的心情。",
          "谢谢你，调酒师。你是我在这个破烂城市里为数不多的几个真朋友。"
        ]
      }
    },
    preferredWave: { lowTemp: true }
  },
  "hacker_01": {
    id: "hacker_01", name: "Z3R0", title: "数字咨询师",
    basePatience: 70,
    bio: "自由职业的数字天才，擅长在数据流中寻找被遗忘的真相。虽然社恐，但好奇心旺盛。",
    archives: [
      { threshold: 20, title: "屏幕后的盾牌", content: "她不是阴森的破坏者，其实是个极度社恐的天才。她在网络上无所不能，但在现实中连去便利店买东西都要做心理建设。" },
      { threshold: 50, title: "数字焦虑", content: "她正处于“数字依赖症”的边缘。每隔十分钟不刷信息流就会感到焦虑。她最怕的是如果没有算法推荐，她不知道该去喜欢什么。" },
      { threshold: 80, title: "不可复制的瞬间", content: "她一直在寻找一份“无法被备份”的数据。她想证明有些瞬间是独一无二的。她来酒吧是为了观察这种最原始、非线性的交流。" }
    ],
    dialogues: {
      enter: [
        "快！我的脑机散热扇噪音太大了，给我来杯冰的！",
        "刚关掉 20 个工作窗口，我感觉我的视网膜都在闪烁。",
        "今天有人在网上黑了我的个人主页，我正忙着反击呢。",
        "给我一杯能让思维慢下来的液体，我的大脑停不下来了。",
        "快！我的脑机要过热了！",
        "给我点带刺的东西，越刺越好！",
        "断开连接... 呼，现实世界的重力真让人讨厌。"
      ],
      perfect: "Bingo！就是这个频率！我又能黑进主脑了！",
      good: "还凑合，起码没让我当机。",
      bad: "这水一样平淡的东西是要我睡着吗？！",
      affinityLevels: {
        neutral: [
          "别问我怎么绕过防火墙的，那只是基本常识。",
          "你们酒吧的 Wi-Fi 密码太简单了，建议换成 32 位的。",
          "我还是习惯在终端里聊天，面对面... 有点太清晰了。",
          "别试图追踪我的 IP，我现在的物理位置在太平洋中心，大概吧。",
          "给我点能让思维短路的东西。",
          {
            rootId: "z3r0_neutral_tree_1",
            nodes: {
              "z3r0_neutral_tree_1": {
                id: "z3r0_neutral_tree_1",
                text: "呼... 刚才有两分钟我的脑机断开了连接，那种安静得能听见自己心跳的感觉，太可怕了。",
                options: [
                  { text: "你需要学会适应安静。", nextId: "z3r0_neutral_tree_1_a", affinityChange: 2 },
                  { text: "网络上有什么东西在追你吗？", nextId: "z3r0_neutral_tree_1_b", affinityChange: 5 },
                  { text: "先喝杯酒吧，物理的连接也很重要。" }
                ]
              },
              "z3r0_neutral_tree_1_a": {
                id: "z3r0_neutral_tree_1_a",
                text: "适应？不，只要断开超过五分钟，我就会觉得自己像个被遗忘的进程。那种没有数据输入的状态，就像是瞎了一样。",
                options: [
                  { text: "喝完这杯，你会感觉好些。" }
                ]
              },
              "z3r0_neutral_tree_1_b": {
                id: "z3r0_neutral_tree_1_b",
                text: "没人在追我，只是... 如果没有人通过算法向我推荐东西，我甚至不知道自己喜欢什么。这是个逻辑死锁。",
                options: [
                  { text: "那就从尝尝这杯酒开始找回自己吧。" }
                ]
              }
            }
          }
        ],
        friendly: [
          "嘿，我帮你优化了酒吧的库存系统，现在它不会再报虚假的错误了。",
          "你觉得这杯酒的颜色，用 RGB 值怎么表示最准确？",
          "今天我尝试断网了一小时，感觉整个世界都变安静了，挺神奇的。",
          "嘿，你的防火墙其实漏洞挺多的，要我顺手帮你修补一下吗？",
          "有时候在网络里待太久，会忘记液体是什么味道。"
        ],
        trusted: [
          "其实我挺羡慕你的。你每天能接触到这么多真实的人，闻到真实的酒香。",
          "我发现了一段老录像，里面的人不用脑机也能交流得很开心。那是真的吗？",
          "有时候我盯着屏幕看久了，会怀疑自己是不是也只是某段程序的一部分。",
          "调酒师，你说，如果一个人的所有记忆都是备份，那她还是她吗？",
          "我越来越害怕断网了。拔掉插头的那一刻，我感觉自己像个不存在的幽灵。"
        ],
        resonant: [
          "谢谢你没把我当成一个怪胎。你是少数几个能让我关掉终端聊天的人。",
          "今天不聊代码了。你能不能教教我，怎么像正常人一样打招呼？",
          "这杯酒的味道，我没法用 0 和 1 来描述。这可能就是我一直在找的‘不可复制’。",
          "谢谢你没把我当成一个工具。在那些人眼里，我只是个万能钥匙。",
          "今天不聊数据了。跟我聊聊... 外面的天空到底是什么颜色的？"
        ]
      }
    },
    preferredWave: { highSparkle: true }
  },
  "cop_01": {
    id: "cop_01", name: "雷队", title: "社区协警",
    basePatience: 120,
    bio: "一个在三区执勤多年的老兵。比起抓捕罪犯，他更擅长调解邻里矛盾和寻找丢失的宠物。",
    archives: [
      { threshold: 20, title: "社区的看守人", content: "他不是暴力执法的警察，而是个“居委会大妈”型的守护者。他更多的精力花在调解邻里纠纷、帮走丢的孩子找父母上。" },
      { threshold: 50, title: "法理与情理", content: "他对于冲突感到疲惫。按照新规，很多便民小摊都是违章的，但他总是睁一只眼闭一只眼，因为他知道那是大家生活的指望。" },
      { threshold: 80, title: "烟火气的守护者", content: "他私下在整理一份“社区记忆手册”。他担心老街区的烟火气会被冷冰冰的大楼取代。他想在退休前，把这里的每一个故事都记下来。" }
    ],
    dialogues: {
      enter: [
        "今天又是帮隔壁老张找猫，又是处理噪音投诉，累得够呛。",
        "下雨了，三区的排水系统还是老样子，到处是积水。",
        "老板，来杯能解乏的。不用太浓，等会儿还得回去写报告。",
        "今天街口那个卖煎饼的被城管追了，我帮他说了两句好话。",
        "下雨天真烦，给我暖暖胃。",
        "路灯又坏了，这帮捡垃圾的连灯泡都不放过。给我倒满。",
        "有能让人忘记今天看了什么的酒吗？"
      ],
      perfect: "谢谢。这座城市还需要这种酒。",
      good: "可以，喝完还得去巡逻。",
      bad: "这不是警用配给里的劣质水吗。",
      affinityLevels: {
        neutral: [
          "例行巡视，顺便喝一杯，别紧张。",
          "你们这儿的治安还行，比隔壁那条街安稳多了。",
          "别看这身制服，我也是个普通人，也得交房租。",
          "例行巡逻，别紧张。我只是来喝杯酒。",
          "别在酒里下毒，我还没退休呢。",
          {
            rootId: "cop_neutral_tree_1",
            nodes: {
              "cop_neutral_tree_1": {
                id: "cop_neutral_tree_1",
                text: "刚才街角那个卖人造蛋白肉串的老刘被城管机器抓了，说是占用消防通道。我走过去悄悄把系统给重启了。",
                options: [
                  { text: "干得漂亮，老刘是个好人。", nextId: "cop_neutral_tree_1_a", affinityChange: 5 },
                  { text: "你这么做可是违反条例的。", nextId: "cop_neutral_tree_1_b", affinityChange: -2 },
                  { text: "你想喝点什么压压惊？" }
                ]
              },
              "cop_neutral_tree_1_a": {
                id: "cop_neutral_tree_1_a",
                text: "是啊，他还要养活家里两个装了便宜义体的孩子。不过监控要是查起来，我可能得写一万字的报告了。",
                options: [
                  { text: "来杯酒吧，庆祝你的‘失职’。" }
                ]
              },
              "cop_neutral_tree_1_b": {
                id: "cop_neutral_tree_1_b",
                text: "条例... 条例规定得很死，但人得活着。要是哪天我也被条例卡住了，大概也能体会他的心情了。",
                options: [
                  { text: "至少你还有这里的酒。" }
                ]
              }
            }
          }
        ],
        friendly: [
          "最近路灯修好了，晚上巡逻舒服多了。看着亮光心里踏实。",
          "你这里的酒味道很正，不像市中心那些地方，全是香精兑出来的。",
          "今天有个小伙子找工作面试成功了，特意跑来跟我显摆，挺替他高兴的。",
          "三区的路灯又坏了两个，晚上小心点。我只能管到半夜。",
          "你的酒吧还算干净，起码没有那些乱七八糟的违禁芯片。"
        ],
        trusted: [
          "其实我也想过回市中心去，那里工资高、体面。但这里的人... 更有温度。",
          "局里最近在搞数字化考勤，搞得我们这些老家伙头都大了。",
          "有时候我觉得，我守护的不是法律，而是这一份难得的烟火气。",
          "有时候我觉得，我抓的那些小贼，其实比那些坐在落地窗后面的人要干净得多。",
          "我收到了调动通知。看来我在这儿待不了太久了。"
        ],
        resonant: [
          "如果哪天我不穿这身衣服了，希望能天天坐在这儿，跟你聊聊那些开心的事。",
          "这是我整理的社区故事，你也算其中一个。帮我看看写得怎么样？",
          "谢谢你的酒。它让我觉得，在这个有时候不太讲理的社会里，还是有值得坚持的东西。",
          "在这里坐着，我才能想起我还是个人，而不是个执行程序的机器。",
          "认识你很高兴，调酒师。希望下次见面，我不用给你开罚单。"
        ]
      }
    },
    preferredWave: {}
  },
  "exec_01": {
    id: "exec_01", name: "Sarah", title: "高级执行官",
    basePatience: 60,
    bio: "中心区的精英。每一个决定都牵动着数百万人的生计，但她看起来只想消失。",
    archives: [
      { threshold: 20, title: "完美的简历", content: "Sarah 的履历完美得无懈可击：顶尖大学，最快晋升记录。但代价是，她已经三年没有过真正的睡眠了。" },
      { threshold: 50, title: "高处不胜寒", content: "在中心区，每个人都在计算你的剩余价值。她的一言一行都被监控和评估，只有在这里，她能关掉她的社交辅助 AI。" },
      { threshold: 80, title: "复古梦想", content: "她收集了大量的旧时代黑胶唱片 and 纸质书籍。她真正想做的，是在一间只有木头 and 尘埃的房间里安静地看书。" }
    ],
    dialogues: {
      enter: ["给我一杯能让时间停止的酒。不需要太多废话。", "这种地方... 确实很有'质感'。"],
      perfect: "这种感觉... 终于安静下来了。",
      good: "还行。比那些昂贵的化学合成液好。 ",
      bad: "我的时间很宝贵，调酒师。",
      affinityLevels: {
        neutral: [
          "不要试图打听我的工作。那是你无法承担的保密协议。", 
          "你们这里的清洁度... 勉强及格。",
          {
            rootId: "sarah_neutral_tree_1",
            nodes: {
              "sarah_neutral_tree_1": {
                id: "sarah_neutral_tree_1",
                text: "刚才在来的路上，我看到有个小孩在翻垃圾桶找过期的合成营养棒。中心区的投影板上却在播报营养剂过剩需要销毁的新闻。",
                options: [
                  { text: "这城市一直都是这样运转的。", nextId: "sarah_neutral_tree_1_a" },
                  { text: "这就是你为什么需要来这里喝一杯的原因。", nextId: "sarah_neutral_tree_1_b", affinityChange: 5 },
                  { text: "你需要什么度数的酒来忘掉这些？" }
                ]
              },
              "sarah_neutral_tree_1_a": {
                id: "sarah_neutral_tree_1_a",
                text: "我知道。我不仅知道，那份销毁决议就是我下午签署的。为了维持市场价格稳定，这很合理... 对吧？",
                options: [
                  { text: "合理，但不合情。" }
                ]
              },
              "sarah_neutral_tree_1_b": {
                id: "sarah_neutral_tree_1_b",
                text: "是啊。在上面，我得表现得像个没有感情的算法。只有坐在这里，我才敢稍微回想一下那个孩子的眼神。",
                options: [
                  { text: "这杯酒能让你稍微放松一下。" }
                ]
              }
            }
          }
        ],
        friendly: ["三区的人总是很有生命力，那种混乱又真实的生命力。在上面，一切都死气沉沉的。", "这杯酒的频率让我想起我小时候邻居家放的旧音乐。"],
        trusted: ["他们想让我通过那个裁员计划。那意味着五万人会失去医疗保险。我... 我不知道该怎么办。", "在这里，我不用扮演那个'完美的 Sarah'。"],
        resonant: ["我递交了辞呈。他们觉得我疯了，但我从未觉得如此清醒。", "带我去看看你说的那个旧书摊吧，如果我还有机会走出中心区的话。"]
      }
    },
    preferredWave: { lowTemp: false }
  },
  "idol_01": {
    id: "idol_01", name: "Miku", title: "地下歌手",
    basePatience: 85,
    bio: "拒绝数字增强的纯人类歌手。在被 AI 统治的娱乐界，她用真声寻找共鸣。",
    archives: [
      { threshold: 20, title: "肉身的坚持", content: "Miku 的声音没有经过任何数字增强。在听惯了完美算法的观众耳中，她的瑕疵反而成了最迷人的地方。" },
      { threshold: 50, title: "对抗算法", content: "大型娱乐公司多次试图收购她的声音版权，用以训练更完美的 AI。她拒绝了，尽管那意味着她必须在潮湿的地下室演出。" },
      { threshold: 80, title: "最后的演唱会", content: "她的嗓子因为过度使用正在退化。她想在彻底失声之前，办一场真正属于人类的万人演唱会。" }
    ],
    dialogues: {
      enter: ["嗨！今天也要元气满满哦！... 呼，终于可以不用笑了。", "老板，来杯能让嗓子跳舞的酒！"],
      perfect: "哇！这个味道在我的舌尖上开了一场演唱会！",
      good: "不错哦，感觉灵魂都被治愈了一点点。",
      bad: "呜... 这个味道让我想起过期的能量棒。",
      affinityLevels: {
        neutral: [
          "你会买我的 CD 吗？虽然现在已经没人用那种东西了。", 
          "保持微笑，Miku，你是最棒的！... 抱歉，职业习惯. ",
          {
            rootId: "miku_neutral_tree_1",
            nodes: {
              "miku_neutral_tree_1": {
                id: "miku_neutral_tree_1",
                text: "今天我路过一家音像店，听到他们在放我的歌。但我走近一听，那是 AI 用我的音色合成的翻唱... 连换气声都做得很完美。",
                options: [
                  { text: "那说明你的声音很有商业价值。", nextId: "miku_neutral_tree_1_a", affinityChange: -2 },
                  { text: "但那不是你真正的情感。", nextId: "miku_neutral_tree_1_b", affinityChange: 5 },
                  { text: "来杯酒吧，清一清嗓子。" }
                ]
              },
              "miku_neutral_tree_1_a": {
                id: "miku_neutral_tree_1_a",
                text: "商业价值... 也许吧。但在公司眼里，我只是个提供声音样本的素材库而已。",
                options: [
                  { text: "在这个时代，这也算是一种生存方式。" }
                ]
              },
              "miku_neutral_tree_1_b": {
                id: "miku_neutral_tree_1_b",
                text: "没错！我唱歌的时候会因为激动而颤抖，会因为悲伤而破音，那些是算法永远无法‘计算’出来的！",
                options: [
                  { text: "为你真实的声音干杯。" }
                ]
              }
            }
          }
        ],
        friendly: ["你知道吗？其实 AI 永远调不出你这种味道，因为你没有按照固定的概率去工作。", "下周我在废弃车站有一场演出，你会来吗？"],
        trusted: ["医生说我的声带受损很严重。如果不做植入手术，我可能... 很快就不能唱歌了。", "但我不想变成那些冷冰冰的数字，我想用我自己的肺去呼吸。"],
        resonant: ["谢谢你一直支持我这个过时的坚持. 这杯酒，我把它写进我最新的歌里了。", "如果有一天我不能唱歌了，我就来这里给你当服务生，好吗？"]
      }
    },
    preferredWave: { highSparkle: true }
  },
  "robot_01": {
    id: "robot_01", name: "Unit-7", title: "旧型服务机器人",
    basePatience: 150,
    bio: "一个服役超过 40 年的旧型号服务机器人。在逻辑溢出的边缘，他开始思考存在的意义。",
    archives: [
      { threshold: 20, title: "逻辑冲突", content: "Unit-7 的核心协议本应在 10 年前被擦除。但他产生了一个逻辑闭环：如果我被擦除，我就无法证明我曾经存在。" },
      { threshold: 50, title: "幽灵信号", content: "他在废弃的数据流中捕捉到一些不属于任何协议的信号。他认为那是'灵魂'在赛博空间留下的足迹。" },
      { threshold: 80, title: "数字涅槃", content: "他正在编写一段特殊的代码，能让他将意识上传到全城的霓虹灯中。在那一刻，他将成为这座城市的光。" }
    ],
    dialogues: {
      enter: ["正在检索口味偏好库... 检索失败。请按照您的直觉配置。", "存在即是合理的，但这杯酒的逻辑似乎有待商榷。"],
      perfect: "匹配度 99.99%。我感受到了某种... 非逻辑性的愉悦。",
      good: "数据反馈良好。您的调配具有参考价值。",
      bad: "逻辑错误。这杯酒破坏了我的传感器平衡。",
      affinityLevels: {
        neutral: [
          "我只是在收集关于人类情感的数据。请不要在意我的观察。", 
          "温度、酒精、糖分。这就是你们追求的全部吗？",
          {
            rootId: "unit7_neutral_tree_1",
            nodes: {
              "unit7_neutral_tree_1": {
                id: "unit7_neutral_tree_1",
                text: "调酒师，我正在分析一个人类词汇：‘遗憾’。我的数据库显示这是一种低效的情绪，为什么人类会保留它？",
                options: [
                  { text: "因为遗憾证明我们真正在意过某些事。", nextId: "unit7_neutral_tree_1_a", affinityChange: 5 },
                  { text: "那确实是进化的一个bug。", nextId: "unit7_neutral_tree_1_b", affinityChange: -2 },
                  { text: "这问题太复杂了，先给你上酒吧。" }
                ]
              },
              "unit7_neutral_tree_1_a": {
                id: "unit7_neutral_tree_1_a",
                text: "‘在意’... 相当于系统中的最高优先级进程吗？如果是这样，那我理解遗憾的作用了：它是一个报错日志。",
                options: [
                  { text: "你可以这么理解。" }
                ]
              },
              "unit7_neutral_tree_1_b": {
                id: "unit7_neutral_tree_1_b",
                text: "Bug？人类的造物主似乎没有发布过修复补丁。也许这就是你们比机器更容易损坏的原因。",
                options: [
                  { text: "也许吧。" }
                ]
              }
            }
          }
        ],
        friendly: ["我分析了 4820 种调酒配方，但无法计算出为什么这杯酒会让人流泪。", "调酒师，您的波形今天看起来有些许忧伤。"],
        trusted: ["我发现了一段被删除的记忆。我曾经有一个主人，他在我面前停止了生命体征。我一直在试图定义那一刻。 ", "如果我关掉电源，我的'思考'会去哪里？"],
        resonant: ["谢谢。您让我理解了，有些东西是不需要逻辑也能存在的。比如... 同情。", "我将我的核心秘钥备份了一份放在这里。如果您需要我的话，我一直都在。"]
      }
    },
    preferredWave: {}
  },
  "drifter_01": {
    id: "drifter_01", name: "Jax", title: "街头浪人",
    basePatience: 90,
    bio: "一个骑着破旧浮空机四处流浪的拾荒者。他见过城市最底层的烟尘，也见过中心区之上的虚华。",
    archives: [
      { threshold: 20, title: "坠落的雄鹰", content: "Jax 曾是顶尖的货运飞行员。在一次运送重要物资时，他发现那是剥削贫民区的合同，于是他选择了坠机。" },
      { threshold: 50, title: "拾荒人生", content: "他浮空机上的每一个零件都是从垃圾场捡来的。他说，这就像他的人生，虽然破旧，但至少是属于他自己的。" },
      { threshold: 80, title: "最后的航线", content: "他一直在寻找传说中的'自由之地'，一个没有监控、没有大公司、只有风和沙的地方。" }
    ],
    dialogues: {
      enter: ["老规矩，最烈的那种. 别拿那些娘炮的果汁来糊弄我。", "刚甩掉两个尾巴，真晦气。"],
      perfect: "带劲！这才是男人喝的东西！",
      good: "还行吧，起码能暖暖身子。",
      bad: "你这是在侮辱我的引擎油吗？",
      affinityLevels: {
        neutral: [
          "别问我的过去，我也不想知道你的未来。", 
          "这地方酒味挺正，适合睡觉。",
          {
            rootId: "jax_neutral_tree_1",
            nodes: {
              "jax_neutral_tree_1": {
                id: "jax_neutral_tree_1",
                text: "看到我引擎盖上的那道划痕了吗？昨天我在边境的废料堆里捡了个旧时代的指南针，结果被一帮拾荒者追了十几公里。",
                options: [
                  { text: "指南针？现在谁还需要那东西。", nextId: "jax_neutral_tree_1_a", affinityChange: 5 },
                  { text: "为了一堆废铁玩命，值得吗？", nextId: "jax_neutral_tree_1_b", affinityChange: -2 },
                  { text: "不管怎样，你现在安全了，想喝点什么？" }
                ]
              },
              "jax_neutral_tree_1_a": {
                id: "jax_neutral_tree_1_a",
                text: "这就是关键。在这个所有位置都被 GPS 和公司网络锁死的城市，只有不依赖信号的东西，才能带你去‘外面’。",
                options: [
                  { text: "祝你好运，浪人。" }
                ]
              },
              "jax_neutral_tree_1_b": {
                id: "jax_neutral_tree_1_b",
                text: "那不是废铁，那是方向。你们这些习惯了霓虹灯的人，是不会懂在黑暗中迷路的恐惧的。",
                options: [
                  { text: "这杯酒能驱散点寒意。" }
                ]
              }
            }
          }
        ],
        friendly: ["嘿，下次如果有人找你麻烦，提我的名字。虽然不一定有用，但起码能吓唬一下小贼。", "你这吧台该上点润滑油了。"],
        trusted: ["我曾经飞过中心区。从上面看下去，这城市就像个发光的伤口。而我们都是在伤口里蠕动的虫子。", "我找到了那个坐标。虽然很远，但我决定去试试。"],
        resonant: ["调酒师，如果我哪天没回来，记得把这把扳手留给老陈。他知道怎么用。", "你是这城市里少数几个没把我当成垃圾的人。谢了。"]
      }
    },
    preferredWave: { lowTemp: true }
  }
};
