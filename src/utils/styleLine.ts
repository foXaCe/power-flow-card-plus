import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

export const styleLine = (power: number, config: PowerFlowCardPlusConfig): string => {
  // Considérer les flux < 1W comme étant à 0 pour éviter les animations sur les flux négligeables
  if (power > 1) return "";

  const displayZeroMode = config?.display_zero_lines?.mode;
  let styleclass = "no-flow "; // Ajouter une classe pour désactiver les animations

  if (displayZeroMode === "show" || displayZeroMode === undefined) return styleclass;

  if (displayZeroMode === "transparency" || displayZeroMode === "custom") {
    const transparency = config?.display_zero_lines?.transparency;
    if (transparency ?? 50 > 0) styleclass += "transparency ";
  }
  if (displayZeroMode === "grey_out" || displayZeroMode === "custom") {
    styleclass += "grey";
  }
  return styleclass;
};
