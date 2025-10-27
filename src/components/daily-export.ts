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

  const customStyle = _config.custom_positions?.['daily-export']
    ? `top: ${_config.custom_positions['daily-export'].top}px; left: ${_config.custom_positions['daily-export'].left}px; bottom: auto; right: auto; transform: none;`
    : "";

  return html`<div
      class="circle-container daily-export"
      style="${customStyle}"
      @mousedown=${(e: MouseEvent) => (main as any)._onDragStart?.(e, 'daily-export')}
      @touchstart=${(e: TouchEvent) => (main as any)._onDragStart?.(e, 'daily-export')}
    >
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
