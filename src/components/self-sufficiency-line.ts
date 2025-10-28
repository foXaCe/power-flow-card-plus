import { svg } from "lit";
import { PowerFlowCardPlus } from "@/power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";

// Rayon du cercle
const CIRCLE_RADIUS = 40;

// Fonction pour obtenir le centre d'un cercle depuis le DOM
function getCircleCenter(shadowRoot: ShadowRoot | null, circleClass: string): { x: number; y: number; radius: number } | null {
  if (!shadowRoot) return null;

  const container = shadowRoot.querySelector('.card-content') as HTMLElement;
  const circleContainer = shadowRoot.querySelector(`.circle-container.${circleClass}`) as HTMLElement;

  if (!container || !circleContainer) return null;

  const circleDiv = circleContainer.querySelector('.circle') as HTMLElement;
  const elementToMeasure = circleDiv || circleContainer;

  const containerRect = container.getBoundingClientRect();
  const circleRect = elementToMeasure.getBoundingClientRect();

  const x = circleRect.left - containerRect.left + (circleRect.width / 2);
  const y = circleRect.top - containerRect.top + (circleRect.height / 2);

  return { x, y, radius: CIRCLE_RADIUS };
}

// Calcule le point d'intersection entre une ligne et un cercle
function getCircleEdgePoint(
  centerX: number,
  centerY: number,
  radius: number,
  targetX: number,
  targetY: number
): { x: number; y: number } {
  const dx = targetX - centerX;
  const dy = targetY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return { x: centerX, y: centerY };

  const ratio = radius / distance;
  return {
    x: centerX + dx * ratio,
    y: centerY + dy * ratio
  };
}

export const selfSufficiencyLine = (
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig
) => {
  if (!config.show_self_sufficiency) return svg``;

  const homeCenter = getCircleCenter(main.shadowRoot, 'home');
  const selfSufficiencyCenter = getCircleCenter(main.shadowRoot, 'self-sufficiency');

  if (!homeCenter || !selfSufficiencyCenter) return svg``;

  // Calculer les points sur les bords des cercles
  const fromEdge = getCircleEdgePoint(homeCenter.x, homeCenter.y, homeCenter.radius, selfSufficiencyCenter.x, selfSufficiencyCenter.y);
  const toEdge = getCircleEdgePoint(selfSufficiencyCenter.x, selfSufficiencyCenter.y, selfSufficiencyCenter.radius, homeCenter.x, homeCenter.y);

  return svg`
    <path
      id="home-self-sufficiency"
      class="self-sufficiency-line"
      d="M ${fromEdge.x} ${fromEdge.y} L ${toEdge.x} ${toEdge.y}"
      vector-effect="non-scaling-stroke"
      fill="none"
      stroke="var(--primary-text-color)"
      stroke-width="2"
      stroke-dasharray="4 4"
      opacity="0.3"
      stroke-linecap="round"
      stroke-linejoin="round"
      shape-rendering="geometricPrecision"
    />
  `;
};
