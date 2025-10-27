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
  cardWidth?: number;
  cardHeight?: number;
}

export const flowElement = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, { battery, grid, individual, solar, newDur, cardWidth, cardHeight }: Flows) => {
  return html`
  ${flowSolarToHome(main, config, { battery, grid, individual, solar, newDur, cardWidth, cardHeight })}
  ${flowSolarToGrid(main, config, { battery, grid, individual, solar, newDur, cardWidth, cardHeight })}
  ${flowSolarToBattery(main, config, { battery, individual, solar, newDur, cardWidth, cardHeight })}
  ${flowGridToHome(main, config, { battery, grid, individual, solar, newDur, cardWidth, cardHeight })}
  ${flowBatteryToHome(main, config, { battery, grid, individual, newDur, cardWidth, cardHeight })}
  ${flowBatteryGrid(main, config, { battery, grid, individual, newDur, cardWidth, cardHeight })}
</div>`;
};
