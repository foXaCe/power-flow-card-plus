import { LovelaceCardConfig } from "custom-card-helpers";
import { BaseConfigEntity, ComboEntity, GridPowerOutage, IndividualDeviceType, SecondaryInfoType } from "./type.js";

export type DisplayZeroLinesMode = "show" | "grey_out" | "transparency" | "hide" | "custom";

export interface CirclePosition {
  top?: number;
  left?: number;
}

export interface CustomPositions {
  solar?: CirclePosition;
  grid?: CirclePosition;
  home?: CirclePosition;
  battery?: CirclePosition;
  daily_cost?: CirclePosition;
  daily_export?: CirclePosition;
}

export interface ArrowConfig {
  color?: string;
  thickness?: number;
  length?: number;
  offset_x?: number;
  offset_y?: number;
}

export interface ArrowsConfig {
  grid_to_home?: ArrowConfig;
  solar_to_home?: ArrowConfig;
  solar_to_grid?: ArrowConfig;
  battery_to_home?: ArrowConfig;
  solar_to_battery?: ArrowConfig;
  grid_to_battery?: ArrowConfig;
  solar_to_daily_export?: ArrowConfig;
}

interface mainConfigOptions {
  dashboard_link?: string;
  dashboard_link_label?: string;
  second_dashboard_link?: string;
  second_dashboard_link_label?: string;
  kw_decimals: number;
  min_flow_rate: number;
  max_flow_rate: number;
  w_decimals: number;
  watt_threshold: number;
  clickable_entities: boolean;
  max_expected_power: number;
  min_expected_power: number;
  use_new_flow_rate_model?: boolean;
  full_size?: boolean;
  style_ha_card?: any;
  style_card_content?: any;
  disable_dots?: boolean;
  display_zero_lines?: {
    mode?: DisplayZeroLinesMode;
    transparency?: number;
    grey_color?: string | number[];
  };
  sort_individual_devices?: boolean;
  circle_pulse_animation?: boolean;
  circle_border_width?: number;
  compact_mode?: boolean;
  circle_gradient_mode?: boolean;
  show_cost?: boolean;
  cost_entity?: string;
  cost_unit?: string;
  cost_decimals?: number;
  show_daily_cost?: boolean;
  daily_cost_energy_entity?: string;
  daily_cost_decimals?: number;
  show_daily_export?: boolean;
  daily_export_energy_entity?: string;
  daily_export_price?: number;
  daily_export_decimals?: number;
  custom_positions?: CustomPositions;
  arrows?: ArrowsConfig;
  show_self_sufficiency?: boolean;
  self_sufficiency_position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface PowerFlowCardPlusConfig extends LovelaceCardConfig, mainConfigOptions {
  entities: ConfigEntities;
}

export type IndividualField = IndividualDeviceType[];

interface Battery extends BaseConfigEntity {
  state_of_charge?: string;
  state_of_charge_unit?: string;
  state_of_charge_unit_white_space?: boolean;
  state_of_charge_decimals?: number;
  show_state_of_charge?: boolean;
  color_state_of_charge_value?: boolean | "production" | "consumption";
  color_circle: boolean | "production" | "consumption";
  color_value?: boolean;
  color?: ComboEntity;
}

interface Grid extends BaseConfigEntity {
  power_outage: GridPowerOutage;
  secondary_info?: SecondaryInfoType;
  color_circle: boolean | "production" | "consumption";
  color_value?: boolean;
  color?: ComboEntity;
}

interface Solar extends BaseConfigEntity {
  entity: string;
  color?: any;
  color_icon?: boolean;
  color_value?: boolean;
  color_label?: boolean;
  secondary_info?: SecondaryInfoType;
  display_zero_state?: boolean;
}

interface Home extends BaseConfigEntity {
  entity: string;
  override_state?: boolean;
  color_icon?: boolean | "solar" | "grid" | "battery";
  color_value?: boolean | "solar" | "grid" | "battery";
  subtract_individual?: boolean;
  secondary_info?: SecondaryInfoType;
  circle_animation?: boolean;
  hide?: boolean;
}

interface FossilFuelPercentage extends BaseConfigEntity {
  entity: string;
  color?: string;
  state_type?: "percentage" | "power";
  color_icon?: boolean;
  display_zero?: boolean;
  display_zero_state?: boolean;
  display_zero_tolerance?: number;
  color_value?: boolean;
  color_label?: boolean;
  unit_white_space?: boolean;
  calculate_flow_rate?: boolean | number;
  secondary_info: SecondaryInfoType;
}

export type ConfigEntities = {
  battery?: Battery;
  grid?: Grid;
  solar?: Solar;
  home?: Home;
  fossil_fuel_percentage?: FossilFuelPercentage;
  individual?: IndividualField;
};

export type ConfigEntity = Battery | Grid | Solar | Home | FossilFuelPercentage | IndividualDeviceType;
