import { makeHass } from "./__fixtures__/hass";

jest.mock("@/ui-editor/utils/sortable.ondemand", () => ({
  loadSortable: jest.fn(() =>
    Promise.resolve(
      class {
        destroy() {}
      }
    )
  ),
}));

import "../src/ui-editor/ui-editor";

describe("PowerFlowCardPlusEditor", () => {
  let editor: any;

  beforeEach(async () => {
    editor = document.createElement("power-flow-card-plus-editor");
    editor.hass = makeHass();
    await editor.setConfig({
      type: "custom:power-flow-card-plus",
      entities: { grid: { entity: "sensor.grid_power" } },
    });
  });

  afterEach(() => {
    if (editor?.parentNode) editor.parentNode.removeChild(editor);
  });

  it.each([
    ["individual", "individual-devices-editor"],
    ["custom_positions", "custom-positions-editor"],
    ["flows", "flows-editor"],
  ])("passes hass into the %s subpage", async (page, subEditorTag) => {
    editor._currentConfigPage = page;
    document.body.appendChild(editor);
    await editor.updateComplete;

    const header = editor.shadowRoot.querySelector("subpage-header") as any;
    const subEditor = editor.shadowRoot.querySelector(subEditorTag) as any;

    expect(header.hass).toBe(editor.hass);
    expect(subEditor.hass).toBe(editor.hass);
  });
});
