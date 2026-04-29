/* eslint-disable no-use-before-define */
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { assert } from "superstruct";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { BaseConfigEntity } from "../type";
import { cardConfigStruct, generalConfigSchema, advancedOptionsSchema } from "./schema/_schema-all";
import localize from "../localize/localize";
import { defaultValues } from "../utils/get-default-config";
import "./components/individual-devices-editor";
import "./components/link-subpage";
import "./components/subpage-header";
import "./custom-positions-editor";
import "./flows-editor";
import { loadHaForm } from "./utils/loadHAForm";
import { gridSchema } from "./schema/grid";
import { solarSchema } from "./schema/solar";
import { batterySchema } from "./schema/battery";
import { nonFossilSchema } from "./schema/fossil_fuel_percentage";
import { homeSchema } from "./schema/home";
import { ConfigPage } from "./types/config-page";

const CONFIG_PAGES: {
  page: ConfigPage;
  icon?: string;
  schema?: any;
}[] = [
  {
    page: "grid",
    icon: "mdi:transmission-tower",
    schema: gridSchema,
  },
  {
    page: "solar",
    icon: "mdi:solar-power-variant",
    schema: solarSchema,
  },
  {
    page: "battery",
    icon: "mdi:battery-high",
    schema: batterySchema,
  },
  {
    page: "fossil_fuel_percentage",
    icon: "mdi:leaf",
    schema: nonFossilSchema,
  },
  {
    page: "home",
    icon: "mdi:home",
    schema: homeSchema,
  },
  {
    page: "individual",
    icon: "mdi:dots-horizontal-circle-outline",
  },
  {
    page: "custom_positions",
    icon: "mdi:arrow-all",
  },
  {
    page: "flows",
    icon: "mdi:google-circles-communities",
  },
  {
    page: "advanced",
    icon: "mdi:cog",
    schema: advancedOptionsSchema,
  },
];

@customElement("power-flow-card-plus-editor")
export class PowerFlowCardPlusEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: PowerFlowCardPlusConfig;
  @state() private _currentConfigPage: ConfigPage = null;

  public async setConfig(config: PowerFlowCardPlusConfig): Promise<void> {
    assert(config, cardConfigStruct);
    this._config = config;
  }

  connectedCallback(): void {
    super.connectedCallback();
    loadHaForm();
    this._adjustPreviewSize();
  }

  private _adjustPreviewSize(): void {
    // Inject styles to make card preview display at real dashboard size
    let style = document.getElementById("pfcp-preview-styles") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = "pfcp-preview-styles";
      style.textContent = `
        /* Scoped to our card preview only */
        hui-dialog-edit-card hui-card-preview power-flow-card-plus {
          max-width: 500px !important;
          width: 100%;
        }
      `;
      style.dataset.pfcpRefs = "0";
      document.head.appendChild(style);
    }
    const refs = parseInt(style.dataset.pfcpRefs ?? "0", 10) || 0;
    style.dataset.pfcpRefs = String(refs + 1);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    const style = document.getElementById("pfcp-preview-styles") as HTMLStyleElement | null;
    if (style) {
      const refs = parseInt(style.dataset.pfcpRefs ?? "0", 10) || 0;
      const next = refs - 1;
      if (next <= 0) {
        style.remove();
      } else {
        style.dataset.pfcpRefs = String(next);
      }
    }
  }

  private _editDetailElement(pageClicked: ConfigPage): void {
    this._currentConfigPage = pageClicked;
  }

  private _goBack(): void {
    this._currentConfigPage = null;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }
    const data = {
      ...this._config,
      display_zero_lines: {
        mode: this._config.display_zero_lines?.mode ?? defaultValues.displayZeroLines.mode,
        transparency: this._config.display_zero_lines?.transparency ?? defaultValues.displayZeroLines.transparency,
        grey_color: this._config.display_zero_lines?.grey_color ?? defaultValues.displayZeroLines.grey_color,
      },
    };

    if (this._currentConfigPage !== null) {
      if (this._currentConfigPage === "individual") {
        return html`
          <subpage-header @go-back=${this._goBack} page=${this._currentConfigPage}> </subpage-header>
          <individual-devices-editor .hass=${this.hass} .config=${this._config} @config-changed=${this._valueChanged}></individual-devices-editor>
        `;
      }

      if (this._currentConfigPage === "custom_positions") {
        return html`
          <subpage-header @go-back=${this._goBack} page=${this._currentConfigPage}> </subpage-header>
          <custom-positions-editor .config=${this._config} .localize=${localize} @config-changed=${this._valueChanged}></custom-positions-editor>
        `;
      }

      if (this._currentConfigPage === "flows") {
        return html`
          <subpage-header @go-back=${this._goBack} page=${this._currentConfigPage}> </subpage-header>
          <flows-editor .config=${this._config} .localize=${localize} @config-changed=${this._valueChanged}></flows-editor>
        `;
      }

      const currentPage = this._currentConfigPage;
      const schema =
        currentPage === "advanced"
          ? advancedOptionsSchema(localize, this._config.display_zero_lines?.mode ?? defaultValues.displayZeroLines.mode)
          : CONFIG_PAGES.find((page) => page.page === currentPage)?.schema;
      const dataForForm = currentPage === "advanced" ? data : data.entities[currentPage] ?? {};

      return html`
        <subpage-header @go-back=${this._goBack} page=${this._currentConfigPage}> </subpage-header>
        <ha-form
          .hass=${this.hass}
          .data=${dataForForm}
          .schema=${schema}
          .computeLabel=${this._computeLabelCallback}
          @value-changed=${this._valueChanged}
        ></ha-form>
      `;
    }

    const renderLinkSubpage = (page: ConfigPage, fallbackIcon: string | undefined = "mdi:dots-horizontal-circle-outline") => {
      if (page === null) return html``;
      const getIconToUse = () => {
        if (page === "individual" || page === "advanced" || page === "custom_positions" || page === "flows") return fallbackIcon;
        return (this?._config?.entities[page] as BaseConfigEntity | undefined)?.icon || fallbackIcon;
      };
      const icon = getIconToUse();
      return html`
        <link-subpage
          path=${page}
          header="${localize(`editor.${page}`)}"
          @open-sub-element-editor=${() => this._editDetailElement(page)}
          icon=${icon}
        >
        </link-subpage>
      `;
    };

    const renderLinkSubPages = () => CONFIG_PAGES.map((page) => renderLinkSubpage(page.page, page.icon));

    return html`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${generalConfigSchema}
          .computeLabel=${this._computeLabelCallback}
          @value-changed=${this._valueChanged}
        ></ha-form>
        ${renderLinkSubPages()}
      </div>
    `;
  }

  private _valueChanged(ev: any): void {
    if (!this._config || !this.hass) {
      return;
    }

    // Sub-editors (individual / custom-positions / flows) emit a fully-built
    // config under `detail.config`. Pass it through unchanged.
    if (ev.detail?.config !== undefined) {
      fireEvent(this, "config-changed", { config: ev.detail.config });
      return;
    }

    const delta = ev.detail?.value ?? {};
    let config: any;

    if (this._currentConfigPage === "advanced") {
      // Merge the delta into the existing config so materialized defaults are preserved.
      config = { ...this._config, ...delta };
    } else if (this._currentConfigPage !== null) {
      // Entity page: merge delta with existing entity config.
      const currentEntity = (this._config.entities as any)?.[this._currentConfigPage] ?? {};
      config = {
        ...this._config,
        entities: {
          ...this._config.entities,
          [this._currentConfigPage]: { ...currentEntity, ...delta },
        },
      };
    } else {
      // Top-level (general settings) form: merge with existing config.
      config = { ...this._config, ...delta };
    }

    fireEvent(this, "config-changed", { config });
  }

  private _computeLabelCallback = (schema: any) =>
    this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema?.name}`) || localize(`editor.${schema?.name}`);

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        max-width: none !important;
        overflow: visible !important;
      }

      ha-form {
        width: 100%;
      }

      ha-icon-button {
        align-self: center;
      }

      .card-config {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-bottom: 10px;
        width: 100%;
        max-width: 100%;
        margin-left: auto;
        margin-right: auto;
        box-sizing: border-box;
      }

      .config-header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .config-header.sub-header {
        margin-top: 24px;
      }

      ha-icon {
        padding-bottom: 2px;
        position: relative;
        top: -4px;
        right: 1px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "power-flow-card-plus-editor": PowerFlowCardPlusEditor;
  }
}
