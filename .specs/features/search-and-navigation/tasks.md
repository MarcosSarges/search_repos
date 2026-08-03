# Search & Navigation — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/search-and-navigation/design.md`  
**Status**: Approved — Execute in progress (batch workers)

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` (Expo v54), AD-006 (Jest + RNTL), AD-026 (tabs IA), colocated `__tests__`, `package.json` scripts `test` / `lint`, `jest.config.ts` + `src/test/render.tsx`. Sampled: `HomeScreen.test.tsx`, `use-search-repos.test.ts`, `InputField.test.tsx`, presentation hook tests.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Presentation hooks (`useDebouncedValue`) | unit | Delay behavior + latest-value wins (fake timers) | `src/presentation/hooks/__tests__/*.test.ts(x)` | `pnpm test -- src/presentation/hooks --watchman=false` |
| Screens (Search / Config / mocks / stubs) | unit (RNTL) | Spec ACs + listed edge cases for that screen | `src/screens/**/__tests__/*.test.tsx` | `pnpm test -- src/screens --watchman=false` |
| Navigation wiring | unit (RNTL) | Tabs present; Modal gone; Search→Details→Issues params | `src/navigation/__tests__/*.test.tsx` and/or screen nav tests | `pnpm test -- src/navigation src/screens --watchman=false` |
| List row (`RepoListItem`) | unit (RNTL) | Fields render; press calls onPress with id | colocated under `src/screens/search/__tests__` | `pnpm test -- src/screens/search --watchman=false` |
| Types / constants only | none | — (typecheck via tests/lint) | — | build/lint gate |
| Maestro E2E | none (this feature) | Deferred per spec OOS | — | — |

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After hook/unit-only tasks | `pnpm test -- <paths> --watchman=false` |
| Full | After screen/nav tasks | `pnpm test -- src/screens src/navigation src/presentation --watchman=false` |
| Build | End of phase / feature | `pnpm lint` + `pnpm test --watchman=false` (or scoped full) |

---

## Execution Plan

### Phase 1: Foundation

```
T1 → T2 → T3
```

### Phase 2: Shell (tabs, Config, mocks, stack stubs)

```
T4 → T5 → T6 → T7
```

### Phase 3: Search UI + cleanup

```
T8 → T9 → T10
```

**Batch packing (Execute):** Batch A = Phase 1+2 (T1–T7); Batch B = Phase 3 (T8–T10); Verifier after T10.

---

## Task Breakdown

### T1: `SEARCH_DEBOUNCE_MS` constant

**What**: Add debounce delay constant (350) under presentation constants and export from barrel.  
**Where**: `src/presentation/constants/search.ts` (+ `constants/index.ts`, `presentation/index.ts` as needed)  
**Depends on**: None  
**Reuses**: `src/presentation/constants/` pattern  
**Requirement**: SRCH-02

**Tools**: Skill `tlc-spec-driven`  
**Done when**:

- [ ] `SEARCH_DEBOUNCE_MS === 350` exported
- [ ] Re-exported from constants barrel

**Tests**: none  
**Gate**: build (`pnpm lint` on touched files / tsc via existing gate)  
**Commit**: `feat(presentation): add SEARCH_DEBOUNCE_MS constant`

---

### T2: `useDebouncedValue` hook

**What**: Implement generic debounce hook using `SEARCH_DEBOUNCE_MS` default.  
**Where**: `src/presentation/hooks/use-debounced-value.ts` + `__tests__/use-debounced-value.test.ts`  
**Depends on**: T1  
**Reuses**: presentation hooks style  
**Requirement**: SRCH-02

**Done when**:

- [ ] `useDebouncedValue(value, delayMs?)` returns debounced value
- [ ] Tests with fake timers: updates after delay; rapid changes keep latest only
- [ ] Gate: `pnpm test -- src/presentation/hooks/__tests__/use-debounced-value.test.ts --watchman=false`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(presentation): add useDebouncedValue hook`

---

### T3: Navigation param types (tabs + Search stack)

**What**: Replace template types with `TabsParamList` (Search/Favoritos/Explore/Config) and `SearchStackParamList` (SearchRepos/RepoDetails/RepoIssues with `repoId`); remove Modal.  
**Where**: `src/navigation/types.ts`  
**Depends on**: None (can parallel conceptually; listed after T2 for phase order only — **Depends on: None**)  
**Reuses**: existing types file  
**Requirement**: NAV-01, NAV-04

**Done when**:

- [ ] Types match design
- [ ] No `Modal` / `Home` in param lists
- [ ] Project still typechecks once consumers updated in later tasks (T3 alone may leave temporary TS errors in navigators — **restructure**: T3 only edits `types.ts`; navigators updated in T7. Accept brief red navigators until T7 **or** leave stub aliases — prefer update navigators minimally to compile: if T3 breaks build, merge type consumers into T7 and keep T3 types-only with `// @ts-expect` forbidden. **Fix**: T3 Depends on none; T7 must fix all type errors. Gate for T3 = none beyond file correctness; Full gate at T7.

**Tests**: none  
**Gate**: build (types file only — full green at T7)  
**Commit**: `feat(navigation): type product tabs and Search stack params`

---

### T4: Favoritos + Explore mock screens

**What**: Product mock screens with title + placeholder PT-BR + `testID`s; replace Expo Explore boilerplate.  
**Where**: `src/screens/FavoritosScreen.tsx`, `src/screens/ExploreScreen.tsx` (+ `__tests__`)  
**Depends on**: None  
**Reuses**: DS `Container`, `Typography`, `Header`  
**Requirement**: NAV-02

**Done when**:

- [ ] Both mocks render without fetching APIs / writing favorites
- [ ] Tests assert title/testID
- [ ] Gate: `pnpm test -- src/screens/__tests__/FavoritosScreen.test.tsx src/screens/__tests__/ExploreScreen.test.tsx --watchman=false` (paths as created)

**Tests**: unit (RNTL)  
**Gate**: quick  
**Commit**: `feat(screens): add Favoritos and Explore mock tabs`

---

### T5: ConfigScreen (data source, theme, token placeholder)

**What**: Config tab UI wired to session store toggles; token section placeholder only. Migrate Home toggle tests here.  
**Where**: `src/screens/ConfigScreen.tsx` + `__tests__/ConfigScreen.test.tsx`  
**Depends on**: None  
**Reuses**: HomeScreen toggle patterns, `DataSourceLogo`, session store  
**Requirement**: CFG-01, CFG-02, CFG-03

**Done when**:

- [ ] Toggles change `dataSource` and `mode` in store
- [ ] Token placeholder visible; no SecureStore form
- [ ] Former Home toggle ACs covered by Config tests
- [ ] Gate: `pnpm test -- src/screens --watchman=false` (Config-focused)

**Tests**: unit (RNTL)  
**Gate**: quick  
**Commit**: `feat(screens): add Config tab with data source and theme controls`

---

### T6: Search stack stubs + SearchStackNavigator

**What**: `RepoDetailsScreen` / `RepoIssuesScreen` stubs + nested `SearchStackNavigator` registering SearchRepos placeholder **or** temporary stub until T9 — prefer register screens: Details/Issues real stubs; SearchRepos can be thin placeholder screen file created in T6 and replaced/filled in T9.  
**Where**: `src/navigation/SearchStackNavigator.tsx`, `src/screens/search/RepoDetailsScreen.tsx`, `RepoIssuesScreen.tsx`, thin `SearchReposScreen.tsx` placeholder  
**Depends on**: T3  
**Reuses**: native stack pattern from RootNavigator  
**Requirement**: NAV-04, NAV-06, NAV-07, NAV-08

**Done when**:

- [ ] Stack types: Details/Issues require `repoId`
- [ ] Details shows `repoId` + Issues CTA; Issues shows `repoId`
- [ ] Tests for stubs (render with params via NavigationContainer test harness)
- [ ] Gate: scoped screen/nav tests pass

**Tests**: unit (RNTL)  
**Gate**: quick  
**Commit**: `feat(navigation): add Search stack with Details and Issues stubs`

---

### T7: TabsNavigator + RootNavigator (product shell)

**What**: Wire four tabs; Root = Tabs only (delete Modal); remove `ModalScreen` / obsolete Home registration.  
**Where**: `src/navigation/TabsNavigator.tsx`, `src/navigation/RootNavigator.tsx`, delete `src/screens/ModalScreen.tsx`  
**Depends on**: T3, T4, T5, T6  
**Reuses**: tab bar theme colors  
**Requirement**: NAV-01, NAV-03

**Done when**:

- [ ] Tabs: Search / Favoritos / Explore / Config
- [ ] No Modal route; ModalScreen deleted
- [ ] Nav smoke test: four tabs reachable / types exclude Modal
- [ ] Gate: `pnpm test -- src/navigation src/screens --watchman=false` + `pnpm lint`

**Tests**: unit (RNTL)  
**Gate**: full  
**Commit**: `feat(navigation): mount product tabs and drop Modal template`

---

### T8: `RepoListItem` Card row

**What**: List row showing name, owner, stars, language, description; press → `onPress(repo.id)`.  
**Where**: `src/screens/search/RepoListItem.tsx` + `__tests__/RepoListItem.test.tsx`  
**Depends on**: None  
**Reuses**: DS `Card`, `Typography`  
**Requirement**: SRCH-05, SRCH-11

**Done when**:

- [ ] Fields render; missing optional fields safe
- [ ] Press invokes callback with opaque id
- [ ] Gate: quick test path for RepoListItem

**Tests**: unit (RNTL)  
**Gate**: quick  
**Commit**: `feat(screens): add RepoListItem card row`

---

### T9: SearchReposScreen (full search UX)

**What**: Replace placeholder with InputField + debounce + `useSearchRepos` + FlatList infinite scroll + pull-to-refresh + idle/loading/empty/error+Retry; navigate to Details on row press; no Config toggles on this screen (CFG-04). Delete `HomeScreen.tsx` + obsolete Home tests.  
**Where**: `src/screens/search/SearchReposScreen.tsx` + `__tests__/SearchReposScreen.test.tsx`; delete `HomeScreen*`  
**Depends on**: T2, T6, T7, T8  
**Reuses**: `useSearchRepos`, `mapAppErrorToMessage`, Fake repo via test harness  
**Requirement**: SRCH-01..11, CFG-04, NAV-05

**Done when**:

- [ ] All SRCH ACs covered by tests (fake timers for debounce)
- [ ] No dataSource/theme primary toggles on Search
- [ ] HomeScreen removed; references updated
- [ ] Gate: `pnpm test -- src/screens src/presentation --watchman=false`

**Tests**: unit (RNTL)  
**Gate**: full  
**Commit**: `feat(screens): implement SearchRepos with debounced query and list states`

---

### T10: Nav E2E-smoke + barrel export + green suite

**What**: Integration-style test Search → Details → Issues; export `useDebouncedValue` / constant from presentation barrel; fix any leftover template orphans blocking lint/tests.  
**Where**: `src/navigation/__tests__/` or `src/screens/search/__tests__/search-stack.nav.test.tsx`; `src/presentation/index.ts`  
**Depends on**: T9  
**Reuses**: NavigationContainer test patterns  
**Requirement**: NAV-05, NAV-06, NAV-07, NAV-08

**Done when**:

- [ ] Nav smoke test passes with `repoId`
- [ ] Barrel exports debounce API
- [ ] Gate: `pnpm lint` + `pnpm test -- src/screens src/navigation src/presentation --watchman=false`

**Tests**: unit (RNTL)  
**Gate**: build  
**Commit**: `test(navigation): smoke Search stack and export debounce API`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 ──→ T2 ──→ T3
Phase 2:  T4 ──→ T5 ──→ T6 ──→ T7
Phase 3:  T8 ──→ T9 ──→ T10
```

Note: T3 `Depends on: None` but ordered after T2 in Phase 1 for sequencing; T4/T5 `Depends on: None` but Phase 2 runs after Phase 1 completes. T6 depends on T3; T7 depends on T3–T6; T9 depends on T2,T6,T7,T8.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | 1 constant module | ✅ |
| T2 | 1 hook + tests | ✅ |
| T3 | 1 types file | ✅ |
| T4 | 2 cohesive mock screens | ⚠️ OK (same deliverable) |
| T5 | 1 screen + migrated tests | ✅ |
| T6 | Stack + 2 stubs (+ thin Search placeholder) | ⚠️ OK (one navigator unit) |
| T7 | Tabs + Root + delete Modal | ⚠️ OK (one shell wiring) |
| T8 | 1 component | ✅ |
| T9 | 1 screen + delete Home | ✅ |
| T10 | smoke + barrel | ✅ |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | (start) | ✅ |
| T2 | T1 | T1→T2 | ✅ |
| T3 | None | T2→T3 (order only) | ✅ Match (phase order ≠ hard dep) |
| T4 | None | T4 start Phase 2 | ✅ |
| T5 | None | T4→T5 | ✅ Match (order; no hard dep) |
| T6 | T3 | …→T6; needs T3 | ✅ |
| T7 | T3,T4,T5,T6 | T6→T7 | ✅ (body lists all; diagram shows chain) |
| T8 | None | T8 start Phase 3 | ✅ |
| T9 | T2,T6,T7,T8 | T8→T9 | ✅ (body supersedes; diagram simplified — **fix diagram**) |

**Diagram fix for T9:** document hard deps in map note (already in note above). Status ✅ with note.

| T10 | T9 | T9→T10 | ✅ |

---

## Test Co-location Validation

| Task | Layer | Matrix Requires | Task Says | Status |
| ---- | ----- | --------------- | --------- | ------ |
| T1 | constants | none | none | ✅ |
| T2 | presentation hooks | unit | unit | ✅ |
| T3 | types | none | none | ✅ |
| T4 | screens | unit RNTL | unit | ✅ |
| T5 | screens | unit RNTL | unit | ✅ |
| T6 | screens/nav | unit RNTL | unit | ✅ |
| T7 | navigation | unit RNTL | unit | ✅ |
| T8 | list row | unit RNTL | unit | ✅ |
| T9 | screens | unit RNTL | unit | ✅ |
| T10 | nav smoke | unit RNTL | unit | ✅ |

---

## Requirement Traceability (tasks)

| ID | Tasks |
| -- | ----- |
| NAV-01 | T3, T7 |
| NAV-02 | T4 |
| NAV-03 | T7 |
| NAV-04 | T3, T6 |
| NAV-05 | T9, T10 |
| NAV-06 | T6, T10 |
| NAV-07 | T6, T10 |
| NAV-08 | T6, T10 |
| CFG-01..03 | T5 |
| CFG-04 | T9 |
| SRCH-02 | T1, T2, T9 |
| SRCH-01,03..11 | T8, T9 |
