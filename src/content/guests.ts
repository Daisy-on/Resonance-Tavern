export interface GuestData {
  id: string;
  name: string;
  title: string;
  basePatience: number;
  dialogues: {
    enter: string[];
    perfect: string;
    good: string;
    bad: string;
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
    dialogues: {
      enter: ["今天手都在抖，给我来杯能镇场子的。", "关节润滑液不够了，懂我意思吧？"],
      perfect: "哈... 神经都舒展开了。这是小费。",
      good: "还行，比昨天机油味好点。",
      bad: "你在逗我？这玩意儿比冷却液还涩。"
    },
    preferredWave: { lowTemp: true }
  },
  "hacker_01": {
    id: "hacker_01", name: "Z3R0", title: "神经黑客",
    basePatience: 70,
    dialogues: {
      enter: ["快！我的脑机要过热了！", "给我点带刺的东西，越刺越好！"],
      perfect: "Bingo！就是这个频率！我又能黑进主脑了！",
      good: "还凑合，起码没让我当机。",
      bad: "这水一样平淡的东西是要我睡着吗？！"
    },
    preferredWave: { highSparkle: true }
  },
  "cop_01": {
    id: "cop_01", name: "雷队", title: "巡逻警员",
    basePatience: 120,
    dialogues: {
      enter: ["刚处理完三区的暴乱。来杯硬的。", "下雨天真烦，给我暖暖胃。"],
      perfect: "谢谢。这座城市还需要这种酒。",
      good: "可以，喝完还得去巡逻。",
      bad: "这不是警用配给里的劣质水吗。"
    },
    preferredWave: {}
  }
};
