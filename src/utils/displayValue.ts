import { HomeAssistant, formatNumber } from "@/ha";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { isNumberValue, round } from "./utils";

/**
 *
 * @param hass The Home Assistant instance
 * @param config The Power Flow Card Plus configuration
 * @param value The value to display
 * @param options Different options to display the value
 * @returns value with unit, localized and rounded to the correct number of decimals
 */
export const displayValue = (
  hass: HomeAssistant,
  config: PowerFlowCardPlusConfig,
  value: number | string | null,
  {
    unit,
    unitWhiteSpace,
    decimals,
    accept_negative,
    watt_threshold = 1000,
  }: {
    unit?: string;
    unitWhiteSpace?: boolean;
    decimals?: number;
    accept_negative?: boolean;
    watt_threshold?: number;
  }
): string => {
  const space = unitWhiteSpace === false ? "" : " ";
  if (value === null || value === undefined || value === "") {
    return `0${space}${unit ?? "W"}`;
  }

  if (!isNumberValue(value)) return value.toString();

  const valueInNumber = Number(value);

  const isKW = unit === undefined && Math.abs(valueInNumber) >= watt_threshold;

  const decimalsToRound = decimals ?? (isKW ? config.kw_decimals : config.w_decimals);

  const transformValue = (v: number) => (!accept_negative ? Math.abs(v) : v);

  const v = formatNumber(
    transformValue(isKW ? round(valueInNumber / 1000, decimalsToRound ?? 2) : round(valueInNumber, decimalsToRound ?? 0)),
    hass.locale
  );

  return `${v}${space}${unit || (isKW ? "kW" : "W")}`;
};

/**
 * Resolves the unit_of_measurement of an entity from `hass.entities` or the
 * state object's attributes. Returns `undefined` when nothing can be inferred.
 */
export const getEntityUnit = (hass: HomeAssistant, entityId?: string): string | undefined => {
  if (!entityId) return undefined;
  try {
    const stateObj = hass.states?.[entityId];
    const attrUnit = stateObj?.attributes?.unit_of_measurement as string | undefined;
    if (attrUnit) return attrUnit;
    // hass.entities EntityRegistryDisplayEntry doesn't expose unit, but some HA
    // versions include it. Cast loosely to support both shapes.
    const regEntry = hass.entities?.[entityId] as unknown as { unit_of_measurement?: string } | undefined;
    return regEntry?.unit_of_measurement;
  } catch {
    return undefined;
  }
};

/**
 * Format a numeric value using `hass.formatEntityState` so that locale,
 * unit conversion and `display_precision` from the entity registry are
 * honored. Falls back gracefully on legacy `displayValue` formatting when:
 *   - no entityId is provided,
 *   - the corresponding state object is missing,
 *   - or the modern helper is not available / throws.
 *
 * The public `displayValue` signature is preserved for compatibility.
 */
export const formatEntityValue = (
  hass: HomeAssistant,
  config: PowerFlowCardPlusConfig,
  entityId: string | undefined,
  value: number | string | null,
  options: {
    unit?: string;
    unitWhiteSpace?: boolean;
    decimals?: number;
    accept_negative?: boolean;
    watt_threshold?: number;
  } = {}
): string => {
  if (entityId && typeof hass?.formatEntityState === "function") {
    const stateObj = hass.states?.[entityId];
    if (stateObj && value !== null && value !== undefined && value !== "") {
      const numeric = Number(value);
      const transformed = options.accept_negative === false && Number.isFinite(numeric) ? Math.abs(numeric) : numeric;
      const stateString = Number.isFinite(transformed) ? String(transformed) : String(value);
      try {
        const formatted = hass.formatEntityState(stateObj, stateString);
        if (typeof formatted === "string" && formatted.length > 0) {
          return formatted;
        }
      } catch {
        // fall through to legacy formatter
      }
    }
  }

  return displayValue(hass, config, value, options);
};
