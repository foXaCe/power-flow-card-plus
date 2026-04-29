import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

/**
 * Vérifie si un cercle a une position personnalisée
 */
export function hasCustomPosition(circle: "solar" | "grid" | "home" | "battery", config: PowerFlowCardPlusConfig): boolean {
  const pos = config.custom_positions?.[circle];
  return !!(pos && (pos.top !== undefined || pos.left !== undefined));
}
