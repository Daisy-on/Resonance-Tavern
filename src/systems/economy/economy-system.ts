import type { GameState } from "../../game/game-state";
import { SpiritsDB } from "../../content/spirits";
import { AdditivesDB } from "../../content/ingredients";

function getRentByDay(day: number): number {
  if (day <= 3) return 20;
  if (day <= 7) return 45;
  return 70;
}

function getScoreBonus(state: GameState, score: number): number {
  const table = state.balanceConfig.scoreBonusTable;
  if (score >= 95) return table.perfect;
  if (score >= 80) return table.high;
  if (score >= 60) return table.normal;
  if (score >= 40) return table.low;
  return table.fail;
}

export function applyIngredientCost(state: GameState, ingredientId: string): {
  moneyCost: number;
  powerCost: number;
} {
  const ingredient = SpiritsDB[ingredientId] ?? AdditivesDB[ingredientId];
  if (!ingredient) return { moneyCost: 0, powerCost: 0 };

  const moneyCost = ingredient.unitCost ?? 0;
  const powerCost = ingredient.powerCost ?? 0;

  state.resources.money -= moneyCost;
  state.resources.power -= powerCost;
  state.dailyLedger.ingredientCostToday += moneyCost;
  state.dailyLedger.powerFromIceToday += powerCost;

  return { moneyCost, powerCost };
}

export function applyOrderIncome(state: GameState, score: number): number {
  const income = Math.max(0, state.balanceConfig.baseOrderPrice + getScoreBonus(state, score));
  state.resources.money += income;
  state.dailyLedger.orderIncomeToday += income;
  state.dailyLedger.ordersToday += 1;
  return income;
}

export function applyOrderRating(state: GameState, score: number): number {
  let delta = 0;
  if (score >= 95) delta = 5;
  else if (score >= 80) delta = 2;
  else if (score >= 60) delta = 0;
  else if (score >= 40) delta = -2;
  else delta = -5;

  if (state.day <= 3 && delta < 0) delta += 1; // 新手期降低惩罚
  if (state.day >= 8 && delta < 0) delta -= 1; // 后期加重惩罚

  state.resources.rating = Math.max(0, state.resources.rating + delta);
  return delta;
}

export function applyDailySettlement(state: GameState): {
  rent: number;
  netToday: number;
  isBankrupt: boolean;
} {
  const rent = getRentByDay(state.day);
  state.resources.money -= rent;
  state.dailyLedger.rentToday = rent;

  const netToday = state.dailyLedger.orderIncomeToday - state.dailyLedger.ingredientCostToday - rent;
  const isBankrupt = checkGameOver(state);
  return { rent, netToday, isBankrupt };
}

export function resetDailyLedger(state: GameState): void {
  state.dailyLedger = {
    ingredientCostToday: 0,
    orderIncomeToday: 0,
    rentToday: 0,
    powerFromIceToday: 0,
    ordersToday: 0,
  };
}

export function checkGameOver(state: GameState): boolean {
  return state.resources.money <= 0 || state.resources.power <= 0 || state.resources.rating <= 0;
}

// backward-compatible alias
export const checkBankrupt = checkGameOver;
