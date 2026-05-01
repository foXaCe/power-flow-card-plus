import { makeHass, makeStateObj } from "./__fixtures__/hass";

// Side-effect import: registers <power-flow-card-plus> as a custom element.
import "../src/power-flow-card-plus";

describe("PowerFlowCardPlus", () => {
  let card: any;

  beforeEach(() => {
    card = document.createElement("power-flow-card-plus");
  });

  afterEach(() => {
    if (card?.parentNode) card.parentNode.removeChild(card);
  });

  describe("custom element registration", () => {
    it("is registered with the customElements registry", () => {
      expect(customElements.get("power-flow-card-plus")).toBeDefined();
    });

    it("creates an instance via document.createElement", () => {
      expect(card).toBeInstanceOf(HTMLElement);
      expect(card.tagName.toLowerCase()).toBe("power-flow-card-plus");
    });
  });

  describe("setConfig", () => {
    it("accepts a minimal valid config (grid only)", () => {
      expect(() =>
        card.setConfig({
          type: "custom:power-flow-card-plus",
          entities: { grid: { entity: "sensor.grid_power" } },
        })
      ).not.toThrow();
    });

    it("accepts a config with battery only", () => {
      expect(() =>
        card.setConfig({
          type: "custom:power-flow-card-plus",
          entities: { battery: { entity: "sensor.battery_power" } },
        })
      ).not.toThrow();
    });

    it("accepts a config with solar only", () => {
      expect(() =>
        card.setConfig({
          type: "custom:power-flow-card-plus",
          entities: { solar: { entity: "sensor.solar_power" } },
        })
      ).not.toThrow();
    });

    it("rejects a config without battery/grid/solar entities", () => {
      expect(() =>
        card.setConfig({
          type: "custom:power-flow-card-plus",
          entities: {},
        })
      ).toThrow(/At least one entity for battery, grid or solar/);
    });

    it("rejects legacy individual1 key with an upgrade message", () => {
      expect(() =>
        card.setConfig({
          type: "custom:power-flow-card-plus",
          entities: {
            individual1: { entity: "sensor.dishwasher" },
            grid: { entity: "sensor.grid_power" },
          } as any,
        })
      ).toThrow(/outdated configuration/);
    });

    it("rejects legacy individual2 key with an upgrade message", () => {
      expect(() =>
        card.setConfig({
          type: "custom:power-flow-card-plus",
          entities: {
            individual2: { entity: "sensor.car" },
            grid: { entity: "sensor.grid_power" },
          } as any,
        })
      ).toThrow(/outdated configuration/);
    });

    it("rejects malformed types via the superstruct schema", () => {
      expect(() =>
        card.setConfig({
          type: "custom:power-flow-card-plus",
          entities: { grid: { entity: "sensor.grid_power" } },
          min_flow_rate: "fast" as any,
        })
      ).toThrow(/invalid configuration/);
    });

    it("coerces numeric fields and applies defaults", () => {
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: { grid: { entity: "sensor.grid_power" } },
      });
      // Defaults applied via coerceNumber() — see src/utils/get-default-config.ts.
      expect(typeof card._config.min_flow_rate).toBe("number");
      expect(typeof card._config.max_flow_rate).toBe("number");
      expect(typeof card._config.kw_decimals).toBe("number");
      expect(typeof card._config.w_decimals).toBe("number");
      expect(typeof card._config.watt_threshold).toBe("number");
    });

    it("does not mutate the caller's config object", () => {
      const original = {
        type: "custom:power-flow-card-plus",
        entities: { grid: { entity: "sensor.grid_power" } },
      };
      const snapshot = JSON.parse(JSON.stringify(original));
      card.setConfig(original);
      expect(original).toEqual(snapshot);
    });
  });

  describe("getCardSize", () => {
    it("returns a number for a minimal config", () => {
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: { grid: { entity: "sensor.grid_power" } },
      });
      const size = card.getCardSize();
      expect(typeof size).toBe("number");
      expect(size).toBeGreaterThan(0);
    });

    it("grows when fossil_fuel_percentage is configured", () => {
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: { grid: { entity: "sensor.grid_power" } },
      });
      const baseline = card.getCardSize();
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: {
          grid: { entity: "sensor.grid_power" },
          fossil_fuel_percentage: { entity: "sensor.fossil_pct" },
        },
      });
      expect(card.getCardSize()).toBeGreaterThan(baseline);
    });
  });

  describe("getGridOptions", () => {
    it("returns the expected layout structure", () => {
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: { grid: { entity: "sensor.grid_power" } },
      });
      const opts = card.getGridOptions();
      expect(opts.columns).toBe(12);
      expect(typeof opts.rows).toBe("number");
      expect(opts.rows).toBeGreaterThan(0);
      expect(opts.min_columns).toBe(6);
      expect(opts.max_columns).toBe(12);
      expect(opts.min_rows).toBe(opts.rows);
    });

    it("adds rows when daily_cost is enabled", () => {
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: { grid: { entity: "sensor.grid_power" } },
      });
      const baseline = card.getGridOptions().rows;
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: { grid: { entity: "sensor.grid_power" } },
        show_daily_cost: true,
      });
      expect(card.getGridOptions().rows).toBeGreaterThan(baseline);
    });
  });

  describe("render", () => {
    it("renders a non-empty shadowRoot with valid hass + config", async () => {
      const hass = makeHass({
        states: {
          "sensor.grid_power": makeStateObj("100", { unit_of_measurement: "W" }),
        },
      });
      card.hass = hass;
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: { grid: { entity: "sensor.grid_power" } },
      });
      document.body.appendChild(card);
      await card.updateComplete;
      expect(card.shadowRoot).toBeTruthy();
      expect(card.shadowRoot.innerHTML.length).toBeGreaterThan(0);
      // The top-level <ha-card> wrapper is always rendered when hass + config
      // are both set, regardless of which entities the user configured.
      expect(card.shadowRoot.querySelector("ha-card")).toBeTruthy();
    });

    it("renders nothing when hass is not yet set", async () => {
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: { grid: { entity: "sensor.grid_power" } },
      });
      document.body.appendChild(card);
      await card.updateComplete;
      // Without `hass`, `render()` returns an empty template — no <ha-card>.
      expect(card.shadowRoot.querySelector("ha-card")).toBeFalsy();
    });
  });
});
