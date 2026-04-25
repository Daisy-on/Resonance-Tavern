import type { GameState } from "./game-state";

const BASE_UNLOCKS = [
  "vodka",
  "gin",
  "whisky",
  "simple_syrup",
  "ice_cube",
  "tonic_essence",
  "stir_tool",
];

const DAY_3_UNLOCKS = ["lemon_juice", "soda_water"];
const DAY_4_UNLOCKS = ["rum"];
const DAY_8_UNLOCKS = ["measure_cup", "shake_tool", "flame_tool", "bitters"];

export function getUnlockedInventoryByDay(day: number): string[] {
  const unlocked = [...BASE_UNLOCKS];
  if (day >= 3) unlocked.push(...DAY_3_UNLOCKS);
  if (day >= 4) unlocked.push(...DAY_4_UNLOCKS);
  if (day >= 8) unlocked.push(...DAY_8_UNLOCKS);
  return unlocked;
}

export function ensureDayUnlocks(state: GameState): void {
  const expected = getUnlockedInventoryByDay(state.day);
  const current = new Set(state.inventory);
  for (const item of expected) current.add(item);
  state.inventory = Array.from(current);
}

export function isUnlocked(state: GameState, id: string): boolean {
  return state.inventory.includes(id);
}
