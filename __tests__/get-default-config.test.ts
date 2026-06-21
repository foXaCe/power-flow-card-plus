import { getDefaultConfig, defaultValues } from "../src/utils/get-default-config";
import { makeHass, makeStateObj } from "./__fixtures__/hass";

describe("getDefaultConfig", () => {
  it("detects grid/solar/battery/home power entities and battery SoC by name", () => {
    const hass = makeHass({
      states: {
        "sensor.grid_power": makeStateObj("100", { device_class: "power", unit_of_measurement: "W" }),
        "sensor.solar_power": makeStateObj("200", { device_class: "power", unit_of_measurement: "W" }),
        "sensor.battery_power": makeStateObj("50", { device_class: "power", unit_of_measurement: "W" }),
        "sensor.home_power": makeStateObj("300", { device_class: "power", unit_of_measurement: "W" }),
        "sensor.battery_soc": makeStateObj("80", { unit_of_measurement: "%" }),
      },
    });
    const cfg = getDefaultConfig(hass) as any;
    expect(cfg.entities.grid.entity).toBe("sensor.grid_power");
    expect(cfg.entities.solar.entity).toBe("sensor.solar_power");
    expect(cfg.entities.battery.entity).toBe("sensor.battery_power");
    expect(cfg.entities.home.entity).toBe("sensor.home_power");
    expect(cfg.entities.battery.state_of_charge).toBe("sensor.battery_soc");
  });

  it("leaves grid/solar/home undefined when nothing matches", () => {
    const cfg = getDefaultConfig(makeHass({ states: {} })) as any;
    expect(cfg.entities.grid).toBeUndefined();
    expect(cfg.entities.solar).toBeUndefined();
    expect(cfg.entities.home).toBeUndefined();
  });

  it("applies the documented default values", () => {
    const cfg = getDefaultConfig(makeHass()) as any;
    expect(cfg.watt_threshold).toBe(defaultValues.wattThreshold);
    expect(cfg.max_flow_rate).toBe(defaultValues.maxFlowRate);
    expect(cfg.min_flow_rate).toBe(defaultValues.minFlowRate);
    expect(cfg.clickable_entities).toBe(true);
    expect(cfg.use_new_flow_rate_model).toBe(true);
  });

  it("detects Enphase systems via entity-id patterns", () => {
    const hass = makeHass({
      states: {
        "sensor.envoy_123_current_net_power_consumption": makeStateObj("100", { device_class: "power", unit_of_measurement: "W" }),
        "sensor.envoy_123_current_power_production": makeStateObj("500", { device_class: "power", unit_of_measurement: "W" }),
      },
    });
    const cfg = getDefaultConfig(hass) as any;
    expect(cfg.entities.grid.entity).toContain("net_power_consumption");
    expect(cfg.entities.solar.entity).toContain("power_production");
  });
});
