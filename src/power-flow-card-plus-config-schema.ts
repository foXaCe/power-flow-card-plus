/**
 * Permissive structural schema for `PowerFlowCardPlusConfig` validated in `setConfig()`.
 *
 * Why `type()` instead of `object()`:
 *  - `object()` is strict and rejects unknown keys, which would break user configs
 *    relying on undocumented or experimental options.
 *  - `type()` only validates known keys and tolerates extras — the goal here is to
 *    reject *obviously* malformed configs (e.g. wrong primitive types) with a clear
 *    error message, not to enforce a closed set of fields.
 *
 * The schema is intentionally a *superset* of `PowerFlowCardPlusConfig`. Several
 * deeply nested or polymorphic structures are typed as `any()` to avoid false
 * negatives on real-world configurations.
 */
import { any, array, boolean, number, optional, string, type, union } from "superstruct";

// `entity` may be either a string id or a `{ consumption, production }` combo object.
const entityField = union([
  string(),
  type({
    consumption: optional(string()),
    production: optional(string()),
  }),
]);

// Common shape shared by battery/grid/solar/home/fossil_fuel_percentage entries.
// Most properties are optional or `any()` because the underlying TypeScript types
// vary by entity kind (e.g. `color_circle` is `boolean | "production" | "consumption"`).
const baseEntity = type({
  entity: optional(entityField),
  name: optional(string()),
  icon: optional(string()),
  color: optional(any()),
  color_icon: optional(any()),
  color_circle: optional(any()),
  color_value: optional(any()),
  color_label: optional(any()),
  color_state_of_charge_value: optional(any()),
  display_state: optional(string()),
  display_zero: optional(boolean()),
  display_zero_state: optional(boolean()),
  display_zero_tolerance: optional(number()),
  unit_of_measurement: optional(string()),
  unit_white_space: optional(boolean()),
  decimals: optional(number()),
  invert_state: optional(boolean()),
  invert_animation: optional(boolean()),
  inverted_animation: optional(boolean()),
  show_state_of_charge: optional(boolean()),
  state_of_charge: optional(string()),
  state_of_charge_unit: optional(string()),
  state_of_charge_unit_white_space: optional(boolean()),
  state_of_charge_decimals: optional(number()),
  state_type: optional(string()),
  use_metadata: optional(boolean()),
  override_state: optional(boolean()),
  subtract_individual: optional(boolean()),
  circle_animation: optional(boolean()),
  hide: optional(boolean()),
  show_direction: optional(boolean()),
  calculate_flow_rate: optional(any()),
  power_outage: optional(any()),
  // Action configs — left permissive (HA action configs are unions and evolve over time).
  tap_action: optional(any()),
  hold_action: optional(any()),
  double_tap_action: optional(any()),
  secondary_info: optional(any()),
});

const entitiesField = type({
  battery: optional(baseEntity),
  grid: optional(baseEntity),
  solar: optional(baseEntity),
  home: optional(baseEntity),
  fossil_fuel_percentage: optional(baseEntity),
  individual: optional(array(baseEntity)),
});

/**
 * Top-level config schema. `type()` keeps this permissive so any extra fields
 * (e.g. `theme`, `view_layout`, `layout_options`, custom keys) pass through.
 */
export const cardConfigStruct = type({
  type: string(),
  title: optional(string()),
  entities: entitiesField,
  // Layout / flow tuning
  min_flow_rate: optional(number()),
  max_flow_rate: optional(number()),
  min_expected_power: optional(number()),
  max_expected_power: optional(number()),
  watt_threshold: optional(number()),
  w_decimals: optional(number()),
  kw_decimals: optional(number()),
  // Dashboard links
  dashboard_link: optional(string()),
  dashboard_link_label: optional(string()),
  second_dashboard_link: optional(string()),
  second_dashboard_link_label: optional(string()),
  // Generic UI booleans
  clickable_entities: optional(boolean()),
  use_new_flow_rate_model: optional(boolean()),
  full_size: optional(boolean()),
  disable_dots: optional(boolean()),
  sort_individual_devices: optional(boolean()),
  circle_pulse_animation: optional(boolean()),
  circle_border_width: optional(number()),
  compact_mode: optional(boolean()),
  circle_gradient_mode: optional(boolean()),
  // Cost / export
  show_cost: optional(boolean()),
  cost_entity: optional(string()),
  cost_unit: optional(string()),
  cost_decimals: optional(number()),
  show_daily_cost: optional(boolean()),
  daily_cost_energy_entity: optional(string()),
  daily_cost_decimals: optional(number()),
  show_daily_export: optional(boolean()),
  daily_export_energy_entity: optional(string()),
  daily_export_price: optional(number()),
  daily_export_decimals: optional(number()),
  show_self_sufficiency: optional(boolean()),
  // Layout overrides — kept as `any()` to avoid coupling with the structural
  // shapes (CustomPositions, ArrowsConfig, DisplayZeroLines) which are unions
  // of optional nested objects.
  display_zero_lines: optional(any()),
  custom_positions: optional(any()),
  arrows: optional(any()),
  // Inline style passthroughs (string or object).
  style_ha_card: optional(any()),
  style_card_content: optional(any()),
  // HA-internal fields propagated by Lovelace.
  view_layout: optional(any()),
  layout_options: optional(any()),
  theme: optional(string()),
});
