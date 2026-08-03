# Repo Details & Issues Specification

## Problem Statement

Search lista repositórios e navega para stubs de Details/Issues. O enunciado §4.3/§4.4 exige UI completa (campos, issues paginadas, data relativa) e o produto precisa de Hyperlink externo tipado no DS, Avatar/Badge, e o toggle de fonte de volta no header — sem acoplar o DS ao Zustand.

## Goals

- [ ] Organismo `Hyperlink` no DS (`Linking` + Pressable + texto sublinhado primary)
- [ ] Atoms `Avatar` e `Badge` no DS
- [ ] Organismo de header com toggle de fonte no DS (props controladas, sem store) + wrapper em `src/presentation/components` wired ao session store
- [ ] `RepoDetailsScreen` completa (§4.3) via `useRepoDetails`
- [ ] `RepoIssuesScreen` completa (§4.4) via `useRepoIssues` + Hyperlinks (issue + repo)
- [ ] Polish de hierarquia/espaçamento/tipografia na Search; fonte removida da Config (fica no header)

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Showcase in-app (§4.5) | Feature DS polish |
| UI de token SecureStore | Credentials feature |
| Favoritos CRUD / Explore trending | Features próprias |
| Theme toggle no header | Tema fica na Config |
| Maestro E2E | Depois das telas estáveis |
| Redesign visual fora do DS atual | User: só hierarquia/spacing/type |
| `invalidateQueries` no toggle de fonte | AD-023 |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Hyperlink | `Linking.openURL`; Pressable wrapper; underline + `color="primary"`; `href` + `children` | User | y |
| Hyperlink placement | Repo link em Details + topo Issues; issue link em cada row | User | y |
| Avatar + Badge | Criar no DS nesta fatia | User | y |
| Details layout | Hero avatar+owner, metrics row, description, CTA Issues, Hyperlink repo | User | y |
| Issues layout | Card rows; labels Badge; autor; data relativa | User | y |
| Search polish | Só hierarquia/spacing/type no DS | User | y |
| Source header | Organismo DS sem store; wrapper em `presentation/components` com store | User | y |
| Header organism API | `title` + `brand: Brand` + `onToggleBrand` + `safe?`; trailing logo pressable | Agent (“você decide”) | n → agent |
| Toggle UX | Um botão que alterna GitHub ↔ GitLab | Agent | n → agent |
| Config | Remove seletor de fonte; mantém tema + token placeholder | Agent (evitar duplicata; user pediu mover) | n → agent |
| Tema | Só Config | Agent | n → agent |
| Avatar fallback | Iniciais quando sem `uri` | Agent | n → agent |
| Data relativa | Helper **no DS** (`packages/ds/utils`, `Intl`, default `pt-BR`) | User (Tasks): helpers de datas ficam no DS | y |
| Idioma UI | PT-BR | Consistência | n → agent |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Hyperlink organism ⭐ MVP

**User Story**: As a developer, I want a DS Hyperlink organism that opens external URLs, so Details/Issues can link to GitHub/GitLab without ad-hoc `Linking` in screens.

**Why P1**: User locked Hyperlink as organism; required for issue/repo links.

**Acceptance Criteria**:

1. WHEN Hyperlink is pressed with a valid `href` THEN it SHALL call `Linking.openURL(href)`
2. WHEN Hyperlink renders THEN it SHALL use a Pressable-based styled wrapper (not raw Text-only press) AND show underlined text using primary content color
3. WHEN Hyperlink is given `children` text THEN that text SHALL be the visible label AND default accessibility name (`accessibilityRole="link"`)
4. WHEN Hyperlink source is inspected THEN it SHALL live under `packages/ds/organisms/Hyperlink/` (folder: `index.ts`, component, styles, stories, tests) AND SHALL NOT import Zustand or `@/` app modules

**Independent Test**: RNTL — press fires `Linking.openURL` with href; a11y role link; underline/primary asserted via props or style contract.

---

### P1: Avatar + Badge atoms ⭐ MVP

**User Story**: As a developer, I want Avatar and Badge atoms so owner/author faces and issue labels use typed DS components.

**Why P1**: Enunciado §4.3/§4.4 + user confirmed create them now.

**Acceptance Criteria**:

1. WHEN Avatar receives `uri` THEN it SHALL render the image at the given `size` (Size token)
2. WHEN Avatar has no `uri` THEN it SHALL render a fallback (initials from `name`/`label` prop or neutral placeholder — one approach, documented in Design)
3. WHEN Badge receives `children` (label name) THEN it SHALL render a compact tag chip
4. WHEN Badge receives optional `swatch`/`color` hex THEN it SHALL apply that as chip accent (background or border); WHEN omitted THEN it SHALL use theme default surface/border treatment
5. WHEN both atoms are added THEN they SHALL follow AD-012 folder conventions + AD-028 public prop axes (`size` where applicable, `style` passthrough) AND export from DS barrels

**Independent Test**: Unit/RNTL — uri vs fallback; Badge with/without color; barrel exports.

---

### P1: Source header organism + presentation wrapper ⭐ MVP

**User Story**: As a user, I want to toggle GitHub/GitLab from the header so the active source is always reachable; as a developer, I want the DS organism store-free.

**Why P1**: User: header-with-toggle is an organism; real wiring in presentation/components.

**Acceptance Criteria**:

1. WHEN the DS organism (e.g. `SourceHeader`) renders THEN it SHALL show `title` and a trailing pressable control that displays `DataSourceLogo` for the given `brand`
2. WHEN the trailing control is pressed THEN it SHALL call `onToggleBrand` (DS does not flip brand internally from a store)
3. WHEN DS organism source is inspected THEN it SHALL NOT import Zustand, session stores, or `@/presentation` / `@/stores`
4. WHEN the presentation wrapper in `src/presentation/components/` mounts THEN it SHALL read `dataSource` / `toggleDataSource` from the session store and pass `brand` + `onToggleBrand` into the DS organism
5. WHEN SearchRepos (and Details/Issues screens that show the session header) render THEN they SHALL use the presentation wrapper (not raw molecule Header alone for the source chrome)
6. WHEN Config renders THEN it SHALL NOT expose a data-source toggle (theme + token placeholder remain)

**Independent Test**: DS unit — onToggleBrand called, no store imports; presentation test — store toggle updates brand prop / logo.

---

### P1: Repo details screen ⭐ MVP

**User Story**: As a user, I want to open a repository and see its details so I can decide to browse issues or open it on the web.

**Why P1**: Enunciado §4.3.

**Acceptance Criteria**:

1. WHEN RepoDetails loads with `repoId` THEN it SHALL fetch via `useRepoDetails` and show loading until data is ready
2. WHEN data arrives THEN it SHALL show full name, owner Avatar + owner name, description (if any), stars, forks, watchers, language (if any)
3. WHEN data arrives THEN it SHALL show a Hyperlink to `repo.htmlUrl` (label sensible, e.g. “Abrir no site” or fullName)
4. WHEN the Issues CTA is pressed THEN it SHALL navigate to `RepoIssues` with the same `repoId`
5. WHEN the query errors THEN it SHALL show `mapAppErrorToMessage` + Retry
6. WHEN implementing Details THEN the screen SHALL NOT import github/gitlab adapters or call `fetch` directly

**Independent Test**: Fake repo — loading, fields, Hyperlink href, CTA nav, error+Retry.

---

### P1: Repo issues screen ⭐ MVP

**User Story**: As a user, I want to see paginated issues with links so I can open an issue or the repo externally.

**Why P1**: Enunciado §4.4 + user Hyperlink placement.

**Acceptance Criteria**:

1. WHEN RepoIssues loads THEN it SHALL fetch via `useRepoIssues` (infinite query) and show loading for the first page
2. WHEN issues arrive THEN each row SHALL show title (Hyperlink to `issue.htmlUrl`), labels as Badge(s), author name, and relative created date (PT-BR)
3. WHEN the issues screen is shown THEN it SHALL also expose a Hyperlink to the repository `htmlUrl` (above the list or in header region)
4. WHEN scrolling near the end with `hasNextPage` THEN `fetchNextPage` SHALL run
5. WHEN pulling to refresh THEN the list SHALL refetch
6. WHEN there are zero issues THEN an explicit empty state SHALL show
7. WHEN the query errors THEN `mapAppErrorToMessage` + Retry SHALL show
8. WHEN implementing Issues THEN screens SHALL use presentation hooks only (no provider adapters)

**Independent Test**: Fake issues — rows, relative date present, Hyperlinks, pagination, refresh, empty, error+Retry.

---

### P2: Search visual polish

**User Story**: As a user, I want Search to feel clearer in hierarchy and spacing so scanning results is easier.

**Why P2**: User asked for better home styling within current DS only.

**Acceptance Criteria**:

1. WHEN SearchRepos renders THEN spacing/typography hierarchy SHALL be tightened using DS Container/Spacer/Typography (no new visual language outside tokens)
2. WHEN SearchRepos renders THEN it SHALL use the presentation SourceHeader wrapper (source toggle in header)

**Independent Test**: Snapshot or structural RNTL — SourceHeader present; no regression on search ACs from prior feature.

---

## Edge Cases

- WHEN `ownerAvatarUrl` / `authorAvatarUrl` is missing THEN Avatar fallback SHALL render (no crash)
- WHEN issue has zero labels THEN row SHALL omit Badge row (or empty labels region) without layout break
- WHEN `Linking.openURL` rejects THEN Hyperlink SHALL fail soft (no unhandled rejection crash — catch/void)
- WHEN `repoId` is empty/whitespace THEN details/issues queries stay disabled / show safe empty or error state already defined by hooks
- WHEN description is missing THEN Details SHALL omit description block
- WHEN relative date input is invalid THEN helper SHALL fall back to ISO date string or “—”

---

## Implicit-Requirement Dimensions

| Dimension | Resolution |
| --------- | ---------- |
| External-dependency failure | Error + Retry via existing `mapAppErrorToMessage` on details/issues |
| Auth boundaries & rate limits | Same mapper (`rate_limit`); no new token UI |
| Failure / partial-failure | Per-screen error states; Hyperlink openURL soft-fail |
| Input validation & bounds | `repoId` trim/enabled already in hooks |
| Idempotency / retry | Retry = refetch; toggle fonte sem invalidate (AD-023) |
| Concurrency / ordering | TanStack Query defaults; infinite issues pageParam |
| Data lifecycle / expiry | Query cache as already configured — N/A new TTL |
| Observability | N/A for this scope |
| State-transition integrity | N/A (no multi-step entity workflow) |

Remaining dimensions covered above or N/A for this scope.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| RDI-01 | P1: Hyperlink | Validate | ✅ Verified |
| RDI-02 | P1: Avatar + Badge | Validate | ✅ Verified |
| RDI-03 | P1: Source header DS + presentation wrapper | Validate | ✅ Verified |
| RDI-04 | P1: Config removes source toggle | Validate | ✅ Verified |
| RDI-05 | P1: Repo details UI | Validate | ✅ Verified |
| RDI-06 | P1: Repo issues UI + hyperlinks | Validate | ✅ Verified |
| RDI-07 | P1: Issues pagination + refresh + empty/error | Validate | ✅ Verified |
| RDI-08 | P2: Search polish + SourceHeader on Search | Validate | ✅ Verified |

**Coverage:** 8 total, all verified ✅ (P2 spacing polish: spec-precision gap flagged in validation.md)

---

## Success Criteria

- [ ] User can open Details and see §4.3 fields + open repo URL + navigate to Issues
- [ ] User can browse Issues with relative dates, Badges, issue+repo Hyperlinks, infinite scroll, refresh
- [ ] Source toggle works from header via presentation wrapper; DS organism has no store coupling
- [ ] Avatar/Badge/Hyperlink exported from DS and used by product screens
- [ ] Config no longer duplicates source toggle; theme remains there
`}