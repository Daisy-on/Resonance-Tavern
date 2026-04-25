export type ResourceState = {
  money: number;
  power: number;
  rating: number;
};

export type GameState = {
  day: number;
  resources: ResourceState;
};

export function createDefaultGameState(): GameState {
  return {
    day: 1,
    resources: {
      money: 120,
      power: 18,
      rating: 40,
    },
  };
}
