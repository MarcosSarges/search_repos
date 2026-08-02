# Infra HTTP Clients Validation

**Date**: 2026-08-02
**Spec**: `.specs/features/infra-http-clients/spec.md`
**Diff range**: `bd2c200^..HEAD` (T1–T6 → `bd2c200` … `e9d5321`)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 jsonFetch Bearer-only | ✅ Done | `bd2c200` |
| T2 API base normalize + URL join | ✅ Done | `090f75f` |
| T3 GitHub ApiClient + ACL repo | ✅ Done | `214e266` |
| T4 GitLab ApiClient + ACL repo | ✅ Done | `18879bd` |
| T5 DI hosts bag + resolve wiring | ✅ Done | `dabc53f` |
| T6 Isolation + barrel + AD-023/README | ✅ Done | `e9d5321` |

---

## Spec-Anchored Acceptance Criteria

### P1: ApiClient por provedor (host + Bearer)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| CLI-01: GH client default host + Bearer when token set | `baseUrl` → `https://api.github.com`; `Authorization: Bearer <token>` | `create-github-api-client.test.ts:26-28` — `expect(authorization).toBe('Bearer gh-secret')`; `expect(origin).toBe('https://api.github.com')` | ✅ PASS |
| CLI-01 (omit token): no Authorization | no `Authorization` header | `create-github-api-client.test.ts:44` — `expect(sawAuthorization).toBe(false)` | ✅ PASS |
| CLI-02: GL client default + Bearer, no PRIVATE-TOKEN | default `https://gitlab.com/api/v4`; Bearer only | `create-gitlab-api-client.test.ts:28-31` — `expect(authorization).toBe('Bearer gl-secret')`; `expect(privateToken).toBeNull()`; pathname `/api/v4/projects` | ✅ PASS |
| CLI-03: GL root → append `/api/v4` | `https://gitlab.empresa.com` → `…/api/v4` | `resolve-api-base-url.test.ts:25-27` — `expect(normalizeGitlabApiBase('https://gitlab.empresa.com')).toBe('https://gitlab.empresa.com/api/v4')`; MSW `create-gitlab-api-client.test.ts:75-80` | ✅ PASS |
| CLI-03: already `/api/v4` → no duplicate | path stays single `/api/v4` | `resolve-api-base-url.test.ts:37-39`; `create-gitlab-api-client.test.ts:98-99` — `pathname === '/api/v4/projects'`; `not.toContain('/api/v4/api/v4')` | ✅ PASS |
| CLI-04: GH repo no jsonFetch/fetch | ACL source scan clean | `isolation.test.ts:79-100` — `expect(violations).toEqual([])` for GH/GL repo files | ✅ PASS |
| CLI-05: GL repo no jsonFetch/fetch | same isolation scan | `isolation.test.ts:79-100` (both repo paths) | ✅ PASS |
| CLI-06: URL via `new URL` join | `joinApiUrl` yields absolute URL without `hostpath` glue | `resolve-api-base-url.test.ts:57-71` — `joinApiUrl(...)` equals expected; `not.toContain('github.comrepos')`; clients call `joinApiUrl` | ✅ PASS |
| CLI-07: MSW wildcards for custom host | custom host intercepted (no real network) | `create-github-api-client.test.ts:52-81` — `*/search/repositories`, origin `https://gh.empresa.test`; `create-gitlab-api-client.test.ts:52-80` — `*/api/v4/projects` | ✅ PASS |

### P1: Repositories ACL-only + DI hosts bag

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| CLI-08: ACL mapping + GH `Math.min(total_count, 1000)` | domain `Repo`/`Issue`/`PaginatedResult`; GH search window cap | `create-github-repo-repository.test.ts:35-44`, `:70`, `:95`; GL mapping `:35-45`, `:59` | ✅ PASS |
| CLI-09: DI `hosts` by dataSource | active source host only | `create-container.test.ts:123` — GH host; `:168-169` — GL root → `/api/v4`; `resolve-repository.test.ts:110-111` | ✅ PASS |
| CLI-10: omit hosts/tokens → defaults | official hosts, anonymous | `create-container.test.ts:192-194` — GH `api.github.com`, GL `gitlab.com` + `/api/v4/projects` | ✅ PASS |
| CLI-11: existing adapter gates + Bearer | sort params, Fail Fast, errors, pagination; Bearer not PRIVATE-TOKEN | GH/GL repo tests (sort, invalid_input, rate_limit/404/401/403, hasNextPage); GL `:223-224` Bearer + `privateToken` null | ✅ PASS |
| CLI-12: jsonFetch Bearer-only | Bearer when token; never PRIVATE-TOKEN; no `tokenHeader` | `json-fetch.test.ts:48-49` — `expect(authorization).toBe('Bearer gh-secret')`; `expect(privateToken).toBeNull()`; prod `json-fetch.ts` has no `tokenHeader` | ✅ PASS |

**Status**: ✅ All ACs covered (12/12)

---

## Discrimination Sensor

Scratch: detached worktree at `HEAD` (`/tmp/infra-http-clients-verify-*`). Real tree untouched.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `resolve-api-base-url.ts` (normalizeGitlabApiBase) | Removed no-duplicate branch → always append `/api/v4` | ✅ Killed — unit + GL client tests failed (`/api/v4/api/v4`) |
| 2 | `json-fetch.ts` (auth header) | `Authorization: Bearer` → `PRIVATE-TOKEN` | ✅ Killed — jsonFetch + GH/GL client Bearer asserts failed |
| 3 | `create-container.ts` (hosts select) | `hosts?.[dataSource]` → `hosts?.github` | ✅ Killed — GL hosts bag test expected `gitlab.empresa.com`, got default `gitlab.com` |

**Sensor depth**: lightweight (3 targeted)
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

N/A — infrastructure-only feature; automated checks sufficient.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement — no unclaimed tests | ✅ |
| Documented guidelines followed: `.claude/skills/tlc-spec-driven/references/coding-principles.md` | ✅ |

---

## Edge Cases

- [x] `token` undefined → no `Authorization` (GH/GL client + jsonFetch tests)
- [x] `hosts.gitlab` set + `dataSource` github → default GH host only (`create-container.test.ts:126-143`)
- [x] GL root `https://gitlab.empresa.com` → `…/api/v4/...`
- [x] GL base already `/api/v4` (trailing slash) → no duplicate
- [x] Path join via `new URL` — no `hostpath` glue
- [x] GitLab auth is Bearer only (PRIVATE-TOKEN asserts null)
- [x] Custom-host MSW uses path wildcards (CLI-07); absolute-only handlers treated as test defect by design

---

## Gate Check

- **Gate command**: `pnpm test && pnpm lint`
- **Result**: 285 passed, 0 failed, 0 skipped; lint 0 errors (4 pre-existing warnings outside feature scope)
- **Test count before feature** (`bd2c200^`): 260
- **Test count after feature** (`HEAD`): 285
- **Delta**: +25 new tests
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

None.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CLI-01 | Design / Pending | ✅ Verified |
| CLI-02 | Design / Pending | ✅ Verified |
| CLI-03 | Design / Pending | ✅ Verified |
| CLI-04 | Design / Pending | ✅ Verified |
| CLI-05 | Design / Pending | ✅ Verified |
| CLI-06 | Design / Pending | ✅ Verified |
| CLI-07 | Design / Pending | ✅ Verified |
| CLI-08 | Design / Pending | ✅ Verified |
| CLI-09 | Design / Pending | ✅ Verified |
| CLI-10 | Design / Pending | ✅ Verified |
| CLI-11 | Design / Pending | ✅ Verified |
| CLI-12 | Design / Pending | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 12/12 ACs matched spec outcome | 0 spec-precision gaps
**Sensor**: 3/3 mutations killed
**Gate**: 285 passed

**What works**: ApiClients own host normalize + Bearer + jsonFetch; repos are ACL-only; DI `hosts` mirrors `tokens`; MSW wildcards cover custom hosts; isolation scan locks CLI-04/05.

**Issues found**: none

**Next steps**: Update `spec.md` requirement statuses to Verified (orchestrator/author); proceed to next feature.
