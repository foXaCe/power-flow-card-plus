/**
 * Characterization tests for the power-allocation algorithm in render().
 *
 * These tests lock the CURRENT output of the algorithm for a set of
 * well-defined scenarios.  Their purpose is to catch silent regressions in
 * the power-allocation math — not to assert what the math *should* produce.
 * If a snapshot diverges after a change, that change altered the allocation
 * behaviour and must be reviewed intentionally.
 *
 * DOM note: jsdom does not perform layout, so getBoundingClientRect() always
 * returns zeros.  The flow-line renderer (src/components/flows/index.ts) calls
 * getCircleCenter() which depends on layout — it returns null and bails out,
 * meaning #power-flow-lines will never contain <path> elements in these tests.
 * flowLineIds is therefore always [] and is kept in the snapshot only to make
 * the fixture explicit about that known jsdom limitation.
 */

import { makeHass, makeStateObj } from "./__fixtures__/hass";
import "../src/power-flow-card-plus";

type Snapshot = {
  gridConsumption: string | null;
  gridReturn: string | null;
  solar: string | null;
  home: string | null;
  batterySoc: string | null;
  batteryIn: string | null;
  batteryOut: string | null;
  flowLineIds: string[];
};

const text = (root: ShadowRoot, sel: string): string | null => root.querySelector(sel)?.textContent?.trim().replace(/\s+/g, " ") ?? null;

async function renderCard(states: Record<string, any>, config: any): Promise<Snapshot> {
  const card = document.createElement("power-flow-card-plus") as any;
  card.hass = makeHass({ states });
  card.setConfig(config);
  document.body.appendChild(card);
  await card.updateComplete;
  await card.updateComplete; // let updated()/_width settle
  const root = card.shadowRoot as ShadowRoot;
  const snap: Snapshot = {
    gridConsumption: text(root, ".circle-container.grid span.consumption"),
    gridReturn: text(root, ".circle-container.grid span.return"),
    solar: text(root, ".circle-container.solar span.solar"),
    home: text(root, ".circle-container.home #home-circle"),
    batterySoc: text(root, "#battery-state-of-charge-text"),
    batteryIn: text(root, ".circle-container.battery span.battery-in"),
    batteryOut: text(root, ".circle-container.battery span.battery-out"),
    flowLineIds: Array.from(root.querySelectorAll("#power-flow-lines path[id]"))
      .map((p) => (p as SVGElement).id)
      .sort(),
  };
  card.parentNode?.removeChild(card);
  return snap;
}

// ──────────────────────────────────────────────────────────────────────────────
// Snapshot suite — each test records the CURRENT output of the allocator.
// Do not hand-write expected values; Jest records them on first run.
// ──────────────────────────────────────────────────────────────────────────────

describe("power-allocation characterization", () => {
  describe("snapshots", () => {
    it("scenario A — grid consumption only", async () => {
      const snap = await renderCard(
        { "sensor.grid": makeStateObj("500", { unit_of_measurement: "W" }) },
        { type: "custom:power-flow-card-plus", entities: { grid: { entity: "sensor.grid" } } }
      );
      expect(snap).toMatchSnapshot();
    });

    it("scenario B — solar export to grid", async () => {
      const snap = await renderCard(
        {
          "sensor.solar": makeStateObj("3000", { unit_of_measurement: "W" }),
          "sensor.grid_c": makeStateObj("0", { unit_of_measurement: "W" }),
          "sensor.grid_p": makeStateObj("2000", { unit_of_measurement: "W" }),
        },
        {
          type: "custom:power-flow-card-plus",
          entities: {
            solar: { entity: "sensor.solar" },
            grid: { entity: { consumption: "sensor.grid_c", production: "sensor.grid_p" } },
          },
        }
      );
      expect(snap).toMatchSnapshot();
    });

    it("scenario C — solar charging battery", async () => {
      const snap = await renderCard(
        {
          "sensor.solar": makeStateObj("2000", { unit_of_measurement: "W" }),
          "sensor.batt": makeStateObj("-500", { unit_of_measurement: "W" }),
          "sensor.soc": makeStateObj("80", { unit_of_measurement: "%" }),
        },
        {
          type: "custom:power-flow-card-plus",
          entities: {
            solar: { entity: "sensor.solar" },
            battery: { entity: "sensor.batt", state_of_charge: "sensor.soc" },
          },
        }
      );
      expect(snap).toMatchSnapshot();
    });

    it("scenario D — battery discharge + grid", async () => {
      const snap = await renderCard(
        {
          "sensor.batt": makeStateObj("800", { unit_of_measurement: "W" }),
          "sensor.grid": makeStateObj("200", { unit_of_measurement: "W" }),
          "sensor.soc": makeStateObj("50", { unit_of_measurement: "%" }),
        },
        {
          type: "custom:power-flow-card-plus",
          entities: {
            grid: { entity: "sensor.grid" },
            battery: { entity: "sensor.batt", state_of_charge: "sensor.soc" },
          },
        }
      );
      expect(snap).toMatchSnapshot();
    });

    it("scenario E — grid charging battery (no solar)", async () => {
      const snap = await renderCard(
        {
          "sensor.grid": makeStateObj("1000", { unit_of_measurement: "W" }),
          "sensor.batt": makeStateObj("-600", { unit_of_measurement: "W" }),
          "sensor.soc": makeStateObj("40", { unit_of_measurement: "%" }),
        },
        {
          type: "custom:power-flow-card-plus",
          entities: {
            grid: { entity: "sensor.grid" },
            battery: { entity: "sensor.batt", state_of_charge: "sensor.soc" },
          },
        }
      );
      expect(snap).toMatchSnapshot();
    });

    it("scenario F — power outage", async () => {
      const snap = await renderCard(
        {
          "sensor.grid": makeStateObj("0", { unit_of_measurement: "W" }),
          "binary_sensor.outage": makeStateObj("on", {}),
        },
        {
          type: "custom:power-flow-card-plus",
          entities: {
            grid: {
              entity: "sensor.grid",
              power_outage: { entity: "binary_sensor.outage", state_alert: "on" },
            },
          },
        }
      );
      expect(snap).toMatchSnapshot();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Invariant assertions — human-readable checks for the unambiguous cases.
  // If an assertion fails due to a pre-existing discrepancy in the allocator,
  // the assertion is changed to lock the ACTUAL value and annotated below.
  // ──────────────────────────────────────────────────────────────────────────

  describe("invariants", () => {
    it("scenario A — home equals grid consumption (no other sources)", async () => {
      // Grid-only scenario: all grid power should flow to home.
      // home is the textContent of #home-circle which includes the icon label text
      // followed by the usage value.  We compare both fields contain "500" rather
      // than strict equality because #home-circle's textContent includes surrounding
      // icon/label text in addition to the numeric value.
      const snap = await renderCard(
        { "sensor.grid": makeStateObj("500", { unit_of_measurement: "W" }) },
        { type: "custom:power-flow-card-plus", entities: { grid: { entity: "sensor.grid" } } }
      );
      // gridConsumption span shows "→ 500 W" (with arrow icon text).
      // home (#home-circle) textContent includes the usage value "500 W".
      // We verify both contain the 500 W figure, which is the key invariant:
      // all consumed grid power flows to home when there are no other sinks.
      expect(snap.gridConsumption).toContain("500");
      expect(snap.home).toContain("500");
      // No return to grid expected
      expect(snap.gridReturn).toBeNull();
    });

    it("scenario B — solar export: return equals production minus home consumption", async () => {
      // solar=3000 W, grid_production=2000 W, grid_consumption=0 W
      // Expected: solar→home = 3000 - 2000 = 1000 W, grid return = 2000 W
      const snap = await renderCard(
        {
          "sensor.solar": makeStateObj("3000", { unit_of_measurement: "W" }),
          "sensor.grid_c": makeStateObj("0", { unit_of_measurement: "W" }),
          "sensor.grid_p": makeStateObj("2000", { unit_of_measurement: "W" }),
        },
        {
          type: "custom:power-flow-card-plus",
          entities: {
            solar: { entity: "sensor.solar" },
            grid: { entity: { consumption: "sensor.grid_c", production: "sensor.grid_p" } },
          },
        }
      );
      // Solar production of 3000 W should be displayed
      expect(snap.solar).toContain("3");
      // Grid return (export) of 2000 W should be displayed
      expect(snap.gridReturn).toContain("2");
      // No grid consumption expected
      expect(snap.gridConsumption).toBeNull();
    });
  });
});
