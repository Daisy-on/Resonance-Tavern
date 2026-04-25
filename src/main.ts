import "./styles.css";
import { createGameLoop } from "./game/game-loop";
import { createDefaultGameState } from "./game/game-state";
import { loadGameState } from "./systems/save/save-system";

const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
if (!canvas) {
  throw new Error("Missing #game-canvas node");
}

const game = createGameLoop({
  canvas,
  state: loadGameState() ?? createDefaultGameState(),
});

game.start();
