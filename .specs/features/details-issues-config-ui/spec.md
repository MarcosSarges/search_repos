# Details / Issues / Config UI Specification

## Problem Statement

Details e Issues já entregam dados (feature `repo-details-issues`), mas a UI é flat: métricas sem ícones, `IssueListItem` inventa layout na presentation em vez de um organism DS (como `RepoItem`), e o domínio `Issue` omite campos que **ambas** as APIs já devolvem (`state`, comments, `updated_at`). Config é um esboço sem hierarquia de settings — precisa de rows legíveis (tema, fonte ativa read-only, token placeholder) sem reabrir o toggle de fonte.

## Goals

- [x] `RepoDetailsScreen` com hero denso e métricas stars/forks/watchers com os mesmos ícones do `RepoItem` (+ olho para watchers)
- [x] Organismo DS `IssueItem` no padrão `RepoItem` + adapter presentation fino
- [x] Domínio `Issue` enriquecido (`state`, `comments`, `updatedAt`) com mappers/fixtures GitHub + GitLab
- [x] `ConfigScreen` em settings rows: tema, fonte ativa (read-only), token placeholder
- [x] Stories + testes Jest/RNTL alinhados aos ACs (sem enfraquecer testes existentes)

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Organismo `RepoDetails` no DS | User: layout fica na tela |
| Form SecureStore / persistência de token | Placeholder only; credentials feature |
| Toggle de fonte na Config | Toggle permanece no `SessionSourceHeader` (RDI-04 / AD-026) |
| Assignees, body, milestone, reactions, upvotes | Fora do mínimo comum desta fatia |
| Tipografia custom / expo-font | AD-015 |
| Favoritos / Explore redesign | Features próprias |
| Maestro E2E | Depois das telas estáveis |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Details placement | Tela only; não vira organism DS | User | y |
| Details metrics | stars + forks + watchers com ícone; `star` / `git-network` / eye Ionicons | User + RepoItem | y |
| IssueItem | Organism DS padrão RepoItem; adapter presentation | User | y |
| Domain enrichment | `state`, `comments`, `updatedAt` mapeados nas duas fontes | User pediu docs das APIs; campos confirmados em payload live | y |
| State normalize | Domínio `'open' \| 'closed'`; GitLab `opened` → `open` | ACL | n → agent |
| Issue date in UI | Relative de `updatedAt` no meta do card; `createdAt` permanece na entidade | Mais útil em lista | n → agent |
| GitHub PRs na lista | Filtrar itens com `pull_request` presente no mapper/adapter HTTP | Endpoint mistura PRs; lista de “issues” deve ser issues | n → agent |
| Issue title link | `Hyperlink` no título (href primitivo) | Comportamento atual + DS isolation | n → agent |
| Config rows | Settings row: ícone + título + subtítulo + trailing | User (3A) | y |
| Config fonte | Read-only label da fonte ativa; sem toggle | User | y |
| Config token | Placeholder “Em breve”; sem SecureStore/input | User | y |
| SettingsRow molecule | Preferir molecule DS reutilizável no Design | AD-009; agent discretion | n → agent |
| Aesthetic | Polish dentro dos tokens atuais | Undiscussed → assumption | n → agent |
| Remaining dimensions (auth, retry, concurrency, TTL, observability, payments) | N/A for this scope — UI + domain field mapping only; existing query/error UX unchanged | Presentation/data hooks already exist | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: RepoDetails hero + métricas ⭐ MVP

**User Story**: As a user, I want a denser repository details screen with iconed metrics so I can scan stars, forks, and watchers at a glance.

**Why P1**: Pedido explícito de reestilização do details; superfície mais usada após a lista.

**Acceptance Criteria**:

1. WHEN repo details load successfully THEN the screen SHALL show a hero with owner avatar (`size` large), owner name, and `fullName`
2. WHEN metrics render THEN the screen SHALL show three stats — stars, forks, watchers — each with an icon and the numeric value
3. WHEN metric icons are inspected THEN stars SHALL use `star`, forks SHALL use `git-network` (same as `RepoItem`), and watchers SHALL use an Ionicons eye icon supported by the `Icon` atom
4. WHEN `description` is present THEN it SHALL render below the metrics; WHEN absent/empty THEN the description block SHALL be omitted
5. WHEN details succeed THEN Hyperlink “Abrir no site” and CTA “Ver issues” SHALL remain available (`testID`s existentes preservados: `repo-details-issues-cta`, `repo-details-content`)
6. WHEN loading or error THEN existing loading/`mapAppErrorToMessage` + retry behavior SHALL remain
7. WHEN `RepoDetailsScreen` source is inspected THEN it SHALL NOT introduce a DS organism named `RepoDetails` under `packages/ds`

**Independent Test**: RNTL on `RepoDetailsScreen` with Fake/MSW data — hero + three iconed metrics + CTA; no `packages/ds/organisms/RepoDetails`.

---

### P1: Issue domain enrichment ⭐ MVP

**User Story**: As a developer, I want `Issue` to carry state, comment count, and updatedAt from both providers so the list UI can show richer issue metadata without provider branches in the screen.

**Why P1**: Bloqueia a UI rica; user pediu olhar as duas integrações e melhorar o domínio.

**Acceptance Criteria**:

1. WHEN `Issue` type is inspected THEN it SHALL include `state: 'open' | 'closed'`, `comments: number`, and `updatedAt: string` in addition to existing fields (`id`, `number`, `title`, `authorName`, `authorAvatarUrl?`, `labels`, `createdAt`, `htmlUrl`)
2. WHEN a GitHub issue DTO is mapped THEN `state` SHALL map from GitHub `state`, `comments` from `comments`, `updatedAt` from `updated_at`
3. WHEN a GitLab issue DTO is mapped THEN `state` SHALL map `opened`→`open` and `closed`→`closed`, `comments` from `user_notes_count`, `updatedAt` from `updated_at`
4. WHEN GitHub list payload includes an item with `pull_request` THEN that item SHALL NOT appear in mapped `Issue` results
5. WHEN Fake/in-memory repository and MSW fixtures are used THEN they SHALL include the new fields so unit/integration tests compile and pass
6. WHEN mappers are tested THEN colocated mapper tests SHALL assert the new field mappings for both providers

**Independent Test**: Jest mapper tests + Fake `listIssues` without UI.

---

### P1: IssueItem organism + list adoption ⭐ MVP

**User Story**: As a user, I want each issue row to look like the repo cards (structured card with richer meta) so the issues list feels consistent with Search/Explore.

**Why P1**: Componentização pedida; fecha o paralelo com `RepoItem`.

**Acceptance Criteria**:

1. WHEN `IssueItem` is shipped THEN it SHALL live under `packages/ds/organisms/IssueItem/` with AD-012 files (component, styles, stories, tests, `index.ts`) and export from DS barrels
2. WHEN `IssueItem` props are inspected THEN they SHALL be primitives only (no `@/domain` import) including at least: `number`, `title`, `titleHref`, `authorName`, `authorAvatarUrl?`, `labels` (label+optional swatch), `state`, `comments`, `updatedAt` (or preformatted relative date prop — Design chooses, but relative display MUST appear in the row)
3. WHEN `IssueItem` renders THEN layout SHALL follow the RepoItem pattern: Card body (title via Hyperlink, meta with `#number`, state affordance, labels, author avatar) + Divider + footer stats including comments count with an icon
4. WHEN relative date is shown THEN it SHALL use the DS `formatRelativeDate` helper (pt-BR default) against `updatedAt` (or equivalent prop fed from `updatedAt`)
5. WHEN presentation `IssueListItem` is used THEN it SHALL be a thin adapter mapping `Issue` → `IssueItem` (no Card layout invented in the screen file)
6. WHEN `RepoIssuesScreen` renders a non-empty list THEN rows SHALL come from the adapter/`IssueItem` path
7. WHEN DS isolation tests run THEN `IssueItem` SHALL NOT import app layers (`@/`, Zustand, etc.)

**Independent Test**: Storybook IssueItem + Jest organism tests + `IssueListItem` / `RepoIssuesScreen` tests updated for new fields.

---

### P1: Config settings rows ⭐ MVP

**User Story**: As a user, I want Config laid out as clear settings rows so I can see theme, which source is active, and that tokens are coming later.

**Why P1**: Pedido explícito de melhoria de design do Config.

**Acceptance Criteria**:

1. WHEN Config renders THEN it SHALL present at least three rows/sections: Tema, Fonte ativa, Token de API
2. WHEN the theme row control is pressed THEN mode SHALL toggle light ↔ dark and persist (behavior unchanged from CFG tests)
3. WHEN the source row renders THEN it SHALL show the active data source as read-only text (`GitHub` or `GitLab`) AND SHALL NOT expose a data-source toggle control
4. WHEN Config source is inspected THEN it SHALL NOT import `DataSourceLogo` for a toggle NOR call `toggleDataSource` / `setDataSource` from the screen
5. WHEN the token row renders THEN placeholder copy indicating “Em breve” (or equivalent existing copy) SHALL remain AND there SHALL be no SecureStore form / TextInput / `setToken`
6. WHEN each settings row renders THEN it SHALL show an icon + title + supporting subtitle (and trailing control only where interactive — theme)

**Independent Test**: Existing `ConfigScreen` tests updated/extended for read-only source row; no token form.

---

### P2: SettingsRow molecule (optional polish)

**User Story**: As a developer, I want a reusable settings row molecule so Config (and future prefs) share one chrome.

**Why P2**: Melhora AD-009; não bloqueia o redesign se a tela compor rows manualmente com Container/Typography/Icon.

**Acceptance Criteria**:

1. WHEN `SettingsRow` (or equivalent name) is introduced THEN it SHALL live under `packages/ds/molecules/` with AD-012 files and typed props for icon, title, subtitle, trailing `ReactNode`
2. WHEN Config uses it THEN theme/source/token rows SHALL compose the molecule

**Independent Test**: Molecule stories + Config still passes P1 ACs.

---

## Edge Cases

- WHEN description is whitespace-only THEN Details SHALL omit the description block
- WHEN issue labels are empty THEN IssueItem SHALL omit the labels row (same idea as RepoItem languages)
- WHEN GitLab issue state is `opened` THEN domain state SHALL be `open`
- WHEN comments is `0` THEN footer SHALL still show `0` (not hide)
- WHEN SecureStore/token UI is absent THEN Config token row remains non-interactive placeholder
- WHEN session `dataSource` is `gitlab` THEN Config source row SHALL read `GitLab` (and `GitHub` for `github`)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| DIC-01 | P1: Details hero + metrics | Tasks (T5) | Done |
| DIC-02 | P1: Details icons match RepoItem + eye watchers | Tasks (T5) | Done |
| DIC-03 | P1: Details keeps CTA/Hyperlink/loading/error; no RepoDetails organism | Tasks (T5) | Done |
| DIC-04 | P1: Issue domain `state` / `comments` / `updatedAt` | Tasks (T1) | Done |
| DIC-05 | P1: GitHub + GitLab mappers + fixtures + Fake | Tasks (T1) | Done |
| DIC-06 | P1: Filter GitHub `pull_request` items | Tasks (T1) | Done |
| DIC-07 | P1: IssueItem organism (RepoItem pattern) | Tasks (T3) | Done |
| DIC-08 | P1: IssueListItem adapter + RepoIssuesScreen adoption | Tasks (T4) | Done |
| DIC-09 | P1: Config settings rows (theme / source RO / token placeholder) | Tasks (T6) | Done |
| DIC-10 | P2: SettingsRow molecule | Tasks (T2) | Done |

**Coverage:** 10 total, 10 mapped to tasks, 0 unmapped

---

## Success Criteria

- [x] Details shows iconed stars/forks/watchers in a clear hero without a DS `RepoDetails` organism
- [x] Issues list uses DS `IssueItem` with `#number`, state, comments, relative `updatedAt`, labels, author
- [x] Domain + both ACLs expose the new Issue fields; GitHub PRs filtered out
- [x] Config reads as settings rows with theme toggle, read-only source, token placeholder
- [x] Gate: relevant Jest suites green; isolation test still passes for new DS pieces
