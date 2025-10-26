import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";

/**
 * Calcule les coordonnées adaptatives pour les lignes SVG avec aimantation automatique
 * Les lignes s'arrêtent exactement au bord des cercles sans jamais déborder à l'intérieur
 */

// Constantes pour les tailles de cercles
const CIRCLE_DIAMETER_NORMAL = 80;
const CIRCLE_DIAMETER_COMPACT = 65;
const CIRCLE_RADIUS_NORMAL = CIRCLE_DIAMETER_NORMAL / 2; // 40px
const CIRCLE_RADIUS_COMPACT = CIRCLE_DIAMETER_COMPACT / 2; // 32.5px

// ViewBox du SVG
const SVG_VIEWBOX_SIZE = 100;

// Largeur maximale du container
const MAX_CONTAINER_WIDTH = 470;

/**
 * Positions des centres des cercles dans le layout (en px depuis le bord gauche du container)
 */
interface CirclePositions {
  solar: { x: number; y: number };
  battery: { x: number; y: number };
  grid: { x: number; y: number };
  home: { x: number; y: number };
}

/**
 * Calcule le rayon réel du cercle en pixels
 */
function getCircleRadiusInPixels(config: PowerFlowCardPlusConfig): number {
  const isCompact = config.compact_mode === true;
  return isCompact ? CIRCLE_RADIUS_COMPACT : CIRCLE_RADIUS_NORMAL;
}

/**
 * Calcule les positions des centres des cercles dans le container (en px)
 */
function getCirclePositions(config: PowerFlowCardPlusConfig): CirclePositions {
  const radius = getCircleRadiusInPixels(config);
  const diameter = radius * 2;

  // Solar et Grid sont sur les bords
  const solarX = radius; // Centre à gauche
  const gridX = radius; // Centre à gauche

  // Home est à droite
  const homeX = MAX_CONTAINER_WIDTH - radius;

  // Battery est entre solar et home
  const batteryX = radius; // Même position X que solar/grid

  return {
    solar: { x: solarX, y: radius }, // En haut
    battery: { x: batteryX, y: 0 }, // Position sera calculée dynamiquement
    grid: { x: gridX, y: 0 }, // Position sera calculée dynamiquement
    home: { x: homeX, y: 0 }, // Position centrale verticalement
  };
}

/**
 * Convertit une distance en pixels vers le système de coordonnées du SVG (viewBox 0 0 100 100)
 *
 * Le SVG a une largeur de calc(100% - var(--size-circle-entity) * 2)
 * Donc la largeur effective est: MAX_CONTAINER_WIDTH - (2 * diameter)
 *
 * Dans le viewBox 100x100, chaque unité représente 1% de cette largeur
 */
function pixelsToSVGUnits(pixels: number, config: PowerFlowCardPlusConfig): number {
  const radius = getCircleRadiusInPixels(config);
  const diameter = radius * 2;
  const effectiveWidth = MAX_CONTAINER_WIDTH - (2 * diameter);

  // 1 unité SVG = effectiveWidth / 100 pixels
  return (pixels / effectiveWidth) * 100;
}

/**
 * Calcule le point d'intersection entre une ligne et un cercle
 *
 * @param circleCenterX Centre X du cercle en unités SVG
 * @param circleCenterY Centre Y du cercle en unités SVG
 * @param circleRadius Rayon du cercle en unités SVG
 * @param lineAngle Angle de la ligne en radians (0 = droite, π/2 = haut, π = gauche, 3π/2 = bas)
 * @returns Point d'intersection {x, y} en unités SVG
 */
function getCircleIntersectionPoint(
  circleCenterX: number,
  circleCenterY: number,
  circleRadius: number,
  lineAngle: number
): { x: number; y: number } {
  return {
    x: circleCenterX + circleRadius * Math.cos(lineAngle),
    y: circleCenterY + circleRadius * Math.sin(lineAngle),
  };
}

/**
 * Calcule le rayon du cercle en unités SVG de manière précise
 *
 * Le SVG des lignes a:
 * - viewBox="0 0 100 100"
 * - width = calc(100% - var(--size-circle-entity) * 2) = MAX_CONTAINER_WIDTH - 2 * diameter
 * - height = 146px
 *
 * Pour une ligne verticale (hauteur 146px), 1 unité SVG = 146/100 = 1.46px
 * Pour une ligne horizontale, c'est différent car la largeur varie
 */
function getCircleRadiusInSVGUnits(config: PowerFlowCardPlusConfig): number {
  const radiusInPixels = getCircleRadiusInPixels(config);

  // Pour les lignes verticales, la hauteur du SVG est de 146px
  // Dans un viewBox de 100, cela donne:
  const SVG_HEIGHT = 146; // hauteur en pixels du conteneur .lines
  const radiusInSVGUnits = (radiusInPixels / SVG_HEIGHT) * 100;

  return radiusInSVGUnits; // ≈ 27.4 pour un rayon de 40px
}

/**
 * Calcule le point de départ d'une ligne sur le bord d'un cercle
 * en fonction de la direction de la ligne
 */
function getLineStartPoint(
  config: PowerFlowCardPlusConfig,
  circlePosition: "top-left" | "bottom-left" | "center-right",
  direction: "down" | "up" | "right" | "left"
): { x: number; y: number } {
  const radius = getCircleRadiusInSVGUnits(config);

  // Définir les centres des cercles en unités SVG
  let centerX: number;
  let centerY: number;
  let angle: number;

  // Positions des centres (approximatives dans le viewBox 100x100)
  switch (circlePosition) {
    case "top-left":
      // Solar - en haut à gauche
      centerX = 0;
      centerY = 0;
      break;
    case "bottom-left":
      // Battery/Grid - en bas à gauche
      centerX = 0;
      centerY = 100;
      break;
    case "center-right":
      // Home - à droite au centre
      centerX = 100;
      centerY = 50;
      break;
  }

  // Calculer l'angle en fonction de la direction
  switch (direction) {
    case "right":
      angle = 0; // 0 radians = vers la droite
      break;
    case "down":
      angle = Math.PI / 2; // 90° = vers le bas
      break;
    case "left":
      angle = Math.PI; // 180° = vers la gauche
      break;
    case "up":
      angle = (3 * Math.PI) / 2; // 270° = vers le haut
      break;
  }

  return getCircleIntersectionPoint(centerX, centerY, radius, angle);
}

/**
 * Génère le path SVG pour solar vers home avec aimantation précise
 */
export function getSolarToHomePath(
  config: PowerFlowCardPlusConfig,
  options: { hasGrid: boolean; hasBattery: boolean }
): string {
  const radius = getCircleRadiusInSVGUnits(config);
  const { hasBattery } = options;

  // Point de départ: bord bas du cercle Solar
  const startX = hasBattery ? 55 : 50;
  const startY = radius; // S'arrête exactement au bord du cercle

  // Point d'arrivée: bord gauche du cercle Home
  const endX = 100 - radius; // S'arrête exactement au bord du cercle Home
  const endY = 50;

  const curveControl = hasBattery ? 30 : 35;

  return `M${startX},${startY} v15 c0,${curveControl} 10,${curveControl} 30,${curveControl} h${endX - startX - 30}`;
}

/**
 * Génère le path SVG pour solar vers grid avec aimantation précise
 */
export function getSolarToGridPath(
  config: PowerFlowCardPlusConfig,
  options: { hasBattery: boolean }
): string {
  const radius = getCircleRadiusInSVGUnits(config);
  const { hasBattery } = options;

  // Point de départ: bord bas du cercle Solar
  const startX = hasBattery ? 45 : 50;
  const startY = radius;

  // Point d'arrivée: bord haut du cercle Grid (même position X que solar)
  const endY = 100 - radius;

  const curveSize = hasBattery ? 30 : 35;

  return `M${startX},${startY} v15 c0,${curveSize} -10,${curveSize} -30,${curveSize} h-${radius}`;
}

/**
 * Génère le path SVG pour battery vers home avec aimantation précise
 */
export function getBatteryToHomePath(
  config: PowerFlowCardPlusConfig,
  _options: { hasGrid: boolean }
): string {
  const radius = getCircleRadiusInSVGUnits(config);

  // Point de départ: bord haut du cercle Battery
  const startX = 55;
  const startY = 100 - radius;

  // Point d'arrivée: bord gauche du cercle Home
  const endX = 100 - radius;

  return `M${startX},${startY} v-15 c0,-30 10,-30 30,-30 h${endX - startX - 30}`;
}

/**
 * Génère le path SVG pour grid vers home avec aimantation précise
 */
export function getGridToHomePath(
  config: PowerFlowCardPlusConfig,
  options: { hasSolar: boolean; hasBattery: boolean }
): string {
  const radius = getCircleRadiusInSVGUnits(config);
  const { hasSolar, hasBattery } = options;

  // Point de départ: bord droit du cercle Grid
  const startX = radius;

  // Point d'arrivée: bord gauche du cercle Home
  const endX = 100 - radius;

  let yPosition = 50;
  if (hasBattery) {
    yPosition = 50;
  } else if (hasSolar) {
    yPosition = 56;
  } else {
    yPosition = 53;
  }

  return `M${startX},${yPosition} H${endX}`;
}

/**
 * Génère le path SVG pour solar vers battery (vertical) avec aimantation précise
 */
export function getSolarToBatteryPath(
  config: PowerFlowCardPlusConfig
): string {
  const radius = getCircleRadiusInSVGUnits(config);

  // Point de départ: bord bas du cercle Solar
  const startY = radius;

  // Point d'arrivée: bord haut du cercle Battery
  const endY = 100 - radius;

  return `M50,${startY} V${endY}`;
}

/**
 * Génère le path SVG pour battery vers/depuis grid avec aimantation précise
 */
export function getBatteryToGridPath(
  config: PowerFlowCardPlusConfig
): string {
  const radius = getCircleRadiusInSVGUnits(config);

  // Point de départ: bord haut du cercle Battery (côté gauche)
  const startX = 45;
  const startY = 100 - radius;

  // Point d'arrivée: bord bas du cercle Grid
  const endY = radius;

  return `M${startX},${startY} v-15 c0,-30 -10,-30 -30,-30 h-${radius}`;
}

/**
 * Génère le path SVG pour la flèche daily-cost (verticale de grid vers daily-cost)
 * La flèche part du bord haut du cercle Grid et arrive au bord bas du cercle daily-cost
 */
export function getDailyCostArrowPath(
  config: PowerFlowCardPlusConfig
): string {
  const radius = getCircleRadiusInSVGUnits(config);

  // Point de départ: bord haut du cercle Grid
  // Dans le SVG de la flèche, le cercle Grid est en bas (à y=100 en coordonnées normales)
  const startX = 50;
  const startY = 100 - radius; // Part du bord du cercle

  // Point d'arrivée: bord bas du cercle daily-cost (en haut)
  // Le cercle daily-cost est positionné au-dessus, donc à y=0
  const endX = 50;
  const endY = radius; // S'arrête au bord du cercle

  return `M${startX},${startY} L${endX},${endY}`;
}

/**
 * Génère le path SVG pour la flèche daily-export (horizontale de solar vers daily-export)
 * La flèche part du bord droit du cercle Solar et arrive au bord gauche du cercle daily-export
 */
export function getDailyExportArrowPath(
  config: PowerFlowCardPlusConfig
): string {
  const radius = getCircleRadiusInSVGUnits(config);

  // Point de départ: bord droit du cercle Solar
  // Dans le SVG de la flèche, le cercle Solar est à gauche (à x=0)
  const startX = radius; // Part du bord du cercle
  const startY = 50;

  // Point d'arrivée: bord gauche du cercle daily-export (à droite)
  // Le cercle daily-export est à droite, à x=100
  const endX = 100 - radius; // S'arrête au bord du cercle
  const endY = 50;

  return `M${startX},${startY} L${endX},${endY}`;
}
