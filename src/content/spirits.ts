export interface IngredientData {
  id: string;
  name: string;
  type: "spirit" | "sweetener" | "mixer" | "ice";
  unitCost: number;
  powerCost: number;
  strength: number;
  sweetness: number;
  acidity?: number;
  temperature: number;
  sparkle?: number;
  volume: number;
  baseWaveShape?: "sine" | "triangle" | "square";
  description: string;
}

export const SpiritsDB: Record<string, IngredientData> = {
  "vodka": {
    id: "vodka", name: "伏特加", type: "spirit",
    unitCost: 9, powerCost: 0,
    strength: 80, sweetness: 0, temperature: 20, volume: 30,
    baseWaveShape: "sine",
    description: "冷硬如钢，正弦波。提供最高的振幅基数。"
  },
  "gin": {
    id: "gin", name: "琴酒", type: "spirit",
    unitCost: 8, powerCost: 0,
    strength: 65, sweetness: 10, temperature: 20, volume: 30,
    baseWaveShape: "triangle",
    description: "草本锐利，三角波。自带微量甜度波动。"
  },
  "whisky": {
    id: "whisky", name: "威士忌", type: "spirit",
    unitCost: 10, powerCost: 0,
    strength: 70, sweetness: 5, temperature: 20, volume: 30,
    baseWaveShape: "square",
    description: "厚重沉稳，方波。低频存在感强。"
  },
  "rum": {
    id: "rum", name: "朗姆", type: "spirit",
    unitCost: 11, powerCost: 0,
    strength: 62, sweetness: 20, temperature: 20, volume: 30,
    baseWaveShape: "triangle",
    description: "甜润且有层次，适合中高频与复杂谐波订单。"
  }
};

export const spirits = [
  { id: "vodka", name: "伏特加" },
  { id: "gin", name: "琴酒" },
  { id: "whisky", name: "威士忌" },
  { id: "rum", name: "朗姆" },
] as const;
