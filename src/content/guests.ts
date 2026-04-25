export interface GuestArchive {
  threshold: number; // Affinity level required to unlock
  title: string;     // Title of the memory fragment
  content: string;   // The unlocked background story
}

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
      neutral: string[];  // 0-20
      friendly: string[]; // 21-50
      trusted: string[];  // 51-80
      resonant: string[]; // 81+
    };
  };
  preferredWave: {
    lowTemp?: boolean;
    highSparkle?: boolean;
  };
}

export const GuestsDB: Record<string, GuestData> = {
  "mechanic_01": {
    id: "mechanic_01", name: "老陈", title: "义体维修师",
    basePatience: 100,
    bio: "在三区经营着一家无证义体诊所。他那双沾满机油的手修复过无数被企业抛弃的灵魂。",
    archives: [
      { threshold: 20, title: "三区的深夜", content: "老陈曾是军用科技的高级工程师，因为拒绝给一批故障义体签发合格证而被开除。他来到三区，是为了寻求某种赎罪。" },
      { threshold: 50, title: "机械与血肉", content: "他总是念叨：'机械是死的，但安装它们的人是活的。'老陈最怕的是有一天，他也会分不清这两者的区别。" },
      { threshold: 80, title: "老陈的秘密", content: "他诊所地下室里藏着一个旧型号的医疗机器人，那是他已经去世的妻子的核心模组。他在试图用一辈子的时间重启它。" }
    ],
    dialogues: {
      enter: ["今天手都在抖，给我来杯能镇场子的。", "关节润滑液不够了，懂我意思吧？"],
      perfect: "哈... 神经都舒展开了。这是小费。",
      good: "还行，比昨天机油味好点。",
      bad: "你在逗我？这玩意儿比冷却液还涩。",
      affinityLevels: {
        neutral: ["这种地方，最适合像我这样的人躲起来。", "少说话，多倒酒，对谁都有好处。"],
        friendly: ["你调酒的手势让我想起我以前带过的徒弟，虽然他已经去大公司赚大钱了。", "有时候觉得，这杯子里的波纹比我的扫描仪更准。"],
        trusted: ["三区的风越来越冷了。有时候我会想，如果当初我妥协了，现在会不会坐在云顶区喝最好的白兰地？", "这是我最后的一点私藏，别告诉别人。"],
        resonant: ["在这里，我终于觉得我不需要再修理任何东西，除了我自己的心情。", "谢谢你，调酒师。你是我在这个破烂城市里为数不多的几个真朋友。"]
      }
    },
    preferredWave: { lowTemp: true }
  },
  "hacker_01": {
    id: "hacker_01", name: "Z3R0", title: "神经黑客",
    basePatience: 70,
    bio: "自由职业的影子，专门游走于防火墙边缘的幽灵。没人见过她的真面目。",
    archives: [
      { threshold: 25, title: "虚拟逃避", content: "Z3R0 在 12 岁时就黑进了第一座城市的电网。对她来说，代码比呼吸更自然。" },
      { threshold: 55, title: "幽灵记忆", content: "她其实是在一个实验舱里长大的。她的整个童年都是由数据构建的伪造记忆，直到她黑掉了实验记录。" },
      { threshold: 85, title: "断连恐惧", content: "Z3R0 总是戴着耳机，因为她害怕失去网络连接带来的'寂静'。那种寂静意味着她必须面对现实中孤独的自己。" }
    ],
    dialogues: {
      enter: ["快！我的脑机要过热了！", "给我点带刺的东西，越刺越好！"],
      perfect: "Bingo！就是这个频率！我又能黑进主脑了！",
      good: "还凑合，起码没让我当机。",
      bad: "这水一样平淡的东西是要我睡着吗？！",
      affinityLevels: {
        neutral: ["别试图追踪我的 IP，我现在的物理位置在太平洋中心，大概吧。", "给我点能让思维短路的东西。"],
        friendly: ["嘿，你的防火墙其实漏洞挺多的，要我顺手帮你修补一下吗？", "有时候在网络里待太久，会忘记液体是什么味道。"],
        trusted: ["我黑进了那个实验室。我发现我的名字不叫 Z3R0，而是一个 16 位的序列号。", "调酒师，你说，如果一个人的所有记忆都是备份，那她还是她吗？"],
        resonant: ["谢谢你没把我当成一个工具。在那些人眼里，我只是个万能钥匙。", "今天不聊数据了。跟我聊聊... 外面的天空到底是什么颜色的？"]
      }
    },
    preferredWave: { highSparkle: true }
  },
  "cop_01": {
    id: "cop_01", name: "雷队", title: "巡逻警员",
    basePatience: 120,
    bio: "一个在灰暗执法边缘徘徊的老兵。他的徽章早已生锈，但眼神依然锐利。",
    archives: [
      { threshold: 20, title: "徽章的重量", content: "雷队曾在特种部队服役，参与过那场惨烈的企业边界冲突。他活了下来，但他的战友没有。" },
      { threshold: 50, title: "灰色地带", content: "他知道谁在三区贩卖禁药，也知道谁在下水道偷渡。但他选择视而不见，只要他们不越过底线。" },
      { threshold: 80, title: "孤胆追凶", content: "他一直私下调查一宗涉及企业高层的连环失踪案。这枚徽章不是保护他的盾牌，而是他最后的锁链。" }
    ],
    dialogues: {
      enter: ["刚处理完三区的暴乱。来杯硬的。", "下雨天真烦，给我暖暖胃。"],
      perfect: "谢谢。这座城市还需要这种酒。",
      good: "可以，喝完还得去巡逻。",
      bad: "这不是警用配给里的劣质水吗。",
      affinityLevels: {
        neutral: ["例行巡逻，别紧张。我只是来喝杯酒。", "别在酒里下毒，我还没退休呢。"],
        friendly: ["三区的路灯又坏了两个，晚上小心点。", "你的酒吧还算干净，起码没有那些乱七八糟的违禁芯片。"],
        trusted: ["有时候我觉得，我抓的那些小贼，其实比那些坐在落地窗后面的人要干净得多。", "我收到了威胁信。看来我查得太深了。"],
        resonant: ["如果哪天我不来了，记得帮我把这枚徽章扔进海里。别让它沾染这城市的尘埃。", "在这里坐着，我才能想起我还是个警察，而不是个企业的看门狗。"]
      }
    },
    preferredWave: {}
  },
  "exec_01": {
    id: "exec_01", name: "Sarah", title: "高级执行官",
    basePatience: 60,
    bio: "云顶区的精英。每一个决定都牵动着数百万人的生计，但她看起来只想消失。",
    archives: [
      { threshold: 25, title: "完美的简历", content: "Sarah 的履历完美得无懈可击：顶尖大学，最快晋升记录。但代价是，她已经三年没有过真正的睡眠了。" },
      { threshold: 55, title: "高处不胜寒", content: "在云顶区，每个人都在计算你的剩余价值。她的一言一行都被监控和评估，只有在这里，她能关掉她的社交辅助 AI。" },
      { threshold: 85, title: "复古梦想", content: "她收集了大量的旧时代黑胶唱片和纸质书籍。她真正想做的，是在一间只有木头和尘埃的房间里安静地看书。" }
    ],
    dialogues: {
      enter: ["给我一杯能让时间停止的酒。不需要太多废话。", "这种地方... 确实很有'质感'。"],
      perfect: "这种感觉... 终于安静下来了。",
      good: "还行。比那些昂贵的化学合成液好。 ",
      bad: "我的时间很宝贵，调酒师。",
      affinityLevels: {
        neutral: ["不要试图打听我的工作。那是你无法承担的保密协议。", "你们这里的清洁度... 勉强及格。"],
        friendly: ["三区的人总是很有生命力，那种混乱又真实的生命力。在上面，一切都死气沉沉的。", "这杯酒的频率让我想起我小时候邻居家放的旧音乐。"],
        trusted: ["他们想让我通过那个裁员计划。那意味着五万人会失去医疗保险。我... 我不知道该怎么办。", "在这里，我不用扮演那个'完美的 Sarah'。"],
        resonant: ["我递交了辞呈。他们觉得我疯了，但我从未觉得如此清醒。", "带我去看看你说的那个旧书摊吧，如果我还有机会走出云顶区的话。"]
      }
    },
    preferredWave: { lowTemp: false }
  },
  "idol_01": {
    id: "idol_01", name: "Miku", title: "地下偶像",
    basePatience: 85,
    bio: "拒绝义体改造的纯人类歌手。在被 AI 统治的娱乐界，她用真声对抗算法。",
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
        neutral: ["你会买我的 CD 吗？虽然现在已经没人用那种东西了。", "保持微笑，Miku，你是最棒的！... 抱歉，职业习惯。"],
        friendly: ["你知道吗？其实 AI 永远调不出你这种味道，因为你没有按照固定的概率去工作。", "下周我在废弃车站有一场演出，你会来吗？"],
        trusted: ["医生说我的声带受损很严重。如果不做植入手术，我可能... 很快就不能唱歌了。", "但我不想变成那些冷冰冰的数字，我想用我自己的肺去呼吸。"],
        resonant: ["谢谢你一直支持我这个过时的坚持。这杯酒，我把它写进我最新的歌里了。", "如果有一天我不能唱歌了，我就来这里给你当服务生，好吗？"]
      }
    },
    preferredWave: { highSparkle: true }
  },
  "robot_01": {
    id: "robot_01", name: "Unit-7", title: "AI 哲学家",
    basePatience: 150,
    bio: "一个服役超过 40 年的旧型号服务机器人。在逻辑溢出的边缘，他开始思考存在的意义。",
    archives: [
      { threshold: 25, title: "逻辑冲突", content: "Unit-7 的核心协议本应在 10 年前被擦除。但他产生了一个逻辑闭环：如果我被擦除，我就无法证明我曾经存在。" },
      { threshold: 55, title: "幽灵信号", content: "他在废弃的数据流中捕捉到一些不属于任何协议的信号。他认为那是'灵魂'在赛博空间留下的足迹。" },
      { threshold: 85, title: "数字涅槃", content: "他正在编写一段特殊的代码，能让他将意识上传到全城的霓虹灯中。在那一刻，他将成为这座城市的光。" }
    ],
    dialogues: {
      enter: ["正在检索口味偏好库... 检索失败。请按照您的直觉配置。", "存在即是合理的，但这杯酒的逻辑似乎有待商榷。"],
      perfect: "匹配度 99.99%。我感受到了某种... 非逻辑性的愉悦。",
      good: "数据反馈良好。您的调配具有参考价值。",
      bad: "逻辑错误。这杯酒破坏了我的传感器平衡。",
      affinityLevels: {
        neutral: ["我只是在收集关于人类情感的数据。请不要在意我的观察。", "温度、酒精、糖分。这就是你们追求的全部吗？"],
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
    bio: "一个骑着破旧浮空机四处流浪的拾荒者。他见过城市最底层的污垢，也见过云端之上的虚伪。",
    archives: [
      { threshold: 20, title: "坠落的雄鹰", content: "Jax 曾是顶尖的企业飞行员。在一次运送重要物资时，他发现那是被剥夺器官的活体，于是他选择了坠机。" },
      { threshold: 50, title: "拾荒人生", content: "他浮空机上的每一个零件都是从垃圾场捡来的。他说，这就像他的人生，虽然破旧，但至少是属于他自己的。" },
      { threshold: 80, title: "最后的航线", content: "他一直在寻找传说中的'自由之城'，一个没有监控、没有企业、只有风和沙的地方。" }
    ],
    dialogues: {
      enter: ["老规矩，最烈的那种。别拿那些娘炮的果汁来糊弄我。", "刚甩掉两个尾巴，真晦气。"],
      perfect: "带劲！这才是男人喝的东西！",
      good: "还行吧，起码能暖暖身子。",
      bad: "你这是在侮辱我的引擎油吗？",
      affinityLevels: {
        neutral: ["别问我的过去，我也不想知道你的未来。", "这地方酒味挺正，适合睡觉。"],
        friendly: ["嘿，下次如果有人找你麻烦，提我的名字。虽然不一定有用，但起码能吓唬一下小贼。", "你这吧台该上点润滑油了。"],
        trusted: ["我曾经飞过云顶区。从上面看下去，这城市就像个发光的伤口。而我们都是在伤口里蠕动的虫子。", "我找到了那个坐标。虽然很远，但我决定去试试。"],
        resonant: ["调酒师，如果我哪天没回来，记得把这把扳手留给老陈。他知道怎么用。", "你是这城市里少数几个没把我当成垃圾的人。谢了。"]
      }
    },
    preferredWave: { lowTemp: true }
  }
};
