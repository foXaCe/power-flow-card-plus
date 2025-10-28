import { html } from "lit";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { calculateSelfSufficiency, getSelfSufficiencyColor } from "@/utils/calculateSelfSufficiency";

interface SelfSufficiencyProps {
  solarToHome: number;
  batteryToHome: number;
  gridToHome: number;
}

export const selfSufficiencyElement = (
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

  // Position par défaut: top-right
  const position = config.self_sufficiency_position || 'top-right';
  const positionStyles: Record<string, string> = {
    'top-right': 'top: 10px; right: 10px;',
    'top-left': 'top: 10px; left: 10px;',
    'bottom-right': 'bottom: 10px; right: 10px;',
    'bottom-left': 'bottom: 10px; left: 10px;'
  };

  return html`
    <div
      class="self-sufficiency-indicator"
      style="position: absolute; ${positionStyles[position]} z-index: 100;"
    >
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        background: var(--card-background-color);
        border-radius: 12px;
        padding: 8px 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid var(--divider-color);
      ">
        <span style="
          font-size: 10px;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">Autosuffisance</span>

        <div style="position: relative; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;">
          <svg width="70" height="70" style="position: absolute; transform: rotate(-90deg);">
            <!-- Cercle de fond -->
            <circle
              cx="35"
              cy="35"
              r="${radius}"
              fill="none"
              stroke="var(--disabled-text-color)"
              stroke-width="4"
              opacity="0.2"
            />
            <!-- Cercle de progression -->
            <circle
              cx="35"
              cy="35"
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
              font-size: 20px;
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
