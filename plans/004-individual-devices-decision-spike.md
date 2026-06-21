# Plan 004 (SPIKE): Decide the fate of the half-removed "individual devices" feature

> **Executor instructions**: This is an INVESTIGATION/DECISION spike, not a code
> change. Do NOT modify any `src/**` file. Your deliverables are (1) a written
> analysis file under `plans/` and (2) a clear recommendation reported back to
> the operator. End at the decision point — the three options must be chosen by a
> human/maintainer, not by you. Follow STOP conditions.
>
> **Drift check (run first)**: `git diff --stat 7183fa9..HEAD -- src README.md`
> If the individual-related surface changed materially since this plan was
> written, note it in your analysis.

## Status

- **Priority**: P2
- **Effort**: S (investigation only)
- **Risk**: LOW (no source changes)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `7183fa9`, 2026-06-21

## Why this matters

The "individual devices" feature (up to 4 extra consumers, e.g. car charger,
heat pump) is **half-removed and currently misleading to users**. Commit
`b489111` ("refactor: remove orphaned individual-device rendering code") deleted
ONLY the visual rendering (`src/components/individualElement.ts` and
`src/components/spans/individualSecondarySpan.ts`). Everything else still
ships: the config schema, the visual editor for individual devices, the data
calculations, styles, translations in all 17 languages, and the README docs. So
today a user can configure individual devices and have them silently affect home
consumption (via `subtract_individual`) **but see no circle on the card**. This
is an inconsistent surface that will generate confusion and issues. The
maintainer needs to decide a direction; this spike gives them the facts and a
recommendation.

## Current state (the half-removed surface)

**Removed (rendering only), recoverable from git:**

- `src/components/individualElement.ts` — the per-device circle renderer.
- `src/components/spans/individualSecondarySpan.ts` — its secondary-info span.
- Recover for review with: `git show b489111^:src/components/individualElement.ts`
  and `git show b489111^:src/components/spans/individualSecondarySpan.ts`.
- These rendered with the PRE-fork layout. The card has since moved to an
  absolute-positioned + drag-to-reposition layout (`src/style.ts` `.circle-container`
  rules; drag handlers in `src/power-flow-card-plus.ts`). So restoring is not a
  pure `git revert` — the rendering must be adapted to the current layout.

**Still present and wired (the inconsistency):**

- Config types & schema: `src/power-flow-card-plus-config.ts`,
  `src/power-flow-card-plus-config-schema.ts` (the `individual` array).
- Visual editor: `src/ui-editor/components/individual-devices-editor.ts`,
  `src/ui-editor/components/individual-row-editor.ts`,
  `src/ui-editor/schema/individual.ts`, `src/ui-editor/schema/_schema-all.ts`,
  `src/ui-editor/ui-editor.ts`, `src/ui-editor/types/config-page.ts`.
- Data calc in `src/power-flow-card-plus.ts`:
  - line 429: `const individualObjs = entities.individual?.map(...)`
  - line 582: `totalIndividualConsumption`
  - lines 604/615: home consumption reduced by individuals when `subtract_individual`
  - line 671: individual flow rates; lines 715/729/777/785: passed to home/flows.
- Helpers/states/styles: `src/states/raw/individual/`,
  `src/utils/computeIndividualPosition.ts`, `src/utils/get-default-config.ts`,
  `src/style.ts`, `src/style/all.ts`, `src/type.ts`.
- Flows: `src/components/flows/index.ts`, `src/components/home.ts` reference individuals.
- i18n: `individual` strings in all 17 `src/localize/languages/*.json`.
- Docs: `README.md` lines 198, 216, 298, 360 advertise the feature
  ("Maximum 4 individual devices").

## Commands you will need

| Purpose                           | Command                                                 | Expected                  |
| --------------------------------- | ------------------------------------------------------- | ------------------------- |
| Recover removed renderer          | `git show b489111^:src/components/individualElement.ts` | prints the old file       |
| See the removal commit            | `git show b489111 --stat`                               | shows the 2 deleted files |
| Map current references            | `grep -rln "individual" src/ README.md`                 | the file list above       |
| Coverage of remaining editor code | `pnpm test:coverage` then read the `individual-*` rows  | percentages               |

## Scope

**In scope** (create ONE analysis file + report; no source changes):

- `plans/004-individual-devices-analysis.md` (create — your written findings & recommendation)
- `plans/README.md` (status update)

**Out of scope** (do NOT touch):

- Any `src/**` file. This spike produces a decision, not an implementation.
- `README.md` — do not edit yet; the doc fix depends on the chosen option.

## Steps

### Step 1: Confirm the inconsistency is real

Run the card mentally/with a test: configure an `individual` device and confirm
no circle renders. Evidence to gather:

- `grep -rn "individualElement\|individualSecondarySpan" src/` → confirm ZERO
  references remain (rendering truly gone).
- Confirm the data path is alive: `grep -n "individualObjs\|totalIndividualConsumption" src/power-flow-card-plus.ts` → present.

**Verify**: you can state in one sentence "individual devices are configurable
and affect home math but render no circle."

### Step 2: Review the removed renderer and assess restore cost

- Read the recovered `individualElement.ts` (via the git command above).
- Compare its layout assumptions to the current absolute/drag layout in
  `src/style.ts` (`.circle-container.individual-*` rules — check whether
  positioning CSS for individuals still exists) and `src/power-flow-card-plus.ts`
  drag handlers (the `circles` array in `_attachDragListeners`, ≈ line 820, does
  NOT currently include individual circles).
- Estimate restore effort in hours/days and list the concrete adaptation points
  (positioning, drag registration, flow-line wiring, tests).

**Verify**: you have a coarse effort estimate (S/M/L) for "restore + adapt".

### Step 3: Scope the three options

In your analysis file, document each option with effort and blast radius:

- **Option A — Restore & adapt rendering** (likely M–L): bring back the circle
  rendering, integrate with absolute layout + drag + flow lines, add tests.
  Blast radius: re-add 2 components + edits to `power-flow-card-plus.ts`,
  `flows/index.ts`, `style.ts`. Highest user value (feature works as documented).
- **Option B — Remove the feature cleanly** (likely M): delete the remaining
  surface (config schema entry, editor components, data calc, styles, README
  lines, and ideally the i18n keys). Blast radius: ~30 files (see Current state),
  but mechanical. Result: smaller, consistent card; `subtract_individual` and the
  whole `individual` config go away (BREAKING for anyone using it — note this).
- **Option C — Minimal honesty now, redesign later** (S): leave code as-is but
  update `README.md` to state individual-device _display_ is not currently
  rendered (data still feeds home accounting), and file/track a redesign. Lowest
  effort, removes the user-facing lie without deleting anything.

For each, note the verification story (can it be tested? does it touch the
power-allocation math Plan 001 covers?).

**Verify**: analysis file contains all three options with effort + blast radius + trade-offs.

### Step 4: Recommend and STOP

- Write a recommendation (the advisor's lean: **Option C as the immediate step**
  — cheap, stops misleading users — with **Option A or B as the deliberate
  follow-up** depending on whether the maintainer wants the feature). Make the
  recommendation honest, not prescriptive.
- List open questions for the maintainer (e.g. "Do downstream users rely on
  `subtract_individual`? Removing it is breaking.").
- **STOP and report** the recommendation + open questions to the operator. Do not
  implement any option.

**Verify**: `plans/004-individual-devices-analysis.md` exists; it ends with a
recommendation and explicit open questions; no `src/**` file changed (`git status`).

## Test plan

- None (spike, no code change). The analysis may _suggest_ the test plan that a
  follow-up implementation plan would need (e.g. "Option A requires render tests
  per Plan 001's pattern").

## Done criteria

ALL must hold:

- [ ] `plans/004-individual-devices-analysis.md` exists with: confirmed inconsistency, restore-cost estimate, three scoped options, a recommendation, and open questions.
- [ ] `git status` shows NO `src/**` or `README.md` changes — only files under `plans/`.
- [ ] The operator has been given the recommendation and the open questions.
- [ ] `plans/README.md` status row for 004 updated to DONE (spike complete) or BLOCKED (awaiting maintainer decision).

## STOP conditions

Stop and report back if:

- The drift check shows the individual surface was already changed/removed since
  `7183fa9` (someone may have acted on this) — re-scope the analysis to reality.
- You are tempted to implement Option A/B/C — that is a separate plan the
  maintainer must commission after choosing.

## Maintenance notes

- Whichever option is chosen becomes a NEW implementation plan (005+). Option A's
  plan must depend on Plan 001 (the rendering touches the math-adjacent flow
  wiring; characterization snapshots protect it). Option B's plan is mechanical
  deletion but BREAKING — it needs a deprecation note / major-version
  consideration given the repo auto-releases via semantic-release.
- Whoever picks this up should check open GitHub issues for user reports about
  individual devices not showing — that signal should weight the decision.
