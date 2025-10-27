import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

export interface CirclePosition {
  x: number; // Center X coordinate
  y: number; // Center Y coordinate
}

const CARD_WIDTH = 400; // Match card width
const CARD_HEIGHT = 400; // Match card height
const CIRCLE_RADIUS = 40; // Half of 80px circle diameter

export function calculateCirclePosition(
  circleType: 'solar' | 'grid' | 'home' | 'battery',
  config: PowerFlowCardPlusConfig
): CirclePosition {
  const customPos = config.custom_positions?.[circleType];

  let x: number;
  let y: number;

  // Si custom position existe, l'utiliser directement (déjà calculée sans transform)
  if (customPos?.left !== undefined && customPos?.top !== undefined) {
    x = customPos.left + CIRCLE_RADIUS;
    y = customPos.top + CIRCLE_RADIUS;
  } else {
    // Sinon, utiliser les positions par défaut du CSS qui correspondent aux positions visuelles
    // Les positions CSS sont définies dans style.ts avec les transforms
    switch (circleType) {
      case 'solar':
        // CSS: top: 20px, left: 50%, transform: translateX(-50%)
        // Position finale: left = 50% - 40px = 200px - 40px = 160px, top = 20px
        x = CARD_WIDTH / 2;
        y = 20 + CIRCLE_RADIUS;
        break;

      case 'battery':
        // CSS: bottom: 20px, left: 50%, transform: translateX(-50%)
        // Position finale: left = 50% - 40px = 160px, bottom = 20px → top = 400 - 20 - 80 = 300px
        x = CARD_WIDTH / 2;
        y = CARD_HEIGHT - 20 - CIRCLE_RADIUS;
        break;

      case 'grid':
        // CSS: top: 50%, left: 20px, transform: translateY(-50%)
        // Position finale: left = 20px, top = 50% - 40px = 200px - 40px = 160px
        x = 20 + CIRCLE_RADIUS;
        y = CARD_HEIGHT / 2;
        break;

      case 'home':
        // CSS: top: 50%, right: 20px, transform: translateY(-50%)
        // Position finale: right = 20px → left = 400 - 20 - 80 = 300px, top = 50% - 40px = 160px
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
