# Explore Trending Specification

## Problem Statement

A tab Explore ainda é o placeholder do template Expo e não mostra projetos da fonte ativa. O usuário precisa descobrir repositórios **trending** (GitHub ou GitLab) sem buscar — com infinite scroll — respeitando Clean Architecture e o contrato único `RepoRepository` (AD-001/002). Layout rico e navegação para detalhes ficam para fatias seguintes.

## Goals

- [x] Porta de domínio + use case para listar trending (paginado), sem vazar formatos de API
- [x] Adapters GitHub e GitLab implementam trending via docs oficiais (Anti-Corruption Layer)
- [x] Hook de presentation (`useInfiniteQuery`) + `queryKey` com `dataSource`
- [x] `ExploreScreen` simples com infinite scroll, loading / empty / erro; sem nav para detalhes

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Tela de detalhes / issues / navegação a partir do item | User: esperar detalhes; `NEXT.md` |
| Organism/molecule dedicado de card de repo | User: layout simples; DS futuro |
| Busca de repositórios (Home) | Feature de search UI separada |
| Ranking all-time (só stars sem janela) | User escolheu trending |
| UI de token / SecureStore UX | Credentials — `NEXT.md` |
| Maestro E2E desta tab | Depois das telas de produto estáveis |
| Remoção de Modal / Themed* em todo o app | Cleanup amplo — só Explore nesta fatia |
| `if (provider)` em telas/hooks | Proibido (AD-002) |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Critério | Trending (não all-time) | Discuss | y |
| Janela temporal | Últimos **30 dias** | Spec confirm + design (`created:>` / `last_activity_after`) | y |
| Layout | Lista simples com atoms DS; sem card novo | Discuss | y |
| Paginação | Infinite scroll (+ pull-to-refresh) | Discuss | y |
| Tap no item | Sem navegação nesta fatia | Discuss — espera detalhes | y |
| Nome da operação de porta | `listTrending` | Design approved | y |
| `perPage` default | `DEFAULT_PER_PAGE` (20) | Já usado em search/issues | y |
| GitHub HTTP | `GET /search/repositories` `q=created:>YYYY-MM-DD` + `sort=stars` + `order=desc` | Design + [Search docs](https://docs.github.com/en/rest/search/search#search-repositories) | y |
| GitLab HTTP | `GET /projects` `order_by=star_count` + `visibility=public` + `last_activity_after` | Design + [Projects docs](https://docs.gitlab.com/api/projects/#list-all-projects) | y |

**Open questions:** none — remaining items logged as assumptions above.

---

## User Stories

### P1: Listar trending na Explore ⭐ MVP

**User Story**: As a user, I want to open Explore and see trending repositories for the active data source so that I can discover popular recent projects without typing a search.

**Why P1**: Entrega o valor da tab; substitui o placeholder.

**Acceptance Criteria**:

1. WHEN the user opens the Explore tab with a resolved data source THEN the system SHALL fetch the first page of trending repositories for that data source via the application container (not via direct HTTP in the screen).
2. WHEN trending results are available THEN the system SHALL render each item with at least `fullName` (or `name` + `ownerName`), `stars`, and `language` when present, using existing DS atoms (no new repo-card organism).
3. WHEN the active `dataSource` is toggled (GitHub ↔ GitLab) THEN Explore SHALL show trending for the new source using a `queryKey` that includes `dataSource`, without calling `invalidateQueries` / `removeQueries` for the previous source (AD-023/005).
4. WHEN the first page request fails with an `AppError` THEN the system SHALL show the mapped PT-BR message (via existing `mapAppErrorToMessage`) and SHALL NOT crash.
5. WHEN the first page returns zero items THEN the system SHALL show an empty state (not an infinite spinner).

**Independent Test**: Com Fake in-memory populado / MSW, abrir Explore e ver lista; trocar fonte e ver cache isolado por `dataSource`.

---

### P1: Infinite scroll ⭐ MVP

**User Story**: As a user, I want to scroll to load more trending repositories so that I can browse beyond the first page.

**Why P1**: User pediu infinite scroll explicitamente.

**Acceptance Criteria**:

1. WHEN the user scrolls near the end and `hasNextPage` is true THEN the system SHALL request the next page and append items.
2. WHEN a subsequent page is loading THEN the system SHALL show a loading indicator at the list footer without clearing already visible items.
3. WHEN `hasNextPage` is false THEN the system SHALL NOT issue another page request from end-reached.
4. WHEN the user pull-to-refreshes THEN the system SHALL refetch from page 1 and replace the list with the fresh first page(s) result set.

**Independent Test**: Fake/`hasNextPage` controlado — duas páginas; assert append; terceira chamada não ocorre quando `hasNextPage=false`.

---

### P1: Contrato Clean Arch (trending) ⭐ MVP

**User Story**: As a maintainer, I want trending behind `RepoRepository` + use case + DI so that providers stay swappable and the UI stays provider-agnostic.

**Why P1**: AD-001/002 — requisito estrutural do projeto.

**Acceptance Criteria**:

1. WHEN `RepoRepository` is extended THEN it SHALL expose `listTrending({ page, perPage? }) => Promise<PaginatedResult<Repo>>` (or equivalent typed input) with no provider-specific fields.
2. WHEN `createListTrendingRepos(repository)` runs THEN it SHALL validate `page` / `perPage` with existing domain asserts and call `repository.listTrending`.
3. WHEN `createContainer` is built THEN it SHALL expose `listTrendingRepos` wired like the other use cases.
4. WHEN GitHub adapter implements `listTrending` THEN it SHALL call GitHub Search repositories with a trending date window + `sort=stars` + `order=desc` and map via existing `mapGithubRepo`.
5. WHEN GitLab adapter implements `listTrending` THEN it SHALL call GitLab Projects with star ordering + public visibility + recent-activity filter and map via existing `mapGitlabRepo`.
6. WHEN `createInMemoryRepoRepository` is used in tests THEN it SHALL support `listTrending` (deterministic subset / same list ordered by stars is acceptable if documented in tests).

**Independent Test**: Use-case unit tests + adapter MSW tests; presentation hook with Fake — zero imports de `github`/`gitlab` em `src/screens` / hooks de Explore.

---

### P2: Loading discreto no primeiro fetch

**User Story**: As a user, I want a clear loading state on first open so that I know Explore is working.

**Why P2**: UX mínima; pode reutilizar atom `Loading`.

**Acceptance Criteria**:

1. WHEN Explore is fetching the first page and there are no cached items THEN the system SHALL show a loading indicator.
2. WHEN cached data exists for the current `dataSource` THEN the system SHALL show cached items while any background refetch runs (stale-while-revalidate via Query defaults).

**Independent Test**: Hook test — `isPending` sem data → loading; com data seed → items visíveis.

---

## Edge Cases

- WHEN rate limit (`rate_limit`) THEN Explore SHALL show the mapped rate-limit message (same mapper; no special `cause` copy in this slice).
- WHEN network/`unknown` error on page > 1 THEN the system SHALL keep already loaded items and surface the error without wiping the list (TanStack `isFetchNextPageError` / equivalent UX).
- WHEN `perPage` omitted THEN adapters/use case SHALL use `DEFAULT_PER_PAGE`.
- WHEN GitHub search window returns fewer than `perPage` items THEN `hasNextPage` SHALL follow existing hybrid rules (`resolveHasNextPage` / search cap).
- WHEN template Explore assets (Parallax / Collapsible demo) are removed THEN the tab SHALL still be registered in Tabs as `Explore`.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| EXP-01 | P1: Listar trending | Execute | Verified |
| EXP-02 | P1: Listar trending (row fields) | Execute | Verified |
| EXP-03 | P1: Listar trending (toggle fonte) | Execute | Verified |
| EXP-04 | P1: Listar trending (erro) | Execute | Verified |
| EXP-05 | P1: Listar trending (empty) | Execute | Verified |
| EXP-06 | P1: Infinite scroll (next page) | Execute | Verified |
| EXP-07 | P1: Infinite scroll (footer loading) | Execute | Verified |
| EXP-08 | P1: Infinite scroll (stop) | Execute | Verified |
| EXP-09 | P1: Infinite scroll (pull-to-refresh) | Execute | Verified |
| EXP-10 | P1: Port `listTrending` | Execute | Verified |
| EXP-11 | P1: Use case + validation | Execute | Verified |
| EXP-12 | P1: DI `listTrendingRepos` | Execute | Verified |
| EXP-13 | P1: GitHub ACL | Execute | Verified |
| EXP-14 | P1: GitLab ACL | Execute | Verified |
| EXP-15 | P1: In-memory Fake | Execute | Verified |
| EXP-16 | P2: First-load loading | Execute | Verified |
| EXP-17 | P2: SWR with cache | Execute | Verified |

**Coverage:** 17 total, 17 mapped to tasks (T1–T10), 0 unmapped

---

## Success Criteria

- [x] Explore shows trending for GitHub and GitLab without provider branches in the screen
- [x] Infinite scroll loads subsequent pages; pull-to-refresh resets
- [x] Unit/MSW/hook tests cover use case, both adapters, Fake, and Explore hook/screen states
- [x] No navigation to details from Explore in this slice
- [x] Template Expo content removed from Explore

---

## Implicit-Requirement Dimensions (Medium sweep)

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | `page` / `perPage` via existing asserts; no free-text query |
| Failure / partial-failure | First-page error → message; next-page error → keep items |
| External-dependency failure | `AppError` from HTTP helpers; rate_limit mapped |
| Auth boundaries & rate limits | Optional token via existing DI; GitHub search rate limits apply; no new auth UI |
| Observability | N/A — no new telemetry in this slice |
| Idempotency / retry | QueryClient defaults only |
| Concurrency / ordering | Pages append in order via infinite query |
| Data lifecycle / expiry | Query cache keyed by `dataSource`; no persistence of list |
| State-transition integrity | N/A — read-only list |

Remaining dimensions N/A for this scope.
