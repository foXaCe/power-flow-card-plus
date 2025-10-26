import { classMap } from "lit/directives/class-map.js";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { showLine } from "@/utils/showLine";
import { html, svg } from "lit";
import { styleLine } from "@/utils/styleLine";
import { type Flows } from "./index";
import { checkHasBottomIndividual, checkHasRightIndividual } from "@/utils/computeIndividualPosition";
import { checkShouldShowDots } from "@/utils/checkShouldShowDots";
import { getArrowStyles, getArrowTransform } from "@/utils/applyArrowStyles";

export const flowGridToHome = (config: PowerFlowCardPlusConfig, { battery, grid, individual, solar, newDur }: Flows) => {
  const customStyles = getArrowStyles("grid_to_home", config);
  const customTransform = getArrowTransform("grid_to_home", config);

  // Masquer la ligne si grid ou home ont des positions personnalisées
  const hasCustomPositions = !!(
    (config.custom_positions?.grid && (config.custom_positions.grid.top !== undefined || config.custom_positions.grid.left !== undefined)) ||
    (config.custom_positions?.home && (config.custom_positions.home.top !== undefined || config.custom_positions.home.left !== undefined))
  );

  return grid.has && showLine(config, grid.state.fromGrid) && !config.entities.home?.hide && !hasCustomPositions
    ? html`<div
        class="lines ${classMap({
          high: battery.has || checkHasBottomIndividual(individual),
          "individual1-individual2": !battery.has && individual.every((i) => i?.has),
          "multi-individual": checkHasRightIndividual(individual),
        })}"
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="grid-home-flow" class="flat-line">
          <path
            class="grid ${styleLine(grid.state.toHome || 0, config)}"
            id="grid"
            d="M0,${battery.has ? 50 : solar.has ? 56 : 53} H100"
            vector-effect="non-scaling-stroke"
            style="${customStyles}"
            transform="${customTransform}"
          ></path>
          ${checkShouldShowDots(config) && grid.state.toHome
            ? svg`<circle
          r="1"
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
        </svg>
      </div>`
    : "";
};
