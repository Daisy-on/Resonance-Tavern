# 共振酒吧 MVP 数据表与类型模板

本文件定义了共振酒吧 MVP 开发阶段所需的核心静态数据结构及首轮测试数据。可以直接将其作为 `.ts` 文件的初始代码。

## 1. 酒水与配料配置 (Ingredients & Spirits)

> MVP 包含 3 种基酒、2 种糖浆/果汁、1 种苏打水、1 种冰块。所有属性基于 `0-100` 或 `增量`。

```typescript
export interface IngredientData {
  id: string;
  name: string;
  type: "spirit" | "sweetener" | "mixer" | "ice";
  // 核心数值修正
  strength: number;    // 烈度 (振幅基数)
  sweetness: number;   // 甜度 (频率基数)
  acidity?: number;    // 酸度 (偏斜度)
  temperature: number; // 温度 (衰减基数)
  sparkle?: number;    // 气泡感 (毛刺/噪声)
  volume: number;      // 占用容量 (ml/单位)
  // 波形基础类型 (仅基酒生效)
  baseWaveShape?: "sine" | "triangle" | "square";
  description: string;
}

export const SpiritsDB: Record<string, IngredientData> = {
  "vodka": {
    id: "vodka", name: "伏特加", type: "spirit",
    strength: 80, sweetness: 0, temperature: 20, volume: 30,
    baseWaveShape: "sine",
    description: "冷硬如钢，正弦波。提供最高的振幅基数。"
  },
  "gin": {
    id: "gin", name: "琴酒", type: "spirit",
    strength: 65, sweetness: 10, temperature: 20, volume: 30,
    baseWaveShape: "triangle",
    description: "草本锐利，三角波。自带微量甜度波动。"
  },
  "whisky": {
    id: "whisky", name: "威士忌", type: "spirit",
    strength: 70, sweetness: 5, temperature: 20, volume: 30,
    baseWaveShape: "square",
    description: "厚重沉稳，方波。低频存在感强。"
  }
};

export const AdditivesDB: Record<string, IngredientData> = {
  "simple_syrup": {
    id: "simple_syrup", name: "原味糖浆", type: "sweetener",
    strength: 0, sweetness: +25, temperature: 0, volume: 10,
    description: "大幅提升波形频率。"
  },
  "lemon_juice": {
    id: "lemon_juice", name: "柠檬汁", type: "sweetener",
    strength: 0, sweetness: +5, acidity: +30, temperature: 0, volume: 15,
    description: "让波形发生向左偏斜。"
  },
  "soda_water": {
    id: "soda_water", name: "苏打水", type: "mixer",
    strength: -5, sweetness: 0, temperature: 0, sparkle: +40, volume: 30,
    description: "降低烈度，增加大量波形毛刺（高频噪声）。"
  },
  "ice_cube": {
    id: "ice_cube", name: "标准冰块", type: "ice",
    strength: -2, sweetness: 0, temperature: -20, volume: 15,
    description: "每次加入极大加速波形的衰减速度（降温）。"
  }
};
```

## 2. 客人配置 (Guests & Dialogues)

> MVP 只做 3 位常客，附带极简好感度和文字。

```typescript
export interface GuestData {
  id: string;
  name: string;
  title: string;          // 职业或身份
  basePatience: number;   // 基础耐心值 (影响超时惩罚倍率)
  dialogues: {
    enter: string[];      // 入座随机台词
    perfect: string;      // 完美共振台词
    good: string;         // 满意台词
    bad: string;          // 失败/拒付台词
  };
  preferredWave: {        // 客人隐含偏好 (可选，增加匹配分数奖励)
    lowTemp?: boolean;    // 是否偏爱冰饮
    highSparkle?: boolean;// 是否偏爱气泡
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
    }
  }
};
```

## 3. 订单模板 (Order Templates)

> 放弃完全随机波形，改用模板 + 微小随机扰动，保证难度可控。

```typescript
export interface OrderTemplate {
  id: string;
  moodText: string;            // 描述文本 (玩家可见)
  targetParams: {
    amplitude: number;         // 烈度决定
    frequency: number;         // 甜度决定
    decay: number;             // 温度决定
    noise: number;             // 气泡决定
    baseShape: "sine" | "triangle" | "square";
  };
  difficulty: number;          // 影响基础收益 (1-3)
  allowVariance: number;       // 生成时的随机波动幅度比例 (如 0.1 表示 10% 浮动)
  rewardBase: number;          // 基础金钱奖励
}

export const OrdersDB: OrderTemplate[] = [
  {
    id: "order_calm",
    moodText: "我需要冷静一下，频率越低越好，要冰的。",
    targetParams: { amplitude: 0.6, frequency: 1.0, decay: 0.8, noise: 0.0, baseShape: "sine" },
    difficulty: 1, allowVariance: 0.05, rewardBase: 20
  },
  {
    id: "order_spike",
    moodText: "今天太困了，给我最强烈的刺激，加点气泡最好！",
    targetParams: { amplitude: 0.9, frequency: 2.0, decay: 0.3, noise: 0.5, baseShape: "square" },
    difficulty: 2, allowVariance: 0.1, rewardBase: 25
  },
  {
    id: "order_complex",
    moodText: "想要点甜的，但不要太腻，要锐利一点的味道。",
    targetParams: { amplitude: 0.5, frequency: 1.8, decay: 0.5, noise: 0.1, baseShape: "triangle" },
    difficulty: 2, allowVariance: 0.05, rewardBase: 25
  }
];
```

## 4. 随机事件 (Events)

> 每日开场抽取。影响数值计算公式。

```typescript
export interface EventData {
  id: string;
  name: string;
  description: string;
  effect: {
    type: "cost_multiplier" | "temp_modifier" | "reward_multiplier";
    target: string;
    value: number;
  };
}

export const EventsDB: Record<string, EventData> = {
  "rainy_day": {
    id: "rainy_day", name: "霓虹酸雨", description: "外面下着酸雨。客人更容易接受低温波形。",
    effect: { type: "temp_modifier", target: "ice_cube", value: 1.5 } // 冰块降温效果变为 1.5 倍
  },
  "ice_shortage": {
    id: "ice_shortage", name: "冷链断裂", description: "制冰机电费上涨，冰块成本增加。",
    effect: { type: "cost_multiplier", target: "ice_cube", value: 3.0 } // 冰块每次操作多扣钱
  },
  "streamer_visit": {
    id: "streamer_visit", name: "网红探店", description: "今天的小费可能会翻倍，但搞砸了差评也翻倍。",
    effect: { type: "reward_multiplier", target: "tip", value: 2.0 }
  }
};
```

## 5. 商店升级项 (Shop Upgrades)

> 每天结算后只能购买一项。用于产生持久成长感。

```typescript
export interface UpgradeData {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
}

export const UpgradesDB: Record<string, UpgradeData> = {
  "cup_volume": {
    id: "cup_volume", name: "大号赛博酒杯", description: "总容量提升 20ml，大幅降低溢杯概率。",
    cost: 150, maxLevel: 3
  },
  "battery_pack": {
    id: "battery_pack", name: "备用核电池", description: "每日初始补电增加 5 点，增加操作容错。",
    cost: 100, maxLevel: 5
  },
  "rent_negotiation": {
    id: "rent_negotiation", name: "街区保护费", description: "每日固定房租降低 5 元。",
    cost: 200, maxLevel: 3
  },
  "precision_jigger": {
    id: "precision_jigger", name: "精准量酒器", description: "倒酒的基础评分奖励增加，误差惩罚降低。",
    cost: 120, maxLevel: 1
  }
};
```
