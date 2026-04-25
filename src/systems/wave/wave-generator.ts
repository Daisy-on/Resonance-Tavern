import type { DrinkState } from "../mixology/drink-state";

export type WaveParams = {
  amplitude: number;       // 0-100
  periodLevel: number;     // 1-16
  phaseStep: number;       // 0-15
  edgeSharpness: number;   // 0-100
  noiseLevel: number;      // 0-100
  harmonics: number;       // 0-100
  decay: number;           // 0-100
  baseShape: "sine" | "triangle" | "square" | "sawtooth";
};

const FREQUENCY_MIN = 0.75;
const FREQUENCY_MAX = 2.5;
const TAU = Math.PI * 2;

export function quantizeWaveParams(params: WaveParams): WaveParams {
  return {
    ...params,
    amplitude: Math.max(0, Math.min(100, params.amplitude)),
    periodLevel: Math.max(1, Math.min(16, Math.round(params.periodLevel))),
    phaseStep: Math.max(0, Math.min(15, Math.round(params.phaseStep))),
    edgeSharpness: Math.max(0, Math.min(100, params.edgeSharpness)),
    noiseLevel: Math.max(0, Math.min(100, params.noiseLevel)),
    harmonics: Math.max(0, Math.min(100, params.harmonics)),
    decay: Math.max(0, Math.min(100, params.decay)),
  };
}

export function drinkStateToWaveParams(drink: DrinkState): WaveParams {
  return quantizeWaveParams({
    amplitude: drink.amplitude,
    periodLevel: drink.periodLevel,
    phaseStep: drink.phaseStep,
    edgeSharpness: drink.edgeSharpness,
    noiseLevel: drink.noiseLevel,
    harmonics: drink.harmonics,
    decay: drink.decay,
    baseShape: drink.baseWaveShape || "sine",
  });
}

export function generateWave(params: WaveParams, sampleCount = 128): number[] {
  const q = quantizeWaveParams(params);
  const out: number[] = [];

  // map periodLevel (1-16) to frequency (FREQUENCY_MAX to FREQUENCY_MIN)
  const freqRange = FREQUENCY_MAX - FREQUENCY_MIN;
  const frequency = FREQUENCY_MAX - ((q.periodLevel - 1) / 15) * freqRange;

  const phase = q.phaseStep * (TAU / 16);
  const visualAmplitude = 0.2 + (q.amplitude / 100) * 1.4; // 0.2 to 1.6
  const asymmetry = (q.edgeSharpness / 100) * 0.45; // 0 to 0.45
  const noiseMagnitude = (q.noiseLevel / 100) * 0.8; // 0 to 0.8
  const harmonicsMagnitude = q.harmonics / 100; // 0 to 1.0
  const decayMagnitude = (q.decay / 100) * 0.9; // 0 to 0.9

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleCount; // 0 to 1
    const currentPhase = t * TAU * frequency + phase;

    let base = 0;
    if (q.baseShape === "sine") {
      base = Math.sin(currentPhase);
    } else if (q.baseShape === "triangle") {
      base = Math.abs((currentPhase / Math.PI) % 2 - 1) * 2 - 1;
    } else if (q.baseShape === "square") {
      base = Math.sin(currentPhase) >= 0 ? 1 : -1;
    } else if (q.baseShape === "sawtooth") {
      // 锯齿脉冲波：平坦底座 + 弧形上升 + 垂直下降
      let cycle = (currentPhase / TAU) % 1;
      if (cycle < 0) cycle += 1; // 处理负相位

      if (cycle < 0.5) {
        base = -1; // 平坦底座
      } else {
        // 从 -1 弧形上升到 1 (使用四分之一正弦曲线模拟充电过程)
        const t = (cycle - 0.5) * 2; // 0 to 1
        base = -1 + 2 * Math.sin(t * Math.PI / 2);
      }
    }

    // Edge Sharpness (Asymmetry)
    const localPhase = t * TAU * frequency;
    const asymSkew = 1 + asymmetry * Math.sin(localPhase);
    base *= asymSkew;

    base *= visualAmplitude;

    // Harmonics
    const harmonic2 = Math.sin(currentPhase * 2) * 0.5;
    const harmonic3 = Math.sin(currentPhase * 3) * 0.25;
    const complexWave = base + (harmonic2 + harmonic3) * harmonicsMagnitude;

    // Decay
    const damped = complexWave * (1 - t * decayMagnitude);

    // Noise
    const pseudoRandom = Math.sin(i * 999.9) * 0.5 + 0.5;
    const noise = (pseudoRandom - 0.5) * noiseMagnitude;

    out.push(damped + noise);
  }
  return out;
}
