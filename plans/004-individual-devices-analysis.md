# Plan 004 — Individual Devices Feature: Analysis and Decision

Date: 2026-06-21
Status: DECISION REQUIRED — no code changes in this document

---

## 1. Confirmed Inconsistency

**One sentence:** Individual devices are fully configurable (schema + visual editor), feed real arithmetic into home-consumption display (`subtract_individual`) and flow-rate calculations, are passed to multiple components, but render NO circle and NO flow line — because commit `b489111` deleted the two components that drew them (`individualElement.ts`, `individualSecondarySpan.ts`).

### Evidence

```
grep -rn "individualElement\|individualSecondarySpan" src/   → 0 results
```

No surviving file imports or calls either removed component. The rendering is completely gone.

```
grep -n "individualObjs\|totalIndividualConsumption" src/power-flow-card-plus.ts
```

Results at lines 429, 582, 603–615, 671, 715, 729, 777, 785 confirm the data pipeline is fully active:

| Line          | Action                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------- |
| 429           | `individualObjs` built from config entities                                                 |
| 582           | `totalIndividualConsumption` summed                                                         |
| 603–615       | Home display value reduced by `totalIndividualConsumption` when `subtract_individual: true` |
| 671           | Flow rates computed per individual                                                          |
| 715           | Template results collected for secondary info                                               |
| 729, 777, 785 | `individualObjs` passed to `homeElement`, `flowElement`, etc.                               |

`flowElement` (`src/components/flows/index.ts`) receives `individual: IndividualObject[]` in its `Flows` interface but **never uses it** — the parameter is destructured away and no `individual`-to-home line is created.

`homeElement` (`src/components/home.ts`) uses `individual` only to decide whether to show the home label (`individual.filter(i => i.has).length <= 1`) — it does not render individual circles.

The drag-listener array (`_attachDragListeners`, line 820): `["solar","grid","home","battery","daily-cost","daily-export","self-sufficiency"]` — no `individual` entries.

---

## 2. Restore Cost Assessment

### What was removed (`b489111`)

| File                                              | Lines | Role                                                                                                  |
| ------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------- |
| `src/components/individualElement.ts`             | 223   | Renders circle + SVG animated flow line per position (left-top, left-bottom, right-top, right-bottom) |
| `src/components/spans/individualSecondarySpan.ts` | 58    | Renders secondary info span inside individual circle                                                  |

### Why restore ≠ pure revert

The two files were written for the **pre-fork layout**: fixed-position circles using relative CSS flow (`circle-container individual-top`, etc.). The fork replaced that layout with **absolute positioning + DOM-measured dynamic flow lines** (see `src/components/flows/index.ts` `createLine()` which uses `getBoundingClientRect()` to draw lines between circle-container elements that are located in the DOM).

Concrete adaptation points required for Option A:

1. **Positioning**: `individualElement.ts` emits `<div class="circle-container individual-top">` etc. These must be placed in the DOM and styled with absolute positions (like `home`, `solar`, `grid`, `battery` circles that use `circle-container <name>` + `custom_positions`). The old static SVG paths inside `individualElement` (`M40 -10 v50` etc.) are now obsolete — flow lines are computed dynamically.

2. **Flow-line wiring**: The old components embedded their own inline `<svg><path>` for animated dots. The new architecture delegates all lines to `flowElement` (`createLine()`). Individual-to-home lines must be added there, using `getCircleCenter(main.shadowRoot, "individual-left-top")` etc. — which requires the individual circle containers to exist in the DOM with predictable class names. The `individual: IndividualObject[]` parameter already threaded into `flowElement` but never consumed is the hook for this.

3. **Drag registration**: `_attachDragListeners()` must include the (up to 4) individual circle class names. Since individual circles are dynamic in count, this loop must be rebuilt to add handlers based on which individuals are configured, not from a static array.

4. **Absolute layout CSS**: `src/style.ts` contains 76 lines referencing `individual` (CSS variables, stroke colors, `.individual-top path`, etc.) which were written for the old flow — many selectors target `.individual-top` within the SVG paths that no longer exist in the same structure. These need audit and partial rewrite.

5. **`computeIndividualPosition.ts`** (still present): `getTopLeftIndividual`, `getBottomLeftIndividual`, `getTopRightIndividual`, `getBottomRightIndividual` — the 4-slot layout logic is intact and reusable.

6. **Tests**: The test suite (144 passing per `b489111` commit message) has no individual-circle rendering tests (none exist — verified by the fact that `b489111` removed only the two TS files with no corresponding test file changes). New integration/render tests would be needed.

**Effort estimate: L (Large)**
The data pipeline and helper utilities survive, but the rendering integration requires non-trivial adaptation across layout, flow-line system, drag system, and CSS. Estimated ~3–5 focused dev days including testing, assuming familiarity with the codebase.

---

## 3. Three Options

### Option A — Restore and adapt rendering

**Effort:** L
**Blast radius:** High — touches `src/components/`, `src/components/flows/index.ts`, `src/components/spans/`, `src/power-flow-card-plus.ts` (drag listeners), `src/style.ts` (CSS audit), potentially `src/utils/computeIndividualPosition.ts`, new tests.
**What it does:** Re-creates `individualElement.ts` and `individualSecondarySpan.ts` adapted for the absolute-positioning + `createLine()` flow architecture; wires drag; adds individual-to-home lines in `flowElement`; audits CSS.
**User value:** Highest — the feature becomes fully functional again. Users who configured `individual` would see circles and animated flow lines.
**Trade-offs:**

- Risk of layout regressions on the existing 7-circle absolute layout.
- `computeIndividualPosition.ts` places up to 4 individuals around the home circle — their positions may collide with other circles depending on configuration; needs UX review.
- The pre-fork layout had hardcoded positions; the fork's absolute layout needs new position defaults or a design decision for where the 4 individual circles live.
- No tests exist for this surface today; must be written from scratch.

**Verification story:** Build passes, typecheck passes, 144 existing tests still green, 4 new individual-circle render tests added. Manual QA: configure 1–4 individual entities, verify circles appear, flow lines animate, `subtract_individual` correctly adjusts home display.

---

### Option B — Remove the feature cleanly

**Effort:** M (Medium)
**Blast radius:** High surface area, low per-file risk — ~30 files, all changes are deletes/removals.
**BREAKING CHANGE** — removes `entities.individual` config key and `entities.home.subtract_individual`. Any user YAML referencing these will produce a silent no-op or a config validation error depending on schema behavior after removal.

Files to touch:

- `src/power-flow-card-plus-config.ts` — remove `individual?`, `subtract_individual?`, `sort_individual_devices?`
- `src/power-flow-card-plus-config-schema.ts` — remove `individual`, `subtract_individual`, `sort_individual_devices` schema entries
- `src/power-flow-card-plus.ts` — remove `individualObjs`, `totalIndividualConsumption`, subtract-individual home calc, flow-rate individual entries, `entities.individual.forEach` template subscription; remove `individual` from `homeElement`/`flowElement` call sites
- `src/components/flows/index.ts` — remove `individual` from `Flows` interface
- `src/components/home.ts` — remove `individual` from `Home` interface and `showHomeLabel` logic
- `src/states/raw/individual/` (3 files) — delete entirely
- `src/utils/computeIndividualPosition.ts` — delete
- `src/ui-editor/components/individual-devices-editor.ts` (117 lines) — delete
- `src/ui-editor/components/individual-row-editor.ts` (349 lines) — delete
- `src/ui-editor/schema/individual.ts` (95 lines) — delete
- `src/ui-editor/schema/_schema-all.ts` — remove individual schema import/export
- `src/ui-editor/types/config-page.ts` — remove individual page reference
- `src/ui-editor/ui-editor.ts` — remove individual tab/page
- `src/style.ts` — remove ~76 individual CSS lines
- `src/style/all.ts` — remove individual CSS property applications
- `src/type.ts` — remove `individual` from `EntityType`, `TemplatesObj`, `NewDur`
- `src/localize/languages/*.json` (17 files) — remove 3 keys each: `individual`, `subtract_individual`, `sort_individual_devices`
- `README.md` — remove lines 216, 298, 360

**Trade-offs:**

- Clean codebase: no dead schema, no misleading editor UI, no invisible math.
- Breaking: a major version bump is required; existing user configs referencing `individual` break silently or fail validation.
- Loss of community investment: 17-language translations, 561-line editor, config schema — all discarded.
- Irreversible without git history.

**Verification story:** Build passes, typecheck passes, tests green (no individual tests existed, so no losses). Manual check: configuring `individual` in YAML produces no effect and (ideally) a HA config validation warning.

---

### Option C — Minimal honesty now (documentation fix)

**Effort:** S (Small)
**Blast radius:** `README.md` only — 0 `src/` changes.
**What it does:** Updates the README to accurately describe the current state: `individual` config keys are accepted and the values are used in home-consumption arithmetic (`subtract_individual`), but individual-device circles are not currently rendered in the card. A note is added that rendering is tracked for a future redesign.

Suggested README changes:

- Line 216: Annotate `individual` array as "data only — circles not currently displayed"
- Line 298: Remove or annotate the "Customize individual arrows" bullet
- Line 360: Update the "Maximum 4 individual devices" note to reflect current limitation

**Trade-offs:**

- Zero risk to existing users or code.
- Stops misleading new users who read the README expecting visible circles.
- Does NOT fix the visual editor (users still see a full "Individual devices" section in the UI editor with no visible result).
- Does NOT fix the semantic oddity: `subtract_individual` still silently adjusts the home number.
- Technical debt remains — the half-removed feature stays half-removed.

**Verification story:** README updated, no build needed. Optionally add a `console.warn` in the `individualObjs` block noting the feature is in progress (1-line `src/` change, trivial).

---

## 4. Recommendation

**Lean: C now, then A-or-B explicitly decided.**

C is the appropriate immediate action because:

1. The inconsistency is currently user-facing: the visual editor presents a full individual-devices configurator with secondary info, colors, secondary spans, and tap actions. A user who configures it sees nothing render. This is confusing and should be corrected in documentation at minimum.

2. A (restore) requires a genuine design decision about where individual circles live in the new absolute-positioning layout — this is not a mechanical restore, it is a UX design question. Rushing it risks another half-baked result.

3. B (remove) is irreversible, drops 17-language translations, and is a breaking change requiring a major version. It should not be done without explicit community consultation, especially since `subtract_individual` may be used by current users even without visible circles (the home math still works).

4. C takes 30 minutes, stops misleading users, and preserves all options.

**After C:** The maintainer should decide A vs B based on the open questions below. If the feature is wanted, A should be a dedicated milestone with design mockups for the new layout before any code. If not wanted, B should accompany a major release with a deprecation notice in the prior minor.

---

## 5. Open Questions for the Maintainer

1. **Is the `individual` feature wanted long-term?** If yes → A. If no → B. This is the pivotal question; C is only a bridge.

2. **Do downstream users rely on `subtract_individual` for home math?** Even without visible circles, the arithmetic may be in production use. Removing it (Option B) is a behavior-breaking change, not just a UI change. Check issue tracker / discussions for `subtract_individual` mentions.

3. **What does the new layout look like with 1–4 individual circles?** The absolute-positioning system places circles at coordinates measured from the DOM. Where do 2, 3, or 4 individual circles go? Are they overlappable? Is there a grid arrangement, or should they go below/beside the home circle? This design question blocks Option A.

4. **Should the visual editor be guarded?** In the current state, the editor shows a full individual-devices UI that configures invisible things. A minimal honest fix beyond README is to either hide the editor section (flag it as "coming soon") or keep it but add a warning banner. Should this be part of the C scope?

5. **Does the legacy `individual1`/`individual2` backward-compat path** (line 102 in `power-flow-card-plus.ts`) affect the B decision? If upstream users from the original card had `individual1`/`individual2` keys in YAML and migrated to this fork, removing the migration shim is an additional breaking surface.

6. **Test coverage gap:** No tests exist for any individual-device behavior (state calc, flow-rate computation, home subtraction). Before Option A is implemented, these should be written against the current data pipeline to establish a baseline and catch regressions during the render integration.

---

## Appendix: Surface Area Count

| Category             | Files | Key refs                                                                                          |
| -------------------- | ----- | ------------------------------------------------------------------------------------------------- |
| Config types         | 2     | `individual?`, `subtract_individual?`, `sort_individual_devices?`                                 |
| Config schema        | 1     | 3 schema entries                                                                                  |
| Main card            | 1     | 9 references (data calc + render pass-throughs)                                                   |
| State helpers        | 3     | `getIndividualState`, `getIndividualSecondaryState`, `getIndividualObject`, `hasIndividualObject` |
| Position util        | 1     | 4 exported slot functions                                                                         |
| Visual editor        | 3     | 561 total lines                                                                                   |
| UI schema            | 1     | 95 lines                                                                                          |
| Type definitions     | 1     | 3 type members                                                                                    |
| Styles               | 2     | ~76 CSS lines in style.ts + style/all.ts                                                          |
| i18n                 | 17    | 3 keys each (51 key-value pairs)                                                                  |
| Components (alive)   | 2     | `home.ts`, `flows/index.ts` (receive individual, partially use it)                                |
| Components (deleted) | 2     | `individualElement.ts` (223 lines), `individualSecondarySpan.ts` (58 lines)                       |
| README               | 1     | 3 references (lines 216, 298, 360)                                                                |
