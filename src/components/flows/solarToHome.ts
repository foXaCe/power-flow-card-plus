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

export const flowSolarToHome = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, { battery, grid, individual, solar, newDur }: Flows) => {
  const customStyles = getArrowStyles("solar_to_home", config);
  const customTransform = getArrowTransform("solar_to_home", config);

  // Calculate dynamic positions from DOM
  const solarPos = calculateCirclePosition('solar', config, main.shadowRoot);
  const homePos = calculateCirclePosition('home', config, main.shadowRoot);
  const linePath = calculateLinePath(solarPos, homePos, 'straight');

  return solar.has && showLine(config, solar.state.toHome || 0) && !config.entities.home?.hide
    ? html`<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
        id="solar-home-flow"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"
      >
        <path
          id="solar"
          class="solar ${styleLine(solar.state.toHome || 0, config)}"
          d="${linePath}"
          vector-effect="non-scaling-stroke"
          style="${customStyles}"
          transform="${customTransform}"
        ></path>
        ${checkShouldShowDots(config) && solar.state.toHome
          ? svg`<circle
              r="3"
              class="solar"
              vector-effect="non-scaling-stroke"
            >
              <animateMotion
                dur="${newDur.solarToHome}s"
                repeatCount="indefinite"
                calcMode="linear"
              >
                <mpath xlink:href="#solar" />
              </animateMotion>
            </circle>`
          : ""}
      </svg>`
    : "";
};
