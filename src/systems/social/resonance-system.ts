export type ResonanceReward = {
  money: number;
  power: number;
  rating: number;
};

type ResonancePayload = {
  s: number; // score
  d: number; // difficulty
  h: string; // hash/salt to make it look unique
};

const PREFIX = "CRB-";
const SALT_LENGTH = 4;

function generateSalt(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a resonance code based on the order's score and difficulty
 */
export function generateResonanceCode(score: number, difficulty: number): string {
  const payload: ResonancePayload = {
    s: Math.round(score),
    d: difficulty,
    h: generateSalt(SALT_LENGTH),
  };
  
  const jsonStr = JSON.stringify(payload);
  const base64 = btoa(jsonStr);
  return `${PREFIX}${base64}`;
}

/**
 * Parse a resonance code and return the calculated rewards, or null if invalid
 */
export function parseResonanceCode(code: string): ResonanceReward | null {
  try {
    if (!code.startsWith(PREFIX)) return null;
    
    const base64 = code.slice(PREFIX.length);
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr) as ResonancePayload;
    
    if (typeof payload.s !== 'number' || typeof payload.d !== 'number') {
      return null;
    }
    
    // Validate bounds (score 0-100, difficulty 1+)
    if (payload.s < 0 || payload.s > 100 || payload.d < 1) {
      return null;
    }

    // Dynamic reward calculation based on score and difficulty
    // High difficulty and high score give more rewards
    // The base score for generation should be >= 95, but we parse gracefully
    const money = 30 + payload.d * 15 + Math.max(0, payload.s - 95) * 2;
    const power = 10 + payload.d * 3;
    const rating = 10 + Math.max(0, payload.s - 95);
    
    return {
      money: Math.round(money),
      power: Math.round(power),
      rating: Math.round(rating),
    };
  } catch (e) {
    return null;
  }
}
