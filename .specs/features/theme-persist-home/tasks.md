# Theme Persist + Home Header — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/theme-persist-home/design.md`  
**Status**: Done — pending Verifier

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` / AD-006 (Jest+RNTL), AD-018 (Zustand+persist), `jest.config.ts`, colocated `__tests__` pattern (DS + use-cases).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| session-preferences store (+ persist / reset / fallback) | unit | 1:1 to TPH-01..04 + edge cases (invalid enum, `reset` clears memory+storage) | `src/stores/**/__tests__/*.test.ts` | `pnpm test` |
| AppThemeProvider bridge + hydration gate | unit | TPH-05..06: no parallel useState; theme follows store; gate until hydrated | `src/components/ds/theme/__tests__/*.test.tsx` | `pnpm test` |
| HomeScreen Header chrome | unit | TPH-07..10: title, tap logo, tap theme icon; Header source has no DataSourceLogo | `src/screens/__tests__/HomeScreen.test.tsx` | `pnpm test` |
| Jest `__mocks__/zustand.ts` | none | Structure; exercised by store/provider/Home tests | `__mocks__/zustand.ts` | build/lint via dependents |
| App splash wiring / nav theme sync | none | Wiring; covered indirectly by provider/Home; lint | `App.tsx`, `navigation/*` | `pnpm lint` |
| Memory storage test helper | none | Support fixture for store tests | `src/test/**` | via store unit |

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After unit-test tasks | `pnpm test` |
| Full / Build | After wiring/docs or phase end | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Tooling

```
T1 → T2
```

### Phase 2: Store

```
T3
```

### Phase 3: Theme bridge + app boot

```
T4 → T5 → T6
```

### Phase 4: Home chrome

```
T7
```

---

## Task Breakdown

### T1: Add zustand dependency

**What**: Install `zustand` (compatible with Expo SDK 54 / RN project) via pnpm.  
**Where**: `package.json`, `pnpm-lock.yaml`  
**Depends on**: None  
**Reuses**: Existing pnpm workflow  
**Requirement**: TPH-01, TPH-02 (enabler)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `zustand` listed in `dependencies`
- [ ] Lockfile updated
- [ ] Import `create` / `persist` / `createJSONStorage` resolves in TypeScript

**Tests**: none  
**Gate**: build  
**Commit**: `chore: add zustand dependency`

---

### T2: Jest Zustand mock (official pattern)

**What**: Add `__mocks__/zustand.ts` per [Zustand Testing → Jest](https://zustand.docs.pmnd.rs/learn/guides/testing#jest): wrap `create`/`createStore`, register `storeResetFns` with `getInitialState()` + `setState(initial, true)`, `afterEach` via `act` from `@testing-library/react-native`.  
**Where**: `__mocks__/zustand.ts` (project root)  
**Depends on**: T1  
**Reuses**: Official docs snippet; Jest auto-mock  
**Requirement**: TPH-01 (test isolation)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Mock exports `create` / `createStore` with reset registration
- [ ] Uses RNTL `act`, not DOM RTL
- [ ] No TypeScript errors in mock file

**Tests**: none  
**Gate**: build  
**Commit**: `test: add official Zustand Jest mock`

---

### T3: session-preferences store + persist

**What**: Create typed Zustand store with `mode` + `dataSource`, AsyncStorage persist (`partialize` those fields), system-scheme default for `mode`, `github` for `dataSource`, setters/toggles, and `reset()` = set defaults + `persist.clearStorage()`. Include in-memory storage helper for tests; unit tests for ACs TPH-01..04 + invalid enum + reset.  
**Where**: `src/stores/session-preferences-store.ts`, `src/stores/index.ts`, `src/test/memory-storage.ts` (or colocated), `src/stores/__tests__/session-preferences-store.test.ts`  
**Depends on**: T1, T2  
**Reuses**: `ThemeMode`, `DataSource`, Zustand persist docs, AD-018  
**Requirement**: TPH-01, TPH-02, TPH-03, TPH-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Store API matches design (`setMode`, `toggleMode`, `setDataSource`, `toggleDataSource`, `reset`)
- [ ] Persist name `searchrepos:session-preferences`; `createJSONStorage(() => AsyncStorage)` in app path
- [ ] Empty/corrupt/invalid → system `mode` + `github`
- [ ] `reset()` clears memory and storage key
- [ ] Unit tests pass (rehydrate restore, fallback, reset); gate `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(stores): add session preferences zustand persist store`

---

### T4: AppThemeProvider bridge + hydration

**What**: Refactor `AppThemeProvider` to read prefs from the store (no parallel `useState`); gate children until hydrated (`useHydration` / `hasHydrated`); drive `StyledThemeProvider` via `getTheme`; keep `useAppTheme` API as thin store wrapper; update theme tests + `src/test/render.tsx` seeding.  
**Where**: `src/components/ds/theme/AppThemeProvider.tsx`, optional `src/stores/use-hydration.ts`, `theme/__tests__/AppThemeProvider.test.tsx`, `src/test/render.tsx`  
**Depends on**: T3  
**Reuses**: Existing `getTheme`, `useAppTheme` consumers  
**Requirement**: TPH-05, TPH-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] No `useState` for `mode`/`dataSource` in provider
- [ ] Product children not painted until hydrated (test asserts gate)
- [ ] `setDataSource` / `setMode` still update theme primary (existing ACs)
- [ ] `render`/`renderHook` helpers still accept `themeMode` (and dataSource if needed) via store seed
- [ ] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): drive AppThemeProvider from session store`

---

### T5: Splash gate in App entry

**What**: Wire `expo-splash-screen` (`preventAutoHideAsync` / `hideAsync`) so splash holds until session store has hydrated; integrate with provider gate from T4.  
**Where**: `src/App.tsx` (and/or provider if hide lives there per design)  
**Depends on**: T4  
**Reuses**: `expo-splash-screen` already in deps  
**Requirement**: TPH-05, TPH-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Splash prevented at boot; hidden after hydrate (or provider signals ready)
- [ ] Storybook entry path still works (`STORYBOOK_ENABLED`)
- [ ] Gate: `pnpm lint` (and `pnpm test` if any touch)

**Tests**: none  
**Gate**: full  
**Commit**: `feat(app): hold splash until session preferences hydrate`

---

### T6: Sync navigation theme to store mode

**What**: Replace system-only `useColorScheme()` for NavigationContainer / tab tint with store `mode` so nav chrome matches toggled theme.  
**Where**: `src/navigation/RootNavigator.tsx`, `src/navigation/TabsNavigator.tsx`  
**Depends on**: T4  
**Reuses**: `useAppTheme` or store selector; existing DarkTheme/DefaultTheme  
**Requirement**: TPH-06 (consistency), design risk mitigation

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Nav theme follows store `mode`, not only OS scheme
- [ ] No TypeScript errors
- [ ] Gate: `pnpm lint`

**Tests**: none  
**Gate**: full  
**Commit**: `fix(nav): bind navigation theme to session mode`

---

### T7: HomeScreen Header with source + theme toggles

**What**: Rewrite `HomeScreen` as DS shell: `Header` title `Search Repos`, leading pressable `DataSourceLogo` → `toggleDataSource`, trailing pressable sun/moon `Icon` → `toggleMode`; minimal body; unit tests for TPH-07..10.  
**Where**: `src/screens/HomeScreen.tsx`, `src/screens/__tests__/HomeScreen.test.tsx`  
**Depends on**: T4, T6  
**Reuses**: `Header`, `DataSourceLogo`, `Icon`, `Container`/`Typography`; Header slots  
**Requirement**: TPH-07, TPH-08, TPH-09, TPH-10

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Title exactly `Search Repos`
- [ ] Tap logo toggles `github` ↔ `gitlab`
- [ ] Tap theme icon toggles light ↔ dark (icon = next mode: moon in light, sunny in dark)
- [ ] `Header.tsx` still has no `DataSourceLogo` import
- [ ] Unit tests pass; gate `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(home): add Header with data source and theme toggles`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2
Phase 2:  T3
Phase 3:  T4 ──→ T5 ──→ T6
Phase 4:  T7
```

Execution is strictly sequential. Total **7 tasks** → single Execute batch (≤ ~8); no sub-agent packing required unless user requests it.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Add zustand | 1 dependency | ✅ Granular |
| T2: Jest mock | 1 file | ✅ Granular |
| T3: Store + persist + unit tests | 1 store + colocated tests | ✅ Granular |
| T4: Provider bridge + tests | 1 provider refactor + helpers | ✅ Granular |
| T5: Splash in App | 1 entry wiring | ✅ Granular |
| T6: Nav theme sync | 2 related nav files | ⚠️ OK cohesive |
| T7: HomeScreen + tests | 1 screen + colocated tests | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | (start) | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T1, T2 | Phase2 after Phase1 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T4 | T4 → T5 → T6 (T6 after T4; sequential via T5) | ✅ |
| T7 | T4, T6 | Phase4 after Phase3 | ✅ |

Note: T6 depends on T4 only (not T5); diagram runs T5 before T6 for boot-before-nav polish. Acceptable — T5 does not block T6 logically; order is intentional (splash then nav). If strict: T6 `Depends on: T4` matches body; diagram sequence T5→T6 is phase order, not a missing dep arrow from T5.

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | -------------- | --------- | ------ |
| T1 | dependency | none | none | ✅ |
| T2 | Jest mock | none | none | ✅ |
| T3 | session store | unit | unit | ✅ |
| T4 | AppThemeProvider | unit | unit | ✅ |
| T5 | App splash wiring | none | none | ✅ |
| T6 | nav theme sync | none | none | ✅ |
| T7 | HomeScreen | unit | unit | ✅ |

---

## Requirement Traceability (tasks)

| ID | Task |
| -- | ---- |
| TPH-01 | T3 |
| TPH-02 | T3 |
| TPH-03 | T3 |
| TPH-04 | T3 |
| TPH-05 | T4, T5 |
| TPH-06 | T4, T5, T6 |
| TPH-07 | T7 |
| TPH-08 | T7 |
| TPH-09 | T7 |
| TPH-10 | T7 |

**Coverage:** 10 total, 10 mapped ✅
