import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
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
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public localize!: (key: string) => string;
  @state() private _positions: any = {};
  @state() private _showPreview: boolean = true;

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

    .input-wrapper {
      position: relative;
      margin-bottom: 6px;
    }

    .position-number-input {
      width: 100%;
      padding: 8px 40px 8px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      box-sizing: border-box;
    }

    .position-number-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .input-suffix {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--secondary-text-color);
      pointer-events: none;
      font-size: 13px;
    }

    .reset-button {
      background: transparent;
      border: 1px solid var(--divider-color);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color);
      transition: all 0.2s;
    }

    .reset-button:hover {
      background: var(--secondary-background-color);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .reset-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .default-hint {
      font-size: 11px;
      color: var(--secondary-text-color);
      margin-top: 6px;
      font-style: italic;
    }

    .chevron {
      transition: transform 0.3s;
    }

    .chevron.open {
      transform: rotate(180deg);
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
  `;

  connectedCallback() {
    super.connectedCallback();
    this._positions = this.config.custom_positions ? { ...this.config.custom_positions } : {};
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
    // Créer une nouvelle copie pour forcer la détection de changement
    const newPositions = { ...this._positions };

    if (!newPositions[circle]) {
      newPositions[circle] = {};
    } else {
      newPositions[circle] = { ...newPositions[circle] };
    }

    const numValue = value === "" ? undefined : parseInt(value);
    if (numValue === undefined) {
      delete newPositions[circle][axis];
    } else {
      newPositions[circle][axis] = numValue;
    }

    // Nettoyer si les deux valeurs sont undefined
    if (newPositions[circle].top === undefined && newPositions[circle].left === undefined) {
      delete newPositions[circle];
    }

    this._positions = newPositions;
    this._fireChanged();
  }

  private _reset(circle: string, axis: "top" | "left") {
    // Créer une nouvelle copie pour forcer la détection de changement
    const newPositions = { ...this._positions };

    if (!newPositions[circle]) {
      return;
    }

    newPositions[circle] = { ...newPositions[circle] };
    delete newPositions[circle][axis];

    // Nettoyer si les deux valeurs sont undefined
    if (newPositions[circle].top === undefined && newPositions[circle].left === undefined) {
      delete newPositions[circle];
    }

    this._positions = newPositions;
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
              <div class="input-wrapper">
                <input
                  type="number"
                  class="position-number-input"
                  .value=${this._getCurrentValue(circle, "top")}
                  @input=${(e: any) => this._valueChanged(circle, "top", e.target.value)}
                  placeholder="Auto"
                />
                <span class="input-suffix">px</span>
              </div>
              <div class="default-hint">
                ${this.localize("editor.position_default")}: ${this._getDefaultValue(circle, "top")}
              </div>
            </div>
            <button
              class="reset-button"
              @click=${() => this._reset(circle, "top")}
              title="Reset to default"
            >
              <ha-icon icon="mdi:restore"></ha-icon>
            </button>
          </div>

          <div class="position-row">
            <div class="position-label">${this.localize("editor.position_left")}</div>
            <div class="position-input">
              <div class="input-wrapper">
                <input
                  type="number"
                  class="position-number-input"
                  .value=${this._getCurrentValue(circle, "left")}
                  @input=${(e: any) => this._valueChanged(circle, "left", e.target.value)}
                  placeholder="Auto"
                />
                <span class="input-suffix">px</span>
              </div>
              <div class="default-hint">
                ${this.localize("editor.position_default")}: ${this._getDefaultValue(circle, "left")}
              </div>
            </div>
            <button
              class="reset-button"
              @click=${() => this._reset(circle, "left")}
              title="Reset to default"
            >
              <ha-icon icon="mdi:restore"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="info-banner">
        <ha-icon icon="mdi:information"></ha-icon>
        <div class="info-content">
          <div class="info-title">${this.localize("editor.position_editor_info_title")}</div>
          <div class="info-text">${this.localize("editor.position_editor_info_text")}</div>
        </div>
      </div>

      <div class="card-dimensions">
        <strong>${this.localize("editor.card_dimensions")}:</strong>
        ${this.localize("editor.card_max_width")}: 470px,
        ${this.localize("editor.card_typical_height")}: ~400-500px
        <br>
        <em>${this.localize("editor.position_tip")}</em>
      </div>

      ${this._renderPositionSection("solar", this.localize("editor.solar"))}
      ${this._renderPositionSection("grid", this.localize("editor.grid"))}
      ${this._renderPositionSection("home", this.localize("editor.home"))}
      ${this._renderPositionSection("battery", this.localize("editor.battery"))}
      ${this._renderPositionSection("daily_cost", this.localize("editor.daily_cost_title"))}
      ${this._renderPositionSection("daily_export", this.localize("editor.daily_export_title"))}
    `;
  }
}
