import { onlyNegative, onlyPositive } from "../src/states/utils/negativePositive";

describe("onlyNegative", () => {
  it("returns absolute value of negative numbers", () => {
    expect(onlyNegative(-5)).toBe(5);
    expect(onlyNegative(-100.5)).toBe(100.5);
  });

  it("returns 0 for positive numbers", () => {
    expect(onlyNegative(5)).toBe(0);
    expect(onlyNegative(100)).toBe(0);
  });

  it("returns 0 for zero", () => {
    expect(onlyNegative(0)).toBe(0);
  });
});

describe("onlyPositive", () => {
  it("returns positive numbers unchanged", () => {
    expect(onlyPositive(5)).toBe(5);
    expect(onlyPositive(100.5)).toBe(100.5);
  });

  it("returns 0 for negative numbers", () => {
    expect(onlyPositive(-5)).toBe(0);
    expect(onlyPositive(-100)).toBe(0);
  });

  it("returns 0 for zero", () => {
    expect(onlyPositive(0)).toBe(0);
  });
});
