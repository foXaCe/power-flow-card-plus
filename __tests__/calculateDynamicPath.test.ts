import { calculateDynamicPath, toSVGCoordinates } from "../src/utils/calculateDynamicPath";

describe("calculateDynamicPath", () => {
  it("returns a degenerate path when the two points are identical", () => {
    expect(calculateDynamicPath({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe("M0,0");
  });

  it("trims the path by the default radius (73) along the direction", () => {
    expect(calculateDynamicPath({ x: 0, y: 0 }, { x: 200, y: 0 })).toBe("M73,0 L127,0");
  });

  it("honours a custom radius", () => {
    expect(calculateDynamicPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 10)).toBe("M10,0 L90,0");
  });

  it("creates a quadratic curve with a perpendicular offset when curved", () => {
    // Horizontal segment: nx=1, ny=0 → control point offset by +30 on Y.
    expect(calculateDynamicPath({ x: 0, y: 0 }, { x: 100, y: 0 }, 10, true)).toBe("M10,0 Q50,30 90,0");
  });
});

describe("toSVGCoordinates", () => {
  it("maps absolute coordinates into a 0-100 viewBox", () => {
    expect(toSVGCoordinates({ x: 200, y: 100 }, 400, 200)).toEqual({ x: 50, y: 50 });
  });

  it("maps the origin to 0,0", () => {
    expect(toSVGCoordinates({ x: 0, y: 0 }, 400, 400)).toEqual({ x: 0, y: 0 });
  });
});
