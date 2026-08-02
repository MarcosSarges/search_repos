# Presentation Layer (Bridge) Validation

**Date**: 2026-08-02
**Spec**: `.specs/features/presentation-layer/spec.md`
**Diff range**: `53b967e^..c843ff5` (feature commits `53b967e`…`c843ff5`; fix iteration 1 at `c843ff5`)
**Verifier**: independent sub-agent (author ≠ verifier) — fresh pass after fix iteration 1
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
| Fix-1 | ✅ Done | prettier/lint on presentation slice (`c843ff5`) |
| Fix-2 | ✅ Done | AppContainerProvider adapter-import source scan |
| Fix-3 | ✅ Done | unexpected AppError code → unknown mapper test |
| Fix-4 | ✅ Done | `jest --watchman=false` in package.json |

---

## Spec-Anchored Acceptance Criteria

### P1: Composition / tokens (PRES-01..05g)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| PRES-01: provider mounts → `createContainer({ dataSource, tokens })` from store; no direct adapter imports | Container wired from session; no github/gitlab adapter imports in provider | `AppContainerProvider.test.tsx:58-60` — `getRepoDetails` resolves; `:133-135` — `not.toMatch(/github\/create-github\|gitlab\/create-gitlab/)`, `toMatch(/createContainer/)` | ✅ PASS |
| PRES-02: dataSource/tokens change → new container instance | `result.current` identity changes | `AppContainerProvider.test.tsx:76` — `expect(result.current).not.toBe(first)` (dataSource); `:93` (tokens) | ✅ PASS |
| PRES-03: `useAppContainer` outside provider throws | Clear error mentioning provider | `AppContainerProvider.test.tsx:99` — `rejects.toThrow(/AppContainerProvider/)` | ✅ PASS |
| PRES-04: `di/` still no Zustand/React | Scan finds no zustand / session-preferences-store imports | `create-container.test.ts:126` — `expect(violations).toEqual([])` | ✅ PASS |
| PRES-05: empty tokens → anonymous | Container still created / works with `tokens: {}` | `AppContainerProvider.test.tsx:125-128` — empty tokens + `getRepoDetails` resolves | ✅ PASS |
| PRES-05b: typed `tokens` slot default empty | `tokens === {}`; setters present | `session-preferences-store.test.ts:207-211` — `expect(store.getState().tokens).toEqual({})` | ✅ PASS |
| PRES-05c: partialize only mode+dataSource | Persisted JSON has no tokens | `session-preferences-store.test.ts:283-284` — `toEqual({ mode, dataSource })`; `not.toHaveProperty('tokens')` | ✅ PASS |
| PRES-05d: setToken → SecureStore write / clear deletes | Adapter `setItemAsync` / `deleteItemAsync`; store write-through | `provider-tokens-secure-store.test.ts:47-50`, `:58-59`; `session-preferences-store.test.ts:228`, `:265` | ✅ PASS |
| PRES-05e: cold start restores tokens before product UI | Gate waits both hydrates; hydrate loads SS; boot triggers hydrate | `session-gate.test.tsx:38-45`, `:66-67`, `:101-116`; `session-preferences-store.test.ts:295-299` | ✅ PASS |
| PRES-05f: SecureStore unavailable → empty + ready | load `{}`; hydrate marks ready; provider paints | `provider-tokens-secure-store.test.ts:73`; `session-preferences-store.test.ts:312`; `session-gate.test.tsx:95-97` | ✅ PASS |
| PRES-05g: reset clears memory + SecureStore | `tokens {}` + `clearCalls === 1` | `session-preferences-store.test.ts:328-331` — `tokens` empty; `clearCalls` 1 | ✅ PASS |

### P1: TanStack Query + hooks (PRES-06..12, PRES-19)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| PRES-06: QueryClientProvider wraps product tree | Provider renders children; App entry nests Query→Container→Navigator | `AppQueryProvider.test.tsx:19` — child text; `HomeScreen.test.tsx:72-77` — indices `queryIdx < containerIdx < navIdx` | ✅ PASS |
| PRES-07: useSearchRepos infinite + key has dataSource+query | Infinite pages; cache under `queryKeys.repos.search(ds, q)` | `use-search-repos.test.ts` infinite pages + key; `query-keys.test.ts:5-9` | ✅ PASS |
| PRES-08: useRepoDetails + key dataSource+repoId | useQuery data under detail key | `use-repo-details.test.ts:39-42`, `:59-60`; `query-keys.test.ts:23-28` | ✅ PASS |
| PRES-09: useRepoIssues infinite + key | Infinite pages; issues key | `use-repo-issues.test.ts:66-79`, `:98-99`; `query-keys.test.ts:41-46` | ✅ PASS |
| PRES-10: toggle = key isolation only (no invalidate/remove) | Prior cache kept; spies not called | `use-search-repos.test.ts` toggle suite; `use-repo-details.test.ts:132-139`; `use-repo-issues.test.ts:159-166` | ✅ PASS |
| PRES-11: hooks no github/gitlab/fetch | Import/fetch scan clean | `isolation.test.ts:88` — `expect(violations).toEqual([])`; per-hook source regex tests | ✅ PASS |
| PRES-12: AppError surfaces in Query error | `isAppError` + matching `code` | `use-search-repos.test.ts:174-175` (`rate_limit`); details `not_found`; issues `forbidden` | ✅ PASS |
| PRES-19: hooks under `src/presentation/hooks/` | Product hooks live in that tree | Paths of hook modules + `isolation.test.ts` scans `../hooks` | ✅ PASS |

### P1: Mapper (PRES-13..16)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| PRES-13: all known codes → non-empty user-facing string | Non-empty string ≠ raw code for each `AppErrorCode` | `map-app-error-to-message.test.ts:21-26` — `it.each(ALL_CODES)` | ✅ PASS |
| PRES-14: non-AppError → unknown copy | Same string as `unknown` AppError | `map-app-error-to-message.test.ts:29-35` | ✅ PASS |
| PRES-15: pure (no React/RN/Query) | Source has no those imports | `map-app-error-to-message.test.ts:45-49` | ✅ PASS |
| PRES-16: rate_limit ignores cause | Same string with/without cause | `map-app-error-to-message.test.ts:41` — `expect(withCause).toBe(withoutCause)` | ✅ PASS |

### P2: Smoke / Home (PRES-17..18)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| PRES-17: providers ancestors of RootNavigator | App.tsx nesting order | `HomeScreen.test.tsx:72-77` | ✅ PASS |
| PRES-18: Home Header toggles still work | Theme + dataSource toggles | `HomeScreen.test.tsx:19-50` | ✅ PASS |
| P2 AC3: no search results UI required | Out of scope / not asserted as presence | N/A — absence of product search UI (by design) | ✅ PASS (N/A) |

**Status**: ✅ All ACs covered

---

## Discrimination Sensor

Scratch mutations via file backup → mutate → scoped Jest → restore. Working tree left clean on mutated paths. Depth: lightweight (3 targeted).

| Mutation | File | Description | Killed? |
| -------- | ---- | ----------- | ------- |
| 1 | `src/presentation/query-keys.ts` | Dropped `dataSource` from `repos.search` key tuple | ✅ Killed — `query-keys.test.ts:5` (`toEqual` expected `'github'` slot) |
| 2 | `src/presentation/errors/map-app-error-to-message.ts` | `rate_limit` with `cause` appends `" (retry)"` | ✅ Killed — `map-app-error-to-message.test.ts:41` |
| 3 | `src/presentation/providers/AppContainerProvider.tsx` | Memo ignores `tokens` (always `{}`) | ✅ Killed — `AppContainerProvider.test.tsx:92-93` |

**Sensor depth**: lightweight
**Result**: 3/3 killed — PASS ✅

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
| Lint clean | ✅ 0 errors (6 pre-existing warnings outside presentation slice) |

---

## Edge Cases

- [x] dataSource toggle mid-flight / key isolation — covered (PRES-10 suites)
- [x] empty search → `enabled: false` — `use-search-repos.test.ts` empty-query suite
- [x] `useAppContainer` without provider throws — PRES-03
- [x] unexpected future `AppError` code string → unknown fallback — `map-app-error-to-message.test.ts:52-56`
- [x] A→B→A cache reuse — github cache retained after toggle (PRES-10)

---

## Gate Check

- **Gate command**: `pnpm test` && `pnpm lint` (tasks.md Build; `package.json` runs `jest --watchman=false`)
- **Result**: **328** passed, **0** failed, **0** skipped; **lint PASSED** (0 errors, 6 warnings)
- **Test count before feature** (infra validation at prior tip): **260** passed
- **Test count after feature** (`c843ff5` / HEAD): **328** passed (59 suites)
- **Delta**: **+68** tests
- **Skipped tests**: none
- **Failures**: none
- **Lint warnings (non-blocking)**: `storybook.requires.ts`, `styled.d.ts`, `AppThemeProvider.test.tsx`, `src/test/setup.ts` — pre-existing / out of slice

---

## Fix Plans

None — all prior gaps closed by `c843ff5`; this pass is clean.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| PRES-01..19 (all 25) | ⚠️ Needs Fix (lint) / Implementing | ✅ Verified |
| Overall feature | Fix iteration 1 | ✅ Ready |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 25/25 ACs matched spec outcome (0 spec-precision gaps)
**Sensor**: 3/3 mutations killed
**Gate**: 328 passed; lint 0 errors

**What works**: Providers, SecureStore tokens, queryKeys/hooks isolation, mapper (incl. unexpected code), Home chrome, discrimination sensor, lint/watchman fixes.

**Issues found**: none

**Next steps**: Feature ready; proceed to NEXT.md (product screens / credentials UI) when scheduled.

---

## Closeout (2026-08-02)

**Status**: **DONE** — feature closed by user (`spec done`).

Post-Verifier deltas (still on `feat/presentation-layer`, PR #9):

| Change | Commit / note |
| ------ | ------------- |
| AD-025 — drop `AppContainerProvider`; `useAppContainer()` from Zustand | `1ec2b75` |
| Drop presentation isolation source scans | `19077ff` |
| `src/presentation/constants/` (`queryKeys` + Query defaults) | `493fffb` |

Follow-ups remain in `.specs/features/presentation-layer/NEXT.md` (new specs).
