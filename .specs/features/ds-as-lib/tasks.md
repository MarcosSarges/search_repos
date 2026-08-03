# DS as Lib — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/ds-as-lib/design.md`  
**Status**: Approved  

**Tools (locked):** `tlc-spec-driven` + código (Shell/Read/Write/Edit/Grep). **Sem** Maestro MCP nesta feature.
---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` (Expo v54), AD-006 (Jest + RNTL), AD-012/013/017/028, colocated `__tests__` under DS pieces, `package.json` (`test`, `lint`), `jest.config.ts`, `src/test/render.tsx`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Path aliases / Storybook glob / README | none | Build/config gate; imports resolve | `tsconfig.json`, `jest.config.ts`, `.rnstorybook/main.ts`, `README.md` | `pnpm lint` / typecheck via tests |
| `Brand` + `getTheme` / `primaryByBrand` | unit | DSLIB-04: primary by brand×mode; `AppTheme.brand`; no `DataSource` in theme | `packages/ds/theme/__tests__/getTheme.test.ts`, `packages/ds/tokens/__tests__/*` | `pnpm test -- packages/ds/theme` (or tokens) |
| `DsThemeProvider` | unit (RNTL) | Injected `theme` reaches styled consumers | `packages/ds/theme/__tests__/*` | `pnpm test -- packages/ds/theme` |
| Presentation theme bridge (`AppThemeProvider`, `mapDataSourceToBrand`, `useAppTheme`) | unit (RNTL) | DSLIB-05: hydrate gate; splash; `getTheme` via Brand map; store controls | `src/presentation/theme/__tests__/*` | `pnpm test -- src/presentation/theme` |
| `DataSourceLogo` (`brand`) | unit (RNTL) | DSLIB-06: brand×mode assets; no `@/application`; no free `style` | `packages/ds/organisms/DataSourceLogo/__tests__/*` | `pnpm test -- packages/ds/organisms/DataSourceLogo` |
| `resolveBoxSpacing` helper | unit | Precedence `p`→`px/py`→edge (and margin); tokens → px numbers | colocated under Container or `packages/ds/molecules/Container/__tests__/*` | scoped path in task |
| `Container` layout box | unit (RNTL) | DSLIB-07..10: shorthands, flexbox, safe edges, keyboardDismiss; no `style`/raw number; edge cases safe omit / dismiss omit | `packages/ds/molecules/Container/__tests__/*` | `pnpm test -- packages/ds/molecules/Container` |
| `KeyboardAvoid` | unit (RNTL) | DSLIB-11: mounts; default behavior map by platform; `offset` applied; composable with Container | `packages/ds/molecules/KeyboardAvoid/__tests__/*` | `pnpm test -- packages/ds/molecules/KeyboardAvoid` |
| Lib purity / consumer migration | unit (source grep / smoke) | DSLIB-01..03, 12: no `src/components/ds`; packages/ds has no `@/application`/`@/stores`/`@/presentation`; consumers use `@ds` | `packages/ds/__tests__/isolation.test.ts` (or presentation) + existing screen tests | `pnpm test -- packages/ds` (+ screens as needed) |
| Screen View→Container drop-in | unit (existing / update) | DSLIB-13: search list region uses Container; FlatList/Pressable untouched | `src/presentation/screens/**/__tests__/*` | `pnpm test -- src/presentation/screens` |
| Stories | none (catalog; not a test substitute) | Stories exist for Container + KeyboardAvoid per AD-012 | `packages/ds/**/*.stories.tsx` | Storybook manual / build gate |

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Single package/area unit tests | `pnpm test -- <scoped path from task>` |
| Full | After bridge / Container / migration | `pnpm test -- packages/ds src/presentation` (add `src/stores` / `src/test` when touched) |
| Build | Phase end / feature close | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Tooling + relocate

```
T1 → T2 → T3
```

### Phase 2: Pure theme + bridge + logo

```
T4 → T5 → T6 → T7
```

### Phase 3: Layout primitives

```
T8 → T9 → T10
```

### Phase 4: Consumers + docs close

```
T11 → T12
```

---

## Task Breakdown

### T1: Configure `@ds` path aliases + Storybook stories glob

**What**: Add TypeScript and Jest path mappings for `@ds` / `@ds/*` (and SVG mock for `@ds`), and point Storybook stories glob at `packages/ds`.  
**Where**: `tsconfig.json`, `jest.config.ts`, `.rnstorybook/main.ts`  
**Depends on**: None  
**Reuses**: Existing `@/` mapper + `svgMock.js` pattern  
**Requirement**: DSLIB-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `tsconfig` paths resolve `@ds` → `packages/ds` and `@ds/*` → `packages/ds/*`
- [x] Jest `moduleNameMapper` maps `@ds` / `@ds/*` / `@ds` SVGs (order: svg before general; before or alongside `@/`)
- [x] Storybook `stories` glob includes `../packages/ds/**/*.stories.?(ts|tsx|js|jsx)`
- [x] Gate: `pnpm lint` (config-only OK if paths not yet populated)

**Tests**: none  
**Gate**: build  
**Commit**: `chore(ds): add @ds path aliases and storybook glob`

---

### T2: Move DS tree and brand assets into `packages/ds`

**What**: Relocate `src/components/ds/**` → `packages/ds/**` and brand SVGs `src/assets/github|gitlab/**` → `packages/ds/assets/github|gitlab/**`; remove emptied old DS folder (no reexport shim).  
**Where**: `packages/ds/**`, `packages/ds/assets/**` (delete `src/components/ds`, brand dirs under `src/assets` if empty)  
**Depends on**: T1  
**Reuses**: Current Atomic folder shape (AD-009/012)  
**Requirement**: DSLIB-01, DSLIB-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `packages/ds` contains tokens, theme, atoms, molecules, organisms, `index.ts`
- [x] Brand SVGs live under `packages/ds/assets/...`
- [x] `src/components/ds` does not exist
- [x] No shim reexport left under `src/components`

**Tests**: none  
**Gate**: build  
**Commit**: `refactor(ds): move design system and brand assets to packages/ds`

---

### T3: Rewrite imports to `@ds` across app, tests, and Storybook

**What**: Replace all `@/components/ds` (and broken asset paths) with `@ds` / `@ds/...`; fix DS-internal imports that used `@/components/ds` or `@/assets/github|gitlab`.  
**Where**: `packages/ds/**`, `src/App.tsx`, `src/presentation/**`, `src/stores/**`, `src/test/**`, `.rnstorybook/preview.tsx`, any remaining greps  
**Depends on**: T2  
**Reuses**: Barrel `@ds` exports  
**Requirement**: DSLIB-01, DSLIB-12

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `rg "@/components/ds"` returns no matches
- [x] Logo/styles import SVGs from `packages/ds/assets` via relative or `@ds/assets/...` (only organism imports SVGs)
- [x] Quick gate: existing suites that still match old theme/API run or are listed for T4–T7 fixes — at minimum Jest resolves modules (`pnpm test -- packages/ds/theme/__tests__/getTheme.test.ts` or equivalent path)
- [x] Test count: no silent deletion of test files (move with sources)

**Tests**: unit (smoke resolve — existing getTheme/DS tests must load)  
**Gate**: quick  
**Commit**: `refactor(ds): switch consumers and internals to @ds imports`

---

### T4: Introduce `Brand`, `primaryByBrand`, and `getTheme(mode, brand)`

**What**: Replace application `DataSource` in lib theme/tokens with `Brand`; rename primary map; `AppTheme.brand`; update getTheme unit tests for brand×mode hexes.  
**Where**: `packages/ds/tokens/brand-primary.ts` (or `brand.ts`), `packages/ds/theme/theme.ts`, related token barrels/tests  
**Depends on**: T3  
**Reuses**: Existing hex values (AD-010)  
**Requirement**: DSLIB-02, DSLIB-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `type Brand = 'github' | 'gitlab'` exported from tokens/theme
- [x] `getTheme(mode, brand)` returns `AppTheme` with `brand` and correct `colors.primary`
- [x] No `@/application` import remains in these token/theme files
- [x] Gate: `pnpm test -- packages/ds/theme` (and tokens brand tests if present)
- [x] Test count: getTheme ACs covered (light/dark × github/gitlab primaries)

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): use Brand in getTheme instead of DataSource`

---

### T5: Add `DsThemeProvider` (theme prop only)

**What**: Implement lib `DsThemeProvider` that wraps styled-components `ThemeProvider` with a required `theme: AppTheme`; export from `@ds/theme`; unit test that consumers see injected theme.  
**Where**: `packages/ds/theme/DsThemeProvider.tsx`, `packages/ds/theme/index.ts`, `__tests__`  
**Depends on**: T4  
**Reuses**: Current `StyledThemeProvider` usage  
**Requirement**: DSLIB-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `DsThemeProvider({ theme, children })` implemented
- [x] No Zustand / splash / SecureStore in this file
- [x] Unit test asserts theme reaches `useTheme` / styled consumer
- [x] Gate: `pnpm test -- packages/ds/theme`
- [x] Test count: ≥1 new provider test + existing getTheme still pass

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add DsThemeProvider for injected AppTheme`

---

### T6: Move theme bridge to `src/presentation/theme`

**What**: Create `mapDataSourceToBrand`, presentation `AppThemeProvider` (hydrate/splash/token hydrate + `getTheme` + `DsThemeProvider`), and `useAppTheme`; remove store-coupled provider from `packages/ds`; rewire App, `src/test/render.tsx`, Storybook preview, nav/Config imports; migrate session-gate / AppThemeProvider tests under presentation.  
**Where**: `src/presentation/theme/**`, delete DS `AppThemeProvider.tsx`; update `packages/ds/theme` exports; consumers listed above; `src/stores` keeps `ThemeMode` from `@ds`  
**Depends on**: T5  
**Reuses**: Existing hydrate/splash effects verbatim  
**Requirement**: DSLIB-05, DSLIB-02, DSLIB-12

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `packages/ds` no longer exports `AppThemeProvider` / `useAppTheme`
- [x] Presentation bridge maps `DataSource` → `Brand` and passes `getTheme(mode, brand)` into `DsThemeProvider`
- [x] Session-gate + controls tests live under `src/presentation/theme/__tests__` and pass
- [x] `App.tsx` / render helper / Storybook use presentation `AppThemeProvider`
- [x] Gate: `pnpm test -- packages/ds/theme src/presentation/theme src/test`
- [x] Test count: prior session-gate + AppThemeProvider cases preserved (relocated)

**Tests**: unit  
**Gate**: full  
**Commit**: `refactor(theme): move AppThemeProvider bridge to presentation`

---

### T7: `DataSourceLogo` `brand` API + purify organism imports

**What**: Replace `dataSource` prop/context with `brand?: Brand` (fallback `theme.brand`); rewrite asset maps to `Brand`; ensure zero `@/application` in organism; update tests/stories/Config usage.  
**Where**: `packages/ds/organisms/DataSourceLogo/**`, ConfigScreen / stories call sites  
**Depends on**: T6  
**Reuses**: `logoComponentMap` / object maps (AD-013)  
**Requirement**: DSLIB-06, DSLIB-02, DSLIB-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Public prop is `brand` (no `dataSource` on logo props)
- [x] Organism does not import `@/application` or `useAppTheme`
- [x] Tests cover github/gitlab × light/dark assets + size
- [x] Gate: `pnpm test -- packages/ds/organisms/DataSourceLogo`
- [x] Test count: prior logo cases updated, not deleted

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): DataSourceLogo uses Brand instead of DataSource`

---

### T8: `resolveBoxSpacing` helper with precedence rules

**What**: Pure helper that resolves padding/margin/gap shorthands (`p`/`px`/`py`/edges, `m`/…) to numeric edges using `theme.spacing`, with CSS-like precedence (specific overrides).  
**Where**: `packages/ds/molecules/Container/resolveBoxSpacing.ts` (+ unit test file)  
**Depends on**: T7  
**Reuses**: `Spacing` token + object maps (AD-013)  
**Requirement**: DSLIB-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Helper exported for Container styles/composition
- [x] Unit tests: `p` alone; `p`+`pt` override; `px`/`py`; margins; omitted → 0; gap passthrough
- [x] Gate: `pnpm test -- packages/ds/molecules/Container`
- [x] Test count: precedence cases from design edge case covered

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add resolveBoxSpacing for Container shorthands`

---

### T9: Rewrite `Container` layout box (flex, safe, keyboardDismiss)

**What**: Implement Container public API from design (shorthands, `flex?: number`, direction/justify/align/wrap, `safe`, `keyboardDismiss`, `tone`); remove old `padding` / boolean `flex`; update stories, tests, and all Container call sites.  
**Where**: `packages/ds/molecules/Container/**`, grepped `<Container` call sites  
**Depends on**: T8  
**Reuses**: `resolveBoxSpacing`, Header safe-area pattern, `SurfaceTone`  
**Requirement**: DSLIB-07, DSLIB-08, DSLIB-09, DSLIB-10

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] API matches design; no public `style`; spacing values are `Spacing` only
- [x] `safe: true` / edge array / omit behaviors covered by tests (with `SafeAreaProvider` metrics)
- [x] `keyboardDismiss` true/false covered (Keyboard.dismiss invoked on press when true)
- [x] Flexbox props apply without boolean flex flag
- [x] Stories updated for new props
- [x] All call sites migrated off `padding` / `flex={true}`
- [x] Gate: `pnpm test -- packages/ds/molecules/Container`
- [x] Test count: AC-mapped cases for DSLIB-07..10 present

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): Container layout box with safe and keyboardDismiss`

---

### T10: Add `KeyboardAvoid` molecule

**What**: New molecule wrapping RN `KeyboardAvoidingView` with platform default behavior map (iOS `padding`, Android `height`), optional `offset`, `flex: 1` host, stories + unit tests; export from molecules barrel.  
**Where**: `packages/ds/molecules/KeyboardAvoid/**`, `packages/ds/molecules/index.ts`  
**Depends on**: T9 (composition story may nest Container)  
**Reuses**: AD-012 folder shape  
**Requirement**: DSLIB-11

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `KeyboardAvoid` exists with documented defaults + overridable `behavior` / `offset`
- [ ] Not a prop on Container
- [ ] Story shows composition with Container
- [ ] Unit tests: mounts; offset prop passed; default behavior map exists (object map, not switch)
- [ ] Gate: `pnpm test -- packages/ds/molecules/KeyboardAvoid`
- [ ] Test count: ≥2 cases (mount + offset/defaults)

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add KeyboardAvoid molecule`

---

### T11: Replace layout-only `View` in Search with `Container`

**What**: In `SearchReposScreen`, replace the list-region layout `View` with `Container` (preserve `testID`); leave `FlatList` / `RefreshControl` as RN primitives.  
**Where**: `src/presentation/screens/search/SearchReposScreen.tsx` (+ screen tests if they assert host)  
**Depends on**: T9  
**Reuses**: New Container API  
**Requirement**: DSLIB-13

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] No layout-only `View` remains in this screen for the list region
- [ ] `testID="search-repos-list-region"` preserved
- [ ] `FlatList` / `Pressable` (RepoListItem) unchanged as hosts
- [ ] Gate: `pnpm test -- src/presentation/screens`
- [ ] Test count: existing search screen tests still pass

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(search): use Container instead of layout View`

---

### T12: README + lib isolation gate + full green

**What**: Update README Design System section for `packages/ds`, `@ds`, presentation theme bridge; add/adjust isolation test grepping `packages/ds` for forbidden `@/application|@/stores|@/presentation|@/domain` imports; run full test+lint gate.  
**Where**: `README.md`, `packages/ds/__tests__/isolation.test.ts` (or equivalent), cleanup any leftover references  
**Depends on**: T7, T10, T11  
**Reuses**: Presentation isolation test pattern if present  
**Requirement**: DSLIB-02, DSLIB-14, DSLIB-12

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] README documents `packages/ds`, `@ds`, and presentation bridge
- [ ] Isolation test fails if lib imports app layers
- [ ] `rg "src/components/ds"` / `@/components/ds` clean
- [ ] Gate: `pnpm test` && `pnpm lint`
- [ ] Test count: full suite green; no silent test deletions

**Tests**: unit  
**Gate**: build  
**Commit**: `docs(ds): document packages/ds lib boundary and isolation tests`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2 ──→ T3
Phase 2:  T4 ──→ T5 ──→ T6 ──→ T7
Phase 3:  T8 ──→ T9 ──→ T10
Phase 4:  T11 ──→ T12
```

**Batch packing (Execute):** 12 tasks → ~2 workers  
- Batch 1: Phase 1 + Phase 2 (T1–T7, 7 tasks)  
- Batch 2: Phase 3 + Phase 4 (T8–T12, 5 tasks)

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Aliases + Storybook glob | config files | ✅ Granular |
| T2: Move tree + assets | cohesive relocate | ✅ OK (single concern) |
| T3: Rewrite imports | mechanical sweep | ✅ OK (one concern) |
| T4: Brand + getTheme | theme/tokens | ✅ Granular |
| T5: DsThemeProvider | 1 component | ✅ Granular |
| T6: Presentation bridge | cohesive module + rewires | ✅ OK (one boundary) |
| T7: DataSourceLogo brand | 1 organism | ✅ Granular |
| T8: resolveBoxSpacing | 1 helper | ✅ Granular |
| T9: Container rewrite | 1 molecule + call sites | ✅ OK (one API) |
| T10: KeyboardAvoid | 1 molecule | ✅ Granular |
| T11: Search View→Container | 1 screen | ✅ Granular |
| T12: README + isolation + full gate | docs + gate | ✅ OK (close-out) |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | (root) | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T5 | T5 → T6 | ✅ |
| T7 | T6 | T6 → T7 | ✅ |
| T8 | T7 | T7 → T8 | ✅ |
| T9 | T8 | T8 → T9 | ✅ |
| T10 | T9 | T9 → T10 | ✅ |
| T11 | T9 | Phase 4 after Phase 3; T11 only needs Container (T9) — ✅ (T10 not required) |
| T12 | T7, T10, T11 | Prior phases + T11 → T12 | ✅ |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | aliases / storybook config | none | none | ✅ |
| T2 | relocate files | none | none | ✅ |
| T3 | import paths (enables resolve) | unit smoke | unit | ✅ |
| T4 | Brand + getTheme | unit | unit | ✅ |
| T5 | DsThemeProvider | unit | unit | ✅ |
| T6 | presentation bridge | unit | unit | ✅ |
| T7 | DataSourceLogo | unit | unit | ✅ |
| T8 | resolveBoxSpacing | unit | unit | ✅ |
| T9 | Container | unit | unit | ✅ |
| T10 | KeyboardAvoid | unit | unit | ✅ |
| T11 | Search screen | unit | unit | ✅ |
| T12 | README + isolation | unit | unit | ✅ |

---

## Requirement Traceability (tasks)

| Requirement ID | Tasks |
| -------------- | ----- |
| DSLIB-01 | T1, T2, T3 |
| DSLIB-02 | T4, T6, T7, T12 |
| DSLIB-03 | T2, T7 |
| DSLIB-04 | T4, T5 |
| DSLIB-05 | T6 |
| DSLIB-06 | T7 |
| DSLIB-07 | T8, T9 |
| DSLIB-08 | T9 |
| DSLIB-09 | T9 |
| DSLIB-10 | T9 |
| DSLIB-11 | T10 |
| DSLIB-12 | T3, T6, T12 |
| DSLIB-13 | T11 |
| DSLIB-14 | T12 |

**Coverage:** 14 total, 14 mapped, 0 unmapped
