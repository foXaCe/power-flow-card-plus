import type { Auth, Connection, HassConfig, HassEntities, HassEntity, HassServices, MessageBase } from "home-assistant-js-websocket";

export interface FrontendLocaleData {
  language: string;
  number_format?: string;
  time_format?: string;
  date_format?: string;
  first_weekday?: string;
  time_zone?: string;
}

export interface EntityRegistryDisplayEntry {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels?: string[];
  hidden?: boolean;
  entity_category?: "config" | "diagnostic";
  translation_key?: string;
  platform?: string;
  display_precision?: number;
}

export interface HomeAssistant {
  auth: Auth & { external?: any };
  connection: Connection;
  connected: boolean;
  states: HassEntities;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices?: Record<string, any>;
  areas?: Record<string, any>;
  services: HassServices;
  config: HassConfig;
  themes: any;
  selectedTheme?: any;
  panels: Record<string, any>;
  panelUrl: string;
  language: string;
  selectedLanguage: string | null;
  locale: FrontendLocaleData;
  resources: Record<string, Record<string, string>>;
  localize: (key: string, ...args: any[]) => string;
  translationMetadata: Record<string, any>;
  dockedSidebar: "docked" | "always_hidden" | "auto";
  vibrate: boolean;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  moreInfoEntityId: string | null;
  user?: any;
  userData?: Record<string, unknown> | null;
  hassUrl(path?: string): string;
  callService: (domain: string, service: string, serviceData?: Record<string, any>, target?: any) => Promise<unknown>;
  callApi<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, parameters?: Record<string, any>, headers?: Record<string, string>): Promise<T>;
  fetchWithAuth: (path: string, init?: Record<string, any>) => Promise<Response>;
  sendWS: (msg: MessageBase) => void;
  callWS<T>(msg: MessageBase): Promise<T>;
  formatEntityState(stateObj: HassEntity, state?: string): string;
  formatEntityAttributeValue(stateObj: HassEntity, attribute: string, value?: any): string;
  formatEntityAttributeName(stateObj: HassEntity, attribute: string): string;
}

export interface ActionConfig {
  action: "more-info" | "toggle" | "call-service" | "navigate" | "url" | "none" | "perform-action" | "fire-dom-event" | "toggle-menu";
  navigation_path?: string;
  url_path?: string;
  service?: string;
  service_data?: Record<string, unknown>;
  data?: Record<string, unknown>;
  target?: any;
  entity?: string;
  confirmation?: boolean | { text?: string; exemptions?: { user: string }[] };
  haptic?: "success" | "warning" | "failure" | "light" | "medium" | "heavy" | "selection";
  repeat?: number;
  repeat_limit?: number;
  event?: string;
  event_data?: Record<string, unknown>;
  perform_action?: string;
  browser_mod?: any;
}

export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  view_layout?: any;
  layout_options?: any;
  type: string;
  [key: string]: any;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  lovelace?: any;
  setConfig(config: LovelaceCardConfig): void;
  focusYamlEditor?: () => void;
}
