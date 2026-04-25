import type { DrinkState } from "../systems/mixology/drink-state";
import { createEmptyDrinkState } from "../systems/mixology/drink-state";
import type { OrderTemplate } from "../content/orders";

export type ResourceState = {
  money: number;
  power: number;
  rating: number;
};

export type ScoreBreakdown = {
  shape: number;
  amplitude: number;
  frequency: number;
  phase: number;
  texture: number;
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
};

export function createDefaultGameState(): GameState {
  return {
    version: 2,
    day: 1,
    resources: {
      money: 180,
      power: 24,
      rating: 55,
    },
    dailyLedger: {
      ingredientCostToday: 0,
      orderIncomeToday: 0,
      rentToday: 0,
      powerFromIceToday: 0,
      ordersToday: 0,
    },
    balanceConfig: {
      baseOrderPrice: 18,
      scoreBonusTable: {
        perfect: 20,
        high: 12,
        normal: 6,
        low: 0,
        fail: -4,
      },
    },
    orderFlow: "idle",
    currentGuestId: null,
    currentOrder: null,
    drink: createEmptyDrinkState(),
    ordersCompletedToday: 0,
    maxOrdersPerDay: 5,
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
      "lemon_juice",
      "soda_water",
      "ice_cube",
      "stir_tool",
    ],
    lastScoreBreakdown: null,
  };
}
