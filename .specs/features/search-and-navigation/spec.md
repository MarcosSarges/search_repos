# Search & Navigation Specification

## Problem Statement

A ponte de presentation (`useSearchRepos`, Query, DI) está pronta, mas a Home ainda é um placeholder e a navegação ainda é o template Expo (Tabs Home/Explore + Modal). Sem a tela de busca, o stack tipado lista → detalhe → issues, e um shell de tabs alinhado ao produto (Search / Favoritos / Explore / Config), o app não demonstra o enunciado §4.2 nem prepara as próximas funções.

## Goals

- [ ] Tela **Search** (ex-Home) com InputField + lista via `useSearchRepos` + infinite scroll + pull-to-refresh + loading/empty/erro
- [ ] Hook de debounce dedicado alimentando `useSearchRepos`
- [ ] Tab Search com stack tipado `SearchRepos` → `RepoDetails` → `RepoIssues` (stubs Details/Issues)
- [ ] Bottom tabs: **Search**, **Favoritos**, **Explore**, **Config** — mocks prontos nas três últimas
- [ ] Controles de **data source** + **tema** movidos para **Config**; placeholder de token (sem form SecureStore completo)
- [ ] Remover Modal e screens/rotas do template Expo (antiga Home/Explore boilerplate) substituídas pelo shell de produto

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| UI completa de detalhes (§4.3) | Próxima feature — stub apenas |
| UI completa de issues (§4.4) | Próxima feature — stub apenas |
| CRUD Favoritos + AsyncStorage | Mock tab only; persistência na feature Favoritos |
| Explore trending / repos em alta | Mock tab only; feature Explore |
| Formulário de token SecureStore | Placeholder na Config; credentials feature |
| Copy de rate limit com `cause` | Polish credentials |
| Showcase in-app | DS polish |
| Maestro E2E | Depois das telas estáveis |
| `invalidateQueries` no toggle de fonte | Rejeitado (AD-023/025) |
| Parse de `repo.id` por provedor | Domínio opaco |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Shell | Bottom tabs + nested stack na tab **Search** | User | y |
| Nome Home | Tab/tela principal de busca chama-se **Search** | User | y |
| Tabs | Search + Favoritos + Explore + Config (mocks nas 3) | User | y |
| Favoritos storage | Intenção AsyncStorage — **não** implementar nesta fatia | User (futuro) | y |
| Explore | Mock “repos em alta”; não é o ExploreScreen Expo | User | y |
| Config | Destino de data source + tema (+ placeholder token) | User | y |
| Mover chrome | Data source + theme **nesta fatia** saem do Search e vão para Config | Align “vamos mover” + Search limpa | y |
| Token na Config | Só placeholder / “em breve” | Sem form SecureStore aqui | y |
| Details / Issues | Stubs + CTA Issues | User | y |
| Debounce | Hook dedicado, ~350ms | User + agent | y / n→agent |
| Lista | Card DS; campos do enunciado | User | y |
| Empty / erro | Idle / empty / erro+Retry | User | y |
| Indicador de fonte (§4.1) | Visível na Config; opcional chip leve no Search | Agent discretion | n → agent |
| Idioma UI | PT-BR | Consistência | n → agent |

\*Confirmado na conversa como direção; defaults acima fecham o gate.

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Shell de tabs + limpeza do template ⭐ MVP

**User Story**: As a user, I want product tabs Search, Favoritos, Explore, and Config (with Favoritos/Explore/Config as ready mocks), without Expo Modal/boilerplate Explore, so the app shell matches the planned product.

**Why P1**: Âncora de navegação para busca e features futuras.

**Acceptance Criteria**:

1. WHEN the app boots THEN the root product UI SHALL present a **bottom tab** navigator with exactly these product tabs: **Search**, **Favoritos**, **Explore**, **Config** (labels may be localized PT-BR; route names stable in TypeScript)
2. WHEN Favoritos, Explore, or Config tabs are opened THEN each SHALL render a dedicated mock screen (title + placeholder copy + stable `testID`) and SHALL NOT crash or fetch product APIs for favorites/trending/tokens
3. WHEN the old Expo template is cleaned THEN `ModalScreen` / Modal route SHALL be removed, and the boilerplate Explore/Home template screens SHALL NOT remain as the product tabs (replaced by the product screens above)
4. WHEN the Search tab is focused THEN it SHALL host a **native stack** with `SearchRepos`, `RepoDetails`, and `RepoIssues`, typing `repoId: string` on Details and Issues
5. WHEN a repository row is pressed on SearchRepos THEN the app SHALL navigate to `RepoDetails` with `{ repoId: repo.id }` (opaque id)
6. WHEN the Details stub Issues CTA is pressed THEN the app SHALL navigate to `RepoIssues` with the same `repoId`

**Independent Test**: RNTL — tabs render four routes; mocks visible; Modal absent from types; Search stack navigation works.

---

### P1: Config — data source, tema, placeholder token ⭐ MVP

**User Story**: As a user, I want to change data source and theme from Config, so Search stays focused on searching and settings live in one place.

**Why P1**: User pediu Config como destino dos controles; enunciado §4.1 exige troca de fonte acessível.

**Acceptance Criteria**:

1. WHEN Config renders THEN it SHALL expose controls to toggle or select **data source** (GitHub/GitLab) and **theme mode** (light/dark), wired to the existing session store (same behavior as the previous Home header toggles)
2. WHEN data source or theme changes from Config THEN the change SHALL apply app-wide without restart (theme + primary / Query keys as already designed)
3. WHEN Config renders THEN it SHALL include a **token setup** placeholder section that does **not** persist a new token form in this feature (no full SecureStore credentials UI)
4. WHEN SearchRepos renders THEN it SHALL **not** be the primary home of data-source and theme toggles (those live on Config); Search MAY show a read-only indicator of active `dataSource` if needed for §4.1

**Independent Test**: Open Config → toggle theme and dataSource → assert store/UI update; Search has no duplicate primary toggles.

---

### P1: Busca com debounce hook + lista ⭐ MVP

**User Story**: As a user, I want to type a query on Search and see matching repositories so I can open details.

**Why P1**: Enunciado §4.2.

**Acceptance Criteria**:

1. WHEN SearchRepos renders THEN it SHALL show an `InputField` (DS) and a list region for results
2. WHEN the user types THEN input updates immediately AND a **debounce hook** in `src/presentation/hooks/` SHALL feed `useSearchRepos` (delay 300–400ms)
3. WHEN the debounced query is empty (trim) THEN no fetch AND idle/ready state (not empty-results)
4. WHEN the first page is loading THEN a loading indicator SHALL show for the list
5. WHEN results arrive THEN each row SHALL show name, owner, stars, language, description (optional fields safe)
6. WHEN scrolling near the end with `hasNextPage` THEN `fetchNextPage` SHALL run
7. WHEN pulling to refresh THEN the list SHALL refetch
8. WHEN results are empty THEN an explicit empty state SHALL show
9. WHEN search errors THEN `mapAppErrorToMessage` + Retry (refetch) SHALL show
10. WHEN implementing Search THEN screens SHALL use presentation hooks only (no github/gitlab adapter imports / direct `fetch`)
11. WHEN rendering a row THEN it SHALL use DS **Card** composition

**Independent Test**: Fake repo + fake timers — debounce, pages, refresh, empty, error+Retry.

---

### P2: Smoke de stubs Details / Issues

**User Story**: As a developer, I want stubs reachable from Search so the typed stack is proven.

**Why P2**: Valida params sem §4.3/§4.4.

**Acceptance Criteria**:

1. WHEN RepoDetails opens with `repoId` THEN it SHALL show that id (or stub label including it) + back
2. WHEN Issues CTA is used THEN RepoIssues opens with same `repoId` + back

**Independent Test**: Search → Details → Issues with fixed `repoId`.

---

## Edge Cases

- WHEN the user clears the input after a search THEN UI returns to idle after debounce
- WHEN `dataSource` changes from Config mid-search THEN results follow new `queryKey`; no invalidate/remove on toggle
- WHEN optional `description` / `language` missing THEN row still renders
- WHEN debounce in flight THEN only latest debounced value drives the query
- WHEN Retry after error THEN refetch current debounced query + active dataSource
- WHEN Favoritos/Explore mocks are opened THEN no AsyncStorage favorites writes and no trending fetch occur in this feature

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| NAV-01 | P1: Tabs Search / Favoritos / Explore / Config | Design | Pending |
| NAV-02 | P1: Favoritos / Explore / Config mock screens | Design | Pending |
| NAV-03 | P1: Remove Modal + Expo boilerplate Home/Explore | Design | Pending |
| NAV-04 | P1: Search nested stack + typed `repoId` | Design | Pending |
| NAV-05 | P1: Row → Details opaque id | Design | Pending |
| NAV-06 | P1: Details CTA → Issues | Design | Pending |
| CFG-01 | P1: Config data source control | Design | Pending |
| CFG-02 | P1: Config theme control | Design | Pending |
| CFG-03 | P1: Config token placeholder only | Design | Pending |
| CFG-04 | P1: Search not primary home of those toggles | Design | Pending |
| SRCH-01 | P1: InputField + list | Design | Pending |
| SRCH-02 | P1: Debounce hook → `useSearchRepos` | Design | Pending |
| SRCH-03 | P1: Empty query = idle | Design | Pending |
| SRCH-04 | P1: Initial loading | Design | Pending |
| SRCH-05 | P1: Row fields | Design | Pending |
| SRCH-06 | P1: Infinite scroll | Design | Pending |
| SRCH-07 | P1: Pull-to-refresh | Design | Pending |
| SRCH-08 | P1: Empty results | Design | Pending |
| SRCH-09 | P1: Error + Retry | Design | Pending |
| SRCH-10 | P1: No infra adapters in screens | Design | Pending |
| SRCH-11 | P1: Card row | Design | Pending |
| NAV-07 | P2: Details stub | Design | Pending |
| NAV-08 | P2: Issues stub | Design | Pending |

**Coverage:** 23 total, 0 mapped to tasks, 23 unmapped ⚠️ (pre-Tasks)

---

## Success Criteria

- [ ] Four tabs visible; Favoritos/Explore/Config are safe mocks
- [ ] Search: debounce → list → pages → refresh → empty/error+Retry
- [ ] Config changes data source and theme; token is placeholder only
- [ ] Row → Details stub → Issues stub
- [ ] Modal / Expo boilerplate Explore gone; no adapter leaks in Search screens
