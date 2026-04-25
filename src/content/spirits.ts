export interface IngredientData {
  id: string;
  name: string;
  type: "spirit" | "sweetener" | "mixer" | "ice";
  unitCost: number;
  powerCost: number;

  // 核心波形直接控制参数
  amplitude: number;       // 对应高度增量 (0-100)
  periodLevel: number;     // 周期档位增量
  phaseStep?: number;      // 相位偏移档位增量
  edgeSharpness?: number;  // 不对称偏斜/边缘感增量
  noiseLevel?: number;     // 高频毛刺/锯齿增量
  harmonics?: number;      // 谐波复杂度增量
  decay?: number;          // 拖尾衰减饱满度增量

  volume: number;
  baseWaveShape?: "sine" | "triangle" | "square" | "sawtooth";
  description: string;
}

export const SpiritsDB: Record<string, IngredientData> = {
  "vodka": {
    id: "vodka", name: "伏特加", type: "spirit",
    unitCost: 9, powerCost: 0,
    amplitude: +80, periodLevel: +8, decay: +50, volume: 30,
    baseWaveShape: "sine",
    description: "冷硬如钢，正弦波。提供最高的初始振幅与中等周期。"
  },
  "gin": {
    id: "gin", name: "琴酒", type: "spirit",
    unitCost: 8, powerCost: 0,
    amplitude: +65, periodLevel: +6, decay: +50, volume: 30,
    baseWaveShape: "triangle",
    description: "草本锐利，三角波。初始振幅较低，周期较短。"
  },
  "whisky": {
    id: "whisky", name: "威士忌", type: "spirit",
    unitCost: 10, powerCost: 0,
    amplitude: +70, periodLevel: +10, decay: +50, volume: 30,
    baseWaveShape: "square",
    description: "厚重沉稳，方波。初始周期较长。"
  },
  "rum": {
    id: "rum", name: "朗姆", type: "spirit",
    unitCost: 11, powerCost: 0,
    amplitude: +62, periodLevel: +5, decay: +50, volume: 30,
    baseWaveShape: "sawtooth",
    description: "甜润且带有脉冲感，锯齿脉冲波。前半段平缓，后半段急剧上升。"
  }
};

export const spirits = [
  { id: "vodka", name: "伏特加" },
  { id: "gin", name: "琴酒" },
  { id: "whisky", name: "威士忌" },
  { id: "rum", name: "朗姆酒" },
] as const;
