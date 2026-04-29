import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

export interface CirclePositions {
  solar: { x: number; y: number };
  grid: { x: number; y: number };
  home: { x: number; y: number };
  battery: { x: number; y: number };
}

/**
 * Calcule les positions réelles des cercles en fonction de custom_positions
 * Les positions par défaut sont en pourcentage de la carte
 */
export function getCirclePositions(config: PowerFlowCardPlusConfig, cardWidth: number, cardHeight: number): CirclePositions {
  // Positions par défaut (en px depuis le centre de la carte)
  const defaults = {
    solar: { x: cardWidth * 0.5, y: cardHeight * 0.15 }, // Haut centre
    grid: { x: cardWidth * 0.15, y: cardHeight * 0.5 }, // Gauche centre
    home: { x: cardWidth * 0.85, y: cardHeight * 0.5 }, // Droite centre
    battery: { x: cardWidth * 0.5, y: cardHeight * 0.85 }, // Bas centre
  };

  const positions: CirclePositions = { ...defaults };

  // Appliquer les custom_positions si elles existent
  if (config.custom_positions) {
    const circles: Array<keyof CirclePositions> = ["solar", "grid", "home", "battery"];
    for (const key of circles) {
      const custom = config.custom_positions[key];
      if (custom) {
        if (custom.left !== undefined) {
          positions[key].x = custom.left;
        }
        if (custom.top !== undefined) {
          positions[key].y = custom.top;
        }
      }
    }
  }

  return positions;
}
