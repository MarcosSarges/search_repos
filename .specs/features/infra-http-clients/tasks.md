# Infra HTTP Clients — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.**

---

**Design**: `.specs/features/infra-http-clients/design.md`  
**Status**: In Progress (Execute via sub-agent)

---

## Test Coverage Matrix

> Guidelines: AD-006/022/021, colocated `__tests__`, `pnpm test` / `pnpm lint`, MSW wildcards (CLI-07).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| `jsonFetch` Bearer-only | unit | CLI-12; no private-token | `src/infrastructure/http/__tests__/json-fetch.test.ts` | `pnpm test -- src/infrastructure/http` |
| URL / GitLab base normalize | unit | CLI-03, CLI-06 | `src/infrastructure/http/__tests__/*` or gitlab client tests | `pnpm test -- src/infrastructure` |
| GitHub/GitLab ApiClient | integration (MSW) | CLI-01/02/05/07 Bearer + custom host via wildcards | `**/__tests__/*api-client*` or repo suites | `pnpm test -- src/infrastructure/github` etc. |
| Repositories ACL | integration (MSW) | CLI-04/05/08/11; no jsonFetch in repo source | existing repo tests + isolation | `pnpm test -- src/infrastructure` |
| DI hosts bag | unit | CLI-09/10 | `src/infrastructure/di/__tests__/*` | `pnpm test -- src/infrastructure/di` |

## Gate Check Commands

| Gate Level | Command |
| ---------- | ------- |
| Quick | `pnpm test -- src/infrastructure/http` |
| Full | `pnpm test -- src/infrastructure` |
| Build | `pnpm test` && `pnpm lint` |

---

## Execution Plan

```
T1 → T2 → T3 → T4 → T5 → T6
```

**Packing:** 6 tasks → single batch sub-agent (user requested).

---

## Task Breakdown

### T1: `jsonFetch` Bearer-only ✅

**What**: Remove `tokenHeader` / `private-token`; when `token` set, always `Authorization: Bearer`. Update http unit tests.  
**Where**: `src/infrastructure/http/json-fetch.ts`, `__tests__/json-fetch.test.ts`  
**Depends on**: None  
**Requirement**: CLI-12  
**Tests**: unit | **Gate**: quick  
**Commit**: `refactor(infrastructure): make jsonFetch Bearer-only`  
**Done**: `bd2c200`

### T2: API base normalize + `URL` join helper ✅

**What**: Helper(s) for GitLab `/api/v4` normalize (root or full API base, no duplicate) and safe `new URL(path, base)` join. Unit tests for root, trailing slash, already `/api/v4`, join without glue bugs.  
**Where**: `src/infrastructure/http/resolve-api-base-url.ts` (or equiv) + tests  
**Depends on**: T1  
**Requirement**: CLI-03, CLI-06  
**Tests**: unit | **Gate**: quick  
**Commit**: `feat(infrastructure): add API base URL normalize and join helpers`  
**Done**: `090f75f`

### T3: GitHub ApiClient + ACL repository ✅

**What**: `createGithubApiClient`; refactor `createGithubRepoRepository({ client })` — no jsonFetch/fetch in repo; DI-ready. MSW wildcards for GH paths; Bearer + optional custom host test.  
**Where**: `src/infrastructure/github/**`  
**Depends on**: T2  
**Requirement**: CLI-01, CLI-04, CLI-06, CLI-07, CLI-08  
**Tests**: integration | **Gate**: full  
**Commit**: `refactor(infrastructure): extract GitHub ApiClient from repository`  
**Done**: `214e26671ed4fe809befbf39105da01e4034bbb7`

### T4: GitLab ApiClient + ACL repository ✅

**What**: `createGitlabApiClient` with normalize; Bearer only; repo `{ client }` only; update MSW to wildcards + Bearer (drop PRIVATE-TOKEN). Custom host root → `/api/v4` covered.  
**Where**: `src/infrastructure/gitlab/**`  
**Depends on**: T3  
**Requirement**: CLI-02, CLI-03, CLI-05, CLI-06, CLI-07, CLI-08, CLI-11  
**Tests**: integration | **Gate**: full  
**Commit**: `refactor(infrastructure): extract GitLab ApiClient with host normalize`  
**Done**: `18879bd`

### T5: DI `hosts` bag + resolve wiring

**What**: `ProviderHosts`; `createContainer`/`resolveRepository` pass `baseUrl`+`token`; create client then `{ client }` into repo. Tests: hosts selection by dataSource; omit → defaults; Bearer forward (not PRIVATE-TOKEN).  
**Where**: `src/infrastructure/di/**`, barrel types if needed  
**Depends on**: T4  
**Requirement**: CLI-09, CLI-10, CLI-11  
**Tests**: unit | **Gate**: full  
**Commit**: `feat(infrastructure): inject optional hosts bag in DI`

### T6: Isolation scan + barrel + AD-023/README touch

**What**: Assert repo sources ban jsonFetch/fetch; export client factories if designed; append AD-023 to STATE; minimal README note on hosts/Bearer if needed. Build gate.  
**Where**: `src/infrastructure/__tests__/*`, `.specs/STATE.md`, `README.md` (minimal)  
**Depends on**: T5  
**Requirement**: CLI-04, CLI-05, CLI-11  
**Tests**: unit | **Gate**: build  
**Commit**: `feat(infrastructure): lock ApiClient isolation and document hosts`

---

## Phase Execution Map

```
Phase 1: T1 ──→ T2 ──→ T3 ──→ T4 ──→ T5 ──→ T6
```

## Requirement Traceability

| ID | Task |
| -- | ---- |
| CLI-01 | T3 |
| CLI-02 | T4 |
| CLI-03 | T2, T4 |
| CLI-04 | T3, T6 |
| CLI-05 | T4, T6 |
| CLI-06 | T2, T3, T4 |
| CLI-07 | T3, T4 |
| CLI-08 | T3, T4 |
| CLI-09 | T5 |
| CLI-10 | T5 |
| CLI-11 | T4, T5, T6 |
| CLI-12 | T1 |

**Coverage:** 12/12
