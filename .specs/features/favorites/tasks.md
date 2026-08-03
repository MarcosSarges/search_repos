# Favorites Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/favorites/design.md`  
**Status**: Approved — Execute in progress (MVP T1–T9; P2 deferred)

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` (Expo v54), AD-006 (Jest + RNTL; Maestro out of scope), AD-018/029/031, colocated `__tests__`, `package.json` → `pnpm test` / `pnpm lint`. Sample: `session-preferences-store.test.ts`, `BackHeader.test.tsx`, `FavoritosScreen.test.tsx`, `ExploreScreen` / `RepoDetailsScreen` tests.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Store relocation / session parity | unit | Existing session tests still pass after move; zero `@/stores` imports in production | `src/presentation/stores/__tests__/**` | `pnpm test -- src/presentation/stores` |
| `FavoriteSnapshot` + sanitize + `toFavoriteSnapshot` | unit | Valid/invalid payloads; maps Repo fields + dataSource + favoritedAt | `src/presentation/stores/__tests__/**` or mappers `__tests__` | `pnpm test -- src/presentation` |
| favorites Zustand store | unit | FAV-02/05/07 + edges: toggle add/remove, idempotent upsert, listBySource sort, corrupt → [], rehydrate, cold start | `src/presentation/stores/__tests__/favorites-store.test.ts` | `pnpm test -- src/presentation/stores` |
| BackHeader trailing | unit (RNTL) | Trailing renders; store-free isolation; AD-012 files | `packages/ds/organisms/BackHeader/__tests__/**` | `pnpm test -- packages/ds/organisms/BackHeader` |
| StackBackHeader trailing | unit (RNTL) | Passthrough trailing | `src/presentation/components/__tests__/**` | `pnpm test -- src/presentation/components` |
| mapFavoriteToRepoItemProps | unit | Snapshot → RepoItem props (language → languages) | `src/presentation/mappers/__tests__/**` | `pnpm test -- src/presentation/mappers` |
| RepoDetails favorite toggle | unit (RNTL) | FAV-06/07/08: show when loaded; add/remove; absent on loading/error | `src/presentation/screens/search/__tests__/RepoDetailsScreen.test.tsx` | `pnpm test -- src/presentation/screens/search` |
| FavoritosScreen | unit (RNTL) | FAV-03/04/10/11/12/13: SessionSourceHeader; hydrate gate; two sections; empty+CTAs; swipe remove; tap setDataSource+nav | `src/presentation/screens/__tests__/FavoritosScreen.test.tsx` | `pnpm test -- src/presentation/screens` |
| Domain / application isolation | unit | FAV-15: no Zustand / `@/presentation/stores` in domain+application | existing isolation + grep in task gate | `pnpm test -- src/domain` |
| Maestro E2E | none (this slice) | Out of scope | — | — |
| P2 RepoItem trailing (if executed) | unit (RNTL) | Optional slot; default chrome unchanged; store-free | `packages/ds/organisms/RepoItem/__tests__/**` | `pnpm test -- packages/ds/organisms/RepoItem` |

## Gate Check Commands

> Confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | -------- |
| Quick | Single layer / task path | `pnpm test -- <scoped path from task>` |
| Full | After presentation cluster | `pnpm test -- src/presentation packages/ds/organisms/BackHeader` |
| Build | Phase end / feature close | `pnpm test` && `pnpm lint` |

---

## Execution Plan

Phases run sequentially. **MVP = Phases 1–4 (T1–T9).** Phase 5 (P2) is optional after MVP.

### Phase 1: Store relocation

```
T1
```

### Phase 2: Favorites store

```
T2 → T3
```

### Phase 3: Header trailing (DS + adapter)

```
T4 → T5
```

### Phase 4: Product UI (Details + Favoritos)

```
T6 → T7 → T8 → T9
```

### Phase 5: P2 Search shortcut (optional)

```
T10 → T11
```

---

## Task Breakdown

### T1: Move Zustand stores to `src/presentation/stores/`

**What**: Relocate `session-preferences-store`, `use-hydration`, barrel, and tests from `src/stores/` → `src/presentation/stores/`; rewrite all `@/stores` imports; remove `src/stores/`; update README architecture table for stores under presentation (AD-031).  
**Where**: `src/presentation/stores/**`, all former `@/stores` consumers, `README.md`  
**Depends on**: None  
**Reuses**: Existing session store + tests (path move only)  
**Requirement**: FAV-01, FAV-15

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] No `src/stores/` directory remains
- [x] Zero production/test imports of `@/stores` (grep clean)
- [x] Session preference + hydrate + theme gate tests still pass
- [x] Domain/application production sources do not import presentation stores
- [x] Gate: `pnpm test -- src/presentation/stores src/presentation/theme src/domain`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(stores): move Zustand client stores under presentation`

---

### T2: `FavoriteSnapshot` type, sanitize, `toFavoriteSnapshot`

**What**: Define `FavoriteSnapshot`, `sanitizePersistedFavorites`, and `toFavoriteSnapshot(repo, dataSource)` with unit tests (valid/corrupt payloads; field mapping).  
**Where**: `src/presentation/stores/favorite-snapshot.ts` (+ colocated or `__tests__/favorite-snapshot.test.ts`)  
**Depends on**: T1  
**Reuses**: `sanitizePersistedPreferences` pattern; domain `Repo`; `DataSource` from `@/application`  
**Requirement**: FAV-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Type matches design (`id`, `dataSource`, `name`, `fullName`, owner/stars/description/language?, `favoritedAt`)
- [x] Corrupt root → empty items; invalid entries dropped
- [x] `toFavoriteSnapshot` sets `favoritedAt` and copies repo fields
- [x] Gate: `pnpm test -- src/presentation/stores`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(favorites): add FavoriteSnapshot helpers`

---

### T3: Favorites Zustand persist store

**What**: Implement `createFavoritesStore` / `useFavoritesStore` with persist AsyncStorage, injectable storage, `isFavorite`, `toggleFavorite`, `removeFavorite`, `listBySource` (favoritedAt desc), hydrate always-on-ready, session `reset` does not clear favorites.  
**Where**: `src/presentation/stores/favorites-store.ts`, `__tests__/favorites-store.test.ts`, barrel export  
**Depends on**: T2  
**Reuses**: session-preferences factory + `createMemoryStorage`  
**Requirement**: FAV-02, FAV-03, FAV-05, FAV-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Persist key `searchrepos:favorites`; partialize `items` only
- [x] Toggle add/remove + idempotent upsert; listBySource sorted; corrupt → `[]` no crash
- [x] Cold-start remount restores snapshots (memory storage)
- [x] Gate: `pnpm test -- src/presentation/stores`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(favorites): add persisted favorites Zustand store`

---

### T4: BackHeader optional `trailing`

**What**: Add `trailing?: ReactNode` to DS `BackHeader` (pass to `Header`); update stories + tests (render trailing; isolation no store).  
**Where**: `packages/ds/organisms/BackHeader/**`  
**Depends on**: None (can run after T1 in phase order; no code dep on T3)  
**Reuses**: `Header` trailing slot; AD-012 / AD-029  
**Requirement**: FAV-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Trailing node appears when provided; back still works
- [x] Isolation test still forbids Zustand/`@/` app imports
- [x] Gate: `pnpm test -- packages/ds/organisms/BackHeader`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): allow trailing slot on BackHeader`

**Note**: Phase 3 starts after Phase 2 for sequencing clarity; T4 has no hard dep on T2/T3 — listed `Depends on: None` but executes after Phase 2 per plan.

---

### T5: StackBackHeader `trailing` passthrough

**What**: Forward optional `trailing` from `StackBackHeader` to `BackHeader`; unit test.  
**Where**: `src/presentation/components/StackBackHeader.tsx`, `__tests__`  
**Depends on**: T4  
**Reuses**: AD-029 adapter pattern  
**Requirement**: FAV-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Trailing prop typed and forwarded
- [x] Test asserts trailing content mounted
- [x] Gate: `pnpm test -- src/presentation/components`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(presentation): pass trailing through StackBackHeader`

---

### T6: `mapFavoriteToRepoItemProps`

**What**: Mapper from `FavoriteSnapshot` → `RepoItem` props (`language` → `languages` badge).  
**Where**: `src/presentation/mappers/map-favorite-to-repo-item-props.ts`, `__tests__`  
**Depends on**: T2  
**Reuses**: `mapRepoToRepoItemProps` shape  
**Requirement**: FAV-13

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Unit tests cover with/without description/language/avatar
- [x] Gate: `pnpm test -- src/presentation/mappers`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(favorites): map FavoriteSnapshot to RepoItem props`

---

### T7: RepoDetails favorite toggle in header

**What**: When details `data` loaded, show trailing star toggle on `StackBackHeader`; wire `isFavorite` / `toggleFavorite(toFavoriteSnapshot(...))`; hide/disable on loading/error.  
**Where**: `src/presentation/screens/search/RepoDetailsScreen.tsx`, `__tests__/RepoDetailsScreen.test.tsx`  
**Depends on**: T3, T5  
**Reuses**: `toFavoriteSnapshot`; Icon `star` / `star-outline`  
**Requirement**: FAV-06, FAV-07, FAV-08, FAV-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `testID="repo-details-favorite"`; a11y labels PT-BR
- [x] Toggle adds/removes snapshot for `(activeDataSource, repoId)`
- [x] Control absent or disabled without loaded repo
- [x] Gate: `pnpm test -- src/presentation/screens/search`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(favorites): toggle favorite from RepoDetails header`

---

### T8: FavoritosScreen — hydrate, empty CTAs, two sections, tap

**What**: Replace placeholder with hydrated Favoritos UI: **`SessionSourceHeader` title Favoritos**; wait on favorites `hasHydrated`; global empty + CTAs to Search and Explore; non-empty → ScrollView with GitHub/GitLab sections (omit empty); rows via RepoItem; tap → `setDataSource` if needed + navigate to `RepoDetails` (Explore pattern).  
**Where**: `src/presentation/screens/FavoritosScreen.tsx`, `__tests__/FavoritosScreen.test.tsx`  
**Depends on**: T3, T6  
**Reuses**: `SessionSourceHeader` (Explore/Search chrome); Explore nested `navigate('Search', { screen: 'RepoDetails', ... })`; `DataSourceLogo` section headers  
**Requirement**: FAV-03, FAV-04, FAV-10, FAV-12, FAV-13

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Screen uses `SessionSourceHeader` (not plain `Header`) with title Favoritos
- [ ] No false empty before hydrate
- [ ] Both empty → copy + Search + Explore CTAs
- [ ] Items partitioned by source; no interleaved flat list
- [ ] Tap switches source when needed and navigates with `repoId`
- [ ] Gate: `pnpm test -- src/presentation/screens`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(favorites): render dual-source Favoritos lists`

---

### T9: Favoritos swipe-to-delete

**What**: Wrap Favoritos rows in RNGH `Swipeable` with Remover action calling `removeFavorite`; persist; cancelled swipe keeps item.  
**Where**: `src/presentation/screens/FavoritosScreen.tsx` (or small `FavoriteSwipeRow` colocated), tests  
**Depends on**: T8  
**Reuses**: `react-native-gesture-handler` already in App  
**Requirement**: FAV-11

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Swipe confirm removes `(dataSource, id)` from store and UI
- [ ] Test covers remove path (press action button if gesture hard to simulate)
- [ ] Gate: `pnpm test -- src/presentation/screens`

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(favorites): swipe-to-delete on Favoritos rows`

---

### T10 (P2): RepoItem optional `trailingAction`

**What**: Add optional `trailingAction?: ReactNode` to DS `RepoItem` without changing default chrome; stories + isolation tests.  
**Where**: `packages/ds/organisms/RepoItem/**`  
**Depends on**: T9 (MVP complete first)  
**Reuses**: store-free props only  
**Requirement**: FAV-14

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Default stories/tests unchanged visually when prop omitted
- [ ] Trailing renders when provided; no store imports
- [ ] Gate: `pnpm test -- packages/ds/organisms/RepoItem`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): optional trailingAction on RepoItem`

---

### T11 (P2): Search list favorite shortcut

**What**: Wire Search `RepoListItem` trailing favorite toggle to favorites store via snapshot from list `Repo` + current `dataSource`.  
**Where**: `src/presentation/screens/search/RepoListItem.tsx` (+ SearchReposScreen if needed), tests  
**Depends on**: T3, T10  
**Reuses**: `toFavoriteSnapshot`; T7 toggle UX  
**Requirement**: FAV-14

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Toggle from search row updates favorites store
- [ ] Gate: `pnpm test -- src/presentation/screens/search`

**Tests**: unit  
**Gate**: build  
**Commit**: `feat(favorites): favorite toggle on search results`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → (optional Phase 5)

Phase 1:  T1
Phase 2:  T2 ──→ T3
Phase 3:  T4 ──→ T5
Phase 4:  T6 ──→ T7 ──→ T8 ──→ T9
Phase 5:  T10 ──→ T11
```

**Batch packing (Execute):** ~11 tasks → ~2 workers if P2 included; MVP-only T1–T9 → still ~2 batches (~7 budget). Offer sub-agents at Execute when user starts implementation.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Move stores + rewrite imports | 1 cohesive relocation | ✅ Granular |
| T2: Snapshot helpers | 1 module | ✅ Granular |
| T3: Favorites store | 1 store + tests | ✅ Granular |
| T4: BackHeader trailing | 1 DS prop | ✅ Granular |
| T5: StackBackHeader passthrough | 1 adapter prop | ✅ Granular |
| T6: Mapper | 1 function | ✅ Granular |
| T7: Details toggle | 1 screen wiring | ✅ Granular |
| T8: Favoritos list UI | 1 screen (no swipe) | ✅ Granular |
| T9: Swipe delete | 1 interaction | ✅ Granular |
| T10: RepoItem slot | 1 DS prop | ✅ Granular |
| T11: Search wire | 1 list wiring | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| ---- | ----------------- | ------------- | ------ |
| T1 | None | Phase 1 start | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | None | Phase 3 start (after Phase 2) | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T2 | T2 → T6 (via Phase 4 after T2) | ✅ Match |
| T7 | T3, T5 | T3+T5 → T7 | ✅ Match |
| T8 | T3, T6 | T3+T6 → T8 | ✅ Match |
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T9 | T9 → T10 | ✅ Match |
| T11 | T3, T10 | T3+T10 → T11 | ✅ Match |

Note: T6 depends on T2 only (not T5); Phase 4 order `T6 → T7` satisfies T7 needing T5 because T5 completes in Phase 3 before Phase 4.

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | -------------- | --------- | ------ |
| T1 | Store relocation / session | unit | unit | ✅ OK |
| T2 | Snapshot helpers | unit | unit | ✅ OK |
| T3 | favorites store | unit | unit | ✅ OK |
| T4 | BackHeader | unit | unit | ✅ OK |
| T5 | StackBackHeader | unit | unit | ✅ OK |
| T6 | Mapper | unit | unit | ✅ OK |
| T7 | RepoDetails toggle | unit | unit | ✅ OK |
| T8 | FavoritosScreen | unit | unit | ✅ OK |
| T9 | FavoritosScreen swipe | unit | unit | ✅ OK |
| T10 | RepoItem trailing | unit | unit | ✅ OK |
| T11 | Search wire | unit | unit | ✅ OK |

---

## Requirement Traceability (tasks)

| Requirement | Tasks |
| ----------- | ----- |
| FAV-01 | T1 |
| FAV-02 | T2, T3 |
| FAV-03 | T3, T8 |
| FAV-04 | T8 |
| FAV-05 | T3 |
| FAV-06 | T7 |
| FAV-07 | T3, T7 |
| FAV-08 | T7 |
| FAV-09 | T4, T5, T7 |
| FAV-10 | T8 |
| FAV-11 | T9 |
| FAV-12 | T8 |
| FAV-13 | T6, T8 |
| FAV-14 | T10, T11 (P2) |
| FAV-15 | T1 |
