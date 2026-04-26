import type { GameState } from "../../game/game-state";
import { SpiritsDB } from "../../content/spirits";
import { AdditivesDB } from "../../content/ingredients";

function getRentByDay(day: number): number {
  if (day <= 3) return 25;
  if (day <= 7) return 55;
  return 85;
}

function getScoreBonus(state: GameState, score: number): number {
  if (state.day <= 3) {
    if (score >= 95) return 12;
    if (score >= 80) return 6;
    if (score >= 60) return 2;
    if (score >= 40) return -2;
    return -8;
  }

  if (state.day <= 7) {
    if (score >= 95) return 18;
    if (score >= 80) return 10;
    if (score >= 60) return 2;
    if (score >= 40) return -6;
    return -14;
  }

  if (score >= 95) return 26;
  if (score >= 80) return 14;
  if (score >= 60) return 0;
  if (score >= 40) return -10;
  return -20;
}

export function applyIngredientCost(state: GameState, ingredientId: string): {
  moneyCost: number;
  powerCost: number;
} {
  const ingredient = SpiritsDB[ingredientId] ?? AdditivesDB[ingredientId];
  if (!ingredient) return { moneyCost: 0, powerCost: 0 };

  let moneyCost = ingredient.unitCost ?? 0;
  let powerCost = ingredient.powerCost ?? 0;

  if (state.activeEvent === "ice_shortage" && ingredientId === "ice_cube") {
    powerCost *= 2;
  }

  state.resources.money -= moneyCost;
  state.resources.power -= powerCost;
  state.dailyLedger.ingredientCostToday += moneyCost;
  state.dailyLedger.powerFromIceToday += powerCost;

  return { moneyCost, powerCost };
}

export function applyOrderIncome(state: GameState, score: number): number {
  const basePrice = state.currentOrder?.rewardBase ?? state.balanceConfig.baseOrderPrice;
  const income = Math.max(0, basePrice + getScoreBonus(state, score));
  state.resources.money += income;
  state.dailyLedger.orderIncomeToday += income;
  state.dailyLedger.ordersToday += 1;
  return income;
}

export function applyOrderRating(state: GameState, score: number): number {
  let delta = 0;
  if (state.day <= 3) {
    if (score >= 95) delta = 4;
    else if (score >= 80) delta = 2;
    else if (score >= 60) delta = 0;
    else if (score >= 40) delta = -1;
    else delta = -4;
  } else if (state.day <= 7) {
    if (score >= 95) delta = 5;
    else if (score >= 80) delta = 2;
    else if (score >= 60) delta = -1;
    else if (score >= 40) delta = -4;
    else delta = -7;
  } else {
    if (score >= 95) delta = 6;
    else if (score >= 80) delta = 3;
    else if (score >= 60) delta = -2;
    else if (score >= 40) delta = -6;
    else delta = -9;
  }

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

  const MAX_POWER = 30;
  let powerCost = 0;
  if (state.resources.power < MAX_POWER) {
    powerCost = MAX_POWER - state.resources.power;
    state.resources.money -= powerCost;
    state.resources.power = MAX_POWER;
  }

  const netToday = state.dailyLedger.orderIncomeToday - state.dailyLedger.ingredientCostToday - rent - powerCost;
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
