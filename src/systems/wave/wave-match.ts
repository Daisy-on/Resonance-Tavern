import type { DrinkState } from "../mixology/drink-state";
import { drinkStateToWaveParams, generateWave, type WaveParams } from "./wave-generator";
import type { OrderTemplate } from "../../content/orders";

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

// 多维度加权评分 (P1 升级版)
export function calcAdvancedScore(drink: DrinkState, order: OrderTemplate): number {
  const targetParams = order.targetParams;
  const currentParams = drinkStateToWaveParams(drink);

  const targetWave = generateWave(targetParams);
  const currentWave = generateWave(currentParams);

  // 1. 基础波形匹配 (MSE) - 权重 70%
  const shapeScore = calcMseScore(targetWave, currentWave);

  // 2. 参数维度匹配 - 权重 30%
  let paramScore = 100;
  
  // 高频噪声惩罚/奖励
  const noiseDiff = Math.abs(targetParams.noise - currentParams.noise);
  paramScore -= noiseDiff * 200; // noise (0-1)

  // 衰减度匹配 (温度控制)
  const decayDiff = Math.abs(targetParams.decay - currentParams.decay);
  paramScore -= decayDiff * 100;

  // 不对称性 (酸度)
  const symmetryDiff = Math.abs(targetParams.symmetry - currentParams.symmetry);
  paramScore -= symmetryDiff * 100;

  paramScore = Math.max(0, Math.min(100, paramScore));

  const finalScore = (shapeScore * 0.7) + (paramScore * 0.3);
  return Math.max(0, Math.min(100, Math.round(finalScore)));
}
