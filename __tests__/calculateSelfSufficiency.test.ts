import { calculateSelfSufficiency, getSelfSufficiencyColor } from "../src/utils/calculateSelfSufficiency";

describe("calculateSelfSufficiency", () => {
  it("returns 100% when no grid usage", () => {
    expect(calculateSelfSufficiency(1000, 500, 0)).toBe(100);
  });

  it("returns 0% when only grid", () => {
    expect(calculateSelfSufficiency(0, 0, 1000)).toBe(0);
  });

  it("returns 0% when no consumption", () => {
    expect(calculateSelfSufficiency(0, 0, 0)).toBe(0);
  });

  it("calculates mixed sources correctly", () => {
    expect(calculateSelfSufficiency(500, 200, 300)).toBe(70);
  });

  it("returns 50% for equal split", () => {
    expect(calculateSelfSufficiency(500, 0, 500)).toBe(50);
  });

  it("rounds to nearest integer", () => {
    expect(calculateSelfSufficiency(333, 0, 667)).toBe(33);
  });

  it("clamps to 100% max", () => {
    expect(calculateSelfSufficiency(1500, 500, 0)).toBe(100);
  });
});

describe("getSelfSufficiencyColor", () => {
  it("returns green for >= 80%", () => {
    expect(getSelfSufficiencyColor(100)).toBe("#4caf50");
    expect(getSelfSufficiencyColor(80)).toBe("#4caf50");
  });

  it("returns light green for >= 60%", () => {
    expect(getSelfSufficiencyColor(79)).toBe("#8bc34a");
    expect(getSelfSufficiencyColor(60)).toBe("#8bc34a");
  });

  it("returns orange for >= 40%", () => {
    expect(getSelfSufficiencyColor(59)).toBe("#ff9800");
    expect(getSelfSufficiencyColor(40)).toBe("#ff9800");
  });

  it("returns dark orange for >= 20%", () => {
    expect(getSelfSufficiencyColor(39)).toBe("#ff5722");
    expect(getSelfSufficiencyColor(20)).toBe("#ff5722");
  });

  it("returns red for < 20%", () => {
    expect(getSelfSufficiencyColor(19)).toBe("#f44336");
    expect(getSelfSufficiencyColor(0)).toBe("#f44336");
  });
});
