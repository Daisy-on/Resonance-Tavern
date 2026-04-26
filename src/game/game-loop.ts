import { createDefaultGameState, getMaxOrdersPerDay, type GameState } from "./game-state";
import { applyMixAction, getIngredientIdByAction } from "../systems/mixology/mixology-system";
import { calcAdvancedScoreWithBreakdown } from "../systems/wave/wave-match";
import { generateNextGuest, updateGuestAffinity } from "../systems/npc/npc-system";
import { renderHud } from "../ui/hud-renderer";
import { renderBar } from "../ui/bar-renderer";
import {
  applyIngredientCost,
  applyOrderIncome,
  applyOrderRating,
  applyDailySettlement,
  checkGameOver,
  resetDailyLedger,
} from "../systems/economy/economy-system";
import { pickDailyEvent } from "../systems/event/event-system";
import { audioSystem } from "../audio/audio-system";
import { saveGameState } from "../systems/save/save-system";
import { ensureDayUnlocks, isUnlocked } from "./unlock-system";
import { createEmptyDrinkState } from "../systems/mixology/drink-state";
import type { MixActionType } from "../systems/mixology/mix-actions";
import { parseResonanceCode } from "../systems/social/resonance-system";

type GameLoopInput = {
  canvas: HTMLCanvasElement;
  state: GameState;
};

export function createGameLoop(input: GameLoopInput) {
  const ctx = input.canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");

  let currentState = { ...input.state };
  currentState.maxOrdersPerDay = getMaxOrdersPerDay(currentState.day);
  ensureDayUnlocks(currentState);

  const mixActions = new Set<MixActionType>([
    "select_vodka",
    "select_gin",
    "select_whisky",
    "select_rum",
    "add_syrup",
    "add_lemon",
    "add_soda",
    "add_tonic",
    "add_bitters",
    "add_ice",
    "stir",
    "stir_cw",
    "stir_ccw",
    "shake",
    "measure_cup",
    "flame",
    "reset",
  ]);

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    input.canvas.width = Math.floor(width * dpr);
    input.canvas.height = Math.floor(height * dpr);
    input.canvas.style.width = `${width}px`;
    input.canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const dispatch = (action: string | { type: string, payload: any }) => {
    console.log("Dispatching:", action);

    if (typeof action === "object" && action.type === "select_dialogue_option") {
      const optionIndex = action.payload;
      if (!currentState.currentDialogueNode || !currentState.currentDialogueTree) return;
      const option = currentState.currentDialogueNode.options[optionIndex];
      if (!option) return;

      if (option.affinityChange && currentState.currentGuestId) {
        const current = currentState.guestAffinity[currentState.currentGuestId] || 0;
        currentState.guestAffinity[currentState.currentGuestId] = Math.max(0, Math.min(100, current + option.affinityChange));
      }

      if (option.nextId) {
        currentState.currentDialogueNode = currentState.currentDialogueTree.nodes[option.nextId];
      } else {
        // End dialogue, proceed to mixing
        currentState.orderFlow = "mixing_view";
      }
      return;
    } else if (typeof action === "object" && action.type === "use_resonance_code") {
      const code = action.payload;
      const reward = parseResonanceCode(code);
      if (reward && !currentState.hasUsedResonanceCode) {
        currentState.hasUsedResonanceCode = true;
        currentState.resources.money += reward.money;
        currentState.resources.power += reward.power;
        currentState.resources.rating += reward.rating;
        
        // Play success sound
        audioSystem.playSuccess();
        
        // If we are in game_over, check if we are safe now
        if (currentState.orderFlow === "game_over" && !checkGameOver(currentState)) {
          currentState.orderFlow = currentState.previousFlow || "idle";
        }
        saveGameState(currentState);
      } else {
        audioSystem.playFail();
        alert("无效的共振码，或者本局已使用过救援！");
      }
      return;
    }

    // Convert action to string for the rest of the logic
    const actionStr = typeof action === "string" ? action : action.type;

    if (actionStr === "next_guest") {
      ensureDayUnlocks(currentState);
      if (currentState.ordersCompletedToday >= currentState.maxOrdersPerDay) {
        const { isBankrupt } = applyDailySettlement(currentState);
        if (isBankrupt) {
          currentState.previousFlow = "resource_settlement";
          currentState.orderFlow = "game_over";
        } else {
          currentState.orderFlow = "resource_settlement";
        }
        saveGameState(currentState);
      } else {
        // Pick a random guest and order via NPC system
        generateNextGuest(currentState);

        // Reset drink
        currentState.drink = createEmptyDrinkState();
        currentState.lastScoreBreakdown = null;

        currentState.orderFlow = "guest_enter";
      }
    } else if (actionStr === "take_order") {
      currentState.orderFlow = "mixing_view";
    } else if (actionStr === "next_day") {
      if (checkGameOver(currentState)) {
        currentState.previousFlow = "resource_settlement";
        currentState.orderFlow = "game_over";
      } else {
        currentState.day += 1;
        currentState.maxOrdersPerDay = getMaxOrdersPerDay(currentState.day);
        ensureDayUnlocks(currentState);
        currentState.ordersCompletedToday = 0;
        currentState.orderFlow = "idle";
        resetDailyLedger(currentState);
        pickDailyEvent(currentState);
      }
      saveGameState(currentState);
    } else if (actionStr === "submit") {
      // Calculate score
      if (currentState.currentOrder && currentState.drink.baseSpirit) {
        const scoreResult = calcAdvancedScoreWithBreakdown(currentState.drink, currentState.currentOrder, currentState.activeEvent);
        const rawScore = scoreResult.finalScore;
        // apply penalties
        let finalScore = rawScore;
        if (currentState.drink.volume > 200) finalScore -= 10; // overflow

        // Event modifier
        if (currentState.activeEvent === "streamer" && finalScore >= 95) finalScore += 5;

        currentState.lastScore = Math.max(0, finalScore);
        currentState.lastScoreBreakdown = scoreResult.breakdown;

        if (finalScore >= 60) {
          audioSystem.playSuccess();
        } else {
          audioSystem.playFail();
        }

        // 订单提交后：只计算收入和评分（成本已在动作时实时扣除）
        applyOrderIncome(currentState, currentState.lastScore);
        applyOrderRating(currentState, currentState.lastScore);

        // Apply affinity
        updateGuestAffinity(currentState, currentState.lastScore);

        currentState.ordersCompletedToday += 1;
        currentState.orderFlow = "result";

        // 单后失败判定
        if (checkGameOver(currentState)) {
          currentState.previousFlow = "result";
          currentState.orderFlow = "game_over";
        }
        saveGameState(currentState);
      }
    } else if (actionStr === "restart") {
      currentState = createDefaultGameState();
      ensureDayUnlocks(currentState);
      saveGameState(currentState);
    } else if (mixActions.has(actionStr as MixActionType)) {
      const mixAction = actionStr as MixActionType;
      ensureDayUnlocks(currentState);
      audioSystem.init(); // Initialize audio on first interaction
      if (mixAction === "add_ice") audioSystem.playIce();
      else if (["stir", "stir_cw", "stir_ccw"].includes(mixAction)) audioSystem.playStir();
      else if (mixAction === "shake") audioSystem.playShake();
      else if (mixAction !== "reset") audioSystem.playPour();

      const actionUnlockMap: Partial<Record<MixActionType, string>> = {
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
        stir: "stir_tool",
        stir_cw: "stir_tool",
        stir_ccw: "stir_tool",
        shake: "shake_tool",
        measure_cup: "measure_cup",
        flame: "flame_tool",
      };
      const requiredUnlock = actionUnlockMap[mixAction];
      if (requiredUnlock && !isUnlocked(currentState, requiredUnlock)) {
        return;
      }

      const ingredientId = getIngredientIdByAction(mixAction);
      if (ingredientId) {
        applyIngredientCost(currentState, ingredientId);
        if (checkGameOver(currentState)) {
          currentState.previousFlow = "mixing_view";
          currentState.orderFlow = "game_over";
          saveGameState(currentState);
          return;
        }
      }

      if (currentState.orderFlow === "guest_enter") {
        // First action starts mixing
        currentState.orderFlow = "mixing";
      }
      currentState.drink = applyMixAction(currentState.drink, { type: mixAction });
      // Extra power cost per action could go here if desired
    }
  };

  const render = () => {
    renderBar(ctx, window.innerWidth, window.innerHeight, currentState);
    renderHud(currentState, dispatch);
  };

  const tick = () => {
    render();
    requestAnimationFrame(tick);
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (currentState.orderFlow !== "mixing_view") return;

    const rect = input.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentState.mouse.isDown = true;

    // Hit detection for items
    const w = window.innerWidth;
    const h = window.innerHeight;
    const tableY = h - 300; // Updated table position

    const isInside = (px: number, py: number, rx: number, ry: number, rw: number, rh: number) => {
      return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    };

    const propY = tableY + 60;

    const canDragAction = (candidate: MixActionType): boolean => {
      const unlockMap: Partial<Record<MixActionType, string>> = {
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
        stir: "stir_tool",
        stir_cw: "stir_tool",
        stir_ccw: "stir_tool",
        shake: "shake_tool",
        measure_cup: "measure_cup",
        flame: "flame_tool",
      };
      const unlockId = unlockMap[candidate];
      return !unlockId || isUnlocked(currentState, unlockId);
    };

    // 1. Spirits (Left) - Size 80
    if (isInside(x, y, 60, propY - 40, 460, 140)) {
      if (x < 160) currentState.draggedItem = canDragAction("select_vodka") ? "select_vodka" : null;
      else if (x < 280) currentState.draggedItem = canDragAction("select_gin") ? "select_gin" : null;
      else if (x < 400) currentState.draggedItem = canDragAction("select_whisky") ? "select_whisky" : null;
      else currentState.draggedItem = canDragAction("select_rum") ? "select_rum" : null;
      return;
    }

    // 2. Ice Box (Middle-ish) - Size 100
    if (isInside(x, y, w / 2 - 300, propY + 20, 120, 120)) {
      currentState.draggedItem = canDragAction("add_ice") ? "add_ice" : null;
      return;
    }

    // 3. Additives (Right) - Row 1
    // Matches drawAdditivesSet(ctx, w - 620, propY - 20, state)
    if (isInside(x, y, w - 620, propY - 30, 520, 120)) {
      if (x < w - 500) currentState.draggedItem = canDragAction("add_syrup") ? "add_syrup" : null;
      else if (x < w - 380) currentState.draggedItem = canDragAction("add_tonic") ? "add_tonic" : null;
      else if (x < w - 280) currentState.draggedItem = canDragAction("add_soda") ? "add_soda" : null;
      else if (x < w - 180) currentState.draggedItem = canDragAction("add_lemon") ? "add_lemon" : null;
      else currentState.draggedItem = canDragAction("add_bitters") ? "add_bitters" : null;
      return;
    }

    // 4. Stir Tools (CW / CCW)
    // Matches drawStirTools(ctx, w / 2 + 70, propY + 60, state)
    if (isInside(x, y, w / 2 + 70, propY + 50, 200, 100)) {
      if (x < w / 2 + 160) {
        currentState.draggedItem = canDragAction("stir_cw") ? "stir_cw" : null;
      } else {
        currentState.draggedItem = canDragAction("stir_ccw") ? "stir_ccw" : null;
      }
      return;
    }

    // 5. Advanced tools (Row 2)
    if (isInside(x, y, w - 380, propY + 80, 380, 100)) {
      if (x < w - 290) currentState.draggedItem = canDragAction("shake") ? "shake" : null;
      else if (x < w - 200) currentState.draggedItem = canDragAction("measure_cup") ? "measure_cup" : null;
      else currentState.draggedItem = canDragAction("flame") ? "flame" : null;
      return;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = input.canvas.getBoundingClientRect();
    currentState.mouse.x = e.clientX - rect.left;
    currentState.mouse.y = e.clientY - rect.top;
  };

  const handleMouseUp = () => {
    if (currentState.orderFlow !== "mixing_view") {
      currentState.mouse.isDown = false;
      currentState.draggedItem = null;
      return;
    }

    if (currentState.draggedItem) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const tableY = h - 300;
      const cupX = w / 2;
      const cupY = tableY + 180; // Corrected cup bottom Y from bar-renderer
      const cupHeight = 120;
      const cupTop = cupY - cupHeight;

      // Check if dropped within a generous bounding box around the cup
      const isOverCup = currentState.mouse.x > cupX - 80 &&
        currentState.mouse.x < cupX + 80 &&
        currentState.mouse.y > cupTop - 80 &&
        currentState.mouse.y < cupY + 40;

      if (isOverCup) {
        dispatch(currentState.draggedItem as string);
      }
    }

    currentState.mouse.isDown = false;
    currentState.draggedItem = null;
  };

  return {
    start() {
      resize();
      window.addEventListener("resize", resize);
      input.canvas.addEventListener("mousedown", handleMouseDown);
      input.canvas.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      tick();
    },
  };
}
