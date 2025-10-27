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

type FlowBatteryGridFlows = Pick<Flows, Exclude<keyof Flows, "solar">>;

export const flowBatteryGrid = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, { battery, grid, individual, newDur }: FlowBatteryGridFlows) => {
  const customStyles = getArrowStyles("grid_to_battery", config);
  const customTransform = getArrowTransform("grid_to_battery", config);

  // Calculate dynamic positions from DOM
  const batteryPos = calculateCirclePosition('battery', config, main.shadowRoot);
  const gridPos = calculateCirclePosition('grid', config, main.shadowRoot);
  const linePath = calculateLinePath(batteryPos, gridPos, 'straight');

  return grid.has && battery.has && showLine(config, Math.max(grid.state.toBattery || 0, battery.state.toGrid || 0))
    ? html`<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
        id="battery-grid-flow"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"
      >
        <path
          id="battery-grid"
          class=${styleLine(battery.state.toGrid || grid.state.toBattery || 0, config)}
          d="${linePath}"
          vector-effect="non-scaling-stroke"
          style="${customStyles}"
          transform="${customTransform}"
        ></path>
        ${checkShouldShowDots(config) && grid.state.toBattery
          ? svg`<circle
          r="3"
          class="battery-from-grid"
          vector-effect="non-scaling-stroke"
        >
          <animateMotion
            dur="${newDur.batteryGrid}s"
            repeatCount="indefinite"
            keyPoints="1;0" keyTimes="0;1"
            calcMode="linear"
          >
            <mpath xlink:href="#battery-grid" />
          </animateMotion>
        </circle>`
          : ""}
        ${checkShouldShowDots(config) && battery.state.toGrid
          ? svg`<circle
              r="3"
              class="battery-to-grid"
              vector-effect="non-scaling-stroke"
            >
              <animateMotion
                dur="${newDur.batteryGrid}s"
                repeatCount="indefinite"
                calcMode="linear"
              >
                <mpath xlink:href="#battery-grid" />
              </animateMotion>
            </circle>`
          : ""}
      </svg>`
    : "";
};
