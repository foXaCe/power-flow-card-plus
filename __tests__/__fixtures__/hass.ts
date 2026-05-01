/**
 * Reusable mock for the Home Assistant `hass` object.
 *
 * The `HomeAssistant` interface (see `src/ha/types.ts`) is large and references
 * several runtime-only types from `home-assistant-js-websocket`. Tests rarely
 * need a real implementation, so this fixture provides a minimal stub with
 * sane defaults and lets callers override fields via `makeHass({ ... })`.
 *
 * Casts to `any` are intentional and scoped: keeping this file fully typed
 * would force tests to import bulky third-party types (Auth, Connection, …)
 * that they never actually exercise.
 */
import type { HomeAssistant } from "../../src/ha";

export const makeHass = (overrides: Partial<HomeAssistant> = {}): HomeAssistant =>
  ({
    states: {},
    entities: {},
    devices: {},
    areas: {},
    config: { language: "en" } as any,
    themes: {} as any,
    selectedTheme: undefined,
    panels: {},
    panelUrl: "",
    language: "en",
    selectedLanguage: null,
    locale: { language: "en" },
    resources: {},
    localize: (key: string) => key,
    translationMetadata: {} as any,
    dockedSidebar: "auto",
    vibrate: false,
    suspendWhenHidden: false,
    enableShortcuts: true,
    moreInfoEntityId: null,
    user: { name: "test", is_admin: true },
    userData: null,
    hassUrl: () => "/",
    callService: jest.fn(() => Promise.resolve()) as any,
    callApi: jest.fn(() => Promise.resolve({})) as any,
    fetchWithAuth: jest.fn(() => Promise.resolve(new Response())) as any,
    sendWS: jest.fn() as any,
    callWS: jest.fn(() => Promise.resolve({})) as any,
    formatEntityState: (stateObj: any, state?: string) => state ?? stateObj?.state ?? "",
    formatEntityAttributeValue: (_so: any, _attr: string, val: any) => String(val ?? ""),
    formatEntityAttributeName: (_so: any, attr: string) => attr,
    auth: {} as any,
    connection: {
      subscribeMessage: jest.fn(() => Promise.resolve(() => {})),
      subscribeEvents: jest.fn(() => Promise.resolve(() => {})),
      sendMessagePromise: jest.fn(() => Promise.resolve({})),
    } as any,
    connected: true,
    services: {} as any,
    ...overrides,
  } as HomeAssistant);

/**
 * Build a minimal `HassEntity`-like object usable as a value in `hass.states`.
 * Sufficient for `getEntityState`/`getEntityStateWatts` helpers under test.
 */
export const makeStateObj = (state: string, attributes: Record<string, any> = {}) => ({
  entity_id: "sensor.test",
  state,
  attributes: { unit_of_measurement: "W", ...attributes },
  last_changed: new Date().toISOString(),
  last_updated: new Date().toISOString(),
  context: { id: "x", parent_id: null, user_id: null },
});
