# Application Layer Validation

**Date**: 2026-08-02
**Spec**: `.specs/features/application-layer/spec.md`
**Diff range**: `efd3452..HEAD` (feature commits `79ec106..609daac`; branch vs `5016c19`: `5016c19..HEAD`)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T1   | ✅ Done | Pagination constants |
| T2   | ✅ Done | `normalizeRepoId` + tests |
| T3   | ✅ Done | Functional `createSearchRepos` |
| T4   | ✅ Done | Functional details + list-issues |
| T5   | ✅ Done | Fake under `infrastructure/repositories/` |
| T6   | ✅ Done | `resolveRepository` both sources |
| T7   | ✅ Done | `createContainer` composition root |
| T8   | ✅ Done | Barrels + isolation + public API |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| APP-01: factory returns `(input) => Promise<…>` not `{ execute }` | Callable function; no `.execute` at call site | `create-container.test.ts:29-33` — `typeof container.searchRepos === 'function'`; `not.toHaveProperty('searchRepos.execute')`; UC suites invoke factories as functions (`search-repos.test.ts:37`, `get-repo-details-and-issues.test.ts:36`) | ✅ PASS |
| APP-02: search uses `normalizeSearchQuery` (no inline empty check) | Empty/whitespace → `empty_query` via domain helper | `search-repos.test.ts:37-39` — `rejects.toMatchObject({ code: 'empty_query' })` for `'   '` (code unique to `normalizeSearchQuery`) | ✅ PASS |
| APP-03: omitted page/perPage → defaults `1` / `20` | Port called with `page: 1`, `perPage: 20` | `search-repos.test.ts:80` — `expect(search).toHaveBeenCalledWith({ query: 'react', page: 1, perPage: 20 })` | ✅ PASS |
| APP-04: invalid page/perPage → `invalid_input` via asserts | `AppError` code `invalid_input` | `search-repos.test.ts:86-88` — `page: 0` → `invalid_input`; `search-repos.test.ts:94-96` — `perPage: 0` → `invalid_input` | ✅ PASS |
| APP-05: empty/whitespace `repoId` → `invalid_input` | `AppError` code `invalid_input` (not `not_found`) | `repo-id.test.ts:7-8` / `13-14` — `normalizeRepoId` → `invalid_input`; `get-repo-details-and-issues.test.ts:42-44` — `'   '` → `invalid_input`; `:65-67` — `''` → `invalid_input` | ✅ PASS |
| APP-06: list-issues omitted page/perPage → defaults `1` / `20` | Port `listIssues` called with `page: 1`, `perPage: 20` | `get-repo-details-and-issues.test.ts:86-90` — `toHaveBeenCalledWith({ repoId, page: 1, perPage: 20 })` | ✅ PASS |
| APP-07: `src/application/` no forbidden frameworks | Scan finds zero forbidden import specifiers | `isolation.test.ts:48-70` — `expect(violations).toEqual([])` (react, RN, expo, axios, async-storage, tanstack, zustand, styled-components, `@/infrastructure`) | ✅ PASS |
| APP-08: Fake under `src/infrastructure/` | Fake lives under infrastructure (not `application/fakes/`) | `in-memory-repo-repository.test.ts:8-15` under `src/infrastructure/repositories/__tests__/`; source at `repositories/in-memory-repo-repository.ts`; no `src/application/fakes/` on tree | ✅ PASS |
| APP-09: `resolveRepository('github'|'gitlab')` → `RepoRepository` | Both literals return working Fake | `resolve-repository.test.ts:10-20` — `it.each(['github','gitlab'])` asserts port methods + `getById('missing')` → `not_found` | ✅ PASS |
| APP-10: `createContainer` exposes callable UC functions | `searchRepos` / `getRepoDetails` / `listRepoIssues` are functions | `create-container.test.ts:29-39` — `typeof` each function; smoke `searchRepos` resolves | ✅ PASS |
| APP-11: distinct container instances per call | Two containers not same reference; wired fns distinct | `create-container.test.ts:46-47` — `expect(github).not.toBe(gitlab)`; `searchRepos` refs distinct | ✅ PASS |
| APP-12: `di/` must not import Zustand / session store | Scan violations empty | `create-container.test.ts:60-80` — `expect(violations).toEqual([])` | ✅ PASS |
| APP-13: `@/application` barrel excludes DI/Fake | No `createContainer` / `resolveRepository` / Fake export | `public-api.test.ts:20-30` — `hasOwnProperty` false + barrel source `not.toMatch` those symbols / `infrastructure` | ✅ PASS |
| APP-14: `@/infrastructure` exposes container + Fake (+ resolve) | Callable `createContainer`, Fake, `resolveRepository`; types in barrel | `infrastructure/__tests__/public-api.test.ts:11-28` — `typeof` exports + barrel matches `CreateContainerDeps` / `AppContainer` | ✅ PASS |
| APP-15: `@/application` exports factories, I/O types, DataSource | Factories + `isDataSource` reachable; barrel re-exports types | `application/__tests__/public-api.test.ts:11-17` + `:36-43` — factories/`isDataSource`; barrel matches `DataSource`, UC type names | ✅ PASS |
| APP-16: UC tests import Fake from infrastructure | Import from `@/infrastructure` (not `application/fakes`) | `search-repos.test.ts:3` — `from '@/infrastructure'`; `get-repo-details-and-issues.test.ts:3` — same | ✅ PASS |

**Status**: ✅ All ACs covered (16/16) — 0 spec-precision gaps flagged

---

## Discrimination Sensor

Scratch: `git worktree` at `HEAD` + symlink to repo `node_modules` (mutations discarded; main tree unchanged aside from pre-existing `Teste_Tecnico_React_Native_v3.md`).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/application/validation/repo-id.ts:6` | `invalid_input` → `not_found` on empty repoId | ✅ Killed — `repo-id.test.ts` + details/issues empty-`repoId` cases failed (4 failed) |
| 2 | `src/infrastructure/di/resolve-repository.ts` | Dropped `gitlab` factory branch | ✅ Killed — `resolve-repository.test.ts` gitlab case: `factories[dataSource] is not a function` |
| 3 | `src/application/constants/pagination.ts:2` | `DEFAULT_PER_PAGE` `20` → `10` | ✅ Killed — search + list defaults cases expected `perPage: 20` (2 failed) |

**Sensor depth**: lightweight (3 behavior-level mutations)
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

N/A — backend/application + DI only; automated checks sufficient.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ (HTTP / React provider deferred per Out of Scope) |
| Matches patterns | ✅ (domain helpers + colocated Jest) |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement — no unclaimed tests | ✅ |
| Documented guidelines followed: `AGENTS.md` / AD-006 Jest Node; AD-020 composition root | ✅ |

---

## Edge Cases

- [x] Search query `''` or whitespace-only → `empty_query` — whitespace at `search-repos.test.ts:37-39`; `''` via same `normalizeSearchQuery` (domain `search-query.test.ts` + UC path)
- [x] `page` `0` or negative → `invalid_input` — `search-repos.test.ts:86-88` (`page: 0`); list also `get-repo-details-and-issues.test.ts:98-100`
- [x] `perPage` present and `< 1` → `invalid_input` — `search-repos.test.ts:94-96`
- [x] `perPage` omitted → default `20` then assert — `search-repos.test.ts:80`; list `get-repo-details-and-issues.test.ts:86-90`
- [x] `repoId` `'   '` → `invalid_input` — `get-repo-details-and-issues.test.ts:42-44`
- [x] Fake `getById` miss → `not_found` — `in-memory-repo-repository.test.ts:12-15`; also resolve-repository smoke
- [x] `resolveRepository` both `DataSource` literals defined — `resolve-repository.test.ts:10-20`

---

## Gate Check

- **Gate command**: `pnpm test && pnpm lint`
- **Result**: **196** passed, **0** failed, **0** skipped; ESLint exit 0 (6 pre-existing warnings in unrelated files)
- **Test file count before feature** (`efd3452^`): 34 `*.test.ts(x)` files
- **Test file count after feature** (`HEAD`): 40 `*.test.ts(x)` files
- **Delta**: +6 test files (isolation, application public-api, repo-id, infrastructure public-api, resolve-repository, create-container); fake test relocated (R); UC suites expanded — no silent deletions
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

None — no gaps.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| APP-01..16  | Implementing    | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 16/16 ACs matched spec outcome | 0 spec-precision gaps
**Sensor**: 3/3 mutations killed
**Gate**: 196 passed

**What works**: Functional use-case factories with domain helpers and application defaults; Fake + DI under infrastructure; barrels enforce Dependency Rule; discrimination sensor kills empty-repoId code swap, gitlab branch drop, and wrong `perPage` default.

**Issues found**: none

**Next steps**: Mark feature done in STATE / handoff; presentation can consume `createContainer({ dataSource })`.
