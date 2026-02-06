import { convertColorListToHex } from "../src/utils/convertColor";

describe("convertColorListToHex", () => {
  it("converts RGB array to hex string", () => {
    expect(convertColorListToHex([255, 0, 0])).toBe("#ff0000");
    expect(convertColorListToHex([0, 255, 0])).toBe("#00ff00");
    expect(convertColorListToHex([0, 0, 255])).toBe("#0000ff");
  });

  it("converts white and black", () => {
    expect(convertColorListToHex([255, 255, 255])).toBe("#ffffff");
    expect(convertColorListToHex([0, 0, 0])).toBe("#000000");
  });

  it("pads single-digit hex values", () => {
    expect(convertColorListToHex([1, 2, 3])).toBe("#010203");
  });

  it("handles custom color", () => {
    expect(convertColorListToHex([162, 128, 219])).toBe("#a280db");
  });

  it("returns empty string for falsy input", () => {
    expect(convertColorListToHex(null as any)).toBe("");
    expect(convertColorListToHex(undefined as any)).toBe("");
  });
});
