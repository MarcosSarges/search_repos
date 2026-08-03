# Repo Details & Issues — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/repo-details-issues/design.md`  
**Status**: In Progress

**Tools (locked):** `tlc-spec-driven` + `frontend-design` (telas/atoms) + código. **Sem** Maestro MCP. Branch: `feat/repo-details-issues`.

**Batch plan:** Batch 1 = T1–T7 (Phases 1–2) · Batch 2 = T8–T14 (Phases 3–4) · Verifier after last commit.

**Batch 1 results** ([T1–T7 DS](07056ee3-a0e1-452f-b8aa-0f70a3645d2e)): T1 `60ab124` · T2 `f3626b9` · T3 `c5ca2c9` · T4 `c357168` · T5 `ed6e893` · T6 `e38a4a0` · T7 `6e52297` — 236 passed scoped. Deviations: none.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` (Expo v54), AD-006 (Jest + RNTL), AD-012/013/028/029, colocated `__tests__` under DS + `src/presentation/screens/**/__tests__`, `package.json` (`test`, `lint`), `jest.config.ts`, `src/test/render.tsx`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| avatar / badge tokens | unit | Token shapes + AvatarSize keys; badge padding/radius maps | `packages/ds/tokens/__tests__/{avatar,badge}.test.ts` | `pnpm test -- packages/ds/tokens` |
| formatRelativeDate | unit | PT-BR relative units; invalid → `—`; locale override; fixed `now` | `packages/ds/utils/__tests__/format-relative-date.test.ts` | `pnpm test -- packages/ds/utils` |
| Avatar | unit (RNTL) | uri render; fallback initials; size; style; AD-012 folder | `packages/ds/atoms/Avatar/__tests__/*` | `pnpm test -- packages/ds/atoms/Avatar` |
| Badge | unit (RNTL) | children; swatch with/without `#`; default surface; style | `packages/ds/atoms/Badge/__tests__/*` | `pnpm test -- packages/ds/atoms/Badge` |
| Hyperlink | unit (RNTL) | openURL called; underline/primary; role link; soft-fail; no store imports | `packages/ds/organisms/Hyperlink/__tests__/*` | `pnpm test -- packages/ds/organisms/Hyperlink` |
| SourceHeader | unit (RNTL) | title; onToggleBrand; logo brand; leading; no Zustand/`@/` | `packages/ds/organisms/SourceHeader/__tests__/*` | `pnpm test -- packages/ds/organisms/SourceHeader` |
| SessionSourceHeader | unit (RNTL) | store dataSource → brand; toggle flips store | `src/presentation/components/__tests__/*` | `pnpm test -- src/presentation/components` |
| Config / Search screens | unit (RNTL) | Config sem source toggle; Search usa SessionSourceHeader; search ACs regressão | `src/presentation/screens/**/__tests__/*` | scoped paths |
| RepoDetailsScreen | unit (RNTL) | loading; fields §4.3; Hyperlink href; CTA nav; error+Retry | `src/presentation/screens/search/__tests__/RepoDetailsScreen.test.tsx` | scoped path |
| IssueListItem / RepoIssuesScreen | unit (RNTL) | row Hyperlink+Badges+relative date; repo Hyperlink; pages; refresh; empty; error | `src/presentation/screens/search/__tests__/*` | scoped paths |
| README / barrels | none | Exports + table rows; build/lint gate | `packages/ds/index.ts`, `README.md` | `pnpm lint` |
| Stories | none (catalog) | Args for new atoms/organisms | `packages/ds/**/*.stories.tsx` | Storybook manual |

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After single DS/util/component task | `pnpm test -- <scoped path from task>` |
| Full | After presentation wiring / screens | `pnpm test -- packages/ds src/presentation` |
| Build | Phase end / feature close | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: DS tokens + date util + Avatar

```
T1 → T2 → T3
```

### Phase 2: Badge + Hyperlink + SourceHeader + barrels

```
T4 → T5 → T6 → T7
```

### Phase 3: Presentation chrome + Config + Search polish

```
T8 → T9 → T10
```

### Phase 4: Details + Issues screens

```
T11 → T12 → T13 → T14
```

---

## Task Breakdown

### T1: Avatar + Badge tokens + theme wire

**What**: Add `tokens/avatar.ts` and `tokens/badge.ts`, export from tokens barrel, attach `avatar` (+ badge metrics if needed) on `AppTheme` / `getTheme`, unit tests for shapes.
**Where**: `packages/ds/tokens/avatar.ts`, `packages/ds/tokens/badge.ts`, `packages/ds/tokens/index.ts`, `packages/ds/theme/theme.ts`, `packages/ds/theme/styled.d.ts`, `packages/ds/tokens/__tests__/`
**Depends on**: None
**Reuses**: `tokens/icon.ts` pattern (dedicated pixel map)
**Requirement**: RDI-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `AvatarSize` keys `sm|md|lg|xl` with px `24|40|56|72`
- [x] Badge padding/radius tokens via object maps
- [x] Theme exposes `avatar` for styled consumers
- [x] Gate: `pnpm test -- packages/ds/tokens packages/ds/theme`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(ds): add avatar and badge tokens`

---

### T2: formatRelativeDate DS util

**What**: Pure `formatRelativeDate` in `packages/ds/utils` with default `pt-BR`, export from `@ds`, unit tests (fixed `now`, invalid → `—`).
**Where**: `packages/ds/utils/format-relative-date.ts`, `packages/ds/utils/index.ts`, `packages/ds/utils/__tests__/format-relative-date.test.ts`, `packages/ds/index.ts`
**Depends on**: None (parallel-safe after T1 in phase order)
**Reuses**: none — new util folder
**Requirement**: RDI-06 (date display)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `formatRelativeDate(iso, { now?, locale? })` implemented with `Intl.RelativeTimeFormat`
- [x] Invalid/empty input returns `'—'`
- [x] Exported from packages/ds root barrel
- [x] No `@/` app imports (isolation)
- [x] Gate: `pnpm test -- packages/ds/utils`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(ds): add formatRelativeDate util`

---

### T3: Avatar atom

**What**: Avatar atom (expo-image, circular, initials fallback from `name`, size from avatar tokens, style passthrough) + stories + RNTL tests.
**Where**: `packages/ds/atoms/Avatar/**`, `packages/ds/atoms/index.ts`
**Depends on**: T1
**Reuses**: Icon/Loading AD-012 folder layout; `theme.avatar`
**Requirement**: RDI-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`, `frontend-design`

**Done when**:

- [x] Props: `uri?`, `name`, `size?`, `style?`
- [x] Fallback initials when no uri / image error
- [x] Barrel export
- [x] Gate: `pnpm test -- packages/ds/atoms/Avatar`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(ds): add Avatar atom`

---

### T4: Badge atom

**What**: Badge atom with optional `swatch` hex normalize + default surface treatment + stories + tests.
**Where**: `packages/ds/atoms/Badge/**`, `packages/ds/atoms/index.ts`
**Depends on**: T1
**Reuses**: Typography caption; badge tokens
**Requirement**: RDI-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`, `frontend-design`

**Done when**:

- [x] `normalizeHex` handles `ff0000` and `#ff0000`
- [x] Omit swatch → theme surface/border
- [x] Gate: `pnpm test -- packages/ds/atoms/Badge`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(ds): add Badge atom`

---

### T5: Hyperlink organism

**What**: Hyperlink organism — Pressable wrapper, underlined primary text, `expo-linking` `openURL` soft-fail, stories + tests (mock Linking).
**Where**: `packages/ds/organisms/Hyperlink/**`, `packages/ds/organisms/index.ts`
**Depends on**: None (Typography exists)
**Reuses**: DataSourceLogo organism folder pattern
**Requirement**: RDI-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Press calls `Linking.openURL(href)`; reject swallowed
- [x] `accessibilityRole="link"`
- [x] No Zustand / `@/` imports
- [x] Gate: `pnpm test -- packages/ds/organisms/Hyperlink`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(ds): add Hyperlink organism`

---

### T6: SourceHeader organism

**What**: SourceHeader — Header + trailing Pressable DataSourceLogo; props `title`, `brand`, `onToggleBrand`, `leading?`, `safe?`, `style?`; stories + tests; isolation assert.
**Where**: `packages/ds/organisms/SourceHeader/**`, `packages/ds/organisms/index.ts`
**Depends on**: None (Header + DataSourceLogo exist)
**Reuses**: Header molecule slots; DataSourceLogo
**Requirement**: RDI-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Trailing press calls `onToggleBrand`
- [x] Logo reflects `brand` prop
- [x] `leading` forwarded to Header
- [x] No store imports
- [x] Gate: `pnpm test -- packages/ds/organisms/SourceHeader`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(ds): add SourceHeader organism`

---

### T7: DS barrels + README table

**What**: Ensure root/atoms/organisms exports for Avatar, Badge, Hyperlink, SourceHeader, `formatRelativeDate`; update README Design System table (Avatar, Badge, Hyperlink, SourceHeader, date util).
**Where**: `packages/ds/index.ts`, `packages/ds/atoms/index.ts`, `packages/ds/organisms/index.ts`, `README.md`
**Depends on**: T2, T3, T4, T5, T6
**Reuses**: existing README DS section
**Requirement**: RDI-01, RDI-02, RDI-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Public exports resolve from `@ds`
- [x] README lists new pieces
- [x] Gate: `pnpm lint` (+ smoke `pnpm test -- packages/ds`)

**Tests**: none
**Gate**: build
**Commit**: `docs(ds): export Avatar Badge Hyperlink SourceHeader and date util`

---

### T8: SessionSourceHeader presentation adapter

**What**: Create `src/presentation/components/SessionSourceHeader` wiring session store → SourceHeader (`brand`/`onToggleBrand`); optional `leading`/`title`/`safe`; unit tests.
**Where**: `src/presentation/components/SessionSourceHeader.tsx`, `index.ts`, `__tests__/SessionSourceHeader.test.tsx`
**Depends on**: T6
**Reuses**: session store selectors; AD-029
**Requirement**: RDI-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Toggle updates store `dataSource`
- [x] Screens can pass `leading` through
- [x] Gate: `pnpm test -- src/presentation/components`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(presentation): add SessionSourceHeader store adapter`

---

### T9: SearchRepos SessionSourceHeader + spacing polish

**What**: Replace molecule Header with SessionSourceHeader; tighten Container/Spacer hierarchy; update SearchRepos tests.
**Where**: `src/presentation/screens/search/SearchReposScreen.tsx`, `__tests__/SearchReposScreen.test.tsx`
**Depends on**: T8
**Reuses**: existing search list logic
**Requirement**: RDI-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`, `frontend-design`

**Done when**:

- [x] Source toggle visible on Search via adapter
- [x] No regression on idle/loading/list ACs
- [x] Gate: `pnpm test -- src/presentation/screens/search`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(search): polish SearchRepos with SessionSourceHeader`

---

### T10: Config remove data-source toggle

**What**: Remove Config fonte section/toggle; keep theme + token placeholder; update Config tests.
**Where**: `src/presentation/screens/ConfigScreen.tsx`, `__tests__/ConfigScreen.test.tsx`
**Depends on**: T8 (source lives on header path)
**Reuses**: existing theme toggle UI
**Requirement**: RDI-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] No `config-data-source-toggle` / fonte section
- [x] Theme + token placeholder remain
- [x] Gate: `pnpm test -- src/presentation/screens/__tests__/ConfigScreen.test.tsx`

**Tests**: unit
**Gate**: quick
**Commit**: `refactor(config): remove duplicate data-source toggle`

---

### T11: RepoDetailsScreen full UI

**What**: Replace stub with `useRepoDetails` UI — SessionSourceHeader + leading back, Avatar/owner, metrics, description, Hyperlink repo, Issues CTA, loading/error+Retry; tests with Fake.
**Where**: `src/presentation/screens/search/RepoDetailsScreen.tsx`, `__tests__/RepoDetailsScreen.test.tsx`, `SearchStackNavigator` options if needed
**Depends on**: T3, T5, T8
**Reuses**: SearchRepos error/loading pattern; `mapAppErrorToMessage`
**Requirement**: RDI-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`, `frontend-design`

**Done when**:

- [x] §4.3 fields visible from Fake repo
- [x] Hyperlink href = `htmlUrl`; CTA navigates to Issues
- [x] `headerShown: false` + back via leading
- [x] Gate: `pnpm test -- src/presentation/screens/search`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(search): implement RepoDetailsScreen`

---

### T12: IssueListItem

**What**: Card row — Hyperlink title, Badge labels, Avatar+author, `formatRelativeDate(createdAt)` from `@ds`.
**Where**: `src/presentation/screens/search/IssueListItem.tsx`, `__tests__/IssueListItem.test.tsx`
**Depends on**: T2, T3, T4, T5
**Reuses**: `RepoListItem` Card pattern
**Requirement**: RDI-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`, `frontend-design`

**Done when**:

- [x] Zero labels → no Badge crash
- [x] Relative date string rendered
- [x] Gate: `pnpm test -- src/presentation/screens/search/__tests__/IssueListItem.test.tsx`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(search): add IssueListItem`

---

### T13: RepoIssuesScreen full UI

**What**: Replace stub — SessionSourceHeader + back, repo Hyperlink via `useRepoDetails`, FlatList `useRepoIssues` + IssueListItem, infinite scroll, pull-to-refresh, empty/error+Retry; tests.
**Where**: `src/presentation/screens/search/RepoIssuesScreen.tsx`, `__tests__/RepoIssuesScreen.test.tsx`, stack stubs test update
**Depends on**: T11, T12
**Reuses**: SearchRepos list state machine
**Requirement**: RDI-06, RDI-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`, `frontend-design`

**Done when**:

- [x] Issue + repo Hyperlinks present
- [x] Pagination + refresh + empty + error covered by tests
- [x] Gate: `pnpm test -- src/presentation/screens/search`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(search): implement RepoIssuesScreen`

---

### T14: Stack chrome cleanup + full gate

**What**: Finalize Search stack `headerShown: false` for Details/Issues; remove obsolete stub-only asserts; run full DS+presentation gate; fix leftovers.
**Where**: `src/presentation/navigation/SearchStackNavigator.tsx`, `search/__tests__/search-stack-stubs.test.tsx`
**Depends on**: T11, T13
**Reuses**: navigation types unchanged (`repoId` only)
**Requirement**: RDI-05, RDI-06, RDI-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] No double native+DS header
- [x] Gate: `pnpm test -- packages/ds src/presentation` && `pnpm lint`
- [x] Stub tests updated or replaced

**Tests**: unit
**Gate**: full
**Commit**: `fix(nav): hide native header on details and issues`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2 ──→ T3
Phase 2:  T4 ──→ T5 ──→ T6 ──→ T7
Phase 3:  T8 ──→ T9 ──→ T10
Phase 4:  T11 ──→ T12 ──→ T13 ──→ T14
```

**Batch packing (~7 tasks):**

| Batch | Phases | Tasks |
| ----- | ------ | ----- |
| 1 | Phase 1 + 2 | T1–T7 |
| 2 | Phase 3 + 4 | T8–T14 |

> ~14 tasks → offer sub-agents at Execute (offer-then-confirm).

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | tokens + theme wire (cohesive) | ✅ |
| T2 | 1 util | ✅ |
| T3 | 1 atom | ✅ |
| T4 | 1 atom | ✅ |
| T5 | 1 organism | ✅ |
| T6 | 1 organism | ✅ |
| T7 | barrels + README | ✅ |
| T8 | 1 adapter | ✅ |
| T9 | 1 screen polish | ✅ |
| T10 | 1 screen trim | ✅ |
| T11 | 1 screen | ✅ |
| T12 | 1 list item | ✅ |
| T13 | 1 screen | ✅ |
| T14 | nav + gate | ✅ |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | (start) | ✅ |
| T2 | None | parallel after T1 in phase seq | ✅ Match (phase order T1→T2; body None OK — no hard dep) |
| T3 | T1 | T1→T3 via T2 chain | ✅ (T2 does not block T3 logically; phase lists T1→T2→T3 for sequencing) |
| T4 | T1 | after Phase1 | ✅ |
| T5 | None | in Phase2 after T4 | ✅ (seq only) |
| T6 | None | after T5 | ✅ (seq only) |
| T7 | T2,T3,T4,T5,T6 | end Phase2 | ✅ |
| T8 | T6 | start Phase3 | ✅ |
| T9 | T8 | T8→T9 | ✅ |
| T10 | T8 | T8→…→T10 | ✅ |
| T11 | T3,T5,T8 | start Phase4 | ✅ |
| T12 | T2,T3,T4,T5 | before T13 | ✅ |
| T13 | T11,T12 | T11/T12→T13 | ✅ |
| T14 | T11,T13 | end | ✅ |

Note: Within-phase arrows are sequential execution order; soft `Depends on: None` tasks still wait for prior phase tasks to finish before their phase starts.

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | -------------- | --------- | ------ |
| T1 | tokens | unit | unit | ✅ |
| T2 | formatRelativeDate | unit | unit | ✅ |
| T3 | Avatar | unit | unit | ✅ |
| T4 | Badge | unit | unit | ✅ |
| T5 | Hyperlink | unit | unit | ✅ |
| T6 | SourceHeader | unit | unit | ✅ |
| T7 | README/barrels | none | none | ✅ |
| T8 | SessionSourceHeader | unit | unit | ✅ |
| T9 | Search screen | unit | unit | ✅ |
| T10 | Config screen | unit | unit | ✅ |
| T11 | RepoDetailsScreen | unit | unit | ✅ |
| T12 | IssueListItem | unit | unit | ✅ |
| T13 | RepoIssuesScreen | unit | unit | ✅ |
| T14 | nav + screens | unit | unit | ✅ |

---

## Requirement Traceability (tasks)

| ID | Tasks |
| -- | ----- |
| RDI-01 | T5, T7 |
| RDI-02 | T1, T3, T4, T7 |
| RDI-03 | T6, T7, T8 |
| RDI-04 | T10 |
| RDI-05 | T11, T14 |
| RDI-06 | T2, T12, T13 |
| RDI-07 | T13 |
| RDI-08 | T9, T14 |

**Coverage:** 8 requirements, all mapped ✅
