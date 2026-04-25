import type { IngredientData } from "./spirits";

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
