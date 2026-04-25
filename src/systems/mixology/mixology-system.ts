import type { MixAction } from "./mix-actions";
import type { DrinkState } from "./drink-state";
import { createEmptyDrinkState } from "./drink-state";
import { SpiritsDB } from "../../content/spirits";
import { AdditivesDB } from "../../content/ingredients";
import type { MixActionType } from "./mix-actions";
import { clamp } from "../../utils/clamp";

// Aligned with PHASE_STEPS (16) in wave-generator.ts: (2 * PI) / (16 - 1)
const PHASE_STEP = (Math.PI * 2) / 15;

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

    newState.amplitude = clamp(newState.amplitude + (ing.amplitude || 0), 0, 100);
    newState.periodLevel = clamp(newState.periodLevel + (ing.periodLevel || 0), 1, 16);
    newState.phaseStep = (newState.phaseStep + (ing.phaseStep || 0)) % 16;
    newState.edgeSharpness = clamp(newState.edgeSharpness + (ing.edgeSharpness || 0), 0, 100);
    newState.noiseLevel = clamp(newState.noiseLevel + (ing.noiseLevel || 0), 0, 100);
    newState.harmonics = clamp(newState.harmonics + (ing.harmonics || 0), 0, 100);
    newState.decay = clamp(newState.decay + (ing.decay || 0), 0, 100);
    newState.volume = clamp(newState.volume + (ing.volume || 0), 0, newState.maxVolume);
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
    case "stir_cw":
      newState.phaseStep = (newState.phaseStep + 1) % 16;
      break;
    case "stir_ccw":
      newState.phaseStep = (newState.phaseStep - 1 + 16) % 16;
      break;
    case "shake":
      newState.harmonics = clamp(newState.harmonics + 20, 0, 100);
      break;
    case "measure_cup":
      newState.noiseLevel = Math.max(0, newState.noiseLevel - 30);
      newState.edgeSharpness = Math.max(0, newState.edgeSharpness - 30);
      break;
    case "flame":
      newState.decay = clamp(newState.decay - 20, 0, 100);
      break;
    case "reset":
      return createEmptyDrinkState();
  }

  return newState;
}
