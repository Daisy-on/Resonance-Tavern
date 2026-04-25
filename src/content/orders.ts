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

export function generateProceduralOrder(day: number, guestId?: string): OrderTemplate {
  const shapes: ("sine" | "triangle" | "square" | "sawtooth")[] = ["sine", "triangle", "square", "sawtooth"];
  const baseShape = shapes[getRandomInt(0, 3)];

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
  } else if (day <= 7) {
    // Day 3-7: Single advanced dimension
    difficulty = 2;
    const advancedType = getRandomInt(0, 1);
    if (advancedType === 0) {
      edgeSharpness = getRandomInt(30, 70);
      moodText = `想要一杯带点锋利边缘感的特调。`;
    } else {
      noiseLevel = getRandomInt(30, 70);
      moodText = `想要一杯带点刺激毛刺感的特调。`;
    }
  } else {
    // Day 8+: Complex combination
    difficulty = 3;
    edgeSharpness = getRandomInt(20, 60);
    noiseLevel = getRandomInt(20, 60);
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
    rewardBase: 30 + difficulty * 15,
  };
}
