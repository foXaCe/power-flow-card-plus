import { computeFlowRate, computeIndividualFlowRate } from "../src/utils/computeFlowRate";
import { PowerFlowCardPlusConfig } from "../src/power-flow-card-plus-config";

const makeConfig = (overrides: Partial<PowerFlowCardPlusConfig> = {}): PowerFlowCardPlusConfig =>
  ({
    type: "custom:power-flow-card-plus",
    entities: {},
    min_flow_rate: 0.75,
    max_flow_rate: 6,
    min_expected_power: 0,
    max_expected_power: 2000,
    watt_threshold: 1000,
    w_decimals: 0,
    kw_decimals: 2,
    clickable_entities: true,
    ...overrides,
  } as PowerFlowCardPlusConfig);

describe("computeFlowRate", () => {
  it("uses new flow rate model by default", () => {
    const config = makeConfig();
    const result = computeFlowRate(config, 1000, 2000);
    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe("number");
  });

  it("uses old flow rate model when configured", () => {
    const config = makeConfig({ use_new_flow_rate_model: false });
    const result = computeFlowRate(config, 1000, 2000);
    expect(result).toBeGreaterThan(0);
    expect(typeof result).toBe("number");
  });

  it("returns max rate for zero power (new model)", () => {
    const config = makeConfig();
    const result = computeFlowRate(config, 0, 1000);
    expect(result).toBe(config.max_flow_rate);
  });

  it("returns min rate for max power (new model)", () => {
    const config = makeConfig();
    const result = computeFlowRate(config, 2000, 2000);
    expect(result).toBe(config.min_flow_rate);
  });

  it("clamps to max out for values exceeding max power (new model)", () => {
    const config = makeConfig();
    const result = computeFlowRate(config, 5000, 5000);
    expect(result).toBe(config.min_flow_rate);
  });
});

describe("computeIndividualFlowRate", () => {
  it("returns default 1.66 when no entry and no value", () => {
    expect(computeIndividualFlowRate()).toBe(1.66);
  });

  it("returns value when entry is not false and value is truthy", () => {
    expect(computeIndividualFlowRate(true, 2.5)).toBe(2.5);
  });

  it("returns entry when entry is a number", () => {
    expect(computeIndividualFlowRate(3.0)).toBe(3.0);
  });

  it("returns default when entry is false", () => {
    expect(computeIndividualFlowRate(false)).toBe(1.66);
  });

  it("returns numeric entry even when value is 0", () => {
    expect(computeIndividualFlowRate(2.5, 0)).toBe(2.5);
  });
});
