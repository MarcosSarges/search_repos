# Infrastructure Layer Validation

**Date**: 2026-08-02
**Spec**: `.specs/features/infrastructure-layer/spec.md`
**Diff range**: `a9d4a1f^..HEAD` (`f91b7f5`, 11 commits) — re-verify iteration 1 of max 3
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T1   | ✅ Done | AppErrorCode + domain isolation |
| T2   | ✅ Done | HTTP mapper + pagination helpers |
| T3   | ✅ Done | MSW Jest harness |
| T4   | ✅ Done | jsonFetch via MSW |
| T5   | ✅ Done | GitHub mappers + assert |
| T6   | ✅ Done | GitHub RepoRepository + MSW |
| T7   | ✅ Done | GitLab mappers + assert |
| T8   | ✅ Done | GitLab RepoRepository + MSW |
| T9   | ✅ Done | DI resolve/createContainer tokens map |
| T10  | ✅ Done | Barrel + isolation + README |
| Fix  | ✅ Done | `f91b7f5` — MSW asserts for GH/GL search sort params (INFRA-04 / INFRA-12) |

All T1–T10 Done-when checkboxes are `[x]` in `tasks.md`. No blocked/partial tasks.

---

## Spec-Anchored Acceptance Criteria

### P1: Extensão mínima de `AppErrorCode`

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| INFRA-01: WHEN `AppErrorCode` is inspected THEN exactly nine codes incl. `unauthorized` \| `forbidden` \| `aborted` | Full set length 9 | `src/domain/errors/__tests__/app-error.test.ts:41-52` — `expect(ALL_CODES).toEqual([...9 codes]); expect(ALL_CODES).toHaveLength(9)` | ✅ PASS |
| INFRA-02: WHEN `createAppError` with each new code THEN `AppError` with that `code` and optional `cause` | `code` matches; `cause` preserved; no user-message field | `app-error.test.ts:16-22` — `expect(error.code).toBe(code)`; `:33-37` — cause for `unauthorized`/`forbidden`/`aborted` | ✅ PASS |
| INFRA-03: WHEN domain isolation tests run THEN `src/domain/` SHALL NOT import forbidden frameworks | `violations` empty | `src/domain/__tests__/isolation.test.ts:69` — `expect(violations).toEqual([])` | ✅ PASS |

### P1: Adapter GitHub

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| INFRA-04: WHEN `search` with valid query THEN request GH search **sorted by stars descending**, map `id`=`owner/repo`, `PaginatedResult` without `totalCount` | (1) `sort=stars&order=desc`; (2) `id`/`fullName`=`full_name`; (3) no `totalCount` | `create-github-repo-repository.test.ts:19-20` — `expect(...get('sort')).toBe('stars')`; `expect(...get('order')).toBe('desc')`; `:29-36` — id/fullName + `not.toHaveProperty('totalCount')` | ✅ PASS |
| INFRA-05: WHEN search JSON includes `total_count` THEN `hasNextPage` = `(page * perPage) < Math.min(total_count, 1000)`; no `totalCount` on result | Cap case false; within-window true | `:63` — `expect(result.hasNextPage).toBe(false)` (page 50, perPage 20, total_count 5000); `:88` — `toBe(true)` | ✅ PASS |
| INFRA-06: WHEN `getById`/`listIssues` repoId lacks `/` THEN `invalid_input` without HTTP | `code === 'invalid_input'`; `httpHits === 0` | `:108,118,122`; also `mappers.test.ts:100` | ✅ PASS |
| INFRA-07: WHEN `getById` valid `owner/repo` THEN fetch and map `Repo` with same opaque id | `detail.id === 'facebook/react'` | `:135` — `expect(detail.id).toBe('facebook/react')` | ✅ PASS |
| INFRA-08: WHEN `listIssues` valid repoId THEN open issues mapped incl. labels; `PaginatedResult<Issue>` | `state=open`; labels; paginated shape | `:145,162-165` — `state=open`; labels; `hasNextPage` | ✅ PASS |
| INFRA-09: WHEN optional API fields null/omitted THEN domain optionals `undefined` (never `null`) | description/language/avatar/label.color → `undefined` | `mappers.test.ts:44-47`; adapter `:31-33,136,163-164` | ✅ PASS |
| INFRA-10: WHEN optional token provided THEN include auth; WHEN omitted THEN anonymous | Bearer when set; no auth when omitted | Provided: `:223` — `Bearer gh-token`. Omitted: `json-fetch.test.ts:28-29` | ✅ PASS |
| INFRA-11: WHEN list `hasNextPage` THEN prefer Link `rel="next"`, else length===perPage; empty → false | Link → true; empty → false | Adapter `:165,183`. Helper: `http-helpers.test.ts:136-174` | ✅ PASS |
| INFRA-35: WHEN search `hasNextPage` computed THEN pass only resolved boolean; helper has no `totalCount*` field | Cap via `resolvedHasNext`; helper input has no totalCount | Behavior: INFRA-05. Helper: `http-helpers.test.ts:176-179` | ✅ PASS |

### P1: Adapter GitLab

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| INFRA-12: WHEN `search` THEN call GL projects search **ordered by star count descending**; `id` = `String(project.id)` | (1) `order_by=star_count&sort=desc`; (2) numeric-string ids | `create-gitlab-repo-repository.test.ts:19-20` — `order_by=star_count`, `sort=desc`; `:29-31` — ids `'278964'` / `'13083'` | ✅ PASS |
| INFRA-13: WHEN non-numeric `repoId` THEN `invalid_input` without HTTP | `invalid_input`; `httpHits === 0` | `:95,105,109`; `mappers.test.ts:117` | ✅ PASS |
| INFRA-14: WHEN numeric-string `repoId` THEN `GET /projects/{id}` → `Repo` | `detail.id === '278964'` | `:122` | ✅ PASS |
| INFRA-15: WHEN `listIssues` THEN opened issues mapped to `Issue` | `state=opened`; issues mapped | `:134,149-154` | ✅ PASS |
| INFRA-16: WHEN null/omit optionals THEN `undefined` (never `null`) | description/language/avatar → undefined; watchers gap → 0 | `mappers.test.ts:55-60`; adapter `:32-35,123-127,155` | ✅ PASS |
| INFRA-17: WHEN token provided THEN include; WHEN omitted THEN anonymous | PRIVATE-TOKEN when set; no auth when omitted | Provided: `:214` — `gl-token`. Omitted: `json-fetch.test.ts:28-29` | ✅ PASS |
| INFRA-18: WHEN computing `hasNextPage` THEN prefer `X-Next-Page`, else length===perPage; empty → false | Header true; fallback true; empty false | `:52,75,174`; helper `:171-174` | ✅ PASS |

### P1: Classificação de erros HTTP / rede / abort

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| INFRA-19: WHEN API `429` THEN `rate_limit` + structured cause | `code === 'rate_limit'`; cause with reset/retry | `http-helpers.test.ts:46-52,63-66`; `json-fetch.test.ts:93-98`; GH `:216-220`; GL `:207-211` | ✅ PASS |
| INFRA-20: WHEN `401` THEN `unauthorized` | `code === 'unauthorized'` | `http-helpers.test.ts:16`; `json-fetch.test.ts:108`; GH `:241`; GL `:232` | ✅ PASS |
| INFRA-21: WHEN `403` THEN `forbidden` | `code === 'forbidden'` | `http-helpers.test.ts:20`; GH `:251`; GL `:242` | ✅ PASS |
| INFRA-22: WHEN `404` THEN `not_found` | `code === 'not_found'` | `http-helpers.test.ts:24`; `json-fetch.test.ts:118`; GH `:231`; GL `:222` | ✅ PASS |
| INFRA-23: WHEN network/TypeError (non-abort) THEN `network` | `code === 'network'` | `http-helpers.test.ts:117` | ✅ PASS |
| INFRA-24: WHEN aborted (`AbortError`) THEN `aborted` | `code === 'aborted'` | `http-helpers.test.ts:104`; `json-fetch.test.ts:143` | ✅ PASS |
| INFRA-25: WHEN other error statuses / unmappable THEN `unknown` | e.g. 500 → `unknown` | `http-helpers.test.ts:32-33` | ✅ PASS |
| INFRA-26: WHEN thrown THEN `isAppError`; cause MAY attach | `isAppError` true; rate_limit cause structured | `http-helpers.test.ts:15,45,103`; `json-fetch.test.ts:91-98` | ✅ PASS |

### P1: DI runtime com adapters reais

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| INFRA-27: WHEN `resolveRepository('github')` THEN GitHub HTTP adapter (not Fake) | Fail Fast `invalid_input` (not Fake `not_found`); no HTTP | `resolve-repository.test.ts:44,47` | ✅ PASS |
| INFRA-28: WHEN `resolveRepository('gitlab')` THEN GitLab HTTP adapter (not Fake) | Same Fail Fast for path-style id | `resolve-repository.test.ts:67,70` | ✅ PASS |
| INFRA-29: WHEN `createContainer` with `tokens?` bag THEN forward only token for active `dataSource` | github → Bearer `g` only; gitlab → PRIVATE-TOKEN `l` only | `create-container.test.ts:79-80,102-103` | ✅ PASS |
| INFRA-30: WHEN `di/` inspected THEN SHALL NOT import Zustand | `violations` empty | `create-container.test.ts:126` | ✅ PASS |
| INFRA-31: WHEN Fake module used THEN production resolve SHALL NOT instantiate it | Resolve map is HTTP factories only; Fail Fast path proves HTTP adapter | `resolve-repository.test.ts:27-71` | ✅ PASS |
| INFRA-32: WHEN UC tests need port double THEN continue importing Fake from infrastructure | Fake import from `@/infrastructure` in UC tests; barrel exports Fake | `search-repos.test.ts:3`; `public-api.test.ts:12` | ✅ PASS |

### P2: Barrel e isolamento

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| INFRA-33: WHEN importing `@/infrastructure` THEN DI, Fake, HTTP factories reachable | All five factories/functions present | `public-api.test.ts:11-15` | ✅ PASS |
| INFRA-34: WHEN adapter sources scanned THEN no React / Zustand / TanStack Query / styled-components | `violations` empty | `isolation.test.ts:76` | ✅ PASS |

**Status**: ✅ All ACs covered — **35/35** matched. Prior gaps INFRA-04 / INFRA-12 closed by `f91b7f5`. No ⚠️ Spec-precision gaps.

---

## Discrimination Sensor

Scratch: `git worktree` at `/tmp/infra-sensor-r1-*` (detached `f91b7f5`), `node_modules` symlinked; mutations discarded via `git checkout` + `git worktree remove`. Main tree untouched.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/infrastructure/github/create-github-repo-repository.ts:44` | Flipped search `sort` `stars` → `updated` | ✅ Killed — search happy-path MSW asserts `sort=stars` (`create-github-repo-repository.test.ts:19`) |
| 2 | `src/infrastructure/gitlab/create-gitlab-repo-repository.ts:50` | Flipped `order_by` `star_count` → `name` | ✅ Killed — search happy-path MSW asserts `order_by=star_count` (`create-gitlab-repo-repository.test.ts:19`) |
| 3 | `src/infrastructure/github/create-github-repo-repository.ts:51` | Removed `Math.min(..., 1000)` cap (`page * perPage < total_count`) | ✅ Killed — expected `hasNextPage === false`, got `true` (`:63`) |

**Sensor depth**: lightweight (3 behavior-level mutations; includes prior-gap sort contracts)
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

N/A — infrastructure / backend-only feature; automated checks suffice per validate.md.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ |
| Matches patterns | ✅ (Clean Arch ACL, colocated `__tests__`, MSW) |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met | ✅ (domain 1:1; adapters happy+edge+error; DI + barrel) |
| Every test maps to a spec requirement — no unclaimed tests | ✅ |
| Documented guidelines followed: `AGENTS.md` (Expo v54), AD-006 Jest, AD-021/022 | ✅ |

---

## Edge Cases

- [x] GitHub `repoId` `"12345"` (no `/`) → `invalid_input` without HTTP — `create-github-repo-repository.test.ts:91-122`
- [x] GitLab `repoId` `"vuejs/vue"` → `invalid_input` without HTTP — `create-gitlab-repo-repository.test.ts:78-109`
- [x] search/list `items: []` → `hasNextPage === false` — GH/GL empty-page tests + helper `:136-140`
- [x] headers stripped but `items.length === perPage` → `hasNextPage === true` — helper `:171-172`; GL search fallback `:75`
- [x] headers say no next even if `length === perPage` → headers win → false — helper `:163-165`
- [x] GH search `total_count: 5000` and `page * perPage >= 1000` → `hasNextPage === false` — `:63`
- [x] GH search within 1000-window → `hasNextPage === true` — `:88`
- [x] null description/avatar/language/label color → `undefined` — mapper + adapter fixtures
- [x] token `undefined` → no auth header — `json-fetch.test.ts:28-29`
- [x] `AbortError` → `aborted` not `network` — `http-helpers.test.ts:100-112`; `json-fetch.test.ts:143`
- [x] `429` with `X-RateLimit-Reset` → `rate_limit` + cause metadata — `http-helpers.test.ts:48-52`; GH adapter `:216-220`

---

## Gate Check

- **Gate command**: `pnpm test && pnpm lint`
- **Result**: **260** passed, **0** failed, **0** skipped; lint **0 errors** (6 pre-existing warnings outside feature scope)
- **Test count before feature** (`a9d4a1f^`): **196** passed (40 suites)
- **Test count after feature** (`f91b7f5` / HEAD): **260** passed (48 suites)
- **Delta**: **+64** new tests
- **Skipped tests**: none
- **Failures**: none
- **Test integrity**: count increased; fix commit `f91b7f5` added assertions only (no weaken/delete)

---

## Fix Plans (if issues found)

None — clean PASS.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| INFRA-01 | ✅ Verified | ✅ Verified |
| INFRA-02 | ✅ Verified | ✅ Verified |
| INFRA-03 | ✅ Verified | ✅ Verified |
| INFRA-04 | ❌ Needs Fix | ✅ Verified |
| INFRA-05 | ✅ Verified | ✅ Verified |
| INFRA-06 | ✅ Verified | ✅ Verified |
| INFRA-07 | ✅ Verified | ✅ Verified |
| INFRA-08 | ✅ Verified | ✅ Verified |
| INFRA-09 | ✅ Verified | ✅ Verified |
| INFRA-10 | ✅ Verified | ✅ Verified |
| INFRA-11 | ✅ Verified | ✅ Verified |
| INFRA-12 | ❌ Needs Fix | ✅ Verified |
| INFRA-13 | ✅ Verified | ✅ Verified |
| INFRA-14 | ✅ Verified | ✅ Verified |
| INFRA-15 | ✅ Verified | ✅ Verified |
| INFRA-16 | ✅ Verified | ✅ Verified |
| INFRA-17 | ✅ Verified | ✅ Verified |
| INFRA-18 | ✅ Verified | ✅ Verified |
| INFRA-19 | ✅ Verified | ✅ Verified |
| INFRA-20 | ✅ Verified | ✅ Verified |
| INFRA-21 | ✅ Verified | ✅ Verified |
| INFRA-22 | ✅ Verified | ✅ Verified |
| INFRA-23 | ✅ Verified | ✅ Verified |
| INFRA-24 | ✅ Verified | ✅ Verified |
| INFRA-25 | ✅ Verified | ✅ Verified |
| INFRA-26 | ✅ Verified | ✅ Verified |
| INFRA-27 | ✅ Verified | ✅ Verified |
| INFRA-28 | ✅ Verified | ✅ Verified |
| INFRA-29 | ✅ Verified | ✅ Verified |
| INFRA-30 | ✅ Verified | ✅ Verified |
| INFRA-31 | ✅ Verified | ✅ Verified |
| INFRA-32 | ✅ Verified | ✅ Verified |
| INFRA-33 | ✅ Verified | ✅ Verified |
| INFRA-34 | ✅ Verified | ✅ Verified |
| INFRA-35 | ✅ Verified | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 35/35 ACs matched spec outcome | 0 spec-precision gaps | 0 evidence gaps
**Sensor**: 3/3 mutations killed (incl. sort-param contracts from prior FAIL)
**Gate**: 260 passed, 0 failed; lint clean (0 errors)

**What works**: Domain error codes; HTTP classifier + pagination kit; MSW-backed GH/GL adapters (ids, Fail Fast, null→undefined, tokens, rate-limit cause, 1000-cap, **search sort/order query params**, DI token bag, barrel/isolation); discrimination sensor kills sort + cap faults.

**Issues found**: None.

**Next steps**: Feature ready — no further fix→re-verify iterations required.
