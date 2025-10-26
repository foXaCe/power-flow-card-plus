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

  // Calculate position based on circle type and custom positions
  switch (circleType) {
    case 'solar':
      x = customPos?.left !== undefined ? customPos.left + CIRCLE_RADIUS : CARD_WIDTH / 2;
      y = customPos?.top !== undefined ? customPos.top + CIRCLE_RADIUS : 20 + CIRCLE_RADIUS;
      break;

    case 'battery':
      x = customPos?.left !== undefined ? customPos.left + CIRCLE_RADIUS : CARD_WIDTH / 2;
      y = customPos?.top !== undefined ? customPos.top + CIRCLE_RADIUS : CARD_HEIGHT - 20 - CIRCLE_RADIUS;
      break;

    case 'grid':
      x = customPos?.left !== undefined ? customPos.left + CIRCLE_RADIUS : 20 + CIRCLE_RADIUS;
      y = customPos?.top !== undefined ? customPos.top + CIRCLE_RADIUS : CARD_HEIGHT / 2;
      break;

    case 'home':
      x = customPos?.left !== undefined ? customPos.left + CIRCLE_RADIUS : CARD_WIDTH - 20 - CIRCLE_RADIUS;
      y = customPos?.top !== undefined ? customPos.top + CIRCLE_RADIUS : CARD_HEIGHT / 2;
      break;

    default:
      x = CARD_WIDTH / 2;
      y = CARD_HEIGHT / 2;
  }

  return { x, y };
}

export function calculateLinePath(
  from: CirclePosition,
  to: CirclePosition,
  type: 'straight' | 'curved' = 'straight'
): string {
  if (type === 'straight') {
    return `M${from.x},${from.y} L${to.x},${to.y}`;
  } else {
    // Curved path with control point
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    return `M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`;
  }
}
