import { classMap } from "lit/directives/class-map.js";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { showLine } from "@/utils/showLine";
import { html, svg } from "lit";
import { styleLine } from "@/utils/styleLine";
import { type Flows } from "./index";
import { checkHasBottomIndividual, checkHasRightIndividual } from "@/utils/computeIndividualPosition";
import { checkShouldShowDots } from "@/utils/checkShouldShowDots";
import { getArrowStyles, getArrowTransform } from "@/utils/applyArrowStyles";
import { calculateCirclePosition, calculateLinePath } from "@/utils/calculateCirclePosition";

type FlowBatteryToHomeFlows = Pick<Flows, Exclude<keyof Flows, "solar">>;

export const flowBatteryToHome = (config: PowerFlowCardPlusConfig, { battery, grid, individual, newDur }: FlowBatteryToHomeFlows) => {
  const customStyles = getArrowStyles("battery_to_home", config);
  const customTransform = getArrowTransform("battery_to_home", config);

  // Calculate dynamic positions
  const batteryPos = calculateCirclePosition('battery', config);
  const homePos = calculateCirclePosition('home', config);
  const linePath = calculateLinePath(batteryPos, homePos, 'straight');

  return battery.has && showLine(config, battery.state.toHome) && !config.entities.home?.hide
    ? html`<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
        id="battery-home-flow"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"
      >
        <path
          id="battery-home"
          class="battery-home ${styleLine(battery.state.toHome || 0, config)}"
          d="${linePath}"
          vector-effect="non-scaling-stroke"
          style="${customStyles}"
          transform="${customTransform}"
        ></path>
        ${checkShouldShowDots(config) && battery.state.toHome
          ? svg`<circle
            r="3"
            class="battery-home"
            vector-effect="non-scaling-stroke"
          >
            <animateMotion
              dur="${newDur.batteryToHome}s"
              repeatCount="indefinite"
              calcMode="linear"
            >
              <mpath xlink:href="#battery-home" />
            </animateMotion>
          </circle>`
          : ""}
      </svg>`
    : "";
};
