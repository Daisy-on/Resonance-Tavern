import { createDefaultGameState, type GameState } from "./game-state";
import { applyMixAction } from "../systems/mixology/mixology-system";
import { calcAdvancedScore } from "../systems/wave/wave-match";
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

type GameLoopInput = {
  canvas: HTMLCanvasElement;
  state: GameState;
};

export function createGameLoop(input: GameLoopInput) {
  const ctx = input.canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");

  let currentState = { ...input.state };

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

  const dispatch = (action: string) => {
    console.log("Dispatching:", action);

    if (action === "next_guest") {
      if (currentState.ordersCompletedToday >= currentState.maxOrdersPerDay) {
        const { isBankrupt } = applyDailySettlement(currentState);
        currentState.orderFlow = isBankrupt ? "game_over" : "resource_settlement";
        saveGameState(currentState);
      } else {
        // Pick a random guest and order via NPC system
        generateNextGuest(currentState);

        // Reset drink
        currentState.drink = {
          baseSpirit: null, baseWaveShape: null, strength: 0, sweetness: 0,
          acidity: 0, temperature: 20, sparkle: 0, blend: 0, dilution: 0,
          oxidation: 0, smoke: 0, aroma: 0, volume: 0, maxVolume: 300, actions: []
        };

        currentState.orderFlow = "guest_enter";
      }
    } else if (action === "take_order") {
      currentState.orderFlow = "mixing_view";
    } else if (action === "next_day") {
      if (checkGameOver(currentState)) {
        currentState.orderFlow = "game_over";
      } else {
        currentState.day += 1;
        currentState.ordersCompletedToday = 0;
        currentState.orderFlow = "idle";
        resetDailyLedger(currentState);
        pickDailyEvent(currentState);
      }
      saveGameState(currentState);
    } else if (action === "submit") {
      // Calculate score
      if (currentState.currentOrder && currentState.drink.baseSpirit) {
        const rawScore = calcAdvancedScore(currentState.drink, currentState.currentOrder);
        // apply penalties
        let finalScore = rawScore;
        if (currentState.drink.volume > 200) finalScore -= 10; // overflow
        
        // Event modifier
        if (currentState.activeEvent === "streamer" && finalScore >= 95) finalScore += 5;

        currentState.lastScore = Math.max(0, finalScore);

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
          currentState.orderFlow = "game_over";
        }
        saveGameState(currentState);
      }
    } else if (action === "restart") {
      currentState = createDefaultGameState();
      saveGameState(currentState);
    } else if (["select_vodka", "select_gin", "select_whisky", "add_syrup", "add_lemon", "add_soda", "add_ice", "stir", "reset"].includes(action)) {
      audioSystem.init(); // Initialize audio on first interaction
      if (action === "add_ice") audioSystem.playIce();
      else if (action !== "stir" && action !== "reset") audioSystem.playPour();

      const actionToIngredient: Record<string, string> = {
        select_vodka: "vodka",
        select_gin: "gin",
        select_whisky: "whisky",
        add_syrup: "simple_syrup",
        add_lemon: "lemon_juice",
        add_soda: "soda_water",
        add_ice: "ice_cube",
      };
      const ingredientId = actionToIngredient[action];
      if (ingredientId) {
        applyIngredientCost(currentState, ingredientId);
        if (checkGameOver(currentState)) {
          currentState.orderFlow = "game_over";
          saveGameState(currentState);
          return;
        }
      }

      if (currentState.orderFlow === "guest_enter") {
        // First action starts mixing
        currentState.orderFlow = "mixing";
      }
      currentState.drink = applyMixAction(currentState.drink, { type: action as any });
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

    // 1. Spirits (Left) - Size 80
    if (isInside(x, y, 60, propY - 40, 320, 140)) {
      if (x < 160) currentState.draggedItem = "select_vodka";
      else if (x < 280) currentState.draggedItem = "select_gin";
      else currentState.draggedItem = "select_whisky";
      return;
    }

    // 2. Ice Box (Middle-ish) - Size 100
    if (isInside(x, y, w / 2 - 300, propY + 20, 120, 120)) {
      currentState.draggedItem = "add_ice";
      return;
    }

    // 3. Additives (Right) - Size 60
    if (isInside(x, y, w - 380, propY - 20, 350, 120)) {
      if (x < w - 280) currentState.draggedItem = "add_syrup";
      else if (x < w - 160) currentState.draggedItem = "add_lemon";
      else currentState.draggedItem = "add_soda";
      return;
    }

    // 4. Stir Tool
    if (isInside(x, y, w / 2 + 180, propY + 60, 140, 60)) {
      currentState.draggedItem = "stir";
      return;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rect = input.canvas.getBoundingClientRect();
    currentState.mouse.x = e.clientX - rect.left;
    currentState.mouse.y = e.clientY - rect.top;
  };

  const handleMouseUp = (e: MouseEvent) => {
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
      const cupWidth = 80;
      const cupHeight = 120;
      const cupTop = cupY - cupHeight;

      // Check if dropped within a generous bounding box around the cup
      const isOverCup = currentState.mouse.x > cupX - 80 &&
        currentState.mouse.x < cupX + 80 &&
        currentState.mouse.y > cupTop - 80 &&
        currentState.mouse.y < cupY + 40;

      if (isOverCup) {
        dispatch(currentState.draggedItem);
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
