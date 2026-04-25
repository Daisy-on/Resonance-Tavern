import type { GameState } from "../../game/game-state";
import { GuestsDB } from "../../content/guests";
import { generateProceduralOrder, type OrderTemplate } from "../../content/orders";

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

  // Generate procedural order based on day
  const dynamicOrder = generateProceduralOrder(state.day, guestId);

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

  return pool[Math.floor(Math.random() * pool.length)];
}
