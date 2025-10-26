import { html } from "lit";
import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { displayValue } from "../utils/displayValue";
import { generalSecondarySpan } from "./spans/generalSecondarySpan";
import { TemplatesObj } from "../type";
import { ConfigEntities, PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

export const gridElement = (
  main: PowerFlowCardPlus,
  config: PowerFlowCardPlusConfig,
  { entities, grid, templatesObj }: { entities: ConfigEntities; grid: any; templatesObj: TemplatesObj }
) => {
  // DEBUG: Log grid state for troubleshooting
  if (config.circle_pulse_animation) {
    console.log('[PFCP DEBUG] Grid element:', {
      hasState: !!grid?.state,
      fromGrid: grid?.state?.fromGrid,
      toGrid: grid?.state?.toGrid,
      pulsationEnabled: config.circle_pulse_animation
    });
  }

  // Safe check for pulse animation
  const isPulsing = config.circle_pulse_animation &&
    grid?.state &&
    (Math.abs(grid.state.fromGrid || 0) > 0 || Math.abs(grid.state.toGrid || 0) > 0);

  // Apply custom position if configured
  const customStyle = config.custom_positions?.grid
    ? `position: absolute; ${config.custom_positions.grid.top !== undefined ? `top: ${config.custom_positions.grid.top}px;` : ""} ${config.custom_positions.grid.left !== undefined ? `left: ${config.custom_positions.grid.left}px;` : ""}`
    : "";

  return html`<div class="circle-container grid" style="${customStyle}">
    <div
      class="circle ${isPulsing ? "pulse-animation" : ""}"
      @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
        const outageTarget = grid.powerOutage?.entityGenerator ?? entities.grid?.power_outage?.entity;
        const target =
          grid.powerOutage?.isOutage && outageTarget
            ? outageTarget
            : typeof entities.grid!.entity === "string"
            ? entities.grid!.entity
            : entities.grid!.entity.consumption!;
        main.openDetails(e, entities.grid?.tap_action, target);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          const outageTarget = grid.powerOutage?.entityGenerator ?? entities.grid?.power_outage?.entity;
          const target =
            grid.powerOutage?.isOutage && outageTarget
              ? outageTarget
              : typeof entities.grid!.entity === "string"
              ? entities.grid!.entity
              : entities.grid!.entity.consumption!;
          main.openDetails(e, entities.grid?.tap_action, target);
        }
      }}
    >
      ${generalSecondarySpan(main.hass, main, config, templatesObj, grid, "grid")}
      ${grid.icon !== " " ? html` <ha-icon id="grid-icon" .icon=${grid.icon} />` : null}
      ${(entities.grid?.display_state === "two_way" ||
        entities.grid?.display_state === undefined ||
        (entities.grid?.display_state === "one_way_no_zero" && (grid.state.toGrid ?? 0) > 0) ||
        (entities.grid?.display_state === "one_way" && (grid.state.fromGrid ?? 0) == 0)) &&
      grid.state.toGrid !== null &&
      !grid.powerOutage.isOutage
        ? html`<span
            class="return"
            @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
              const target = typeof entities.grid!.entity === "string" ? entities.grid!.entity : entities.grid!.entity.production!;
              main.openDetails(e, entities.grid?.tap_action, target);
            }}
            @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
              if (e.key === "Enter") {
                const target = typeof entities.grid!.entity === "string" ? entities.grid!.entity : entities.grid!.entity.production!;
                main.openDetails(e, entities.grid?.tap_action, target);
              }
            }}
          >
            <ha-icon class="small" .icon=${"mdi:arrow-left"}></ha-icon>

            ${displayValue(main.hass, config, grid.state.toGrid, {
              unit: grid.unit,
              unitWhiteSpace: grid.unit_white_space,
              decimals: grid.decimals,
              watt_threshold: config.watt_threshold,
            })}
          </span>`
        : null}
      ${((entities.grid?.display_state === "two_way" ||
        entities.grid?.display_state === undefined ||
        (entities.grid?.display_state === "one_way_no_zero" && grid.state.fromGrid > 0) ||
        (entities.grid?.display_state === "one_way" && (grid.state.toGrid ?? 0) == 0 && grid.state.fromGrid > 0)) &&
        grid.state.fromGrid !== null &&
        !grid.powerOutage.isOutage) ||
      (grid.powerOutage.isOutage && !!grid.powerOutage.entityGenerator)
        ? html` <span
            class="consumption"
            @click=${(e: { stopPropagation: () => void; target: HTMLElement }) => {
              const target = typeof entities.grid!.entity === "string" ? entities.grid!.entity : entities.grid!.entity.consumption!;
              main.openDetails(e, entities.grid?.tap_action, target);
            }}
            @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
              if (e.key === "Enter") {
                const target = typeof entities.grid!.entity === "string" ? entities.grid!.entity : entities.grid!.entity.consumption!;
                main.openDetails(e, entities.grid?.tap_action, target);
              }
            }}
          >
            <ha-icon class="small" .icon=${"mdi:arrow-right"}></ha-icon>
            ${displayValue(main.hass, config, grid.state.fromGrid, {
              unit: grid.unit,
              unitWhiteSpace: grid.unit_white_space,
              decimals: grid.decimals,
              watt_threshold: config.watt_threshold,
            })}
          </span>`
        : ""}
      ${grid.powerOutage?.isOutage && !grid.powerOutage?.entityGenerator ? html`<span class="grid power-outage">${grid.powerOutage.name}</span>` : ""}
    </div>
    <span class="label">${grid.name}</span>
    ${grid.cost?.enabled && grid.cost.tariff > 0 && grid.state.fromGrid > 0
      ? html`<span class="cost-info">
          ${((grid.state.fromGrid / 1000) * grid.cost.tariff).toFixed(grid.cost.decimals)} ${grid.cost.unit.replace('/kWh', '/h')}
        </span>`
      : ""}
  </div>`;
};
