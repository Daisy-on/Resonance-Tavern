export function calcMseScore(target: number[], actual: number[]): number {
  if (target.length === 0 || target.length !== actual.length) {
    return 0;
  }

  let mse = 0;
  for (let i = 0; i < target.length; i += 1) {
    const d = target[i] - actual[i];
    mse += d * d;
  }
  mse /= target.length;
  const score = Math.max(0, Math.min(100, 100 - mse * 120));
  return score;
}
