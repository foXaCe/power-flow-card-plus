import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { dailyClockElement } from "./daily-clock";

export const dailyExportElement = (main: PowerFlowCardPlus, _config: PowerFlowCardPlusConfig, { dailyExport }: { dailyExport: any }) =>
  dailyClockElement(main, _config, {
    kind: "daily_export",
    className: "daily-export",
    needleColor: "#4caf50",
    dragKey: "daily_export",
    positionKey: "daily_export",
    data: {
      enabled: dailyExport?.enabled,
      entity: dailyExport?.entity,
      total: dailyExport?.totalRevenue,
      decimals: dailyExport?.decimals,
      unit: dailyExport?.unit,
      name: dailyExport?.name,
    },
  });
