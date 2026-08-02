# Presentation Layer (Bridge) Validation

**Date**: 2026-08-02
**Spec**: `.specs/features/presentation-layer/spec.md`
**Diff range**: `53b967e^..025b00f` (feature commits `53b967e`…`025b00f`; docs `2596836`)
**Verifier**: independent sub-agent (author ≠ verifier)
**UAT**: N/A (bridge only — no product search UI)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | TanStack Query + expo-secure-store |
| T2 | ✅ Done | SecureStore adapter |
| T3 | ✅ Done | tokens slot + write-through |
| T4 | ✅ Done | session gate prefs+tokens |
| T5 | ✅ Done | queryKeys |
| T6 | ✅ Done | mapAppErrorToMessage |
| T7 | ✅ Done | AppQueryProvider / createQueryClient |
| T8 | ✅ Done | AppContainerProvider |
| T9 | ✅ Done | AllTheProviders harness |
| T10 | ✅ Done | useSearchRepos |
| T11 | ✅ Done | useRepoDetails |
| T12 | ✅ Done | useRepoIssues |
| T13 | ✅ Done | App wiring + Home |
| T14 | ✅ Done | barrel + isolation |

---

## Spec-Anchored Acceptance Criteria

### P1: Composition / tokens (PRES-01..05g)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| PRES-01: provider mounts → `createContainer({ dataSource, tokens })` from store; no direct adapter imports | Container wired from session; no github/gitlab adapter imports in provider | `AppContainerProvider.test.tsx:53-62` — `getRepoDetails` resolves via container; recreate deps imply store wiring (`:65-96`). **Sub-clause “no adapter imports”**: no source-scan assertion on provider (implementation-only) | ✅ PASS (behavior) / ⚠️ gap on adapter-import scan |
| PRES-02: dataSource/tokens change → new container instance | `result.current` identity changes | `AppContainerProvider.test.tsx:77-78` — `expect(result.current).not.toBe(first)` (dataSource); `:94-95` (tokens) | ✅ PASS |
| PRES-03: `useAppContainer` outside provider throws | Clear error mentioning provider | `AppContainerProvider.test.tsx:101-103` — `rejects.toThrow(/AppContainerProvider/)` | ✅ PASS |
| PRES-04: `di/` still no Zustand/React | Scan finds no zustand / session-preferences-store imports | `create-container.test.ts:106-126` — `expect(violations).toEqual([])` | ✅ PASS |
| PRES-05: empty tokens → anonymous | Container still created / works with `tokens: {}` | `AppContainerProvider.test.tsx:121-132` — empty tokens + `getRepoDetails` resolves | ✅ PASS |
| PRES-05b: typed `tokens` slot default empty | `tokens === {}`; setters present | `session-preferences-store.test.ts:201-211` — `expect(store.getState().tokens).toEqual({})` | ✅ PASS |
| PRES-05c: partialize only mode+dataSource | Persisted JSON has no tokens | `session-preferences-store.test.ts:283-285` — `toEqual({ mode, dataSource })`; `not.toHaveProperty('tokens')` | ✅ PASS |
| PRES-05d: setToken → SecureStore write / clear deletes | Adapter `setItemAsync` / `deleteItemAsync`; store write-through | `provider-tokens-secure-store.test.ts:47-50`, `:58-59`; `session-preferences-store.test.ts:228-229`, `:265-266` | ✅ PASS |
| PRES-05e: cold start restores tokens before product UI | Gate waits both hydrates; hydrate loads SS; boot triggers hydrate | `session-gate.test.tsx:38-45`, `:66-67`, `:101-116`; `session-preferences-store.test.ts:295-299` | ✅ PASS |
| PRES-05f: SecureStore unavailable → empty + ready | load `{}`; hydrate marks ready; provider paints | `provider-tokens-secure-store.test.ts:73-75`; `session-preferences-store.test.ts:312-313`; `session-gate.test.tsx:95-97` | ✅ PASS |
| PRES-05g: reset clears memory + SecureStore | `tokens {}` + `clearCalls === 1` | `session-preferences-store.test.ts:328-331` — `tokens` empty; `clearCalls` 1 | ✅ PASS |

### P1: TanStack Query + hooks (PRES-06..12, PRES-19)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| PRES-06: QueryClientProvider wraps product tree | Provider renders children; App entry nests Query→Container→Navigator | `AppQueryProvider.test.tsx:19` — child text; `HomeScreen.test.tsx:68-77` — indices `queryIdx < containerIdx < navIdx` | ✅ PASS |
| PRES-07: useSearchRepos infinite + key has dataSource+query | Infinite pages; cache under `queryKeys.repos.search(ds, q)` | `use-search-repos.test.ts:57-69`, `:87-89`; `query-keys.test.ts:5-9` | ✅ PASS |
| PRES-08: useRepoDetails + key dataSource+repoId | useQuery data under detail key | `use-repo-details.test.ts:39-42`, `:59-61`; `query-keys.test.ts:23-28` | ✅ PASS |
| PRES-09: useRepoIssues infinite + key | Infinite pages; issues key | `use-repo-issues.test.ts:66-79`, `:98-100`; `query-keys.test.ts:41-46` | ✅ PASS |
| PRES-10: toggle = key isolation only (no invalidate/remove) | Prior cache kept; spies not called | `use-search-repos.test.ts:146-149`; `use-repo-details.test.ts:132-139`; `use-repo-issues.test.ts:159-167` | ✅ PASS |
| PRES-11: hooks no github/gitlab/fetch | Import/fetch scan clean | `isolation.test.ts:88` — `expect(violations).toEqual([])`; per-hook source regex tests | ✅ PASS |
| PRES-12: AppError surfaces in Query error | `isAppError` + matching `code` | `use-search-repos.test.ts:174-175` (`rate_limit`); details `not_found`; issues `forbidden` | ✅ PASS |
| PRES-19: hooks under `src/presentation/hooks/` | Product hooks live in that tree | Paths of hook modules + `isolation.test.ts:61` scans `../hooks` | ✅ PASS |

### P1: Mapper (PRES-13..16)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| PRES-13: all known codes → non-empty user-facing string | Non-empty string ≠ raw code for each `AppErrorCode` | `map-app-error-to-message.test.ts:22-26` — `it.each(ALL_CODES)` | ✅ PASS |
| PRES-14: non-AppError → unknown copy | Same string as `unknown` AppError | `map-app-error-to-message.test.ts:30-35` | ✅ PASS |
| PRES-15: pure (no React/RN/Query) | Source has no those imports | `map-app-error-to-message.test.ts:52-54` | ✅ PASS |
| PRES-16: rate_limit ignores cause | Same string with/without cause | `map-app-error-to-message.test.ts:43` — `expect(withCause).toBe(withoutCause)` | ✅ PASS |

### P2: Smoke / Home (PRES-17..18)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| PRES-17: providers ancestors of RootNavigator | App.tsx nesting order | `HomeScreen.test.tsx:68-77` | ✅ PASS |
| PRES-18: Home Header toggles still work | Theme + dataSource toggles | `HomeScreen.test.tsx:19-50` | ✅ PASS |
| P2 AC3: no search results UI required | Out of scope / not asserted as presence | N/A — absence of product search UI (by design) | ✅ PASS (N/A) |

**Status**: ❌ Gaps present — Build lint gate failed; minor PRES-01 adapter-import assertion gap; edge “future AppError code” untested

---

## Discrimination Sensor

Scratch mutations applied in-tree with file backups, then restored (no leftover diff on mutated paths). Depth: lightweight (3 targeted + 1 bonus).

| Mutation | File | Description | Killed? |
| -------- | ---- | ----------- | ------- |
| 1 | `src/presentation/query-keys.ts` | Dropped `dataSource` from `repos.search` key tuple | ✅ Killed — `query-keys.test.ts:5` (`toEqual` expected `'github'` slot). Note: `use-search-repos` suite alone still passed (asserts via same mutated factory) |
| 2 | `src/presentation/errors/map-app-error-to-message.ts` | `rate_limit` with `cause` appends `" (retry)"` | ✅ Killed — `map-app-error-to-message.test.ts:43` |
| 3 | `src/presentation/providers/AppContainerProvider.tsx` | Memo ignores `tokens` (always `{}`) | ✅ Killed — `AppContainerProvider.test.tsx:94-95` |
| 3b (bonus) | `src/stores/session-preferences-store.ts` | `partialize` includes `tokens` | ✅ Killed — `session-preferences-store.test.ts:283` |

**Sensor depth**: lightweight
**Result**: 3/3 primary killed (4/4 with bonus) — PASS ✅

---

## Interactive UAT Results

Skipped — bridge feature; no interactive product search UI (per verifier brief).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ (NEXT.md defers UI) |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ (mapper asserts non-empty ≠ code; exact PT-BR copy not mandated by AC text) |
| Per-layer Coverage Expectation | ✅ |
| Every test maps to a spec requirement | ✅ (plus harness/defaults) |
| Documented guidelines followed | ✅ `AGENTS.md` / Expo v54; AD-005/006 |
| Lint clean on feature files | ❌ prettier/prettier errors in presentation providers/hooks/tests + `src/test/render.tsx` |

---

## Edge Cases

- [x] dataSource toggle mid-flight / key isolation — covered (PRES-10 suites)
- [x] empty search → `enabled: false` — `use-search-repos.test.ts:92-110`
- [x] `useAppContainer` without provider throws — PRES-03
- [ ] unexpected future `AppError` code string → unknown fallback — **no dedicated test** (implementation has `code in APP_ERROR_MESSAGES` guard)
- [x] A→B→A cache reuse — github cache retained after toggle (PRES-10)

---

## Gate Check

- **Gate command**: `pnpm test --watchman=false` && `pnpm lint` (tasks.md: `pnpm test` && `pnpm lint`)
- **Result**: **326** passed, **0** failed, **0** skipped; **lint FAILED** (12 errors, 6 warnings)
- **Test count before feature** (infra validation at prior tip): **260** passed
- **Test count after feature** (`025b00f` / HEAD): **326** passed (59 suites)
- **Delta**: **+66** tests
- **Skipped tests**: none
- **Failures**: none in Jest
- **Lint errors (blocking)**:
  - Feature-touched prettier: `AppContainerProvider.tsx` (4), `AppContainerProvider.test.tsx` (3), `map-app-error-to-message.test.ts` (2), `use-repo-issues.ts` (1), `AppQueryProvider.tsx` (1), `src/test/render.tsx` (1)
  - Likely pre-existing / out of slice: `storybook.requires.ts`, `styled.d.ts`, `AppThemeProvider.test.tsx` (unused-vars), `src/test/setup.ts`

---

## Fix Plans

### Fix 1: Restore lint gate (prettier on presentation slice)

- **Root cause**: Feature files committed with formatting that fails `prettier/prettier` under project ESLint
- **Fix task**: Run prettier (or eslint --fix) on the listed presentation/test files; re-run `pnpm lint` until 0 errors (or confirm/exclude pre-existing files per project policy)
- **Priority**: Blocker (Build gate)

### Fix 2 (optional): Assert provider does not import adapters

- **Root cause**: PRES-01 “SHALL NOT import repository adapters directly” has no source-scan test
- **Fix task**: Add isolation assertion on `AppContainerProvider.tsx` forbidding `@/infrastructure/github|gitlab` imports
- **Priority**: Minor

### Fix 3 (optional): Edge — unexpected AppError code

- **Root cause**: Spec edge case untested
- **Fix task**: Cast/`as` a fake code through mapper → expect unknown copy
- **Priority**: Minor

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| PRES-01..19 (all 25) | Pending / Implementing | ⚠️ Spec outcomes covered in tests; **feature not Verified** until lint gate green |
| Overall feature | Execute close | ❌ Needs Fix (lint) |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 25/25 ACs have behavioral evidence; 1 sub-clause (provider adapter-import scan) + 1 edge case lightly under-specified in tests
**Sensor**: 3/3 primary mutations killed (bonus partialize killed)
**Gate**: 326 passed; **lint exit 1**

**What works**: Providers, SecureStore tokens, queryKeys/hooks isolation, mapper, Home chrome, discrimination sensor.

**Issues found**: Build lint gate fails on prettier in feature files (blocker).

**Next steps**: Fix prettier/lint on presentation slice → re-run Verifier gate; optional minor assertion gaps.
