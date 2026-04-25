import type { DrinkState } from "../mixology/drink-state";

export type WaveParams = {
  amplitude: number;
  frequency: number;
  decay: number;
  noise: number;
  symmetry: number;
  phase: number;
  harmonics: number;
  baseShape: "sine" | "triangle" | "square";
};

const FREQUENCY_MIN = 0.75;
const FREQUENCY_MAX = 2.5;
const FREQUENCY_STEPS = 16;
const PHASE_STEPS = 16;
const TAU = Math.PI * 2;

function quantize(value: number, min: number, max: number, steps: number): number {
  const clamped = Math.max(min, Math.min(max, value));
  const t = (clamped - min) / (max - min);
  const snapped = Math.round(t * (steps - 1)) / (steps - 1);
  return min + snapped * (max - min);
}

function normalizeAngle(angle: number): number {
  let out = angle % TAU;
  if (out < 0) out += TAU;
  return out;
}

export function quantizeWaveParams(params: WaveParams): WaveParams {
  return {
    ...params,
    frequency: quantize(params.frequency, FREQUENCY_MIN, FREQUENCY_MAX, FREQUENCY_STEPS),
    phase: quantize(normalizeAngle(params.phase), 0, TAU, PHASE_STEPS),
  };
}

export function drinkStateToWaveParams(drink: DrinkState): WaveParams {
  return quantizeWaveParams({
    amplitude: 0.4 + drink.strength / 80,
    frequency: 1.0 + drink.sweetness / 35,
    decay: 0.1 + (100 - drink.temperature) / 150,
    noise: drink.sparkle / 120,
    symmetry: 1.0 - drink.acidity / 140, // 1.0 is symmetric
    phase: drink.phaseOffset,
    harmonics: Math.max(0, Math.min(1, (drink.blend + drink.oxidation * 0.5) / 120)),
    baseShape: drink.baseWaveShape || "sine",
  });
}

export function generateWave(params: WaveParams, sampleCount = 128): number[] {
  const q = quantizeWaveParams(params);
  const out: number[] = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleCount; // 0 to 1
    const phase = t * TAU * q.frequency + q.phase;
    
    let base = 0;
    if (q.baseShape === "sine") {
      base = Math.sin(phase);
    } else if (q.baseShape === "triangle") {
      base = Math.abs((phase / Math.PI) % 2 - 1) * 2 - 1;
    } else if (q.baseShape === "square") {
      base = Math.sin(phase) >= 0 ? 1 : -1;
    }

    // Keep period stable while expressing acidity via cycle-local asymmetry.
    const asymmetry = Math.max(-0.35, Math.min(0.35, (1 - q.symmetry) * 0.55));
    // Use local phase (without q.phase) to ensure distortion stays relative to shape, not screen.
    const localPhase = t * TAU * q.frequency;
    const asymSkew = 1 + asymmetry * Math.sin(localPhase);
    base *= asymSkew;

    base *= q.amplitude;

    // Harmonics: adds higher-frequency detail for late-game complexity
    const harmonic2 = Math.sin(phase * 2) * 0.5;
    const harmonic3 = Math.sin(phase * 3) * 0.25;
    const complexWave = base + (harmonic2 + harmonic3) * q.harmonics;
    
    // Decay: higher decay means wave shrinks faster towards the right
    const damped = complexWave * (1 - t * q.decay);
    
    // Noise: Use a deterministic pseudo-random value based on index to avoid jitter
    const pseudoRandom = Math.sin(i * 999.9) * 0.5 + 0.5;
    const noise = (pseudoRandom - 0.5) * q.noise;
    
    out.push(damped + noise);
  }
  return out;
}
