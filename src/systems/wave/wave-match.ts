import type { DrinkState } from "../mixology/drink-state";
import { drinkStateToWaveParams, generateWave, type WaveParams } from "./wave-generator";
import type { OrderTemplate } from "../../content/orders";
import type { ScoreBreakdown } from "../../game/game-state";
import { clamp } from "../../utils/clamp";

export function calcMseScore(targetWave: number[], currentWave: number[]): number {
  if (targetWave.length !== currentWave.length) return 0;
  
  let mse = 0;
  for (let i = 0; i < targetWave.length; i++) {
    const diff = targetWave[i] - currentWave[i];
    mse += diff * diff;
  }
  mse /= targetWave.length;
  
  // 增加匹配难度：mse 通常在 0-0.5 之间
  let score = 100 - (mse * 150);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calcShiftedMse(targetWave: number[], currentWave: number[], shift: number): number {
  let mse = 0;
  const n = targetWave.length;
  for (let i = 0; i < n; i += 1) {
    const shiftedIndex = (i + shift + n) % n;
    const diff = targetWave[i] - currentWave[shiftedIndex];
    mse += diff * diff;
  }
  return mse / n;
}

function getPhaseToleranceSamples(order: OrderTemplate, waveLength: number): number {
  if (order.difficulty >= 5) return Math.round(waveLength * 0.02);
  if (order.difficulty >= 4) return Math.round(waveLength * 0.03);
  if (order.difficulty >= 3) return Math.round(waveLength * 0.04);
  return Math.round(waveLength * 0.06);
}

function getBestShiftMse(targetWave: number[], currentWave: number[], maxShift: number): { mse: number; shift: number } {
  let bestMse = Number.POSITIVE_INFINITY;
  let bestShift = 0;
  for (let shift = -maxShift; shift <= maxShift; shift += 1) {
    const mse = calcShiftedMse(targetWave, currentWave, shift);
    if (mse < bestMse) {
      bestMse = mse;
      bestShift = shift;
    }
  }
  return { mse: bestMse, shift: bestShift };
}

function calcParamScore(diff: number, scale: number): number {
  return clamp(100 - diff * scale, 0, 100);
}

function buildTextureValue(params: WaveParams): number {
  return params.noise * 0.6 + params.decay * 0.4 + params.harmonics * 0.8;
}

export function calcAdvancedScoreWithBreakdown(
  drink: DrinkState,
  order: OrderTemplate,
): { finalScore: number; breakdown: ScoreBreakdown; bestShift: number } {
  const targetParams = order.targetParams;
  const currentParams = drinkStateToWaveParams(drink);

  const targetWave = generateWave(targetParams);
  const currentWave = generateWave(currentParams);

  const shiftWindow = getPhaseToleranceSamples(order, targetWave.length);
  const bestShiftResult = getBestShiftMse(targetWave, currentWave, shiftWindow);
  const shapeScore = clamp(100 - bestShiftResult.mse * 140, 0, 100);
  const amplitudeScore = calcParamScore(Math.abs(targetParams.amplitude - currentParams.amplitude), 180);
  const frequencyScore = calcParamScore(Math.abs(targetParams.frequency - currentParams.frequency), 120);

  const normalizedShift = shiftWindow > 0 ? Math.abs(bestShiftResult.shift) / shiftWindow : 0;
  const phaseDiff = Math.abs(targetParams.phase - currentParams.phase);
  const phaseScore = clamp(100 - phaseDiff * 45 - normalizedShift * 20, 0, 100);

  const textureTarget = buildTextureValue(targetParams);
  const textureCurrent = buildTextureValue(currentParams);
  const textureScore = calcParamScore(Math.abs(textureTarget - textureCurrent), 90);

  const finalScore =
    shapeScore * 0.45 +
    amplitudeScore * 0.15 +
    frequencyScore * 0.15 +
    phaseScore * 0.15 +
    textureScore * 0.1;

  return {
    finalScore: Math.round(clamp(finalScore, 0, 100)),
    breakdown: {
      shape: Math.round(shapeScore),
      amplitude: Math.round(amplitudeScore),
      frequency: Math.round(frequencyScore),
      phase: Math.round(phaseScore),
      texture: Math.round(textureScore),
    },
    bestShift: bestShiftResult.shift,
  };
}

// 兼容旧调用
export function calcAdvancedScore(drink: DrinkState, order: OrderTemplate): number {
  return calcAdvancedScoreWithBreakdown(drink, order).finalScore;
}
