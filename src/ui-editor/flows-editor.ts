import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";

@customElement("flows-editor")
export class FlowsEditor extends LitElement {
  @property({ attribute: false }) public config!: PowerFlowCardPlusConfig;
  @property() public localize!: (key: string) => string;

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }

    .section {
      margin-bottom: 24px;
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

    .control-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .control-row:last-child {
      margin-bottom: 0;
    }

    .control-label {
      min-width: 150px;
      color: var(--primary-text-color);
      font-size: 14px;
    }

    .control-input {
      flex: 1;
    }

    input[type="number"],
    input[type="color"] {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      box-sizing: border-box;
    }

    input[type="color"] {
      height: 40px;
      cursor: pointer;
    }

    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      cursor: pointer;
    }

    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-top: 4px;
      font-style: italic;
    }

    .chevron {
      transition: transform 0.3s;
    }

    .chevron.open {
      transform: rotate(180deg);
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

  private _valueChanged(property: string, value: any) {
    const newConfig = { ...this.config, [property]: value };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _arrowChanged(arrow: string, property: string, value: any) {
    const currentArrows = this.config.arrows || {};
    const currentArrow = currentArrows[arrow] || {};

    const newArrow = { ...currentArrow, [property]: value };

    // Nettoyer si toutes les valeurs sont undefined
    const hasValues = Object.values(newArrow).some((v) => v !== undefined && v !== null && v !== "");

    const newArrows = { ...currentArrows };
    if (hasValues) {
      newArrows[arrow] = newArrow;
    } else {
      delete newArrows[arrow];
    }

    const newConfig = {
      ...this.config,
      arrows: Object.keys(newArrows).length > 0 ? newArrows : undefined,
    };

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _getArrowValue(arrow: string, property: string): any {
    const value = this.config.arrows?.[arrow]?.[property];
    if (value === undefined || value === null) {
      // Retourner les valeurs par défaut selon la propriété
      switch (property) {
        case "color":
          return "#8cd867";
        case "thickness":
          return "1.5";
        case "length":
          return "80";
        case "offset_x":
        case "offset_y":
          return "0";
        default:
          return "";
      }
    }
    return value;
  }

  render() {
    return html`
      <div class="info-banner">💡 ${this.localize("editor.flows_editor_info")}</div>

      <!-- Animation Speed Section -->
      <div class="section">
        <div class="section-header" @click=${this._toggleSection}>
          <span>${this.localize("editor.animation_speed")}</span>
          <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="section-content">
          <div class="control-row">
            <div class="control-label">${this.localize("editor.min_flow_rate")}</div>
            <div class="control-input">
              <input
                type="number"
                .value=${this.config.min_flow_rate ?? 0.75}
                @input=${(e: any) => this._valueChanged("min_flow_rate", parseFloat(e.target.value))}
                min="0.1"
                max="10"
                step="0.1"
              />
              <div class="hint">${this.localize("editor.min_flow_rate_hint")}</div>
            </div>
          </div>

          <div class="control-row">
            <div class="control-label">${this.localize("editor.max_flow_rate")}</div>
            <div class="control-input">
              <input
                type="number"
                .value=${this.config.max_flow_rate ?? 6}
                @input=${(e: any) => this._valueChanged("max_flow_rate", parseFloat(e.target.value))}
                min="0.1"
                max="100"
                step="0.1"
              />
              <div class="hint">${this.localize("editor.max_flow_rate_hint")}</div>
            </div>
          </div>

          <div class="control-row">
            <div class="control-label">${this.localize("editor.disable_dots")}</div>
            <div class="control-input">
              <input
                type="checkbox"
                .checked=${this.config.disable_dots ?? false}
                @change=${(e: any) => this._valueChanged("disable_dots", e.target.checked)}
              />
              <div class="hint">${this.localize("editor.disable_dots_hint")}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Circle Appearance Section -->
      <div class="section">
        <div class="section-header" @click=${this._toggleSection}>
          <span>${this.localize("editor.circle_appearance")}</span>
          <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="section-content">
          <div class="control-row">
            <div class="control-label">${this.localize("editor.circle_border_width")}</div>
            <div class="control-input">
              <input
                type="number"
                .value=${this.config.circle_border_width ?? 2}
                @input=${(e: any) => this._valueChanged("circle_border_width", parseInt(e.target.value))}
                min="1"
                max="10"
                step="1"
              />
              <div class="hint">${this.localize("editor.circle_border_width_hint")}</div>
            </div>
          </div>

          <div class="control-row">
            <div class="control-label">${this.localize("editor.circle_pulse_animation")}</div>
            <div class="control-input">
              <input
                type="checkbox"
                .checked=${this.config.circle_pulse_animation ?? false}
                @change=${(e: any) => this._valueChanged("circle_pulse_animation", e.target.checked)}
              />
              <div class="hint">${this.localize("editor.circle_pulse_animation_hint")}</div>
            </div>
          </div>

          <div class="control-row">
            <div class="control-label">${this.localize("editor.circle_gradient_mode")}</div>
            <div class="control-input">
              <input
                type="checkbox"
                .checked=${this.config.circle_gradient_mode ?? false}
                @change=${(e: any) => this._valueChanged("circle_gradient_mode", e.target.checked)}
              />
              <div class="hint">${this.localize("editor.circle_gradient_mode_hint")}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Display Options Section -->
      <div class="section">
        <div class="section-header" @click=${this._toggleSection}>
          <span>${this.localize("editor.display_options")}</span>
          <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="section-content">
          <div class="control-row">
            <div class="control-label">${this.localize("editor.watt_threshold")}</div>
            <div class="control-input">
              <input
                type="number"
                .value=${this.config.watt_threshold ?? 1000}
                @input=${(e: any) => this._valueChanged("watt_threshold", parseInt(e.target.value))}
                min="100"
                max="10000"
                step="100"
              />
              <div class="hint">${this.localize("editor.watt_threshold_hint")}</div>
            </div>
          </div>

          <div class="control-row">
            <div class="control-label">${this.localize("editor.w_decimals")}</div>
            <div class="control-input">
              <input
                type="number"
                .value=${this.config.w_decimals ?? 0}
                @input=${(e: any) => this._valueChanged("w_decimals", parseInt(e.target.value))}
                min="0"
                max="5"
                step="1"
              />
              <div class="hint">${this.localize("editor.w_decimals_hint")}</div>
            </div>
          </div>

          <div class="control-row">
            <div class="control-label">${this.localize("editor.kw_decimals")}</div>
            <div class="control-input">
              <input
                type="number"
                .value=${this.config.kw_decimals ?? 2}
                @input=${(e: any) => this._valueChanged("kw_decimals", parseInt(e.target.value))}
                min="0"
                max="5"
                step="1"
              />
              <div class="hint">${this.localize("editor.kw_decimals_hint")}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Arrows Section -->
      <div class="section">
        <div class="section-header" @click=${this._toggleSection}>
          <span>${this.localize("editor.arrows_customization")}</span>
          <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
        </div>
        <div class="section-content">
          ${this._renderArrowConfig("solar_to_daily_export", this.localize("editor.arrow_solar_to_daily_export"))}
          ${this._renderArrowConfig("grid_to_home", this.localize("editor.arrow_grid_to_home"))}
          ${this._renderArrowConfig("solar_to_home", this.localize("editor.arrow_solar_to_home"))}
          ${this._renderArrowConfig("solar_to_grid", this.localize("editor.arrow_solar_to_grid"))}
          ${this._renderArrowConfig("battery_to_home", this.localize("editor.arrow_battery_to_home"))}
          ${this._renderArrowConfig("solar_to_battery", this.localize("editor.arrow_solar_to_battery"))}
          ${this._renderArrowConfig("grid_to_battery", this.localize("editor.arrow_grid_to_battery"))}
        </div>
      </div>
    `;
  }

  private _renderArrowConfig(arrow: string, title: string) {
    return html`
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--divider-color);">
        <div style="font-weight: 500; margin-bottom: 12px; color: var(--primary-text-color);">${title}</div>

        <div class="control-row">
          <div class="control-label">${this.localize("editor.arrow_color")}</div>
          <div class="control-input">
            <input
              type="color"
              .value=${this._getArrowValue(arrow, "color") || "#8cd867"}
              @input=${(e: any) => this._arrowChanged(arrow, "color", e.target.value)}
            />
          </div>
        </div>

        <div class="control-row">
          <div class="control-label">${this.localize("editor.arrow_thickness")}</div>
          <div class="control-input">
            <input
              type="number"
              .value=${this._getArrowValue(arrow, "thickness") || 1.5}
              @input=${(e: any) => this._arrowChanged(arrow, "thickness", parseFloat(e.target.value))}
              min="0.5"
              max="10"
              step="0.5"
            />
            <div class="hint">${this.localize("editor.arrow_thickness_hint")}</div>
          </div>
        </div>

        <div class="control-row">
          <div class="control-label">${this.localize("editor.arrow_length")}</div>
          <div class="control-input">
            <input
              type="number"
              .value=${this._getArrowValue(arrow, "length") || 80}
              @input=${(e: any) => this._arrowChanged(arrow, "length", parseInt(e.target.value))}
              min="20"
              max="300"
              step="10"
            />
            <div class="hint">${this.localize("editor.arrow_length_hint")}</div>
          </div>
        </div>

        <div class="control-row">
          <div class="control-label">${this.localize("editor.arrow_offset_x")}</div>
          <div class="control-input">
            <input
              type="number"
              .value=${this._getArrowValue(arrow, "offset_x") || 0}
              @input=${(e: any) => this._arrowChanged(arrow, "offset_x", parseInt(e.target.value))}
              min="-200"
              max="200"
              step="5"
            />
            <div class="hint">${this.localize("editor.arrow_offset_x_hint")}</div>
          </div>
        </div>

        <div class="control-row">
          <div class="control-label">${this.localize("editor.arrow_offset_y")}</div>
          <div class="control-input">
            <input
              type="number"
              .value=${this._getArrowValue(arrow, "offset_y") || 0}
              @input=${(e: any) => this._arrowChanged(arrow, "offset_y", parseInt(e.target.value))}
              min="-200"
              max="200"
              step="5"
            />
            <div class="hint">${this.localize("editor.arrow_offset_y_hint")}</div>
          </div>
        </div>
      </div>
    `;
  }
}
