# Application Layer Specification

## Problem Statement

O domínio já expõe porta, entidades, erros e helpers; o esqueleto de application ainda duplica validação, usa `{ execute }`, trata `repoId` vazio como `not_found`, e não há composition root. Sem use cases alinhados ao Functional Core e um DI testável com Fake, a presentation não consegue consumir um grafo estável nem adiar HTTP GitHub/GitLab.

## Goals

- [ ] Use cases puros orquestram `@/domain` (helpers + porta) com defaults de paginação na application e sem frameworks
- [ ] Composition root em `infrastructure/di` resolve `DataSource` → `RepoRepository` (Fake provisório) e expõe funções wired via `createContainer`
- [ ] Fake vive na infrastructure; testes unitários de use cases + DI + isolation passam em Node/Jest

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| HTTP GitHub/GitLab, mappers, tokens | Feature de infraestrutura de rede |
| `AppContainerProvider` / hooks React | Presentation — acopla React + Zustand |
| TanStack Query / `queryKey` / invalidação | AD-005; spoiler só no context |
| Telas de busca/detalhes/issues | Presentation |
| Copy de erro amigável na UI | Presentation |
| Stubs GitHub/GitLab que só rejeitam | Evitado de propósito; Fake cobre runtime |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Forma do use case | Factory retorna `(input) => Promise<…>` (sem `.execute`) | Functional Core; consumo `container.searchRepos(input)` | y |
| Defaults page/perPage | `1` e `20` em constantes da application | Domínio sem default (DOM-06); enunciado usa per_page=20 | y |
| repoId vazio | `invalid_input` | Invariante de input; `not_found` fica para miss real da porta | y |
| Fake location | `src/infrastructure/` (fakes ou repositories/fake) | Impl concreta da porta = infra | y |
| resolveRepository agora | Ambas fontes → Fake | Contrato final; swap HTTP depois | y |
| DI + Zustand | DI não importa store; recebe `dataSource` | Testável em Node; Presentation orquestra | y |
| Provider React | Fora desta feature | Escopo estrito do composition root puro | y |
| Override de repo em testes | `createContainer` pode aceitar `repository?` opcional além de `dataSource` | Discrição do agent; facilita testes sem ramificar Fake | n (agent discretion) |
| Rename factories | Preferir `createSearchRepos` etc. se rename mecânico | Alinhar ao discuss; senão manter nomes atuais + retorno função | n (agent discretion) |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Use cases alinhados ao domínio ⭐ MVP

**User Story**: As a developer, I want search / get-details / list-issues use-case factories that validate via domain helpers and call `RepoRepository`, so that application does not duplicate rules or depend on UI/infra frameworks.

**Why P1**: Enunciado §3.1 — camada de application separada; AD-006 prioriza testes de use cases.

**Acceptance Criteria**:

1. WHEN `createSearchRepos` (or equivalent factory) is given a repository THEN it SHALL return a function `(input) => Promise<PaginatedResult<Repo>>` (not an object with `.execute`)
2. WHEN that function runs with a query THEN it SHALL obtain the trimmed query via `normalizeSearchQuery` and SHALL NOT reimplement empty/whitespace checks inline
3. WHEN page/perPage are omitted THEN the use case SHALL apply application defaults `page = 1` and `perPage = 20` before calling the port
4. WHEN page or present perPage violate bounds THEN the use case SHALL use `assertPage` / `assertPerPage` such that failures are `AppError` with code `invalid_input`
5. WHEN `createGetRepoDetails` / `createListRepoIssues` receive whitespace-only or empty `repoId` THEN they SHALL throw `AppError` with code `invalid_input` (after trim)
6. WHEN list-issues omits page/perPage THEN it SHALL apply the same application defaults as search before calling `listIssues`
7. WHEN source files under `src/application/` are scanned THEN they SHALL NOT import React, React Native, Expo, Axios, AsyncStorage, TanStack Query, Zustand, or styled-components

**Independent Test**: Jest unit tests with Fake repository; isolation scan over `src/application`.

---

### P1: Fake na infrastructure + composition root ⭐ MVP

**User Story**: As a developer of presentation/tests, I want `createContainer({ dataSource })` that wires Fake-backed use-case functions via `resolveRepository`, so that UI can progress without HTTP and the final DataSource branch already exists.

**Why P1**: AD-002 (uma decisão de fonte); Clean Arch composition root; adiar HTTP.

**Acceptance Criteria**:

1. WHEN the in-memory Fake is located THEN it SHALL live under `src/infrastructure/` (not under `src/application/fakes/`)
2. WHEN `resolveRepository('github')` and `resolveRepository('gitlab')` are called THEN each SHALL return a `RepoRepository` (currently the Fake for both)
3. WHEN `createContainer({ dataSource })` is called THEN it SHALL return an object exposing callable `searchRepos`, `getRepoDetails`, and `listRepoIssues` functions (partially applied; no `.execute` required at call site)
4. WHEN `createContainer` is called twice with different `dataSource` values THEN it SHALL return distinct container object instances (immutable wiring; no shared mutable repository ref inside a singleton)
5. WHEN modules under `src/infrastructure/di/` are inspected THEN they SHALL NOT import Zustand (or the session-preferences store)
6. WHEN the `@/application` barrel is inspected THEN it SHALL NOT export `createContainer`, `resolveRepository`, or Fake constructors/factories
7. WHEN the `@/infrastructure` barrel is imported THEN it SHALL expose `createContainer`, container typings, and the Fake factory for external/test use

**Independent Test**: Pure Jest tests on `resolveRepository` + `createContainer`; import smoke on barrels.

---

### P2: Barrel application estável

**User Story**: As a consumer, I want `@/application` to export use-case factories, I/O types, and `DataSource` only.

**Why P2**: Limite claro do núcleo; evita vazamento de infra.

**Acceptance Criteria**:

1. WHEN importing from `@/application` THEN use-case factories, their input/output types, `DataSource`, and `isDataSource` SHALL be reachable
2. WHEN application tests import the Fake THEN they SHALL import it from `@/infrastructure` (or the chosen infrastructure Fake path), not from `application/fakes`

**Independent Test**: Barrel/export smoke + updated use-case test imports.

---

## Edge Cases

- WHEN search query is `''` or whitespace-only THEN use case SHALL throw `empty_query` (via `normalizeSearchQuery`)
- WHEN `page` is `0` or negative THEN use case SHALL throw `invalid_input` (via `assertPage`)
- WHEN `perPage` is present and `< 1` THEN use case SHALL throw `invalid_input` (via `assertPerPage`)
- WHEN `perPage` is omitted THEN default `20` applies and assert runs on the resolved value (or equivalent: default then assert)
- WHEN `repoId` is `'   '` THEN get-details / list-issues SHALL throw `invalid_input`
- WHEN Fake `getById` misses a repo THEN it SHALL still reject with `not_found` (port miss ≠ empty input)
- WHEN `resolveRepository` receives each `DataSource` literal THEN both paths SHALL be defined (no fall-through to undefined)

---

## Implicit-requirement dimensions

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | Domain helpers + application defaults; empty repoId → `invalid_input` |
| Failure / partial-failure | Propagate port `AppError`; no retry in use cases |
| Idempotency / retry | N/A — no I/O policy in application |
| Auth & rate limits | N/A — codes only from port/infra later |
| Concurrency / ordering | Immutable containers; Presentation recreates on source change |
| Data lifecycle / expiry | N/A |
| Observability | N/A |
| External-dependency failure | Port rejects as `AppError`; Fake for now |
| State-transition integrity | N/A — DI stateless given `dataSource` |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| APP-01 | P1: UC — factory returns function | Tasks | Implementing |
| APP-02 | P1: UC — normalizeSearchQuery | Tasks | Implementing |
| APP-03 | P1: UC — defaults page/perPage | Tasks | Implementing |
| APP-04 | P1: UC — assertPage/assertPerPage | Tasks | Implementing |
| APP-05 | P1: UC — empty repoId → invalid_input | Tasks | Implementing |
| APP-06 | P1: UC — list-issues defaults | Tasks | Implementing |
| APP-07 | P1: UC — application isolation | Tasks | Implementing |
| APP-08 | P1: DI — Fake under infrastructure | Tasks | Implementing |
| APP-09 | P1: DI — resolveRepository branches | Tasks | Implementing |
| APP-10 | P1: DI — createContainer callables | Tasks | Implementing |
| APP-11 | P1: DI — immutable distinct containers | Tasks | Implementing |
| APP-12 | P1: DI — no Zustand in di/ | Tasks | Implementing |
| APP-13 | P1: DI — application barrel excludes DI/Fake | Tasks | Implementing |
| APP-14 | P1: DI — infrastructure barrel public API | Tasks | Implementing |
| APP-15 | P2: application barrel exports | Tasks | Implementing |
| APP-16 | P2: tests import Fake from infrastructure | Tasks | Implementing |

**Coverage:** 16 total, 16 mapped to tasks (T1–T8), 0 unmapped

---

## Success Criteria

- [ ] Use cases usam só helpers do domínio + porta; sem `.execute`; defaults 1/20 na application
- [ ] `createContainer({ dataSource })` entrega funções wired; ambas fontes → Fake; DI sem Zustand
- [ ] Fake e DI sob infrastructure; barrels respeitam Dependency Rule
- [ ] Testes unitários (use cases + DI + isolation) verdes em Jest/Node
