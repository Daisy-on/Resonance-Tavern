import type { MixAction } from "./mix-actions";

export type DrinkState = {
  baseSpirit: "vodka" | "gin" | "whisky" | null;
  strength: number;
  sweetness: number;
  temperature: number;
  sparkle: number;
  volume: number;
  actions: MixAction[];
};

export function createEmptyDrinkState(): DrinkState {
  return {
    baseSpirit: null,
    strength: 0,
    sweetness: 0,
    temperature: 50,
    sparkle: 0,
    volume: 0,
    actions: [],
  };
}
