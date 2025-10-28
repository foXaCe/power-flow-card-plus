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

  // Calcul du cercle de progression (comme Home)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  // Longueur du cercle rouge basée sur la progression de la journée
  const redCircumference = (dayProgressPercentage / 100) * circumference;

  // Calcul de l'angle de l'aiguille (0° = 12h en haut, sens horaire)
  const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30; // 30° par heure

  // Fonction pour créer les marqueurs d'heures
  const createHourMarker = (hour: number) => {
    const angle = hour * 30 - 90; // -90 pour commencer à 12h en haut
    const isMainHour = hour % 3 === 0; // 12, 3, 6, 9
    const outerRadius = 38;
    const innerRadius = isMainHour ? 32 : 34; // Plus long pour heures principales

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
      stroke-width="${isMainHour ? '2' : '1'}"
      opacity="0.4"
    />`;
  };

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
        ${svg`<circle
          class="daily-cost-progress"
          cx="40"
          cy="40"
          r="38"
          stroke-dasharray="${redCircumference} ${circumference - redCircumference}"
          stroke-dashoffset="-${circumference - redCircumference}"
          shape-rendering="geometricPrecision"
          stroke="#ff0000"
          stroke-width="4"
          fill="none"
          opacity="1"
        />`}
        <!-- Marqueurs d'heures -->
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(hour => createHourMarker(hour))}
        <!-- Aiguille des heures -->
        ${svg`<line
          x1="40"
          y1="40"
          x2="${40 + 20 * Math.sin((hourAngle * Math.PI) / 180)}"
          y2="${40 - 20 * Math.cos((hourAngle * Math.PI) / 180)}"
          stroke="#ff0000"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.8"
        />`}
      </svg>
    </div>
  </div>`;
};
