import { html, svg } from "lit";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { createHourMarker } from "../utils/clockMarkers";
import { formatNumber } from "@/ha";

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

/**
 * Format the clock total. Uses `hass.formatEntityState` when an entity is
 * available so locale, currency symbol and display_precision are honored.
 * Falls back to a manual formatting when the modern helper is missing or
 * the state object cannot be resolved.
 */
const formatClockDisplay = (main: PowerFlowCardPlus, data: DailyClockData): string => {
  const decimals = data.decimals ?? 2;
  const total = Number.isFinite(data.total) ? (data.total as number) : 0;

  if (data.entity && typeof main.hass?.formatEntityState === "function") {
    const stateObj = main.hass.states?.[data.entity];
    if (stateObj) {
      try {
        const formatted = main.hass.formatEntityState(stateObj, total.toString());
        if (typeof formatted === "string" && formatted.length > 0) {
          return formatted;
        }
      } catch {
        // fall through to legacy formatting
      }
    }
  }

  const numberPart = formatNumber(Number(total.toFixed(decimals)), main.hass?.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const unit = data.unit?.split("/")[0] ?? "€";
  return `${numberPart} ${unit}`;
};

export const dailyClockElement = (main: PowerFlowCardPlus, _config: PowerFlowCardPlusConfig, props: DailyClockProps) => {
  const { className, needleColor, data, dragKey, positionKey } = props;

  if (!data.enabled || !data.entity) {
    return html``;
  }

  const display = formatClockDisplay(main, data);

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
      <span style="font-size: 14px; font-weight: bold; color: var(--primary-text-color); position: relative; z-index: 10;"> ${display} </span>
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
