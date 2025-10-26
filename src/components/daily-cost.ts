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
      <span class="daily-cost-value">
        ${dailyCost.totalCost.toFixed(dailyCost.decimals)} ${dailyCost.unit.split('/')[0]}
      </span>
      <span class="daily-cost-energy">
        ${dailyCost.energy.toFixed(1)} kWh
      </span>
    </div>
  </div>`;
};
