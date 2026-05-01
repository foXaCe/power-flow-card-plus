import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { assert, StructError } from "superstruct";
import { ActionConfig, HomeAssistant, LovelaceCardEditor } from "./ha";
import { batteryElement } from "./components/battery";
import { dailyCostElement } from "./components/daily-cost";
import { dailyExportElement } from "./components/daily-export";
import { flowElement } from "./components/flows";
import { gridElement } from "./components/grid";
import { homeElement } from "./components/home";
import { selfSufficiencyElement } from "./components/self-sufficiency";
import { dashboardLinkElement } from "./components/misc/dashboard_link";
import { solarElement } from "./components/solar";
import { handleAction } from "./ha/panels/lovelace/common/handle-action";
import { PowerFlowCardPlusConfig } from "./power-flow-card-plus-config";
import { cardConfigStruct } from "./power-flow-card-plus-config-schema";
import { getBatteryInState, getBatteryOutState, getBatteryStateOfCharge } from "./states/raw/battery";
import { getGridConsumptionState, getGridProductionState, getGridSecondaryState } from "./states/raw/grid";
import { getHomeSecondaryState } from "./states/raw/home";
import { getIndividualObject, IndividualObject } from "./states/raw/individual/getIndividualObject";
import { getNonFossilHas, getNonFossilHasPercentage, getNonFossilSecondaryState } from "./states/raw/nonFossil";
import { getSolarSecondaryState, getSolarState } from "./states/raw/solar";
import { adjustZeroTolerance } from "./states/tolerance/base";
import { doesEntityExist } from "./states/utils/existenceEntity";
import { getEntityState } from "./states/utils/getEntityState";
import { getEntityStateWatts } from "./states/utils/getEntityStateWatts";
import { styles } from "./style";
import { allDynamicStyles } from "./style/all";
import { RenderTemplateResult, subscribeRenderTemplate } from "./template/ha-websocket.js";
import { GridObject, HomeSources, NewDur, TemplatesObj } from "./type";
import { computeFieldIcon, computeFieldName } from "./utils/computeFieldAttributes";
import { computeFlowRate } from "./utils/computeFlowRate";

import { displayValue } from "./utils/displayValue";
import { defaultValues, getDefaultConfig } from "./utils/get-default-config";
import { registerCustomCard } from "./utils/register-custom-card";
import { coerceNumber } from "./utils/utils";
import { setupCustomlocalize } from "./localize/localize";

const circleCircumference = 238.76104;

registerCustomCard({
  type: "power-flow-card-plus",
  name: "Power Flow Card Plus",
  description:
    "An extended version of the power flow card with richer options, advanced features and a few small UI enhancements. Inspired by the Energy Dashboard.",
});

@customElement("power-flow-card-plus")
export class PowerFlowCardPlus extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config = {} as PowerFlowCardPlusConfig;

  @state() private _templateResults: Partial<Record<string, RenderTemplateResult>> = {};
  @state() private _unsubRenderTemplates?: Map<string, Promise<UnsubscribeFunc>> = new Map();
  @state() private _width = 0;
  @state() private _draggedElement: string | null = null;
  @state() private _hasDragged = false;
  // Position transitoire pendant le drag — évite de cloner toute la config Lovelace à chaque frame.
  // Le commit définitif dans `_config.custom_positions` se fait dans `_onDragEnd`.
  @state() private _dragPositionOverride?: { element: string; left: number; top: number };

  @query("#battery-grid-flow") batteryGridFlow?: SVGSVGElement;
  @query("#battery-home-flow") batteryToHomeFlow?: SVGSVGElement;
  @query("#grid-home-flow") gridToHomeFlow?: SVGSVGElement;
  @query("#solar-battery-flow") solarToBatteryFlow?: SVGSVGElement;
  @query("#solar-grid-flow") solarToGridFlow?: SVGSVGElement;
  @query("#solar-home-flow") solarToHomeFlow?: SVGSVGElement;

  setConfig(config: PowerFlowCardPlusConfig): void {
    // Backward-compat: legacy `individual1`/`individual2` keys must be detected before
    // structural validation so users get a targeted upgrade message rather than a
    // generic schema error.
    if ((config?.entities as any)?.individual1 || (config?.entities as any)?.individual2) {
      throw new Error("You are using an outdated configuration. Please update your configuration to the latest version.");
    }
    // Structural validation — `cardConfigStruct` is permissive (uses `type()`),
    // so extra/unknown keys pass through unchanged. Only obvious type mismatches
    // (e.g. `min_flow_rate: "fast"`) are rejected with a readable message.
    try {
      assert(config, cardConfigStruct);
    } catch (err) {
      if (err instanceof StructError) {
        throw new Error(`Power Flow Card Plus: invalid configuration — ${err.message}`);
      }
      throw err;
    }
    if (!config.entities || (!config.entities?.battery?.entity && !config.entities?.grid?.entity && !config.entities?.solar?.entity)) {
      throw new Error("At least one entity for battery, grid or solar must be defined");
    }
    // Deep clone the incoming config to avoid mutating the external Lovelace config
    const clonedConfig: PowerFlowCardPlusConfig = JSON.parse(JSON.stringify(config));
    this._config = {
      ...clonedConfig,
      kw_decimals: coerceNumber(clonedConfig.kw_decimals, defaultValues.kilowattDecimals),
      min_flow_rate: coerceNumber(clonedConfig.min_flow_rate, defaultValues.minFlowRate),
      max_flow_rate: coerceNumber(clonedConfig.max_flow_rate, defaultValues.maxFlowRate),
      w_decimals: coerceNumber(clonedConfig.w_decimals, defaultValues.wattDecimals),
      watt_threshold: coerceNumber(clonedConfig.watt_threshold, defaultValues.wattThreshold),
      max_expected_power: coerceNumber(clonedConfig.max_expected_power, defaultValues.maxExpectedPower),
      min_expected_power: coerceNumber(clonedConfig.min_expected_power, defaultValues.minExpectedPower),
      display_zero_lines: {
        mode: clonedConfig.display_zero_lines?.mode ?? defaultValues.displayZeroLines.mode,
        transparency: coerceNumber(clonedConfig.display_zero_lines?.transparency, defaultValues.displayZeroLines.transparency),
        grey_color: clonedConfig.display_zero_lines?.grey_color ?? defaultValues.displayZeroLines.grey_color,
      },
    };
  }

  private _clockInterval?: number;
  private _activeDragHandlers?: { moveHandler: (ev: MouseEvent | TouchEvent) => void; upHandler: () => void };

  public connectedCallback() {
    super.connectedCallback();
    this._tryConnectAll();
    // Charger les positions depuis localStorage (config par appareil)
    this._loadFromLocalStorage();
    // Refresh daily clocks (cost / export) every minute so the hour hand updates
    if (this._clockInterval === undefined) {
      this._clockInterval = window.setInterval(() => {
        if (this._config?.show_daily_cost || this._config?.show_daily_export) {
          this.requestUpdate();
        }
      }, 60_000);
    }
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    for (const topic of this._unsubRenderTemplates?.keys() ?? []) {
      this._tryDisconnect(topic);
    }
    // Clear any in-progress drag (release document listeners)
    if (this._activeDragHandlers) {
      const { moveHandler, upHandler } = this._activeDragHandlers;
      this._onDragEnd(moveHandler, upHandler);
    }
    if (this._clockInterval !== undefined) {
      clearInterval(this._clockInterval);
      this._clockInterval = undefined;
    }
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (
      changed.has("_config") ||
      changed.has("_templateResults") ||
      changed.has("_width") ||
      changed.has("_draggedElement") ||
      changed.has("_dragPositionOverride")
    ) {
      return true;
    }
    if (!changed.has("hass")) return false;
    return true;
  }

  // do not use ui editor for now, as it is not working
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("./ui-editor/ui-editor");
    return document.createElement("power-flow-card-plus-editor");
  }

  public static getStubConfig(hass: HomeAssistant): object {
    // get available power entities
    return getDefaultConfig(hass);
  }

  public getCardSize(): Promise<number> | number {
    let size = 8; // base ~400px
    if (this._config?.entities?.fossil_fuel_percentage?.entity) size += 1;
    if (this._config?.show_daily_cost) size += 1;
    if (this._config?.show_daily_export) size += 1;
    return size;
  }

  // Lovelace section views (HA 2024.3+) — placement intelligent dans la grille de la section
  public getGridOptions(): {
    columns: number | "full";
    rows: number | "auto";
    min_columns?: number;
    max_columns?: number;
    min_rows?: number;
    max_rows?: number;
  } {
    let rows = 6; // base ~400px (50px par row)
    if (this._config?.entities?.fossil_fuel_percentage?.entity) rows += 1;
    if (this._config?.show_daily_cost || this._config?.show_daily_export) rows += 1;
    return {
      columns: 12,
      rows,
      min_columns: 6,
      max_columns: 12,
      min_rows: rows,
    };
  }

  private previousDur: { [name: string]: number } = {};

  public openDetails(
    event: { stopPropagation: () => void; key?: string; target: HTMLElement },
    config?: ActionConfig,
    entityId?: string | undefined
  ): void {
    event.stopPropagation();

    // Ne pas ouvrir les détails si un drag vient de se terminer
    if (this._hasDragged) {
      this._hasDragged = false;
      return;
    }

    if (!config) {
      if (!entityId || !this._config.clickable_entities) return;
      /* also needs to open details if entity is unavailable, but not if entity doesn't exist is hass states */
      if (!doesEntityExist(this.hass, entityId)) return;
      const e = new CustomEvent("hass-more-info", {
        composed: true,
        detail: { entityId },
      });
      this.dispatchEvent(e);
      return;
    }

    handleAction(
      event.target,
      this.hass!,
      {
        entity: entityId,
        tap_action: config,
      },
      "tap"
    );
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    const { entities } = this._config;

    // `effectiveConfig` reflète la position transitoire pendant le drag sans cloner
    // toute la config Lovelace à chaque frame. Pas de drag actif → on réutilise
    // `this._config` tel quel (référence inchangée).
    const effectiveConfig: PowerFlowCardPlusConfig = this._dragPositionOverride
      ? {
          ...this._config,
          custom_positions: {
            ...(this._config.custom_positions ?? {}),
            [this._dragPositionOverride.element.replace(/-/g, "_")]: {
              left: this._dragPositionOverride.left,
              top: this._dragPositionOverride.top,
            },
          },
        }
      : this._config;

    this.style.setProperty("--clickable-cursor", this._config.clickable_entities ? "pointer" : "default");

    const initialNumericState = null as null | number;

    const grid: GridObject = {
      entity: entities.grid?.entity,
      has: entities?.grid?.entity !== undefined,
      hasReturnToGrid: typeof entities.grid?.entity === "string" || !!entities.grid?.entity?.production,
      state: {
        fromGrid: getGridConsumptionState(this.hass, this._config),
        toGrid: getGridProductionState(this.hass, this._config),
        toBattery: initialNumericState,
        toHome: initialNumericState,
      },
      powerOutage: {
        has: entities.grid?.power_outage?.entity !== undefined,
        isOutage:
          (entities.grid && this.hass.states[entities.grid.power_outage?.entity]?.state) === (entities.grid?.power_outage?.state_alert ?? "on"),
        icon: entities.grid?.power_outage?.icon_alert || "mdi:transmission-tower-off",
        name: entities.grid?.power_outage?.label_alert ?? html`Power<br />Outage`,
        entityGenerator: entities.grid?.power_outage?.entity_generator,
      },
      icon: computeFieldIcon(this.hass, entities.grid, "mdi:transmission-tower"),
      name: computeFieldName(this.hass, entities.grid, this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.grid")),
      mainEntity:
        typeof entities.grid?.entity === "object" ? entities.grid.entity.consumption || entities.grid.entity.production : entities.grid?.entity,
      color: {
        fromGrid: entities.grid?.color?.consumption,
        toGrid: entities.grid?.color?.production,
        icon_type: entities.grid?.color_icon as boolean | "consumption" | "production" | undefined,
        circle_type: entities.grid?.color_circle,
      },
      tap_action: entities.grid?.tap_action,
      secondary: {
        entity: entities.grid?.secondary_info?.entity,
        decimals: entities.grid?.secondary_info?.decimals,
        template: entities.grid?.secondary_info?.template,
        has: entities.grid?.secondary_info?.entity !== undefined,
        state: getGridSecondaryState(this.hass, this._config),
        icon: entities.grid?.secondary_info?.icon,
        unit: entities.grid?.secondary_info?.unit_of_measurement,
        unit_white_space: entities.grid?.secondary_info?.unit_white_space,
        accept_negative: entities.grid?.secondary_info?.accept_negative || false,
        color: {
          type: entities.grid?.secondary_info?.color_value,
        },
        tap_action: entities.grid?.secondary_info?.tap_action,
      },
      cost: {
        enabled: this._config.show_cost ?? false,
        entity: this._config.cost_entity,
        tariff: this._safeStateNumber(this._config.cost_entity),
        unit: this._config.cost_unit || "€/kWh",
        decimals: this._config.cost_decimals ?? 2,
      },
    };

    const solar = {
      entity: entities.solar?.entity as string | undefined,
      has: entities.solar?.entity !== undefined,
      state: {
        total: getSolarState(this.hass, this._config),
        toHome: initialNumericState,
        toGrid: initialNumericState,
        toBattery: initialNumericState,
      },
      icon: computeFieldIcon(this.hass, entities.solar, "mdi:solar-power-variant"),
      name: computeFieldName(this.hass, entities.solar, this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.solar")),
      tap_action: entities.solar?.tap_action,
      secondary: {
        entity: entities.solar?.secondary_info?.entity,
        decimals: entities.solar?.secondary_info?.decimals,
        template: entities.solar?.secondary_info?.template,
        has: entities.solar?.secondary_info?.entity !== undefined,
        accept_negative: entities.solar?.secondary_info?.accept_negative || false,
        state: getSolarSecondaryState(this.hass, this._config),
        icon: entities.solar?.secondary_info?.icon,
        unit: entities.solar?.secondary_info?.unit_of_measurement,
        unit_white_space: entities.solar?.secondary_info?.unit_white_space,
        tap_action: entities.solar?.secondary_info?.tap_action,
      },
    };

    const checkIfHasBattery = () => {
      if (!entities.battery?.entity) return false;
      if (typeof entities.battery?.entity === "object") return entities.battery?.entity.consumption || entities.battery?.entity.production;
      return entities.battery?.entity !== undefined;
    };

    const battery = {
      entity: entities.battery?.entity,
      has: checkIfHasBattery(),
      mainEntity: typeof entities.battery?.entity === "object" ? entities.battery.entity.consumption : entities.battery?.entity,
      name: computeFieldName(this.hass, entities.battery, this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.battery")),
      icon: computeFieldIcon(this.hass, entities.battery, "mdi:battery-high"),
      state_of_charge: {
        state: getBatteryStateOfCharge(this.hass, this._config),
        unit: entities?.battery?.state_of_charge_unit ?? "%",
        unit_white_space: entities?.battery?.state_of_charge_unit_white_space ?? true,
        decimals: entities?.battery?.state_of_charge_decimals || 0,
      },
      state: {
        toBattery: getBatteryInState(this.hass, this._config),
        fromBattery: getBatteryOutState(this.hass, this._config),
        toGrid: 0,
        toHome: 0,
      },
      tap_action: entities.battery?.tap_action,
      color: {
        fromBattery: entities.battery?.color?.consumption,
        toBattery: entities.battery?.color?.production,
        icon_type: undefined as string | boolean | undefined,
        circle_type: entities.battery?.color_circle,
      },
    };

    const home = {
      entity: entities.home?.entity,
      has: entities?.home?.entity !== undefined,
      state: initialNumericState,
      icon: computeFieldIcon(this.hass, entities?.home, "mdi:home"),
      name: computeFieldName(this.hass, entities?.home, this.hass.localize("ui.panel.lovelace.cards.energy.energy_distribution.home")),
      tap_action: entities.home?.tap_action,
      secondary: {
        entity: entities.home?.secondary_info?.entity,
        template: entities.home?.secondary_info?.template,
        has: entities.home?.secondary_info?.entity !== undefined,
        state: getHomeSecondaryState(this.hass, this._config),
        accept_negative: entities.home?.secondary_info?.accept_negative || false,
        unit: entities.home?.secondary_info?.unit_of_measurement,
        unit_white_space: entities.home?.secondary_info?.unit_white_space,
        icon: entities.home?.secondary_info?.icon,
        decimals: entities.home?.secondary_info?.decimals,
        tap_action: entities.home?.secondary_info?.tap_action,
      },
    };

    type IndividualObjects = IndividualObject[] | [];
    const individualObjs: IndividualObjects = entities.individual?.map((individual) => getIndividualObject(this.hass, individual)) || [];

    const nonFossil = {
      entity: entities.fossil_fuel_percentage?.entity,
      name: computeFieldName(this.hass, entities.fossil_fuel_percentage, this.hass.localize("card.label.non_fossil_fuel_percentage")),
      icon: computeFieldIcon(this.hass, entities.fossil_fuel_percentage, "mdi:leaf"),
      has: getNonFossilHas(this.hass, this._config),
      hasPercentage: getNonFossilHasPercentage(this.hass, this._config),
      state: {
        power: initialNumericState,
      },
      color: entities.fossil_fuel_percentage?.color,
      color_value: entities.fossil_fuel_percentage?.color_value,
      tap_action: entities.fossil_fuel_percentage?.tap_action,
      secondary: {
        entity: entities.fossil_fuel_percentage?.secondary_info?.entity,
        decimals: entities.fossil_fuel_percentage?.secondary_info?.decimals,
        template: entities.fossil_fuel_percentage?.secondary_info?.template,
        has: entities.fossil_fuel_percentage?.secondary_info?.entity !== undefined,
        state: getNonFossilSecondaryState(this.hass, this._config),
        accept_negative: entities.fossil_fuel_percentage?.secondary_info?.accept_negative || false,
        icon: entities.fossil_fuel_percentage?.secondary_info?.icon,
        unit: entities.fossil_fuel_percentage?.secondary_info?.unit_of_measurement,
        unit_white_space: entities.fossil_fuel_percentage?.secondary_info?.unit_white_space,
        color_value: entities.fossil_fuel_percentage?.secondary_info?.color_value,
        tap_action: entities.fossil_fuel_percentage?.secondary_info?.tap_action,
      },
    };

    const localize = setupCustomlocalize(this.hass);

    const dailyCost = {
      enabled: this._config.show_daily_cost ?? false,
      entity: this._config.daily_cost_energy_entity,
      name: localize("editor.daily_cost_title"),
      energy: this._safeStateNumber(this._config.daily_cost_energy_entity),
      tariff: this._config.cost_entity && grid.cost ? grid.cost.tariff : 0,
      unit: grid.cost?.unit || "€",
      decimals: this._config.daily_cost_decimals ?? 2,
      totalCost: 0,
    };
    dailyCost.totalCost = dailyCost.energy * dailyCost.tariff;

    const dailyExport = {
      enabled: this._config.show_daily_export ?? false,
      entity: this._config.daily_export_energy_entity,
      name: localize("editor.daily_export_title"),
      energy: this._safeStateNumber(this._config.daily_export_energy_entity),
      price: this._config.daily_export_price ?? 0,
      decimals: this._config.daily_export_decimals ?? 2,
      totalRevenue: 0,
    };
    dailyExport.totalRevenue = dailyExport.energy * dailyExport.price;

    // Reset Values below Display Zero Tolerance
    grid.state.fromGrid = adjustZeroTolerance(grid.state.fromGrid, entities.grid?.display_zero_tolerance);
    grid.state.toGrid = adjustZeroTolerance(grid.state.toGrid, entities.grid?.display_zero_tolerance);
    solar.state.total = adjustZeroTolerance(solar.state.total, entities.solar?.display_zero_tolerance);
    battery.state.fromBattery = adjustZeroTolerance(battery.state.fromBattery, entities.battery?.display_zero_tolerance);
    battery.state.toBattery = adjustZeroTolerance(battery.state.toBattery, entities.battery?.display_zero_tolerance);
    if (grid.state.fromGrid === 0) {
      grid.state.toHome = 0;
      grid.state.toBattery = 0;
    }
    if (solar.state.total === 0) {
      solar.state.toGrid = 0;
      solar.state.toBattery = 0;
      solar.state.toHome = 0;
    }
    if (battery.state.fromBattery === 0) {
      battery.state.toGrid = 0;
      battery.state.toHome = 0;
    }

    if (solar.has) {
      solar.state.toHome = (solar.state.total ?? 0) - (grid.state.toGrid ?? 0) - (battery.state.toBattery ?? 0);
    }
    const largestGridBatteryTolerance = Math.max(entities.grid?.display_zero_tolerance ?? 0, entities.battery?.display_zero_tolerance ?? 0);

    if (solar.state.toHome !== null && solar.state.toHome < 0) {
      // What we returned to the grid and what went in to the battery is more
      // than produced, so we have used grid energy to fill the battery or
      // returned battery energy to the grid
      if (battery.has) {
        grid.state.toBattery = Math.abs(solar.state.toHome);
        if (grid.state.toBattery > (grid.state.fromGrid ?? 0)) {
          battery.state.toGrid = Math.min(grid.state.toBattery - (grid.state.fromGrid ?? 0), 0);
          grid.state.toBattery = grid.state.fromGrid;
        }
      }
      solar.state.toHome = 0;
    } else if (battery.state.toBattery && battery.state.toBattery > 0) {
      // Allocate PV to the battery first; only the remainder can be Grid → Battery.
      const pvTotal = Math.max(solar.state.total ?? 0, 0);
      const battCharge = Math.max(battery.state.toBattery ?? 0, 0);
      const gridExport = Math.max(grid.state.toGrid ?? 0, 0); // 0 if you don't have export

      // PV → Battery portion (capped by battery charge)
      const pvToBattery = Math.min(pvTotal, battCharge);

      // Residual charge must come from the grid
      grid.state.toBattery = Math.max(battCharge - pvToBattery, 0);

      // PV left for Home after reserving PV→Battery (and any export)
      solar.state.toHome = Math.max(pvTotal - pvToBattery - gridExport, 0);

      // Explicit PV→Battery for rendering
      solar.state.toBattery = pvToBattery;
    }
    grid.state.toBattery = (grid.state.toBattery ?? 0) > largestGridBatteryTolerance ? grid.state.toBattery : 0;

    if (battery.has) {
      if (solar.has) {
        if (!battery.state.toGrid) {
          battery.state.toGrid = Math.max(
            0,
            (grid.state.toGrid || 0) - (solar.state.total || 0) - (battery.state.toBattery || 0) - (grid.state.toBattery || 0)
          );
        }
        solar.state.toBattery = battery.state.toBattery - (grid.state.toBattery || 0);
        if (entities.solar?.display_zero_tolerance) {
          if (entities.solar.display_zero_tolerance >= (solar.state.total || 0)) solar.state.toBattery = 0;
        }
      } else {
        battery.state.toGrid = grid.state.toGrid || 0;
      }
      battery.state.toGrid = (battery.state.toGrid || 0) > largestGridBatteryTolerance ? battery.state.toGrid || 0 : 0;
      battery.state.toHome = (battery.state.fromBattery ?? 0) - (battery.state.toGrid ?? 0);
    }

    grid.state.toHome = Math.max((grid.state.fromGrid ?? 0) - (grid.state.toBattery ?? 0), 0);

    if (solar.has && grid.state.toGrid) solar.state.toGrid = grid.state.toGrid - (battery.state.toGrid ?? 0);

    // Handle Power Outage
    if (grid.powerOutage.isOutage) {
      grid.state.fromGrid = grid.powerOutage.entityGenerator ? Math.max(getEntityStateWatts(this.hass, grid.powerOutage.entityGenerator), 0) : 0;
      grid.state.toHome = Math.max((grid.state.fromGrid ?? 0) - (grid.state.toBattery ?? 0), 0);
      grid.state.toGrid = 0;
      battery.state.toGrid = 0;
      solar.state.toGrid = 0;
      grid.icon = grid.powerOutage.icon;
      nonFossil.has = false;
      nonFossil.hasPercentage = false;
    }

    // Set Initial State for Non Fossil Fuel Percentage
    if (nonFossil.has) {
      const nonFossilFuelDecimal = 1 - (getEntityState(this.hass, entities.fossil_fuel_percentage?.entity) ?? 0) / 100;
      nonFossil.state.power = grid.state.toHome * nonFossilFuelDecimal;
    }

    // Calculate Individual Consumption, ignore not shown objects
    const totalIndividualConsumption = individualObjs?.reduce((a, b) => a + (b.has ? b.state || 0 : 0), 0) || 0;

    // Calculate Total Consumptions
    const totalHomeConsumption = Math.max(grid.state.toHome + (solar.state.toHome ?? 0) + (battery.state.toHome ?? 0), 0);

    // Calculate Circumferences (guard against division by zero)
    const safeTotalHomeConsumption = totalHomeConsumption > 0 ? totalHomeConsumption : 1;
    const homeBatteryCircumference =
      battery.state.toHome && totalHomeConsumption > 0 ? circleCircumference * (battery.state.toHome / safeTotalHomeConsumption) : 0;
    const homeSolarCircumference =
      solar.state.toHome && totalHomeConsumption > 0 ? circleCircumference * (solar.state.toHome / safeTotalHomeConsumption) : 0;
    const homeNonFossilCircumference =
      nonFossil.state.power && totalHomeConsumption > 0 ? circleCircumference * (nonFossil.state.power / safeTotalHomeConsumption) : 0;
    const homeGridCircumference =
      totalHomeConsumption > 0
        ? circleCircumference *
          ((totalHomeConsumption - (nonFossil.state.power ?? 0) - (battery.state.toHome ?? 0) - (solar.state.toHome ?? 0)) / safeTotalHomeConsumption)
        : 0;

    const homeUsageToDisplay =
      entities.home?.override_state && entities.home.entity
        ? entities.home?.subtract_individual
          ? displayValue(this.hass, this._config, getEntityStateWatts(this.hass, entities.home.entity) - totalIndividualConsumption, {
              unit: entities.home?.unit_of_measurement,
              unitWhiteSpace: entities.home?.unit_white_space,
              watt_threshold: this._config.watt_threshold,
            })
          : displayValue(this.hass, this._config, getEntityStateWatts(this.hass, entities.home.entity), {
              unit: entities.home?.unit_of_measurement,
              unitWhiteSpace: entities.home?.unit_white_space,
              watt_threshold: this._config.watt_threshold,
            })
        : entities.home?.subtract_individual
          ? displayValue(this.hass, this._config, totalHomeConsumption - totalIndividualConsumption || 0, {
              unit: entities.home?.unit_of_measurement,
              unitWhiteSpace: entities.home?.unit_white_space,
              watt_threshold: this._config.watt_threshold,
            })
          : displayValue(this.hass, this._config, totalHomeConsumption, {
              unit: entities.home?.unit_of_measurement,
              unitWhiteSpace: entities.home?.unit_white_space,
              watt_threshold: this._config.watt_threshold,
            });

    const totalLines =
      grid.state.toHome +
      (solar.state.toHome ?? 0) +
      (solar.state.toGrid ?? 0) +
      (solar.state.toBattery ?? 0) +
      (battery.state.toHome ?? 0) +
      (grid.state.toBattery ?? 0) +
      (battery.state.toGrid ?? 0);

    // Battery SoC - icônes horizontales avec pourcentage
    if (battery.state_of_charge.state === null) {
      battery.icon = "mdi:battery";
    } else {
      const soc = battery.state_of_charge.state;
      const isCharging = battery.state.toBattery > 0;

      let level = "";
      if (soc >= 95) level = "100";
      else if (soc >= 85) level = "90";
      else if (soc >= 75) level = "80";
      else if (soc >= 65) level = "70";
      else if (soc >= 55) level = "60";
      else if (soc >= 45) level = "50";
      else if (soc >= 35) level = "40";
      else if (soc >= 25) level = "30";
      else if (soc >= 15) level = "20";
      else if (soc >= 5) level = "10";
      else level = "outline";

      if (isCharging && level !== "outline") {
        battery.icon = `mdi:battery-charging-${level}`;
      } else {
        battery.icon = level === "outline" ? "mdi:battery-outline" : `mdi:battery-${level}`;
      }
    }
    if (entities.battery?.icon !== undefined) battery.icon = entities.battery?.icon;

    // Compute durations
    const newDur: NewDur = {
      batteryGrid: computeFlowRate(this._config, Math.max(grid.state.toBattery ?? 0, battery.state.toGrid ?? 0, 0), totalLines),
      batteryToHome: computeFlowRate(this._config, battery.state.toHome ?? 0, totalLines),
      gridToHome: computeFlowRate(this._config, grid.state.toHome, totalLines),
      solarToBattery: computeFlowRate(this._config, solar.state.toBattery ?? 0, totalLines),
      solarToGrid: computeFlowRate(this._config, solar.state.toGrid ?? 0, totalLines),
      solarToHome: computeFlowRate(this._config, solar.state.toHome ?? 0, totalLines),
      individual: individualObjs?.map((individual) => computeFlowRate(this._config, individual.state ?? 0, totalIndividualConsumption)) || [],
      nonFossil: computeFlowRate(this._config, nonFossil.state.power ?? 0, totalLines),
    };

    // Smooth duration changes
    (["batteryGrid", "batteryToHome", "gridToHome", "solarToBattery", "solarToGrid", "solarToHome"] as const).forEach((flowName) => {
      const flowSVGElement = (this as any)[`${flowName}Flow`] as SVGSVGElement;
      if (flowSVGElement && this.previousDur[flowName] && this.previousDur[flowName] !== newDur[flowName]) {
        flowSVGElement.pauseAnimations();
        flowSVGElement.setCurrentTime(flowSVGElement.getCurrentTime() * ((newDur[flowName] as number) / (this.previousDur[flowName] as number)));
        flowSVGElement.unpauseAnimations();
      }
      this.previousDur[flowName] = newDur[flowName];
    });

    const homeSources: HomeSources = {
      battery: {
        value: homeBatteryCircumference,
        color: "var(--energy-battery-out-color)",
      },
      solar: {
        value: homeSolarCircumference,
        color: "var(--energy-solar-color)",
      },
      grid: {
        value: homeGridCircumference,
        color: "var(--energy-grid-consumption-color)",
      },
      gridNonFossil: {
        value: homeNonFossilCircumference,
        color: "var(--energy-non-fossil-color)",
      },
    };

    const homeSourcesEntries = Object.entries(homeSources) as [keyof HomeSources, HomeSources[keyof HomeSources]][];
    const homeLargestSource = homeSourcesEntries.reduce((largest, current) => (current[1].value > largest[1].value ? current : largest))[0];

    // Templates
    const templatesObj: TemplatesObj = {
      gridSecondary: this._templateResults.gridSecondary?.result,
      solarSecondary: this._templateResults.solarSecondary?.result,
      homeSecondary: this._templateResults.homeSecondary?.result,

      nonFossilFuelSecondary: this._templateResults.nonFossilFuelSecondary?.result,
      individual: individualObjs?.map((_, index) => this._templateResults[`individual${index}Secondary`]?.result) || [],
    };

    // Styles
    const isCardWideEnough = this._width > 420;
    allDynamicStyles(this, {
      grid,
      solar,
      battery,
      display_zero_lines_grey_color: this._config.display_zero_lines?.mode === "grey_out" ? this._config.display_zero_lines?.grey_color : "",
      display_zero_lines_transparency: this._config.display_zero_lines?.mode === "transparency" ? this._config.display_zero_lines?.transparency : "",
      entities,
      homeLargestSource,
      homeSources,
      individual: individualObjs,
      nonFossil,
      isCardWideEnough,
    });

    return html`
      <ha-card
        .header=${this._config.title}
        class=${this._config.full_size ? "full-size" : ""}
        style=${this._config.style_ha_card ? this._config.style_ha_card : ""}
      >
        <div
          class="card-content ${this._config.full_size ? "full-size" : ""} ${this._config.compact_mode ? "compact-mode" : ""} ${this._config
            .circle_gradient_mode
            ? "gradient-mode"
            : ""}"
          id="power-flow-card-plus"
          style="${this._config.style_card_content || ""}${this._config.circle_border_width
            ? `--circle-border-width: ${this._config.circle_border_width}px;`
            : ""}"
        >
          ${solar.has
            ? solarElement(this, effectiveConfig, {
                entities,
                solar,
                templatesObj,
              })
            : ""}
          ${grid.has
            ? gridElement(this, effectiveConfig, {
                entities,
                grid,
                templatesObj,
              })
            : ""}
          ${!entities.home?.hide
            ? homeElement(this, effectiveConfig, {
                circleCircumference,
                entities,
                grid,
                home,
                homeBatteryCircumference,
                homeGridCircumference,
                homeNonFossilCircumference,
                homeSolarCircumference,
                newDur,
                templatesObj,
                homeUsageToDisplay,
                individual: individualObjs,
              })
            : ""}
          ${battery.has ? batteryElement(this, effectiveConfig, { battery, entities, solar, grid }) : ""}
          ${dailyCost.enabled ? dailyCostElement(this, effectiveConfig, { dailyCost }) : ""}
          ${flowElement(this, this._config, {
            battery,
            grid,
            individual: individualObjs,
            newDur,
            solar,
            dailyExport,
            dailyCost,
          })}
          ${dailyExport.enabled && solar.has ? dailyExportElement(this, effectiveConfig, { dailyExport }) : ""}
          ${selfSufficiencyElement(this, effectiveConfig, {
            solarToHome: solar.state.toHome || 0,
            batteryToHome: battery.state.toHome || 0,
            gridToHome: grid.state.toHome || 0,
          })}
        </div>
        ${dashboardLinkElement(this._config, this.hass)}
      </ha-card>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this.hass) {
      return;
    }

    const elem = this?.shadowRoot?.querySelector("#power-flow-card-plus");
    const widthStr = elem ? getComputedStyle(elem).getPropertyValue("width") : "0px";
    this._width = parseInt(widthStr.replace("px", ""), 10);

    this._tryConnectAll();
    this._attachDragListeners();
  }

  private _dragHandlers: Map<string, any> = new Map();

  private _attachDragListeners() {
    const circles = ["solar", "grid", "home", "battery", "daily-cost", "daily-export", "self-sufficiency"];

    // Détacher les anciens listeners
    circles.forEach((circle) => {
      const elem = this.shadowRoot?.querySelector(`.circle-container.${circle}`);
      const handlers = this._dragHandlers.get(circle);
      if (elem && handlers) {
        elem.removeEventListener("mousedown", handlers.mouseDown);
        elem.removeEventListener("touchstart", handlers.touchStart);
      }
    });

    // Attacher les nouveaux listeners
    circles.forEach((circle) => {
      const elem = this.shadowRoot?.querySelector(`.circle-container.${circle}`);
      if (elem) {
        const mouseDownHandler = (e: Event) => {
          e.stopPropagation();
          this._onDragStart(e as MouseEvent, circle);
        };
        const touchStartHandler = (e: Event) => {
          e.stopPropagation();
          this._onDragStart(e as TouchEvent, circle);
        };

        elem.addEventListener("mousedown", mouseDownHandler);
        elem.addEventListener("touchstart", touchStartHandler, { passive: false });

        this._dragHandlers.set(circle, {
          mouseDown: mouseDownHandler,
          touchStart: touchStartHandler,
        });
      }
    });
  }

  private _collectTemplateTopics(): { [topic: string]: string | undefined } {
    const { entities } = this._config;
    const topics: { [topic: string]: string | undefined } = {
      gridSecondary: entities.grid?.secondary_info?.template,
      solarSecondary: entities.solar?.secondary_info?.template,
      homeSecondary: entities.home?.secondary_info?.template,
      nonFossilFuelSecondary: entities.fossil_fuel_percentage?.secondary_info?.template,
    };
    entities.individual?.forEach((individual, index) => {
      topics[`individual${index}Secondary`] = individual.secondary_info?.template;
    });
    return topics;
  }

  private _tryConnectAll() {
    const topics = this._collectTemplateTopics();
    for (const [key, value] of Object.entries(topics)) {
      if (value) {
        this._tryConnect(value, key);
      }
    }
  }

  private async _tryConnect(inputTemplate: string, topic: string): Promise<void> {
    if (!this.hass || !this._config || inputTemplate === "") {
      return;
    }
    // Use .has() and reserve the slot synchronously to avoid races with concurrent calls
    if (this._unsubRenderTemplates?.has(topic)) {
      return;
    }

    try {
      const sub = subscribeRenderTemplate(
        this.hass.connection,
        (result) => {
          this._templateResults[topic] = result;
        },
        {
          template: inputTemplate,
          entity_ids: this._config.entity_id,
          variables: {
            config: this._config,
            user: this.hass.user!.name,
          },
          strict: true,
        }
      );
      // Reserve the slot BEFORE awaiting so concurrent calls bail out via .has()
      this._unsubRenderTemplates?.set(topic, sub);
      await sub;
    } catch {
      this._templateResults = {
        ...this._templateResults,
        [topic]: {
          result: inputTemplate,
          listeners: { all: false, domains: [], entities: [], time: false },
        },
      };
      this._unsubRenderTemplates?.delete(topic);
    }
  }

  private async _tryDisconnect(topic: string): Promise<void> {
    const unsubRenderTemplate = this._unsubRenderTemplates?.get(topic);
    if (!unsubRenderTemplate) {
      return;
    }

    try {
      const unsub = await unsubRenderTemplate;
      unsub();
      this._unsubRenderTemplates?.delete(topic);
    } catch (err: any) {
      if (err.code === "not_found" || err.code === "template_error") {
        // If we get here, the connection was probably already closed. Ignore.
      } else {
        throw err;
      }
    }
  }

  private _onDragStart(e: MouseEvent | TouchEvent, element: string) {
    e.preventDefault();
    this._draggedElement = element;
    this._hasDragged = false; // Reset au début du drag

    const moveHandler = (ev: MouseEvent | TouchEvent) => this._onDragMove(ev);
    const upHandler = () => this._onDragEnd(moveHandler, upHandler);

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("touchmove", moveHandler, { passive: false });
    document.addEventListener("mouseup", upHandler);
    document.addEventListener("touchend", upHandler);

    this._activeDragHandlers = { moveHandler, upHandler };
  }

  private _onDragMove(e: MouseEvent | TouchEvent) {
    if (!this._draggedElement) return;

    e.preventDefault();
    e.stopPropagation();
    this._hasDragged = true; // Marquer qu'un drag a eu lieu

    const card = this.shadowRoot?.querySelector("#power-flow-card-plus");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const touch = "touches" in e ? e.touches[0] : null;
    if ("touches" in e && !touch) return;
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Constantes pour les limites
    const CIRCLE_RADIUS = 40; // Rayon du cercle (moitié du diamètre de 80px)
    const CARD_WIDTH = rect.width;
    const CARD_HEIGHT = rect.height;

    // Calculer la position avec contraintes pour rester dans la carte
    let left = Math.round(x - CIRCLE_RADIUS);
    let top = Math.round(y - CIRCLE_RADIUS);

    // Appliquer les limites pour que le cercle reste entièrement visible
    left = Math.max(0, Math.min(left, CARD_WIDTH - CIRCLE_RADIUS * 2));
    top = Math.max(0, Math.min(top, CARD_HEIGHT - CIRCLE_RADIUS * 2));

    // Mise à jour purement transitoire — pas de clone de config, pas de recalcul de flux/templates.
    // Le `@state` déclenche un re-render léger (juste le `customStyle` du cercle déplacé).
    this._dragPositionOverride = { element: this._draggedElement, left, top };
  }

  private _onDragEnd(moveHandler: any, upHandler: any) {
    document.removeEventListener("mousemove", moveHandler);
    document.removeEventListener("touchmove", moveHandler);
    document.removeEventListener("mouseup", upHandler);
    document.removeEventListener("touchend", upHandler);

    // Commit la position finale dans la config Lovelace en une seule passe.
    // L'override transitoire `_dragPositionOverride` peut être absent si l'utilisateur
    // a juste cliqué sans bouger (mousedown → mouseup direct) — dans ce cas on ne fait rien.
    const override = this._dragPositionOverride;
    const draggedElement = this._draggedElement;
    if (override && draggedElement && override.element === draggedElement) {
      const configKey = draggedElement.replace(/-/g, "_");
      const previousPositions = this._config.custom_positions ?? {};
      this._config = {
        ...this._config,
        custom_positions: {
          ...previousPositions,
          [configKey]: { left: override.left, top: override.top },
        },
      };
    }

    this._draggedElement = null;
    this._dragPositionOverride = undefined;
    this._activeDragHandlers = undefined;

    // Sauvegarder dans localStorage (config par appareil)
    this._saveToLocalStorage();
  }

  private get _storageKey(): string {
    if (!this._config) return "power-flow-card-plus-positions:default";
    const gridEntity = this._config.entities?.grid?.entity;
    const solarEntity = this._config.entities?.solar?.entity;
    const gridSig = typeof gridEntity === "string" ? gridEntity : gridEntity?.consumption || gridEntity?.production || "";
    const solarSig = typeof solarEntity === "string" ? solarEntity : "";
    const sig = this._config.title || [gridSig, solarSig].filter(Boolean).join("|") || "default";
    return `power-flow-card-plus-positions:${sig}`;
  }

  private _safeStateNumber(entityId?: string): number {
    if (!entityId || !this.hass) return 0;
    const raw = this.hass.states[entityId]?.state;
    if (!raw || raw === "unavailable" || raw === "unknown" || raw === "none") return 0;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }

  private _saveToLocalStorage() {
    // Sauvegarder les positions dans localStorage pour config par appareil
    if (this._config.custom_positions) {
      localStorage.setItem(this._storageKey, JSON.stringify(this._config.custom_positions));
    }
  }

  private _loadFromLocalStorage() {
    // Charger les positions depuis localStorage
    const saved = localStorage.getItem(this._storageKey);
    if (saved) {
      try {
        const positions = JSON.parse(saved);
        // Avoid mutating the external Lovelace config: replace _config with a new object
        this._config = {
          ...this._config,
          custom_positions: { ...this._config.custom_positions, ...positions },
        };
      } catch (e) {
        console.error("Error loading positions from localStorage:", e);
      }
    }
  }

  static styles = styles;
}
