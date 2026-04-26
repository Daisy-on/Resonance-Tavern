import type { DrinkState } from "../systems/mixology/drink-state";
import { createEmptyDrinkState } from "../systems/mixology/drink-state";
import type { OrderTemplate } from "../content/orders";
import type { DialogueNode, DialogueTree } from "../content/guests";

export type ResourceState = {
  money: number;
  power: number;
  rating: number;
};

export type ScoreBreakdown = {
  shape: number;
  amplitude: number;
  period: number;
  phase: number;
  edge: number;
  noise: number;
};

export type DailyLedger = {
  ingredientCostToday: number;
  orderIncomeToday: number;
  rentToday: number;
  powerFromIceToday: number;
  ordersToday: number;
};

export type BalanceConfig = {
  baseOrderPrice: number;
  scoreBonusTable: {
    perfect: number;
    high: number;
    normal: number;
    low: number;
    fail: number;
  };
};

export type OrderFlowState =
  | "idle"
  | "guest_enter"
  | "dialogue"
  | "mixing"
  | "mixing_view" // Focused view for mixing
  | "result"
  | "resource_settlement"
  | "game_over";

export type GameState = {
  version: number; // Save version
  day: number;
  resources: ResourceState;
  dailyLedger: DailyLedger;
  balanceConfig: BalanceConfig;
  orderFlow: OrderFlowState;
  currentGuestId: string | null;
  currentOrder: OrderTemplate | null;
  drink: DrinkState;
  ordersCompletedToday: number;
  maxOrdersPerDay: number;
  lastScore: number;
  // Interaction states
  mouse: { x: number; y: number; isDown: boolean };
  draggedItem: string | null;
  // Meta states
  activeEvent: string | null;
  guestAffinity: Record<string, number>;
  inventory: string[];
  lastScoreBreakdown: ScoreBreakdown | null;
  currentDialogue: string | null;
  currentDialogueNode: DialogueNode | null; // For interactive dialogue
  currentDialogueTree: DialogueTree | null; // The active dialogue tree
  // Resonance Code System
  hasUsedResonanceCode: boolean;
  previousFlow?: OrderFlowState;
};

export function getMaxOrdersPerDay(day: number): number {
  return day <= 7 ? 4 : 5;
}

export function createDefaultGameState(): GameState {
  return {
    version: 2,
    day: 1,
    resources: {
      money: 150,
      power: 24,
      rating: 50,
    },
    dailyLedger: {
      ingredientCostToday: 0,
      orderIncomeToday: 0,
      rentToday: 0,
      powerFromIceToday: 0,
      ordersToday: 0,
    },
    balanceConfig: {
      baseOrderPrice: 12,
      scoreBonusTable: {
        perfect: 14,
        high: 8,
        normal: 3,
        low: -2,
        fail: -8,
      },
    },
    orderFlow: "idle",
    currentGuestId: null,
    currentOrder: null,
    drink: createEmptyDrinkState(),
    ordersCompletedToday: 0,
    maxOrdersPerDay: getMaxOrdersPerDay(1),
    lastScore: 0,
    mouse: { x: 0, y: 0, isDown: false },
    draggedItem: null,
    activeEvent: null,
    guestAffinity: {},
    inventory: [
      "vodka",
      "gin",
      "whisky",
      "simple_syrup",
      "ice_cube",
      "tonic_essence",
      "stir_tool",
    ],
    lastScoreBreakdown: null,
    currentDialogue: null,
    currentDialogueNode: null,
    currentDialogueTree: null,
    hasUsedResonanceCode: false,
  };
}
