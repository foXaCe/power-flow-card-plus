import { html, svg } from "lit";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { calculateSelfSufficiency, getSelfSufficiencyColor } from "@/utils/calculateSelfSufficiency";
import { PowerFlowCardPlus } from "@/power-flow-card-plus";

interface SelfSufficiencyProps {
  solarToHome: number;
  batteryToHome: number;
  gridToHome: number;
}

export const selfSufficiencyElement = (
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig,
  { solarToHome, batteryToHome, gridToHome }: SelfSufficiencyProps
) => {
  // Si la fonctionnalité n'est pas activée, ne rien afficher
  if (!config.show_self_sufficiency) return html``;

  const percentage = calculateSelfSufficiency(solarToHome, batteryToHome, gridToHome);
  const color = getSelfSufficiencyColor(percentage);

  // Cercle de progression SVG
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Position personnalisée ou par défaut sous home
  const customStyle = config.custom_positions?.self_sufficiency
    ? `top: ${config.custom_positions.self_sufficiency.top}px; left: ${config.custom_positions.self_sufficiency.left}px; bottom: auto; right: auto; transform: none;`
    : "top: 322px; left: 401px;"; // Position par défaut sous home

  return html`
    <div
      class="circle-container self-sufficiency"
      style="${customStyle}"
    >
      <span class="label">Autosuffisance</span>
      <div class="circle" style="background-color: var(--card-background-color);">
        <div style="
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="80" height="80" style="position: absolute; transform: rotate(-90deg);">
            <!-- Cercle de fond -->
            <circle
              cx="40"
              cy="40"
              r="${radius}"
              fill="none"
              stroke="var(--disabled-text-color)"
              stroke-width="4"
              opacity="0.2"
            />
            <!-- Cercle de progression -->
            <circle
              cx="40"
              cy="40"
              r="${radius}"
              fill="none"
              stroke="${color}"
              stroke-width="4"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"
              stroke-linecap="round"
              style="transition: stroke-dashoffset 0.5s ease, stroke 0.5s ease;"
            />
          </svg>

          <div style="
            position: relative;
            z-index: 1;
            text-align: center;
          ">
            <div style="
              font-size: 22px;
              font-weight: 700;
              color: ${color};
              line-height: 1;
            ">${percentage}%</div>
          </div>
        </div>
      </div>
    </div>
  `;
};
