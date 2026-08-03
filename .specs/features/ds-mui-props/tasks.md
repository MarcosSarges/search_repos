# DS MUI Props — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/ds-mui-props/design.md`  
**Status**: Done — Verifier PASS (2026-08-03)

**Batch 1 results** (2026-08-03): T1 `54ba41f` · T2 `c2a4edc` · T3 `dd3bf9c` · T4 `afeb75a` · T5 `515ef4d` · T6 `5a7aa23` · T7 `e3bcf15` — 71 tests passed scoped. Deviation: early consumer bridges for husky (Typography/Icon/Button call sites partially migrated).

**Batch 2 results** (2026-08-03): T8 `696be46` · T9 `e602863` · T10 `a68d78c` · T11 `ce6eda1` · T12 `4f2fe84` · T13 `2e14173` — 277 passed (`packages/ds` + `src/presentation`). Deviation: screens `bg` in T8; T12 mostly PROP-08 regression test.

**Verifier**: FAIL → fix `5b737a8` → re-verify PASS `781c72e` (23/23 ACs, 426 tests, sensor 3/3). Report: `.specs/features/ds-mui-props/validation.md`

**Tools (locked):** `tlc-spec-driven` + `frontend-design` (stories/visual args) + código (Shell/Read/Write/Edit/Grep). **Sem** Maestro MCP. Branch: `feat/ds-as-lib`.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` (Expo v54), AD-006 (Jest + RNTL), AD-012/013, colocated `__tests__` under DS, `package.json` (`test`, `lint`), `jest.config.ts`, `src/test/render.tsx`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| ContentColor / SurfaceBg tokens | unit | PROP-01..03 types; no Tone/SurfaceTone/toneColorMap exports; values ⊆ ColorToken | `packages/ds/tokens/__tests__/content-color.test.ts`, `surface.test.ts` (replace `tone.test.ts`) | `pnpm test -- packages/ds/tokens` |
| Button / icon / loading / card tokens | unit | PROP-09..12,17..19 token shapes; ButtonVariant/Color/Width; loadingSize; IconSize; card.defaultBg | `packages/ds/tokens/__tests__/{button,icon,loading,card}.test.ts` | `pnpm test -- packages/ds/tokens` |
| Typography | unit (RNTL) | PROP-01..02,20: color tokens + default text; style accepted | `packages/ds/atoms/Typography/__tests__/*` | `pnpm test -- packages/ds/atoms/Typography` |
| Icon | unit (RNTL) | PROP-01..02,17,20: color + size (not variant); style | `packages/ds/atoms/Icon/__tests__/*` | `pnpm test -- packages/ds/atoms/Icon` |
| Loading | unit (RNTL) | PROP-18,20: size not variant; style | `packages/ds/atoms/Loading/__tests__/*` | `pnpm test -- packages/ds/atoms/Loading` |
| Button | unit (RNTL) | PROP-09..16,20: variant×color smoke; size; width full/hug; defaults; no legacy variants; Loading size | `packages/ds/atoms/Button/__tests__/*` | `pnpm test -- packages/ds/atoms/Button` |
| Container | unit (RNTL) | PROP-04..05,20: bg surface/background; omit bg → no fill; style | `packages/ds/molecules/Container/__tests__/*` | `pnpm test -- packages/ds/molecules/Container` |
| Card | unit (RNTL) | PROP-06,20: default surface; explicit bg override; style | `packages/ds/molecules/Card/__tests__/*` | `pnpm test -- packages/ds/molecules/Card` |
| Input / InputField | unit (RNTL) | PROP-07,20: helper muted / error danger via color; style passthrough | `packages/ds/atoms/Input/__tests__/*`, `packages/ds/molecules/InputField/__tests__/*` | scoped paths |
| Header / Spacer / KeyboardAvoid / Logo | unit (RNTL) | PROP-19..20: style accepted (Logo size unchanged) | colocated `__tests__` | scoped paths |
| App consumers | unit / grep gate | PROP-08: zero `tone=` / Tone imports in presentation + ds public API | `src/presentation/**`, `packages/ds/**` | `pnpm test -- src/presentation packages/ds` |
| README / STATE | none | PROP-22..23: docs + AD-028; build/lint gate | `README.md`, `.specs/STATE.md` | `pnpm lint` |
| Stories | none (catalog) | Args use new props; not a test substitute | `packages/ds/**/*.stories.tsx` | Storybook manual |

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Single area after a task | `pnpm test -- <scoped path from task>` |
| Full | After molecules / consumers | `pnpm test -- packages/ds src/presentation` |
| Build | Phase end / feature close | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Tokens

```
T1 → T2 → T3
```

### Phase 2: Content + scale atoms

```
T4 → T5 → T6
```

### Phase 3: Button

```
T7
```

### Phase 4: Surfaces + forms

```
T8 → T9 → T10
```

### Phase 5: Remaining style + consumers + docs

```
T11 → T12 → T13
```

**Batch packing (Execute):** ~13 tasks → 2 batches  
- Batch 1: Phases 1–3 (T1–T7, 7 tasks)  
- Batch 2: Phases 4–5 (T8–T13, 6 tasks)

---

## Task Breakdown

### T1: Replace `tone` tokens with `ContentColor` + `SurfaceBg`

**What**: Add `content-color.ts` + `surface.ts`; remove `tone.ts` and public `Tone`/`SurfaceTone`/`toneColorMap`; update tokens barrel; replace `tone.test.ts`.  
**Where**: `packages/ds/tokens/content-color.ts`, `surface.ts`, `index.ts`; delete `tone.ts`  
**Depends on**: None  
**Reuses**: `ColorToken` from `colors.ts`  
**Requirement**: PROP-01, PROP-02, PROP-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `ContentColor` = `text` \| `muted` \| `primary` \| `danger`
- [ ] `SurfaceBg` = `background` \| `surface`
- [ ] Barrel exports new types; no `Tone` / `SurfaceTone` / `toneColorMap`
- [ ] Token unit tests cover unions / exports
- [ ] Gate: `pnpm test -- packages/ds/tokens/__tests__/content-color packages/ds/tokens/__tests__/surface` (or renamed files)

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): replace tone tokens with content color and surface bg`

---

### T2: Button token API (`variant` × `color` × `width` + `loadingSize`)

**What**: Rewrite `button.ts` types/records for MUI-like variants/colors/width; rename `loadingVariant` → `loadingSize`; update `button.test.ts`.  
**Where**: `packages/ds/tokens/button.ts`, `packages/ds/tokens/__tests__/button.test.ts`  
**Depends on**: T1  
**Reuses**: existing size metrics in `button` record; type `loadingSize` as `keyof typeof loading` or `'sm' \| 'lg'` (T3 renames the public alias later)  
**Requirement**: PROP-09, PROP-10, PROP-11, PROP-12, PROP-15, PROP-16

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `ButtonVariant` = contained \| outlined \| text
- [ ] `ButtonColor` = primary \| success \| warning \| danger
- [ ] `ButtonWidth` = hug \| full
- [ ] Size tokens keep sm/md/lg; field `loadingSize` (not `loadingVariant`)
- [ ] No public legacy variants primary/outline/ghost
- [ ] `pnpm test -- packages/ds/tokens/__tests__/button.test.ts` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): button tokens for variant color and width`

---

### T3: Rename Icon/Loading size types + `card.defaultBg`

**What**: Export `IconSize` / `LoadingSize`; remove `IconVariant` / `LoadingVariant` from public barrel; `card.defaultBg` replaces `surfaceTone`; update token tests.  
**Where**: `packages/ds/tokens/icon.ts`, `loading.ts`, `card.ts`, related `__tests__`, `index.ts`  
**Depends on**: T1  
**Reuses**: existing icon/loading/card value maps  
**Requirement**: PROP-06, PROP-17, PROP-18, PROP-19

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Public types are `IconSize` / `LoadingSize`
- [ ] `card.defaultBg === 'surface'`; no `surfaceTone`
- [ ] Token tests updated and green: `pnpm test -- packages/ds/tokens/__tests__/icon packages/ds/tokens/__tests__/loading packages/ds/tokens/__tests__/card`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): icon loading size types and card defaultBg`

---

### T4: Typography `color` + `style` passthrough

**What**: Replace `tone` with `color?: ContentColor` (default `text`); accept/forward `style`; update styles, tests, stories.  
**Where**: `packages/ds/atoms/Typography/**`  
**Depends on**: T1  
**Reuses**: typography tokens AD-014  
**Requirement**: PROP-01, PROP-02, PROP-20, PROP-21

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] No `tone` on Typography API
- [ ] Default color → `theme.colors.text`
- [ ] `style` in public props and forwarded
- [ ] Tests + stories updated; `pnpm test -- packages/ds/atoms/Typography` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): Typography color prop and style passthrough`

---

### T5: Icon `size` + `color` + `style`

**What**: Replace Icon `variant`/`tone` with `size`/`color`; forward `style`; update styles, tests, stories.  
**Where**: `packages/ds/atoms/Icon/**`  
**Depends on**: T1, T3  
**Reuses**: icon token sizes; Ionicons attrs pattern  
**Requirement**: PROP-01, PROP-02, PROP-17, PROP-20

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Public API: `size?: IconSize`, `color?: ContentColor` — no size-via-`variant`
- [ ] Tests assert primary/muted colors + size; stories updated
- [ ] `pnpm test -- packages/ds/atoms/Icon` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): Icon size and color props`

---

### T6: Loading `size` + `style`

**What**: Replace Loading `variant` with `size`; forward `style`; update styles, tests, stories; fix any internal refs.  
**Where**: `packages/ds/atoms/Loading/**`  
**Depends on**: T3  
**Reuses**: loading token map  
**Requirement**: PROP-18, PROP-20

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Public `size?: LoadingSize`; no public scale `variant`
- [ ] `pnpm test -- packages/ds/atoms/Loading` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): Loading size prop`

---

### T7: Button `variant` × `color` × `size` × `width` + style

**What**: Implement chrome maps, width hug/full, wire Loading `size`, accept `style`; update Button tests/stories.  
**Where**: `packages/ds/atoms/Button/**`  
**Depends on**: T2, T6  
**Reuses**: design.md chromeByVariant; Pressable host atual  
**Requirement**: PROP-09..16, PROP-20, PROP-21

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Defaults: contained + primary + full width
- [ ] Tests: contained/outlined/text; at least one non-primary color; size sm/md/lg; width hug vs full; no legacy variant strings
- [ ] Loading uses `size` from button token
- [ ] `pnpm test -- packages/ds/atoms/Button` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): Button MUI-like variant color size and width`

---

### T8: Container `bg` without default fill + `style`

**What**: Replace `tone` with optional `bg?: SurfaceBg`; no implicit background; forward `style`; update tests/stories.  
**Where**: `packages/ds/molecules/Container/**`  
**Depends on**: T1  
**Reuses**: layout box API existente  
**Requirement**: PROP-04, PROP-05, PROP-20

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `bg="surface"|"background"` applies token fill
- [ ] Omit `bg` → no `background-color` from theme fill
- [ ] Tests + stories; `pnpm test -- packages/ds/molecules/Container` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): Container bg prop without default fill`

---

### T9: Card `bg` API + `style`

**What**: Add `bg?: SurfaceBg` (default via `card.defaultBg`); forward `style` on root; update tests/stories.  
**Where**: `packages/ds/molecules/Card/**`, consume `card.defaultBg`  
**Depends on**: T3  
**Reuses**: card chrome tokens  
**Requirement**: PROP-06, PROP-20

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Omit `bg` → surface fill; explicit `bg` overrides
- [ ] `pnpm test -- packages/ds/molecules/Card` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): Card bg prop aligned with surface API`

---

### T10: Input + InputField `style` + message `color`

**What**: Stop omitting `style` on Input/InputField; InputField captions use Typography `color` muted/danger; update tests/stories.  
**Where**: `packages/ds/atoms/Input/**`, `packages/ds/molecules/InputField/**`  
**Depends on**: T4  
**Reuses**: Input state map existente  
**Requirement**: PROP-07, PROP-20

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Helper → `color="muted"`; error → `color="danger"`
- [ ] `style` accepted/forwarded on both
- [ ] `pnpm test -- packages/ds/atoms/Input packages/ds/molecules/InputField` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): InputField message colors and style passthrough`

---

### T11: Style passthrough on remaining DS exports

**What**: Accept/forward `style` on Header, Spacer, KeyboardAvoid, DataSourceLogo (and any other public export still stripping `style`); update tests if needed; grep gate.  
**Where**: `packages/ds/molecules/Header/**`, `atoms/Spacer/**`, `molecules/KeyboardAvoid/**`, `organisms/DataSourceLogo/**`  
**Depends on**: T4 (pattern established); can run after T10  
**Reuses**: styled composition  
**Requirement**: PROP-19, PROP-20, PROP-21

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Grep: no public props `Omit<…, 'style'>` under `packages/ds` atoms/molecules/organisms
- [ ] No `sx` prop introduced
- [ ] Scoped tests still pass for touched pieces
- [ ] Gate: `pnpm test -- packages/ds/molecules/Header packages/ds/atoms/Spacer packages/ds/molecules/KeyboardAvoid packages/ds/organisms/DataSourceLogo`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): forward style on remaining public components`

---

### T12: Big-bang migrate app + DS story leftovers

**What**: Update all presentation/nav call sites and any remaining stories from `tone` / Icon `variant` / Button legacy variants / Container `tone` to new props (`bg="background"` where screens need fill).  
**Where**: `src/presentation/**`, remaining `packages/ds/**/*.stories.tsx` if any  
**Depends on**: T5, T7, T8, T9, T10, T11  
**Reuses**: design migration map  
**Requirement**: PROP-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Grep `tone=` / `\bTone\b` / `SurfaceTone` / `toneColorMap` → zero in `packages/ds` + `src/presentation`
- [ ] `pnpm test -- packages/ds src/presentation` passes
- [ ] Full gate preferred: `pnpm test -- packages/ds src/presentation`

**Tests**: unit  
**Gate**: full  
**Commit**: `refactor(app): migrate screens to ds color bg and size props`

---

### T13: README + STATE AD-028

**What**: Document props axes + motivation; supersede AD-016 and tone/variant-size/`Omit style` parts of AD-017 with AD-028; fix README DS table that still cites `tone`.  
**Where**: `README.md`, `.specs/STATE.md`  
**Depends on**: T12  
**Reuses**: design Tech Decisions AD-028 text  
**Requirement**: PROP-22, PROP-23

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] README explains `color` / `bg` / `variant`×palette / `size` / `width` / `style` (no `sx`); motivation stated; big-bang noted
- [ ] AD-028 active; AD-016 superseded by AD-028; AD-017 superseded or amended as designed
- [ ] `pnpm lint` passes (build gate docs-only)

**Tests**: none  
**Gate**: build (`pnpm lint`; run `pnpm test` if time — recommended feature close)  
**Commit**: `docs: AD-028 MUI-like ds props and README update`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Phase 1:  T1 ──→ T2 ──→ T3
Phase 2:  T4 ──→ T5 ──→ T6
Phase 3:  T7
Phase 4:  T8 ──→ T9 ──→ T10
Phase 5:  T11 ──→ T12 ──→ T13
```

**Dependency notes (cross-phase):**

- T5 → T1, T3  
- T6 → T3  
- T7 → T2, T6  
- T8 → T1  
- T9 → T3  
- T10 → T4  
- T11 → T10 (pattern; listed Depends on T10)  
- T12 → T5, T7, T8, T9, T10, T11  
- T13 → T12  

Within-phase diagram shows linear order for the worker; cross-phase `Depends on` in task bodies is authoritative for readiness.

Execution is sequential within a batch. Offer sub-agents when Execute starts (2 batches).

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: content-color + surface tokens | 1 cohesive token replace | ✅ |
| T2: button tokens | 1 module | ✅ |
| T3: icon/loading/card type renames | 3 tiny related token files | ⚠️ OK cohesive |
| T4–T7: one atom each | 1 component | ✅ |
| T8–T9: one molecule each | 1 component | ✅ |
| T10: Input + InputField | 2 related form pieces | ⚠️ OK cohesive |
| T11: remaining style passthrough | multi-file same concern + grep gate | ⚠️ OK cohesive |
| T12: consumer migration | multi-file same concern | ⚠️ OK cohesive (like ds-as-lib) |
| T13: docs | README + STATE | ⚠️ OK cohesive |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram / plan | Status |
| ---- | ----------------- | -------------- | ------ |
| T1 | None | Phase1 start | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T1 | T1 → T2 → T3 (T3 after T1; ordered after T2 for worker simplicity — **body says T1 only**) | ✅ Match body; T2∤block T3 |
| T4 | T1 | Phase2 after Phase1 | ✅ |
| T5 | T1, T3 | Needs T3 complete before T5 | ✅ (worker: T3 before T5 via phase order) |
| T6 | T3 | ✅ | ✅ |
| T7 | T2, T6 | Phase3 after T6 | ✅ |
| T8 | T1 | ✅ | ✅ |
| T9 | T3 | ✅ | ✅ |
| T10 | T4 | ✅ | ✅ |
| T11 | T10 | T10 → T11 | ✅ |
| T12 | T5,T7,T8,T9,T10,T11 | After phase 4–5 precursors | ✅ |
| T13 | T12 | T12 → T13 | ✅ |

**Phase 1 order note:** Body allows T3 ∥ T2 after T1; plan runs T1→T2→T3 so T2 lands before T3. T2 must not import `LoadingSize` by name until T3 — use `keyof typeof loading` or literal `'sm'\|'lg'` in T2 (design already allows). ✅

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | --------------- | --------- | ------ |
| T1 | Content/Surface tokens | unit | unit | ✅ |
| T2 | Button tokens | unit | unit | ✅ |
| T3 | icon/loading/card tokens | unit | unit | ✅ |
| T4 | Typography | unit | unit | ✅ |
| T5 | Icon | unit | unit | ✅ |
| T6 | Loading | unit | unit | ✅ |
| T7 | Button | unit | unit | ✅ |
| T8 | Container | unit | unit | ✅ |
| T9 | Card | unit | unit | ✅ |
| T10 | Input/InputField | unit | unit | ✅ |
| T11 | Header/Spacer/KeyboardAvoid/Logo | unit | unit | ✅ |
| T12 | App consumers | unit/grep | unit | ✅ |
| T13 | README/STATE | none | none | ✅ |

---

## Requirement Traceability (tasks)

| ID | Tasks |
| -- | ----- |
| PROP-01..03 | T1, T4, T5 |
| PROP-04..05 | T8 |
| PROP-06 | T3, T9 |
| PROP-07 | T10 |
| PROP-08 | T12 |
| PROP-09..16 | T2, T6, T7 |
| PROP-17..19 | T3, T5, T6, T11 |
| PROP-20..21 | T4–T11 |
| PROP-22..23 | T13 |

**Coverage:** 23 requirements mapped; 0 unmapped.

---

**Status:** Done — Verifier PASS (2026-08-03).
