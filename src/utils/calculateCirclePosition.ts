import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

export interface CirclePosition {
  x: number; // Center X coordinate
  y: number; // Center Y coordinate
}

const CARD_WIDTH = 400; // Match card width
const CARD_HEIGHT = 400; // Match card height
const CIRCLE_RADIUS = 40; // Half of 80px circle diameter

/**
 * Calcule la position du centre d'un cercle en lisant directement sa position DOM
 * Cela permet un calcul dynamique qui fonctionne pendant le drag & drop
 */
export function calculateCirclePosition(
  circleType: 'solar' | 'grid' | 'home' | 'battery',
  config: PowerFlowCardPlusConfig,
  shadowRoot?: ShadowRoot | null
): CirclePosition {
  // Si on a accès au shadowRoot, lire la position réelle du DOM
  if (shadowRoot) {
    const element = shadowRoot.querySelector(`.circle-container.${circleType}`) as HTMLElement;
    if (element) {
      const rect = element.getBoundingClientRect();
      const cardElement = shadowRoot.querySelector('#power-flow-card-plus');
      if (cardElement) {
        const cardRect = cardElement.getBoundingClientRect();
        // Calculer la position relative à la carte
        const relativeLeft = rect.left - cardRect.left;
        const relativeTop = rect.top - cardRect.top;
        // Le centre du cercle
        return {
          x: relativeLeft + CIRCLE_RADIUS,
          y: relativeTop + CIRCLE_RADIUS
        };
      }
    }
  }

  // Fallback : utiliser la config
  const customPos = config.custom_positions?.[circleType];

  let x: number;
  let y: number;

  // Si custom position existe, l'utiliser directement
  if (customPos?.left !== undefined && customPos?.top !== undefined) {
    x = customPos.left + CIRCLE_RADIUS;
    y = customPos.top + CIRCLE_RADIUS;
  } else {
    // Sinon, utiliser les positions par défaut du CSS
    switch (circleType) {
      case 'solar':
        x = CARD_WIDTH / 2;
        y = 20 + CIRCLE_RADIUS;
        break;

      case 'battery':
        x = CARD_WIDTH / 2;
        y = CARD_HEIGHT - 20 - CIRCLE_RADIUS;
        break;

      case 'grid':
        x = 20 + CIRCLE_RADIUS;
        y = CARD_HEIGHT / 2;
        break;

      case 'home':
        x = CARD_WIDTH - 20 - CIRCLE_RADIUS;
        y = CARD_HEIGHT / 2;
        break;

      default:
        x = CARD_WIDTH / 2;
        y = CARD_HEIGHT / 2;
    }
  }

  return { x, y };
}

export function calculateLinePath(
  from: CirclePosition,
  to: CirclePosition,
  type: 'straight' | 'curved' = 'straight'
): string {
  // Calculate angle between circles
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);

  // Calculate edge points (40px from center = circle radius)
  const fromX = from.x + Math.cos(angle) * 40;
  const fromY = from.y + Math.sin(angle) * 40;
  const toX = to.x - Math.cos(angle) * 40;
  const toY = to.y - Math.sin(angle) * 40;

  if (type === 'straight') {
    return `M${fromX},${fromY} L${toX},${toY}`;
  } else {
    // Curved path with control point
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    return `M${fromX},${fromY} Q${midX},${midY} ${toX},${toY}`;
  }
}
