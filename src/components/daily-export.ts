import { html } from "lit";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

export const dailyExportElement = (
  main: PowerFlowCardPlus,
  _config: PowerFlowCardPlusConfig,
  { dailyExport }: { dailyExport: any }
) => {
  if (!dailyExport.enabled || !dailyExport.entity) {
    return html``;
  }

  const displayRevenue = dailyExport.totalRevenue?.toFixed(dailyExport.decimals ?? 2) ?? "0.00";
  const displayUnit = "€";

  console.log("[Daily Export Element]", {
    totalRevenue: dailyExport.totalRevenue,
    decimals: dailyExport.decimals,
    energy: dailyExport.energy,
    price: dailyExport.price,
    displayRevenue,
    displayUnit,
  });

  return html`<div class="circle-container daily-export">
    <span class="label">${dailyExport.name}</span>
    <div
      class="circle"
      style="background-color: var(--card-background-color);"
      @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
        main.openDetails(e, undefined, dailyExport.entity);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          main.openDetails(e, undefined, dailyExport.entity);
        }
      }}
    >
      <span style="font-size: 14px; font-weight: bold; color: var(--primary-text-color);">
        ${displayRevenue} ${displayUnit}
      </span>
    </div>
  </div>`;
};
