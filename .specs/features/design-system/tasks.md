# Design System Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/design-system/design.md`  
**Status**: Complete (Batch 2 T9–T13)

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines found: `AGENTS.md` (Expo SDK 54 docs), `README.md` (Jest + RNTL for DS/use cases), `jest.config.ts` (jest-expo, `@/` mapper). No coverage thresholds in config — **all DS components require unit tests** (Jest + RNTL), not stories-only.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Theme / `getTheme` / primary brand map | unit | 1:1 to DS-02 hex ACs (4 primaries) + default `github` when unset; mode non-primary tokens unchanged | `src/components/ds/theme/__tests__/*.test.ts` | `pnpm test` |
| Atom Typography | unit | Renders variants/sizes/tones under provider; public props exclude `style`; primary tone follows theme primary | `src/components/ds/atoms/Typography/__tests__/*.test.tsx` | `pnpm test` |
| Atom Icon | unit | Renders with name/size/tone; maps to tokens; no public `style` | `src/components/ds/atoms/Icon/__tests__/*.test.tsx` | `pnpm test` |
| Atom Spacer | unit | Required edge + spacing token applied; invalid/missing edge rejected | `src/components/ds/atoms/Spacer/__tests__/*.test.tsx` | `pnpm test` |
| Atom Loading | unit | Uses `theme.colors.primary` (not hardcoded); visible under light/dark provider | `src/components/ds/atoms/Loading/__tests__/*.test.tsx` | `pnpm test` |
| Organism DataSourceLogo | unit | Asset selection: github light/dark Invertocat; gitlab asset; size token; no public `style` | `src/components/ds/organisms/DataSourceLogo/__tests__/*.test.tsx` | `pnpm test` |
| Molecule Container | unit | Padding via spacing tokens; surface/background tone; no public `style` | `src/components/ds/molecules/Container/__tests__/*.test.tsx` | `pnpm test` |
| Molecule Header | unit | Renders title; uses `DataSourceLogo` (Header file must not import brand SVGs); trailing slot optional | `src/components/ds/molecules/Header/__tests__/*.test.tsx` | `pnpm test` |
| Metro / SVG types / README / Storybook preview | none | — (build/lint + manual Storybook smoke) | — | `pnpm lint` / Storybook |

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit/component tests | `pnpm test` |
| Full | After Storybook/metro/docs tasks | `pnpm test` && `pnpm lint` |
| Build | After phase completion | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Foundation

```
T1 → T2 → T3 → T4
```

### Phase 2: Atoms

```
T5 → T6 → T7 → T8
```

### Phase 3: Organism + Molecules

```
T9 → T10 → T11
```

### Phase 4: Storybook + Docs

```
T12 → T13
```

---

## Task Breakdown

### T1: Brand primary map tokens

**What**: Add `primaryByDataSource` map (GitHub/GitLab × light/dark hexes) and wire it for theme consumption.  
**Where**: `src/components/ds/tokens/colors.ts` (and/or `brand-primary.ts` + barrel)  
**Depends on**: None  
**Reuses**: Existing `colors.light|dark` structure  
**Requirement**: DS-02, DS-01

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] Map exports exact hexes: GH light `#0FBF3E`, GH dark `#5FED83`, GL light `#FC6D26`, GL dark `#FCA326`
- [x] Non-primary mode palettes remain available
- [x] Types exported from tokens barrel

**Tests**: none (pure config — covered by T2 theme tests)  
**Gate**: build (`pnpm lint` if touched exports break)  
**Commit**: `feat(ds): add brand primary map by data source`

---

### T2: Theme resolves primary by mode + dataSource

**What**: Extend `getTheme(mode, dataSource)` and `AppThemeProvider` with `dataSource` / `setDataSource`; default `github`.  
**Where**: `src/components/ds/theme/theme.ts`, `AppThemeProvider.tsx`, barrels  
**Depends on**: T1  
**Reuses**: Current provider + `useAppTheme` pattern  
**Requirement**: DS-02

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] `getTheme` sets `colors.primary` from brand map; other colors from mode only
- [x] `useAppTheme` exposes `dataSource`, `setDataSource`, mode APIs
- [x] Default dataSource is `github`
- [x] Unit tests assert all 4 primary hex ACs + default
- [x] Gate: `pnpm test` — theme tests pass (count ≥ 5)

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): resolve theme primary from data source`

---

### T3: Metro SVG transformer + TypeScript SVG module

**What**: Add `react-native-svg-transformer`, compose Metro with Storybook wrapper, add `*.svg` typings.  
**Where**: `metro.config.js`, `package.json`, e.g. `svg.d.ts` / `expo-env` adjacent  
**Depends on**: None (parallel-safe after T1 conceptually; ordered before logo)  
**Reuses**: Existing `withStorybook` + `react-native-svg`  
**Requirement**: DS-10

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven` (read Expo SDK 54 docs per AGENTS.md)

**Done when**:
- [x] SVG transformer applied on Expo config **before** `withStorybook`
- [x] `svg` in `sourceExts`, removed from `assetExts`
- [x] TypeScript allows `import Logo from '...svg'`
- [x] Dependency installed via pnpm
- [x] Gate: `pnpm lint` passes

**Tests**: none  
**Gate**: full  
**Commit**: `chore(metro): enable SVG imports for brand logos`

---

### T4: Atomic Design folder scaffolding

**What**: Create `atoms/`, `molecules/`, `organisms/` under `ds/`; relocate `theme/` + `tokens/`; update public barrel; leave atoms as placeholders until later tasks.  
**Where**: `src/components/ds/**`, `App.tsx` imports if paths break  
**Depends on**: T2  
**Reuses**: Existing theme/tokens files  
**Requirement**: DS-01, DS-11

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] Folders `tokens`, `theme`, `atoms`, `molecules`, `organisms` exist
- [x] App still boots theme provider (import paths fixed)
- [x] Old `components/Text` path either moved or re-exported temporarily without dual sources of truth long-term
- [x] Gate: `pnpm test` && `pnpm lint`

**Tests**: none  
**Gate**: full  
**Commit**: `refactor(ds): scaffold Atomic Design folders`

---

### T5: Typography atom

**What**: Migrate/rename `Text` → `Typography` under `atoms/Typography` with controlled props + Storybook stories.  
**Where**: `src/components/ds/atoms/Typography/`  
**Depends on**: T4  
**Reuses**: Current `Text.tsx` / stories  
**Requirement**: DS-03, DS-09

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] Public API: `variant`, `size`, `tone` — no public `style`
- [x] Stories under `DS/Atoms/Typography`
- [x] Unit tests (Jest + RNTL) for variants/tones + no public `style`
- [x] Barrel exports `Typography`
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add Typography atom`

---

### T6: Icon atom

**What**: Typed Icon wrapper over `@expo/vector-icons` with `name`, `size`, `tone`.  
**Where**: `src/components/ds/atoms/Icon/`  
**Depends on**: T4  
**Reuses**: Expo vector icons  
**Requirement**: DS-04, DS-09

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] Maps size/tone to tokens
- [x] No public `style`
- [x] Stories `DS/Atoms/Icon`
- [x] Unit tests (Jest + RNTL) for size/tone mapping + no public `style`
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add Icon atom`

---

### T7: Spacer atom

**What**: Spacer with exactly one edge (`top|bottom|left|right`) + spacing token.  
**Where**: `src/components/ds/atoms/Spacer/`  
**Depends on**: T4  
**Reuses**: `theme.spacing`  
**Requirement**: DS-05, DS-09

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] Type-level or runtime guard requires explicit edge
- [x] Uses `theme.spacing` values
- [x] Unit tests cover edge + token
- [x] Stories `DS/Atoms/Spacer`
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add Spacer atom`

---

### T8: Loading atom

**What**: Loading indicator using theme primary color.  
**Where**: `src/components/ds/atoms/Loading/`  
**Depends on**: T4, T2  
**Reuses**: RN `ActivityIndicator`  
**Requirement**: DS-06, DS-09

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] Color from `theme.colors.primary` (not hardcoded)
- [x] Stories `DS/Atoms/Loading`
- [x] Unit tests assert indicator uses theme primary (not hardcoded)
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add Loading atom`

---

### T9: DataSourceLogo organism

**What**: Brand logo organism selecting GitHub/GitLab SVG by dataSource + mode; only module allowed to import brand SVGs.  
**Where**: `src/components/ds/organisms/DataSourceLogo/`  
**Depends on**: T3, T4, T2  
**Reuses**: `src/assets/github/*`, `src/assets/gitlab/*`  
**Requirement**: DS-10, DS-11

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] github+light → black Invertocat; github+dark → white Invertocat
- [x] gitlab → asset from `src/assets/gitlab/`
- [x] Size via controlled token props; no public `style`
- [x] Unit tests cover selection matrix (github×mode + gitlab)
- [x] Stories `DS/Organisms/DataSourceLogo`
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add DataSourceLogo organism`

---

### T10: Container molecule

**What**: Layout container with tokenized padding (+ optional surface tone).  
**Where**: `src/components/ds/molecules/Container/`  
**Depends on**: T4  
**Reuses**: theme spacing/colors  
**Requirement**: DS-07, DS-09

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] Padding via spacing tokens; no public `style`
- [x] Stories `DS/Molecules/Container`
- [x] Unit tests for padding token application
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add Container molecule`

---

### T11: Header molecule

**What**: Header with title + `DataSourceLogo` from context + optional trailing slot.  
**Where**: `src/components/ds/molecules/Header/`  
**Depends on**: T5, T9, T10  
**Reuses**: Typography, DataSourceLogo  
**Requirement**: DS-08, DS-09

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] Uses `DataSourceLogo` (no direct SVG import)
- [x] Trailing slot optional
- [x] Stories `DS/Molecules/Header`
- [x] Unit tests: title + DataSourceLogo present; Header source has no brand SVG import
- [x] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add Header molecule`

---

### T12: Storybook globals for themeMode + dataSource

**What**: Preview decorator/controls so all DS stories switch light/dark and github/gitlab without code edits.  
**Where**: `.rnstorybook/preview.tsx` (+ addon config if needed)  
**Depends on**: T2, T5–T11 (catalog exists; can land after T2 minimally but done after components)  
**Reuses**: `AppThemeProvider`  
**Requirement**: DS-09

**Tools**:
- MCP: `user-maestro` optional later — not required
- Skill: `tlc-spec-driven`

**Done when**:
- [x] Globals/controls for `themeMode` and `dataSource` wired into provider
- [x] DS stories listed for Typography, Icon, Spacer, Loading, Container, Header, DataSourceLogo
- [x] Gate: `pnpm lint`

**Tests**: none  
**Gate**: full  
**Commit**: `feat(storybook): add theme and data-source globals`

---

### T13: README Atomic Design + Storybook catalog cleanup

**What**: Document Atomic Design (incl. brand logos as organisms) in README; remove or quarantine `.rnstorybook/stories` template demos so DS catalog is primary.  
**Where**: `README.md`, `.rnstorybook/stories/**`, `src/components/ds/index.ts` public API polish  
**Depends on**: T4, T9, T12  
**Reuses**: Existing README Design System section  
**Requirement**: DS-01, DS-09, DS-11

**Tools**:
- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:
- [x] README documents tokens/atoms/molecules/organisms + logo rationale
- [x] Template demos removed or clearly separated from DS
- [x] Barrel exports only Atomic public API
- [x] Gate: `pnpm test` && `pnpm lint`

**Tests**: none  
**Gate**: build  
**Commit**: `docs(ds): document Atomic Design and clean Storybook catalog`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2 ──→ T3 ──→ T4
Phase 2:  T5 ──→ T6 ──→ T7 ──→ T8
Phase 3:  T9 ──→ T10 ──→ T11
Phase 4:  T12 ──→ T13
```

**Batch packing (Execute):** 13 tasks → 2 batches  
- Batch 1: Phase 1 + Phase 2 (T1–T8, 8 tasks)  
- Batch 2: Phase 3 + Phase 4 (T9–T13, 5 tasks)  

Offer sub-agents at Execute ( > ~8 tasks across batches).

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 Brand primary map | 1 token module | ✅ |
| T2 Theme provider + tests | 1 cohesive theme unit | ✅ |
| T3 Metro SVG | 1 tooling change | ✅ |
| T4 Folder scaffold | 1 structural refactor | ✅ |
| T5–T8 Atoms | 1 component each | ✅ |
| T9 DataSourceLogo | 1 organism | ✅ |
| T10–T11 Molecules | 1 component each | ✅ |
| T12 Storybook globals | 1 preview config | ✅ |
| T13 README + cleanup | docs + catalog (cohesive close-out) | ✅ |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | (start) | ✅ |
| T2 | T1 | T1→T2 | ✅ |
| T3 | None | T3 after T2 in phase order (no hard dep arrow from T1) | ✅ Match — sequential phase order; body Allows None |
| T4 | T2 | T2→T3→T4 | ⚠️ Diagram shows T3 before T4; T4 does not depend on T3 — OK (phase order only) |
| T5 | T4 | T4→T5 | ✅ |
| T6 | T4 | T5→T6 (phase order); body Depends T4 | ✅ Match — may start after T4; sequential exec still T5 then T6 |
| T7 | T4 | sequential | ✅ |
| T8 | T4, T2 | sequential | ✅ |
| T9 | T3, T4, T2 | Phase3 start | ✅ |
| T10 | T4 | T9→T10 | ✅ body T4 only; phase order after T9 |
| T11 | T5, T9, T10 | T10→T11 | ✅ |
| T12 | T2, T5–T11 | T11→T12 | ✅ |
| T13 | T4, T9, T12 | T12→T13 | ✅ |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | --------------- | --------- | ------ |
| T1 | tokens/config | none | none | ✅ |
| T2 | Theme / getTheme | unit | unit | ✅ |
| T3 | Metro/config | none | none | ✅ |
| T4 | scaffold | none | none | ✅ |
| T5 | Typography | unit | unit | ✅ |
| T6 | Icon | unit | unit | ✅ |
| T7 | Spacer | unit | unit | ✅ |
| T8 | Loading | unit | unit | ✅ |
| T9 | DataSourceLogo | unit | unit | ✅ |
| T10 | Container | unit | unit | ✅ |
| T11 | Header | unit | unit | ✅ |
| T12 | Storybook preview | none | none | ✅ |
| T13 | README/catalog | none | none | ✅ |

---

## Requirement Traceability (tasks)

| ID | Tasks |
| -- | ----- |
| DS-01 | T1, T4, T13 |
| DS-02 | T1, T2 |
| DS-03 | T5 |
| DS-04 | T6 |
| DS-05 | T7 |
| DS-06 | T8 |
| DS-07 | T10 |
| DS-08 | T11 |
| DS-09 | T5–T12, T13 |
| DS-10 | T3, T9 |
| DS-11 | T4, T9, T13 |
| DS-12 | T2, T5, T6, T7, T8, T9, T10, T11 |
