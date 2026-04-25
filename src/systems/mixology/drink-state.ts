import type { MixAction } from "./mix-actions";
import type { IngredientData } from "../../content/spirits";

export type DrinkState = {
  baseSpirit: string | null;
  baseWaveShape: "sine" | "triangle" | "square" | null;
  strength: number;
  sweetness: number;
  acidity: number;
  temperature: number;
  sparkle: number;
  volume: number;
  actions: MixAction[];
};

export function createEmptyDrinkState(): DrinkState {
  return {
    baseSpirit: null,
    baseWaveShape: null,
    strength: 0,
    sweetness: 0,
    acidity: 0,
    temperature: 20, // 初始常温
    sparkle: 0,
    volume: 0,
    actions: [],
  };
}
