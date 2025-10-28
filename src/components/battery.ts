import { html, svg } from "lit";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { ConfigEntities, PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { displayValue } from "../utils/displayValue";

export const batteryElement = (
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig,
  {
    battery,
    entities,
    solar,
    grid,
  }: {
    battery: any;
    entities: ConfigEntities;
    solar?: any;
    grid?: any;
  }
) => {
  // Safe check for pulse animation
  const isPulsing = config.circle_pulse_animation &&
    battery?.state &&
    (Math.abs(battery.state.toBattery || 0) > 0 || Math.abs(battery.state.fromBattery || 0) > 0);

  // Apply custom position if configured
  const customStyle = config.custom_positions?.battery
    ? `top: ${config.custom_positions.battery.top}px; left: ${config.custom_positions.battery.left}px; bottom: auto; right: auto; transform: none;`
    : "";

  // Calculate colored circles based on charging source
  const circleCircumference = 2 * Math.PI * 38;
  const totalCharging = battery.state.toBattery || 0;
  const solarToBattery = solar?.state?.toBattery || 0;
  const gridToBattery = grid?.state?.toBattery || 0;

  const batterySolarCircumference = totalCharging > 0 && solarToBattery > 0
    ? circleCircumference * (solarToBattery / totalCharging)
    : 0;

  const batteryGridCircumference = totalCharging > 0 && gridToBattery > 0
    ? circleCircumference * (gridToBattery / totalCharging)
    : 0;

  // Cercle de niveau de charge (state_of_charge)
  const stateOfCharge = battery.state_of_charge?.state || 0;
  const chargeCircumference = (stateOfCharge / 100) * circleCircumference;
  // Offset pour commencer en haut (comme Home)
  const chargeOffset = -(circleCircumference - chargeCircumference);

  // Fonction pour créer les marqueurs de niveau (tous les 10%)
  const createChargeMarker = (percent: number) => {
    const angle = (percent / 100) * 360 - 90; // -90 pour commencer en haut
    const outerRadius = 38;
    const innerRadius = 36;

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
      stroke-width="1.5"
      opacity="0.3"
    />`;
  };

  return html`<div
      class="circle-container battery"
      style="${customStyle}"
      @mousedown=${(e: MouseEvent) => (main as any)._onDragStart?.(e, 'battery')}
      @touchstart=${(e: TouchEvent) => (main as any)._onDragStart?.(e, 'battery')}
    >
    <div
      class="circle ${isPulsing ? "pulse-animation" : ""}"
      @click=${(e: { stopPropagation: () => void; target: HTMLElement}) => {
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
      <svg>
        ${totalCharging > 0 ? svg`
          ${batterySolarCircumference > 0 ? svg`<circle
            class="solar"
            cx="40"
            cy="40"
            r="38"
            stroke-dasharray="${batterySolarCircumference} ${circleCircumference - batterySolarCircumference}"
            stroke-dashoffset="-${circleCircumference - batterySolarCircumference}"
            shape-rendering="geometricPrecision"
          />` : ''}
          ${batteryGridCircumference > 0 ? svg`<circle
            class="grid"
            cx="40"
            cy="40"
            r="38"
            stroke-dasharray="${batteryGridCircumference} ${circleCircumference - batteryGridCircumference}"
            stroke-dashoffset="-${circleCircumference - batteryGridCircumference - batterySolarCircumference}"
            shape-rendering="geometricPrecision"
          />` : ''}
        ` : svg`
          <!-- Marqueurs tous les 10% -->
          ${[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(percent => createChargeMarker(percent))}
          <!-- Cercle de niveau de charge -->
          <circle
            class="battery"
            cx="40"
            cy="40"
            r="38"
            stroke-dasharray="${chargeCircumference} ${circleCircumference - chargeCircumference}"
            stroke-dashoffset="${chargeOffset}"
            shape-rendering="geometricPrecision"
            stroke="var(--energy-battery-out-color)"
            stroke-width="4"
            fill="none"
          />
        `}
      </svg>
    </div>
    <span class="label">${battery.name}</span>
  </div>`;
};
