# Explore Trending Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/explore-trending/design.md`  
**Status**: Done — Batch A (T1–T7) + Batch B (T8–T10) complete; ready for Verifier

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` (Expo v54), AD-006 (Jest + RNTL; Maestro later), AD-001/002/005/019/020/022/023/025, colocated `__tests__`, `package.json` → `pnpm test` / `pnpm lint`, MSW em adapters HTTP.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain port / barrels | unit | `listTrending` no tipo exportado; isolation domain sem infra | `src/domain/__tests__/**` | `pnpm test -- src/domain` |
| Use case `listTrendingRepos` | unit | EXP-11: defaults page/perPage; assert page/perPage; delega ao repo; 1:1 ACs | `src/application/use-cases/__tests__/**` | `pnpm test -- src/application` |
| Fake in-memory | unit | EXP-15: sort stars desc + pagination `hasNextPage` | `src/infrastructure/repositories/__tests__/**` | `pnpm test -- src/infrastructure/repositories` |
| Trending window helper | unit | 30d → `YYYY-MM-DD` e ISO Z | `src/infrastructure/trending/__tests__/**` | `pnpm test -- src/infrastructure/trending` |
| GitHub / GitLab adapters | unit (MSW) | EXP-13/14: URL/params trending; map Repo; pagination; auth header opcional | `src/infrastructure/github|gitlab/__tests__/**` | `pnpm test -- src/infrastructure/github` / `gitlab` |
| DI container | unit | EXP-12: `listTrendingRepos` callable; Fake inject | `src/infrastructure/di/__tests__/**` | `pnpm test -- src/infrastructure/di` |
| Presentation hook + queryKeys | unit (RNTL + Fake) | EXP-01/03/06/08/09/16/17: infinite pages; key has dataSource; no invalidate | `src/presentation/hooks/__tests__/**`, `src/presentation/__tests__/**` | `pnpm test -- src/presentation` |
| ExploreScreen | unit (RNTL) | EXP-02/04/05/07/16: rows fields; loading; empty; error; footer loading; no nav | `src/presentation/screens/__tests__/ExploreScreen.test.tsx` | `pnpm test -- src/presentation/screens` |
| Isolation (no provider in UI) | unit | Hooks/screens sem import github/gitlab/fetch | `src/presentation/__tests__/isolation.test.ts` (extend) | `pnpm test -- src/presentation` |
| Maestro E2E | none (this slice) | Out of scope | — | — |

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Single layer / task path | `pnpm test -- <scoped path from task>` |
| Full | After infra or presentation cluster | `pnpm test -- src/domain src/application src/infrastructure src/presentation` |
| Build | Phase end / feature close | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Domain + Application + Fake

```
T1 → T2 → T3
```

### Phase 2: Infrastructure ACL + DI

```
T4 → T5 → T6 → T7
```

### Phase 3: Presentation + Explore UI

```
T8 → T9 → T10
```

---

## Task Breakdown

### T1: Extend `RepoRepository` with `listTrending`

**What**: Add `ListTrendingInput` and `listTrending` to the domain port; export from `@/domain`; update domain public-api/isolation tests.  
**Where**: `src/domain/repositories/repo-repository.ts`, `src/domain/index.ts`, `src/domain/__tests__/**`  
**Depends on**: None  
**Reuses**: `SearchReposInput` / `PaginatedResult` patterns  
**Requirement**: EXP-10

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `ListTrendingInput` + `listTrending` on `RepoRepository`
- [x] Barrel exports type + no provider names in domain
- [x] Domain public-api/isolation tests updated and green
- [x] Gate: `pnpm test -- src/domain`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(domain): add listTrending to RepoRepository port`

---

### T2: Fake `listTrending` (stars desc + pagination)

**What**: Implement `listTrending` on in-memory repository (sort by `stars` desc, paginate; ignore date window). Update Fake tests.  
**Where**: `src/infrastructure/repositories/in-memory-repo-repository.ts`, `__tests__`  
**Depends on**: T1  
**Reuses**: Slice pagination from `search`  
**Requirement**: EXP-15

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Fake compiles against extended port
- [x] Tests cover multi-page + `hasNextPage` + star ordering
- [x] Gate: `pnpm test -- src/infrastructure/repositories`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(infra): support listTrending on in-memory repository`

---

### T3: Use case `createListTrendingRepos`

**What**: Factory use case with page/perPage defaults + asserts; export from `@/application`; unit tests 1:1 to EXP-11.  
**Where**: `src/application/use-cases/list-trending-repos.ts`, `__tests__`, `src/application/index.ts`  
**Depends on**: T1  
**Reuses**: `createSearchRepos` structure (no query normalize)  
**Requirement**: EXP-11

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Defaults `DEFAULT_PAGE` / `DEFAULT_PER_PAGE`
- [x] Rejects invalid page/perPage via domain asserts
- [x] Delegates to `repository.listTrending`
- [x] Application barrel + public-api tests updated
- [x] Gate: `pnpm test -- src/application`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(application): add listTrendingRepos use case`

---

### T4: Trending window helper (30 days)

**What**: Pure helpers `TRENDING_WINDOW_DAYS`, `getTrendingSinceDate`, `getTrendingSinceIso` with unit tests (fixed `now`).  
**Where**: `src/infrastructure/trending/window.ts`, `__tests__/window.test.ts`  
**Depends on**: None (can land after T1; before adapters)  
**Reuses**: N/A  
**Requirement**: EXP-13, EXP-14 (enabler)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] 30-day window documented in code
- [x] Date formats match GitHub (`YYYY-MM-DD`) and GitLab ISO Z
- [x] Gate: `pnpm test -- src/infrastructure/trending`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(infra): add trending 30-day window helpers`

**Note**: Diagram places T4 after T3 for phase clarity; body Depends on: None — allowed (no forward dep). Phase order still T3 → T4.

---

### T5: GitHub ACL `listTrending`

**What**: Implement GitHub `listTrending` via Search API `q=created:>{date}&sort=stars&order=desc`; MSW tests for URL/params/mapping/pagination/token.  
**Where**: `src/infrastructure/github/create-github-repo-repository.ts`, `__tests__`  
**Depends on**: T1, T4  
**Reuses**: `mapGithubRepo`, search pagination/cap helpers  
**Requirement**: EXP-13

**Tools**:

- MCP: NONE (docs already researched)
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Uses window helper; no hardcoded provider logic outside adapter
- [x] MSW asserts query string includes `created:>` + `sort=stars`
- [x] Gate: `pnpm test -- src/infrastructure/github`

**Tests**: unit (MSW)  
**Gate**: quick  
**Commit**: `feat(infra): implement GitHub listTrending via search API`

---

### T6: GitLab ACL `listTrending`

**What**: Implement GitLab `listTrending` via Projects API with `order_by=star_count`, `visibility=public`, `last_activity_after`; MSW tests.  
**Where**: `src/infrastructure/gitlab/create-gitlab-repo-repository.ts`, `__tests__`  
**Depends on**: T1, T4  
**Reuses**: `mapGitlabRepo`, next-page header helper  
**Requirement**: EXP-14

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] No `search` query param on trending calls
- [x] MSW asserts star order + activity + visibility params
- [x] Gate: `pnpm test -- src/infrastructure/gitlab`

**Tests**: unit (MSW)  
**Gate**: quick  
**Commit**: `feat(infra): implement GitLab listTrending via projects API`

---

### T7: Wire `listTrendingRepos` in DI container

**What**: Add `listTrendingRepos` to `AppContainer` / `createContainer`; update DI + public-api infra tests. Append **AD-026** to `.specs/STATE.md` Decisions if not already present.  
**Where**: `src/infrastructure/di/create-container.ts`, `__tests__`, `src/infrastructure/__tests__/public-api.test.ts`, `.specs/STATE.md`  
**Depends on**: T3, T5, T6  
**Reuses**: Wiring of `searchRepos`  
**Requirement**: EXP-12

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Container exposes callable `listTrendingRepos` (no `.execute`)
- [x] Works with Fake `repository` override
- [x] AD-026 recorded in STATE Decisions
- [x] Gate: `pnpm test -- src/infrastructure/di src/infrastructure/__tests__/public-api.test.ts`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(infra): expose listTrendingRepos on app container`

---

### T8: `queryKeys.trending` + `useListTrendingRepos`

**What**: Add trending query key and infinite-query hook mirroring `useSearchRepos`; hook tests for pages, dataSource key, append, stop when no next, refetch.  
**Where**: `src/presentation/constants/query-keys.ts`, `src/presentation/hooks/use-list-trending-repos.ts`, `__tests__`, presentation barrel/isolation if needed  
**Depends on**: T7  
**Reuses**: `useSearchRepos` pattern  
**Requirement**: EXP-01, EXP-03, EXP-06, EXP-08, EXP-09, EXP-16, EXP-17

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `queryKeys.repos.trending(dataSource)` includes `dataSource`
- [x] Infinite query uses `container.listTrendingRepos`
- [x] Tests cover next page / no extra fetch / key isolation (no invalidate)
- [x] Gate: `pnpm test -- src/presentation`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(presentation): add useListTrendingRepos infinite query hook`

---

### T9: Rewrite `ExploreScreen` (simple list + states)

**What**: Replace Expo template Explore with DS-based FlatList: rows (`fullName`, stars, language), loading/empty/error/footer/pull-to-refresh; **no** navigation/`Linking` on press. Screen tests with Fake.  
**Where**: `src/presentation/screens/ExploreScreen.tsx`, `src/presentation/screens/__tests__/ExploreScreen.test.tsx`  
**Depends on**: T8  
**Reuses**: `HomeScreen` Container/Header patterns; `mapAppErrorToMessage`; `Loading` atom  
**Requirement**: EXP-02, EXP-04, EXP-05, EXP-07, EXP-16 (+ edge rate_limit via mapper)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`, `frontend-design` (restrained — simple layout per context)

**Done when**:

- [x] Template Parallax/Themed/Collapsible removed from Explore
- [x] Renders trending via hook; states covered by tests
- [x] No `onPress` navigation to details
- [x] Gate: `pnpm test -- src/presentation/screens`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(explore): show trending repos with infinite scroll`

---

### T10: Isolation + build gate + STATE handoff

**What**: Ensure presentation/screens isolation tests forbid github/gitlab/fetch imports; run full build gate; update `.specs/STATE.md` Handoff for `explore-trending`; mark tasks Done when green.  
**Where**: `src/presentation/__tests__/isolation.test.ts` (extend), optionally screen isolation assert, `.specs/STATE.md`, this `tasks.md` status  
**Depends on**: T9  
**Reuses**: Existing isolation test patterns  
**Requirement**: EXP-01…17 close-out / Success Criteria

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Isolation asserts cover Explore hook/screen paths
- [x] Gate: `pnpm test` && `pnpm lint`
- [x] STATE Handoff updated (feature in progress → ready for Verifier after last commit)
- [x] Spec requirement statuses → Implementing/Verified as applicable

**Tests**: unit  
**Gate**: build  
**Commit**: `test(explore): tighten isolation and close trending build gate`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 ──→ T2 ──→ T3
Phase 2:  T4 ──→ T5 ──→ T6 ──→ T7
Phase 3:  T8 ──→ T9 ──→ T10
```

**Deps note:** T5 and T6 both depend on T1+T4 (sequential in phase: T4 then T5 then T6). T7 depends on T3+T5+T6. T2 depends only on T1 (can conceptually parallel T3; executed after T1 before T3 completes phase).

Execution is strictly sequential within phases.

**Batch packing (~7 tasks):** 10 tasks → 2 batches  
- Batch A: Phase 1 + Phase 2 (T1–T7)  
- Batch B: Phase 3 (T8–T10)  

At Execute: offer sub-agents (offer-then-confirm).

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Domain port | 1 contract + barrel/tests | ✅ Granular |
| T2: Fake listTrending | 1 method + tests | ✅ Granular |
| T3: Use case | 1 factory + tests | ✅ Granular |
| T4: Window helper | 1 module + tests | ✅ Granular |
| T5: GitHub ACL | 1 method + MSW | ✅ Granular |
| T6: GitLab ACL | 1 method + MSW | ✅ Granular |
| T7: DI wire | 1 container field + AD-026 | ✅ Granular |
| T8: Hook + keys | 1 hook cohesive with keys | ✅ Granular (cohesive) |
| T9: ExploreScreen | 1 screen + tests | ✅ Granular |
| T10: Isolation + gate | close-out cohesive | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | Phase1 start | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T1 | T1 → T2 → T3 (T3 after T2 in phase; depends T1 only) | ✅ Match |
| T4 | None | T3 → T4 (phase order) | ✅ Match |
| T5 | T1, T4 | T4 → T5 | ✅ Match |
| T6 | T1, T4 | T5 → T6 (also needs T4; sequential after T5) | ✅ Match |
| T7 | T3, T5, T6 | T6 → T7 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T9 | T9 → T10 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | --------------- | --------- | ------ |
| T1 | Domain port | unit | unit | ✅ OK |
| T2 | Fake | unit | unit | ✅ OK |
| T3 | Use case | unit | unit | ✅ OK |
| T4 | Window helper | unit | unit | ✅ OK |
| T5 | GitHub adapter | unit (MSW) | unit (MSW) | ✅ OK |
| T6 | GitLab adapter | unit (MSW) | unit (MSW) | ✅ OK |
| T7 | DI | unit | unit | ✅ OK |
| T8 | Hook + keys | unit | unit | ✅ OK |
| T9 | ExploreScreen | unit | unit | ✅ OK |
| T10 | Isolation | unit | unit | ✅ OK |

---

## Requirement → Task Map

| Requirement ID | Task(s) |
| -------------- | ------- |
| EXP-01 | T8, T9 |
| EXP-02 | T9 |
| EXP-03 | T8 |
| EXP-04 | T9 |
| EXP-05 | T9 |
| EXP-06 | T8 |
| EXP-07 | T9 |
| EXP-08 | T8 |
| EXP-09 | T8 |
| EXP-10 | T1 |
| EXP-11 | T3 |
| EXP-12 | T7 |
| EXP-13 | T4, T5 |
| EXP-14 | T4, T6 |
| EXP-15 | T2 |
| EXP-16 | T8, T9 |
| EXP-17 | T8 |

**Coverage:** 17 total, 17 mapped, 0 unmapped
