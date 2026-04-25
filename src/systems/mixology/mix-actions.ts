export type MixActionType =
  | "select_spirit"
  | "pour"
  | "add_syrup"
  | "add_ice"
  | "stir"
  | "add_soda"
  | "submit"
  | "reset";

export type MixAction = {
  type: MixActionType;
  value?: number;
};
