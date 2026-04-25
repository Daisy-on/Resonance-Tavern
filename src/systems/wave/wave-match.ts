import type { DrinkState } from "../mixology/drink-state";
import { drinkStateToWaveParams, generateWave, quantizeWaveParams, type WaveParams } from "./wave-generator";
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
  // Full-length search to guarantee "can align if physically reachable".
  // We keep penalty via shift cost instead of forbidding alignment.
  return Math.round(waveLength * 0.5);
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

function circularPhaseStepDiff(a: number, b: number): number {
  // phaseStep is 0 to 15. The circular difference is at most 8.
  const diff = Math.abs(a - b);
  return Math.min(diff, 16 - diff);
}

export function calcAdvancedScoreWithBreakdown(
  drink: DrinkState,
  order: OrderTemplate,
  activeEvent?: string | null
): { finalScore: number; breakdown: ScoreBreakdown; bestShift: number } {
  const targetParams = quantizeWaveParams(order.targetParams as WaveParams);
  const currentParams = quantizeWaveParams(drinkStateToWaveParams(drink));

  const targetWave = generateWave(targetParams);
  const currentWave = generateWave(currentParams);

  let shiftWindow = getPhaseToleranceSamples(order, targetWave.length);
  if (activeEvent === "rainy_day") {
    shiftWindow = Math.floor(shiftWindow * 1.5);
  }
  
  // Bitters apply phase tolerance
  if (drink.actions.some(a => a.type === "add_bitters")) {
    shiftWindow = Math.floor(shiftWindow * 1.8);
  }

  const bestShiftResult = getBestShiftMse(targetWave, currentWave, shiftWindow);
  
  // 1. Shape: baseShape match + Shifted MSE
  const baseShapePenalty = targetParams.baseShape !== currentParams.baseShape ? 30 : 0;
  const shapeScore = clamp(100 - bestShiftResult.mse * 170 - baseShapePenalty, 0, 100);
  
  // 2. Amplitude: scale is 0-100, so diff can be up to 100.
  const amplitudeScore = calcParamScore(Math.abs(targetParams.amplitude - currentParams.amplitude), 1.5);
  
  // 3. Period (frequency): periodLevel is 1-16
  const periodScore = calcParamScore(Math.abs(targetParams.periodLevel - currentParams.periodLevel), 10);
  
  // 4. Phase: phaseStep circular diff (max 8)
  const normalizedShift = shiftWindow > 0 ? Math.abs(bestShiftResult.shift) / shiftWindow : 0;
  const phaseStepDiff = circularPhaseStepDiff(targetParams.phaseStep, currentParams.phaseStep);
  const phaseScore = clamp(100 - phaseStepDiff * 8 - normalizedShift * 15, 0, 100);
  
  // 5. Edge Sharpness: scale is 0-100
  const edgeScore = calcParamScore(Math.abs(targetParams.edgeSharpness - currentParams.edgeSharpness), 1.5);
  
  // 6. Noise: scale is 0-100
  const noiseScore = calcParamScore(Math.abs(targetParams.noiseLevel - currentParams.noiseLevel), 1.5);

  const finalScore =
    shapeScore * 0.40 +
    amplitudeScore * 0.15 +
    periodScore * 0.15 +
    phaseScore * 0.10 +
    edgeScore * 0.10 +
    noiseScore * 0.10;

  return {
    finalScore: Math.round(clamp(finalScore, 0, 100)),
    breakdown: {
      shape: Math.round(shapeScore),
      amplitude: Math.round(amplitudeScore),
      period: Math.round(periodScore),
      phase: Math.round(phaseScore),
      edge: Math.round(edgeScore),
      noise: Math.round(noiseScore),
    },
    bestShift: bestShiftResult.shift,
  };
}

// 兼容旧调用
export function calcAdvancedScore(drink: DrinkState, order: OrderTemplate): number {
  return calcAdvancedScoreWithBreakdown(drink, order).finalScore;
}
