import type { DrinkState } from "../mixology/drink-state";

export type WaveParams = {
  amplitude: number;
  frequency: number;
  decay: number;
  noise: number;
  symmetry: number;
  baseShape: "sine" | "triangle" | "square";
};

export function drinkStateToWaveParams(drink: DrinkState): WaveParams {
  return {
    amplitude: 0.4 + drink.strength / 80,
    frequency: 1.0 + drink.sweetness / 35,
    decay: 0.1 + (100 - drink.temperature) / 150,
    noise: drink.sparkle / 120,
    symmetry: 1.0 - drink.acidity / 140, // 1.0 is symmetric
    baseShape: drink.baseWaveShape || "sine",
  };
}

export function generateWave(params: WaveParams, sampleCount = 128): number[] {
  const out: number[] = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleCount; // 0 to 1
    const phase = t * Math.PI * 2 * params.frequency;
    
    let base = 0;
    if (params.baseShape === "sine") {
      base = Math.sin(phase);
    } else if (params.baseShape === "triangle") {
      base = Math.abs((phase / Math.PI) % 2 - 1) * 2 - 1;
    } else if (params.baseShape === "square") {
      base = Math.sin(phase) >= 0 ? 1 : -1;
    }

    base *= params.amplitude;
    
    // Decay: higher decay means wave shrinks faster towards the right
    const damped = base * (1 - t * params.decay);
    
    // Noise: Use a deterministic pseudo-random value based on index to avoid jitter
    const pseudoRandom = Math.sin(i * 999.9) * 0.5 + 0.5;
    const noise = (pseudoRandom - 0.5) * params.noise;
    
    out.push(damped + noise);
  }
  return out;
}
