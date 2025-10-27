import { html } from "lit";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { ConfigEntities, PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { generalSecondarySpan } from "./spans/generalSecondarySpan";
import { displayValue } from "../utils/displayValue";
import { TemplatesObj } from "../type";

export const solarElement = (
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig,
  {
    entities,
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
  const customStyle = config.custom_positions?.solar
    ? `top: ${config.custom_positions.solar.top}px; left: ${config.custom_positions.solar.left}px; bottom: auto; right: auto; transform: none;`
    : "";

  return html`<div
      class="circle-container solar"
      style="${customStyle}"
      @mousedown=${(e: MouseEvent) => (main as any)._onDragStart?.(e, 'solar')}
      @touchstart=${(e: TouchEvent) => (main as any)._onDragStart?.(e, 'solar')}
    >
    <span class="label">${solar.name}</span>
    <div
      class="circle ${isPulsing ? "pulse-animation" : ""}"
      @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
        main.openDetails(e, solar.tap_action, solar.entity);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          main.openDetails(e, solar.tap_action, solar.entity);
        }
      }}
    >
      ${generalSecondarySpan(main.hass, main, config, templatesObj, solar, "solar")}
      ${solar.icon !== " " ? html` <ha-icon id="solar-icon" .icon=${solar.icon} />` : null}
      ${entities.solar?.display_zero_state !== false || (solar.state.total || 0) > 0
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
