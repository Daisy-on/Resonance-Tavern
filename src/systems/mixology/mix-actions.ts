export type MixActionType = 
  | "select_vodka"
  | "select_gin"
  | "select_whisky"
  | "add_syrup"
  | "add_lemon"
  | "add_soda"
  | "add_ice"
  | "stir"
  | "shake"
  | "muddle"
  | "pour_precise"
  | "flame"
  | "reset";

export type MixAction = {
  type: MixActionType;
  amount?: number; // optionally passing how much
};
