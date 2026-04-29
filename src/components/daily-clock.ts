import { html, svg } from "lit";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { createHourMarker } from "../utils/clockMarkers";

export type DailyClockKind = "daily_cost" | "daily_export";

export interface DailyClockData {
  enabled?: boolean;
  entity?: string;
  total?: number;
  decimals?: number;
  unit?: string;
  name?: string;
}

export interface DailyClockProps {
  kind: DailyClockKind;
  className: string;
  needleColor: string;
  data: DailyClockData;
  dragKey: string;
  positionKey: "daily_cost" | "daily_export";
}

export const dailyClockElement = (main: PowerFlowCardPlus, _config: PowerFlowCardPlusConfig, props: DailyClockProps) => {
  const { className, needleColor, data, dragKey, positionKey } = props;

  if (!data.enabled || !data.entity) {
    return html``;
  }

  const displayValue = data.total?.toFixed(data.decimals ?? 2) ?? "0.00";
  const displayUnit = data.unit?.split("/")[0] ?? "€";

  // Calcul de l'angle de l'aiguille (0° = 12h en haut, sens horaire)
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30; // 30° par heure

  const customPosition = _config.custom_positions?.[positionKey];
  const customStyle = customPosition
    ? `top: ${customPosition.top}px; left: ${customPosition.left}px; bottom: auto; right: auto; transform: none;`
    : "";

  return html`<div
    class="circle-container ${className}"
    style="${customStyle}"
    @mousedown=${(e: MouseEvent) => (main as any)._onDragStart?.(e, dragKey)}
    @touchstart=${(e: TouchEvent) => (main as any)._onDragStart?.(e, dragKey)}
  >
    <span class="label">${data.name}</span>
    <div
      class="circle"
      style="background-color: var(--card-background-color);"
      @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
        main.openDetails(e, undefined, data.entity);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          main.openDetails(e, undefined, data.entity);
        }
      }}
    >
      <span style="font-size: 14px; font-weight: bold; color: var(--primary-text-color); position: relative; z-index: 10;">
        ${displayValue} ${displayUnit}
      </span>
      <svg>
        ${svg`<circle
          cx="40"
          cy="40"
          r="38"
          shape-rendering="geometricPrecision"
          stroke="var(--primary-text-color)"
          stroke-width="4"
          fill="none"
          opacity="0.2"
        />`}
        <!-- Marqueurs d'heures -->
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => createHourMarker(hour))}
        <!-- Aiguille des heures -->
        ${svg`<line
          x1="40"
          y1="40"
          x2="${40 + 28 * Math.sin((hourAngle * Math.PI) / 180)}"
          y2="${40 - 28 * Math.cos((hourAngle * Math.PI) / 180)}"
          stroke="${needleColor}"
          stroke-width="3.5"
          stroke-linecap="round"
          opacity="1"
        />`}
      </svg>
    </div>
  </div>`;
};
