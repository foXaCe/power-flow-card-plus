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
export function getCirclePositions(
  config: PowerFlowCardPlusConfig,
  cardWidth: number,
  cardHeight: number
): CirclePositions {
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
    if (config.custom_positions.solar) {
      if (config.custom_positions.solar.left !== undefined) {
        positions.solar.x = config.custom_positions.solar.left;
      }
      if (config.custom_positions.solar.top !== undefined) {
        positions.solar.y = config.custom_positions.solar.top;
      }
    }

    if (config.custom_positions.grid) {
      if (config.custom_positions.grid.left !== undefined) {
        positions.grid.x = config.custom_positions.grid.left;
      }
      if (config.custom_positions.grid.top !== undefined) {
        positions.grid.y = config.custom_positions.grid.top;
      }
    }

    if (config.custom_positions.home) {
      if (config.custom_positions.home.left !== undefined) {
        positions.home.x = config.custom_positions.home.left;
      }
      if (config.custom_positions.home.top !== undefined) {
        positions.home.y = config.custom_positions.home.top;
      }
    }

    if (config.custom_positions.battery) {
      if (config.custom_positions.battery.left !== undefined) {
        positions.battery.x = config.custom_positions.battery.left;
      }
      if (config.custom_positions.battery.top !== undefined) {
        positions.battery.y = config.custom_positions.battery.top;
      }
    }
  }

  return positions;
}
