import { makeHass, makeStateObj } from "./__fixtures__/hass";

// Side-effect import: registers <power-flow-card-plus> as a custom element.
import "../src/power-flow-card-plus";

describe("PowerFlowCardPlus shouldUpdate", () => {
  let card: any;

  beforeEach(() => {
    card = document.createElement("power-flow-card-plus");
  });

  afterEach(() => {
    if (card?.parentNode) card.parentNode.removeChild(card);
  });

  /**
   * Helper: call shouldUpdate with a PropertyValues map that has the old hass value.
   * Caller sets card.hass = newHass before calling this.
   */
  const callShouldUpdate = (changed: Map<string, unknown>): boolean => (card as any).shouldUpdate(changed);

  it("returns true when a referenced entity state changes", () => {
    card.setConfig({
      type: "custom:power-flow-card-plus",
      entities: { grid: { entity: "sensor.grid_power" } },
    });

    const oldState = makeStateObj("100");
    const newState = makeStateObj("200");

    const oldHass = makeHass({ states: { "sensor.grid_power": oldState } });
    const newHass = makeHass({ states: { "sensor.grid_power": newState } });

    card.hass = newHass;
    const changed = new Map([["hass", oldHass]]);
    expect(callShouldUpdate(changed)).toBe(true);
  });

  it("returns false when only unreferenced entities change", () => {
    card.setConfig({
      type: "custom:power-flow-card-plus",
      entities: { grid: { entity: "sensor.grid_power" } },
    });

    // sensor.grid_power has the SAME object reference in old and new hass
    const gridState = makeStateObj("100");

    const oldHass = makeHass({
      states: {
        "sensor.grid_power": gridState,
        "light.kitchen": makeStateObj("on"),
      },
    });
    const newHass = makeHass({
      states: {
        "sensor.grid_power": gridState, // same reference — no change
        "light.kitchen": makeStateObj("off"), // different ref — but not referenced in config
      },
    });

    card.hass = newHass;
    const changed = new Map([["hass", oldHass]]);
    expect(callShouldUpdate(changed)).toBe(false);
  });

  it("returns true on first hass (oldHass is undefined)", () => {
    card.setConfig({
      type: "custom:power-flow-card-plus",
      entities: { grid: { entity: "sensor.grid_power" } },
    });

    const newHass = makeHass({ states: { "sensor.grid_power": makeStateObj("100") } });
    card.hass = newHass;
    // PropertyValues value for "hass" is undefined when it is set for the first time
    const changed = new Map([["hass", undefined]]);
    expect(callShouldUpdate(changed)).toBe(true);
  });

  it("returns true when _config changes (config branch)", () => {
    card.setConfig({
      type: "custom:power-flow-card-plus",
      entities: { grid: { entity: "sensor.grid_power" } },
    });

    // Only _config in the PropertyValues map — no hass key
    const changed = new Map([["_config", undefined]]);
    expect(callShouldUpdate(changed)).toBe(true);
  });

  it("returns true when _templateResults changes", () => {
    card.setConfig({
      type: "custom:power-flow-card-plus",
      entities: { grid: { entity: "sensor.grid_power" } },
    });

    const changed = new Map([["_templateResults", undefined]]);
    expect(callShouldUpdate(changed)).toBe(true);
  });

  it("returns true when _width changes", () => {
    card.setConfig({
      type: "custom:power-flow-card-plus",
      entities: { grid: { entity: "sensor.grid_power" } },
    });

    const changed = new Map([["_width", 300]]);
    expect(callShouldUpdate(changed)).toBe(true);
  });

  it("returns true when _dragPositionOverride changes", () => {
    card.setConfig({
      type: "custom:power-flow-card-plus",
      entities: { grid: { entity: "sensor.grid_power" } },
    });

    const changed = new Map([["_dragPositionOverride", undefined]]);
    expect(callShouldUpdate(changed)).toBe(true);
  });

  it("returns true when only the secondary_info entity of a nested entity changes", () => {
    card.setConfig({
      type: "custom:power-flow-card-plus",
      entities: {
        grid: {
          entity: "sensor.grid_power",
          secondary_info: { entity: "sensor.grid_voltage" },
        },
      },
    });

    // sensor.grid_power is the SAME reference; only sensor.grid_voltage changes
    const gridPower = makeStateObj("500");
    const oldVoltage = makeStateObj("230");
    const newVoltage = makeStateObj("231");

    const oldHass = makeHass({
      states: {
        "sensor.grid_power": gridPower,
        "sensor.grid_voltage": oldVoltage,
      },
    });
    const newHass = makeHass({
      states: {
        "sensor.grid_power": gridPower,
        "sensor.grid_voltage": newVoltage,
      },
    });

    card.hass = newHass;
    const changed = new Map([["hass", oldHass]]);
    expect(callShouldUpdate(changed)).toBe(true);
  });

  it("returns true when split grid entity (consumption/production) changes", () => {
    card.setConfig({
      type: "custom:power-flow-card-plus",
      entities: {
        grid: {
          entity: {
            consumption: "sensor.grid_consumption",
            production: "sensor.grid_production",
          },
        },
      },
    });

    const production = makeStateObj("0");
    const oldConsumption = makeStateObj("300");
    const newConsumption = makeStateObj("400");

    const oldHass = makeHass({
      states: {
        "sensor.grid_consumption": oldConsumption,
        "sensor.grid_production": production,
      },
    });
    const newHass = makeHass({
      states: {
        "sensor.grid_consumption": newConsumption,
        "sensor.grid_production": production,
      },
    });

    card.hass = newHass;
    const changed = new Map([["hass", oldHass]]);
    expect(callShouldUpdate(changed)).toBe(true);
  });

  it("returns false when no referenced entity changes (multiple entities in config)", () => {
    card.setConfig({
      type: "custom:power-flow-card-plus",
      entities: {
        grid: { entity: "sensor.grid_power" },
        solar: { entity: "sensor.solar_power" },
      },
    });

    // Both referenced entities keep the same object references
    const gridState = makeStateObj("200");
    const solarState = makeStateObj("500");

    const oldHass = makeHass({
      states: {
        "sensor.grid_power": gridState,
        "sensor.solar_power": solarState,
        "light.irrelevant": makeStateObj("on"),
      },
    });
    const newHass = makeHass({
      states: {
        "sensor.grid_power": gridState,
        "sensor.solar_power": solarState,
        "light.irrelevant": makeStateObj("off"), // changes but not referenced
      },
    });

    card.hass = newHass;
    const changed = new Map([["hass", oldHass]]);
    expect(callShouldUpdate(changed)).toBe(false);
  });
});
