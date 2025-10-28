import { html, svg } from "lit";
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

  const displayCost = dailyCost.totalCost?.toFixed(dailyCost.decimals ?? 2) ?? "0.00";
  const displayEnergy = dailyCost.energy?.toFixed(1) ?? "0.0";
  const displayUnit = dailyCost.unit?.split('/')[0] ?? "€";

  // Calcul de la progression de la journée
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const totalSecondsInDay = 24 * 60 * 60;
  const currentSecondsInDay = hours * 3600 + minutes * 60 + seconds;
  const dayProgressPercentage = (currentSecondsInDay / totalSecondsInDay) * 100;

  // Calcul du cercle de progression
  // Comme la bulle Home: cercles SVG au lieu d'une bordure CSS
  // Rayon 38px avec stroke-width 4px (total = 34 à 42px de rayon)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progressCircumference = (dayProgressPercentage / 100) * circumference;
  const remainingCircumference = circumference - progressCircumference;

  const customStyle = _config.custom_positions?.daily_cost
    ? `top: ${_config.custom_positions.daily_cost.top}px; left: ${_config.custom_positions.daily_cost.left}px; bottom: auto; right: auto; transform: none;`
    : "";

  return html`<div
      class="circle-container daily-cost"
      style="${customStyle}"
      @mousedown=${(e: MouseEvent) => (main as any)._onDragStart?.(e, 'daily_cost')}
      @touchstart=${(e: TouchEvent) => (main as any)._onDragStart?.(e, 'daily_cost')}
    >
    <span class="label">${dailyCost.name}</span>
    <div
      class="circle"
      style="background-color: var(--card-background-color);"
      @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
        main.openDetails(e, undefined, dailyCost.entity);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          main.openDetails(e, undefined, dailyCost.entity);
        }
      }}
    >
      <span style="font-size: 14px; font-weight: bold; color: var(--primary-text-color);">
        ${displayCost} ${displayUnit}
      </span>
      <svg>
        ${svg`
          <circle
            class="daily-cost-base"
            cx="40"
            cy="40"
            r="${radius}"
            shape-rendering="geometricPrecision"
          />
          <circle
            class="daily-cost-progress"
            cx="40"
            cy="40"
            r="${radius}"
            stroke-dasharray="${progressCircumference} ${remainingCircumference}"
            stroke-dashoffset="-${remainingCircumference}"
            shape-rendering="geometricPrecision"
          />
        `}
      </svg>
    </div>
  </div>`;
};
