import { html } from "lit";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { ConfigEntities, PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { generalSecondarySpan } from "./spans/generalSecondarySpan";
import { displayValue } from "../utils/displayValue";
import { TemplatesObj } from "../type";
import { customPositionStyle } from "@/utils/customPositionStyle";

export const solarElement = (
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig,
  {
    solar,
    templatesObj,
  }: {
    entities: ConfigEntities;
    solar: any;
    templatesObj: TemplatesObj;
  }
) => {
  // Safe check for pulse animation
  const isPulsing = config.circle_pulse_animation && solar?.state?.total != null && solar.state.total > 0;

  // Apply custom position if configured
  const customStyle = customPositionStyle(config.custom_positions?.solar);

  // aria-label enrichi avec la valeur courante (lue par les lecteurs d'écran au
  // focus uniquement — pas d'aria-live, donc pas de ré-annonce intempestive).
  const solarValueStr =
    (solar.state.total || 0) > 0
      ? displayValue(main.hass, config, solar.state.total, {
          unit: solar.state.unit,
          unitWhiteSpace: solar.state.unit_white_space,
          decimals: solar.state.decimals,
          watt_threshold: config.watt_threshold,
        })
      : "";
  const solarAriaLabel = solarValueStr ? `${solar.name ?? "Solar"}, ${solarValueStr}` : (solar.name ?? "Solar");

  return html`<div
    class="circle-container solar"
    style="${customStyle}"
    @mousedown=${(e: MouseEvent) => (main as any)._onDragStart?.(e, "solar")}
    @touchstart=${(e: TouchEvent) => (main as any)._onDragStart?.(e, "solar")}
  >
    <span class="label">${solar.name}</span>
    <div
      class="circle ${isPulsing ? "pulse-animation" : ""}"
      role="button"
      tabindex="0"
      aria-label="${solarAriaLabel}"
      @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
        main.openDetails(e, solar.tap_action, solar.entity);
      }}
      @keydown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter" || e.key === " ") {
          main.openDetails(e, solar.tap_action, solar.entity);
        }
      }}
    >
      ${generalSecondarySpan(main.hass, main, config, templatesObj, solar, "solar")}
      ${solar.icon !== " " ? html` <ha-icon id="solar-icon" .icon=${solar.icon} />` : null}
      ${(solar.state.total || 0) > 0
        ? html` <span class="solar">
            ${displayValue(main.hass, config, solar.state.total, {
              unit: solar.state.unit,
              unitWhiteSpace: solar.state.unit_white_space,
              decimals: solar.state.decimals,
              watt_threshold: config.watt_threshold,
            })}
          </span>`
        : ""}
    </div>
  </div>`;
};
