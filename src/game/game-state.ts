import type { DrinkState } from "../systems/mixology/drink-state";
import { createEmptyDrinkState } from "../systems/mixology/drink-state";
import type { OrderTemplate } from "../content/orders";

export type ResourceState = {
  money: number;
  power: number;
  rating: number;
};

export type OrderFlowState =
  | "idle"
  | "guest_enter"
  | "dialogue"
  | "mixing"
  | "mixing_view" // Focused view for mixing
  | "result"
  | "resource_settlement";

export type GameState = {
  day: number;
  resources: ResourceState;
  orderFlow: OrderFlowState;
  currentGuestId: string | null;
  currentOrder: OrderTemplate | null;
  drink: DrinkState;
  ordersCompletedToday: number;
  lastScore: number;
  // Interaction states
  mouse: { x: number; y: number; isDown: boolean };
  draggedItem: string | null;
};

export function createDefaultGameState(): GameState {
  return {
    day: 1,
    resources: {
      money: 120,
      power: 18,
      rating: 40,
    },
    orderFlow: "idle",
    currentGuestId: null,
    currentOrder: null,
    drink: createEmptyDrinkState(),
    ordersCompletedToday: 0,
    lastScore: 0,
    mouse: { x: 0, y: 0, isDown: false },
    draggedItem: null,
  };
}
