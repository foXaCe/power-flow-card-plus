# Plan 002: Replace per-render width measurement with a ResizeObserver

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 7183fa9..HEAD -- src/power-flow-card-plus.ts`
> If that file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as a
> STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (recommended to land Plan 001 first as a regression net)
- **Category**: perf
- **Planned at**: commit `7183fa9`, 2026-06-21

## Why this matters

`updated()` runs after every render, and the card re-renders on every Home
Assistant state push (every 1–5 s, more on busy dashboards). On each of those,
`updated()` calls `getComputedStyle(elem).getPropertyValue("width")` — a
**synchronous forced layout/reflow** — then writes `this._width`, a `@state`
field, which can trigger _another_ render. With several cards on one dashboard
this is repeated layout thrashing for a value that only changes when the card is
actually resized. A `ResizeObserver` updates `_width` only on real size changes,
eliminating the per-update reflow and the extra render.

## Current state

- `src/power-flow-card-plus.ts`, `updated()` (lines 803–815):

  ```ts
  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._config || !this.hass) {
      return;
    }

    const elem = this?.shadowRoot?.querySelector("#power-flow-card-plus");
    const widthStr = elem ? getComputedStyle(elem).getPropertyValue("width") : "0px";
    this._width = parseInt(widthStr.replace("px", ""), 10);

    this._tryConnectAll();
    this._attachDragListeners();
  }
  ```

- `_width` is declared as reactive state near the top of the class:
  `@state() private _width = 0;` (around line 59). It is consumed in `render()`
  as `const isCardWideEnough = this._width > 420;` (around line 717) which is
  passed into `allDynamicStyles(...)`.
- `disconnectedCallback()` (lines 160–174) already cleans up template
  subscriptions, drag handlers, and the clock interval — the observer teardown
  goes here.
- `connectedCallback()` is at lines 145–158.
- **Test env note**: `__tests__/setup.ts` already provides a no-op
  `ResizeObserver` stub (lines 9–23), so `new ResizeObserver(...)` works in
  Jest/jsdom and never fires — `_width` stays `0` in tests, exactly as it does
  today (jsdom `getComputedStyle` returns `"0px"`). **This means existing tests
  and Plan 001's snapshots must be UNCHANGED by this plan.**
- **Conventions**: TypeScript strict; private fields prefixed `_`; the file uses
  `window.setInterval`/`clearInterval` patterns for lifecycle resources (see
  `_clockInterval`). Match that style for the observer field.

## Commands you will need

| Purpose         | Command             | Expected on success                                                            |
| --------------- | ------------------- | ------------------------------------------------------------------------------ |
| Install         | `pnpm install`      | exit 0                                                                         |
| Typecheck       | `pnpm typecheck`    | exit 0                                                                         |
| Full test suite | `pnpm test`         | all pass, **same count as before** (currently 144, or 150+ if Plan 001 landed) |
| Lint            | `pnpm lint`         | exit 0                                                                         |
| Format check    | `pnpm format:check` | exit 0                                                                         |
| Build           | `pnpm build`        | exit 0, writes `dist/power-flow-card-plus.js`                                  |

## Scope

**In scope** (only file to modify):

- `src/power-flow-card-plus.ts`
- `plans/README.md` (status update only)

**Out of scope** (do NOT touch):

- `__tests__/setup.ts` — the ResizeObserver stub is already present; do not change it.
- `render()` and the `isCardWideEnough` consumer — `_width` keeps the same meaning (the inner element's pixel width); only _how_ it is measured changes.
- `_attachDragListeners()` / `_tryConnectAll()` — keep these calls in `updated()`.

## Git workflow

- Branch: `advisor/002-resizeobserver-width`
- Conventional commit. Type `perf:` is accurate — **note: `perf:` triggers a patch release** via semantic-release when merged to `main`. If you do not want a release, use `refactor:` instead. Confirm with the operator which they prefer; default to `perf:`.
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add a `_resizeObserver` field

Near the other private lifecycle fields (next to `_clockInterval` at line 142),
add:

```ts
private _resizeObserver?: ResizeObserver;
```

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Set up the observer once (in `updated()`), remove the per-render `getComputedStyle`

Replace the body of `updated()` (lines 803–815) with:

```ts
protected updated(changedProps: PropertyValues): void {
  super.updated(changedProps);
  if (!this._config || !this.hass) {
    return;
  }

  // Measure width via ResizeObserver instead of a forced layout read on every
  // render. Set it up once, the first render at which the inner element exists.
  if (!this._resizeObserver) {
    const elem = this.shadowRoot?.querySelector("#power-flow-card-plus");
    if (elem) {
      this._resizeObserver = new ResizeObserver((entries) => {
        const width = Math.round(entries[0]?.contentRect.width ?? 0);
        if (width && width !== this._width) {
          this._width = width;
        }
      });
      this._resizeObserver.observe(elem);
    }
  }

  this._tryConnectAll();
  this._attachDragListeners();
}
```

**Verify**: `pnpm typecheck` → exit 0. `grep -n "getComputedStyle" src/power-flow-card-plus.ts` → no matches.

### Step 3: Tear down the observer on disconnect

In `disconnectedCallback()` (lines 160–174), add observer cleanup alongside the
existing teardown (after the clock-interval block):

```ts
if (this._resizeObserver) {
  this._resizeObserver.disconnect();
  this._resizeObserver = undefined;
}
```

(Setting it to `undefined` matters: on reconnect, `updated()` recreates and
re-observes it.)

**Verify**: `pnpm typecheck` → exit 0.

### Step 4: Full verification

**Verify**:

- `pnpm test` → all pass, **same test count as before this plan** (no test should change behavior; if Plan 001 landed, its snapshot file must be byte-identical — `git diff --stat` shows no `.snap` change).
- `pnpm lint` → exit 0; `pnpm format:check` → exit 0 (run `pnpm format:write` if needed, formatting only).
- `pnpm build` → exit 0.

## Test plan

- No new tests required — this is a behavior-preserving perf change and the
  existing suite (plus Plan 001's snapshots if present) is the regression guard.
- If Plan 001 has landed: confirm `__tests__/__snapshots__/power-allocation.characterization.test.ts.snap` is unchanged (`git status` shows it not modified). If it changed, STOP — the width path is affecting rendered output unexpectedly.
- Optional (nice to have, not required): a unit test asserting `disconnectedCallback()` calls `disconnect()` on the observer (spy on `ResizeObserver.prototype.disconnect`).

## Done criteria

ALL must hold:

- [ ] `grep -n "getComputedStyle" src/power-flow-card-plus.ts` returns nothing.
- [ ] `grep -n "_resizeObserver" src/power-flow-card-plus.ts` shows the field, the setup in `updated()`, and the teardown in `disconnectedCallback()`.
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm test` exits 0 with the same test count as before (and any Plan 001 snapshot unchanged).
- [ ] `pnpm lint` and `pnpm format:check` exit 0.
- [ ] `pnpm build` exits 0.
- [ ] `git status` shows only `src/power-flow-card-plus.ts` and `plans/README.md` modified.
- [ ] `plans/README.md` status row for 002 updated to DONE.

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows `src/power-flow-card-plus.ts` changed since `7183fa9` and the `updated()` excerpt no longer matches.
- The test count changes or any existing test fails (this change must be behavior-preserving in jsdom; if a test depended on the synchronous `_width` read, report it rather than weakening the test).
- Plan 001's snapshot file changes — investigate before proceeding.
- `getComputedStyle` is used elsewhere in the file for `_width` in a way this plan didn't account for (search the whole file first).

## Maintenance notes

- `_width` semantics are unchanged (rounded pixel width of `#power-flow-card-plus`).
  Anything reading `isCardWideEnough` (the `> 420` threshold in `render()`)
  continues to work; the value now updates slightly asynchronously (on the next
  frame after a resize) instead of synchronously in `updated()` — acceptable for
  a responsive style toggle.
- If a future change needs the width synchronously on first paint, read it once
  in `firstUpdated()` (a single forced layout is fine) and let the observer take
  over afterwards — do not reintroduce the per-`updated()` read.
- Reviewer should confirm: observer is created once (not per render), is observed
  on the correct element, and is disconnected on `disconnectedCallback`.
- `perf:` commit type triggers a patch release on merge to `main` (semantic-release).
