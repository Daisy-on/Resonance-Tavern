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
  
  const minDifficulty = state.day >= 8 ? 2 : 1;
  const maxDifficulty = state.day >= 8 ? 5 : state.day >= 4 ? 4 : 2;

  // Prefer guest-themed orders first, then fallback to global pool
  const guestOrders = OrdersDB.filter(
    (o) =>
      o.guestId === guestId &&
      o.difficulty >= minDifficulty &&
      o.difficulty <= maxDifficulty,
  );
  const pool =
    guestOrders.length > 0
      ? guestOrders
      : OrdersDB.filter((o) => o.difficulty >= minDifficulty && o.difficulty <= maxDifficulty);
  const baseOrder = pool[Math.floor(Math.random() * pool.length)];
    
  // Add some dynamic fluctuation based on day
  const fluctuation = Math.min(0.18, state.day * 0.018);
  const applyFluctuation = (val: number, min = 0, max = Number.POSITIVE_INFINITY) => {
    const sign = Math.random() > 0.5 ? 1 : -1;
    return Math.min(max, Math.max(min, val + (val * fluctuation * sign)));
  };
  
  const dynamicOrder: OrderTemplate = {
    ...baseOrder,
    targetParams: {
      ...baseOrder.targetParams,
      amplitude: applyFluctuation(baseOrder.targetParams.amplitude, 0.2, 1.5),
      frequency: applyFluctuation(baseOrder.targetParams.frequency, 0.5, 3),
      decay: applyFluctuation(baseOrder.targetParams.decay, 0, 1),
      phase: applyFluctuation(baseOrder.targetParams.phase, -Math.PI * 2, Math.PI * 2),
      harmonics: applyFluctuation(baseOrder.targetParams.harmonics, 0, 1),
      noise: applyFluctuation(baseOrder.targetParams.noise, 0, 1),
    }
  };

  state.currentOrder = dynamicOrder;
  
  // Track affinity
  if (state.guestAffinity[guestId] === undefined) {
    state.guestAffinity[guestId] = 0;
  }
  
  // Set initial dialogue for the guest
  state.currentDialogue = getGuestDialogue(state);
}

export function updateGuestAffinity(state: GameState, score: number) {
  if (!state.currentGuestId) return;
  
  let delta = 0;
  if (score >= 95) delta = 5;
  else if (score >= 80) delta = 2;
  else if (score >= 60) delta = 1;
  else if (score < 40) delta = -2;
  
  state.guestAffinity[state.currentGuestId] += delta;
  // Cap at 100 for now
  state.guestAffinity[state.currentGuestId] = Math.min(100, Math.max(-20, state.guestAffinity[state.currentGuestId]));
}

/**
 * Returns a dynamic dialogue based on current affinity level
 */
export function getGuestDialogue(state: GameState): string {
  if (!state.currentGuestId) return "...";
  
  const guest = GuestsDB[state.currentGuestId];
  const affinity = state.guestAffinity[state.currentGuestId] || 0;
  
  const levels = guest.dialogues.affinityLevels;
  let pool: string[];
  
  if (affinity >= 81) pool = levels.resonant;
  else if (affinity >= 51) pool = levels.trusted;
  else if (affinity >= 21) pool = levels.friendly;
  else pool = levels.neutral;
  
  // If we have an order mood text, we might want to blend it or use it as priority
  // For now, let's just pick a random one from the affinity pool
  return pool[Math.floor(Math.random() * pool.length)];
}
