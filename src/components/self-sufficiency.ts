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

  // Position personnalisée ou par défaut sous home
  const customStyle = config.custom_positions?.self_sufficiency
    ? `top: ${config.custom_positions.self_sufficiency.top}px; left: ${config.custom_positions.self_sufficiency.left}px; bottom: auto; right: auto; transform: none;`
    : "top: 322px; left: 401px;"; // Position par défaut sous home

  return html`
    <div
      class="circle-container self-sufficiency"
      style="${customStyle}"
      @mousedown=${(e: MouseEvent) => (main as any)._onDragStart?.(e, 'self-sufficiency')}
      @touchstart=${(e: TouchEvent) => (main as any)._onDragStart?.(e, 'self-sufficiency')}
    >
      <div class="circle">
        <ha-icon icon="mdi:leaf" style="color: ${color};"></ha-icon>
        <span class="self-sufficiency-value" style="color: ${color}; font-weight: 700;">${percentage}%</span>
      </div>
      <span class="label">Autosuffisance</span>
    </div>
  `;
};
