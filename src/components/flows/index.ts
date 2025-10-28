import { html, svg } from "lit";
import { NewDur } from "@/type";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { IndividualObject } from "@/states/raw/individual/getIndividualObject";
import { PowerFlowCardPlus } from "@/power-flow-card-plus";
import { showLine } from "@/utils/showLine";
import { styleLine } from "@/utils/styleLine";
import { checkShouldShowDots } from "@/utils/checkShouldShowDots";
import { getArrowStyles, getArrowTransform } from "@/utils/applyArrowStyles";

export interface Flows {
  battery: any;
  grid: any;
  individual: IndividualObject[];
  solar: any;
  newDur: NewDur;
  dailyExport?: { enabled: boolean; energy: number };
  dailyCost?: { enabled: boolean; totalCost: number };
}

// Rayon du cercle (80px de diamètre = 40px de rayon)
const CIRCLE_RADIUS = 40;

// Fonction pour obtenir le centre d'un cercle depuis le DOM
function getCircleCenter(shadowRoot: ShadowRoot | null, circleClass: string): { x: number; y: number; radius: number } | null {
  if (!shadowRoot) return null;

  const container = shadowRoot.querySelector('.card-content') as HTMLElement;
  const circleContainer = shadowRoot.querySelector(`.circle-container.${circleClass}`) as HTMLElement;

  if (!container || !circleContainer) return null;

  // Chercher la div.circle à l'intérieur du circle-container
  const circleDiv = circleContainer.querySelector('.circle') as HTMLElement;
  const elementToMeasure = circleDiv || circleContainer;

  const containerRect = container.getBoundingClientRect();
  const circleRect = elementToMeasure.getBoundingClientRect();

  // Centre du cercle relatif au conteneur
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
  // Vecteur du centre vers la cible
  const dx = targetX - centerX;
  const dy = targetY - centerY;

  // Distance du centre à la cible
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Si la distance est 0, retourner le centre
  if (distance === 0) return { x: centerX, y: centerY };

  // Point sur le bord du cercle dans la direction de la cible
  const ratio = radius / distance;
  return {
    x: centerX + dx * ratio,
    y: centerY + dy * ratio
  };
}

// Fonction pour obtenir la couleur du dot selon la classe
function getDotColor(lineClass: string): string {
  const colorMap: Record<string, string> = {
    'solar': '#ff9800',  // Orange
    'grid': '#4caf50',   // Green
    'return': '#a280db', // Purple
    'battery-home': '#ff6f91', // Pink
    'battery-from-grid': '#4caf50', // Green
    'battery-to-grid': '#a280db', // Purple
    'battery-solar': '#ffc107', // Amber
  };
  return colorMap[lineClass] || '#2196f3'; // Blue par défaut
}

// Fonction pour créer une ligne entre deux cercles
function createLine(
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig,
  fromCircle: string,
  toCircle: string,
  lineId: string,
  lineClass: string,
  power: number,
  showDots: boolean,
  duration: number,
  arrowKey: string,
  reverse: boolean = false
) {
  if (!showLine(config, power)) return html``;

  const fromCenter = getCircleCenter(main.shadowRoot, fromCircle);
  const toCenter = getCircleCenter(main.shadowRoot, toCircle);

  if (!fromCenter || !toCenter) return html``;

  // Calculer les points sur les bords des cercles
  const fromEdge = getCircleEdgePoint(fromCenter.x, fromCenter.y, fromCenter.radius, toCenter.x, toCenter.y);
  const toEdge = getCircleEdgePoint(toCenter.x, toCenter.y, toCenter.radius, fromCenter.x, fromCenter.y);

  const customStyles = getArrowStyles(arrowKey as any, config);
  const customTransform = getArrowTransform(arrowKey as any, config);

  const line = svg`
    <path
      id="${lineId}"
      class="${lineClass} ${styleLine(power, config)}"
      d="M ${fromEdge.x} ${fromEdge.y} L ${toEdge.x} ${toEdge.y}"
      vector-effect="non-scaling-stroke"
      style="${customStyles}"
      transform="${customTransform}"
      fill="none"
    />
  `;

  const dot = showDots && checkShouldShowDots(config) ? (() => {
    const dotColor = getDotColor(lineClass);
    return svg`
      <circle r="4" class="${lineClass}" vector-effect="non-scaling-stroke" fill="${dotColor}" stroke="none" opacity="1">
        <animateMotion
          dur="${duration}s"
          repeatCount="indefinite"
          calcMode="linear"
          ${reverse ? 'keyPoints="1;0" keyTimes="0;1"' : ''}
        >
          <mpath href="#${lineId}" />
        </animateMotion>
      </circle>
    `;
  })() : svg``;

  return svg`${line}${dot}`;
}

export const flowElement = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, { battery, grid, individual, solar, newDur, dailyExport, dailyCost }: Flows) => {
  // Utiliser requestAnimationFrame pour attendre que le DOM soit rendu
  requestAnimationFrame(() => {
    const container = main.shadowRoot?.querySelector('.card-content') as HTMLElement;
    if (!container) {
      console.warn('Power Flow Card Plus: .card-content not found after RAF');
      return;
    }
    const svg = main.shadowRoot?.querySelector('#power-flow-lines') as SVGElement;
    if (svg) {
      const rect = container.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    }
  });

  // Retourner un SVG avec des dimensions par défaut qui seront ajustées
  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 600"
      id="power-flow-lines"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;"
    >
      ${solar.has && !config.entities.home?.hide ? createLine(
        main, config, 'solar', 'home', 'solar-home', 'solar',
        solar.state.toHome || 0, !!solar.state.toHome, newDur.solarToHome, 'solar_to_home'
      ) : ''}

      ${grid.hasReturnToGrid && solar.has ? createLine(
        main, config, 'solar', 'grid', 'solar-grid', 'return',
        solar.state.toGrid || 0, !!solar.state.toGrid, newDur.solarToGrid, 'solar_to_grid'
      ) : ''}

      ${dailyExport?.enabled && solar.has ? createLine(
        main, config, 'solar', 'daily-export', 'solar-daily-export', 'solar',
        dailyExport.energy || 0, !!(dailyExport.energy), newDur.solarToGrid, 'solar_to_grid'
      ) : ''}

      ${battery.has && solar.has ? createLine(
        main, config, 'solar', 'battery', 'solar-battery', 'solar',
        solar.state.toBattery || 0, !!solar.state.toBattery, newDur.solarToBattery, 'solar_to_battery'
      ) : ''}

      ${grid.has && !config.entities.home?.hide ? createLine(
        main, config, 'grid', 'home', 'grid-home', 'grid',
        grid.state.toHome || 0, !!grid.state.toHome, newDur.gridToHome, 'grid_to_home'
      ) : ''}

      ${dailyCost?.enabled && grid.has ? createLine(
        main, config, 'grid', 'daily-cost', 'grid-daily-cost', 'grid',
        dailyCost.totalCost || 0, !!(dailyCost.totalCost), newDur.gridToHome, 'grid_to_home'
      ) : ''}

      ${battery.has && !config.entities.home?.hide ? createLine(
        main, config, 'battery', 'home', 'battery-home', 'battery-home',
        battery.state.toHome || 0, !!battery.state.toHome, newDur.batteryToHome, 'battery_to_home'
      ) : ''}

      ${grid.has && battery.has ? createLine(
        main, config, 'battery', 'grid', 'battery-grid',
        grid.state.toBattery ? 'battery-from-grid' : 'battery-to-grid',
        Math.max(grid.state.toBattery || 0, battery.state.toGrid || 0),
        !!(grid.state.toBattery || battery.state.toGrid),
        newDur.batteryGrid, 'grid_to_battery',
        !!grid.state.toBattery
      ) : ''}
    </svg>
  `;
};
