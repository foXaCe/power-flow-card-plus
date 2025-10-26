import { html } from "lit";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { ConfigEntities, PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { displayValue } from "../utils/displayValue";

export const batteryElement = (
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig,
  {
    battery,
    entities,
  }: {
    battery: any;
    entities: ConfigEntities;
  }
) => {
  // DEBUG: Log battery state for troubleshooting
  if (config.circle_pulse_animation) {
    console.log('[PFCP DEBUG] Battery element:', {
      hasState: !!battery?.state,
      toBattery: battery?.state?.toBattery,
      fromBattery: battery?.state?.fromBattery,
      pulsationEnabled: config.circle_pulse_animation
    });
  }

  // Safe check for pulse animation
  const isPulsing = config.circle_pulse_animation &&
    battery?.state &&
    (Math.abs(battery.state.toBattery || 0) > 0 || Math.abs(battery.state.fromBattery || 0) > 0);

  // Apply custom position if configured
  const customStyle = config.custom_positions?.battery
    ? `position: absolute; ${config.custom_positions.battery.top !== undefined ? `top: ${config.custom_positions.battery.top}px;` : ""} ${config.custom_positions.battery.left !== undefined ? `left: ${config.custom_positions.battery.left}px;` : ""}`
    : "";

  return html`<div class="circle-container battery" style="${customStyle}">
    <div
      class="circle ${isPulsing ? "pulse-animation" : ""}"
      @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
        const target = entities.battery?.state_of_charge!
          ? entities.battery?.state_of_charge!
          : typeof entities.battery?.entity === "string"
          ? entities.battery?.entity!
          : entities.battery?.entity!.production;
        main.openDetails(e, entities.battery?.tap_action, target);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          const target = entities.battery?.state_of_charge!
            ? entities.battery?.state_of_charge!
            : typeof entities.battery!.entity === "string"
            ? entities.battery!.entity!
            : entities.battery!.entity!.production;
          main.openDetails(e, entities.battery?.tap_action, target);
        }
      }}
    >
      ${battery.state_of_charge.state !== null && entities.battery?.show_state_of_charge !== false
        ? html` <span
            @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
              main.openDetails(e, entities.battery?.tap_action, entities.battery?.state_of_charge!);
            }}
            @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
              if (e.key === "Enter") {
                main.openDetails(e, entities.battery?.tap_action, entities.battery?.state_of_charge!);
              }
            }}
            id="battery-state-of-charge-text"
          >
            ${displayValue(main.hass, config, battery.state_of_charge.state, {
              unit: battery.state_of_charge.unit ?? "%",
              unitWhiteSpace: battery.state_of_charge.unit_white_space,
              decimals: battery.state_of_charge.decimals,
              accept_negative: undefined,
              watt_threshold: config.watt_threshold,
            })}
          </span>`
        : null}
      ${battery.icon !== " "
        ? html` <ha-icon
            id="battery-icon"
            .icon=${battery.icon}
            @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
              main.openDetails(e, entities.battery?.tap_action, entities.battery?.state_of_charge!);
            }}
            @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
              if (e.key === "Enter") {
                main.openDetails(e, entities.battery?.tap_action, entities.battery?.state_of_charge!);
              }
            }}
          />`
        : null}
      ${entities.battery?.display_state === "two_way" ||
      entities.battery?.display_state === undefined ||
      (entities.battery?.display_state === "one_way_no_zero" && battery.state.toBattery > 0) ||
      (entities.battery?.display_state === "one_way" && battery.state.toBattery !== 0)
        ? html`<span
            class="battery-in"
            @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
              const target = typeof entities.battery!.entity === "string" ? entities.battery!.entity! : entities.battery!.entity!.production!;

              main.openDetails(e, entities.battery?.tap_action, target);
            }}
            @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
              if (e.key === "Enter") {
                const target = typeof entities.battery!.entity === "string" ? entities.battery!.entity! : entities.battery!.entity!.production!;

                main.openDetails(e, entities.battery?.tap_action, target);
              }
            }}
          >
            <ha-icon class="small" .icon=${"mdi:arrow-down"}></ha-icon>
            ${displayValue(main.hass, config, battery.state.toBattery, {
              unit: battery.unit,
              unitWhiteSpace: battery.unit_white_space,
              decimals: battery.decimals,
              watt_threshold: config.watt_threshold,
            })}</span
          >`
        : ""}
      ${entities.battery?.display_state === "two_way" ||
      entities.battery?.display_state === undefined ||
      (entities.battery?.display_state === "one_way_no_zero" && battery.state.fromBattery > 0) ||
      (entities.battery?.display_state === "one_way" && (battery.state.toBattery === 0 || battery.state.fromBattery !== 0))
        ? html`<span
            class="battery-out"
            @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
              const target = typeof entities.battery!.entity === "string" ? entities.battery!.entity! : entities.battery!.entity!.consumption!;

              main.openDetails(e, entities.battery?.tap_action, target);
            }}
            @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
              if (e.key === "Enter") {
                const target = typeof entities.battery!.entity === "string" ? entities.battery!.entity! : entities.battery!.entity!.consumption!;

                main.openDetails(e, entities.battery?.tap_action, target);
              }
            }}
          >
            <ha-icon class="small" .icon=${"mdi:arrow-up"}></ha-icon>
            ${displayValue(main.hass, config, battery.state.fromBattery, {
              unit: battery.unit,
              unitWhiteSpace: battery.unit_white_space,
              decimals: battery.decimals,
              watt_threshold: config.watt_threshold,
            })}</span
          >`
        : ""}
    </div>
    <span class="label">${battery.name}</span>
  </div>`;
};
