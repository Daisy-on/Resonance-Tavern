import type { MixAction } from "./mix-actions";
import type { DrinkState } from "./drink-state";
import { createEmptyDrinkState } from "./drink-state";
import { SpiritsDB } from "../../content/spirits";
import { AdditivesDB } from "../../content/ingredients";
import type { MixActionType } from "./mix-actions";
import { clamp } from "../../utils/clamp";

const PHASE_STEP = Math.PI / 16;

const ACTION_INGREDIENT_MAP: Partial<Record<MixActionType, string>> = {
  select_vodka: "vodka",
  select_gin: "gin",
  select_whisky: "whisky",
  select_rum: "rum",
  add_syrup: "simple_syrup",
  add_lemon: "lemon_juice",
  add_soda: "soda_water",
  add_tonic: "tonic_essence",
  add_bitters: "bitters",
  add_ice: "ice_cube",
};

export function getIngredientIdByAction(actionType: MixActionType): string | null {
  return ACTION_INGREDIENT_MAP[actionType] ?? null;
}

export function applyMixAction(state: DrinkState, action: MixAction): DrinkState {
  const newState = { ...state, actions: [...state.actions, action] };

  const applyIngredient = (ingId: string, db: Record<string, any>) => {
    const ing = db[ingId];
    if (!ing) return;

    if (ing.type === "spirit") {
      newState.baseSpirit = ing.id;
      newState.baseWaveShape = ing.baseWaveShape || "sine";
    }

    newState.strength = clamp(newState.strength + (ing.strength || 0), 0, 100);
    newState.sweetness = clamp(newState.sweetness + (ing.sweetness || 0), 0, 100);
    newState.acidity = clamp(newState.acidity + (ing.acidity || 0), 0, 100);
    newState.temperature = clamp(newState.temperature + (ing.temperature || 0), -20, 50);
    newState.sparkle = clamp(newState.sparkle + (ing.sparkle || 0), 0, 100);
    newState.volume = clamp(newState.volume + (ing.volume || 0), 0, newState.maxVolume);

    if (ing.id === "ice_cube") {
      newState.dilution = clamp(newState.dilution + 8, 0, 100);
      newState.temperature = clamp(newState.temperature - 8, -20, 50);
    }

    if (ing.id === "bitters") {
      newState.oxidation = clamp(newState.oxidation + 10, 0, 100);
    }
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
    case "select_rum":
      if (!newState.baseSpirit) applyIngredient("rum", SpiritsDB);
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
    case "add_tonic":
      applyIngredient("tonic_essence", AdditivesDB);
      break;
    case "add_bitters":
      applyIngredient("bitters", AdditivesDB);
      break;
    case "add_ice":
      applyIngredient("ice_cube", AdditivesDB);
      break;
    case "stir":
      // Backward compatibility: old stir behaves as clockwise stir.
      newState.phaseOffset += PHASE_STEP;
      break;
    case "stir_cw":
      newState.phaseOffset += PHASE_STEP;
      break;
    case "stir_ccw":
      newState.phaseOffset -= PHASE_STEP;
      break;
    case "shake":
      newState.sparkle = clamp(newState.sparkle + 10, 0, 100);
      newState.blend = clamp(newState.blend + 8, 0, 100);
      break;
    case "muddle":
      newState.acidity = clamp(newState.acidity + 6, 0, 100);
      newState.aroma = clamp(newState.aroma + 12, 0, 100);
      break;
    case "pour_precise":
      newState.blend = clamp(newState.blend + 3, 0, 100);
      break;
    case "flame":
      newState.temperature = clamp(newState.temperature + 8, -20, 50);
      newState.smoke = clamp(newState.smoke + 15, 0, 100);
      break;
    case "reset":
      return createEmptyDrinkState();
  }

  // Keep phase in a stable range to avoid precision drift in long sessions.
  if (newState.phaseOffset > Math.PI * 2 || newState.phaseOffset < -Math.PI * 2) {
    newState.phaseOffset %= Math.PI * 2;
  }

  return newState;
}
