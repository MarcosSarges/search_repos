# Infrastructure Layer Specification

## Problem Statement

A application e o DI já orquestram a porta `RepoRepository` via Fake. Sem adapters HTTP reais para GitHub e GitLab, o app não cumpre o enunciado de múltiplas fontes em runtime nem isola formatos/paginação distintos. É preciso uma Anti-Corruption Layer testável (fetch + mappers + erros → `AppError`) e `resolveRepository` entregando implementações reais.

## Goals

- [ ] Dois adapters `RepoRepository` (GitHub, GitLab) traduzem APIs públicas para entidades de domínio sem vazar formatos externos
- [ ] `resolveRepository` / `createContainer` usam adapters HTTP em runtime; Fake só em testes
- [ ] Erros HTTP/rede/abort mapeiam para `AppErrorCode` (incl. codes novos); testes MSW cobrem o fluxo adapter ponta a ponta

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| UI / formulário de token + persistência | Deferred — sessão/credenciais |
| `AppContainerProvider` / hooks React / TanStack Query | Presentation |
| Telas busca / detalhes / issues | Presentation |
| Copy amigável de erro na UI | Presentation |
| Path URL-encoded GitLab como `repoId` | Fatia usa id numérico da busca |
| Cliente HTTP injetável só para testes | Rejeitado — MSW + fetch nativo |
| Token via `.env` como fonte de verdade | Revisado no context (AD-008 a superseder) |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Base URLs | GitHub `https://api.github.com`; GitLab `https://gitlab.com/api/v4` | APIs públicas do enunciado / docs oficiais | y (context + enunciado) |
| GitHub search | `GET /search/repositories` com `sort=stars&order=desc` | Paridade com GitLab `order_by=star_count` | y (agent; enunciado exige busca equivalente) |
| GitHub detail / issues | `GET /repos/{owner}/{repo}`; issues `state=open` | Docs REST; alinhado a GitLab `state=opened` | y |
| Auth header quando há token | GitHub `Authorization: Bearer <token>`; GitLab `PRIVATE-TOKEN: <token>` (ou Bearer equivalente documentado) | Padrões oficiais; detalhe fino no Design | n (agent discretion) |
| `createContainer` / resolve deps | `tokens?: { github?: string; gitlab?: string }` + `dataSource`; resolve escolhe token do source ativo | Review: evita Presentation microgerenciar chave | y (review 2026-08-02) |
| `rate_limit` cause | Em 429, `cause` carrega metadados de reset/retry parseados dos headers da Response | Review: UX futura sem copy no domínio | y (review) |
| GitHub search page cap | `hasNextPage` usa `Math.min(total_count, 1000)` | Search API hard limit ~1000 results | y (review) |
| Pagination helper API | Flag agnóstica `resolvedHasNext?` — sem `totalCount*` no kit HTTP | Review: kit genérico | y (review) |
| Detecção de abort | `AbortError` / `DOMException` com name `AbortError` → `aborted` | Context B | y |
| Timeout | Sem timeout custom nesta fatia; falha de rede do runtime → `network` | Evita inventar política de timeout | n (agent discretion) |
| MSW | Adicionar `msw` como devDependency + setup Jest **antes** de testes de `jsonFetch`/adapters | Context E + review (sem mock provisório de fetch) | y |
| README | Ajuste mínimo se Execute tocar docs; senão feature de credenciais | Agent discretion | n |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Extensão mínima de `AppErrorCode` ⭐ MVP

**User Story**: As a developer of HTTP adapters, I want `unauthorized`, `forbidden`, and `aborted` on `AppErrorCode` so that infra can map 401/403/abort without inventing parallel error types.

**Why P1**: Context B; taxonomia única no Functional Core.

**Acceptance Criteria**:

1. WHEN `AppErrorCode` is inspected THEN it SHALL include exactly the previous codes plus `unauthorized`, `forbidden`, and `aborted` (full set: `rate_limit` \| `network` \| `not_found` \| `empty_query` \| `invalid_input` \| `unauthorized` \| `forbidden` \| `aborted` \| `unknown`)
2. WHEN `createAppError` is called with each new code THEN it SHALL return an `AppError` with that `code` and optional `cause`, without a user-facing `message` field on the domain contract
3. WHEN domain isolation tests run THEN `src/domain/` SHALL still not import React, RN, Expo, Axios, AsyncStorage, TanStack Query, Zustand, styled-components, or HTTP client libraries

**Independent Test**: Unit tests on `AppErrorCode` / `createAppError`; existing domain isolation still green.

---

### P1: Adapter GitHub (`RepoRepository`) ⭐ MVP

**User Story**: As the composition root, I want a GitHub `RepoRepository` implementation using native `fetch` so that search, details, and issues speak the domain contract.

**Why P1**: Enunciado §5.1 / §3.3; AD-002.

**Acceptance Criteria**:

1. WHEN `search` is called with a valid query THEN the adapter SHALL request GitHub repository search (sorted by stars descending), map each item to `Repo` with `id` equal to `owner/repo` (`full_name`), and return `PaginatedResult<Repo>` without `totalCount` on the result
2. WHEN GitHub search JSON includes `total_count` THEN the adapter/mapper SHALL compute `hasNextPage` as `(page * perPage) < Math.min(total_count, 1000)` (Search API result window cap) and SHALL NOT expose `totalCount` on `PaginatedResult`
3. WHEN `getById` / `listIssues` receive a `repoId` that does not contain `/` THEN the adapter SHALL reject with `AppError` code `invalid_input` without issuing an HTTP request
4. WHEN `getById` receives a valid `owner/repo` THEN it SHALL fetch that repository and map to `Repo` with the same opaque `id` format
5. WHEN `listIssues` is called with a valid `repoId` THEN it SHALL fetch open issues for that repo, map to `Issue` (labels included), and return `PaginatedResult<Issue>`
6. WHEN optional API fields are `null` or omitted THEN the mapper SHALL produce domain optionals as `undefined` (never `null` on `Repo` / `Issue` fields)
7. WHEN an optional `token` is provided to the adapter THEN authenticated requests SHALL include it; WHEN omitted THEN requests SHALL proceed anonymously
8. WHEN `hasNextPage` is derived for non-search list endpoints THEN the adapter SHALL prefer GitHub `Link` `rel="next"` when present, else fall back to `items.length === perPage`, and WHEN `items` is empty THEN `hasNextPage` SHALL be `false`
9. WHEN search `hasNextPage` is computed THEN the GitHub adapter/mapper SHALL pass only a provider-resolved boolean into the shared pagination helper (the shared helper SHALL NOT accept a `totalCount`-specific input field)

**Independent Test**: MSW-backed adapter tests with fixtures (happy + null/omitted fields + invalid id + pagination headers).

---

### P1: Adapter GitLab (`RepoRepository`) ⭐ MVP

**User Story**: As the composition root, I want a GitLab `RepoRepository` implementation so that the same port works with GitLab’s different payloads and pagination headers.

**Why P1**: Enunciado §5.2 / §3.3; AD-002.

**Acceptance Criteria**:

1. WHEN `search` is called THEN the adapter SHALL call GitLab projects search ordered by star count descending and map each project to `Repo` with `id` equal to `String(project.id)`
2. WHEN `getById` / `listIssues` receive a non-numeric `repoId` THEN the adapter SHALL reject with `invalid_input` without HTTP
3. WHEN `getById` receives a numeric-string `repoId` THEN it SHALL fetch `GET /projects/{id}` and map to `Repo`
4. WHEN `listIssues` is called THEN it SHALL fetch opened issues for that project id and map to `Issue`
5. WHEN optional API fields are `null` or omitted THEN the mapper SHALL emit `undefined` on domain optionals (never `null`)
6. WHEN an optional `token` is provided THEN requests SHALL include it; WHEN omitted THEN anonymous
7. WHEN computing `hasNextPage` THEN the adapter SHALL prefer GitLab next-page headers (`X-Next-Page` or equivalent) when present, else `items.length === perPage`, and empty `items` ⇒ `hasNextPage: false`

**Independent Test**: MSW-backed adapter tests mirroring GitHub coverage for GitLab fixtures/headers.

---

### P1: Classificação de erros HTTP / rede / abort ⭐ MVP

**User Story**: As a caller of the port, I want failed HTTP operations rejected as `AppError` with the agreed codes so that presentation can branch later without parsing status codes.

**Why P1**: Context B; enunciado rate limit / rede.

**Acceptance Criteria**:

1. WHEN the API responds `429` THEN the adapter SHALL reject with `rate_limit` and SHALL attach a structured `cause` that includes available retry/reset metadata parsed from response headers (at minimum supporting GitHub-style `X-RateLimit-Reset` and/or `Retry-After` when present)
2. WHEN the API responds `401` THEN the adapter SHALL reject with `unauthorized`
3. WHEN the API responds `403` THEN the adapter SHALL reject with `forbidden`
4. WHEN the API responds `404` THEN the adapter SHALL reject with `not_found`
5. WHEN the request fails due to network/offline/TypeError from fetch (non-abort) THEN the adapter SHALL reject with `network`
6. WHEN the request is aborted (`AbortError`) THEN the adapter SHALL reject with `aborted`
7. WHEN the API responds with other error statuses or unparseable success bodies that cannot be mapped THEN the adapter SHALL reject with `unknown`
8. WHEN any of the above errors are thrown THEN they SHALL satisfy `isAppError` and MAY attach the underlying value as `cause` (for `rate_limit`, the structured retry metadata takes precedence as `cause`)

**Independent Test**: MSW status fixtures + simulated abort/network in adapter tests.

---

### P1: DI runtime com adapters reais ⭐ MVP

**User Story**: As presentation/tests wiring the app, I want `resolveRepository` to return HTTP adapters per `DataSource` so Fake is no longer the production path.

**Why P1**: Context E; fecha AD-020 “ambas → Fake”.

**Acceptance Criteria**:

1. WHEN `resolveRepository('github')` is called THEN it SHALL return the GitHub HTTP adapter (not the in-memory Fake)
2. WHEN `resolveRepository('gitlab')` is called THEN it SHALL return the GitLab HTTP adapter (not the in-memory Fake)
3. WHEN `createContainer` is given `tokens?: { github?: string; gitlab?: string }` THEN it SHALL forward only the token matching the active `dataSource` into the resolved adapter (Presentation SHALL NOT need to pick which string to send)
4. WHEN modules under `src/infrastructure/di/` are inspected THEN they SHALL still NOT import Zustand
5. WHEN the in-memory Fake module is used THEN production `resolveRepository` paths SHALL NOT instantiate it; Fake remains exportable for tests via `@/infrastructure` (or the Fake module path)
6. WHEN application/use-case tests need a port double THEN they SHALL continue to import the Fake from infrastructure (not resurrect Fake as runtime default)

**Independent Test**: Updated DI unit tests (with MSW or adapter identity checks); Fake still imported only from test files for use-case suites.

---

### P2: Barrel e isolamento da infra de produto

**User Story**: As a consumer, I want a stable `@/infrastructure` public API and no accidental framework bleed from adapters beyond HTTP/`fetch`.

**Why P2**: Limite Clean Arch; testabilidade.

**Acceptance Criteria**:

1. WHEN importing from `@/infrastructure` THEN `createContainer`, container typings, Fake factory, and what is needed to construct/resolve HTTP repos (as Design defines) SHALL be reachable
2. WHEN adapter source files are scanned THEN they SHALL NOT import React, React Native UI, Zustand, TanStack Query, or styled-components (native `fetch` and test-only MSW outside production paths are allowed)

**Independent Test**: Barrel smoke + isolation/source scan test.

---

## Edge Cases

- WHEN GitHub `repoId` is `"12345"` (no `/`) THEN `invalid_input` without HTTP
- WHEN GitLab `repoId` is `"vuejs/vue"` THEN `invalid_input` without HTTP
- WHEN search/list returns `items: []` THEN `hasNextPage === false`
- WHEN pagination headers are stripped but `items.length === perPage` THEN `hasNextPage === true` (fallback)
- WHEN pagination headers say no next page even if `length === perPage` THEN headers win → `hasNextPage === false`
- WHEN GitHub search `total_count` is `5000` and `page * perPage >= 1000` THEN `hasNextPage === false` (cap), even though raw `total_count` is larger
- WHEN GitHub search `total_count` implies another page within the 1000-result window THEN `hasNextPage === true`
- WHEN description/avatar/language/label color are `null` THEN domain fields are `undefined`
- WHEN token is `undefined` for the active source THEN no auth header is sent
- WHEN fetch throws `AbortError` THEN `aborted`, not `network`
- WHEN response is `429` with `X-RateLimit-Reset` THEN `rate_limit` and `cause` exposes that reset metadata for later UX

---

## Implicit-requirement dimensions

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | Fail Fast `invalid_input` on provider-incompatible `repoId`; page/perPage already validated in application |
| Failure / partial-failure | Entire operation fails as `AppError`; no partial `PaginatedResult` on HTTP error |
| Idempotency / retry | N/A — no retry policy in infra this slice |
| Auth & rate limits | Optional tokens map on DI; `429` → `rate_limit` + structured reset/retry `cause` |
| Concurrency / ordering | N/A — stateless adapters per call; abort → `aborted` |
| Data lifecycle / expiry | N/A — tokens persistence deferred |
| Observability | N/A — structured `cause` only; no logging framework required |
| External-dependency failure | Mapped via classifier (network/unknown/rate_limit/…) |
| State-transition integrity | N/A |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| INFRA-01 | P1: AppErrorCode extension | Design | Pending |
| INFRA-02 | P1: createAppError new codes | Design | Pending |
| INFRA-03 | P1: domain isolation retained | Design | Pending |
| INFRA-04 | P1: GH search → Repo + id owner/repo | Design | Pending |
| INFRA-05 | P1: GH search hasNextPage via min(total_count,1000) | Design | Pending |
| INFRA-06 | P1: GH invalid repoId → invalid_input | Design | Pending |
| INFRA-07 | P1: GH getById | Design | Pending |
| INFRA-08 | P1: GH listIssues open | Design | Pending |
| INFRA-09 | P1: GH null/omit → undefined | Design | Pending |
| INFRA-10 | P1: GH optional token | Design | Pending |
| INFRA-11 | P1: GH hasNextPage hybrid (lists) | Design | Pending |
| INFRA-12 | P1: GL search → numeric string id | Design | Pending |
| INFRA-13 | P1: GL invalid repoId → invalid_input | Design | Pending |
| INFRA-14 | P1: GL getById | Design | Pending |
| INFRA-15 | P1: GL listIssues opened | Design | Pending |
| INFRA-16 | P1: GL null/omit → undefined | Design | Pending |
| INFRA-17 | P1: GL optional token | Design | Pending |
| INFRA-18 | P1: GL hasNextPage hybrid | Design | Pending |
| INFRA-19 | P1: 429 → rate_limit + structured cause | Design | Pending |
| INFRA-20 | P1: 401 → unauthorized | Design | Pending |
| INFRA-21 | P1: 403 → forbidden | Design | Pending |
| INFRA-22 | P1: 404 → not_found | Design | Pending |
| INFRA-23 | P1: network failures | Design | Pending |
| INFRA-24 | P1: abort → aborted | Design | Pending |
| INFRA-25 | P1: unknown fallback | Design | Pending |
| INFRA-26 | P1: isAppError + cause | Design | Pending |
| INFRA-27 | P1: resolveRepository github HTTP | Design | Pending |
| INFRA-28 | P1: resolveRepository gitlab HTTP | Design | Pending |
| INFRA-29 | P1: createContainer tokens map → active source | Design | Pending |
| INFRA-30 | P1: di/ no Zustand | Design | Pending |
| INFRA-31 | P1: Fake out of runtime resolve | Design | Pending |
| INFRA-32 | P1: Fake remains for tests | Design | Pending |
| INFRA-33 | P2: infrastructure barrel | Design | Pending |
| INFRA-34 | P2: adapter isolation scan | Design | Pending |
| INFRA-35 | P1: GH search passes only resolvedHasNext to shared helper | Design | Pending |

**Coverage:** 35 total, 35 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] GitHub e GitLab implementam `RepoRepository` com mappers que respeitam opcionalidade do domínio
- [ ] Runtime DI resolve adapters HTTP; Fake só em testes
- [ ] Erros HTTP/rede/abort cobertos pelos codes acordados (incl. três novos)
- [ ] Suite Jest com MSW valida adapters ponta a ponta (incl. fixtures incompletas e Fail Fast de `repoId`)
