# Presentation Layer (Bridge) — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/presentation-layer/design.md`  
**Status**: Approved — Execute in progress (batch workers)

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` (Expo v54 docs), AD-006 (Jest + RNTL), AD-005/020/021/023/024, colocated `__tests__` (stores, domain, application, infrastructure), `package.json` scripts `test` / `lint`, `jest.config.ts` + `src/test/setup.ts` + `src/test/render.tsx`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| SecureStore adapter | unit (mocked SecureStore) | PRES-05d–05g paths: load/save/delete/clear; unavailable → `{}` / no-op writes; errors swallowed | `src/infrastructure/secure-store/__tests__/*.test.ts` | `pnpm test -- src/infrastructure/secure-store` |
| Session store tokens + hydrate/reset | unit | PRES-05b–05g: slot; partialize excludes tokens; write-through; restore; unavailable; reset clears SS | `src/stores/__tests__/session-preferences-store.test.ts` (+ token hydrate helpers if split) | `pnpm test -- src/stores` |
| Session gate (prefs + tokens) | unit | PRES-05e: product children only after both ready; unavailable still ready | `src/stores` and/or `src/components/ds/theme/__tests__/AppThemeProvider.test.tsx` | scoped path in task |
| `queryKeys` | unit | Keys include `dataSource`; stable tuples for search/detail/issues | `src/presentation/__tests__/query-keys.test.ts` (or colocated) | `pnpm test -- src/presentation` |
| `mapAppErrorToMessage` | unit | PRES-13..16: all `AppErrorCode` PT-BR; non-AppError; rate_limit±cause same; pure (no RN/Query imports) | `src/presentation/errors/__tests__/*.test.ts` | `pnpm test -- src/presentation/errors` |
| `AppQueryProvider` / `createQueryClient` | unit | Defaults `staleTime: 60_000`, `retry: false`; optional client inject | `src/presentation/providers/__tests__/*` | `pnpm test -- src/presentation/providers` |
| `AppContainerProvider` | unit (RNTL) | PRES-01..05, 03: createContainer from store; recreate on dataSource/tokens; throw outside; Fake `repository?` | `src/presentation/providers/__tests__/*` | `pnpm test -- src/presentation/providers` |
| Product hooks | unit (RNTL + Fake) | PRES-07..12, 19, 10: infinite search/issues; details query; key has dataSource; no invalidate on toggle; AppError in error; enabled false | `src/presentation/hooks/__tests__/*.test.ts` | `pnpm test -- src/presentation/hooks` |
| Presentation isolation | unit | PRES-04 (di untouched), PRES-11: hooks no github/gitlab/fetch | `src/presentation/__tests__/isolation.test.ts` | `pnpm test -- src/presentation` |
| App wiring + Home | unit (RNTL) | PRES-17..18: providers ancestors; Home chrome green | `src/screens/__tests__/HomeScreen.test.tsx` (+ smoke if needed) | `pnpm test -- src/screens` |
| Deps / app.json plugin | none | Build/install gate | `package.json`, `app.json` | `pnpm lint` / install succeeds |
| Test harness `AllTheProviders` | none (enables others) | Exercised by provider/hook/Home suites | `src/test/render.tsx` | via consumer tests |

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Adapter / store / mapper / queryKeys | `pnpm test -- <scoped path from task>` |
| Full | Providers / hooks / presentation tree | `pnpm test -- src/presentation` (and `src/stores` when touched) |
| Build | Phase end / feature close | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Deps + SecureStore + session tokens + gate

```
T1 → T2 → T3 → T4
```

### Phase 2: Presentation core (keys, mapper, providers, harness)

```
T5 → T6 → T7 → T8 → T9
```

### Phase 3: Product hooks

```
T10 → T11 → T12
```

### Phase 4: App wiring + isolation + close

```
T13 → T14
```

---

## Task Breakdown

### T1: Add TanStack Query + expo-secure-store (+ app config)

**What**: Install `@tanstack/react-query` and `expo-secure-store` via Expo-compatible install; register SecureStore config plugin; optionally set `ios.config.usesNonExemptEncryption: false`.  
**Where**: `package.json`, `app.json` / `app.config.*`  
**Depends on**: None  
**Reuses**: Existing Expo 54 plugin list in `app.json`  
**Requirement**: PRES-06 (dep), PRES-05d (SecureStore avail), AD-024, AD-005

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Both packages present and resolvable
- [x] `expo-secure-store` plugin listed in app config
- [x] Install followed Expo SDK 54 guidance (`expo install` preferred)
- [x] Gate: `pnpm lint` (or typecheck if lint alone insufficient)

**Tests**: none  
**Gate**: build  
**Commit**: `chore(deps): add tanstack query and expo-secure-store`

---

### T2: Provider-tokens SecureStore adapter

**What**: Implement load/save/clear adapter around `expo-secure-store` for `ProviderTokens` with `isAvailableAsync` guard and typed keys.  
**Where**: `src/infrastructure/secure-store/provider-tokens-secure-store.ts` (+ `__tests__`), export from `@/infrastructure` if useful  
**Depends on**: T1  
**Reuses**: `ProviderTokens` from `create-container.ts`; `DataSource`  
**Requirement**: PRES-05d, PRES-05f, PRES-05g

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `loadProviderTokens` / `saveProviderToken` / `clearProviderTokens` implemented
- [x] Unavailable platform → load `{}`, writes no-op (no throw)
- [x] Clear/delete removes github+gitlab keys; empty token deletes key
- [x] Unit tests with mocked `expo-secure-store` cover happy + unavailable + clear
- [x] Gate: `pnpm test -- src/infrastructure/secure-store`
- [x] Test count: ≥4 assertions/cases; no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(infra): add SecureStore adapter for provider tokens`

---

### T3: Session store `tokens` slot + SecureStore write-through

**What**: Extend session preferences store with `tokens`, setters, hydrate-from-SecureStore, `reset` clears SS; keep `partialize` to mode+dataSource only.  
**Where**: `src/stores/session-preferences-store.ts`, `src/stores/__tests__/session-preferences-store.test.ts`  
**Depends on**: T2  
**Reuses**: Existing persist/merge/hydrate; T2 adapter  
**Requirement**: PRES-05b, PRES-05c, PRES-05d, PRES-05e, PRES-05f, PRES-05g

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `tokens` default `{}`; `setToken` / `setTokens` update memory + call adapter
- [x] `partialize` still only `mode` + `dataSource` (assert in test)
- [x] Hydrate loads SS into memory without re-writing; unavailable → empty + ready
- [x] `reset()` clears in-memory tokens and SecureStore entries
- [x] Setters always assign a **new** `tokens` object reference
- [x] Gate: `pnpm test -- src/stores`
- [x] Test count: existing store tests green + new token cases; no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(stores): wire provider tokens to SecureStore`

---

### T4: Session gate waits for prefs + tokens

**What**: Extend hydrate/ready gate so product UI paints only after preferences **and** tokens SecureStore hydrate finish (success or empty fallback).  
**Where**: `src/stores/use-hydration.ts` and/or `AppThemeProvider.tsx` (+ tests)  
**Depends on**: T3  
**Reuses**: Existing splash/hasHydrated pattern  
**Requirement**: PRES-05e, PRES-05f

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Combined ready flag (or dual check) blocks children until both complete
- [x] Tokens hydrate is triggered as part of boot (not only on first setToken)
- [x] Unavailable SecureStore still reaches ready with empty tokens
- [x] Existing theme/Home gate tests updated and green
- [x] Gate: `pnpm test -- src/stores src/components/ds/theme`
- [x] Test count: gate cases covered; no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(session): gate UI until prefs and tokens hydrate`

---

### T5: `queryKeys` factory

**What**: Add typed `queryKeys.repos.search|detail|issues` always including `dataSource`.  
**Where**: `src/presentation/query-keys.ts`, `src/presentation/__tests__/query-keys.test.ts`  
**Depends on**: T4  
**Reuses**: `DataSource` from `@/application`  
**Requirement**: PRES-07, PRES-08, PRES-09, PRES-10

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Three key factories return readonly tuples with `dataSource` in the expected slot
- [x] Unit tests assert shapes for github vs gitlab differ
- [x] Gate: `pnpm test -- src/presentation/__tests__/query-keys.test.ts` (or presentation scoped)
- [x] Test count: ≥3 cases

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(presentation): add dataSource-aware queryKeys`

---

### T6: `mapAppErrorToMessage` (PT-BR)

**What**: Pure mapper `AppError` / unknown → PT-BR string via object map; ignore `rate_limit` cause.  
**Where**: `src/presentation/errors/map-app-error-to-message.ts`, `__tests__`  
**Depends on**: T5 (phase order only; no code dep — treat as Depends on T5 for plan consistency)  
**Reuses**: `isAppError`, `AppErrorCode` from `@/domain`; AD-013 object maps  
**Requirement**: PRES-13, PRES-14, PRES-15, PRES-16

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] All nine codes have non-empty PT-BR strings
- [x] Non-AppError → unknown copy
- [x] `rate_limit` with/without `cause` → identical string
- [x] Module has no React / RN / TanStack imports (assert in test or isolation)
- [x] Gate: `pnpm test -- src/presentation/errors`
- [x] Test count: table covers all codes + fallback + cause case

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(presentation): map AppError codes to PT-BR messages`

---

### T7: `AppQueryProvider` + `createQueryClient`

**What**: Factory with `staleTime: 60_000` and `retry: false`; React provider wrapping `QueryClientProvider`.  
**Where**: `src/presentation/providers/create-query-client.ts`, `AppQueryProvider.tsx`, `__tests__`  
**Depends on**: T1, T6 (phase: after T6)  
**Reuses**: `@tanstack/react-query`  
**Requirement**: PRES-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Defaults match design (`staleTime` 60s, `retry: false`)
- [x] Provider accepts optional `client` for tests
- [x] No dataSource invalidate/remove listeners
- [x] Unit test asserts default options on created client
- [x] Gate: `pnpm test -- src/presentation/providers`
- [x] Test count: ≥1 default-options test

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(presentation): add AppQueryProvider with conservative defaults`

---

### T8: `AppContainerProvider` + `useAppContainer`

**What**: Context provider that `createContainer({ dataSource, tokens, repository? })` from session store; recreate on change; hook throws outside.  
**Where**: `src/presentation/providers/AppContainerProvider.tsx`, `__tests__`  
**Depends on**: T3, T4, T7  
**Reuses**: `createContainer` / Fake; session store  
**Requirement**: PRES-01, PRES-02, PRES-03, PRES-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Reads `dataSource` + `tokens` from store; calls `createContainer`
- [x] New instance when dataSource or tokens change (assert with Fake/spy)
- [x] `useAppContainer` throws clear error outside provider
- [x] Optional `repository` prop forwarded for tests
- [x] Empty tokens → anonymous path (container still created)
- [x] Gate: `pnpm test -- src/presentation/providers`
- [x] Test count: recreate + throw + empty tokens covered

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(presentation): add AppContainerProvider wired to session`

---

### T9: Extend `AllTheProviders` test harness

**What**: Wrap Query + Container (Fake repository option) in `src/test/render.tsx` so hooks/Home tests share providers; seed tokens hydrate ready.  
**Where**: `src/test/render.tsx`  
**Depends on**: T7, T8  
**Reuses**: Existing theme/safe-area seeding  
**Requirement**: PRES-17 (testability), enables PRES-07..18 tests

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `AllTheProviders` includes AppQueryProvider + AppContainerProvider
- [x] Optional `repository` for Fake injection
- [x] Existing Home/theme renders still pass with harness
- [x] Gate: `pnpm test -- src/screens/__tests__/HomeScreen.test.tsx src/components/ds/theme`
- [x] No silent deletions in those suites

**Tests**: none (harness — verified by consumer suites in Done when)  
**Gate**: full  
**Commit**: `test: wrap Query and Container in AllTheProviders`

---

### T10: `useSearchRepos` (infinite)

**What**: `useInfiniteQuery` hook calling `container.searchRepos` with page params; queryKey includes dataSource; default enabled on non-empty query.  
**Where**: `src/presentation/hooks/use-search-repos.ts`, `__tests__/use-search-repos.test.ts`  
**Depends on**: T5, T8, T9  
**Reuses**: `DEFAULT_PAGE`, Fake repo, `queryKeys`  
**Requirement**: PRES-07, PRES-10, PRES-11, PRES-12, PRES-19

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Uses `useInfiniteQuery` + `initialPageParam` / `getNextPageParam` from `hasNextPage`
- [x] queryKey includes active `dataSource` + query
- [x] Toggle dataSource uses new key; **no** `invalidateQueries`/`removeQueries` in hook/module
- [x] Empty query → `enabled: false` (default)
- [x] Use-case `AppError` surfaces on query error
- [x] No github/gitlab/fetch imports
- [x] Gate: `pnpm test -- src/presentation/hooks`
- [x] Test count: fetch page + enabled + key isolation cases

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(presentation): add useSearchRepos infinite query hook`

---

### T11: `useRepoDetails`

**What**: `useQuery` hook for `getRepoDetails`; queryKey includes dataSource + repoId.  
**Where**: `src/presentation/hooks/use-repo-details.ts`, `__tests__/use-repo-details.test.ts`  
**Depends on**: T10  
**Reuses**: T8/T9 harness, Fake  
**Requirement**: PRES-08, PRES-11, PRES-12, PRES-19

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `useQuery` + key with dataSource + repoId
- [x] Default `enabled` requires non-empty repoId
- [x] AppError surfaces; no direct HTTP imports
- [x] Gate: `pnpm test -- src/presentation/hooks`
- [x] Test count: success + disabled + error path

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(presentation): add useRepoDetails query hook`

---

### T12: `useRepoIssues` (infinite)

**What**: `useInfiniteQuery` for `listRepoIssues`; same pagination/key isolation patterns as search.  
**Where**: `src/presentation/hooks/use-repo-issues.ts`, `__tests__/use-repo-issues.test.ts`  
**Depends on**: T11  
**Reuses**: T10 patterns  
**Requirement**: PRES-09, PRES-10, PRES-11, PRES-12, PRES-19

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Infinite query + hasNextPage pageParam pattern
- [x] queryKey includes dataSource + repoId
- [x] No invalidate-on-toggle; isolation via key
- [x] Gate: `pnpm test -- src/presentation/hooks`
- [x] Test count: page + key isolation covered

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(presentation): add useRepoIssues infinite query hook`

---

### T13: Wire providers in `App.tsx` + Home chrome

**What**: Mount `AppQueryProvider` + `AppContainerProvider` under theme gate in product `App`; keep Storybook branch unchanged; Home Header toggles still work.  
**Where**: `src/App.tsx`, `src/screens/__tests__/HomeScreen.test.tsx`  
**Depends on**: T4, T7, T8, T9  
**Reuses**: Existing App structure  
**Requirement**: PRES-06, PRES-17, PRES-18

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Product tree order: SafeArea → Theme → Query → Container → Nav
- [ ] Storybook entry does not require product providers
- [ ] Home tests green (title + dataSource/theme toggles)
- [ ] Gate: `pnpm test -- src/screens`
- [ ] No silent deletions

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(app): mount query and container providers`

---

### T14: Presentation barrel + isolation scan + requirement close

**What**: Optional `@/presentation` barrel; isolation test that product hooks never import github/gitlab/fetch; confirm `di/` still free of React/Zustand; mark NEXT.md already lists deferred UI.  
**Where**: `src/presentation/index.ts`, `src/presentation/__tests__/isolation.test.ts`, touch `src/infrastructure/__tests__/isolation.test.ts` if needed  
**Depends on**: T10, T11, T12, T13  
**Reuses**: application/infrastructure isolation scan pattern  
**Requirement**: PRES-04, PRES-11, PRES-15, PRES-19

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Barrel exports providers, hooks, queryKeys, mapper (as designed)
- [ ] Isolation scan on `src/presentation/hooks` bans fetch + github/gitlab paths
- [ ] di isolation still green
- [ ] Gate: `pnpm test` && `pnpm lint`
- [ ] Test count: isolation cases present; full suite green

**Tests**: unit  
**Gate**: build  
**Commit**: `feat(presentation): export barrel and enforce hook isolation`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2 ──→ T3 ──→ T4
Phase 2:  T5 ──→ T6 ──→ T7 ──→ T8 ──→ T9
Phase 3:  T10 ──→ T11 ──→ T12
Phase 4:  T13 ──→ T14
```

**Batches (~7 tasks):** Batch A = Phase 1+2 (T1–T9, 9 tasks — slightly over budget; acceptable as consecutive whole phases). Prefer split offer: **Batch A = Phase 1 (T1–T4)** then **Batch B = Phase 2 (T5–T9)** then **Batch C = Phase 3+4 (T10–T14)**.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | deps + app config | ✅ |
| T2 | 1 adapter module | ✅ |
| T3 | store tokens slice | ✅ cohesive |
| T4 | gate readiness | ✅ |
| T5 | queryKeys module | ✅ |
| T6 | 1 pure mapper | ✅ |
| T7 | Query provider | ✅ |
| T8 | Container provider | ✅ |
| T9 | test harness | ✅ |
| T10–T12 | 1 hook each | ✅ |
| T13 | App wiring | ✅ |
| T14 | barrel + isolation | ✅ cohesive close |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | (start) | ✅ |
| T2 | T1 | T1→T2 | ✅ |
| T3 | T2 | T2→T3 | ✅ |
| T4 | T3 | T3→T4 | ✅ |
| T5 | T4 | T4→T5 | ✅ |
| T6 | T5 | T5→T6 | ✅ |
| T7 | T1, T6 | after T6 (T1 prior) | ✅ |
| T8 | T3, T4, T7 | after T7; needs T3/T4 | ✅ |
| T9 | T7, T8 | T8→T9 | ✅ |
| T10 | T5, T8, T9 | after T9 | ✅ |
| T11 | T10 | T10→T11 | ✅ |
| T12 | T11 | T11→T12 | ✅ |
| T13 | T4, T7, T8, T9 | Phase 4 after hooks ok | ✅ |
| T14 | T10–T13 | after T13 | ✅ |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | -------------- | --------- | ------ |
| T1 | deps/config | none | none | ✅ |
| T2 | SecureStore adapter | unit | unit | ✅ |
| T3 | Session store | unit | unit | ✅ |
| T4 | Session gate | unit | unit | ✅ |
| T5 | queryKeys | unit | unit | ✅ |
| T6 | mapper | unit | unit | ✅ |
| T7 | AppQueryProvider | unit | unit | ✅ |
| T8 | AppContainerProvider | unit | unit | ✅ |
| T9 | harness | none | none (verified via consumers) | ✅ |
| T10 | useSearchRepos | unit | unit | ✅ |
| T11 | useRepoDetails | unit | unit | ✅ |
| T12 | useRepoIssues | unit | unit | ✅ |
| T13 | App + Home | unit | unit | ✅ |
| T14 | isolation/barrel | unit | unit | ✅ |

---

## Requirement → Task map

| ID | Tasks |
| -- | ----- |
| PRES-01, 02, 03, 05 | T8 |
| PRES-04 | T14 |
| PRES-05b–05g | T2, T3, T4 |
| PRES-06 | T1, T7, T13 |
| PRES-07, 10, 12 | T10 (+ T5 keys) |
| PRES-08 | T11 |
| PRES-09 | T12 |
| PRES-11, 19 | T10–T12, T14 |
| PRES-13–16 | T6 |
| PRES-17, 18 | T9, T13 |

**Coverage:** 25 IDs mapped, 0 unmapped.

---

## Suggested commits

One atomic commit per task (messages listed in each task body).
