# DS Controls — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/ds-controls/design.md`  
**Status**: Approved — Execute with sub-agents (user 2026-07-31)

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` (@AD-006 Jest+RNTL), `README.md` (DS unit tests), `jest.config.ts`, AD-012/017, prior DS colocated `__tests__`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Control tokens (`button` / `input` / `card`) + theme wire | unit | Maps expose required keys; `getTheme()` includes `button`/`input`/`card`; no hardcoded brand hex in token chrome maps | `tokens/__tests__/*` and/or `theme/__tests__/*` | `pnpm test` |
| Button atom | unit | 1:1 to CTRL-01 ACs + edge cases (loading+disabled, loading hides slots) | `atoms/Button/__tests__/*.test.tsx` | `pnpm test` |
| Input atom | unit | 1:1 to CTRL-02 ACs + empty slots / state default\|error | `atoms/Input/__tests__/*.test.tsx` | `pnpm test` |
| InputField molecule | unit | 1:1 to CTRL-03 ACs + `error=""` edge | `molecules/InputField/__tests__/*.test.tsx` | `pnpm test` |
| Card molecule | unit | 1:1 to CTRL-04 ACs + subset regions / empty shell | `molecules/Card/__tests__/*.test.tsx` | `pnpm test` |
| README / barrel exports | none | Structure + docs; lint | — | `pnpm lint` |

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After unit-test tasks | `pnpm test` |
| Full / Build | After docs/barrels or phase end | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Tokens + theme

```
T1
```

### Phase 2: Atoms

```
T2 → T3
```

### Phase 3: Molecules

```
T4 → T5
```

### Phase 4: Docs + barrels

```
T6
```

---

## Task Breakdown

### T1: Control tokens + theme wire

**What**: Add `tokens/button.ts`, `tokens/input.ts`, `tokens/card.ts`; export from tokens barrel; expose `theme.button` / `theme.input` / `theme.card` via `getTheme` + `AppTheme` / `styled.d.ts`.  
**Where**: `src/components/ds/tokens/button.ts`, `input.ts`, `card.ts`, `tokens/index.ts`, `theme/theme.ts`, `theme/styled.d.ts`, token/theme `__tests__`  
**Depends on**: None  
**Reuses**: `tokens/loading.ts`, `icon.ts`, `tone.ts` patterns; `getTheme` in `theme/theme.ts`  
**Requirement**: CTRL-01, CTRL-02, CTRL-04 (token foundation)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `ButtonVariant` / `ButtonSize` maps include primary/outline/ghost + sm/md/lg metrics (`padding*`, `minHeight`, `loadingVariant`)
- [x] `InputState` map `default` \| `error` → color token keys; single-density layout tokens
- [x] Card chrome tokens (radius, border color token, surface) without importing Container
- [x] `getTheme()` returns `button`, `input`, `card`
- [x] Unit tests assert map keys + theme wiring
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add button input card tokens to theme`  
**Status**: Done

---

### T2: Button atom

**What**: Ship `atoms/Button` (AD-012 shape) with variants/sizes/loading/disabled/leading/trailing; stories + unit tests from CTRL-01 ACs.  
**Where**: `src/components/ds/atoms/Button/` (+ export in `atoms/index.ts`)  
**Depends on**: T1  
**Reuses**: `atoms/Loading`, `atoms/Typography`, `atoms/Icon` folder pattern, `theme.button`  
**Requirement**: CTRL-01

**Tools**:

- MCP: NONE (optional later: `user-maestro` only if visual UAT requested)
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Folder: `index.ts`, `Button.tsx`, `Button.stories.tsx`, `styles.tsx`, `__tests__`
- [x] `variant` primary uses `theme.colors.primary`; outline/ghost via object maps; no `switch` lookup; no public `style`
- [x] `loading` shows Loading (size map sm|md→sm, lg→lg), blocks press, keeps min size; hides leading/label/trailing
- [x] `disabled` blocks press; slots render when not loading
- [x] Exported from atoms barrel
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add Button atom`  
**Status**: Done

---

### T3: Input atom

**What**: Ship `atoms/Input` field chrome with leading/trailing + `state`; stories + unit tests from CTRL-02 ACs.  
**Where**: `src/components/ds/atoms/Input/` (+ `atoms/index.ts`)  
**Depends on**: T1  
**Reuses**: atom folder pattern; `theme.input`; RN TextInput via styled in `styles.tsx`  
**Requirement**: CTRL-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] AD-012 folder shape; no public `style`; object maps for state chrome
- [x] leading → field → trailing order; controlled value/onChangeText work
- [x] `state="error"` vs default border from tokens
- [x] Stories: default, slots, error
- [x] Exported from atoms barrel
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add Input atom`  
**Status**: Done

---

### T4: InputField molecule

**What**: Ship `molecules/InputField` composing Typography + Input with label/helper/error orchestration; stories + tests from CTRL-03.  
**Where**: `src/components/ds/molecules/InputField/` (+ `molecules/index.ts`)  
**Depends on**: T3  
**Reuses**: `atoms/Input`, `atoms/Typography`, `molecules/Header` composition style  
**Requirement**: CTRL-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Non-empty `error` shows error message (not helperText) and passes `state="error"` to Input
- [x] Empty `error` treated as no error; helperText may show
- [x] `leading`/`trailing`/value handlers forwarded to Input
- [x] No public `style`; AD-012 shape; exported from molecules barrel
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add InputField molecule`  
**Status**: Done

---

### T5: Card molecule (compound)

**What**: Ship compound `Card` + `Card.Header` / `Content` / `Footer` with own surface chrome; stories + tests from CTRL-04.  
**Where**: `src/components/ds/molecules/Card/` (+ `molecules/index.ts`)  
**Depends on**: T1  
**Reuses**: `theme.card`; compound `Object.assign` pattern from design; **not** Container  
**Requirement**: CTRL-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Root applies surface/radius/border from card tokens (no Container import)
- [x] Compound members render in header→content→footer order; subset regions OK; empty shell OK
- [x] No public `style`; AD-012 shape; typed static members
- [x] Story with all three regions; exported from molecules barrel
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add Card molecule`  
**Status**: Done

---

### T6: README Atomic table + export smoke

**What**: Update README Design System table for Button/Input atoms and InputField/Card molecules; ensure public DS barrel re-exports (via atoms/molecules barrels); lint clean.  
**Where**: `README.md`, verify `src/components/ds/index.ts` / barrels  
**Depends on**: T2, T3, T4, T5  
**Reuses**: Existing README Atomic table  
**Requirement**: CTRL-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] README lists Button + Input under atoms; InputField + Card under molecules; Badge/Avatar still deferred/absent
- [x] `@/components/ds` can import Button, Input, InputField, Card
- [x] Gate: `pnpm test` && `pnpm lint`

**Tests**: none  
**Gate**: full  
**Commit**: `docs(ds): document Button Input InputField Card in Atomic table`  
**Status**: Done

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1
Phase 2:  T2 ──→ T3
Phase 3:  T4 ──→ T5
Phase 4:  T6
```

**Note:** T5 depends only on T1 (not T4). Diagram shows phase order; T5 may start after T1 once Phase 2 is done if executing strictly by phase — within Phase 3, run T4 then T5. T3 is required before T4; T5 does not need T4.

Refined dependency-accurate map:

```
T1 ──→ T2
T1 ──→ T3 ──→ T4
T1 ──→ T5
T2 + T3 + T4 + T5 ──→ T6
```

Phases remain the execution grouping; do not start Phase 3 until Phase 2 completes (keeps worker packing simple). Total **6 tasks** → single batch (≤ ~8) → execute **inline** (no sub-agent offer required).

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Control tokens + theme | 3 cohesive token modules + theme wire | ✅ OK (same layer) |
| T2: Button atom | 1 component | ✅ Granular |
| T3: Input atom | 1 component | ✅ Granular |
| T4: InputField molecule | 1 component | ✅ Granular |
| T5: Card molecule | 1 component (compound) | ✅ Granular |
| T6: README + barrels | docs + verify exports | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | root | ✅ Match |
| T2 | T1 | T1→T2 | ✅ Match |
| T3 | T1 | T1→T3 | ✅ Match |
| T4 | T3 | T3→T4 | ✅ Match |
| T5 | T1 | T1→T5 | ✅ Match |
| T6 | T2, T3, T4, T5 | all→T6 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | --------------- | --------- | ------ |
| T1 | Control tokens + theme | unit | unit | ✅ OK |
| T2 | Button atom | unit | unit | ✅ OK |
| T3 | Input atom | unit | unit | ✅ OK |
| T4 | InputField molecule | unit | unit | ✅ OK |
| T5 | Card molecule | unit | unit | ✅ OK |
| T6 | README / barrels | none | none | ✅ OK |

---

## Tools question (before Execute)

For each task, which tools should I use?

**Available MCPs**: `user-maestro` (device UI flows — optional for visual UAT; not required for unit-gated DS work)

**Available Skills**: `tlc-spec-driven` (required), plus optional Cursor skills only if you want them (`clean-code-principles`, etc.)

Default if you say “go”: **tlc-spec-driven only**, Maestro only if you ask for device UAT after the last task.
