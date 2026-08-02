# Domain Layer Validation

**Date**: 2026-08-02
**Spec**: `.specs/features/domain-layer/spec.md`
**Diff range**: `main..HEAD` (`71abbf5`…`60e0bd2`, 7 commits on `feat/domain-layer`)
**Verifier**: independent sub-agent (author ≠ verifier) — re-validation after fix commit `60e0bd2`

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T1   | ✅ Done | AppError + `invalid_input`; commit `71abbf5` |
| T2   | ✅ Done | Entities/pagination/port + fake; commit `2495d3e` |
| T3   | ✅ Done | `normalizeSearchQuery`; commit `33db431` |
| T4   | ✅ Done | `assertPage` / `assertPerPage`; commit `d5c4395` |
| T5   | ✅ Done | `DataSource` → application; commit `e747404` |
| T6   | ✅ Done | Barrel + isolation/public-api tests; commit `b57bc37` |
| Fix  | ✅ Done | Entity shape locks + fake AppError rejection; commit `60e0bd2` |

All T1–T6 Done-when checkboxes marked complete in `tasks.md`. Prior Verifier gaps (DOM-02/04/05/11) addressed in `60e0bd2`.

---

## Spec-Anchored Acceptance Criteria

Mapped to requirement IDs DOM-01..17 (spec ACs).

| ID | Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| -- | ------------------------- | -------------------- | ----------------------- | ------ |
| DOM-01 | Domain exports Repo, Issue, IssueLabel, PaginatedResult, RepoRepository (+ related inputs) | Barrel re-exports those symbols | `src/domain/__tests__/public-api.test.ts:31-37` — `expect(barrelSource).toMatch(/\bRepo\b/)` (+ Issue, IssueLabel, PaginatedResult, RepoRepository, SearchReposInput, ListIssuesInput) | ✅ PASS |
| DOM-01 | Domain SHALL NOT export DataSource | No DataSource / isDataSource on barrel | `src/domain/__tests__/public-api.test.ts:20-25` — `hasOwnProperty…DataSource` false; `barrelSource).not.toMatch(/\bDataSource\b/)` | ✅ PASS |
| DOM-02 | Repo / Issue SHALL NOT include `source` | No provider/source field on entities | `src/domain/entities/__tests__/entity-shapes.test.ts:14-15` — `expect(repoSource).not.toMatch(/\bsource\s*[?:]/)` (+ issue) | ✅ PASS |
| DOM-03 | Repo.id / repoId opaque `string` | Identity is `string`; repoId on getById/listIssues | Types: `src/domain/entities/repo.ts:2` `id: string`; `src/domain/repositories/repo-repository.ts:14,28` `repoId: string`. Runtime: `src/application/fakes/__tests__/in-memory-repo-repository.test.ts:12` — `getById('missing-repo')`; fixtures use string ids (`get-repo-details-and-issues.test.ts:8,36`) | ✅ PASS |
| DOM-04 | PaginatedResult has items, page, perPage, hasNextPage; NO totalCount | Exact field set without totalCount | `src/domain/entities/__tests__/entity-shapes.test.ts:19-23` — match `items`/`page`/`perPage`/`hasNextPage`; `not.toMatch(/\btotalCount\b/)` | ✅ PASS |
| DOM-05 | Optional entity fields via `?:` / undefined, not `null` | `description?`, `language?`, etc.; no `\| null` | `src/domain/entities/__tests__/entity-shapes.test.ts:27-34` — `toMatch(/\bdescription\?\s*:/)` (+ peers); `not.toMatch(/\|\s*null\b/)` | ✅ PASS |
| DOM-06 | perPage may be omitted; no domain default constant | `perPage?:` on inputs; domain has no default | Types: `repo-repository.ts:9,17`. Helper: `pagination.test.ts:42-44` — `assertPerPage(undefined)` does not throw. Grep: no DEFAULT_PER in `src/domain` | ✅ PASS |
| DOM-07 | Page `1` is first page (1-based) | Documented + used as 1-based | JSDoc: `repo-repository.ts:7-8,15-16,24`. Behavior: `search-repos.test.ts:55-61` — page 1 / page 2 pagination | ✅ PASS |
| DOM-08 | createAppError(code, cause?) → AppError; no user-facing message param | code set; cause optional; Error.message = code | `app-error.test.ts:13-20` — `expect(error.code).toBe(code)`; `expect(error.message).toBe(code)`; `app-error.test.ts:22-28` — `expect(error.cause).toBe(cause)` | ✅ PASS |
| DOM-09 | isAppError(createAppError(…)) → true | Guard returns true for factory values | `app-error.test.ts:44` — `expect(isAppError(createAppError('not_found'))).toBe(true)` | ✅ PASS |
| DOM-10 | AppErrorCode exactly six codes incl. invalid_input | `rate_limit\|network\|not_found\|empty_query\|invalid_input\|unknown` | `app-error.test.ts:30-39` — `expect(ALL_CODES).toEqual([…six codes…])` | ✅ PASS |
| DOM-11 | Port rejects representable as AppError (via fakes / isAppError) | Fake rejection is AppError with code | `src/application/fakes/__tests__/in-memory-repo-repository.test.ts:14-15` — `expect(isAppError(rejection)).toBe(true)`; `toMatchObject({ code: 'not_found' })` | ✅ PASS |
| DOM-12 | Domain sources SHALL NOT import forbidden frameworks | Zero violations | `isolation.test.ts:69` — `expect(violations).toEqual([])` | ✅ PASS |
| DOM-13 | Empty/whitespace query → AppError `empty_query` | code === `empty_query` | `search-query.test.ts:10-11,20-21` — `expect(error).toMatchObject({ code: 'empty_query' })` | ✅ PASS |
| DOM-14 | Leading/trailing spaces → trimmed query | `'  react  '` → `'react'` | `search-query.test.ts:26` — `expect(normalizeSearchQuery('  react  ')).toBe('react')` | ✅ PASS |
| DOM-15 | page &lt; 1 or present perPage &lt; 1 → `invalid_input`; valid/omitted OK | code `invalid_input`; no throw on valid | `pagination.test.ts:11,21,38` — `{ code: 'invalid_input' }`; `:26-27,:42-44,:47-48` — `.not.toThrow()` | ✅ PASS |
| DOM-16 | Barrel covers public API without deep imports | Helpers + types reachable from `@/domain` | `public-api.test.ts:12-16,28-45` | ✅ PASS |
| DOM-17 | DataSource lives under application; not domain | Type in `src/application/`; consumers import from `@/application` | `src/application/types/data-source.ts:1-4`; `src/application/index.ts:1-2`; domain absence via `public-api.test.ts:19-25`; no `src/domain/entities/data-source.ts` | ✅ PASS |

### Edge cases (spec)

| Edge case | Evidence | Result |
| --------- | -------- | ------ |
| `''` / whitespace → `empty_query` | `search-query.test.ts:4-23` | ✅ |
| `perPage` undefined → skip lower bound | `pagination.test.ts:42-44` | ✅ |
| page `0` / negative → `invalid_input` | `pagination.test.ts:5-23` | ✅ |
| `cause` preserved on createAppError | `app-error.test.ts:22-28` | ✅ |
| isAppError(non-Error) → false | `app-error.test.ts:47-56` | ✅ |

**Status**: ✅ All ACs covered (17/17)

---

## Discrimination Sensor

Scratch method: backup → mutate working copies → run targeted Jest → restore backups. Tree restored clean after sensors (`diff` confirmed for all mutated paths).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/domain/validation/search-query.ts:5` | Flipped empty check: `if (!trimmed)` → `if (trimmed)` | ✅ Killed (3 tests failed) |
| 2 | `src/domain/validation/pagination.ts` | Changed `invalid_input` → `unknown` on both asserts | ✅ Killed (3 tests failed on code match) |
| 3 | `src/domain/entities/repo.ts` | Reintroduced `source?: string` on `Repo` (DOM-02 regression) | ✅ Killed (`entity-shapes.test.ts:14`) |

**Sensor depth**: lightweight (3 behavior mutations)
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

N/A — domain/contracts feature; not user-facing UI.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ (compat-only consumer import moves + targeted fix tests) |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation | ✅ domain 1:1 ACs; entity shapes locked by source-scan tests post-`60e0bd2` |
| Every test maps to a spec requirement | ✅ domain/fake tests map to DOM-*; app suite is compat gate |
| Documented guidelines followed | ✅ `AGENTS.md` / AD-006 Jest domain in Node |

---

## Edge Cases

- [x] Empty / whitespace query → `empty_query`
- [x] `perPage` undefined → skip lower-bound check
- [x] page `0` / negative → `invalid_input`
- [x] `cause` preserved on `createAppError`
- [x] `isAppError` on non-Error → `false`

---

## Gate Check

- **Gate command**: `pnpm test && pnpm lint`
- **Result**: **173** passed, **0** failed, **0** skipped; ESLint **0 errors** (6 pre-existing warnings)
- **Test count before feature** (`main`): **135** `it`/`test`/`it.each` declarations under `src/**/*.test.*`
- **Test count after feature** (`HEAD`): **158** declarations; **173** runtime tests (includes `it.each` expansion)
- **Delta**: **+23** declarations; domain suites (errors, validation×2, isolation, public-api, entity-shapes) + fake AppError rejection; no silent deletion of application tests observed
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

None — prior gaps closed by `60e0bd2`; this re-validation found no new gaps.

---

## Requirement Traceability Update

| Requirement | Previous Status (prior FAIL) | New Status |
| ----------- | ---------------------------- | ---------- |
| DOM-01 | ✅ Verified | ✅ Verified |
| DOM-02 | ❌ Needs Fix | ✅ Verified |
| DOM-03 | ⚠️ Weak evidence | ✅ Verified |
| DOM-04 | ❌ Needs Fix | ✅ Verified |
| DOM-05 | ❌ Needs Fix | ✅ Verified |
| DOM-06 | ✅ Verified | ✅ Verified |
| DOM-07 | ✅ Verified | ✅ Verified |
| DOM-08 | ✅ Verified | ✅ Verified |
| DOM-09 | ✅ Verified | ✅ Verified |
| DOM-10 | ✅ Verified | ✅ Verified |
| DOM-11 | ❌ Needs Fix | ✅ Verified |
| DOM-12 | ✅ Verified | ✅ Verified |
| DOM-13 | ✅ Verified | ✅ Verified |
| DOM-14 | ✅ Verified | ✅ Verified |
| DOM-15 | ✅ Verified | ✅ Verified |
| DOM-16 | ✅ Verified | ✅ Verified |
| DOM-17 | ✅ Verified | ✅ Verified |

*(Statuses recorded here only — `spec.md` not mutated by Verifier.)*

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 17/17 ACs matched with evidence; 0 gaps
**Sensor**: 3/3 mutations killed
**Gate**: 173 passed, lint 0 errors

**What works**: Entity/pagination shape locks; AppError taxonomy + factory/guard; fake port rejection as AppError; validation helpers; isolation scan; public barrel without DataSource; DataSource under application; full suite green; sensors discriminate helpers and DOM-02 shape lock.

**Issues found**: none

**Next steps**: Feature ready — update Handoff / mark verified as orchestrator prefers.
