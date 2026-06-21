# Plan 003: Re-render only when a referenced entity actually changes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 7183fa9..HEAD -- src/power-flow-card-plus.ts`
> If that file changed since this plan was written, compare the "Current state"
> excerpt against the live code; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (strongly recommend Plan 001 has landed first — it locks render output so you can confirm this change is render-neutral)
- **Category**: perf
- **Planned at**: commit `7183fa9`, 2026-06-21

## Why this matters

`shouldUpdate()` currently returns `true` on **every** Home Assistant state
push, regardless of whether any entity _this card uses_ changed. Home Assistant
replaces `hass` whenever ANY entity in the whole installation changes (lights,
sensors, anything), so on a busy dashboard the card re-runs its full ~300-line
power-allocation math and rebuilds the SVG many times per minute for nothing.
Filtering to "did a referenced entity change?" cuts the vast majority of those
renders. This is the standard pattern for HA custom cards.

The risk is **under-rendering**: if the filter misses an entity the card
displays, that value goes stale. The collector below is deliberately
_over-inclusive_ (it walks the whole config and grabs every entity-shaped
string) to make under-collection essentially impossible, and templates are
handled by a separate path (see Current state).

## Current state

- `src/power-flow-card-plus.ts`, `shouldUpdate()` (lines 176–188):
  ```ts
  protected shouldUpdate(changed: PropertyValues): boolean {
    if (
      changed.has("_config") ||
      changed.has("_templateResults") ||
      changed.has("_width") ||
      changed.has("_draggedElement") ||
      changed.has("_dragPositionOverride")
    ) {
      return true;
    }
    if (!changed.has("hass")) return false;
    return true;          // ← always re-renders on any hass change
  }
  ```
- `hass` is `@property({ attribute: false }) public hass!: HomeAssistant;` (≈ line 52).
  `HomeAssistant` (from `./ha`) has `states: { [entityId: string]: HassEntity }`.
  Home Assistant guarantees that `hass.states[id]` is a **new object reference
  only when that entity changed** — so `oldHass.states[id] !== newHass.states[id]`
  is a correct, cheap change check.
- `this._config` is the validated card config (type `PowerFlowCardPlusConfig`,
  see `src/power-flow-card-plus-config.ts`). It nests entity ids in many places
  (e.g. `entities.grid.entity` which may be a string OR `{ consumption, production }`,
  `entities.battery.state_of_charge`, `entities.*.secondary_info.entity`,
  `entities.grid.power_outage.entity`, `entities.individual[].entity`,
  `cost_entity`, `daily_cost_energy_entity`, `daily_export_energy_entity`, …).
  Enumerating each field by hand is fragile; the collector below walks the whole
  config object instead.
- **Templates are a separate path — do NOT try to filter on them.** Secondary-info
  Jinja templates can reference arbitrary entities; their results arrive via the
  `_templateResults` reactive field (updated by the subscription callbacks in
  `_tryConnect`), and `changed.has("_templateResults")` already forces a render.
  So template-driven values keep updating even when the hass filter returns false.
- **Conventions**: TS strict; private methods prefixed `_`; the file already
  caches derived values in private fields (e.g. `previousDur`). Match that style.

## Commands you will need

| Purpose       | Command                     | Expected on success                                 |
| ------------- | --------------------------- | --------------------------------------------------- |
| Install       | `pnpm install`              | exit 0                                              |
| Run new tests | `pnpm test -- shouldUpdate` | all pass                                            |
| Full suite    | `pnpm test`                 | all pass (Plan 001 snapshot, if present, unchanged) |
| Typecheck     | `pnpm typecheck`            | exit 0                                              |
| Lint          | `pnpm lint`                 | exit 0                                              |
| Format        | `pnpm format:check`         | exit 0                                              |

## Scope

**In scope**:

- `src/power-flow-card-plus.ts` (modify `shouldUpdate`, add a private collector + cache)
- `__tests__/shouldUpdate.test.ts` (create)
- `plans/README.md` (status update)

**Out of scope** (do NOT touch):

- `render()` and the power-allocation math — this plan changes only _when_ the
  card renders, never _what_ it renders.
- The template subscription code (`_tryConnect*`) — templates are handled by the
  `_templateResults` branch; do not route them through the new filter.
- `_width` / `_draggedElement` / `_dragPositionOverride` branches — leave them.

## Git workflow

- Branch: `advisor/003-shouldupdate-entity-filter`
- Conventional commit; `perf:` (note: triggers a patch release on merge) or
  `refactor:` (no release) per operator preference; default `perf:`.
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add a cached, over-inclusive entity-id collector

Add these private members to the class (near other private fields, ≈ line 142):

```ts
private _refEntities?: Set<string>;
private _refEntitiesKey?: PowerFlowCardPlusConfig;

/**
 * Every entity id referenced anywhere in the config. Deliberately
 * over-inclusive: walks the whole config object and collects any string that
 * looks like an entity id (`domain.object_id`). Over-collection is harmless
 * (an unrelated id just never changes); under-collection would cause stale
 * renders, so we avoid enumerating individual fields. Cached per config object.
 */
private _referencedEntityIds(): Set<string> {
  if (this._refEntities && this._refEntitiesKey === this._config) return this._refEntities;
  const ids = new Set<string>();
  const ENTITY_RE = /^[a-z_]+\.[a-z0-9_]+$/;
  const walk = (value: unknown): void => {
    if (typeof value === "string") {
      if (ENTITY_RE.test(value)) ids.add(value);
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  };
  walk(this._config);
  this._refEntities = ids;
  this._refEntitiesKey = this._config;
  return ids;
}
```

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Filter `shouldUpdate` on referenced-entity changes

Replace the final two lines of `shouldUpdate` (`if (!changed.has("hass")) return false; return true;`) with:

```ts
if (!changed.has("hass")) return false;
const oldHass = changed.get("hass") as HomeAssistant | undefined;
// First hass, or no config yet: must render.
if (!oldHass || !this._config?.entities) return true;
// Render only if an entity the card references actually changed reference.
for (const id of this._referencedEntityIds()) {
  if (oldHass.states[id] !== this.hass.states[id]) return true;
}
return false;
```

Keep all the earlier `changed.has("_config") | "_templateResults" | "_width" |
"_draggedElement" | "_dragPositionOverride"` checks exactly as they are.

**Verify**: `pnpm typecheck` → exit 0. `pnpm test` → existing suite still passes.

### Step 3: Write the filtering tests

Create `__tests__/shouldUpdate.test.ts`. Model imports on
`__tests__/power-flow-card-plus.test.ts`. Build a `PropertyValues` map with the
OLD hass as the value (`new Map([["hass", oldHass]])`) and set `card.hass` to the
NEW hass before calling `(card as any).shouldUpdate(map)`.

Cover these cases:

```ts
import { makeHass, makeStateObj } from "./__fixtures__/hass";
import "../src/power-flow-card-plus";

const setup = () => {
  const card = document.createElement("power-flow-card-plus") as any;
  card.setConfig({ type: "custom:power-flow-card-plus", entities: { grid: { entity: "sensor.grid" } } });
  return card;
};

it("re-renders when a referenced entity changes", () => {
  const card = setup();
  const oldHass = makeHass({ states: { "sensor.grid": makeStateObj("100", { unit_of_measurement: "W" }) } });
  const newHass = makeHass({ states: { "sensor.grid": makeStateObj("200", { unit_of_measurement: "W" }) } });
  card.hass = newHass;
  expect(card.shouldUpdate(new Map([["hass", oldHass]]))).toBe(true);
});

it("does NOT re-render when only an unreferenced entity changes", () => {
  const card = setup();
  const grid = makeStateObj("100", { unit_of_measurement: "W" });
  const oldHass = makeHass({ states: { "sensor.grid": grid, "light.kitchen": makeStateObj("on") } });
  const newHass = makeHass({ states: { "sensor.grid": grid /* same ref */, "light.kitchen": makeStateObj("off") } });
  card.hass = newHass;
  expect(card.shouldUpdate(new Map([["hass", oldHass]]))).toBe(false);
});

it("always re-renders on first hass (no previous)", () => {
  const card = setup();
  card.hass = makeHass({ states: { "sensor.grid": makeStateObj("100", { unit_of_measurement: "W" }) } });
  expect(card.shouldUpdate(new Map([["hass", undefined]]))).toBe(true);
});

it("re-renders on config / template / width / drag changes regardless of hass", () => {
  const card = setup();
  card.hass = makeHass({ states: {} });
  expect(card.shouldUpdate(new Map([["_config", {}]]))).toBe(true);
  expect(card.shouldUpdate(new Map([["_templateResults", {}]]))).toBe(true);
  expect(card.shouldUpdate(new Map([["_width", 0]]))).toBe(true);
  expect(card.shouldUpdate(new Map([["_dragPositionOverride", undefined]]))).toBe(true);
});

it("collects nested + split-entity references (grid consumption/production, secondary_info)", () => {
  const card = document.createElement("power-flow-card-plus") as any;
  card.setConfig({
    type: "custom:power-flow-card-plus",
    entities: {
      grid: { entity: { consumption: "sensor.gc", production: "sensor.gp" }, secondary_info: { entity: "sensor.gs" } },
    },
  });
  const base = { "sensor.gc": makeStateObj("1"), "sensor.gp": makeStateObj("2"), "sensor.gs": makeStateObj("3") };
  const oldHass = makeHass({ states: { ...base } });
  // change only the secondary_info entity
  card.hass = makeHass({ states: { ...base, "sensor.gs": makeStateObj("999") } });
  expect(card.shouldUpdate(new Map([["hass", oldHass]]))).toBe(true);
});
```

**Verify**: `pnpm test -- shouldUpdate` → all pass.

### Step 4: Confirm render output is unchanged + full verification

**Verify**:

- `pnpm test` → all pass; if Plan 001 landed, its `.snap` file is byte-unchanged (`git status` shows it unmodified).
- `pnpm typecheck`, `pnpm lint`, `pnpm format:check` → all exit 0.

## Test plan

- New file `__tests__/shouldUpdate.test.ts` with the 5 cases above (referenced
  change → true; unreferenced change → false; first hass → true; non-hass
  reactive changes → true; nested/split/secondary entity collection → true).
- Pattern source: `__tests__/power-flow-card-plus.test.ts`.
- The key behavioral assertion is case 2 (the perf win): unrelated entity change
  → no render.

## Done criteria

ALL must hold:

- [ ] `__tests__/shouldUpdate.test.ts` exists with ≥ 5 cases, all passing.
- [ ] `grep -n "_referencedEntityIds" src/power-flow-card-plus.ts` shows the collector and its use in `shouldUpdate`.
- [ ] `pnpm test` exits 0; Plan 001 snapshot (if present) unchanged.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check` exit 0.
- [ ] `git status` shows only `src/power-flow-card-plus.ts`, `__tests__/shouldUpdate.test.ts`, `plans/README.md`.
- [ ] `plans/README.md` status row for 003 updated to DONE.

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `shouldUpdate` no longer matches the excerpt.
- Any existing test fails or Plan 001's snapshot changes (this change must be
  render-neutral — it only gates _when_ renders happen).
- You discover the card displays an entity whose id is NOT present as a plain
  `domain.object` string anywhere in the config (would mean the collector can
  miss it) — report it; do not ship the filter without covering that entity.
- The `HomeAssistant` type import or `changed.get("hass")` typing fights the
  compiler in a way that needs an `as any` on `this.hass` — a single
  `as HomeAssistant | undefined` on `changed.get("hass")` is acceptable; broader
  `any` is not — report instead.

## Maintenance notes

- This is a textbook HA-card optimization; the over-inclusive collector means
  adding new config entity fields needs no change here (they're picked up
  automatically as long as they're entity-shaped strings).
- If a future feature renders an entity whose id is NOT in the config (e.g. a
  hardcoded or derived entity), it must be added to the collector or it will go
  stale — call this out in that feature's PR.
- Manual smoke test recommended before release: load the card in a real HA
  dashboard, change an unrelated entity (toggle a light) and confirm the card
  does NOT flash/recompute; change a referenced sensor and confirm it updates.
- `perf:` commit type triggers a patch release on merge to `main`.
