import { customPositionStyle } from "../src/utils/customPositionStyle";

describe("customPositionStyle", () => {
  it("returns a complete absolute-position override when both axes are finite", () => {
    expect(customPositionStyle({ top: 12, left: 34 })).toBe("top: 12px; left: 34px; bottom: auto; right: auto; transform: none;");
  });

  it("supports important flags for legacy grid overrides", () => {
    expect(customPositionStyle({ top: 12, left: 34 }, true)).toBe(
      "top: 12px !important; left: 34px !important; bottom: auto; right: auto; transform: none;"
    );
  });

  it("drops partial positions instead of producing undefinedpx CSS", () => {
    expect(customPositionStyle({ top: 12 })).toBe("");
    expect(customPositionStyle({ left: 34 })).toBe("");
  });
});
