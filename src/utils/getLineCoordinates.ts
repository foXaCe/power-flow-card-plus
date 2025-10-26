import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";

/**
 * Calcule les coordonnées adaptatives pour les lignes SVG
 * en fonction de la taille des cercles et du mode compact
 */

// Constantes pour les tailles de cercles
const CIRCLE_DIAMETER_NORMAL = 80;
const CIRCLE_DIAMETER_COMPACT = 65;
const CIRCLE_RADIUS_NORMAL = CIRCLE_DIAMETER_NORMAL / 2; // 40px
const CIRCLE_RADIUS_COMPACT = CIRCLE_DIAMETER_COMPACT / 2; // 32.5px

// ViewBox du SVG
const SVG_VIEWBOX_SIZE = 100;

/**
 * Calcule le rayon du cercle en unités SVG (par rapport au viewBox de 100x100)
 * Le conteneur des lignes a une largeur de calc(100% - var(--size-circle-entity) * 2)
 * Dans le viewBox 100x100, nous devons calculer la proportion correcte
 */
function getCircleRadiusInSVGUnits(config: PowerFlowCardPlusConfig): number {
  const isCompact = config.compact_mode === true;
  const circleRadius = isCompact ? CIRCLE_RADIUS_COMPACT : CIRCLE_RADIUS_NORMAL;

  // Le SVG des lignes occupe l'espace entre les cercles
  // Dans le viewBox 100x100, le rayon doit être proportionnel
  // Pour un cercle de 80px dans un conteneur de ~470px max:
  // Le rayon en % = (40 / (470/2)) * 100 ≈ 17%
  // Mais comme le SVG est dimensionné différemment, on utilise un ratio empirique

  return isCompact ? 12 : 14; // Valeurs ajustées empiriquement
}

/**
 * Calcule les coordonnées pour les lignes verticales (solar/battery vers home)
 */
export function getVerticalLineCoords(
  config: PowerFlowCardPlusConfig,
  options: {
    hasGrid: boolean;
    hasBattery: boolean;
  }
): {
  startX: number;
  startY: number;
  verticalLength: number;
  curveControl: number;
  curveHeight: number;
} {
  const radius = getCircleRadiusInSVGUnits(config);
  const { hasGrid, hasBattery } = options;

  return {
    startX: hasBattery ? 55 : 50,
    startY: radius, // Commence au bord du cercle
    verticalLength: hasGrid ? 15 : 17,
    curveControl: hasBattery ? 30 : 35,
    curveHeight: hasBattery ? 30 : 35,
  };
}

/**
 * Calcule les coordonnées pour les lignes horizontales (grid vers home)
 */
export function getHorizontalLineCoords(
  config: PowerFlowCardPlusConfig,
  options: {
    hasSolar: boolean;
    hasBattery: boolean;
  }
): {
  startY: number;
} {
  const radius = getCircleRadiusInSVGUnits(config);
  const { hasSolar, hasBattery } = options;

  let yPosition = 50;
  if (hasBattery) {
    yPosition = 50;
  } else if (hasSolar) {
    yPosition = 56;
  } else {
    yPosition = 53;
  }

  return {
    startY: yPosition,
  };
}

/**
 * Génère le path SVG pour solar vers home
 */
export function getSolarToHomePath(
  config: PowerFlowCardPlusConfig,
  options: { hasGrid: boolean; hasBattery: boolean }
): string {
  const coords = getVerticalLineCoords(config, options);

  return `M${coords.startX},${coords.startY} v${coords.verticalLength} c0,${coords.curveControl} 10,${coords.curveControl} 30,${coords.curveControl} h25`;
}

/**
 * Génère le path SVG pour solar vers grid
 */
export function getSolarToGridPath(
  config: PowerFlowCardPlusConfig,
  options: { hasBattery: boolean }
): string {
  const radius = getCircleRadiusInSVGUnits(config);
  const { hasBattery } = options;

  const startX = hasBattery ? 45 : 50;
  const curveSize = hasBattery ? 30 : 35;

  return `M${startX},${radius} v15 c0,${curveSize} -10,${curveSize} -30,${curveSize} h-20`;
}

/**
 * Génère le path SVG pour battery vers home
 */
export function getBatteryToHomePath(
  config: PowerFlowCardPlusConfig,
  options: { hasGrid: boolean }
): string {
  const radius = getCircleRadiusInSVGUnits(config);
  const { hasGrid } = options;
  const verticalOffset = hasGrid ? 15 : 17;

  return `M55,${100 - radius} v-${verticalOffset} c0,-30 10,-30 30,-30 h20`;
}

/**
 * Génère le path SVG pour grid vers home
 */
export function getGridToHomePath(
  config: PowerFlowCardPlusConfig,
  options: { hasSolar: boolean; hasBattery: boolean }
): string {
  const coords = getHorizontalLineCoords(config, options);

  return `M0,${coords.startY} H100`;
}

/**
 * Génère le path SVG pour solar vers battery (vertical)
 */
export function getSolarToBatteryPath(
  config: PowerFlowCardPlusConfig
): string {
  const radius = getCircleRadiusInSVGUnits(config);

  return `M50,${radius} V${100 - radius}`;
}

/**
 * Génère le path SVG pour battery vers/depuis grid
 */
export function getBatteryToGridPath(
  config: PowerFlowCardPlusConfig
): string {
  const radius = getCircleRadiusInSVGUnits(config);

  return `M45,${100 - radius} v-15 c0,-30 -10,-30 -30,-30 h-20`;
}
