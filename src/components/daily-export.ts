import { html, svg } from "lit";
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

  // Calcul de l'heure pour l'aiguille
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30;

  // Fonction pour créer les marqueurs d'heures
  const createHourMarker = (hour: number) => {
    const angle = hour * 30 - 90;
    const isMainHour = hour % 3 === 0;
    const outerRadius = 38;
    const innerRadius = isMainHour ? 32 : 33;

    const x1 = 40 + outerRadius * Math.cos((angle * Math.PI) / 180);
    const y1 = 40 + outerRadius * Math.sin((angle * Math.PI) / 180);
    const x2 = 40 + innerRadius * Math.cos((angle * Math.PI) / 180);
    const y2 = 40 + innerRadius * Math.sin((angle * Math.PI) / 180);

    return svg`<line
      x1="${x1}"
      y1="${y1}"
      x2="${x2}"
      y2="${y2}"
      stroke="var(--primary-text-color)"
      stroke-width="${isMainHour ? '2.5' : '1.5'}"
      opacity="0.5"
    />`;
  };

  const customStyle = _config.custom_positions?.daily_export
    ? `top: ${_config.custom_positions.daily_export.top}px; left: ${_config.custom_positions.daily_export.left}px; bottom: auto; right: auto; transform: none;`
    : "";

  return html`<div
      class="circle-container daily-export"
      style="${customStyle}"
      @mousedown=${(e: MouseEvent) => (main as any)._onDragStart?.(e, 'daily_export')}
      @touchstart=${(e: TouchEvent) => (main as any)._onDragStart?.(e, 'daily_export')}
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
      <span style="font-size: 14px; font-weight: bold; color: var(--primary-text-color); position: relative; z-index: 10;">
        ${displayRevenue} ${displayUnit}
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
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(hour => createHourMarker(hour))}
        <!-- Aiguille des heures -->
        ${svg`<line
          x1="40"
          y1="40"
          x2="${40 + 28 * Math.sin((hourAngle * Math.PI) / 180)}"
          y2="${40 - 28 * Math.cos((hourAngle * Math.PI) / 180)}"
          stroke="#4caf50"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.8"
        />`}
      </svg>
    </div>
  </div>`;
};
