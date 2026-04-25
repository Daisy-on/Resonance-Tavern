export interface OrderTemplate {
  id: string;
  guestId?: string; // Optional binding to specific guest
  moodText: string;
  targetParams: {
    amplitude: number;
    frequency: number;
    decay: number;
    noise: number;
    symmetry: number;
    baseShape: "sine" | "triangle" | "square";
  };
  difficulty: number;
  allowVariance: number;
  rewardBase: number;
}

export const OrdersDB: OrderTemplate[] = [
  {
    id: "order_01",
    guestId: "mechanic_01",
    moodText: "今天太累了，来点温暖平滑的。不要加冰，越稳越好。",
    targetParams: {
      amplitude: 0.6,
      frequency: 1.2,
      decay: 0.1, // Warm
      noise: 0.0,
      symmetry: 1.0,
      baseShape: "sine",
    },
    allowVariance: 0.05,
    rewardBase: 30,
    difficulty: 1,
  },
  {
    id: "order_02",
    guestId: "hacker_01",
    moodText: "我需要刺激！大量气泡，高频毛刺，冰镇的！",
    targetParams: {
      amplitude: 0.8,
      frequency: 2.0,
      decay: 0.5, // Ice
      noise: 0.8,
      symmetry: 1.0,
      baseShape: "triangle",
    },
    allowVariance: 0.1,
    rewardBase: 40,
    difficulty: 2,
  },
  {
    id: "order_03",
    guestId: "cop_01",
    moodText: "来杯烈酒，纯正的方波，带点酸味。",
    targetParams: {
      amplitude: 1.0,
      frequency: 1.0,
      decay: 0.2,
      noise: 0.1,
      symmetry: 0.8, // Acid
      baseShape: "square",
    },
    allowVariance: 0.05,
    rewardBase: 50,
    difficulty: 2,
  },
];

export function getRandomGuestOrder(): OrderTemplate {
  return OrdersDB[Math.floor(Math.random() * OrdersDB.length)];
}
