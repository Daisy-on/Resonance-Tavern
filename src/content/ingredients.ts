import type { IngredientData } from "./spirits";

export const AdditivesDB: Record<string, IngredientData> = {
  "simple_syrup": {
    id: "simple_syrup", name: "原味糖浆", type: "sweetener",
    unitCost: 2, powerCost: 0,
    strength: 0, sweetness: +25, temperature: 0, volume: 10,
    description: "大幅提升波形频率。"
  },
  "lemon_juice": {
    id: "lemon_juice", name: "柠檬汁", type: "sweetener",
    unitCost: 3, powerCost: 0,
    strength: 0, sweetness: +5, acidity: +30, temperature: 0, volume: 15,
    description: "让波形发生向左偏斜。"
  },
  "soda_water": {
    id: "soda_water", name: "苏打水", type: "mixer",
    unitCost: 3, powerCost: 0,
    strength: 0, sweetness: 0, acidity: 0, temperature: 0, sparkle: +40, volume: 0,
    description: "只增加波形毛刺（高频噪声）。"
  },
  "tonic_essence": {
    id: "tonic_essence", name: "捣拌棒", type: "mixer",
    unitCost: 3, powerCost: 0,
    strength: 0, sweetness: -14, acidity: 0, temperature: 0, sparkle: 0, volume: 0,
    description: "降低频率并拉长周期，用于修正周期过短。"
  },
  "bitters": {
    id: "bitters", name: "苦精", type: "mixer",
    unitCost: 4, powerCost: 0,
    strength: 2, sweetness: -3, acidity: +12, temperature: 0, sparkle: -8, volume: 5,
    description: "用于微调频率与相位容差，适配后期精细订单。"
  },
  "ice_cube": {
    id: "ice_cube", name: "标准冰块", type: "ice",
    unitCost: 1, powerCost: 1,
    strength: -2, sweetness: 0, temperature: -20, volume: 15,
    description: "每次加入极大加速波形的衰减速度（降温）。"
  }
};
