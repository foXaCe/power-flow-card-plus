import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { dailyClockElement } from "./daily-clock";

export const dailyCostElement = (main: PowerFlowCardPlus, _config: PowerFlowCardPlusConfig, { dailyCost }: { dailyCost: any }) =>
  dailyClockElement(main, _config, {
    kind: "daily_cost",
    className: "daily-cost",
    needleColor: "#ff0000",
    dragKey: "daily_cost",
    positionKey: "daily_cost",
    data: {
      enabled: dailyCost?.enabled,
      entity: dailyCost?.entity,
      total: dailyCost?.totalCost,
      decimals: dailyCost?.decimals,
      unit: dailyCost?.unit,
      name: dailyCost?.name,
    },
  });
