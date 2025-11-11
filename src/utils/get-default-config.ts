import { HomeAssistant } from "custom-card-helpers";
import { DisplayZeroLinesMode } from "../power-flow-card-plus-config";
import { getFirstEntityName } from "../states/utils/mutliEntity";

export const defaultValues = {
  maxFlowRate: 6,
  minFlowRate: 0.75,
  wattDecimals: 0,
  kilowattDecimals: 1,
  minExpectedPower: 0.01,
  maxExpectedPower: 2000,
  wattThreshold: 1000,
  transparencyZeroLines: 0,
  displayZeroLines: {
    mode: "show" as DisplayZeroLinesMode,
    transparency: 50,
    grey_color: [189, 189, 189],
  },
};

export function getDefaultConfig(hass: HomeAssistant): object {
  function checkStrings(entiyId: string, testStrings: string[]): boolean {
    const firstId = getFirstEntityName(entiyId);
    const friendlyName = hass.states[firstId]?.attributes?.friendly_name || "";
    return testStrings.some((str) => firstId.toLowerCase().includes(str.toLowerCase()) || friendlyName.toLowerCase().includes(str.toLowerCase()));
  }

  // Detect Enphase system
  const isEnphaseSystem = Object.keys(hass.states).some((id) => id.includes("envoy_") || id.includes("enphase_"));

  const powerEntities = Object.keys(hass.states).filter((entityId) => {
    const stateObj = hass.states[getFirstEntityName(entityId)];
    const isAvailable =
      (stateObj.state && stateObj.attributes && stateObj.attributes.device_class === "power") ||
      stateObj.entity_id.includes("power") ||
      stateObj.entity_id.includes("puissance") ||
      stateObj.entity_id.includes("production") ||
      stateObj.entity_id.includes("consommation");
    return isAvailable;
  });

  // Enphase-specific patterns
  const enphaseGridTests = ["current_net_power_consumption", "net_consumption"];
  const enphaseProductionTests = ["production_d_electricite_actuelle", "current_power_production"];
  const enphaseConsumptionTests = ["consommation_electrique_actuelle", "current_power_consumption"];
  const enphaseIQBatteryTests = ["enphase_battery", "iq_5p_puissance", "iq_battery"];
  const enphaseIQBatterySOCTests = ["iq_5p_etat_de_charge", "enphase_battery.*state_of_charge"];

  // Standard patterns
  const gridPowerTestString = ["grid", "utility", "net", "meter"];
  const solarTests = ["solar", "pv", "photovoltaic", "inverter", "production"];
  const batteryTests = ["battery", "batterie"];
  const batteryPercentTests = ["battery_percent", "battery_level", "state_of_charge", "soc", "percentage", "etat_de_charge"];
  const homeConsumptionTests = ["home", "house", "consumption", "consommation", "maison", "domicile"];

  // Try Enphase-specific entities first if Enphase system detected
  let firstGridPowerEntity = "";
  let firstSolarPowerEntity = "";
  let firstBatteryPowerEntity = "";
  let firstHomeConsumptionEntity = "";

  if (isEnphaseSystem) {
    // Enphase Envoy Grid (net consumption)
    firstGridPowerEntity = Object.keys(hass.states).find((id) => checkStrings(id, enphaseGridTests)) || "";

    // Enphase Envoy Solar Production
    firstSolarPowerEntity = Object.keys(hass.states).find((id) => checkStrings(id, enphaseProductionTests)) || "";

    // Enphase Home Consumption
    firstHomeConsumptionEntity = Object.keys(hass.states).find((id) => checkStrings(id, enphaseConsumptionTests)) || "";

    // Enphase IQ Battery Power
    firstBatteryPowerEntity =
      Object.keys(hass.states).find(
        (id) =>
          checkStrings(id, enphaseIQBatteryTests) &&
          (id.includes("puissance") || id.includes("power")) &&
          !id.includes("charge") &&
          !id.includes("decharge")
      ) || "";
  }

  // Fallback to standard detection if Enphase entities not found
  if (!firstGridPowerEntity) {
    firstGridPowerEntity = powerEntities.filter((entityId) => checkStrings(entityId, gridPowerTestString))[0];
  }
  if (!firstSolarPowerEntity) {
    firstSolarPowerEntity = powerEntities.filter((entityId) => checkStrings(entityId, solarTests))[0];
  }
  if (!firstBatteryPowerEntity) {
    firstBatteryPowerEntity = powerEntities.filter((entityId) => checkStrings(entityId, batteryTests))[0];
  }
  if (!firstHomeConsumptionEntity) {
    firstHomeConsumptionEntity = powerEntities.filter((entityId) => checkStrings(entityId, homeConsumptionTests))[0];
  }

  const percentageEntities = Object.keys(hass.states).filter((entityId) => {
    const stateObj = hass.states[entityId];
    const isAvailable = stateObj && stateObj.state && stateObj.attributes && stateObj.attributes.unit_of_measurement === "%";
    return isAvailable;
  });

  // Try Enphase battery SOC first
  let firstBatteryPercentageEntity = "";
  if (isEnphaseSystem) {
    firstBatteryPercentageEntity = percentageEntities.find((id) => checkStrings(id, enphaseIQBatterySOCTests)) || "";
  }

  // Fallback to standard battery percentage detection
  if (!firstBatteryPercentageEntity) {
    firstBatteryPercentageEntity = percentageEntities.filter((entityId) => checkStrings(entityId, batteryPercentTests))[0];
  }
  return {
    entities: {
      battery: {
        entity: firstBatteryPowerEntity ?? "",
        state_of_charge: firstBatteryPercentageEntity ?? "",
      },
      grid: firstGridPowerEntity ? { entity: firstGridPowerEntity } : undefined,
      solar: firstSolarPowerEntity ? { entity: firstSolarPowerEntity, display_zero_state: true } : undefined,
      home: firstHomeConsumptionEntity ? { entity: firstHomeConsumptionEntity } : undefined,
    },
    clickable_entities: true,
    display_zero_lines: true,
    use_new_flow_rate_model: true,
    w_decimals: defaultValues.wattDecimals,
    kw_decimals: defaultValues.kilowattDecimals,
    min_flow_rate: defaultValues.minFlowRate,
    max_flow_rate: defaultValues.maxFlowRate,
    max_expected_power: defaultValues.maxExpectedPower,
    min_expected_power: defaultValues.minExpectedPower,
    watt_threshold: defaultValues.wattThreshold,
    transparency_zero_lines: defaultValues.transparencyZeroLines,
    sort_individual_devices: false,
  };
}
