# Repo Details & Issues Validation

**Date**: 2026-08-03
**Spec**: `.specs/features/repo-details-issues/spec.md`
**Diff range**: `f56e34b..HEAD` (`9b4754d` at verification; feature code T1–T14 after docs add)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status  | Notes                                      |
| ---- | ------- | ------------------------------------------ |
| T1   | ✅ Done | Avatar/Badge tokens + theme                |
| T2   | ✅ Done | `formatRelativeDate`                       |
| T3   | ✅ Done | Avatar atom                                |
| T4   | ✅ Done | Badge atom                                 |
| T5   | ✅ Done | Hyperlink organism                         |
| T6   | ✅ Done | SourceHeader organism                      |
| T7   | ✅ Done | Barrels + README                           |
| T8   | ✅ Done | SessionSourceHeader                        |
| T9   | ✅ Done | SearchRepos polish                         |
| T10  | ✅ Done | Config source toggle removed               |
| T11  | ✅ Done | RepoDetailsScreen                           |
| T12  | ✅ Done | IssueListItem                               |
| T13  | ✅ Done | RepoIssuesScreen                            |
| T14  | ✅ Done | Stack chrome + full gate                   |

---

## Spec-Anchored Acceptance Criteria

### P1: Hyperlink organism

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN Hyperlink pressed with valid `href` THEN `Linking.openURL(href)` | `openURL` called with exact href | `packages/ds/organisms/Hyperlink/__tests__/Hyperlink.test.tsx:25` — `expect(Linking.openURL).toHaveBeenCalledWith('https://github.com/acme/repo')` | ✅ PASS |
| WHEN Hyperlink renders THEN Pressable wrapper + underlined primary text | underline + `theme.colors.primary`; pressable via role=link | `Hyperlink.test.tsx:34-37` — `toHaveStyle({ textDecorationLine: 'underline', color: theme.colors.primary })`; press path `:23` | ✅ PASS |
| WHEN given `children` THEN label + `accessibilityRole="link"` | role link named with children | `Hyperlink.test.tsx:43` — `getByRole('link', { name: 'Abrir no site' })` | ✅ PASS |
| WHEN source inspected THEN under `packages/ds/organisms/Hyperlink/` AND no Zustand/`@/` | AD-012 files; no store imports | `Hyperlink.test.tsx:72-84` — `existsSync(...)`; `not.toMatch(/zustand\|@\/stores\|…/)` | ✅ PASS |

### P1: Avatar + Badge atoms

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN Avatar has `uri` THEN image at given `size` | image testID; size token px | `Avatar.test.tsx:13` — `getByTestId('ds-avatar-image')`; `:38-41` — `width/height: theme.avatar.lg.size` | ✅ PASS |
| WHEN Avatar has no `uri` THEN initials fallback | initials from name | `Avatar.test.tsx:19` — `getByText('AL')` | ✅ PASS |
| WHEN Badge receives `children` THEN compact tag chip | label text rendered | `Badge.test.tsx:13` — `getByText('bug')` | ✅ PASS |
| WHEN Badge has/omits `swatch` THEN accent vs theme default | border `#ff0000` vs surface/border | `Badge.test.tsx:27-29`, `:36-39` — `borderColor` / `backgroundColor` | ✅ PASS |
| WHEN both atoms added THEN AD-012 + AD-028 axes + barrel export | folder layout; `size`/`style`; atoms barrel | `Avatar.test.tsx:63-69`, `Badge.test.tsx:51-57`; `packages/ds/atoms/index.ts:19-23` consumed by product tests | ✅ PASS |

### P1: Source header + presentation wrapper

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN DS SourceHeader renders THEN `title` + trailing logo for `brand` | title text; brand logo testID | `SourceHeader.test.tsx:15` — `getByText('Repositories')`; `:32` / `:40` — gitlab/github logo testIDs | ✅ PASS |
| WHEN trailing pressed THEN `onToggleBrand` | callback once | `SourceHeader.test.tsx:24` — `toHaveBeenCalledTimes(1)` | ✅ PASS |
| WHEN DS source inspected THEN no Zustand/session/`@/presentation` | isolation regex | `SourceHeader.test.tsx:79-80` — `not.toMatch(/zustand\|@\/stores\|…/)` | ✅ PASS |
| WHEN SessionSourceHeader mounts THEN store → brand + toggle | github→gitlab flip | `SessionSourceHeader.test.tsx:30-36` — `dataSource` `toBe('gitlab')` then `'github'` | ✅ PASS |
| WHEN Search/Details/Issues render THEN presentation wrapper | `ds-source-header` present | `SearchReposScreen.test.tsx:296`; `RepoDetailsScreen.test.tsx:192`; `RepoIssuesScreen.test.tsx:246` | ✅ PASS |
| WHEN Config renders THEN no data-source toggle | no toggle/section/fonte copy | `ConfigScreen.test.tsx:24-26` — `queryByTestId('config-data-source-toggle')` null etc. | ✅ PASS |

### P1: Repo details screen

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN loads with `repoId` THEN `useRepoDetails` + loading until ready | loading testID then fullName | `RepoDetailsScreen.test.tsx:85-93` — `repo-details-loading` then `facebook/react`; `:198` — `/useRepoDetails/` | ✅ PASS |
| WHEN data arrives THEN §4.3 fields | fullName, owner, avatar, metrics, language, description | `RepoDetailsScreen.test.tsx:101-110` — field text/testIDs | ✅ PASS |
| WHEN data arrives THEN Hyperlink to `repo.htmlUrl` | openURL with htmlUrl | `RepoDetailsScreen.test.tsx:136` — `toHaveBeenCalledWith('https://github.com/facebook/react')` | ✅ PASS |
| WHEN Issues CTA pressed THEN navigate `RepoIssues` same `repoId` | issues screen repo link | `RepoDetailsScreen.test.tsx:151` — `repo-issues-repo-link` text `facebook/react` | ✅ PASS |
| WHEN query errors THEN `mapAppErrorToMessage` + Retry | rate_limit message + refetch | `RepoDetailsScreen.test.tsx:172-181` — error text + retry → fullName | ✅ PASS |
| WHEN implementing THEN no adapters/`fetch` | source isolation | `RepoDetailsScreen.test.tsx:201-202` — `not.toMatch` github/gitlab/`fetch(` | ✅ PASS |

### P1: Repo issues screen

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN loads THEN `useRepoIssues` + first-page loading | loading then row | `RepoIssuesScreen.test.tsx:91-99`; `:252` — `/useRepoIssues/` | ✅ PASS |
| WHEN issues arrive THEN title Hyperlink, Badges, author, relative date PT-BR | row fields + date | `RepoIssuesScreen.test.tsx:113-117`; `IssueListItem.test.tsx:56` — `getByText(expectedDate)` where `expectedDate = formatRelativeDate(..., { now })`; `:73` — openURL issue htmlUrl | ✅ PASS |
| WHEN shown THEN Hyperlink to repo `htmlUrl` | openURL repo | `RepoIssuesScreen.test.tsx:134` — `toHaveBeenCalledWith('https://github.com/facebook/react')` | ✅ PASS |
| WHEN scroll end + `hasNextPage` THEN `fetchNextPage` | listCalls 1→2 | `RepoIssuesScreen.test.tsx:160` — `expect(listCalls).toBe(2)` | ✅ PASS |
| WHEN pull to refresh THEN refetch | listCalls 1→2 | `RepoIssuesScreen.test.tsx:191` — `expect(listCalls).toBe(2)` | ✅ PASS |
| WHEN zero issues THEN empty state | empty testID | `RepoIssuesScreen.test.tsx:202` — `repo-issues-empty` | ✅ PASS |
| WHEN query errors THEN mapper + Retry | rate_limit + refetch | `RepoIssuesScreen.test.tsx:223-232` | ✅ PASS |
| WHEN implementing THEN presentation hooks only | no adapters/`fetch`/store | `RepoIssuesScreen.test.tsx:256-258` | ✅ PASS |

### P2: Search visual polish

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN SearchRepos renders THEN spacing/typography hierarchy tightened via DS Container/Spacer/Typography | “tightened” not quantified in spec | Structural only: `SearchReposScreen.test.tsx:328` — Container list region; source uses Spacer/Typography (`SearchReposScreen.tsx:110-123`) — no measurable spacing/type outcome asserted | ⚠️ Spec-precision gap |
| WHEN SearchRepos renders THEN presentation SourceHeader wrapper | SessionSourceHeader + toggle | `SearchReposScreen.test.tsx:296-297` — `ds-source-header` + `Alternar fonte de dados` | ✅ PASS |

**Status**: ⚠️ Spec-precision gaps flagged (30/31 ACs matched outcome; 1 precision gap on P2 spacing polish)

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `packages/ds/organisms/Hyperlink/Hyperlink.tsx` onPress | Removed `Linking.openURL(href)` side effect | ✅ Killed (`Hyperlink.test.tsx:25`, also soft-fail `:55`) |
| 2 | `packages/ds/utils/format-relative-date.ts` | Valid dates always return `'—'` | ✅ Killed (`format-relative-date.test.ts:32`, `:40`, + day/seconds cases) |
| 3 | `src/presentation/components/SessionSourceHeader.tsx` | `onToggleBrand={() => undefined}` instead of `toggleDataSource` | ✅ Killed (`SessionSourceHeader.test.tsx:30`) |

**Sensor depth**: lightweight (3 behavior-level mutations in detached worktree `/tmp/rdi-verify-sensor`; discarded after each)
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

Not performed (Verifier automated pass; interactive UAT deferred to orchestrator/user if desired).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ (1 precision gap flagged, not silent-passed) |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement — no unclaimed tests | ✅ |
| Documented guidelines followed: `AGENTS.md` (Expo v54), AD-006/012/028/029, colocated `__tests__` | ✅ |

---

## Edge Cases

- [x] Missing `ownerAvatarUrl` / `authorAvatarUrl` → Avatar fallback (`Avatar.test.tsx:16-20`; IssueListItem with/without uri)
- [x] Zero labels → no Badge crash (`IssueListItem.test.tsx:60-65`)
- [x] `Linking.openURL` rejects → soft-fail (`Hyperlink.test.tsx:46-55`)
- [x] Empty/whitespace `repoId` → queries disabled (`use-repo-details.test.ts:61+`; `use-repo-issues.test.ts:103+`)
- [x] Missing description → omit block (`RepoDetailsScreen.test.tsx:115-122`)
- [x] Invalid relative date → `'—'` (`format-relative-date.test.ts:11-16`)

---

## Gate Check

- **Gate command**: `pnpm test` && `pnpm lint` (from tasks.md Build gate)
- **Result**: 502 passed, 0 failed, 0 skipped; lint 0 errors (3 pre-existing warnings in `storybook.requires.ts` / `src/test/setup.ts`)
- **Test count before feature** (~`f56e34b`): 74 `__tests__` paths
- **Test count after feature** (HEAD): 85 `__tests__` paths; suite **502** tests
- **Delta**: +11 test files; ~+71 new `it()` in feature-scoped suites (approx.)
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

None required for FAIL. Optional follow-up (non-blocking):

### Optional: P2 Search polish measurable AC

- **Root cause**: Spec AC uses “tightened” without measurable spacing/type outcomes
- **Fix task**: Either tighten spec with concrete spacer/gap/variant expectations, or add structural asserts (e.g. Spacer present, gap tokens on Container) keyed to those expectations
- **Priority**: Minor / Cosmetic (does not block feature Done)

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status   |
| ----------- | --------------- | ------------ |
| RDI-01      | Design/Pending  | ✅ Verified  |
| RDI-02      | Design/Pending  | ✅ Verified  |
| RDI-03      | Design/Pending  | ✅ Verified  |
| RDI-04      | Design/Pending  | ✅ Verified  |
| RDI-05      | Design/Pending  | ✅ Verified  |
| RDI-06      | Design/Pending  | ✅ Verified  |
| RDI-07      | Design/Pending  | ✅ Verified  |
| RDI-08      | Design/Pending  | ✅ Verified (P2 spacing AC precision gap only) |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 30/31 ACs matched spec outcome | 1 spec-precision gap
**Sensor**: 3/3 mutations killed
**Gate**: 502 passed

**What works**: DS Hyperlink/Avatar/Badge/SourceHeader; SessionSourceHeader store adapter; Config without fonte toggle; RepoDetails/RepoIssues full UI (loading, fields, hyperlinks, pagination, refresh, empty, error+Retry); Search uses SessionSourceHeader.

**Issues found**: P2 “tightened hierarchy” not precisely defined or asserted (flagged only).

**Next steps**: Mark feature Done; optional polish of Search P2 AC/tests; interactive UAT if product owner wants visual confirmation.
