import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "@/ha";
import { PowerFlowCardPlusConfig, CustomPositions, CirclePosition } from "../power-flow-card-plus-config";
import { loadHaForm } from "./utils/loadHAForm";
import { customPositionsSchema } from "./schema/custom_positions";

type LocalizeFn = (key: string) => string;

const POSITION_KEYS: ReadonlyArray<keyof CustomPositions> = ["solar", "grid", "home", "battery", "daily_cost", "daily_export"] as const;

@customElement("custom-positions-editor")
export class CustomPositionsEditor extends LitElement {
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
      background: var(--warning-color, #ff9800);
      color: var(--text-primary-color, white);
      padding: 12px 16px;
      margin-bottom: 16px;
      border-radius: 8px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .info-banner ha-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .info-content {
      flex: 1;
    }

    .info-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .info-text {
      font-size: 13px;
      line-height: 1.4;
      opacity: 0.95;
    }

    .card-dimensions {
      background: var(--primary-background-color);
      border: 1px solid var(--divider-color);
      padding: 12px 16px;
      margin-bottom: 16px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .card-dimensions strong {
      color: var(--primary-text-color);
    }

    .reset-all {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    mwc-button {
      --mdc-theme-primary: var(--primary-color);
    }
  `;

  public connectedCallback(): void {
    super.connectedCallback();
    loadHaForm();
  }

  private get _formData(): Record<string, unknown> {
    const config = this.config ?? ({} as PowerFlowCardPlusConfig);
    return {
      custom_positions: config.custom_positions ?? {},
    };
  }

  private _computeLabel = (schema: { name?: string; label?: string; title?: string }) => schema.label ?? schema.title ?? schema.name ?? "";

  /**
   * Sanitize positions emitted by ha-form: drop entries where both axes are
   * blank, and drop the whole `custom_positions` key when nothing is left so
   * default behaviour is restored when the user clears the inputs.
   */
  private _sanitize(value: Record<string, unknown>): PowerFlowCardPlusConfig {
    const baseConfig = (this.config ?? {}) as PowerFlowCardPlusConfig;
    const rawPositions = (value.custom_positions ?? {}) as Record<string, CirclePosition | undefined>;
    const cleaned: CustomPositions = {};

    for (const key of POSITION_KEYS) {
      const pos = rawPositions[key];
      if (pos) {
        const next: CirclePosition = {};
        if (typeof pos.top === "number" && Number.isFinite(pos.top)) next.top = pos.top;
        if (typeof pos.left === "number" && Number.isFinite(pos.left)) next.left = pos.left;
        if (next.top !== undefined || next.left !== undefined) {
          cleaned[key] = next;
        }
      }
    }

    const newConfig: PowerFlowCardPlusConfig = { ...baseConfig };
    if (Object.keys(cleaned).length > 0) {
      newConfig.custom_positions = cleaned;
    } else {
      delete newConfig.custom_positions;
    }
    return newConfig;
  }

  private _valueChanged = (ev: CustomEvent) => {
    ev.stopPropagation();
    const value = (ev.detail?.value ?? {}) as Record<string, unknown>;
    this._fireChanged(this._sanitize(value));
  };

  private _resetAll = () => {
    const baseConfig = (this.config ?? {}) as PowerFlowCardPlusConfig;
    const newConfig: PowerFlowCardPlusConfig = { ...baseConfig };
    delete newConfig.custom_positions;
    this._fireChanged(newConfig);
  };

  private _fireChanged(config: PowerFlowCardPlusConfig): void {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.config || !this.localize) return nothing;
    const localize = this.localize;
    const schema = customPositionsSchema(localize);
    return html`
      <div class="info-banner">
        <ha-icon icon="mdi:information"></ha-icon>
        <div class="info-content">
          <div class="info-title">${localize("editor.position_editor_info_title")}</div>
          <div class="info-text">${localize("editor.position_editor_info_text")}</div>
        </div>
      </div>

      <div class="card-dimensions">
        <strong>${localize("editor.card_dimensions")}:</strong>
        ${localize("editor.card_max_width")}: 470px, ${localize("editor.card_typical_height")}: ~400-500px
        <br />
        <em>${localize("editor.position_tip")}</em>
      </div>

      <ha-form
        .hass=${this.hass}
        .data=${this._formData}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>

      <div class="reset-all">
        <mwc-button @click=${this._resetAll}>
          <ha-icon icon="mdi:restore" slot="icon"></ha-icon>
          ${localize("editor.position_default")}
        </mwc-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "custom-positions-editor": CustomPositionsEditor;
  }
}
