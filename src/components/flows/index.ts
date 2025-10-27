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
}

// Fonction pour obtenir le centre d'un cercle depuis le DOM
function getCircleCenter(shadowRoot: ShadowRoot | null, circleClass: string): { x: number; y: number } | null {
  if (!shadowRoot) return null;

  const container = shadowRoot.querySelector('.card-content') as HTMLElement;
  const circle = shadowRoot.querySelector(`.circle-container.${circleClass}`) as HTMLElement;

  if (!container || !circle) return null;

  const containerRect = container.getBoundingClientRect();
  const circleRect = circle.getBoundingClientRect();

  // Centre du cercle relatif au conteneur
  const x = circleRect.left - containerRect.left + (circleRect.width / 2);
  const y = circleRect.top - containerRect.top + (circleRect.height / 2);

  return { x, y };
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

  const from = getCircleCenter(main.shadowRoot, fromCircle);
  const to = getCircleCenter(main.shadowRoot, toCircle);

  if (!from || !to) return html``;

  const customStyles = getArrowStyles(arrowKey as any, config);
  const customTransform = getArrowTransform(arrowKey as any, config);

  return svg`
    <line
      id="${lineId}"
      class="${lineClass} ${styleLine(power, config)}"
      x1="${from.x}"
      y1="${from.y}"
      x2="${to.x}"
      y2="${to.y}"
      vector-effect="non-scaling-stroke"
      style="${customStyles}"
      transform="${customTransform}"
    />
    ${showDots && checkShouldShowDots(config) ? svg`
      <circle r="3" class="${lineClass}" vector-effect="non-scaling-stroke">
        <animateMotion
          dur="${duration}s"
          repeatCount="indefinite"
          calcMode="linear"
          ${reverse ? 'keyPoints="1;0" keyTimes="0;1"' : ''}
        >
          <mpath href="#${lineId}" />
        </animateMotion>
      </circle>
    ` : ''}
  `;
}

export const flowElement = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, { battery, grid, individual, solar, newDur }: Flows) => {
  const container = main.shadowRoot?.querySelector('.card-content') as HTMLElement;
  if (!container) return html``;

  const rect = container.getBoundingClientRect();

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${rect.width} ${rect.height}"
      id="power-flow-lines"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"
    >
      ${solar.has && !config.entities.home?.hide ? createLine(
        main, config, 'solar', 'home', 'solar-home', 'solar',
        solar.state.toHome || 0, !!solar.state.toHome, newDur.solarToHome, 'solar_to_home'
      ) : ''}

      ${grid.hasReturnToGrid && solar.has ? createLine(
        main, config, 'solar', 'grid', 'solar-grid', 'return',
        solar.state.toGrid || 0, !!solar.state.toGrid, newDur.solarToGrid, 'solar_to_grid'
      ) : ''}

      ${battery.has && solar.has ? createLine(
        main, config, 'solar', 'battery', 'solar-battery', 'solar',
        solar.state.toBattery || 0, !!solar.state.toBattery, newDur.solarToBattery, 'solar_to_battery'
      ) : ''}

      ${grid.has && !config.entities.home?.hide ? createLine(
        main, config, 'grid', 'home', 'grid-home', 'grid',
        grid.state.toHome || 0, !!grid.state.toHome, newDur.gridToHome, 'grid_to_home'
      ) : ''}

      ${battery.has && !config.entities.home?.hide ? createLine(
        main, config, 'battery', 'home', 'battery-home', 'battery-home',
        battery.state.toHome || 0, !!battery.state.toHome, newDur.batteryToHome, 'battery_to_home'
      ) : ''}

      ${grid.has && battery.has && (grid.state.toBattery || battery.state.toGrid) ? createLine(
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
