import type { GameState } from "./game-state";
import { applyMixAction } from "../systems/mixology/mixology-system";
import { generateWave, drinkStateToWaveParams } from "../systems/wave/wave-generator";
import { calcMseScore } from "../systems/wave/wave-match";
import { GuestsDB } from "../content/guests";
import { OrdersDB } from "../content/orders";
import { renderHud } from "../ui/hud-renderer";
import { renderBar } from "../ui/bar-renderer";

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
      if (currentState.ordersCompletedToday >= 5) {
        currentState.orderFlow = "resource_settlement";
      } else {
        // Pick a random guest and order
        const guestKeys = Object.keys(GuestsDB);
        currentState.currentGuestId = guestKeys[Math.floor(Math.random() * guestKeys.length)];
        currentState.currentOrder = OrdersDB[Math.floor(Math.random() * OrdersDB.length)];

        // Reset drink
        currentState.drink = {
          baseSpirit: null, baseWaveShape: null, strength: 0, sweetness: 0,
          acidity: 0, temperature: 20, sparkle: 0, volume: 0, actions: []
        };

        currentState.orderFlow = "guest_enter";
      }
    } else if (action === "take_order") {
      currentState.orderFlow = "mixing_view";
    } else if (action === "next_day") {
      // Settle resources
      currentState.resources.money -= 30; // Rent
      currentState.resources.power = 18;  // Reset power
      currentState.day += 1;
      currentState.ordersCompletedToday = 0;

      if (currentState.resources.money <= 0 || currentState.resources.power <= 0 || currentState.resources.rating <= 0) {
        alert("GAME OVER! You ran out of resources.");
        location.reload(); // simple reset for MVP
        return;
      }
      currentState.orderFlow = "idle";
    } else if (action === "submit") {
      // Calculate score
      if (currentState.currentOrder && currentState.drink.baseSpirit) {
        const targetWave = generateWave(currentState.currentOrder.targetParams);
        const currentParams = drinkStateToWaveParams(currentState.drink);
        const currentWave = generateWave(currentParams);

        const rawScore = calcMseScore(targetWave, currentWave);
        // apply penalties
        let finalScore = rawScore;
        if (currentState.drink.volume > 200) finalScore -= 10; // overflow

        currentState.lastScore = Math.max(0, finalScore);

        // apply to economy
        const rewardBase = currentState.currentOrder.rewardBase;
        const scoreBonus = finalScore >= 60 ? Math.floor(rewardBase * ((finalScore - 60) / 40)) : 0;
        const tip = finalScore >= 90 ? 10 : 0;

        currentState.resources.money += Math.max(6, rewardBase + scoreBonus + tip);
        currentState.resources.power -= 1; // 1 power per order

        if (finalScore >= 95) currentState.resources.rating += 4;
        else if (finalScore >= 80) currentState.resources.rating += 2;
        else if (finalScore >= 60) currentState.resources.rating += 0;
        else if (finalScore >= 40) currentState.resources.rating -= 3;
        else currentState.resources.rating -= 6;

        currentState.ordersCompletedToday += 1;
        currentState.orderFlow = "result";
      }
    } else if (["select_vodka", "select_gin", "select_whisky", "add_syrup", "add_lemon", "add_soda", "add_ice", "stir", "reset"].includes(action)) {
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
