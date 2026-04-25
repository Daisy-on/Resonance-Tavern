export type EconomySnapshot = {
  money: number;
  power: number;
  rating: number;
};

export function applyOrderCost(snapshot: EconomySnapshot): EconomySnapshot {
  return {
    ...snapshot,
    power: snapshot.power - 1,
  };
}
