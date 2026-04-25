import type { MixAction } from "./mix-actions";
import type { DrinkState } from "./drink-state";

export function applyMixAction(state: DrinkState, action: MixAction): DrinkState {
  return {
    ...state,
    actions: [...state.actions, action],
  };
}
