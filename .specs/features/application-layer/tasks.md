# Application Layer — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/application-layer/design.md`  
**Status**: Done — Verifier PASS

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` / AD-006 (Jest; application testable in Node), AD-001/AD-002/AD-019/AD-020, colocated `__tests__` (e.g. `src/application/use-cases/__tests__`, `src/domain/__tests__/isolation.test.ts`), `package.json` scripts `test` / `lint`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Use cases (search / details / issues) | unit | 1:1 APP-01..06 + edge cases (empty query, bad page/perPage, empty repoId, defaults) | `src/application/use-cases/__tests__/*.test.ts` | `pnpm test` |
| `normalizeRepoId` | unit | empty/whitespace → `invalid_input`; trim success | `src/application/validation/__tests__/*.test.ts` | `pnpm test` |
| Application isolation + public API | unit | APP-07 forbidden imports (+ no `@/infrastructure` in prod sources); APP-13/15 barrel | `src/application/__tests__/*.test.ts` | `pnpm test` |
| Pagination constants | none | Compile + exercised by use-case tests | `src/application/constants/*` | via use-case tests |
| In-memory Fake repository | unit | Key paths already (search/get/list + `not_found`); keep green after move (APP-08/16) | `src/infrastructure/repositories/__tests__/*.test.ts` (or migrate existing fake test) | `pnpm test` |
| `resolveRepository` / `createContainer` | unit | APP-09..12 (branches, callables, distinct instances, no Zustand in di sources) | `src/infrastructure/di/__tests__/*.test.ts` | `pnpm test` |
| Infrastructure public API | unit | APP-14 exports `createContainer`, types, Fake | `src/infrastructure/__tests__/*.test.ts` | `pnpm test` |

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After application-only unit tasks | `pnpm test -- src/application` |
| Full | After Fake move / DI / barrels | `pnpm test` |
| Build | Phase end / feature close | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Application foundation

```
T1 → T2
```

### Phase 2: Functional use cases

```
T3 → T4
```

### Phase 3: Fake → infrastructure

```
T5
```

### Phase 4: Composition root

```
T6 → T7
```

### Phase 5: Barrels + isolation

```
T8
```

---

## Task Breakdown

### T1: Pagination defaults (application constants)

**What**: Add `DEFAULT_PAGE = 1` and `DEFAULT_PER_PAGE = 20` in application constants module.  
**Where**: `src/application/constants/pagination.ts` (+ barrel export from constants if needed)  
**Depends on**: None  
**Reuses**: Design constants; enunciado `per_page=20`  
**Requirement**: APP-03, APP-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `DEFAULT_PAGE` and `DEFAULT_PER_PAGE` exported with values `1` and `20`
- [x] No domain default constants introduced
- [x] Gate: `pnpm test -- src/application` (suite still green; constants unused until T3/T4)
- [x] Test count: no silent deletions

**Tests**: none  
**Gate**: quick  
**Commit**: `feat(application): add pagination default constants`

---

### T2: `normalizeRepoId` helper

**What**: Implement `normalizeRepoId(raw)` — trim; empty → `createAppError('invalid_input')`; return trimmed id.  
**Where**: `src/application/validation/repo-id.ts`, `src/application/validation/__tests__/repo-id.test.ts`  
**Depends on**: T1  
**Reuses**: `createAppError` from `@/domain`; mirror `normalizeSearchQuery` style  
**Requirement**: APP-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Unit tests: `''` / whitespace → `{ code: 'invalid_input' }`; `'  a/b  '` → `'a/b'`
- [x] Gate: `pnpm test -- src/application/validation`
- [x] Test count: ≥ 2 tests for normalizeRepoId; no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(application): add normalizeRepoId helper`

---

### T3: Refactor `createSearchRepos` (functional + domain helpers)

**What**: Rename/refactor search factory to return `(input) => Promise<…>`; use `normalizeSearchQuery`, defaults from T1, `assertPage`/`assertPerPage`; update search unit tests (no `.execute`).  
**Where**: `src/application/use-cases/search-repos.ts`, `src/application/use-cases/__tests__/search-repos.test.ts`, `src/application/index.ts` (export rename as needed)  
**Depends on**: T2  
**Reuses**: Fake still at `application/fakes` until T5; domain validation helpers  
**Requirement**: APP-01, APP-02, APP-03, APP-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Factory returns a function (not `{ execute }`)
- [x] Source uses `normalizeSearchQuery` / `assertPage` / `assertPerPage` (no inline empty-query duplicate)
- [x] Tests cover empty query, happy path, pagination, invalid page and/or perPage → `invalid_input`
- [x] Gate: `pnpm test -- src/application/use-cases`
- [x] Test count: search suite ≥ 4 assertions/cases; no silent deletions of unrelated tests

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(application): make createSearchRepos functional with domain helpers`

---

### T4: Refactor `createGetRepoDetails` + `createListRepoIssues`

**What**: Both factories return functions; use `normalizeRepoId`; list-issues applies same pagination defaults + asserts as search; update combined/ split unit tests.  
**Where**: `src/application/use-cases/get-repo-details.ts`, `list-repo-issues.ts`, `__tests__/get-repo-details-and-issues.test.ts` (or split), barrel exports  
**Depends on**: T3  
**Reuses**: T1 constants, T2 `normalizeRepoId`, Fake until T5  
**Requirement**: APP-01, APP-05, APP-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Both factories return functions (not `{ execute }`)
- [x] Empty/whitespace `repoId` → `invalid_input` (not `not_found`)
- [x] List-issues omits page/perPage → defaults 1/20 then port call
- [x] Tests cover happy paths + empty repoId (+ optional invalid page on list)
- [x] Gate: `pnpm test -- src/application/use-cases`
- [x] Test count: details+issues cases ≥ 4 total; no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(application): functional getRepoDetails and listRepoIssues`

---

### T5: Move Fake to infrastructure repositories

**What**: Move `createInMemoryRepoRepository` to `src/infrastructure/repositories/in-memory-repo-repository.ts`; migrate existing fake test; delete `src/application/fakes/`; update all imports to `@/infrastructure` (or relative infra path).  
**Where**: `src/infrastructure/repositories/**`, delete `src/application/fakes/**`, use-case tests, any other Fake imports  
**Depends on**: T4  
**Reuses**: Current fake implementation verbatim  
**Requirement**: APP-08, APP-16

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] No `src/application/fakes/` directory
- [x] Fake lives under `src/infrastructure/repositories/`
- [x] Use-case tests import Fake from infrastructure
- [x] Existing fake `not_found` / port tests still pass
- [x] Gate: `pnpm test`
- [x] Test count: fake + use-case suites green; no silent deletions

**Tests**: unit  
**Gate**: full  
**Commit**: `refactor(infrastructure): move in-memory repo fake from application`

---

### T6: `resolveRepository(dataSource)`

**What**: Implement typed map/branches `github` | `gitlab` both returning `createInMemoryRepoRepository()`; unit tests for both literals.  
**Where**: `src/infrastructure/di/resolve-repository.ts`, `src/infrastructure/di/__tests__/resolve-repository.test.ts`  
**Depends on**: T5  
**Reuses**: Fake from T5; `DataSource` from `@/application`  
**Requirement**: APP-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Both `github` and `gitlab` resolve to a working `RepoRepository` (Fake)
- [x] Exhaustive `DataSource` coverage (no undefined fall-through)
- [x] Gate: `pnpm test -- src/infrastructure/di`
- [x] Test count: ≥ 2 cases (one per source); no silent deletions

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(infrastructure): add resolveRepository for DataSource`

---

### T7: `createContainer(deps)`

**What**: Immutable composition root: `repository ?? resolveRepository(dataSource)`; wire `searchRepos` / `getRepoDetails` / `listRepoIssues` as callables; tests for shape, override, distinct instances.  
**Where**: `src/infrastructure/di/create-container.ts`, `src/infrastructure/di/__tests__/create-container.test.ts`  
**Depends on**: T6  
**Reuses**: application factories from T3/T4; `resolveRepository`  
**Requirement**: APP-10, APP-11, APP-12

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `createContainer({ dataSource })` returns callable functions (no `.execute` required)
- [x] Two calls with different `dataSource` → distinct container object instances
- [x] Optional `repository` override used when provided
- [x] `src/infrastructure/di/**` sources do not import Zustand / session-preferences-store (assert in test or scan)
- [x] Gate: `pnpm test -- src/infrastructure`
- [x] Test count: ≥ 3 container cases; no silent deletions

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(infrastructure): add createContainer composition root`

---

### T8: Barrels + application isolation + public API smokes

**What**: Finalize `@/application` and `@/infrastructure` barrels; application isolation scan (forbidden frameworks + no `@/infrastructure` in prod sources); public-api tests APP-13..15; ensure `resolveRepository` exported from infra if designed.  
**Where**: `src/application/index.ts`, `src/infrastructure/index.ts`, `src/application/__tests__/isolation.test.ts`, `src/application/__tests__/public-api.test.ts`, `src/infrastructure/__tests__/public-api.test.ts`  
**Depends on**: T7  
**Reuses**: `src/domain/__tests__/isolation.test.ts` pattern  
**Requirement**: APP-07, APP-12, APP-13, APP-14, APP-15

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `@/application` exports factories, I/O types, `DataSource`/`isDataSource`; does **not** export DI/Fake
- [x] `@/infrastructure` exports `createContainer`, container typings, Fake factory (+ `resolveRepository` per design)
- [x] Application isolation test passes
- [x] Gate: `pnpm test` && `pnpm lint`
- [x] Test count: isolation + both public-api suites present and green; no silent deletions

**Tests**: unit  
**Gate**: build  
**Commit**: `feat(architecture): lock application and infrastructure public barrels`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Phase 1:  T1 ──→ T2
Phase 2:  T3 ──→ T4
Phase 3:  T5
Phase 4:  T6 ──→ T7
Phase 5:  T8
```

**Execute packing:** 8 tasks → single batch (≤ ~8) — execute inline unless user requests otherwise.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Pagination constants | 1 module | ✅ Granular |
| T2: normalizeRepoId | 1 function + tests | ✅ Granular |
| T3: createSearchRepos | 1 use case + tests | ✅ Granular |
| T4: getDetails + listIssues | 2 cohesive factories + tests | ⚠️ OK (same pattern/file pair) |
| T5: Move Fake | 1 adapter relocate + imports | ✅ Granular |
| T6: resolveRepository | 1 function + tests | ✅ Granular |
| T7: createContainer | 1 function + tests | ✅ Granular |
| T8: Barrels + isolation | related public-API lock | ⚠️ OK (single cohesion: boundaries) |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | (root) | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Pagination constants | none | none | ✅ OK |
| T2 | normalizeRepoId | unit | unit | ✅ OK |
| T3 | Use cases (search) | unit | unit | ✅ OK |
| T4 | Use cases (details/issues) | unit | unit | ✅ OK |
| T5 | Fake repository | unit | unit | ✅ OK |
| T6 | resolveRepository | unit | unit | ✅ OK |
| T7 | createContainer | unit | unit | ✅ OK |
| T8 | Isolation + public API | unit | unit | ✅ OK |

---

## Requirement Traceability (tasks)

| Requirement ID | Task(s) |
| -------------- | ------- |
| APP-01 | T3, T4 |
| APP-02 | T3 |
| APP-03 | T1, T3 |
| APP-04 | T3 |
| APP-05 | T2, T4 |
| APP-06 | T1, T4 |
| APP-07 | T8 |
| APP-08 | T5 |
| APP-09 | T6 |
| APP-10 | T7 |
| APP-11 | T7 |
| APP-12 | T7, T8 |
| APP-13 | T8 |
| APP-14 | T8 |
| APP-15 | T8 |
| APP-16 | T5 |

**Coverage:** 16 total, 16 mapped, 0 unmapped
