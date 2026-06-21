import { calculateCirclePosition, calculateLinePath } from "../src/utils/calculateCirclePosition";

describe("calculateCirclePosition (fallback path, no shadowRoot)", () => {
  it("returns the default centre for each circle type", () => {
    expect(calculateCirclePosition("solar", {} as any)).toEqual({ x: 200, y: 60 });
    expect(calculateCirclePosition("battery", {} as any)).toEqual({ x: 200, y: 340 });
    expect(calculateCirclePosition("grid", {} as any)).toEqual({ x: 60, y: 200 });
    expect(calculateCirclePosition("home", {} as any)).toEqual({ x: 340, y: 200 });
  });

  it("uses custom_positions plus the radius offset when both axes are set", () => {
    const cfg = { custom_positions: { solar: { left: 100, top: 50 } } } as any;
    expect(calculateCirclePosition("solar", cfg)).toEqual({ x: 140, y: 90 });
  });

  it("falls back to defaults when custom_positions is partial (only left)", () => {
    const cfg = { custom_positions: { solar: { left: 100 } } } as any;
    expect(calculateCirclePosition("solar", cfg)).toEqual({ x: 200, y: 60 });
  });
});

describe("calculateLinePath", () => {
  it("draws a straight path trimmed by the 40px circle radius", () => {
    expect(calculateLinePath({ x: 0, y: 0 }, { x: 100, y: 0 })).toBe("M40,0 L60,0");
  });

  it("draws a quadratic path when curved", () => {
    expect(calculateLinePath({ x: 0, y: 0 }, { x: 100, y: 0 }, "curved")).toBe("M40,0 Q50,0 60,0");
  });
});
