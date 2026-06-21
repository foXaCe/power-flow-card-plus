import { makeHass, makeStateObj } from "./__fixtures__/hass";

// Side-effect import: registers <power-flow-card-plus> as a custom element.
import "../src/power-flow-card-plus";

describe("PowerFlowCardPlus", () => {
  let card: any;
  const renderTemplateResult = (result: string) => ({
    result,
    listeners: { all: false, domains: [], entities: [], time: false },
  });

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

  describe("getEntitySuggestion (card picker, HA 2026.6+)", () => {
    // The hook is registered as a property on the window.customCards entry.
    const getSuggestion = () => {
      const entry = (window as any).customCards?.find((c: any) => c.type === "power-flow-card-plus");
      return entry?.getEntitySuggestion as ((hass: any, entityId: string) => { config: Record<string, unknown> } | undefined) | undefined;
    };

    it("is exposed on the customCards registry entry", () => {
      expect(typeof getSuggestion()).toBe("function");
    });

    it("returns undefined for an unknown entity", () => {
      const hass = makeHass({ states: {} });
      expect(getSuggestion()!(hass, "sensor.nope")).toBeUndefined();
    });

    it("returns undefined for a non-power entity (e.g. temperature)", () => {
      const hass = makeHass({
        states: { "sensor.temp": makeStateObj("21", { unit_of_measurement: "°C", device_class: "temperature" }) },
      });
      expect(getSuggestion()!(hass, "sensor.temp")).toBeUndefined();
    });

    it("suggests the grid role for a generic power sensor", () => {
      const hass = makeHass({
        states: { "sensor.house_power": makeStateObj("100", { unit_of_measurement: "W", device_class: "power" }) },
      });
      const res = getSuggestion()!(hass, "sensor.house_power");
      expect(res?.config.type).toBe("custom:power-flow-card-plus");
      expect((res?.config.entities as any).grid.entity).toBe("sensor.house_power");
    });

    it("detects a power sensor by unit alone (no device_class)", () => {
      const hass = makeHass({
        states: { "sensor.load": makeStateObj("42", { unit_of_measurement: "W" }) },
      });
      const res = getSuggestion()!(hass, "sensor.load");
      expect((res?.config.entities as any).grid.entity).toBe("sensor.load");
    });

    it("infers the solar role from the entity name", () => {
      const hass = makeHass({
        states: { "sensor.pv_production": makeStateObj("2000", { unit_of_measurement: "W", device_class: "power" }) },
      });
      const res = getSuggestion()!(hass, "sensor.pv_production");
      expect((res?.config.entities as any).solar.entity).toBe("sensor.pv_production");
    });

    it("infers the battery role from the friendly name", () => {
      const hass = makeHass({
        states: { "sensor.bat1": makeStateObj("500", { unit_of_measurement: "kW", friendly_name: "Battery power" }) },
      });
      const res = getSuggestion()!(hass, "sensor.bat1");
      expect((res?.config.entities as any).battery.entity).toBe("sensor.bat1");
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

  describe("keyboard accessibility", () => {
    const renderGridCard = async () => {
      const hass = makeHass({
        states: { "sensor.grid_power": makeStateObj("100", { unit_of_measurement: "W" }) },
      });
      card.hass = hass;
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: { grid: { entity: "sensor.grid_power" } },
        clickable_entities: true,
      });
      document.body.appendChild(card);
      await card.updateComplete;
      return card.shadowRoot.querySelector('.circle-container.grid .circle[role="button"]') as HTMLElement;
    };

    it("exposes the grid circle as a focusable button", async () => {
      const circle = await renderGridCard();
      expect(circle).toBeTruthy();
      expect(circle.getAttribute("tabindex")).toBe("0");
      expect(circle.getAttribute("aria-label")).toBeTruthy();
    });

    it("includes the current value in the circle's aria-label", async () => {
      // sensor.grid_power = 100 W → screen readers hear the value on focus.
      const circle = await renderGridCard();
      expect(circle.getAttribute("aria-label")).toContain("100");
    });

    // Guards against the `@keyDown` (camelCase) regression: the DOM event is
    // `keydown`, so a `@keyDown` binding never fires and keyboard users are
    // locked out. These tests fail if the binding name regresses.
    it("activates the circle on Enter", async () => {
      const circle = await renderGridCard();
      const spy = jest.spyOn(card, "openDetails");
      circle.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      expect(spy).toHaveBeenCalled();
    });

    it("activates the circle on Space", async () => {
      const circle = await renderGridCard();
      const spy = jest.spyOn(card, "openDetails");
      circle.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      expect(spy).toHaveBeenCalled();
    });

    it("ignores unrelated keys", async () => {
      const circle = await renderGridCard();
      const spy = jest.spyOn(card, "openDetails");
      circle.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("template subscriptions", () => {
    it("updates template results immutably when a render_template result arrives", async () => {
      const callbacks: Array<(result: ReturnType<typeof renderTemplateResult>) => void> = [];
      const hass = makeHass({
        connection: {
          subscribeMessage: jest.fn((callback: (result: ReturnType<typeof renderTemplateResult>) => void) => {
            callbacks.push(callback);
            return Promise.resolve(jest.fn());
          }),
          subscribeEvents: jest.fn(() => Promise.resolve(() => {})),
          sendMessagePromise: jest.fn(() => Promise.resolve({})),
        } as any,
      });

      card.hass = hass;
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: {
          grid: {
            entity: "sensor.grid_power",
            secondary_info: { template: "{{ states('sensor.grid_power') }}" },
          },
        },
      });

      card._tryConnectAll();
      await Promise.resolve();
      expect(callbacks).toHaveLength(1);

      const callback = callbacks[0]!;
      callback(renderTemplateResult("first"));
      const firstResultsRef = card._templateResults;
      expect(card._templateResults.gridSecondary.result).toBe("first");

      callback(renderTemplateResult("second"));
      expect(card._templateResults).not.toBe(firstResultsRef);
      expect(card._templateResults.gridSecondary.result).toBe("second");
    });

    it("resubscribes when a configured template changes", async () => {
      const unsubs = [jest.fn(), jest.fn()];
      let unsubscribeIndex = 0;
      const subscribeMessage = jest.fn((_callback: unknown, _params: { template: string }) => Promise.resolve(unsubs[unsubscribeIndex++]!));
      const hass = makeHass({
        connection: {
          subscribeMessage,
          subscribeEvents: jest.fn(() => Promise.resolve(() => {})),
          sendMessagePromise: jest.fn(() => Promise.resolve({})),
        } as any,
      });

      card.hass = hass;
      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: {
          grid: {
            entity: "sensor.grid_power",
            secondary_info: { template: "{{ states('sensor.a') }}" },
          },
        },
      });
      card._tryConnectAll();
      await Promise.resolve();

      card.setConfig({
        type: "custom:power-flow-card-plus",
        entities: {
          grid: {
            entity: "sensor.grid_power",
            secondary_info: { template: "{{ states('sensor.b') }}" },
          },
        },
      });
      card._tryConnectAll();
      await Promise.resolve();

      expect(subscribeMessage).toHaveBeenCalledTimes(2);
      expect(subscribeMessage.mock.calls[0]![1].template).toBe("{{ states('sensor.a') }}");
      expect(subscribeMessage.mock.calls[1]![1].template).toBe("{{ states('sensor.b') }}");
      expect(unsubs[0]).toHaveBeenCalled();
    });

    it("resubscribes when template variables change with the same template text", async () => {
      const unsubs = [jest.fn(), jest.fn()];
      let unsubscribeIndex = 0;
      const subscribeMessage = jest.fn((_callback: unknown, _params: { variables: { config: { title?: string } } }) =>
        Promise.resolve(unsubs[unsubscribeIndex++]!)
      );
      const hass = makeHass({
        connection: {
          subscribeMessage,
          subscribeEvents: jest.fn(() => Promise.resolve(() => {})),
          sendMessagePromise: jest.fn(() => Promise.resolve({})),
        } as any,
      });

      const template = "{{ config.title }}";
      card.hass = hass;
      card.setConfig({
        type: "custom:power-flow-card-plus",
        title: "First title",
        entities: {
          grid: {
            entity: "sensor.grid_power",
            secondary_info: { template },
          },
        },
      });
      card._tryConnectAll();
      await Promise.resolve();

      card.setConfig({
        type: "custom:power-flow-card-plus",
        title: "Second title",
        entities: {
          grid: {
            entity: "sensor.grid_power",
            secondary_info: { template },
          },
        },
      });
      card._tryConnectAll();
      await Promise.resolve();

      expect(subscribeMessage).toHaveBeenCalledTimes(2);
      expect(subscribeMessage.mock.calls[0]![1].variables.config.title).toBe("First title");
      expect(subscribeMessage.mock.calls[1]![1].variables.config.title).toBe("Second title");
      expect(unsubs[0]).toHaveBeenCalled();
    });
  });
});
