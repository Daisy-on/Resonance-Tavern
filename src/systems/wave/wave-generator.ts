export type WaveParams = {
  amplitude: number;
  frequency: number;
  decay: number;
  noise: number;
};

export function generateWave(params: WaveParams, sampleCount = 128): number[] {
  const out: number[] = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleCount;
    const base = Math.sin(t * Math.PI * 2 * params.frequency) * params.amplitude;
    const damped = base * (1 - t * params.decay);
    const noise = (Math.random() - 0.5) * params.noise;
    out.push(damped + noise);
  }
  return out;
}
