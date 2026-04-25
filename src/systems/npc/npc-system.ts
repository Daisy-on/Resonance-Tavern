import type { GameState } from "../../game/game-state";
import { GuestsDB, type DialogueEntry } from "../../content/guests";
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
  const dialogueEntry = getGuestDialogue(state);
  
  if (typeof dialogueEntry === "string") {
    state.currentDialogue = dialogueEntry;
    state.currentDialogueTree = null;
    state.currentDialogueNode = null;
  } else {
    const rootNode = dialogueEntry.nodes[dialogueEntry.rootId];
    if (rootNode) {
      state.currentDialogueTree = dialogueEntry;
      state.currentDialogueNode = rootNode;
      state.currentDialogue = null;
    } else {
      // Fallback to a simple line when a dialogue tree is malformed.
      const enterPool = GuestsDB[guestId]?.dialogues.enter ?? [];
      state.currentDialogue = enterPool[Math.floor(Math.random() * enterPool.length)] ?? "...";
      state.currentDialogueTree = null;
      state.currentDialogueNode = null;
    }
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
  // Cap at 100 for now
  state.guestAffinity[state.currentGuestId] = Math.min(100, Math.max(-20, state.guestAffinity[state.currentGuestId]));
}

/**
 * Returns a dynamic dialogue based on current affinity level
 */
export function getGuestDialogue(state: GameState): DialogueEntry {
  if (!state.currentGuestId) return "...";

  const guest = GuestsDB[state.currentGuestId];
  if (!guest) return "...";

  const affinity = state.guestAffinity[state.currentGuestId] || 0;

  const levels = guest.dialogues.affinityLevels;
  let pool: DialogueEntry[];

  if (affinity >= 81) pool = levels.resonant;
  else if (affinity >= 51) pool = levels.trusted;
  else if (affinity >= 21) pool = levels.friendly;
  else pool = levels.neutral;

  if (!pool || pool.length === 0) {
    const fallbackPool = guest.dialogues.enter;
    return fallbackPool[Math.floor(Math.random() * fallbackPool.length)] ?? "...";
  }

  const picked = pool[Math.floor(Math.random() * pool.length)];
  if (picked === undefined || picked === null) {
    const fallbackPool = guest.dialogues.enter;
    return fallbackPool[Math.floor(Math.random() * fallbackPool.length)] ?? "...";
  }

  return picked;
}
