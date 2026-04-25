import type { MixAction } from "./mix-actions";
import type { DrinkState } from "./drink-state";
import { SpiritsDB } from "../../content/spirits";
import { AdditivesDB } from "../../content/ingredients";

export function applyMixAction(state: DrinkState, action: MixAction): DrinkState {
  // If submitted or max volume reached, we might want to restrict, but let's keep it simple
  const newState = { ...state, actions: [...state.actions, action] };

  const applyIngredient = (ingId: string, db: any) => {
    const ing = db[ingId];
    if (!ing) return;
    if (ing.type === "spirit") {
      newState.baseSpirit = ing.id;
      newState.baseWaveShape = ing.baseWaveShape || "sine";
    }
    // Apply numeric modifiers (simple additive for MVP, strength is scaled by volume later if needed, but for MVP let's just add)
    newState.strength = Math.max(0, newState.strength + (ing.strength || 0));
    newState.sweetness = Math.max(0, newState.sweetness + (ing.sweetness || 0));
    newState.acidity = Math.max(0, newState.acidity + (ing.acidity || 0));
    newState.temperature = Math.max(-20, Math.min(50, newState.temperature + (ing.temperature < 0 ? ing.temperature : 0))); // ice lowers temp
    if (ing.id === "ice_cube") {
      // Hardcode ice drop temp logic if we want, or just add
      newState.temperature = Math.max(-20, newState.temperature - 20);
    }
    newState.sparkle = Math.max(0, newState.sparkle + (ing.sparkle || 0));
    newState.volume = Math.min(200, newState.volume + (ing.volume || 0)); // cap at 200ml
  };

  switch (action.type) {
    case "select_vodka":
      if (!newState.baseSpirit) applyIngredient("vodka", SpiritsDB);
      break;
    case "select_gin":
      if (!newState.baseSpirit) applyIngredient("gin", SpiritsDB);
      break;
    case "select_whisky":
      if (!newState.baseSpirit) applyIngredient("whisky", SpiritsDB);
      break;
    case "add_syrup":
      applyIngredient("simple_syrup", AdditivesDB);
      break;
    case "add_lemon":
      applyIngredient("lemon_juice", AdditivesDB);
      break;
    case "add_soda":
      applyIngredient("soda_water", AdditivesDB);
      break;
    case "add_ice":
      applyIngredient("ice_cube", AdditivesDB);
      break;
    case "stir":
      // stir could smooth out the wave slightly (reduce sparkle or average temp)
      newState.sparkle = Math.max(0, newState.sparkle - 10);
      break;
    case "reset":
      return {
        baseSpirit: null,
        baseWaveShape: null,
        strength: 0,
        sweetness: 0,
        acidity: 0,
        temperature: 20,
        sparkle: 0,
        volume: 0,
        actions: [],
      };
    case "submit":
      break;
  }

  return newState;
}
