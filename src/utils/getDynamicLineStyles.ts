import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

/**
 * Calcule les styles CSS pour positionner dynamiquement un conteneur de ligne
 * entre deux cercles en tenant compte des custom_positions
 */
export function getDynamicLineContainerStyles(
  fromCircle: "solar" | "grid" | "home" | "battery",
  toCircle: "solar" | "grid" | "home" | "battery",
  config: PowerFlowCardPlusConfig
): string {
  // Si aucune position personnalisée, retourner vide (utiliser le style par défaut)
  const fromPos = config.custom_positions?.[fromCircle];
  const toPos = config.custom_positions?.[toCircle];

  if (!fromPos && !toPos) {
    return "";
  }

  // Si les deux cercles ont des positions personnalisées, on peut calculer précisément
  // Sinon on utilise les positions par défaut

  // Pour l'instant, on retourne vide et on utilisera une autre approche
  // Cette fonction sera étendue quand on aura le drag & drop complet
  return "";
}

/**
 * Vérifie si un cercle a une position personnalisée
 */
export function hasCustomPosition(
  circle: "solar" | "grid" | "home" | "battery",
  config: PowerFlowCardPlusConfig
): boolean {
  const pos = config.custom_positions?.[circle];
  return !!(pos && (pos.top !== undefined || pos.left !== undefined));
}
