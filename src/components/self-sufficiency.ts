import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { PowerFlowCardPlusConfig } from "@/power-flow-card-plus-config";
import { calculateSelfSufficiency, getSelfSufficiencyColor } from "@/utils/calculateSelfSufficiency";
import { PowerFlowCardPlus } from "@/power-flow-card-plus";
import localize from "../localize/localize";

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

  // Position personnalisée ou par défaut sous home (centrée)
  const customStyle = config.custom_positions?.self_sufficiency
    ? `top: ${config.custom_positions.self_sufficiency.top}px; left: ${config.custom_positions.self_sufficiency.left}px; bottom: auto; right: auto; transform: none;`
    : "top: 322px; left: 50%; transform: translateX(-50%);"; // Position par défaut sous home, centrée

  return html`
    <div
      class="circle-container self-sufficiency"
      style="${customStyle}"
      @mousedown=${(e: MouseEvent) => (main as any)._onDragStart?.(e, "self-sufficiency")}
      @touchstart=${(e: TouchEvent) => (main as any)._onDragStart?.(e, "self-sufficiency")}
    >
      <div class="circle" role="button" tabindex="0">
        <ha-icon icon="mdi:leaf" style=${styleMap({ color })}></ha-icon>
        <span class="self-sufficiency-value" style=${styleMap({ color, fontWeight: "700" })}>${percentage}%</span>
      </div>
      <span class="label">${localize("card.self_sufficiency")}</span>
    </div>
  `;
};
