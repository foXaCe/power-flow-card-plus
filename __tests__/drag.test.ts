import { makeHass, makeStateObj } from "./__fixtures__/hass";
import "../src/power-flow-card-plus";

const SOLAR_STORAGE_KEY = "power-flow-card-plus-positions:sensor.grid|sensor.solar";

// jsdom has no Touch constructor: a plain event carrying `touches` is enough here.
const touchEvent = (type: string, x: number, y: number) => {
  const ev = new Event(type, { bubbles: true, cancelable: true, composed: true });
  Object.defineProperty(ev, "touches", { value: type === "touchend" ? [] : [{ clientX: x, clientY: y }] });
  return ev;
};
const mouseEvent = (type: string, x: number, y: number) =>
  new MouseEvent(type, { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y });

describe("dragging circles (#284)", () => {
  let card: any;

  const mount = async (options: Record<string, unknown> = {}) => {
    card = document.createElement("power-flow-card-plus");
    card.setConfig({
      type: "custom:power-flow-card-plus",
      clickable_entities: true,
      entities: { grid: { entity: "sensor.grid" }, solar: { entity: "sensor.solar" } },
      ...options,
    });
    card.hass = makeHass({
      states: {
        "sensor.grid": makeStateObj("500", { unit_of_measurement: "W" }),
        "sensor.solar": makeStateObj("800", { unit_of_measurement: "W" }),
      },
    } as any);
    document.body.appendChild(card);
    await card.updateComplete;
    return card.shadowRoot.querySelector(".circle-container.solar") as HTMLElement;
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => card?.remove());

  describe("by default", () => {
    it.each([
      ["mouse", mouseEvent("mousedown", 10, 10), mouseEvent("mousemove", 90, 90), mouseEvent("mouseup", 90, 90)],
      ["touch", touchEvent("touchstart", 10, 10), touchEvent("touchmove", 90, 90), touchEvent("touchend", 90, 90)],
    ])("a %s drag moves nothing, stores nothing and blocks nothing", async (_name, start, move, end) => {
      const solar = await mount();
      solar.dispatchEvent(start);
      document.dispatchEvent(move);
      document.dispatchEvent(end);
      expect(start.defaultPrevented).toBe(false);
      expect(move.defaultPrevented).toBe(false);
      expect(card._config.custom_positions).toBeUndefined();
      expect(localStorage.length).toBe(0);
    });

    it("shows no move cursor", async () => {
      await mount();
      expect(card.hasAttribute("drag-enabled")).toBe(false);
    });

    it("keeps a position dragged with an earlier version", async () => {
      localStorage.setItem(SOLAR_STORAGE_KEY, JSON.stringify({ solar: { top: 5, left: 6 } }));
      await mount();
      expect(card._config.custom_positions).toEqual({ solar: { top: 5, left: 6 } });
    });

    it("lets the YAML position win over a stored one", async () => {
      localStorage.setItem(SOLAR_STORAGE_KEY, JSON.stringify({ solar: { top: 5, left: 6 }, grid: { top: 1, left: 2 } }));
      await mount({ custom_positions: { solar: { top: 50, left: 60 } } });
      expect(card._config.custom_positions).toEqual({ solar: { top: 50, left: 60 }, grid: { top: 1, left: 2 } });
    });
  });

  describe("with enable_drag", () => {
    const enabled = { enable_drag: true };

    it("a tap opens more-info on touch and stores nothing", async () => {
      const solar = await mount({ ...enabled, custom_positions: { solar: { top: 50, left: 60 } } });
      const opened: string[] = [];
      card.addEventListener("hass-more-info", (ev: any) => opened.push(ev.detail.entityId));
      const start = touchEvent("touchstart", 10, 10);
      solar.dispatchEvent(start);
      document.dispatchEvent(touchEvent("touchmove", 12, 11));
      document.dispatchEvent(touchEvent("touchend", 12, 11));
      expect(start.defaultPrevented).toBe(false);
      (solar.querySelector(".circle") as HTMLElement).click();
      expect(opened).toEqual(["sensor.solar"]);
      expect(localStorage.length).toBe(0);
    });

    it.each([
      ["mouse", () => mouseEvent("mousedown", 10, 10), () => mouseEvent("mousemove", 90, 90), () => mouseEvent("mouseup", 90, 90)],
      ["touch", () => touchEvent("touchstart", 10, 10), () => touchEvent("touchmove", 90, 90), () => touchEvent("touchend", 90, 90)],
    ])("a %s drag moves and stores the circle, and does not open more-info", async (_name, start, move, end) => {
      const solar = await mount(enabled);
      const opened: string[] = [];
      card.addEventListener("hass-more-info", (ev: any) => opened.push(ev.detail.entityId));
      solar.dispatchEvent(start());
      document.dispatchEvent(move());
      document.dispatchEvent(end());
      (solar.querySelector(".circle") as HTMLElement).click();
      expect(opened).toEqual([]);
      expect(card._config.custom_positions.solar).toBeDefined();
      expect(Object.keys(JSON.parse(localStorage.getItem(SOLAR_STORAGE_KEY)!))).toEqual(["solar"]);
    });

    it("a cancelled touch ends the drag", async () => {
      const solar = await mount(enabled);
      solar.dispatchEvent(touchEvent("touchstart", 10, 10));
      document.dispatchEvent(new Event("touchcancel"));
      document.dispatchEvent(touchEvent("touchmove", 90, 90));
      expect(card._draggedElement).toBeNull();
      expect(card._config.custom_positions).toBeUndefined();
    });

    it("leaves no document listener behind", async () => {
      const solar = await mount(enabled);
      const add = jest.spyOn(document, "addEventListener");
      const remove = jest.spyOn(document, "removeEventListener");
      solar.dispatchEvent(mouseEvent("mousedown", 10, 10));
      document.dispatchEvent(mouseEvent("mouseup", 10, 10));
      expect(add.mock.calls.length).toBeGreaterThan(0);
      expect(remove.mock.calls.length).toBe(add.mock.calls.length);
      add.mockRestore();
      remove.mockRestore();
    });

    it("lets the stored position win, as it is the dragged one", async () => {
      localStorage.setItem(SOLAR_STORAGE_KEY, JSON.stringify({ solar: { top: 5, left: 6 } }));
      await mount({ ...enabled, custom_positions: { solar: { top: 50, left: 60 } } });
      expect(card._config.custom_positions).toEqual({ solar: { top: 5, left: 6 } });
      expect(card.hasAttribute("drag-enabled")).toBe(true);
    });
  });
});
