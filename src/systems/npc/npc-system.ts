import type { GameState } from "../../game/game-state";
import { GuestsDB } from "../../content/guests";
import { OrdersDB, type OrderTemplate } from "../../content/orders";

export type GuestOrder = {
  guestId: string;
  moodText: string;
  difficulty: number;
};

export function createGuestOrder(guestId: string): GuestOrder {
  return {
    guestId,
    moodText: "",
    difficulty: 1,
  };
}

export function generateNextGuest(state: GameState) {
  const guestKeys = Object.keys(GuestsDB);
  // Pick random guest
  const guestId = guestKeys[Math.floor(Math.random() * guestKeys.length)];
  
  // Update state
  state.currentGuestId = guestId;
  
  // Pick order, ideally filtered by guest preference later
  const guestOrders = OrdersDB.filter(o => o.guestId === guestId);
  const baseOrder = guestOrders.length > 0 
    ? guestOrders[Math.floor(Math.random() * guestOrders.length)]
    : OrdersDB[Math.floor(Math.random() * OrdersDB.length)]; // Fallback
    
  // Add some dynamic fluctuation based on day
  const fluctuation = Math.min(0.2, state.day * 0.02); // Up to 20% fluctuation
  const applyFluctuation = (val: number) => {
    const sign = Math.random() > 0.5 ? 1 : -1;
    return Math.max(0, val + (val * fluctuation * sign));
  };
  
  const dynamicOrder: OrderTemplate = {
    ...baseOrder,
    targetParams: {
      ...baseOrder.targetParams,
      amplitude: applyFluctuation(baseOrder.targetParams.amplitude),
      frequency: applyFluctuation(baseOrder.targetParams.frequency),
      decay: applyFluctuation(baseOrder.targetParams.decay),
    }
  };

  state.currentOrder = dynamicOrder;
  
  // Track affinity
  if (state.guestAffinity[guestId] === undefined) {
    state.guestAffinity[guestId] = 0;
  }
}

export function updateGuestAffinity(state: GameState, score: number) {
  if (!state.currentGuestId) return;
  
  let delta = 0;
  if (score >= 95) delta = 5;
  else if (score >= 80) delta = 2;
  else if (score >= 60) delta = 1;
  else if (score < 40) delta = -2;
  
  state.guestAffinity[state.currentGuestId] += delta;
  // Cap at max affinity if needed
}
