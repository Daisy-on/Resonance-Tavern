import type { MixAction } from "./mix-actions";
import type { IngredientData } from "../../content/spirits";

export type DrinkState = {
  baseSpirit: string | null;
  baseWaveShape: "sine" | "triangle" | "square" | null;
  
  // Primary Attributes (0-100)
  strength: number;
  sweetness: number;
  acidity: number;
  temperature: number;
  sparkle: number;
  blend: number;
  
  // Secondary Attributes (0-100)
  dilution: number;
  oxidation: number;
  smoke: number;
  aroma: number;
  
  // Physical
  volume: number; // in ml
  maxVolume: number; // usually 300ml or similar
  color?: string; // CSS color string
  
  actions: MixAction[]; // History of actions
};

export function createEmptyDrinkState(): DrinkState {
  return {
    baseSpirit: null,
    baseWaveShape: null,
    strength: 0,
    sweetness: 0,
    acidity: 0,
    temperature: 20, // Room temp
    sparkle: 0,
    blend: 0,
    dilution: 0,
    oxidation: 0,
    smoke: 0,
    aroma: 0,
    volume: 0,
    maxVolume: 300,
    actions: [],
  };
}
