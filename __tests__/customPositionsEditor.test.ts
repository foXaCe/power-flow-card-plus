import "../src/ui-editor/custom-positions-editor";

describe("custom positions editor (#284)", () => {
  const edit = (positions: unknown, next: unknown) => {
    const editor: any = document.createElement("custom-positions-editor");
    editor.config = { type: "custom:power-flow-card-plus", entities: {}, ...(positions ? { custom_positions: positions } : {}) };
    const emitted: any[] = [];
    editor.addEventListener("config-changed", (ev: any) => emitted.push(ev.detail.config));
    editor._valueChanged(new CustomEvent("value-changed", { detail: { value: { custom_positions: next } } }));
    return emitted[0];
  };

  it("keeps the first axis while the other one is still empty", () => {
    expect(edit(undefined, { solar: { top: 25 } }).custom_positions).toEqual({ solar: { top: 25 } });
  });

  it("keeps the remaining axis when one is cleared", () => {
    expect(edit({ solar: { top: 1, left: 2 } }, { solar: { top: undefined, left: 2 } }).custom_positions).toEqual({ solar: { left: 2 } });
  });

  it("accepts zero and negative values", () => {
    expect(edit(undefined, { solar: { top: 0, left: -140 } }).custom_positions).toEqual({ solar: { top: 0, left: -140 } });
  });

  it("drops an emptied circle, and the key once no circle is left", () => {
    expect(edit({ solar: { top: 1 }, grid: { top: 2 } }, { solar: {}, grid: { top: 2 } }).custom_positions).toEqual({ grid: { top: 2 } });
    expect(edit({ solar: { top: 1 } }, { solar: { top: undefined } })).not.toHaveProperty("custom_positions");
  });
});
