import { html } from "lit";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

export const dailyCostElement = (
  main: PowerFlowCardPlus,
  _config: PowerFlowCardPlusConfig,
  { dailyCost }: { dailyCost: any }
) => {
  if (!dailyCost.enabled || !dailyCost.entity) {
    return html``;
  }

  console.log("[Daily Cost Element]", {
    totalCost: dailyCost.totalCost,
    decimals: dailyCost.decimals,
    energy: dailyCost.energy,
    unit: dailyCost.unit,
    unitSplit: dailyCost.unit.split('/')[0],
  });

  const displayCost = dailyCost.totalCost?.toFixed(dailyCost.decimals ?? 2) ?? "0.00";
  const displayEnergy = dailyCost.energy?.toFixed(1) ?? "0.0";
  const displayUnit = dailyCost.unit?.split('/')[0] ?? "€";

  return html`<div class="circle-container daily-cost">
    <span class="label">${dailyCost.name}</span>
    <div
      class="circle"
      @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
        main.openDetails(e, undefined, dailyCost.entity);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          main.openDetails(e, undefined, dailyCost.entity);
        }
      }}
    >
      <ha-icon id="daily-cost-icon" .icon=${"mdi:currency-eur"} />
      <span class="daily-cost-value">${displayCost} ${displayUnit}</span>
      <span class="daily-cost-energy">${displayEnergy} kWh</span>
    </div>
  </div>`;
};
