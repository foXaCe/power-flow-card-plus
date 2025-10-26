import { classMap } from "lit/directives/class-map.js";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { showLine } from "@/utils/showLine";
import { html, svg } from "lit";
import { styleLine } from "@/utils/styleLine";
import { type Flows } from "./index";
import { checkHasBottomIndividual, checkHasRightIndividual } from "@/utils/computeIndividualPosition";
import { checkShouldShowDots } from "@/utils/checkShouldShowDots";
import { getArrowStyles, getArrowTransform } from "@/utils/applyArrowStyles";
import { getBatteryToHomePath } from "@/utils/getLineCoordinates";

type FlowBatteryToHomeFlows = Pick<Flows, Exclude<keyof Flows, "solar">>;

export const flowBatteryToHome = (config: PowerFlowCardPlusConfig, { battery, grid, individual, newDur }: FlowBatteryToHomeFlows) => {
  const customStyles = getArrowStyles("battery_to_home", config);
  const customTransform = getArrowTransform("battery_to_home", config);
  const pathData = getBatteryToHomePath(config, { hasGrid: grid.has });

  return battery.has && showLine(config, battery.state.toHome) && !config.entities.home?.hide
    ? html`<div
        class="lines ${classMap({
          high: battery.has || checkHasBottomIndividual(individual),
          "individual1-individual2": !battery.has && individual.every((i) => i?.has),
          "multi-individual": checkHasRightIndividual(individual),
        })}"
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" id="battery-home-flow">
          <path
            id="battery-home"
            class="battery-home ${styleLine(battery.state.toHome || 0, config)}"
            d="${pathData}"
            vector-effect="non-scaling-stroke"
            style="${customStyles}"
            transform="${customTransform}"
          ></path>
          ${checkShouldShowDots(config) && battery.state.toHome
            ? svg`<circle
            r="1"
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
        </svg>
      </div>`
    : "";
};
