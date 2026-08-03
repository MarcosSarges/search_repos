# Favorites Specification

## Problem Statement

A tab Favoritos ainda é placeholder (“Em breve”). O usuário precisa salvar repositórios localmente, vê-los offline após cold start, e favoritar sem depender da rede na lista. Em paralelo, `src/stores/` ficou órfão das pastas Clean Arch — o estado de cliente precisa de um lar coerente sob presentation.

## Goals

- [ ] Persistência local de favoritos com **snapshot** (AsyncStorage) e tab Favoritos renderizável offline
- [ ] Toggle de favorito no Header de Detalhes; remoção também por swipe na tab
- [ ] **Duas listas** na Favoritos — uma GitHub, uma GitLab
- [ ] Relocar Zustand stores para `src/presentation/stores/` (session + favorites)

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Porta domain / use case / adapter AsyncStorage para favoritos | Overengineering — client state (context) |
| Sync cloud / conta / multi-device | Fora do enunciado local |
| Atualização automática do snapshot via API | Stale-until-re-favorite; evita N fetches |
| Maestro E2E desta feature | Depois; unit/component nesta fatia |
| UI de tokens / SecureStore | Credentials — feature separada |
| Pastas, tags, notas, ordenação manual | Escopo creep |
| Favorite toggle na Explore | Deferred; Search shortcut é P2 |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Lar dos stores | `src/presentation/stores/` | Discuss — simetria CA; não é 5ª camada de negócio | y |
| Persistência | Zustand `persist` + AsyncStorage | AD-026 + session pattern (AD-018) | y |
| Payload | Snapshot (não só id) | Offline + sem N fetches | y |
| Lista | **Duas seções/listas** — GitHub e GitLab | User revision (não unificada) | y |
| Identidade | Chave `(dataSource, id)` | Evita colisão entre provedores | y |
| Toggle P1 | Header Detalhes | Discuss | y |
| Remoção na tab | Swipe-to-delete | Discuss | y |
| Empty CTA | Navega para Search **ou** Explore | Discuss — Design escolhe um ou ambos | y (detalhe Design) |
| Empty global | Só quando **ambas** as listas estão vazias | Duas listas | y |
| Tap no item | `setDataSource` da seção (se preciso) + `RepoDetails` | Evita fetch na fonte errada | y |
| Snapshot freshness | Não revalida sozinho | Performance / offline-first | y |
| DS isolation | Organisms store-free; adapters em presentation (AD-029) | Consistente | y |
| RepoItem shortcut | P2 se slot não poluir UI | Discuss | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Relocar client stores sob presentation ⭐ MVP

**User Story**: As a maintainer, I want Zustand stores under `src/presentation/stores/` so that Clean Architecture folder symmetry matches the role of client/session state.

**Why P1**: Fundação estrutural; evita dois lares de store durante a feature.

**Acceptance Criteria**:

1. WHEN the feature lands THEN all Zustand stores (session-preferences and favorites) SHALL live under `src/presentation/stores/` and SHALL NOT remain under `src/stores/`.
2. WHEN production app code imports session or favorites state THEN it SHALL import from `@/presentation/stores` (or subpaths), not `@/stores`.
3. WHEN domain and application production sources are inspected THEN they SHALL NOT import Zustand or `@/presentation/stores`.
4. WHEN cold-start hydration of session prefs + SecureStore tokens runs THEN behavior SHALL remain equivalent to pre-move (gate still waits both hydrations).

**Independent Test**: Grep/`isolation` — zero `@/stores`; session hydrate tests still pass; app boots past splash.

---

### P1: Persistir e listar favoritos (snapshot) ⭐ MVP

**User Story**: As a user, I want my favorited repositories to appear instantly on the Favoritos tab — including after kill/relaunch without network — so that I can browse saved repos offline.

**Why P1**: Valor central da feature.

**Acceptance Criteria**:

1. WHEN a repository is favorited THEN the system SHALL persist a snapshot including at least: `id`, display name (`name` or `fullName`), `ownerName`, `ownerAvatarUrl` (if known), `stars`, `description` (if known), `language` (if known), and `dataSource`.
2. WHEN the Favoritos tab is opened with one or more persisted favorites THEN the system SHALL render them from the local store **without** calling product HTTP/use cases to populate the lists.
3. WHEN the app cold-starts after favorites were saved THEN both source lists SHALL restore the same snapshots (order within each list: most recently favorited first).
4. WHEN favorites from both GitHub and GitLab exist THEN Favoritos SHALL render **two distinct lists/sections** (GitHub and GitLab) and SHALL NOT interleave items from different sources in one flat list.
5. WHEN a section has zero items THEN that section SHALL be omitted or show a minimal per-section empty (Design); WHEN **both** sections are empty THEN the global empty state (FAV-10) SHALL apply.
6. WHEN AsyncStorage rehydrate fails or payload is corrupt THEN the system SHALL fall back to empty favorites for both sources and SHALL NOT crash.

**Independent Test**: Unit store tests with memory storage — add github + gitlab → remount → each section has correct items; no network mock called by Favoritos render test.

---

### P1: Toggle no Header de Detalhes ⭐ MVP

**User Story**: As a user, I want to favorite/unfavorite from the repository details header so that saving is one tap from the happy path (search → details → save).

**Why P1**: Único entry point obrigatório de escrita.

**Acceptance Criteria**:

1. WHEN RepoDetails has successfully loaded repo data THEN the header SHALL show a favorite control (trailing) that reflects whether `(activeDataSource, repoId)` is already favorited.
2. WHEN the user activates the control while **not** favorited THEN the system SHALL add a snapshot derived from the loaded repo + current `dataSource` and persist it.
3. WHEN the user activates the control while already favorited THEN the system SHALL remove that `(dataSource, id)` entry and persist the removal.
4. WHEN RepoDetails is still loading or in error (no repo payload) THEN the favorite control SHALL be absent or disabled (no write with incomplete snapshot).
5. WHEN the DS header organism used for this chrome is inspected THEN it SHALL remain store-free; Zustand wiring SHALL live in a presentation adapter (AD-029).

**Independent Test**: RNTL on RepoDetails with seeded store — toggle on adds snapshot; toggle off removes; adapter/store tests without mounting full nav if preferred.

---

### P1: Empty state + swipe remove na tab ⭐ MVP

**User Story**: As a user, I want a clear empty state and swipe-to-delete on Favoritos so that I can discover how to add repos and clean the list with a familiar mobile gesture.

**Why P1**: Fecha o ciclo de leitura/remoção na tab.

**Acceptance Criteria**:

1. WHEN there are zero favorites in **both** sources after hydrate THEN Favoritos SHALL show friendly PT-BR empty copy and a CTA that navigates to **Search** and/or **Explore** (at least one destination).
2. WHEN the user completes swipe-to-delete on a Favoritos row THEN the system SHALL remove that `(dataSource, id)` from the store and persist; the row SHALL disappear from its section.
3. WHEN the user taps a Favoritos row THEN the system SHALL set `dataSource` to that row’s source when it differs from the active source, then navigate to repository details for that `id`.
4. WHEN Favoritos renders rows THEN it SHALL reuse DS list/card patterns already used in product lists (`RepoItem` and/or FlatList) rather than ad-hoc raw `Text` rows.

**Independent Test**: Component tests — empty CTA press navigates; swipe/remove action removes id from store; tap navigates with expected params.

---

### P2: Atalho de favorito na lista de busca

**User Story**: As a user, I want to favorite from search results without opening details when the UI stays clean.

**Why P2**: Atalho; só se `RepoItem` ganhar ação secundária sem poluir.

**Acceptance Criteria**:

1. WHEN `RepoItem` gains an optional secondary action slot THEN it SHALL remain store-free and accept a render prop or controlled trailing control via props only.
2. WHEN Search wires that slot THEN activating it SHALL toggle the same favorites store using a snapshot built from the list item + current `dataSource`.
3. WHEN the secondary control would require cluttering the default RepoItem chrome with no slot API THEN this story SHALL be deferred (no forced icon on every card).

**Independent Test**: RepoItem story/test with trailing action; Search row toggle updates store.

---

## Edge Cases

- WHEN the same `(dataSource, id)` is favorited twice THEN the system SHALL keep a single entry (idempotent add; may refresh snapshot / move to most-recent within that source list).
- WHEN the user favorites a GitHub repo, toggles app `dataSource` to GitLab, then opens Favoritos THEN the item SHALL remain under the **GitHub** section (not move with the session toggle).
- WHEN SecureStore/session hydrate is still pending THEN Favoritos MAY wait on the existing app gate; it SHALL NOT flash incorrect empty then full without intentional empty-after-hydrate.
- WHEN description/language/avatar are missing on the source repo THEN the snapshot SHALL omit or store empty optionals and the row SHALL still render.
- WHEN swipe is cancelled mid-gesture THEN the favorite SHALL remain.
- WHEN only one source has favorites THEN Favoritos SHALL show that source’s list and SHALL NOT require the other source to have items.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| FAV-01 | P1: Relocate stores → `presentation/stores` | Tasks | In Tasks |
| FAV-02 | P1: Snapshot fields + AsyncStorage persist | Tasks | In Tasks |
| FAV-03 | P1: Favoritos list offline / cold start | Tasks | In Tasks |
| FAV-04 | P1: Two lists/sections — GitHub and GitLab (no interleaved flat list) | Tasks | In Tasks |
| FAV-05 | P1: Corrupt/fail storage → empty, no crash | Tasks | In Tasks |
| FAV-06 | P1: Details header favorite toggle | Tasks | In Tasks |
| FAV-07 | P1: Toggle add/remove + persist | Tasks | In Tasks |
| FAV-08 | P1: No write while details loading/error | Tasks | In Tasks |
| FAV-09 | P1: DS header store-free + presentation adapter | Tasks | In Tasks |
| FAV-10 | P1: Empty state (both empty) + CTA to Search/Explore | Tasks | In Tasks |
| FAV-11 | P1: Swipe-to-delete | Tasks | In Tasks |
| FAV-12 | P1: Tap row → setDataSource(section) + details | Tasks | In Tasks |
| FAV-13 | P1: Reuse DS RepoItem/FlatList patterns | Tasks | In Tasks |
| FAV-14 | P2: Optional RepoItem secondary action + Search wire | Tasks | In Tasks |
| FAV-15 | P1: domain/application never import stores | Tasks | In Tasks |

**Coverage:** 15 total, 15 mapped to tasks (FAV-14 → T10–T11 P2), 0 unmapped

---

## Success Criteria

- [ ] Kill app → relaunch offline → Favoritos shows GitHub and GitLab sections with correct snapshots
- [ ] Details header toggles favorite; item appears under the matching source list without network
- [ ] Swipe removes; empty CTA reaches Search or Explore when both lists are empty
- [ ] Zero `src/stores/` residual; imports via `@/presentation/stores`
- [ ] Domain/application isolation tests still pass (no Zustand leakage)
