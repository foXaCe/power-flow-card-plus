import { getCirclePositions } from "../src/utils/getCirclePositions";

describe("getCirclePositions", () => {
  it("computes default positions as fractions of the card size", () => {
    const pos = getCirclePositions({} as any, 400, 400);
    expect(pos.solar).toEqual({ x: 200, y: 60 });
    expect(pos.grid).toEqual({ x: 60, y: 200 });
    expect(pos.home).toEqual({ x: 340, y: 200 });
    expect(pos.battery).toEqual({ x: 200, y: 340 });
  });

  it("scales with the card dimensions", () => {
    const pos = getCirclePositions({} as any, 800, 600);
    expect(pos.solar).toEqual({ x: 400, y: 90 });
    expect(pos.home).toEqual({ x: 680, y: 300 });
  });

  it("overrides both axes from custom_positions", () => {
    const pos = getCirclePositions({ custom_positions: { solar: { left: 10, top: 20 } } } as any, 400, 400);
    expect(pos.solar).toEqual({ x: 10, y: 20 });
    // untouched circles keep their defaults
    expect(pos.grid).toEqual({ x: 60, y: 200 });
  });

  it("applies only the provided axis (left without top keeps default y)", () => {
    const pos = getCirclePositions({ custom_positions: { battery: { left: 99 } } } as any, 400, 400);
    expect(pos.battery.x).toBe(99);
    expect(pos.battery.y).toBe(340);
  });
});
