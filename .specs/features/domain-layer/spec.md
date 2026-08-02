# Domain Layer Specification

## Problem Statement

O app precisa de um núcleo de domínio independente de provedor e de frameworks, para que busca, detalhes e issues compartilhem o mesmo contrato enquanto GitHub/GitLab diferem só na infra. Já existe um esqueleto em `src/domain/`, mas ele ainda carrega `source` na entidade, `DataSource` no núcleo, `totalCount`, `null` e mensagem em erro — desalinhado às decisões desta feature (Clean Arch + Functional Core).

## Goals

- [ ] Domínio exporta entidades + porta `RepoRepository` + `AppError` + helpers de validação, sem imports de RN/HTTP/Query/Storage e **sem** nomes de provedores (`github`/`gitlab`)
- [ ] Contrato único permite application/infra consumirem o mesmo shape independentemente da fonte ativa
- [ ] Testes de domínio (isolamento + erros + helpers) passam em Node/Jest sem mocks de framework de UI

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Use cases de busca/detalhes/issues | Spec seguinte; aqui só contratos/helpers (+ relocação mínima de `DataSource`) |
| HTTP GitHub/GitLab, mappers, DI wiring | Infraestrutura |
| TanStack Query / cache / hooks de tela | Presentation + AD-005 |
| Copy de erro amigável na UI | Presentation (G3) |
| Persistência / UX do seletor de fonte | Session store (AD-018); só troca o *import path* do tipo |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| `DataSource` **fora** do domínio | Union em `src/application/` (módulo de config/tipos de sessão), não em `src/domain/` | Evita vazamento de infraestrutura no núcleo (Dependency Rule) | y (review 2026-08-02) |
| Paradigma do domínio | **Functional Core**: shapes (types) + pure functions/helpers; sem classes/entity methods | Válido em TS; testável; não é DDD OO clássico — intencional | y (review) |
| Code de violação de invariante | `invalid_input` (bounds page/perPage; inputs inválidos além de query vazia) | Separar de `unknown` (falhas não classificadas) | y (review) |
| `empty_query` vs `invalid_input` | Query vazia/whitespace → `empty_query`; page/perPage inválidos → `invalid_input` | Taxonomia explícita | y |
| Ajustes mínimos de compilação em consumers | Permitidos (re-export/import de `DataSource`, shapes Repo/AppError) | CI verde; sem redesenhar use cases | y |
| `createdAt` / URLs | `string` sem branded type | Suficiente nesta fatia | y |
| Default `perPage` | Não existe no domínio | J3 | y |
| Isolamento verificável | Teste(s) de imports proibidos + ausência de `DataSource`/`github`/`gitlab` como tipo de domínio | §3.1 + Dependency Rule | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Contratos de entidades e porta ⭐ MVP

**User Story**: As a developer building application/infra, I want canonical Repo/Issue/pagination types and a `RepoRepository` port so that both providers implement one contract without the domain naming those providers.

**Why P1**: Sem contrato único não há multi-provider desacoplado (AD-002 / enunciado §3.3).

**Acceptance Criteria**:

1. WHEN the domain module is imported THEN it SHALL export `Repo`, `Issue`, `IssueLabel`, `PaginatedResult`, and `RepoRepository` (and related input types)
2. WHEN the domain module public API is inspected THEN it SHALL NOT export `DataSource` (nor any provider-literal union equivalent)
3. WHEN `Repo` / `Issue` are inspected THEN they SHALL NOT include a `source` (or equivalent provider) field
4. WHEN `Repo.id` and repository inputs use identity THEN they SHALL be opaque `string` (`repoId` only on `getById` / `listIssues`)
5. WHEN `PaginatedResult` is inspected THEN it SHALL include `items`, `page`, `perPage`, `hasNextPage` and SHALL NOT include `totalCount`
6. WHEN optional entity fields are absent THEN they SHALL be typed as optional (`?:` / `undefined`), not `null`
7. WHEN `SearchReposInput` / `ListIssuesInput` omit `perPage` THEN the type SHALL allow omission without a domain-level default constant required by callers
8. WHEN page numbering is documented/used in the contract THEN page `1` SHALL mean the first page (1-based)
9. WHEN `DataSource` is needed by session/theme/DI THEN it SHALL live outside `src/domain/` (under `src/application/`) and consumers SHALL import it from there

**Independent Test**: Type-level + unit tests on exported shapes/helpers; Jest imports `@/domain` without RN; assert no `DataSource` export from domain.

---

### P1: Erros tipados e isolamento ⭐ MVP

**User Story**: As a developer, I want typed `AppError` failures from the port and a framework-free domain so that UI and use cases share one error taxonomy and tests run in pure Node.

**Why P1**: Enunciado exige domínio isolado e erros tratáveis (rate limit, rede, etc.).

**Acceptance Criteria**:

1. WHEN `createAppError` is called with a code THEN it SHALL return an `AppError` with that `code` and optional `cause`, and SHALL NOT require or store a user-facing `message` field as part of the domain contract
2. WHEN `isAppError` receives a value created by `createAppError` THEN it SHALL return `true`
3. WHEN `AppErrorCode` is inspected THEN it SHALL be exactly `rate_limit` \| `network` \| `not_found` \| `empty_query` \| `invalid_input` \| `unknown`
4. WHEN the `RepoRepository` contract is documented/tested via fakes THEN rejected promises SHALL be representable as `AppError` (callers may rely on `isAppError`)
5. WHEN source files under `src/domain/` are scanned THEN they SHALL NOT import React, React Native, Expo, Axios, AsyncStorage, TanStack Query, Zustand, or styled-components

**Independent Test**: Unit tests for factory/guard; isolation test over import graph or source scan.

---

### P1: Helpers de validação/normalização ⭐ MVP

**User Story**: As a developer of use cases, I want pure domain helpers to trim/validate search query and assert page/perPage bounds so that rules live outside UI and infra.

**Why P1**: Decisão M2/N2/O3 — Functional Core; validação no domínio, testável sem application.

**Acceptance Criteria**:

1. WHEN a search-query helper is given whitespace-only or empty input THEN it SHALL throw an `AppError` with code `empty_query`
2. WHEN a search-query helper is given a string with leading/trailing spaces THEN it SHALL return (or expose) the trimmed query for use by callers
3. WHEN a page assert helper is given `page < 1` THEN it SHALL throw an `AppError` with code `invalid_input`
4. WHEN a perPage assert helper is given a present `perPage < 1` THEN it SHALL throw an `AppError` with code `invalid_input`
5. WHEN valid `page` (>= 1) and omitted or valid `perPage` (>= 1) are asserted THEN the helpers SHALL not throw

**Independent Test**: Pure Jest unit tests, no fakes of HTTP.

---

### P2: Barrel estável `@/domain`

**User Story**: As a consumer, I want a single public barrel so that imports stay stable across the app.

**Why P2**: Conveniência; não bloqueia o núcleo.

**Acceptance Criteria**:

1. WHEN importing from `@/domain` THEN the public types and helpers of this feature SHALL be reachable without deep imports (deep imports may still exist but barrel covers the public API)
2. WHEN importing provider/session config THEN `DataSource` SHALL be imported from `@/application` (or the chosen application config path), not from `@/domain`

**Independent Test**: Import smoke in a unit test file.

---

## Edge Cases

- WHEN query is `''` or only whitespace THEN search helper SHALL throw `empty_query`
- WHEN `perPage` is `undefined` THEN perPage assert SHALL skip lower-bound check (omission allowed)
- WHEN `page` is `0` or negative THEN page assert SHALL throw `invalid_input`
- WHEN `cause` is passed to `createAppError` THEN it SHALL be preserved on the error object
- WHEN an unknown non-Error is passed to `isAppError` THEN it SHALL return `false`

---

## Implicit-requirement dimensions

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | Helpers P1 — `empty_query` / `invalid_input` |
| Failure / partial-failure | `AppError` taxonomy; porta rejeita com `AppError` |
| Idempotency / retry | N/A — domínio sem I/O |
| Auth & rate limits | Codes only (`rate_limit`); tokens N/A (infra) |
| Concurrency / ordering | N/A |
| Data lifecycle / expiry | N/A |
| Observability | N/A |
| External-dependency failure | `network` / `rate_limit` / `not_found` / `unknown` |
| State-transition integrity | N/A |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| DOM-01 | P1: Entities — public exports (no DataSource) | Execute | Verified |
| DOM-02 | P1: Entities — no source on Repo/Issue | Execute | Verified |
| DOM-03 | P1: Entities — opaque string id / repoId | Execute | Verified |
| DOM-04 | P1: Entities — PaginatedResult without totalCount | Execute | Verified |
| DOM-05 | P1: Entities — optional fields via `?:` | Execute | Verified |
| DOM-06 | P1: Entities — perPage optional, no domain default | Execute | Verified |
| DOM-07 | P1: Entities — page 1-based | Execute | Verified |
| DOM-08 | P1: Errors — createAppError code+cause, no message | Execute | Verified |
| DOM-09 | P1: Errors — isAppError | Execute | Verified |
| DOM-10 | P1: Errors — AppErrorCode set (incl. invalid_input) | Execute | Verified |
| DOM-11 | P1: Errors — port rejects as AppError | Execute | Verified |
| DOM-12 | P1: Errors — domain isolation (no forbidden imports) | Execute | Verified |
| DOM-13 | P1: Helpers — empty_query on bad query | Execute | Verified |
| DOM-14 | P1: Helpers — trim query | Execute | Verified |
| DOM-15 | P1: Helpers — page/perPage → invalid_input | Execute | Verified |
| DOM-16 | P2: Barrel `@/domain` | Execute | Verified |
| DOM-17 | P1: DataSource relocated under application | Execute | Verified |

**Coverage:** 17 total, 17 mapped to tasks (T1–T6), 0 unmapped

---

## Success Criteria

- [ ] `src/domain` is the single source of truth for Repo/Issue/pagination/port/errors — provider-agnostic
- [ ] `DataSource` lives outside the domain; consumers import from application
- [ ] Domain unit tests pass; isolation test proves no forbidden framework imports
- [ ] No `source` on Repo; no `totalCount`; no required error `message`; invariant violations use `invalid_input`
