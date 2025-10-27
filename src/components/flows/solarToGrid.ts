import { classMap } from "lit/directives/class-map.js";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { PowerFlowCardPlus } from "@/power-flow-card-plus";
import { showLine } from "@/utils/showLine";
import { html, svg } from "lit";
import { styleLine } from "@/utils/styleLine";
import { type Flows } from "./index";
import { checkHasBottomIndividual, checkHasRightIndividual } from "@/utils/computeIndividualPosition";
import { checkShouldShowDots } from "@/utils/checkShouldShowDots";
import { getArrowStyles, getArrowTransform } from "@/utils/applyArrowStyles";
import { calculateCirclePosition, calculateLinePath } from "@/utils/calculateCirclePosition";

export const flowSolarToGrid = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, { battery, grid, individual, solar, newDur, cardWidth, cardHeight }: Flows) => {
  const customStyles = getArrowStyles("solar_to_grid", config);
  const customTransform = getArrowTransform("solar_to_grid", config);
  
  // Get card dimensions (fallback to 400 if not available)
  const width = cardWidth || 400;
  const height = cardHeight || 400;

  // Calculate dynamic positions from DOM
  const solarPos = calculateCirclePosition('solar', config, main.shadowRoot);
  const gridPos = calculateCirclePosition('grid', config, main.shadowRoot);
  const linePath = calculateLinePath(solarPos, gridPos, 'straight');

  return grid.hasReturnToGrid && solar.has && showLine(config, solar.state.toGrid || 0)
    ? html`<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${width} ${height}"
        preserveAspectRatio="none"
        id="solar-grid-flow"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"
      >
        <path
          id="return"
          class="return ${styleLine(solar.state.toGrid || 0, config)}"
          d="${linePath}"
          vector-effect="non-scaling-stroke"
          style="${customStyles}"
          transform="${customTransform}"
        ></path>
        ${checkShouldShowDots(config) && solar.state.toGrid && solar.has
          ? svg`<circle
              r="3"
              class="return"
              vector-effect="non-scaling-stroke"
            >
              <animateMotion
                dur="${newDur.solarToGrid}s"
                repeatCount="indefinite"
                calcMode="linear"
              >
                <mpath xlink:href="#return" />
              </animateMotion>
            </circle>`
          : ""}
      </svg>`
    : "";
};
