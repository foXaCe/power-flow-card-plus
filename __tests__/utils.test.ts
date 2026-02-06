import { round, isNumberValue, coerceNumber, coerceStringArray } from "../src/utils/utils";

describe("round", () => {
  it("rounds to 0 decimal places", () => {
    expect(round(1.5, 0)).toBe(2);
    expect(round(1.4, 0)).toBe(1);
  });

  it("rounds to 2 decimal places", () => {
    expect(round(1.555, 2)).toBe(1.56);
    expect(round(1.554, 2)).toBe(1.55);
  });

  it("handles negative numbers", () => {
    expect(round(-1.5, 0)).toBe(-1);
    expect(round(-1.555, 2)).toBe(-1.55);
  });

  it("handles zero", () => {
    expect(round(0, 2)).toBe(0);
  });
});

describe("isNumberValue", () => {
  it("returns true for numbers", () => {
    expect(isNumberValue(42)).toBe(true);
    expect(isNumberValue(0)).toBe(true);
    expect(isNumberValue(-1.5)).toBe(true);
  });

  it("returns true for numeric strings", () => {
    expect(isNumberValue("42")).toBe(true);
    expect(isNumberValue("0")).toBe(true);
    expect(isNumberValue("-3.14")).toBe(true);
  });

  it("returns false for non-numeric values", () => {
    expect(isNumberValue("hello")).toBe(false);
    expect(isNumberValue("")).toBe(false);
    expect(isNumberValue(null)).toBe(false);
    expect(isNumberValue(undefined)).toBe(false);
    expect(isNumberValue(NaN)).toBe(false);
  });

  it("returns false for partial numeric strings", () => {
    expect(isNumberValue("123hello")).toBe(false);
  });
});

describe("coerceNumber", () => {
  it("converts valid values to numbers", () => {
    expect(coerceNumber("42")).toBe(42);
    expect(coerceNumber(42)).toBe(42);
    expect(coerceNumber("3.14")).toBe(3.14);
  });

  it("returns 0 for invalid values by default", () => {
    expect(coerceNumber("hello")).toBe(0);
    expect(coerceNumber(null)).toBe(0);
    expect(coerceNumber(undefined)).toBe(0);
  });

  it("uses custom fallback for invalid values", () => {
    expect(coerceNumber("hello", -1)).toBe(-1);
    expect(coerceNumber(null, 99)).toBe(99);
  });
});

describe("coerceStringArray", () => {
  it("splits strings by whitespace by default", () => {
    expect(coerceStringArray("a b c")).toEqual(["a", "b", "c"]);
    expect(coerceStringArray("hello  world")).toEqual(["hello", "world"]);
  });

  it("splits by custom separator", () => {
    expect(coerceStringArray("a,b,c", ",")).toEqual(["a", "b", "c"]);
    expect(coerceStringArray("a|b|c", "|")).toEqual(["a", "b", "c"]);
  });

  it("trims whitespace from values", () => {
    expect(coerceStringArray("a , b , c", ",")).toEqual(["a", "b", "c"]);
  });

  it("passes through arrays", () => {
    expect(coerceStringArray(["a", "b"])).toEqual(["a", "b"]);
  });

  it("returns empty array for null/undefined", () => {
    expect(coerceStringArray(null)).toEqual([]);
    expect(coerceStringArray(undefined)).toEqual([]);
  });

  it("filters out empty strings", () => {
    expect(coerceStringArray("a,,b", ",")).toEqual(["a", "b"]);
  });
});
