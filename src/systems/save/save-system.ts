import type { GameState } from "../../game/game-state";
import { createDefaultGameState } from "../../game/game-state";

const SAVE_KEY = "cyber-resonance-bar-save";
const CURRENT_VERSION = 2;

export function saveGameState(state: GameState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, serialized);
    console.log(`[SaveSystem] Game saved. Day: ${state.day}`);
  } catch (error) {
    console.error("Failed to save game state:", error);
  }
}

export function loadGameState(): GameState | null {
  try {
    const serialized = localStorage.getItem(SAVE_KEY);
    if (!serialized) return null;
    
    const parsed = JSON.parse(serialized) as GameState;
    
    const defaultState = createDefaultGameState();
    const merged: GameState = {
      ...defaultState,
      ...parsed,
      version: CURRENT_VERSION,
      resources: { ...defaultState.resources, ...(parsed.resources || {}) },
      dailyLedger: { ...defaultState.dailyLedger, ...(parsed as any).dailyLedger || {} },
      balanceConfig: {
        ...defaultState.balanceConfig,
        ...(parsed as any).balanceConfig || {},
        scoreBonusTable: {
          ...defaultState.balanceConfig.scoreBonusTable,
          ...((parsed as any).balanceConfig?.scoreBonusTable || {}),
        },
      },
    };

    if (!parsed.version || parsed.version < CURRENT_VERSION) {
      console.warn(`[SaveSystem] Outdated save file (Version ${parsed.version}). Migrating...`);
    }

    return merged;
  } catch (error) {
    console.error("Failed to load game state:", error);
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
  console.log("[SaveSystem] Save cleared.");
}
