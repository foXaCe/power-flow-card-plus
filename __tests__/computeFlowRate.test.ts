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
  }) as PowerFlowCardPlusConfig;

describe("computeFlowRate", () => {
  it("computes precise rate with new model (default)", () => {
    const config = makeConfig();
    // newFlowRateMapRange(1000, 6, 0.75, 0, 2000) = ((1000-0)*(0.75-6))/(2000-0)+6 = 3.375
    expect(computeFlowRate(config, 1000, 2000)).toBe(3.375);
  });

  it("computes precise rate with old model", () => {
    const config = makeConfig({ use_new_flow_rate_model: false });
    // oldFlowRate: 6 - (500/1000) * (6-0.75) = 6 - 2.625 = 3.375
    expect(computeFlowRate(config, 500, 1000)).toBe(3.375);
  });

  it("old and new models differ when total != max_expected_power", () => {
    const configNew = makeConfig();
    const configOld = makeConfig({ use_new_flow_rate_model: false });
    // New model ignores total: 6 - 500*5.25/2000 = 4.6875
    // Old model uses total: 6 - (500/1000)*5.25 = 3.375
    expect(computeFlowRate(configNew, 500, 1000)).toBe(4.6875);
    expect(computeFlowRate(configOld, 500, 1000)).toBe(3.375);
  });

  it("returns max rate for zero power (new model)", () => {
    const config = makeConfig();
    expect(computeFlowRate(config, 0, 1000)).toBe(6);
  });

  it("returns min rate for max power (new model)", () => {
    const config = makeConfig();
    expect(computeFlowRate(config, 2000, 2000)).toBe(0.75);
  });

  it("clamps to min rate for values exceeding max power (new model)", () => {
    const config = makeConfig();
    expect(computeFlowRate(config, 5000, 5000)).toBe(0.75);
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
