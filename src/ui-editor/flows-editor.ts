import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "@/ha";
import { PowerFlowCardPlusConfig, ArrowConfig, ArrowsConfig } from "../power-flow-card-plus-config";
import { loadHaForm } from "./utils/loadHAForm";
import { convertColorListToHex } from "../utils/convertColor";

type LocalizeFn = (key: string) => string;

const ARROW_KEYS: ReadonlyArray<keyof ArrowsConfig> = [
  "solar_to_daily_export",
  "grid_to_home",
  "solar_to_home",
  "solar_to_grid",
  "battery_to_home",
  "solar_to_battery",
  "grid_to_battery",
] as const;

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const hexToRgbTuple = (hex: string): [number, number, number] | undefined => {
  if (typeof hex !== "string" || !HEX_COLOR_RE.test(hex)) return undefined;
  const normalized = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return [r, g, b];
};

const isRgbTuple = (value: unknown): value is [number, number, number] =>
  Array.isArray(value) && value.length === 3 && value.every((v) => typeof v === "number" && Number.isFinite(v));

@customElement("flows-editor")
export class FlowsEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public config!: PowerFlowCardPlusConfig;
  @property({ attribute: false }) public localize!: LocalizeFn;

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }

    ha-form {
      display: block;
      width: 100%;
    }

    .info-banner {
      background: var(--info-color, #2196f3);
      color: white;
      padding: 12px 16px;
      margin-bottom: 16px;
      border-radius: 8px;
      font-size: 14px;
    }
  `;

  public connectedCallback(): void {
    super.connectedCallback();
    loadHaForm();
  }

  /**
   * Build the data shape ha-form expects: stored arrows.color values are CSS
   * strings (hex/css name), but the color_rgb selector binds to `[r, g, b]`
   * tuples. Convert hex on read so users keep a working color picker.
   */
  private get _formData(): Record<string, unknown> {
    const config = this.config ?? ({} as PowerFlowCardPlusConfig);
    const baseArrows = config.arrows ?? {};
    const arrows: Record<string, ArrowConfig> = {};

    for (const key of ARROW_KEYS) {
      const original = baseArrows[key];
      if (original) {
        const next: ArrowConfig = { ...original };
        if (typeof original.color === "string") {
          const tuple = hexToRgbTuple(original.color);
          if (tuple) {
            (next as unknown as { color: [number, number, number] }).color = tuple;
          }
        }
        arrows[key] = next;
      }
    }

    return {
      ...config,
      arrows,
    };
  }

  private get _schema() {
    const localize = this.localize;
    return [
      {
        type: "expandable" as const,
        name: "",
        title: localize("editor.animation_speed"),
        schema: [
          {
            type: "grid" as const,
            column_min_width: "200px",
            schema: [
              {
                name: "min_flow_rate",
                label: localize("editor.min_flow_rate"),
                default: 0.75,
                selector: { number: { min: 0.1, max: 10, step: 0.1, mode: "box" } },
              },
              {
                name: "max_flow_rate",
                label: localize("editor.max_flow_rate"),
                default: 6,
                selector: { number: { min: 0.1, max: 100, step: 0.1, mode: "box" } },
              },
              {
                name: "disable_dots",
                label: localize("editor.disable_dots"),
                selector: { boolean: {} },
              },
            ],
          },
        ],
      },
      {
        type: "expandable" as const,
        name: "",
        title: localize("editor.circle_appearance"),
        schema: [
          {
            type: "grid" as const,
            column_min_width: "200px",
            schema: [
              {
                name: "circle_border_width",
                label: localize("editor.circle_border_width"),
                default: 2,
                selector: { number: { min: 1, max: 10, step: 1, mode: "box" } },
              },
              {
                name: "circle_pulse_animation",
                label: localize("editor.circle_pulse_animation"),
                selector: { boolean: {} },
              },
              {
                name: "circle_gradient_mode",
                label: localize("editor.circle_gradient_mode"),
                selector: { boolean: {} },
              },
            ],
          },
        ],
      },
      {
        type: "expandable" as const,
        name: "",
        title: localize("editor.display_options"),
        schema: [
          {
            type: "grid" as const,
            column_min_width: "200px",
            schema: [
              {
                name: "watt_threshold",
                label: localize("editor.watt_threshold"),
                default: 1000,
                selector: { number: { min: 100, max: 10000, step: 100, mode: "box" } },
              },
              {
                name: "w_decimals",
                label: localize("editor.w_decimals"),
                default: 0,
                selector: { number: { min: 0, max: 5, step: 1, mode: "box" } },
              },
              {
                name: "kw_decimals",
                label: localize("editor.kw_decimals"),
                default: 2,
                selector: { number: { min: 0, max: 5, step: 1, mode: "box" } },
              },
            ],
          },
        ],
      },
      {
        type: "expandable" as const,
        name: "arrows",
        title: localize("editor.arrows_customization"),
        schema: ARROW_KEYS.map((arrowKey) => ({
          type: "expandable" as const,
          name: arrowKey,
          title: localize(`editor.arrow_${arrowKey}`),
          schema: [
            {
              name: "color",
              label: localize("editor.arrow_color"),
              selector: { color_rgb: {} },
            },
            {
              type: "grid" as const,
              column_min_width: "200px",
              schema: [
                {
                  name: "thickness",
                  label: localize("editor.arrow_thickness"),
                  default: 1.5,
                  selector: { number: { min: 0.5, max: 10, step: 0.5, mode: "box" } },
                },
                {
                  name: "length",
                  label: localize("editor.arrow_length"),
                  default: 80,
                  selector: { number: { min: 20, max: 300, step: 10, mode: "box" } },
                },
                {
                  name: "offset_x",
                  label: localize("editor.arrow_offset_x"),
                  default: 0,
                  selector: { number: { min: -200, max: 200, step: 5, mode: "box" } },
                },
                {
                  name: "offset_y",
                  label: localize("editor.arrow_offset_y"),
                  default: 0,
                  selector: { number: { min: -200, max: 200, step: 5, mode: "box" } },
                },
              ],
            },
          ],
        })),
      },
    ];
  }

  private _computeLabel = (schema: { name?: string; label?: string; title?: string }) => schema.label ?? schema.title ?? schema.name ?? "";

  /**
   * Sanitize the value emitted by ha-form before re-dispatching:
   *   - convert color_rgb tuples back to a hex string (the runtime expects CSS color strings)
   *   - drop empty arrow entries so toggling values back to default cleans up the YAML
   *   - drop the `arrows` key entirely when there are no overrides left
   */
  private _sanitize(value: Record<string, unknown>): PowerFlowCardPlusConfig {
    const next: Record<string, unknown> = { ...value };

    const rawArrows = (next.arrows ?? {}) as Record<string, ArrowConfig | undefined>;
    const cleanedArrows: Record<string, ArrowConfig> = {};

    for (const key of ARROW_KEYS) {
      const arrow = rawArrows[key];
      if (arrow) {
        const cleaned: ArrowConfig = {};
        const color = (arrow as unknown as { color?: unknown }).color;
        if (typeof color === "string" && color.length > 0) {
          cleaned.color = color;
        } else if (isRgbTuple(color)) {
          cleaned.color = convertColorListToHex(color);
        }
        if (typeof arrow.thickness === "number" && Number.isFinite(arrow.thickness)) cleaned.thickness = arrow.thickness;
        if (typeof arrow.length === "number" && Number.isFinite(arrow.length)) cleaned.length = arrow.length;
        if (typeof arrow.offset_x === "number" && Number.isFinite(arrow.offset_x)) cleaned.offset_x = arrow.offset_x;
        if (typeof arrow.offset_y === "number" && Number.isFinite(arrow.offset_y)) cleaned.offset_y = arrow.offset_y;
        if (Object.keys(cleaned).length > 0) cleanedArrows[key] = cleaned;
      }
    }

    if (Object.keys(cleanedArrows).length > 0) {
      next.arrows = cleanedArrows;
    } else {
      delete next.arrows;
    }

    return next as PowerFlowCardPlusConfig;
  }

  private _valueChanged = (ev: CustomEvent) => {
    ev.stopPropagation();
    const value = (ev.detail?.value ?? {}) as Record<string, unknown>;
    const newConfig = this._sanitize(value);
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      })
    );
  };

  render() {
    if (!this.config || !this.localize) return nothing;
    return html`
      <div class="info-banner">${this.localize("editor.flows_editor_info")}</div>
      <ha-form
        .hass=${this.hass}
        .data=${this._formData}
        .schema=${this._schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "flows-editor": FlowsEditor;
  }
}
