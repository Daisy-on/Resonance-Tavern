import type { IngredientData } from "./spirits";

export const AdditivesDB: Record<string, IngredientData> = {
  "simple_syrup": {
    id: "simple_syrup", name: "糖浆", type: "sweetener",
    unitCost: 2, powerCost: 0,
    amplitude: +2, periodLevel: -1, volume: 10,
    description: "减小周期（增大频率）。副作用：极微弱的振幅增加。"
  },
  "ice_cube": {
    id: "ice_cube", name: "标准冰块", type: "ice",
    unitCost: 1, powerCost: 1,
    amplitude: -5, periodLevel: 0, decay: 0, volume: 15,
    description: "减小振幅（压低波形）。副作用：极微弱的衰减变化。"
  },
  "lemon_juice": {
    id: "lemon_juice", name: "柠檬", type: "sweetener",
    unitCost: 3, powerCost: 0,
    amplitude: 0, periodLevel: 0, edgeSharpness: +20, volume: 15,
    description: "增加不对称偏斜（边缘感）。改变波形形状。"
  },
  "soda_water": {
    id: "soda_water", name: "苏打水", type: "mixer",
    unitCost: 3, powerCost: 0,
    amplitude: 0, periodLevel: 0, noiseLevel: +25, volume: 0,
    description: "引入高频毛刺与锯齿（噪声）。改变波形形状。"
  },
  "tonic_essence": {
    id: "tonic_essence", name: "捣拌棒", type: "mixer",
    unitCost: 3, powerCost: 0,
    amplitude: 0, periodLevel: +1, volume: 0,
    description: "增大周期（减小频率），拉长波形。无副作用。"
  },
  "bitters": {
    id: "bitters", name: "苦精", type: "mixer",
    unitCost: 4, powerCost: 0,
    amplitude: 0, periodLevel: 0, volume: 5,
    description: "不改变形状，仅放宽相位容错判定（拯救手残）。"
  }
};
