import { getEntityNames, getFirstEntityName } from "../src/states/utils/mutliEntity";

describe("getEntityNames", () => {
  it("splits pipe-separated entities", () => {
    expect(getEntityNames("sensor.a|sensor.b|sensor.c")).toEqual(["sensor.a", "sensor.b", "sensor.c"]);
  });

  it("returns single entity in array", () => {
    expect(getEntityNames("sensor.power")).toEqual(["sensor.power"]);
  });

  it("trims whitespace", () => {
    expect(getEntityNames("sensor.a | sensor.b")).toEqual(["sensor.a", "sensor.b"]);
  });
});

describe("getFirstEntityName", () => {
  it("returns first entity from pipe-separated string", () => {
    expect(getFirstEntityName("sensor.a|sensor.b")).toBe("sensor.a");
  });

  it("returns single entity", () => {
    expect(getFirstEntityName("sensor.power")).toBe("sensor.power");
  });

  it("trims whitespace", () => {
    expect(getFirstEntityName("  sensor.a | sensor.b")).toBe("sensor.a");
  });
});
