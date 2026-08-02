# Infrastructure Layer — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/infrastructure-layer/design.md`  
**Status**: Approved — In Progress (Execute with batch sub-agents)

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` (Expo v54 docs), AD-006 (Jest), AD-001/002/020/021/022, colocated `__tests__` (domain/application/infrastructure), `package.json` scripts `test` / `lint`, `jest.config.ts` + `src/test/setup.ts`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain `AppErrorCode` | unit | INFRA-01..03; all codes incl. 3 new; isolation retained | `src/domain/errors/__tests__/*.test.ts`, `src/domain/__tests__/isolation.test.ts` | `pnpm test -- src/domain` |
| HTTP kit (`mapHttpFailure`, pagination, `jsonFetch`) | unit | INFRA-19..26 status/abort/network map; empty→false; header vs fallback; Link parse | `src/infrastructure/http/__tests__/*.test.ts` | `pnpm test -- src/infrastructure/http` |
| GitHub mappers / assert-repo-id | unit | INFRA-06,09; null/omit→undefined; id=`owner/repo` | `src/infrastructure/github/__tests__/*mapper*.test.ts` (or colocated) | `pnpm test -- src/infrastructure/github` |
| GitHub `RepoRepository` adapter | integration (MSW) | INFRA-04..11 + error codes via real fetch path; fixtures incomplete | `src/infrastructure/github/__tests__/*repository*.test.ts` | `pnpm test -- src/infrastructure/github` |
| GitLab mappers / assert-repo-id | unit | INFRA-13,16; numeric string id; null/omit→undefined | `src/infrastructure/gitlab/__tests__/*mapper*.test.ts` | `pnpm test -- src/infrastructure/gitlab` |
| GitLab `RepoRepository` adapter | integration (MSW) | INFRA-12..18 + HTTP error paths | `src/infrastructure/gitlab/__tests__/*repository*.test.ts` | `pnpm test -- src/infrastructure/gitlab` |
| DI `resolveRepository` / `createContainer` | unit (+ MSW if needed) | INFRA-27..32; Fake not in runtime map; token forwarded | `src/infrastructure/di/__tests__/*.test.ts` | `pnpm test -- src/infrastructure/di` |
| Infrastructure barrel + isolation | unit | INFRA-33..34; no React/Zustand/Query in adapters/http | `src/infrastructure/__tests__/*.test.ts` | `pnpm test -- src/infrastructure` |
| MSW harness / Jest config | none | Build/setup gate — exercised by adapter suites | `src/test/msw/**`, `jest.config.ts` | via adapter tests |
| In-memory Fake | unit | Remain green for use-case tests (unchanged behavior) | existing fake + UC tests | `pnpm test` |

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Domain / http kit / mappers only | `pnpm test -- src/domain` or scoped path in task |
| Full | After MSW adapters / DI | `pnpm test -- src/infrastructure` |
| Build | Phase end / feature close | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Domain + shared HTTP kit + MSW harness

```
T1 → T2 → T3 → T4
```

> **Order lock (review):** T3 = MSW harness **before** T4 = `jsonFetch` — no provisional `global.fetch` mock.
### Phase 2: GitHub Anti-Corruption Layer

```
T5 → T6
```

### Phase 3: GitLab Anti-Corruption Layer

```
T7 → T8
```

### Phase 4: DI runtime swap

```
T9
```

### Phase 5: Public API + isolation + docs touch

```
T10
```

---

## Task Breakdown

### T1: Extend `AppErrorCode` (`unauthorized` / `forbidden` / `aborted`)

**What**: Add three codes to domain `AppErrorCode`; update `ALL_CODES` / length assertions; keep domain isolation green.  
**Where**: `src/domain/errors/app-error.ts`, `src/domain/errors/__tests__/app-error.test.ts`, isolation if needed  
**Depends on**: None  
**Reuses**: `createAppError` / `isAppError`  
**Requirement**: INFRA-01, INFRA-02, INFRA-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Union is exactly nine codes including the three new ones
- [x] `createAppError` works for each new code with optional `cause`
- [x] Domain isolation still passes (no framework/HTTP libs in `src/domain/`)
- [x] Gate: `pnpm test -- src/domain`
- [x] Test count: app-error suite covers all codes; no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(domain): add unauthorized, forbidden, and aborted error codes`

---

### T2: HTTP failure mapper + `hasNextPage` helpers

**What**: Implement `mapHttpStatus` / `mapFetchException` / response error mapping (429 → `rate_limit` + `RateLimitCause`), `parseLinkNext` / `hasRelNext`, and agnostic `resolveHasNextPage` with `resolvedHasNext?` (no `totalCount*` field).  
**Where**: `src/infrastructure/http/map-http-failure.ts`, `parse-link-next.ts`, `resolve-has-next-page.ts`, `src/infrastructure/http/__tests__/*.test.ts`  
**Depends on**: T1  
**Reuses**: `createAppError` from `@/domain`  
**Requirement**: INFRA-19, INFRA-20, INFRA-21, INFRA-22, INFRA-23, INFRA-24, INFRA-25, INFRA-26 (+ pagination edges, INFRA-35 helper contract)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Status map: 401/403/404/429 → correct codes; other → `unknown`
- [x] `429` attaches structured `cause` with `resetAtEpochSeconds` and/or `retryAfterSeconds` when headers present
- [x] `AbortError` → `aborted`; other fetch failures → `network`
- [x] Errors satisfy `isAppError`
- [x] `itemsLength === 0` → false; `resolvedHasNext` wins when defined; else headers; else length fallback; Link `rel="next"` parsed
- [x] Shared helper type has **no** `totalCount*` field
- [x] Gate: `pnpm test -- src/infrastructure/http`
- [x] Test count: ≥ 10 focused cases (incl. 429 cause + resolvedHasNext + empty); no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(infrastructure): add HTTP error mapper and pagination helpers`

---

### T3: MSW + Jest harness

**What**: Add `msw` (and `jest-fixed-jsdom` only if required); configure `jest.config.ts` export conditions / transform; add `src/test/msw/server.ts` + suite-scoped listen/reset/close helper; smoke intercept works.  
**Where**: `package.json`, `jest.config.ts`, `src/test/msw/**`, optionally touch `src/test/setup.ts`  
**Depends on**: T2  
**Reuses**: Design MSW notes; existing `src/test/setup.ts`  
**Requirement**: enables INFRA-04..18 and jsonFetch gates (harness itself)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `msw` installed as devDependency
- [x] `setupServer` import from `msw/node` resolves under Jest
- [x] Smoke test: server listens, one handler returns fixture, `fetch` receives it, server closes
- [x] Suite-scoped lifecycle — do not break existing DS/UI tests
- [x] **No** provisional `global.fetch` mock introduced
- [x] Gate: `pnpm test -- src/test/msw` (or smoke path) && `pnpm test` still green for unrelated suites
- [x] Test count: ≥ 1 smoke

**Tests**: none (harness; smoke = setup verification)  
**Gate**: full  
**Commit**: `test(infrastructure): add MSW Jest harness for HTTP adapters`

---

### T4: Thin `jsonFetch` helper

**What**: Internal `jsonFetch` using native `fetch`; attaches Bearer or PRIVATE-TOKEN when configured; non-OK → status/response mapper (incl. 429 cause); catch → fetch exception mapper; returns `{ data, headers }`. Tests **only** via MSW from T3.  
**Where**: `src/infrastructure/http/json-fetch.ts`, `src/infrastructure/http/__tests__/json-fetch.test.ts`  
**Depends on**: T3  
**Reuses**: T2 mappers; T3 MSW server  
**Requirement**: INFRA-10, INFRA-17 (token header plumbing), INFRA-19..26 (via fetch path)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Without token, no auth header is sent
- [x] With `tokenHeader: 'bearer' | 'private-token'`, correct header is set
- [x] Non-OK response rejects with mapped `AppError` (429 includes structured cause from headers)
- [x] Abort rejects with `aborted`
- [x] Tests use MSW only — **no** `global.fetch` mock
- [x] Gate: `pnpm test -- src/infrastructure/http`
- [x] Test count: ≥ 4 cases; no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(infrastructure): add jsonFetch helper for native fetch`

---

### T5: GitHub mappers + `assertGithubRepoId`

**What**: DTOs + map repo/issue (null/omit → undefined); `id` = `full_name`; Fail Fast assert requires `/`.  
**Where**: `src/infrastructure/github/types.ts`, `mappers.ts`, `assert-repo-id.ts`, `src/infrastructure/github/__tests__/mappers.test.ts` (and assert test)  
**Depends on**: T4  
**Reuses**: Domain `Repo` / `Issue`; design field table  
**Requirement**: INFRA-06, INFRA-09 (mapper side), INFRA-04 id shape

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Mapper never emits `null` on optional domain fields
- [x] `assertGithubRepoId('123')` → `invalid_input`; `'owner/repo'` ok
- [x] Labels/colors mapped; missing description → `undefined`
- [x] Gate: `pnpm test -- src/infrastructure/github`
- [x] Test count: ≥ 4 mapper/assert cases; no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(infrastructure): add GitHub mappers and repoId assert`

---

### T6: `createGithubRepoRepository` + MSW gate

**What**: Full GitHub `RepoRepository` via `jsonFetch`; search computes `resolvedHasNext` with `Math.min(total_count, 1000)` then shared helper; detail/issues use Link hybrid; optional token; MSW fixtures covering happy, incomplete payloads, Fail Fast, 401/403/404/429(+cause), empty page, search beyond 1000 window.  
**Where**: `src/infrastructure/github/create-github-repo-repository.ts`, `src/infrastructure/github/__tests__/create-github-repo-repository.test.ts`, `src/test/msw/fixtures/github/**`  
**Depends on**: T5  
**Reuses**: T2–T5  
**Requirement**: INFRA-04, INFRA-05, INFRA-06, INFRA-07, INFRA-08, INFRA-09, INFRA-10, INFRA-11, INFRA-35

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `search` / `getById` / `listIssues` return domain shapes
- [x] Invalid `repoId` without `/` → `invalid_input` with **zero** MSW hits
- [x] Search `hasNextPage` uses capped `total_count` (1000); does not call shared helper with totalCount fields
- [x] Case: `total_count: 5000`, page such that `page * perPage >= 1000` → `hasNextPage === false`
- [x] List pagination from Link/fallback; empty → false
- [x] Token optional; when set, Authorization Bearer observed by MSW
- [x] Gate: `pnpm test -- src/infrastructure/github`
- [x] Test count: ≥ 7 adapter cases; no silent deletions

**Tests**: integration  
**Gate**: full  
**Commit**: `feat(infrastructure): implement GitHub RepoRepository adapter`

---

### T7: GitLab mappers + `assertGitlabRepoId`

**What**: DTOs + map repo/issue; `id` = `String(project.id)`; labels array-of-strings → `IssueLabel`; Fail Fast `/^\d+$/`.  
**Where**: `src/infrastructure/gitlab/types.ts`, `mappers.ts`, `assert-repo-id.ts`, `__tests__/mappers.test.ts`  
**Depends on**: T6  
**Reuses**: Design GL field table; T5 pattern  
**Requirement**: INFRA-13, INFRA-16, INFRA-12 id shape

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Non-numeric id → `invalid_input`; numeric string ok
- [x] null/omit → `undefined`; watchers/language gaps → `0` / `undefined` per design
- [x] Gate: `pnpm test -- src/infrastructure/gitlab`
- [x] Test count: ≥ 4 cases; no silent deletions

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(infrastructure): add GitLab mappers and repoId assert`

---

### T8: `createGitlabRepoRepository` + MSW gate

**What**: Full GitLab adapter; `X-Next-Page` hybrid pagination; PRIVATE-TOKEN when token set; MSW fixtures parallel to GitHub coverage.  
**Where**: `src/infrastructure/gitlab/create-gitlab-repo-repository.ts`, `__tests__/create-gitlab-repo-repository.test.ts`, `src/test/msw/fixtures/gitlab/**`  
**Depends on**: T7  
**Reuses**: T2–T4, T7  
**Requirement**: INFRA-12, INFRA-13, INFRA-14, INFRA-15, INFRA-16, INFRA-17, INFRA-18

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] search/getById/listIssues map to domain; id numeric string round-trips
- [x] Invalid id → `invalid_input` without HTTP
- [x] Pagination headers + empty page + fallback covered
- [x] Gate: `pnpm test -- src/infrastructure/gitlab`
- [x] Test count: ≥ 6 adapter cases; no silent deletions

**Tests**: integration  
**Gate**: full  
**Commit**: `feat(infrastructure): implement GitLab RepoRepository adapter`

---

### T9: Wire `resolveRepository` + `createContainer` to HTTP adapters

**What**: Runtime map github/gitlab → HTTP factories; `CreateContainerDeps.tokens?: { github?: string; gitlab?: string }` — DI selects `tokens[dataSource]`; Fake removed from resolve map; keep `repository?` override; update DI tests.  
**Where**: `src/infrastructure/di/resolve-repository.ts`, `create-container.ts`, `src/infrastructure/di/__tests__/*.test.ts`  
**Depends on**: T8  
**Reuses**: AD-021/022; existing container shape  
**Requirement**: INFRA-27, INFRA-28, INFRA-29, INFRA-30, INFRA-31, INFRA-32

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `resolveRepository('github'|'gitlab')` returns HTTP adapters (Fail Fast id or MSW)
- [x] Fake not instantiated by resolve path
- [x] `createContainer({ dataSource: 'github', tokens: { github: 'g', gitlab: 'l' } })` forwards **only** `g` to GitHub adapter (assert via MSW Authorization header)
- [x] Switching `dataSource` to `gitlab` with same `tokens` bag forwards `l` — Presentation does not pick the string
- [x] `repository` override still works; di sources still ban Zustand
- [x] Use-case tests still import Fake from infrastructure and pass
- [x] Gate: `pnpm test -- src/infrastructure/di` && `pnpm test -- src/application`
- [x] Test count: DI suite updated ≥ 4 cases; no silent deletions

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(infrastructure): resolve DataSource to HTTP adapters`

---

### T10: Barrels, isolation scan, README token note

**What**: Export HTTP factories from `@/infrastructure`; isolation scan for adapters/http; public-api smoke; minimal README update reflecting AD-021 (token injected / user-later, not `.env` as source of truth).  
**Where**: `src/infrastructure/index.ts`, `src/infrastructure/__tests__/public-api.test.ts`, `isolation.test.ts` (new or extend), `README.md`  
**Depends on**: T9  
**Reuses**: existing public-api / domain isolation patterns  
**Requirement**: INFRA-33, INFRA-34

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Barrel exports DI + Fake + GitHub/GitLab factory creators
- [ ] Isolation: http/github/gitlab production sources ban React, Zustand, TanStack Query, styled-components
- [ ] README no longer presents `.env` as the token source of truth (align AD-021)
- [ ] Gate: `pnpm test` && `pnpm lint`
- [ ] Test count: isolation + public-api green; no silent deletions

**Tests**: unit  
**Gate**: build  
**Commit**: `feat(infrastructure): lock public API and document optional tokens`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Phase 1:  T1 ──→ T2 ──→ T3 ──→ T4
Phase 2:  T5 ──→ T6
Phase 3:  T7 ──→ T8
Phase 4:  T9
Phase 5:  T10
```

**Execute packing:** 10 tasks → ~2 batches (e.g. Phase1+2 = 6; Phase3+4+5 = 4). Offer sub-agents at Execute if user accepts.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: AppError codes | 1 type + tests | ✅ Granular |
| T2: HTTP mapper + pagination | 3 cohesive http helpers | ⚠️ OK (same kit) |
| T3: MSW harness | 1 setup concern | ✅ Granular |
| T4: jsonFetch | 1 helper + MSW tests | ✅ Granular |
| T5: GH mappers/assert | 1 provider map layer | ✅ Granular |
| T6: GH repository + MSW | 1 adapter + gate | ✅ Granular |
| T7: GL mappers/assert | 1 provider map layer | ✅ Granular |
| T8: GL repository + MSW | 1 adapter + gate | ✅ Granular |
| T9: DI wire | 2 related DI files | ⚠️ OK (single wiring) |
| T10: Barrel + isolation + README | boundary lock | ⚠️ OK (cohesive closeout) |

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
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T9 | T9 → T10 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Domain AppErrorCode | unit | unit | ✅ OK |
| T2 | HTTP kit | unit | unit | ✅ OK |
| T3 | MSW harness | none | none | ✅ OK |
| T4 | jsonFetch (HTTP kit) | unit | unit | ✅ OK |
| T5 | GitHub mappers | unit | unit | ✅ OK |
| T6 | GitHub adapter | integration (MSW) | integration | ✅ OK |
| T7 | GitLab mappers | unit | unit | ✅ OK |
| T8 | GitLab adapter | integration (MSW) | integration | ✅ OK |
| T9 | DI | unit | unit | ✅ OK |
| T10 | Barrel + isolation | unit | unit | ✅ OK |

---

## Requirement Traceability (tasks)

| Requirement ID | Task(s) |
| -------------- | ------- |
| INFRA-01 | T1 |
| INFRA-02 | T1 |
| INFRA-03 | T1 |
| INFRA-04 | T5, T6 |
| INFRA-05 | T6 |
| INFRA-06 | T5, T6 |
| INFRA-07 | T6 |
| INFRA-08 | T6 |
| INFRA-09 | T5, T6 |
| INFRA-10 | T4, T6 |
| INFRA-11 | T2, T6 |
| INFRA-12 | T7, T8 |
| INFRA-13 | T7, T8 |
| INFRA-14 | T8 |
| INFRA-15 | T8 |
| INFRA-16 | T7, T8 |
| INFRA-17 | T4, T8 |
| INFRA-18 | T2, T8 |
| INFRA-19 | T2, T4 |
| INFRA-20 | T2, T4 |
| INFRA-21 | T2, T4 |
| INFRA-22 | T2, T4 |
| INFRA-23 | T2, T4 |
| INFRA-24 | T2, T4 |
| INFRA-25 | T2, T4 |
| INFRA-26 | T2 |
| INFRA-27 | T9 |
| INFRA-28 | T9 |
| INFRA-29 | T9 |
| INFRA-30 | T9 |
| INFRA-31 | T9 |
| INFRA-32 | T9 |
| INFRA-33 | T10 |
| INFRA-34 | T10 |
| INFRA-35 | T2, T6 |

**Coverage:** 35 total, 35 mapped, 0 unmapped

---

## Tools question (before Execute)

For each task, which tools should I use?

**Available MCPs**: Maestro (`user-maestro`) — unlikely needed here (no UI).  
**Available Skills**: `tlc-spec-driven` (required), Expo docs via AGENTS.md / docs.expo.dev v54.

Default proposal: **Skill `tlc-spec-driven` only; MCP NONE** unless you want Maestro later for smoke after Presentation.
