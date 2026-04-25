import type { GameState } from "./game-state";

const BASE_UNLOCKS = [
  "vodka",
  "gin",
  "whisky",
  "simple_syrup",
  "lemon_juice",
  "soda_water",
  "tonic_essence",
  "ice_cube",
  "stir_tool",
];

const DAY_4_UNLOCKS = ["rum"];
const DAY_7_UNLOCKS = ["bitters", "shake_tool"];
const DAY_10_UNLOCKS = ["flame_tool", "muddle_tool", "precision_tool"];

export function getUnlockedInventoryByDay(day: number): string[] {
  const unlocked = [...BASE_UNLOCKS];
  if (day >= 4) unlocked.push(...DAY_4_UNLOCKS);
  if (day >= 7) unlocked.push(...DAY_7_UNLOCKS);
  if (day >= 10) unlocked.push(...DAY_10_UNLOCKS);
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
