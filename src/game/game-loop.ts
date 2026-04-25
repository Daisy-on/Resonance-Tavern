import type { GameState } from "./game-state";

type GameLoopInput = {
  canvas: HTMLCanvasElement;
  state: GameState;
};

export function createGameLoop(input: GameLoopInput) {
  const ctx = input.canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available");
  }

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

  const render = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0f111a";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#73f2ff";
    ctx.font = "18px Segoe UI";
    ctx.fillText("Cyber Resonance Bar - Native TS + Canvas", 20, 36);
    ctx.fillText(`Day: ${input.state.day}`, 20, 68);
    ctx.fillText(`Money: ${input.state.resources.money}`, 20, 96);
    ctx.fillText(`Power: ${input.state.resources.power}`, 20, 124);
    ctx.fillText(`Rating: ${input.state.resources.rating}`, 20, 152);
  };

  const tick = () => {
    render();
    requestAnimationFrame(tick);
  };

  return {
    start() {
      resize();
      window.addEventListener("resize", resize);
      tick();
    },
  };
}
