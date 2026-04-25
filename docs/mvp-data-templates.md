# 赛博调频酒吧 MVP 数据模板

本文档定义 MVP 阶段需要的核心静态数据结构。重点原则如下：

- 不做商店系统
- 不做提前购买与库存背包
- 材料成本按实际使用量即时结算
- 酒类、工具、设备按天数或剧情逐步解锁
- 所有结构都要便于直接转成 `.ts` 常量

## 1. 酒水与配料配置

> MVP 建议先覆盖 3 类基酒、4 类辅料、2 类工具占位，保证调酒链路可闭环。

```typescript
export interface IngredientData {
  id: string;
  name: string;
  type: "spirit" | "sweetener" | "mixer" | "ice" | "tool";
  strength: number;
  sweetness: number;
  acidity?: number;
  temperature: number;
  sparkle?: number;
  volume: number;
  baseWaveShape?: "sine" | "triangle" | "square";
  unitCost: number;
  powerCost: number;
  unlockDay?: number;
  description: string;
}

export const SpiritsDB: Record<string, IngredientData> = {
  vodka: {
    id: "vodka",
    name: "伏特加",
    type: "spirit",
    strength: 80,
    sweetness: 0,
    temperature: 20,
    volume: 30,
    baseWaveShape: "sine",
    unitCost: 12,
    powerCost: 1,
    unlockDay: 1,
    description: "冷硬直接，适合作为高振幅基础波形。"
  },
  gin: {
    id: "gin",
    name: "琴酒",
    type: "spirit",
    strength: 65,
    sweetness: 10,
    temperature: 20,
    volume: 30,
    baseWaveShape: "triangle",
    unitCost: 11,
    powerCost: 1,
    unlockDay: 1,
    description: "草本锐利，适合中频复杂波形。"
  },
  whisky: {
    id: "whisky",
    name: "威士忌",
    type: "spirit",
    strength: 70,
    sweetness: 5,
    temperature: 20,
    volume: 30,
    baseWaveShape: "square",
    unitCost: 13,
    powerCost: 1,
    unlockDay: 1,
    description: "厚重沉稳，适合低频、强存在感订单。"
  },
  rum: {
    id: "rum",
    name: "朗姆酒",
    type: "spirit",
    strength: 72,
    sweetness: 15,
    temperature: 20,
    volume: 30,
    baseWaveShape: "sine",
    unitCost: 14,
    powerCost: 1,
    unlockDay: 4,
    description: "更柔和、更温暖，适合后期解锁的甜向订单。"
  }
};

export const AdditivesDB: Record<string, IngredientData> = {
  simple_syrup: {
    id: "simple_syrup",
    name: "糖浆",
    type: "sweetener",
    strength: 0,
    sweetness: 25,
    temperature: 0,
    volume: 10,
    unitCost: 4,
    powerCost: 0,
    unlockDay: 1,
    description: "提升甜度并改变波形密度。"
  },
  lemon_juice: {
    id: "lemon_juice",
    name: "柠檬汁",
    type: "sweetener",
    strength: 0,
    sweetness: 5,
    acidity: 30,
    temperature: 0,
    volume: 15,
    unitCost: 5,
    powerCost: 0,
    unlockDay: 1,
    description: "制造偏移和酸度对称性变化。"
  },
  soda_water: {
    id: "soda_water",
    name: "苏打水",
    type: "mixer",
    strength: -5,
    sweetness: 0,
    temperature: 0,
    sparkle: 40,
    volume: 30,
    unitCost: 3,
    powerCost: 0,
    unlockDay: 1,
    description: "增加气泡和高频噪声。"
  },
  ice_cube: {
    id: "ice_cube",
    name: "冰块",
    type: "ice",
    strength: -2,
    sweetness: 0,
    temperature: -20,
    volume: 15,
    unitCost: 2,
    powerCost: 0,
    unlockDay: 1,
    description: "降低温度并改变衰减速度。"
  },
  bitters: {
    id: "bitters",
    name: "苦精",
    type: "sweetener",
    strength: 0,
    sweetness: -5,
    acidity: 10,
    temperature: 0,
    volume: 2,
    unitCost: 6,
    powerCost: 0,
    unlockDay: 7,
    description: "后期解锁，用于制造更复杂的苦甜层次。"
  }
};
```

## 2. 客人与对话配置

> MVP 先做 3 位常驻客人，每位都要有不同的情绪关键词、基础耐心和好感成长。

```typescript
export interface GuestData {
  id: string;
  name: string;
  title: string;
  basePatience: number;
  affinityTags: string[];
  dialogues: {
    enter: string[];
    perfect: string;
    good: string;
    bad: string;
    affinityUp?: string[];
  };
  preferredWave: {
    lowTemp?: boolean;
    highSparkle?: boolean;
    highAroma?: boolean;
  };
}

export const GuestsDB: Record<string, GuestData> = {
  mechanic_01: {
    id: "mechanic_01",
    name: "老陈",
    title: "义体维修工",
    basePatience: 100,
    affinityTags: ["lowTemp", "steady"],
    dialogues: {
      enter: [
        "今天手都在抖，给我来杯能镇场子的。",
        "关节润滑液不够了，你懂我意思吧。"
      ],
      perfect: "嗯，这杯很稳。像一台终于校准好的机器。",
      good: "还行，至少比昨天的机油顺口。",
      bad: "你是在逗我吗？这玩意比拆螺丝还难咽。",
      affinityUp: ["你倒是比上次更懂人话了。"]
    },
    preferredWave: { lowTemp: true }
  },
  hacker_01: {
    id: "hacker_01",
    name: "Z3R0",
    title: "街头黑客",
    basePatience: 70,
    affinityTags: ["highSparkle", "sharp"],
    dialogues: {
      enter: [
        "快点，我的脑机要过热了。",
        "给我来点有棱角的东西，越刺越好。"
      ],
      perfect: "对，就是这个频率。我要的就是这种锐利感。",
      good: "合格，至少不像自来水。",
      bad: "这也能叫酒？我还不如直接喝电池液。"
    },
    preferredWave: { highSparkle: true }
  },
  cop_01: {
    id: "cop_01",
    name: "雷队",
    title: "巡逻警员",
    basePatience: 120,
    affinityTags: ["lowTemp", "calm"],
    dialogues: {
      enter: [
        "刚处理完一桩暴动，来杯稳一点的。",
        "下雨天最烦，给我一点能安神的。"
      ],
      perfect: "谢谢，这座城还需要这种东西。",
      good: "可以，起码喝完还能继续巡逻。",
      bad: "这不是酒，这是惩罚。"
    },
    preferredWave: { lowTemp: true }
  }
};
```

## 3. 订单模板

> 放弃完全随机波形，改用“模板 + 小幅浮动”，这样更适合教学和难度曲线。

```typescript
export interface OrderTemplate {
  id: string;
  moodText: string;
  targetParams: {
    amplitude: number;
    frequency: number;
    decay: number;
    noise: number;
    baseShape: "sine" | "triangle" | "square";
  };
  difficulty: number;
  allowVariance: number;
  rewardBase: number;
  materialCostBias?: number;
}

export const OrdersDB: OrderTemplate[] = [
  {
    id: "order_calm",
    moodText: "我需要冷静一点，频率低一些。",
    targetParams: {
      amplitude: 0.6,
      frequency: 1.0,
      decay: 0.8,
      noise: 0.0,
      baseShape: "sine"
    },
    difficulty: 1,
    allowVariance: 0.05,
    rewardBase: 20,
    materialCostBias: 1.0
  },
  {
    id: "order_spike",
    moodText: "今天太烦了，给我一点尖锐的刺激。",
    targetParams: {
      amplitude: 0.9,
      frequency: 2.0,
      decay: 0.3,
      noise: 0.5,
      baseShape: "square"
    },
    difficulty: 2,
    allowVariance: 0.1,
    rewardBase: 25,
    materialCostBias: 1.1
  },
  {
    id: "order_complex",
    moodText: "想要甜，但不要腻，像霓虹下的回声。",
    targetParams: {
      amplitude: 0.5,
      frequency: 1.8,
      decay: 0.5,
      noise: 0.1,
      baseShape: "triangle"
    },
    difficulty: 2,
    allowVariance: 0.05,
    rewardBase: 25,
    materialCostBias: 1.15
  }
];
```

## 4. 随机事件

> 每日开场抽 1 个事件。事件应该改变当天的材料成本、操作手感、收益倍率或客人偏好。

```typescript
export interface EventData {
  id: string;
  name: string;
  description: string;
  effect: {
    type: "cost_multiplier" | "temp_modifier" | "reward_multiplier" | "input_drift";
    target: string;
    value: number;
  };
}

export const EventsDB: Record<string, EventData> = {
  rainy_day: {
    id: "rainy_day",
    name: "霓虹酸雨",
    description: "外面在下酸雨。客人更容易接受低温、低频波形。",
    effect: { type: "temp_modifier", target: "ice_cube", value: 1.5 }
  },
  ice_shortage: {
    id: "ice_shortage",
    name: "冰块短缺",
    description: "冷链出故障，冰块更贵，也更稀缺。",
    effect: { type: "cost_multiplier", target: "ice_cube", value: 3.0 }
  },
  streamer_visit: {
    id: "streamer_visit",
    name: "网红直播",
    description: "今天的客人会被镜头放大，完美匹配收益更高，失误惩罚也更重。",
    effect: { type: "reward_multiplier", target: "tip", value: 2.0 }
  }
};
```

## 5. 材料成本与解锁节奏

> 这一节替代原来的“商店升级”概念。所有资源都按使用和日程自然展开，不走提前购买。

```typescript
export type UnlockKind = "spirit" | "ingredient" | "tool" | "device" | "dialogue";

export interface UnlockData {
  id: string;
  kind: UnlockKind;
  name: string;
  unlockDay: number;
  unlockByStory?: string;
  description: string;
}

export const UnlockScheduleDB: UnlockData[] = [
  {
    id: "unlock_rum",
    kind: "spirit",
    name: "朗姆酒",
    unlockDay: 4,
    description: "解锁更柔和的甜向基酒。"
  },
  {
    id: "unlock_bitters",
    kind: "ingredient",
    name: "苦精",
    unlockDay: 7,
    description: "用于构建更复杂的苦甜层次。"
  },
  {
    id: "unlock_shake_tool",
    kind: "tool",
    name: "摇酒壶升级",
    unlockDay: 7,
    description: "允许更稳定的摇荡操作。"
  },
  {
    id: "unlock_muddle_tool",
    kind: "tool",
    name: "捣棒",
    unlockDay: 10,
    description: "允许进行捣碎和香气释放操作。"
  },
  {
    id: "unlock_flame_tool",
    kind: "tool",
    name: "喷枪",
    unlockDay: 10,
    description: "允许点燃、喷灼和烟熏特效。"
  },
  {
    id: "unlock_precision_tool",
    kind: "tool",
    name: "精确量酒器",
    unlockDay: 10,
    description: "提升高难订单的精度上限。"
  }
];

export interface CostRule {
  id: string;
  appliesTo: "spirit" | "ingredient" | "tool_action" | "daily_settlement";
  baseCost: number;
  powerCost: number;
  note: string;
}

export const CostRulesDB: CostRule[] = [
  {
    id: "spirit_usage",
    appliesTo: "spirit",
    baseCost: 12,
    powerCost: 1,
    note: "基酒按毫升与种类即时结算。"
  },
  {
    id: "ingredient_usage",
    appliesTo: "ingredient",
    baseCost: 3,
    powerCost: 0,
    note: "辅料按实际用量扣费。"
  },
  {
    id: "tool_action_cost",
    appliesTo: "tool_action",
    baseCost: 0,
    powerCost: 1,
    note: "工具主要消耗电力，不做购买。"
  },
  {
    id: "daily_rent",
    appliesTo: "daily_settlement",
    baseCost: 30,
    powerCost: 0,
    note: "每日房租固定扣除。"
  }
];
```

## 6. 本地存档模板

> 存档要小、稳、可版本升级。每单结束或日结时都可以自动写入。

```typescript
export interface SaveData {
  version: number;
  day: number;
  money: number;
  power: number;
  rating: number;
  activeEventId: string | null;
  unlockFlags: string[];
  affinity: Record<string, number>;
  inventory: Record<string, number>;
  lastOrderResult?: {
    score: number;
    reward: number;
    cost: number;
  };
}
```

## 7. 备注

- 这个模板的目标不是“做完所有内容”，而是让 MVP 能稳定闭环。
- 如果后续新增剧情节点，只需要往 `UnlockScheduleDB` 和 `GuestsDB` 里补数据。
- 如果后续新增材料，只需要补 `IngredientData` 的字段和成本值，不需要设计商店页。
