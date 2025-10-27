import { html } from "lit";
import { NewDur } from "@/type";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { IndividualObject } from "@/states/raw/individual/getIndividualObject";
import { PowerFlowCardPlus } from "@/power-flow-card-plus";
import { flowSolarToHome } from "./solarToHome";
import { flowSolarToGrid } from "./solarToGrid";
import { flowSolarToBattery } from "./solarToBattery";
import { flowGridToHome } from "./gridToHome";
import { flowBatteryToHome } from "./batteryToHome";
import { flowBatteryGrid } from "./batteryGrid";

export interface Flows {
  battery: any;
  grid: any;
  individual: IndividualObject[];
  solar: any;
  newDur: NewDur;
}

export const flowElement = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, { battery, grid, individual, solar, newDur }: Flows) => {
  return html`
  ${flowSolarToHome(main, config, { battery, grid, individual, solar, newDur })}
  ${flowSolarToGrid(main, config, { battery, grid, individual, solar, newDur })}
  ${flowSolarToBattery(main, config, { battery, individual, solar, newDur })}
  ${flowGridToHome(main, config, { battery, grid, individual, solar, newDur })}
  ${flowBatteryToHome(main, config, { battery, grid, individual, newDur })}
  ${flowBatteryGrid(main, config, { battery, grid, individual, newDur })}
</div>`;
};
