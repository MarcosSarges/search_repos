# Favorites Validation

**Date**: 2026-08-03
**Spec**: `.specs/features/favorites/spec.md`
**Diff range**: `96ecedd..HEAD` (full feature); CA emphasis `4343f8a..a6f3a80`; lint fix `f9008ba`
**Verifier**: independent sub-agent (author ≠ verifier); re-check iteration 1/3 after lint fix
**Scope**: P1 ACs FAV-01..13, FAV-15; FAV-14 / P2 skipped

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Relocate stores | ✅ Done | No `src/stores/`; imports `@/presentation/stores` |
| T2–T3 Snapshot + store (superseded by AD-032) | ✅ Done | Domain Favorite + infra adapter + thin cache |
| T4–T5 BackHeader / StackBackHeader trailing | ✅ Done | Store-free DS + presentation adapter |
| T6 Mapper | ✅ Done | `mapFavoriteToRepoItemProps` |
| T7 RepoDetails toggle | ✅ Done | FAV-06/07/08 |
| T8–T9 Favoritos dual list + swipe | ✅ Done | FAV-03/04/10/11/12/13 |
| T10–T11 P2 Search shortcut | ⏭️ Deferred | FAV-14 out of scope |

---

## Spec-Anchored Acceptance Criteria

### FAV-01 — Relocate stores → `presentation/stores`

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN feature lands THEN stores under `src/presentation/stores/` not `src/stores/` | No residual `src/stores/`; favorites + session live under presentation | Tree: `src/presentation/stores/favorites-store.ts`, `session-preferences-store.ts`; `test ! -d src/stores` | ✅ PASS |
| WHEN production imports session/favorites THEN from `@/presentation/stores` | Zero `@/stores` imports | Grep production/tests: zero matches for `@/stores` | ✅ PASS |
| WHEN domain/application inspected THEN no Zustand / presentation stores | No zustand / `@/presentation/stores` | `src/domain/__tests__/isolation.test.ts:47` — `expect(violations).toEqual([])`; `src/application/__tests__/isolation.test.ts:48` — same; grep domain+app: zero `@/presentation` | ✅ PASS |
| WHEN cold-start session prefs + SecureStore hydrate THEN gate waits both | `useHydration` true only when both flags true | `src/presentation/theme/__tests__/session-gate.test.tsx:17-44` — `expect(result.current).toBe(false\|true)` for prefs-only / tokens-only / both | ✅ PASS |

### FAV-02 — Snapshot fields + persist

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN repo favorited THEN snapshot has id, name/fullName, owner, avatar?, stars, description?, language?, source (+ favoritedAt) | Exact field copy; AD-032 uses opaque `source` (supersedes UI `dataSource` on entity) | `src/application/use-cases/__tests__/favorites.test.ts:71-82` — `expect(createFavoriteFromRepo(...)).toEqual({ id, source, name, fullName, ownerName, ownerAvatarUrl, stars, description, language, favoritedAt })` | ✅ PASS |
| Persist via AsyncStorage adapter | Key `searchrepos:favorites`, shape `{ items }` | `src/infrastructure/repositories/__tests__/favorites-repository.test.ts:72-75` — `expect(JSON.parse(raw)).toEqual({ items: [expect.objectContaining({ id: '42', source: 'github' })] })` | ✅ PASS |

### FAV-03 — Offline list / cold start

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN Favoritos opened with persisted items THEN render from local store without product HTTP | Lists from favorites repo/cache; screen has no Repo HTTP imports | `FavoritosScreen.tsx` — only `useFavorites` / mapper / DS; `FavoritosScreen.test.tsx:165-172` — sections + `ds-repo-item` length 3 from seeded favorites repo | ✅ PASS |
| WHEN cold-start after save THEN both sources restore; order most-recent first | Remount restores; sort `favoritedAt` desc | `favorites-repository.test.ts:86-96` — remount length 2 + exists both sources; `favorites.test.ts:118-119` — `expect(items.map(id)).toEqual(['b','c','a'])`; store `favorites-store.test.ts:60-65` — github order `['g2','g3','g1']` | ✅ PASS |

### FAV-04 — Two lists (no interleaved flat list)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN both sources have favorites THEN two distinct sections | `favoritos-section-github` + `favoritos-section-gitlab`; labels GitHub/GitLab | `FavoritosScreen.test.tsx:168-171` — both section testIDs + `getByText('GitHub'|'GitLab')` | ✅ PASS |
| WHEN one source empty THEN omit that section | Empty source section absent | `FavoritosScreen.test.tsx:182-184` — github present, `queryByTestId('favoritos-section-gitlab')` null | ✅ PASS |

### FAV-05 — Corrupt/fail storage → empty, no crash

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN payload corrupt / rehydrate fails THEN empty favorites, no crash | `[]` / `{ items: [] }`; hydrate sets `hasHydrated` | `favorites-repository.test.ts:39-42` — corrupt roots → `{ items: [] }`; `:78-83` — `{not-json` → `listAll() === []`; `favorites-store.test.ts:40-45` — hydrate throw → `items []` + `hasHydrated true` | ✅ PASS |

### FAV-06 / FAV-07 / FAV-08 — Details header toggle

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN loaded THEN favorite control reflects state | Control present; a11y Favoritar / Remover | `RepoDetailsScreen.test.tsx:265-267` — `repo-details-favorite` + `Favoritar`; `:308` — `Remover dos favoritos` | ✅ PASS |
| WHEN activate while not favorited THEN add snapshot + persist | Store gets snapshot fields | `RepoDetailsScreen.test.tsx:274-285` — `isFavorite` true + `toMatchObject({ id, source, name, fullName, ownerName, stars })` | ✅ PASS |
| WHEN activate while favorited THEN remove + persist | `isFavorite` false | `RepoDetailsScreen.test.tsx:315-317` — `isFavorite(...).toBe(false)`; use-case `favorites.test.ts:146-147` — `{ favorited: false }` + `exists` false | ✅ PASS |
| WHEN loading/error THEN control absent | No write without payload | `RepoDetailsScreen.test.tsx:235` / `:253` — `queryByTestId('repo-details-favorite')` null | ✅ PASS |

### FAV-09 — DS header store-free + presentation adapter

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN BackHeader inspected THEN store-free | No zustand / `@/` app imports | `BackHeader.test.tsx:60-63` — `not.toMatch(/zustand\|@\/stores\|@\/presentation\|.../)` | ✅ PASS |
| WHEN trailing wired THEN presentation adapter passes through | StackBackHeader forwards trailing | `StackBackHeader.test.tsx:77-93` — trailing testID mounted; RepoDetails uses `StackBackHeader` + `trailing={favoriteTrailing}` | ✅ PASS |

### FAV-10 — Empty state + CTA

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN both empty after hydrate THEN PT-BR empty + CTA to Search and/or Explore | Friendly copy; ≥1 CTA (both present) | `FavoritosScreen.test.tsx:105-107` — `/Você ainda não tem favoritos/` + both CTA testIDs; `:120-121` / `:136-137` — navigate to Search/Explore stubs | ✅ PASS |
| WHEN not hydrated THEN no false empty | Loading, no empty CTA | `FavoritosScreen.test.tsx:91-93` — `favoritos-loading`; empty/CTA null | ✅ PASS |

### FAV-11 — Swipe-to-delete

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN Remover confirmed THEN remove `(source,id)` from store/UI | Row gone; sibling remains | `FavoritosScreen.test.tsx:238-243` — `isFavorite('github','gh/one')` false; row null; `gh/two` remains | ✅ PASS |

### FAV-12 — Tap → setDataSource + details

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN tap Favoritos row THEN set dataSource if needed + navigate details | Session `dataSource` → gitlab; details stub shows id | `FavoritosScreen.test.tsx:206-210` — `dataSource === 'gitlab'`; `repo-details-stub` text `details:gitlab-org/gitlab` | ✅ PASS |

### FAV-13 — Reuse DS RepoItem / FlatList patterns

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN rows render THEN DS RepoItem (not ad-hoc Text rows) | `ds-repo-item` via mapper | `FavoritosScreen.test.tsx:172` — `getAllByTestId('ds-repo-item')` length 3; `map-favorite-to-repo-item-props.test.ts:20-27` — props shape for RepoItem | ✅ PASS |

### FAV-15 — domain/application never import stores

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| WHEN domain/application scanned THEN no Zustand / presentation stores | Isolation clean | Same evidence as FAV-01 AC3 | ✅ PASS |

### FAV-14 / P2

Skipped per verifier scope.

**Status**: ✅ All in-scope P1 ACs covered (14/14: FAV-01..13, FAV-15) — outcome-matched. Overall feature verdict **PASS** (gate green after `f9008ba`).

---

## Architecture (AD-032)

| Check | Evidence | Result |
| ----- | -------- | ------ |
| Domain `Favorite` + `FavoritesRepository`; opaque `source`, no `DataSource` import | `src/domain/entities/favorite.ts`; `favorites-repository.ts`; `entity-shapes.test.ts:25-26` — `not.toMatch(/\bDataSource\b/)` | ✅ |
| Application use cases | `create-favorite-from-repo`, `list-favorites`, `list-favorites-by-source`, `toggle-favorite`, `remove-favorite`, `is-favorite` + DI in `create-container.ts:62-66` | ✅ |
| AsyncStorage adapter only in infrastructure | `async-storage-favorites-repository.ts:1,85`; favorites I/O grepped — no AsyncStorage in `favorites-store.ts` | ✅ |
| Presentation store = thin cache (no persist middleware) | `favorites-store.ts` — hydrate/setItems/selectors only; test `:89-91` — `not.toHaveProperty('persist')`; `typeof toggleFavorite === 'undefined'` | ✅ |
| Screens use use cases via hooks/DI | `use-favorites.ts` → `container.listFavorites` / `toggleFavorite` / `removeFavorite` | ✅ |

Note: session-preferences store still uses AsyncStorage `persist` (AD-018/031) — out of favorites write-model scope.

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/application/use-cases/toggle-favorite.ts:10-18` | Toggle always-add (never remove) | ✅ Killed — `favorites.test.ts:146` expected `{ favorited: false }` |
| 2 | `src/infrastructure/repositories/async-storage-favorites-repository.ts:64-75` | `sanitizePersistedFavorites` always `{ items: [] }` | ✅ Killed — remount length / valid-entry keep / exists assertions |
| 3 | `src/presentation/stores/favorites-store.ts:25-29` | `listBySource` filters always `'github'` | ✅ Killed — `favorites-store.test.ts:71` gitlab expected `['gl1']` |

**Sensor depth**: lightweight (3 mutations)
**Result**: 3/3 killed — PASS ✅
**Restore**: confirmed via `diff -q` against scratch copies after each run

---

## Interactive UAT Results

Not performed (Verifier automated pass; orchestrator may schedule UAT separately).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep (P2 deferred) | ✅ |
| Matches CA patterns (AD-032) | ✅ |
| Spec-anchored outcome check | ✅ |
| Per-layer coverage (domain/app/infra/presentation) | ✅ |
| Every in-scope test maps to AC/edge/Done-when | ✅ |
| Documented guidelines: `AGENTS.md` Expo v54; AD-006/018/029/031/032 | ✅ |

### Edge cases (spec)

- [x] Idempotent identity via upsert (repo replace-by `(source,id)`) — covered by adapter upsert path; no dedicated double-add length assertion (non-blocking)
- [x] GitHub item stays under GitHub when session toggles — sections keyed by `item.source` (`FavoritosScreen.tsx:67-74`)
- [x] No false empty before hydrate — FAV-10 test
- [x] Missing optionals still map/render — `createFavoriteFromRepo` omit test + mapper tests
- [ ] Swipe cancelled mid-gesture — not unit-tested (gesture cancel); remove path covered via action button
- [x] Only one source populated — section omit test

---

## Gate Check

- **Gate command**: `pnpm test` && `pnpm lint`
- **Result (re-check 1/3)**: tests **635 passed**, 0 failed, 0 skipped (101 suites); lint **PASSED** (exit 0) — 0 errors, 3 warnings in 2 files
- **Prior FAIL**: lint exit 1 (2 prettier errors) — fixed in `f9008ba style: fix prettier in BackHeader story and FlatList test`
- **Test count before feature**: not captured exactly at `96ecedd` (test-file tree ~97 → 101 files)
- **Test count after feature**: 635
- **Skipped tests**: none
- **Failures**: none in Jest
- **Lint** (warnings-only, exit 0 OK):
  - `.rnstorybook/storybook.requires.ts` — `no-require-imports` (2 warnings, pre-existing)
  - `src/test/setup.ts` — `no-require-imports` (1 warning, pre-existing)
- **Spot-check**: `BackHeader.stories.tsx` eslint clean; `favorites-store.ts` has no AsyncStorage / persist middleware (AD-032 intact)

---

## Fix Plans

### Fix 1: Restore green `pnpm lint` gate — ✅ Done

- **Root cause**: Build gate requires lint exit 0; feature-touched `BackHeader.stories.tsx` missing final newline (prettier error). FlatList test also had prettier issues.
- **Fix**: `f9008ba` — prettier fixes in `BackHeader.stories.tsx` + `FlatList.test.tsx`
- **Verify**: `pnpm lint` exit 0; `pnpm test` 635 green (re-check 1/3)

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| FAV-01 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-02 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-03 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-04 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-05 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-06 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-07 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-08 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-09 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-10 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-11 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-12 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-13 | Verified / gate blocked | ✅ Verified (AC + gate) |
| FAV-14 | In Tasks | ⏭️ Skipped (P2) |
| FAV-15 | Verified / gate blocked | ✅ Verified (AC + gate) |

---

## Summary

**Overall**: ✅ PASS — Ready (MVP; P2 deferred)

**Spec-anchored check**: 14/14 in-scope P1 ACs matched spec outcomes | 0 spec-precision gaps
**Architecture (AD-032)**: PASS
**Sensor**: 3/3 mutations killed (prior verification; not re-run)
**Gate**: 635 tests passed; lint exit 0 (warnings-only OK)

**What works**: Clean Arch favorites write-model, thin presentation cache, dual-source Favoritos UI, details toggle, swipe remove, isolation.

**Issues found**: none blocking. Prior lint FAIL cleared by `f9008ba`.

**Next steps**: Optional PR; P2 (FAV-14 Search shortcut) remains deferred.
