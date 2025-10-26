import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { showLine } from "@/utils/showLine";
import { html, svg } from "lit";
import { styleLine } from "@/utils/styleLine";
import { type Flows } from "./index";
import { checkShouldShowDots } from "@/utils/checkShouldShowDots";
import { getArrowStyles, getArrowTransform } from "@/utils/applyArrowStyles";
import { calculateCirclePosition, calculateLinePath } from "@/utils/calculateCirclePosition";

export const flowGridToHome = (config: PowerFlowCardPlusConfig, { grid, newDur }: Flows) => {
  const customStyles = getArrowStyles("grid_to_home", config);
  const customTransform = getArrowTransform("grid_to_home", config);

  // Calculate dynamic positions
  const gridPos = calculateCirclePosition('grid', config);
  const homePos = calculateCirclePosition('home', config);
  const linePath = calculateLinePath(gridPos, homePos, 'straight');

  return grid.has && showLine(config, grid.state.fromGrid) && !config.entities.home?.hide
    ? html`<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
        id="grid-home-flow"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"
      >
        <path
          class="grid ${styleLine(grid.state.toHome || 0, config)}"
          id="grid"
          d="${linePath}"
          vector-effect="non-scaling-stroke"
          style="${customStyles}"
          transform="${customTransform}"
        ></path>
        ${checkShouldShowDots(config) && grid.state.toHome
          ? svg`<circle
        r="3"
        class="grid"
        vector-effect="non-scaling-stroke"
      >
        <animateMotion
          dur="${newDur.gridToHome}s"
          repeatCount="indefinite"
          calcMode="linear"
        >
          <mpath xlink:href="#grid" />
        </animateMotion>
      </circle>`
          : ""}
      </svg>`
    : "";
};
