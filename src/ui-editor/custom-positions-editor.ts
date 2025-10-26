import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

// Positions par défaut (en px depuis le container)
const DEFAULT_POSITIONS = {
  solar: { top: null, left: null },
  grid: { top: null, left: null },
  home: { top: null, left: null },
  battery: { top: null, left: null },
  daily_cost: { top: -120, left: null },
  daily_export: { top: 0, left: 200 },
};

@customElement("custom-positions-editor")
export class CustomPositionsEditor extends LitElement {
  @property({ attribute: false }) public config!: PowerFlowCardPlusConfig;
  @property() public localize!: (key: string) => string;
  @state() private _positions: any = {};

  static styles = css`
    .position-section {
      margin-bottom: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .section-header {
      background: var(--secondary-background-color);
      padding: 12px 16px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-header:hover {
      background: var(--divider-color);
    }

    .section-content {
      padding: 16px;
      display: none;
    }

    .section-content.open {
      display: block;
    }

    .position-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .position-row:last-child {
      margin-bottom: 0;
    }

    .position-label {
      min-width: 80px;
      color: var(--secondary-text-color);
    }

    .position-input {
      flex: 1;
      min-width: 0;
    }

    ha-textfield {
      width: 100%;
    }

    .reset-button {
      --mdc-theme-primary: var(--secondary-text-color);
    }

    .default-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }

    .chevron {
      transition: transform 0.3s;
    }

    .chevron.open {
      transform: rotate(180deg);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._positions = { ...this.config.custom_positions };
  }

  private _toggleSection(e: Event) {
    const header = e.currentTarget as HTMLElement;
    const content = header.nextElementSibling as HTMLElement;
    const chevron = header.querySelector(".chevron") as HTMLElement;

    if (content.classList.contains("open")) {
      content.classList.remove("open");
      chevron.classList.remove("open");
    } else {
      content.classList.add("open");
      chevron.classList.add("open");
    }
  }

  private _valueChanged(circle: string, axis: "top" | "left", value: string) {
    if (!this._positions[circle]) {
      this._positions[circle] = {};
    }

    const numValue = value === "" ? undefined : parseInt(value);
    this._positions[circle][axis] = numValue;

    // Nettoyer si les deux valeurs sont undefined
    if (this._positions[circle].top === undefined && this._positions[circle].left === undefined) {
      delete this._positions[circle];
    }

    this._fireChanged();
  }

  private _reset(circle: string, axis: "top" | "left") {
    if (!this._positions[circle]) {
      return;
    }

    this._positions[circle][axis] = undefined;

    // Nettoyer si les deux valeurs sont undefined
    if (this._positions[circle].top === undefined && this._positions[circle].left === undefined) {
      delete this._positions[circle];
    }

    this._fireChanged();
    this.requestUpdate();
  }

  private _fireChanged() {
    const customPositions = Object.keys(this._positions).length > 0 ? { ...this._positions } : undefined;

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this.config, custom_positions: customPositions } },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _getCurrentValue(circle: string, axis: "top" | "left"): string {
    return this._positions[circle]?.[axis]?.toString() ?? "";
  }

  private _getDefaultValue(circle: string, axis: "top" | "left"): string {
    const defaultVal = DEFAULT_POSITIONS[circle]?.[axis];
    if (defaultVal === null) {
      return this.localize("editor.position_auto");
    }
    return `${defaultVal}px`;
  }

  private _renderPositionSection(circle: string, title: string) {
    return html`
      <div class="position-section">
        <div class="section-header" @click=${this._toggleSection}>
          <span>${title}</span>
          <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="section-content">
          <div class="position-row">
            <div class="position-label">${this.localize("editor.position_top")}</div>
            <div class="position-input">
              <ha-textfield
                type="number"
                .value=${this._getCurrentValue(circle, "top")}
                @input=${(e: any) => this._valueChanged(circle, "top", e.target.value)}
                .suffix=${"px"}
              ></ha-textfield>
              <div class="default-hint">
                ${this.localize("editor.position_default")}: ${this._getDefaultValue(circle, "top")}
              </div>
            </div>
            <ha-icon-button
              class="reset-button"
              @click=${() => this._reset(circle, "top")}
            >
              <ha-icon icon="mdi:restore"></ha-icon>
            </ha-icon-button>
          </div>

          <div class="position-row">
            <div class="position-label">${this.localize("editor.position_left")}</div>
            <div class="position-input">
              <ha-textfield
                type="number"
                .value=${this._getCurrentValue(circle, "left")}
                @input=${(e: any) => this._valueChanged(circle, "left", e.target.value)}
                .suffix=${"px"}
              ></ha-textfield>
              <div class="default-hint">
                ${this.localize("editor.position_default")}: ${this._getDefaultValue(circle, "left")}
              </div>
            </div>
            <ha-icon-button
              class="reset-button"
              @click=${() => this._reset(circle, "left")}
            >
              <ha-icon icon="mdi:restore"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      ${this._renderPositionSection("solar", this.localize("editor.solar"))}
      ${this._renderPositionSection("grid", this.localize("editor.grid"))}
      ${this._renderPositionSection("home", this.localize("editor.home"))}
      ${this._renderPositionSection("battery", this.localize("editor.battery"))}
      ${this._renderPositionSection("daily_cost", this.localize("editor.daily_cost_title"))}
      ${this._renderPositionSection("daily_export", this.localize("editor.daily_export_title"))}
    `;
  }
}
