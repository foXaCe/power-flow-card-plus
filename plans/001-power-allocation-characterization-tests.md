# Plan 001: Characterization tests lock the power-allocation algorithm's output

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 7183fa9..HEAD -- src/power-flow-card-plus.ts src/components`
> If any of those files changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `7183fa9`, 2026-06-21

## Why this matters

The card's entire reason for existing is the power-allocation math in `render()`
(`src/power-flow-card-plus.ts`, lines 483–585): it decides how much energy flows
solar→home, solar→battery, grid→battery, battery→home, battery→grid, etc., and
those numbers are what the user sees. That ~100-line block has **no tests that
assert its output** — the existing render tests only check that an `<ha-card>`
appears. Any future change (Plans 003 and 007 both refactor around it) can
silently produce wrong energy flows and no test would catch it.

This plan adds **characterization tests**: tests that capture the _current_
output for a set of well-defined scenarios, so that later refactors are proven
not to change behavior. The goal is not to assert what the math _should_ do — it
is to lock what it _currently does_, exactly.

## Current state

- `src/power-flow-card-plus.ts` — the main Lit card. `render()` (≈ lines 268–801)
  contains the inline power-allocation math. The math is NOT a separately
  callable function; it is computed inside `render()`, so these tests must drive
  the whole component and read the rendered DOM (do **not** try to extract the
  math in this plan — that is Plan 007).
- The core algorithm being locked (excerpt, `src/power-flow-card-plus.ts:503–559`):
  ```ts
  if (solar.has) {
    solar.state.toHome = (solar.state.total ?? 0) - (grid.state.toGrid ?? 0) - (battery.state.toBattery ?? 0);
  }
  // ... solar<0 → grid charges battery; else PV→battery first, remainder grid→battery ...
  grid.state.toHome = Math.max((grid.state.fromGrid ?? 0) - (grid.state.toBattery ?? 0), 0);
  if (solar.has && grid.state.toGrid) solar.state.toGrid = grid.state.toGrid - (battery.state.toGrid ?? 0);
  ```
- The rendered values appear in these DOM locations (inside the card's
  `shadowRoot`), produced by the component files in `src/components/`:
  - Grid consumption: `.circle-container.grid span.consumption` (text via `displayValue`)
  - Grid return/export: `.circle-container.grid span.return`
  - Solar production: `.circle-container.solar span.solar`
  - Home consumption: `.circle-container.home #home-circle` (the home circle's text node)
  - Battery state-of-charge: `#battery-state-of-charge-text`
  - Battery in/out: `.circle-container.battery span.battery-in`, `span.battery-out`
  - Flow lines: `<path>` elements inside `#power-flow-lines` (ids like `grid-home-flow`, `solar-home-flow`, etc.) — present only when the corresponding flow is non-zero (`src/utils/showLine.ts`).
- **Test conventions** — match these exactly:
  - Tests live in `__tests__/`, run by Jest + ts-jest + jsdom.
  - The mock `hass` helpers are in `__tests__/__fixtures__/hass.ts`: `makeHass({ states })` and `makeStateObj(state, attributes)`. `makeStateObj("100", { unit_of_measurement: "W" })` builds an entity state.
  - **Model the new test file structure on the existing `__tests__/power-flow-card-plus.test.ts`** — specifically its `describe("render", ...)` block, which does: `card = document.createElement("power-flow-card-plus"); card.hass = makeHass({...}); card.setConfig({...}); document.body.appendChild(card); await card.updateComplete;` then queries `card.shadowRoot`.
  - A minimal valid config needs at least one of `entities.grid` / `entities.solar` / `entities.battery`.

## Commands you will need

| Purpose                                               | Command                         | Expected on success                                          |
| ----------------------------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| Install                                               | `pnpm install`                  | exit 0                                                       |
| Run only the new test file                            | `pnpm test -- power-allocation` | all pass                                                     |
| Full test suite                                       | `pnpm test`                     | all pass (currently 144 tests)                               |
| Coverage (to confirm the math block is now exercised) | `pnpm test:coverage`            | `src/power-flow-card-plus.ts` branch % increases vs baseline |
| Typecheck                                             | `pnpm typecheck`                | exit 0, no errors                                            |
| Lint                                                  | `pnpm lint`                     | exit 0                                                       |
| Format check                                          | `pnpm format:check`             | exit 0                                                       |

## Scope

**In scope** (the only files you should create/modify):

- `__tests__/power-allocation.characterization.test.ts` (create)
- `plans/README.md` (status update only)

**Out of scope** (do NOT touch):

- `src/**` — this plan adds tests ONLY. You must not change any source file. If a test reveals what looks like a bug, that is expected (characterization locks current behavior, bugs included) — record it in the test as a comment and in your final report; do not fix it here.
- The existing `__tests__/power-flow-card-plus.test.ts` — leave it as-is; add a new file.

## Git workflow

- Branch: `advisor/001-characterization-tests`
- Conventional commits (repo style — see `git log --oneline -5`, e.g. `test: ...`). Use `test:` type — it does NOT trigger a release.
- Do NOT push or open a PR unless the operator instructs it.

## Steps

### Step 1: Create the test file with a DOM-extraction helper

Create `__tests__/power-allocation.characterization.test.ts`. Start with imports
matching `__tests__/power-flow-card-plus.test.ts` and a helper that renders the
card and extracts a plain object of the displayed values + present flow-line ids:

```ts
import { makeHass, makeStateObj } from "./__fixtures__/hass";
import "../src/power-flow-card-plus";

type Snapshot = {
  gridConsumption: string | null;
  gridReturn: string | null;
  solar: string | null;
  home: string | null;
  batterySoc: string | null;
  batteryIn: string | null;
  batteryOut: string | null;
  flowLineIds: string[];
};

const text = (root: ShadowRoot, sel: string): string | null => root.querySelector(sel)?.textContent?.trim().replace(/\s+/g, " ") ?? null;

async function renderCard(states: Record<string, any>, config: any): Promise<Snapshot> {
  const card = document.createElement("power-flow-card-plus") as any;
  card.hass = makeHass({ states });
  card.setConfig(config);
  document.body.appendChild(card);
  await card.updateComplete;
  // a second microtask flush lets `updated()` settle width/_width re-render
  await card.updateComplete;
  const root = card.shadowRoot as ShadowRoot;
  const snap: Snapshot = {
    gridConsumption: text(root, ".circle-container.grid span.consumption"),
    gridReturn: text(root, ".circle-container.grid span.return"),
    solar: text(root, ".circle-container.solar span.solar"),
    home: text(root, ".circle-container.home #home-circle"),
    batterySoc: text(root, "#battery-state-of-charge-text"),
    batteryIn: text(root, ".circle-container.battery span.battery-in"),
    batteryOut: text(root, ".circle-container.battery span.battery-out"),
    flowLineIds: Array.from(root.querySelectorAll("#power-flow-lines path[id]"))
      .map((p) => (p as SVGElement).id)
      .sort(),
  };
  card.parentNode?.removeChild(card);
  return snap;
}
```

**Verify**: `pnpm test -- power-allocation` → file is found, runs (it has no tests yet, so Jest reports "0 tests" or you add the first one in Step 2). `pnpm typecheck` → exit 0.

> NOTE on selectors: the exact class/id selectors above come from the component
> files (`src/components/grid.ts`, `solar.ts`, `home.ts`, `battery.ts`). If a
> selector returns `null` in EVERY scenario where you expect a value, the
> selector is wrong — open the relevant component file, find the actual
> class/id, fix the selector. This is allowed (it is still test-only). Confirm
> at least the `home` field is non-null for scenario A in Step 2 before
> proceeding.

### Step 2: Add scenarios as curated snapshots (lock CURRENT output)

For each scenario below, write a test that calls `renderCard(...)` and asserts
the result with `expect(snap).toMatchSnapshot()`. **Run the test once to
generate the snapshot baseline — that baseline IS the characterization.** Do not
hand-write expected values; let Jest record the current output.

Use this exact set of scenarios (entity unit is W; `watt_threshold` default
converts ≥1000 W to kW in the display, which is fine — the snapshot captures
whatever it currently shows):

- **A — grid consumption only**: `sensor.grid: "500"` (W); config `entities: { grid: { entity: "sensor.grid" } }`.
- **B — solar with export**: `sensor.solar: "3000"`, grid as separate consumption/production: `entities: { solar: { entity: "sensor.solar" }, grid: { entity: { consumption: "sensor.grid_c", production: "sensor.grid_p" } } }` with `sensor.grid_c: "0"`, `sensor.grid_p: "2000"`.
- **C — solar charging battery**: `sensor.solar: "2000"`, `sensor.batt: "-500"` (negative = charging, or use the battery entity convention you observe), `entities: { solar:{entity:"sensor.solar"}, battery:{entity:"sensor.batt", state_of_charge:"sensor.soc"} }`, `sensor.soc:"80"`.
- **D — battery discharging + small grid**: `sensor.batt:"800"`, `sensor.grid:"200"`, battery + grid configured.
- **E — grid charging battery (night, no solar)**: `sensor.grid:"1000"`, `sensor.batt:"-600"`, grid + battery configured.
- **F — power outage**: grid configured with `power_outage: { entity: "binary_sensor.outage", state_alert: "on" }`, `binary_sensor.outage: "on"`, `sensor.grid:"0"`.

Each test:

```ts
it("scenario A — grid consumption only", async () => {
  const snap = await renderCard(
    { "sensor.grid": makeStateObj("500", { unit_of_measurement: "W" }) },
    { type: "custom:power-flow-card-plus", entities: { grid: { entity: "sensor.grid" } } }
  );
  expect(snap).toMatchSnapshot();
});
```

**Verify**: `pnpm test -- power-allocation` → all scenarios pass and a
`__tests__/__snapshots__/power-allocation.characterization.test.ts.snap` file is
created. Open that `.snap` file and sanity-check scenario A: `home` and
`gridConsumption` should reflect 500 W (e.g. contain "500"). If a value is
obviously wrong (e.g. `home` is null or empty for scenario A), STOP — your
selector is wrong; fix it (Step 1 note) and regenerate.

### Step 3: Add explicit invariant assertions for the two clearest scenarios

Snapshots lock everything but read poorly. Add two human-readable assertions so
a reviewer can see the intent, for the unambiguous scenarios A and B:

```ts
it("scenario A — home equals grid consumption (no other sources)", async () => {
  const snap = await renderCard(/* same as A */);
  // Characterized: with only grid, home consumption == grid consumption.
  expect(snap.home).toBe(snap.gridConsumption); // if this fails, record ACTUAL and add a // BUG? note — do not change src
});
```

If an invariant assertion fails, that may indicate a pre-existing bug. **Do not
fix source.** Change the assertion to capture the actual value, annotate it with
`// characterized current behavior — possible bug, see plan 001 report`, and note
it in your final report.

**Verify**: `pnpm test -- power-allocation` → all pass.

### Step 4: Full verification

**Verify**:

- `pnpm test` → all pass (144 existing + your new ones).
- `pnpm typecheck` → exit 0.
- `pnpm lint` → exit 0.
- `pnpm format:check` → exit 0 (if it fails, run `pnpm format:write` then re-check — formatting only).

## Test plan

- New file `__tests__/power-allocation.characterization.test.ts` with 6 snapshot
  scenarios (A–F) + 2 invariant assertions (A, B).
- Structural pattern: model on `__tests__/power-flow-card-plus.test.ts` `describe("render")`.
- The committed `.snap` file is part of the deliverable — it is the behavioral baseline.
- Verification: `pnpm test -- power-allocation` → all pass; `.snap` file exists and is committed.

## Done criteria

ALL must hold:

- [ ] `__tests__/power-allocation.characterization.test.ts` exists with ≥ 6 scenarios.
- [ ] `__tests__/__snapshots__/power-allocation.characterization.test.ts.snap` exists and is committed.
- [ ] `pnpm test` exits 0; the new tests are included in the run.
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm lint` exits 0 and `pnpm format:check` exits 0.
- [ ] `git status` shows only `__tests__/` files and `plans/README.md` changed — NO `src/**` changes.
- [ ] `plans/README.md` status row for 001 updated to DONE.

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `src/power-flow-card-plus.ts` or `src/components/` changed since `7183fa9` and the excerpts above no longer match.
- A DOM selector returns null across all scenarios even after you inspect the component file (the rendering may have changed structurally).
- Rendering throws for any scenario (e.g. the config shape is rejected by `setConfig`) — report the error; the scenario's config may need the exact entity shape the card expects (check `src/power-flow-card-plus-config.ts`).
- You find yourself wanting to edit any `src/**` file to make a test pass — that means the test is asserting "should" not "is"; switch to locking actual behavior instead.

## Maintenance notes

- These snapshots are a **refactor safety net for Plans 003 and 007**. When
  those land, the snapshots should NOT change — if a snapshot diff appears during
  those refactors, it means the refactor altered the math output and must be
  reviewed (or the diff explicitly approved with `pnpm test -- -u` only after
  confirming the change is intended).
- If a future feature intentionally changes a flow calculation, update the
  snapshot deliberately (`jest -u`) and call it out in the PR.
- A reviewer should scrutinize: that no `src/**` file changed, and that the
  scenarios cover the branches in `power-flow-card-plus.ts:503–561` (solar<0
  path, PV-first-then-grid battery charging, power outage).
- Follow-up deferred: extracting the math into a pure, directly-testable function
  is Plan 007 — these DOM-level tests are the prerequisite that makes that safe.
