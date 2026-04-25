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
    phase: number;
    harmonics: number;
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
      phase: 0,
      harmonics: 0.05,
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
      phase: 0.5,
      harmonics: 0.2,
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
      phase: -0.3,
      harmonics: 0.15,
      baseShape: "square",
    },
    allowVariance: 0.05,
    rewardBase: 50,
    difficulty: 2,
  },
  {
    id: "order_04",
    moodText: "来一杯节奏偏移的，起伏别太大，但要有明显错拍感。",
    targetParams: {
      amplitude: 0.55,
      frequency: 1.4,
      decay: 0.25,
      noise: 0.1,
      symmetry: 1.0,
      phase: 1.1,
      harmonics: 0.35,
      baseShape: "sine",
    },
    allowVariance: 0.08,
    rewardBase: 58,
    difficulty: 3,
  },
  {
    id: "order_05",
    moodText: "我想要更复杂的谐波，别太甜，波形尾部要干净。",
    targetParams: {
      amplitude: 0.75,
      frequency: 1.7,
      decay: 0.35,
      noise: 0.2,
      symmetry: 0.95,
      phase: 0.8,
      harmonics: 0.55,
      baseShape: "triangle",
    },
    allowVariance: 0.1,
    rewardBase: 70,
    difficulty: 4,
  },
  {
    id: "order_06",
    moodText: "给我极限款：高谐波、高错相、但收尾必须稳住。",
    targetParams: {
      amplitude: 0.9,
      frequency: 2.1,
      decay: 0.45,
      noise: 0.35,
      symmetry: 0.9,
      phase: 1.4,
      harmonics: 0.75,
      baseShape: "square",
    },
    allowVariance: 0.12,
    rewardBase: 88,
    difficulty: 5,
  },
];

export function getRandomGuestOrder(): OrderTemplate {
  return OrdersDB[Math.floor(Math.random() * OrdersDB.length)];
}
