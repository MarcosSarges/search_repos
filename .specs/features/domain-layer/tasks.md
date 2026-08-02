# Domain Layer — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/domain-layer/design.md`  
**Status**: Done — Verifier PASS

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` / AD-006 (Jest + RNTL; domain/application testable in Node), AD-001/AD-019, colocated `__tests__` (e.g. `src/application/use-cases/__tests__`, `src/domain` target), `package.json` scripts `test` / `lint`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| AppError factory/guard + codes | unit | 1:1 DOM-08..10 + edge (`cause`, non-Error → false) | `src/domain/errors/__tests__/*.test.ts` | `pnpm test` |
| Validation helpers (query + pagination) | unit | 1:1 DOM-13..15 + edge cases (whitespace, omitted perPage, page 0) | `src/domain/validation/__tests__/*.test.ts` | `pnpm test` |
| Domain isolation + public API | unit | DOM-01 (no DataSource export), DOM-12 forbidden imports | `src/domain/__tests__/*.test.ts` | `pnpm test` |
| Entities / port types / JSDoc | none | Shape correctness via compile + exercised by helpers/isolation/fixtures | `src/domain/entities/*`, `repositories/*` | build via `pnpm test` / `tsc` through Jest |
| DataSource application type | none | Type + optional `isDataSource`; exercised by store/theme after import move | `src/application/types/*` | via dependents |
| Consumer compat (use cases / fake / stores / theme) | none* | Compile green; existing use-case tests still pass after fixture/signature fixes | touch only as needed | `pnpm test` |

\*Compat is not a new product layer — gate is full suite green after each breaking change task.

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After unit-test domain tasks | `pnpm test -- src/domain` |
| Full | After compat / import moves | `pnpm test` |
| Build | Phase end / feature close | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Errors

```
T1
```

### Phase 2: Canonical shapes + port

```
T2
```

### Phase 3: Validation helpers

```
T3 → T4
```

### Phase 4: DataSource out + barrels + isolation

```
T5 → T6
```

---

## Task Breakdown

### T1: Align AppError (no message, + invalid_input)

**What**: Rewrite domain `AppError` per design: codes include `invalid_input`; `createAppError(code, cause?)`; `Error.message` = `code`; update application use-case call sites to new arity only.  
**Where**: `src/domain/errors/app-error.ts`, `src/domain/errors/__tests__/app-error.test.ts`, `src/application/use-cases/*.ts` (call-site only)  
**Depends on**: None  
**Reuses**: Existing factory/guard pattern  
**Requirement**: DOM-08, DOM-09, DOM-10

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `AppErrorCode` is exactly `rate_limit | network | not_found | empty_query | invalid_input | unknown`
- [x] No user-facing `message` parameter on `createAppError`
- [x] Unit tests cover create/isAppError/`cause`/non-Error → false
- [x] Gate: `pnpm test -- src/domain/errors` (and application use-case tests still compile/run)
- [x] Test count: domain error tests ≥ 4; no silent deletions of existing application tests

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(domain): add invalid_input and drop AppError message`

---

### T2: Align entities, pagination, port contract + fake/fixtures

**What**: Remove `source` from `Repo`; optional fields via `?:`; drop `totalCount` from `PaginatedResult`; JSDoc on `RepoRepository` (AppError rejects, opaque `repoId`, 1-based `page`); update in-memory fake + application fixtures accordingly (`getById` → `createAppError('not_found')`).  
**Where**: `src/domain/entities/{repo,issue,pagination}.ts`, `src/domain/repositories/repo-repository.ts`, `src/application/fakes/in-memory-repo-repository.ts`, `src/application/use-cases/__tests__/**`  
**Depends on**: T1  
**Reuses**: Existing entity/port/fake files  
**Requirement**: DOM-02, DOM-03, DOM-04, DOM-05, DOM-06, DOM-07, DOM-11

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `Repo` has no `source`; optionals are `?:` not `| null`
- [x] `PaginatedResult` has no `totalCount`
- [x] Port JSDoc documents AppError rejects + 1-based page
- [x] Fake/fixtures compile; application use-case tests pass without `totalCount`/`source`
- [x] Gate: `pnpm test -- src/application`
- [x] Test count: existing application tests still present and green

**Tests**: none (entity/port layer) — verified via application suite gate  
**Gate**: full  
**Commit**: `refactor(domain): align entities and pagination contract`

---

### T3: `normalizeSearchQuery` helper

**What**: Add pure `normalizeSearchQuery` (trim; throw `empty_query` on empty/whitespace); export via `src/domain/validation/`.  
**Where**: `src/domain/validation/search-query.ts`, `src/domain/validation/__tests__/search-query.test.ts`, `src/domain/validation/index.ts`  
**Depends on**: T1  
**Reuses**: `createAppError`  
**Requirement**: DOM-13, DOM-14

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Empty/`'   '` → `AppError` code `empty_query`
- [x] `'  react  '` → `'react'`
- [x] Gate: `pnpm test -- src/domain/validation/__tests__/search-query`
- [x] Test count: ≥ 3 cases (empty, whitespace, trim happy)

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(domain): add normalizeSearchQuery helper`

---

### T4: `assertPage` / `assertPerPage` helpers

**What**: Add `assertPage` / `assertPerPage` throwing `invalid_input` on bounds; omit check when `perPage` undefined; export from validation barrel.  
**Where**: `src/domain/validation/pagination.ts`, `src/domain/validation/__tests__/pagination.test.ts`, `src/domain/validation/index.ts`  
**Depends on**: T1, T3  
**Reuses**: `createAppError`; validation folder from T3  
**Requirement**: DOM-15

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `page < 1` → `invalid_input`
- [x] present `perPage < 1` → `invalid_input`; `undefined` → no throw
- [x] valid inputs no throw
- [x] Gate: `pnpm test -- src/domain/validation`
- [x] Test count: ≥ 5 cases covering edges in spec

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(domain): add pagination assert helpers`

---

### T5: Relocate `DataSource` to application

**What**: Create `src/application/types/data-source.ts` (`DataSource` + `isDataSource`); delete `src/domain/entities/data-source.ts`; stop exporting from domain; update all consumers (stores, theme, tokens, DataSourceLogo, render, Storybook) to `@/application`.  
**Where**: `src/application/types/data-source.ts`, `src/application/index.ts`, delete domain data-source, all former `@/domain/.../data-source` imports  
**Depends on**: T2  
**Reuses**: Current union + store guard logic  
**Requirement**: DOM-17

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] No `DataSource` file under `src/domain/`
- [x] `@/application` exports `DataSource` (and `isDataSource`)
- [x] Grep shows zero imports of domain data-source path
- [x] Gate: `pnpm test`
- [x] Test count: suite green (store/theme/logo tests included)

**Tests**: none (config type) — full suite gate  
**Gate**: full  
**Commit**: `refactor: move DataSource type to application`

---

### T6: Domain barrel + isolation / public-api tests

**What**: Finalize `src/domain/index.ts` public API (entities, port types, errors, validation — **no** `DataSource`); add isolation + public-api unit tests.  
**Where**: `src/domain/index.ts`, `src/domain/__tests__/isolation.test.ts`, `src/domain/__tests__/public-api.test.ts`  
**Depends on**: T3, T4, T5  
**Reuses**: Design forbidden-import list  
**Requirement**: DOM-01, DOM-12, DOM-16

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Barrel exports match design; importing `DataSource` from `@/domain` fails typecheck / public-api asserts absence
- [x] Isolation scan fails closed on forbidden framework imports under `src/domain` (excl. tests)
- [x] Gate: `pnpm test` && `pnpm lint`
- [x] Test count: isolation + public-api added; full suite green

**Tests**: unit  
**Gate**: build  
**Commit**: `test(domain): lock public API and framework isolation`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1
Phase 2:  T2
Phase 3:  T3 ──→ T4
Phase 4:  T5 ──→ T6
```

**Packing:** 6 tasks → single batch (≤ ~8) → Execute **inline** (no sub-agent offer required). Verifier still runs after T6.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: AppError + call-site arity | 1 error module (+ minimal call sites) | ✅ Granular |
| T2: Entities + pagination + fake/fixtures | 1 cohesive contract alignment | ✅ OK cohesive |
| T3: normalizeSearchQuery | 1 function | ✅ Granular |
| T4: assertPage/assertPerPage | 1 validation module | ✅ Granular |
| T5: DataSource relocate + imports | 1 type move + consumers | ✅ OK cohesive |
| T6: Barrel + isolation tests | 1 public API lock | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | (root) | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T1 | T1 → T3 (via Phase 3 after Phase 1; T3 depends T1) | ✅ Match |
| T4 | T1, T3 | T3 → T4 | ✅ Match (T1 satisfied before Phase 3) |
| T5 | T2 | T2 → T5 (Phase 4 after Phase 2) | ✅ Match |
| T6 | T3, T4, T5 | T5 → T6; needs T3/T4 complete | ✅ Match |

Note: T3 does not depend on T2 (validation only needs AppError). Phase order still runs T2 before T3 for human sequencing of “shapes then helpers”; that is stricter than `Depends on`, which is allowed.

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | --------------- | --------- | ------ |
| T1 | AppError | unit | unit | ✅ OK |
| T2 | Entities/port + fake compat | none (+ full suite) | none + full gate | ✅ OK |
| T3 | Validation query | unit | unit | ✅ OK |
| T4 | Validation pagination | unit | unit | ✅ OK |
| T5 | DataSource application type | none | none + full gate | ✅ OK |
| T6 | Isolation + public API | unit | unit | ✅ OK |

---

## Requirement Traceability (tasks)

| ID | Task |
| -- | ---- |
| DOM-01 | T6 |
| DOM-02..07, DOM-11 | T2 |
| DOM-08..10 | T1 |
| DOM-12, DOM-16 | T6 |
| DOM-13..14 | T3 |
| DOM-15 | T4 |
| DOM-17 | T5 |

**Coverage:** 17 total, 17 mapped, 0 unmapped
