# Infra HTTP Clients & Host Specification

## Problem Statement

Os adapters `RepoRepository` misturam montagem de URL, `fetch` e mapeamento de domínio. Isso dificulta testar a ACL sem rede e impede host configurável (ex. GitLab self-hosted). GitLab ainda usa `PRIVATE-TOKEN` enquanto aceita `Authorization: Bearer`, assimétrico ao GitHub.

## Goals

- [ ] Cada provedor tem um **ApiClient** na infrastructure (host + auth Bearer + HTTP); o repository só orquestra domínio/mappers/paginação
- [ ] Host (`baseUrl`) é injetável com default oficial; GitLab e GitHub usam só `Authorization: Bearer`
- [ ] Contratos públicos de DI/`RepoRepository` e comportamento observável dos adapters permanecem equivalentes (gate MSW verde)

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| UI / persistência de tokens ou hosts | Presentation / credentials |
| Application-layer `RepoService` | Use cases já orquestram; client fica na infra |
| Retry / circuit breaker / timeout policy | Não pedido nesta fatia |
| Self-hosted UI ou seletor de host | Só contrato `baseUrl?` no wiring |
| Mudança de porta de domínio ou use cases | Refactor de infra apenas |
| Troca de MSW / bump de versão | Manter harness atual |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Onde vive o client | `src/infrastructure/{github\|gitlab}/*-api-client.ts` (ou pasta `clients/`) — **não** em `application/` | Clean Arch; user: service host + fetch fora do repo | y (prior discuss) |
| Auth unificada | Só `Authorization: Bearer <token>` (GH + GL); remover `PRIVATE-TOKEN` / `tokenHeader: 'private-token'` | GitLab aceita Bearer; simplifica `jsonFetch` | y (user) |
| Host default | GH `https://api.github.com`; GL omitido → `https://gitlab.com/api/v4` | Comportamento atual | y |
| GitLab `baseUrl` custom | Aceita **origem** (`https://gitlab.empresa.com`) **ou** API base já com `/api/v4`; o client **normaliza** anexando `/api/v4` se o path ainda não terminar com `/api/v4` (sem duplicar) | Review DX — on-prem costuma passar só o domínio | y (review 2026-08-02) |
| URL join | Sempre `new URL(relativePath, normalizedBase + '/')` (ou equivalente Web API) — **não** concat string/`replace` de slash | Review — evita `hostpath` sem `/` | y (review) |
| MSW + host dinâmico | Handlers usam wildcard de path (ex. `*/search/repositories`, `*/projects`) ou host do teste; **não** só URL absoluta do default | Review — evita unhandled → rede real | y (review) |
| DI shape | `hosts?: { github?: string; gitlab?: string }` espelhando `tokens` | Presentation injeta bag; DI seleciona por `dataSource` | y (design inline) |
| Client injetável no repository | DI cria ApiClient e passa `{ client }` ao repository | Testabilidade; evita fetch no repo | y (design inline) |
| `jsonFetch` | Continua thin helper usado **só** pelos ApiClients (não pelos repositories) | DRY sem porta HTTP genérica injetável “só para teste” | y (align AD-022 spirit) |
| Escopo de testes | Atualizar MSW (wildcards) + Bearer; unit client (host normalize, URL join) | Gate não regredir INFRA behavior | y |

**Open questions:** none — unresolved items logged as assumptions above.

---

## User Stories

### P1: ApiClient por provedor (host + Bearer) ⭐ MVP

**User Story**: As a developer maintaining the Anti-Corruption Layer, I want GitHub/GitLab HTTP calls behind a provider ApiClient with injectable `baseUrl` and Bearer auth so that repositories do not call `fetch`/`jsonFetch` directly.

**Why P1**: Separação pedida; base para self-hosted futuro.

**Acceptance Criteria**:

1. WHEN a GitHub ApiClient is constructed with optional `baseUrl` and `token` THEN it SHALL default `baseUrl` to `https://api.github.com` when omitted and SHALL send `Authorization: Bearer <token>` only when `token` is present
2. WHEN a GitLab ApiClient is constructed with optional `baseUrl` and `token` THEN it SHALL default to normalized `https://gitlab.com/api/v4` when omitted and SHALL send `Authorization: Bearer <token>` only when `token` is present (SHALL NOT use `PRIVATE-TOKEN`)
3. WHEN a GitLab ApiClient receives a custom `baseUrl` whose path does **not** already end with `/api/v4` (e.g. `https://gitlab.empresa.com` or with trailing slash) THEN it SHALL normalize by appending `/api/v4` before issuing requests; WHEN the path already ends with `/api/v4` THEN it SHALL NOT duplicate that suffix
4. WHEN the GitHub ApiClient performs search/get/list-issues HTTP THEN repositories SHALL NOT import or call `jsonFetch` / `fetch` directly (only the client may)
5. WHEN the GitLab ApiClient performs the equivalent HTTP THEN the same restriction as AC4 SHALL hold for the GitLab repository module
6. WHEN `baseUrl` is overridden THEN request URLs SHALL be built with the Web `URL` constructor (`new URL(path, base)`) against the **normalized** API base (not raw string concatenation / slash regex alone)
7. WHEN MSW tests cover custom `baseUrl` THEN handlers SHALL match via path wildcards (or equivalent host-agnostic patterns), not only absolute default-host URLs, so requests are intercepted and do not hit the real network

**Independent Test**: Unit/MSW — Bearer on both; GitLab root vs `/api/v4` host normalize; custom host intercepted by wildcard MSW; repo source scan forbids `jsonFetch`/`fetch`.

---

### P1: Repositories as ACL-only + DI hosts bag ⭐ MVP

**User Story**: As the composition root, I want repositories to depend on ApiClients (mapping + pagination + Fail Fast only) and DI to forward optional `hosts` like `tokens`, so wiring stays Presentation-friendly.

**Why P1**: Fecha o refactor sem mudar a porta de domínio.

**Acceptance Criteria**:

1. WHEN `createGithubRepoRepository` / `createGitlabRepoRepository` run THEN they SHALL obtain HTTP results via their ApiClient and continue to return domain `Repo` / `Issue` / `PaginatedResult` with existing mapping and `hasNextPage` rules (incl. GH search `Math.min(total_count, 1000)`)
2. WHEN `createContainer` receives `hosts?: { github?: string; gitlab?: string }` THEN it SHALL pass the host for the active `dataSource` into the resolved adapter/client wiring (same selection pattern as `tokens`)
3. WHEN `hosts` / `tokens` are omitted THEN behavior SHALL match current defaults (official hosts, anonymous)
4. WHEN existing adapter MSW gates run THEN search sort params, Fail Fast `repoId`, error codes, and pagination semantics SHALL still pass
5. WHEN `jsonFetch` supports auth THEN it SHALL only need Bearer (no `private-token` branch required for production paths)

**Independent Test**: Updated DI tests for hosts bag; full `pnpm test -- src/infrastructure` green.

---

## Edge Cases

- WHEN `token` is undefined THEN no `Authorization` header is sent
- WHEN `hosts.gitlab` is set but `dataSource` is `github` THEN GitHub client uses default/github host only (no cross-wiring)
- WHEN GitLab `baseUrl` is `https://gitlab.empresa.com` THEN requests go to `https://gitlab.empresa.com/api/v4/...`
- WHEN GitLab `baseUrl` is `https://gitlab.empresa.com/api/v4` (or with trailing slash) THEN `/api/v4` is **not** duplicated
- WHEN path segments are joined THEN `new URL(...)` yields a valid absolute URL (no `hostpath` glued without `/`)
- WHEN GitLab previously relied on `PRIVATE-TOKEN` THEN after this feature only Bearer is used
- WHEN MSW uses only absolute default hosts and the client uses a custom host THEN that SHALL be treated as a test defect — handlers must be wildcard/host-agnostic for those cases

---

## Implicit-requirement dimensions

| Dimension | Resolution |
| --------- | ---------- |
| Auth & rate limits | Bearer only; rate_limit mapping unchanged in http kit |
| External-dependency failure | Unchanged classifier via client → jsonFetch |
| Input validation & bounds | Fail Fast repoId remains in repository |
| Remaining dimensions | N/A for this refactor scope (no new retry/persist/UI) |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| CLI-01 | P1: GH ApiClient default host + Bearer | Design | Pending |
| CLI-02 | P1: GL ApiClient default + Bearer (no PRIVATE-TOKEN) | Design | Pending |
| CLI-03 | P1: GL baseUrl normalize append `/api/v4` | Design | Pending |
| CLI-04 | P1: GH repo no direct jsonFetch/fetch | Design | Pending |
| CLI-05 | P1: GL repo no direct jsonFetch/fetch | Design | Pending |
| CLI-06 | P1: URL via `new URL(path, base)` | Design | Pending |
| CLI-07 | P1: MSW wildcard / host-agnostic handlers | Design | Pending |
| CLI-08 | P1: repo ACL mapping/pagination preserved | Design | Pending |
| CLI-09 | P1: DI hosts bag by dataSource | Design | Pending |
| CLI-10 | P1: omit hosts/tokens → defaults | Design | Pending |
| CLI-11 | P1: existing adapter gates green (Bearer) | Design | Pending |
| CLI-12 | P1: jsonFetch Bearer-only | Design | Pending |

**Coverage:** 12 total, 12 mapped to design, 0 unmapped

---

## Success Criteria

- [ ] Fetch/`jsonFetch` só nos ApiClients; repositories = ACL
- [ ] Hosts injetáveis via DI bag; Bearer unificado GH/GL
- [ ] Suite infrastructure (MSW) verde sem regressão de comportamento
