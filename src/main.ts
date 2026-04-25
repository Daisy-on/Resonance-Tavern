import "./styles.css";
import { createGameLoop } from "./game/game-loop";
import { createDefaultGameState } from "./game/game-state";

const mount = document.getElementById("app");
if (!mount) {
  throw new Error("Missing #app mount node");
}

const canvas = document.createElement("canvas");
mount.appendChild(canvas);

const game = createGameLoop({
  canvas,
  state: createDefaultGameState(),
});

game.start();
