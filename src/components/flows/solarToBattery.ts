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

type FlowSolarToBatteryFlows = Pick<Flows, Exclude<keyof Flows, "grid">>;

export const flowSolarToBattery = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, { battery, solar, newDur, cardWidth, cardHeight }: FlowSolarToBatteryFlows) => {
  const customStyles = getArrowStyles("solar_to_battery", config);
  const customTransform = getArrowTransform("solar_to_battery", config);

  // Get card dimensions (fallback to 400 if not available)
  const width = cardWidth || 400;
  const height = cardHeight || 400;

  // Calculate dynamic positions from DOM
  const solarPos = calculateCirclePosition('solar', config, main.shadowRoot);
  const batteryPos = calculateCirclePosition('battery', config, main.shadowRoot);
  const linePath = calculateLinePath(solarPos, batteryPos, 'straight');

  return battery.has && solar.has && showLine(config, solar.state.toBattery || 0)
    ? html`<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${width} ${height}"
        preserveAspectRatio="none"
        id="solar-battery-flow"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"
      >
        <path
          id="battery-solar"
          class="battery-solar ${styleLine(solar.state.toBattery || 0, config)}"
          d="${linePath}"
          vector-effect="non-scaling-stroke"
          style="${customStyles}"
          transform="${customTransform}"
        ></path>
        ${checkShouldShowDots(config) && solar.state.toBattery
          ? svg`<circle
              r="3"
              class="battery-solar"
              vector-effect="non-scaling-stroke"
            >
              <animateMotion
                dur="${newDur.solarToBattery}s"
                repeatCount="indefinite"
                calcMode="linear"
              >
                <mpath xlink:href="#battery-solar" />
              </animateMotion>
            </circle>`
          : ""}
      </svg>`
    : "";
};
