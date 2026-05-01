import {
  getTopLeftIndividual,
  getBottomLeftIndividual,
  getTopRightIndividual,
  getBottomRightIndividual,
  checkHasRightIndividual,
  checkHasBottomIndividual,
} from "../src/utils/computeIndividualPosition";
import { IndividualObject } from "../src/states/raw/individual/getIndividualObject";

const makeIndividualObj = (has: boolean, state = 100): IndividualObject =>
  ({
    has,
    state,
    entity: `sensor.test_${state}`,
    name: `Test ${state}`,
    icon: "mdi:flash",
  }) as IndividualObject;

describe("getTopLeftIndividual", () => {
  it("returns first active individual", () => {
    const objs = [makeIndividualObj(true, 100), makeIndividualObj(true, 200)];
    expect(getTopLeftIndividual(objs)?.state).toBe(100);
  });

  it("returns undefined when no active individuals", () => {
    const objs = [makeIndividualObj(false)];
    expect(getTopLeftIndividual(objs)).toBeUndefined();
  });

  it("skips inactive individuals", () => {
    const objs = [makeIndividualObj(false), makeIndividualObj(true, 200)];
    expect(getTopLeftIndividual(objs)?.state).toBe(200);
  });

  it("returns undefined for empty array", () => {
    expect(getTopLeftIndividual([])).toBeUndefined();
  });
});

describe("getBottomLeftIndividual", () => {
  it("returns second active individual", () => {
    const objs = [makeIndividualObj(true, 100), makeIndividualObj(true, 200), makeIndividualObj(true, 300)];
    expect(getBottomLeftIndividual(objs)?.state).toBe(200);
  });

  it("returns undefined when only one active", () => {
    const objs = [makeIndividualObj(true, 100)];
    expect(getBottomLeftIndividual(objs)).toBeUndefined();
  });
});

describe("getTopRightIndividual", () => {
  it("returns third active individual", () => {
    const objs = [makeIndividualObj(true, 100), makeIndividualObj(true, 200), makeIndividualObj(true, 300)];
    expect(getTopRightIndividual(objs)?.state).toBe(300);
  });
});

describe("getBottomRightIndividual", () => {
  it("returns fourth active individual", () => {
    const objs = [makeIndividualObj(true, 100), makeIndividualObj(true, 200), makeIndividualObj(true, 300), makeIndividualObj(true, 400)];
    expect(getBottomRightIndividual(objs)?.state).toBe(400);
  });
});

describe("checkHasRightIndividual", () => {
  it("returns true when 3+ active individuals", () => {
    const objs = [makeIndividualObj(true, 100), makeIndividualObj(true, 200), makeIndividualObj(true, 300)];
    expect(checkHasRightIndividual(objs)).toBe(true);
  });

  it("returns false when fewer than 3 active", () => {
    const objs = [makeIndividualObj(true, 100), makeIndividualObj(true, 200)];
    expect(checkHasRightIndividual(objs)).toBe(false);
  });
});

describe("checkHasBottomIndividual", () => {
  it("returns true when 2+ active individuals", () => {
    const objs = [makeIndividualObj(true, 100), makeIndividualObj(true, 200)];
    expect(checkHasBottomIndividual(objs)).toBe(true);
  });

  it("returns false when only one active", () => {
    const objs = [makeIndividualObj(true, 100)];
    expect(checkHasBottomIndividual(objs)).toBe(false);
  });
});
