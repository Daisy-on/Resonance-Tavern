import type { MixAction } from "./mix-actions";
import type { IngredientData } from "../../content/spirits";

export type DrinkState = {
  baseSpirit: string | null;
  baseWaveShape: "sine" | "triangle" | "square" | "sawtooth" | null;
  
  // 核心波形直接控制参数 (The new 6 dimensions)
  amplitude: number;       // 对应高度 (0-100)
  periodLevel: number;     // 周期档位 (默认8，越高周期越长)
  phaseStep: number;       // 相位偏移档位 (每档对应 PI/16)
  edgeSharpness: number;   // 不对称偏斜/边缘感 (0-100)
  noiseLevel: number;      // 高频毛刺/锯齿 (0-100)
  harmonics: number;       // 谐波复杂度 (0-100)
  decay: number;           // 拖尾衰减饱满度 (0-100, 原温度作用)
  
  // Physical
  volume: number; // in ml
  maxVolume: number; // usually 200ml
  color?: string; // CSS color string
  
  actions: MixAction[]; // History of actions
};

export function createEmptyDrinkState(): DrinkState {
  return {
    baseSpirit: null,
    baseWaveShape: null,
    amplitude: 0,
    periodLevel: 8,     // 默认周期中等
    phaseStep: 0,       // 默认 0 偏移
    edgeSharpness: 0,
    noiseLevel: 0,
    harmonics: 0,
    decay: 50,          // 默认适中衰减
    volume: 0,
    maxVolume: 200,
    actions: [],
  };
}
