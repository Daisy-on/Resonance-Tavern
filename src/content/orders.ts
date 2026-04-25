export interface OrderTemplate {
  id: string;
  moodText: string;
  targetParams: {
    amplitude: number;
    frequency: number;
    decay: number;
    noise: number;
    baseShape: "sine" | "triangle" | "square";
  };
  difficulty: number;
  allowVariance: number;
  rewardBase: number;
}

export const OrdersDB: OrderTemplate[] = [
  {
    id: "order_calm",
    moodText: "我需要冷静一下，频率越低越好，要冰的。",
    targetParams: { amplitude: 0.6, frequency: 1.0, decay: 0.8, noise: 0.0, baseShape: "sine" },
    difficulty: 1, allowVariance: 0.05, rewardBase: 20
  },
  {
    id: "order_spike",
    moodText: "今天太困了，给我最强烈的刺激，加点气泡最好！",
    targetParams: { amplitude: 0.9, frequency: 2.0, decay: 0.3, noise: 0.5, baseShape: "square" },
    difficulty: 2, allowVariance: 0.1, rewardBase: 25
  },
  {
    id: "order_complex",
    moodText: "想要点甜的，但不要太腻，要锐利一点的味道。",
    targetParams: { amplitude: 0.5, frequency: 1.8, decay: 0.5, noise: 0.1, baseShape: "triangle" },
    difficulty: 2, allowVariance: 0.05, rewardBase: 25
  }
];
