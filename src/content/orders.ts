export interface OrderTemplate {
  id: string;
  guestId?: string; // Optional binding to specific guest
  moodText: string;
  targetParams: {
    amplitude: number;
    periodLevel: number;
    phaseStep: number;
    edgeSharpness: number;
    noiseLevel: number;
    harmonics: number;
    decay: number;
    baseShape: "sine" | "triangle" | "square" | "sawtooth";
  };
  difficulty: number;
  allowVariance: number;
  rewardBase: number;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getWeightedBaseShape(day: number): "sine" | "triangle" | "square" | "sawtooth" {
  const roll = Math.random() * 100;

  if (day <= 2) {
    if (roll < 35) return "sine";
    if (roll < 65) return "triangle";
    if (roll < 95) return "square";
    return "sawtooth";
  }

  if (day === 3) {
    if (roll < 30) return "sine";
    if (roll < 55) return "triangle";
    if (roll < 80) return "square";
    return "sawtooth";
  }

  const shapes: ("sine" | "triangle" | "square" | "sawtooth")[] = ["sine", "triangle", "square", "sawtooth"];
  return shapes[getRandomInt(0, shapes.length - 1)];
}

export function generateProceduralOrder(day: number, guestId?: string): OrderTemplate {
  const baseShape = getWeightedBaseShape(day);

  // Base params
  let amplitude = getRandomInt(30, 80);
  let periodLevel = getRandomInt(4, 12);
  let phaseStep = getRandomInt(0, 15);

  let edgeSharpness = 0;
  let noiseLevel = 0;
  let harmonics = 0;
  let decay = 50; // Default decay

  let difficulty = 1;
  let moodText = "";

  if (day <= 2) {
    // Day 1-2: Basic Wave
    difficulty = 1;
    let shapeDesc = "";
    if (baseShape === 'sine') shapeDesc = "柔和";
    else if (baseShape === 'triangle') shapeDesc = "清爽";
    else if (baseShape === 'square') shapeDesc = "猛烈";
    else shapeDesc = "带有脉冲冲击感";
    moodText = `想要一杯基础的${shapeDesc}饮品。`;
  } else if (day <= 4) {
    // Day 3-4: Introduce one advanced dimension gently
    difficulty = 2;
    const advancedType = getRandomInt(0, 1);
    if (advancedType === 0) {
      edgeSharpness = getRandomInt(20, 45);
      moodText = `想要一杯带点锋利边缘感的特调。`;
    } else {
      noiseLevel = getRandomInt(20, 45);
      moodText = `想要一杯带点刺激毛刺感的特调。`;
    }
  } else if (day <= 7) {
    // Day 5-7: Keep one advanced dimension, but push the range much harder
    difficulty = 2;
    const advancedType = getRandomInt(0, 1);
    decay = getRandomInt(40, 60);
    if (advancedType === 0) {
      edgeSharpness = getRandomInt(35, 70);
      moodText = `想要一杯边缘更锋利、尾韵更明显的特调。`;
    } else {
      noiseLevel = getRandomInt(35, 70);
      moodText = `想要一杯毛刺感更强、余波更躁动的特调。`;
    }
  } else {
    // Day 8+: Complex combination
    difficulty = 3;
    edgeSharpness = getRandomInt(25, 65);
    noiseLevel = getRandomInt(25, 65);
    harmonics = getRandomInt(30, 80);
    decay = getRandomInt(20, 80);
    moodText = `给我来一杯极致复杂的混合波形！需要抚平多余的毛刺。`;
  }

  return {
    id: `order_day${day}_${Date.now()}`,
    guestId,
    moodText,
    targetParams: {
      amplitude,
      periodLevel,
      phaseStep,
      edgeSharpness,
      noiseLevel,
      harmonics,
      decay,
      baseShape,
    },
    difficulty,
    allowVariance: 0,
    rewardBase: 20 + difficulty * 10,
  };
}
