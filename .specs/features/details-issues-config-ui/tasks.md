# Details / Issues / Config UI Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/details-issues-config-ui/design.md`  
**Status**: In Progress — Execute Batch 2 (T4–T6)

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` / AD-006 (Jest+RNTL), AD-012, `package.json` (`pnpm test`, `pnpm lint`); samples: `packages/ds/organisms/RepoItem/__tests__`, `src/infrastructure/github/__tests__/mappers.test.ts`, `src/presentation/screens/search/__tests__/IssueListItem.test.tsx`, `src/presentation/screens/__tests__/ConfigScreen.test.tsx`. Maestro E2E out of scope for this feature.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain `Issue` + ACL mappers + Fake | unit | DIC-04..06 + edges (`opened`→`open`, PR filter, comments `0`); fixtures compile | `src/domain/**`, `src/infrastructure/**/__tests__/mappers.test.ts`, `**/create-*-repo-repository.test.ts`, Fake seeds | `pnpm test` |
| SettingsRow molecule | unit | DIC-10: icon/title/subtitle/trailing; press when `onPress`; `testID` | `packages/ds/molecules/SettingsRow/__tests__/*.test.tsx` | `pnpm test` |
| IssueItem organism | unit | DIC-07 ACs + empty labels + comments `0` + relative `updatedAt`; no `@/domain` | `packages/ds/organisms/IssueItem/__tests__/*.test.tsx` | `pnpm test` |
| IssueListItem adapter | unit | DIC-08 mapping + Hyperlink openURL + labels omit | `src/presentation/screens/search/__tests__/IssueListItem.test.tsx` | `pnpm test` |
| RepoDetailsScreen | unit | DIC-01..03: hero, three iconed metrics, description omit, CTA/testIDs, no RepoDetails organism | `src/presentation/screens/search/__tests__/RepoDetailsScreen.test.tsx` | `pnpm test` |
| ConfigScreen | unit | DIC-09 + edges: theme toggle, source RO label, token placeholder, no toggle/DataSourceLogo/SecureStore | `src/presentation/screens/__tests__/ConfigScreen.test.tsx` | `pnpm test` |
| Stories / barrels | none | AD-012 files + exports; isolation still green | — | `pnpm lint` / isolation suite in `pnpm test` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After each unit-test task | `pnpm test -- <path(s) touched>` (or full `pnpm test` if path filter unreliable) |
| Full | After Phase 3 / feature end | `pnpm test` |
| Build | After feature completion | `pnpm test` && `pnpm lint` |

---

## Execution Plan

Phases run sequentially. **6 tasks total → single Execute batch (≤8)** — no sub-agent packing required unless user prefers otherwise.

### Phase 1: Data contract

```
T1
```

### Phase 2: Design System

```
T2 → T3
```

### Phase 3: Presentation adoption

```
T4 → T5 → T6
```

---

## Task Breakdown

### T1: Enrich Issue domain + GitHub/GitLab ACL + Fake/fixtures

**What**: Add `state`, `comments`, `updatedAt` to `Issue`; extend both DTOs/mappers; filter GitHub PRs in `listIssues`; update MSW fixtures, Fake seeds, and all Issue test literals so the suite compiles green.
**Where**: `src/domain/entities/issue.ts`, `src/infrastructure/github/**`, `src/infrastructure/gitlab/**`, `src/infrastructure/repositories/in-memory-repo-repository.ts` (seeds via callers), `src/test/msw/fixtures/**/issues.json`, any `__tests__` constructing `Issue`
**Depends on**: None
**Reuses**: Existing mapper helpers, Fake factory, mapper test style
**Requirement**: DIC-04, DIC-05, DIC-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `Issue` includes `state: 'open' | 'closed'`, `comments: number`, `updatedAt: string`
- [x] GitHub mapper maps `state` / `comments` / `updated_at`; GitLab maps `opened`→`open`, `user_notes_count`, `updated_at`
- [x] GitHub `listIssues` excludes DTOs with `pull_request`
- [x] Fixtures + Fake/test Issue objects include new fields
- [x] Gate: `pnpm test -- src/infrastructure/github src/infrastructure/gitlab src/domain` (and any updated fixture consumers) passes
- [x] Test count: mapper + repo tests updated; no silent deletions

**Tests**: unit
**Gate**: quick
**Commit**: `feat(domain): enrich Issue with state, comments, and updatedAt` (`1c7c7ee`)

---

### T2: SettingsRow molecule

**What**: Create AD-012 `SettingsRow` molecule (icon, title, subtitle, trailing, optional onPress) with stories + unit tests; export from molecules barrel.
**Where**: `packages/ds/molecules/SettingsRow/**`, `packages/ds/molecules/index.ts`
**Depends on**: T1 (none functionally — ordered after data for phase clarity; **Depends on: None** for start-anytime, but Execute order is T1→T2)
**Reuses**: Icon, Typography, Container/spacing tokens, AD-012 peers (`InputField`, `Header`)
**Requirement**: DIC-10

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`, `frontend-design` (chrome restraint within tokens)

**Done when**:

- [x] Folder AD-012 complete (`index.ts`, component, styles, stories, `__tests__`)
- [x] Renders icon + title + optional subtitle + trailing
- [x] `onPress` → Pressable/`accessibilityRole="button"`; without `onPress` → static
- [x] Exported from `@ds/molecules`
- [x] Gate: `pnpm test -- packages/ds/molecules/SettingsRow` passes
- [x] Isolation: no `@/` imports

**Tests**: unit
**Gate**: quick
**Commit**: `feat(ds): add SettingsRow molecule` (`8773b86`)

**Note on Depends on**: Listed as **T1** in execution order only so Phase 1 finishes first; SettingsRow has **no code dependency** on T1. Diagram uses T1 → T2 for phase sequencing.

---

### T3: IssueItem organism

**What**: Create AD-012 `IssueItem` organism mirroring RepoItem (Hyperlink title, #number, state Badge Aberta/Fechada, labels, author, relative updatedAt, divider, comments footer); stories + unit tests; export from organisms barrel.
**Where**: `packages/ds/organisms/IssueItem/**`, `packages/ds/organisms/index.ts`
**Depends on**: T2 (none code-wise; Execute after T2). Soft: can start after T1 for types inspiration but props are primitives — **Depends on: None** code; sequence **T2 → T3**
**Reuses**: RepoItem layout/styles pattern (copy Stat locally), Card, Hyperlink, Badge, Avatar, Divider, Icon, `formatRelativeDate`
**Requirement**: DIC-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`, `frontend-design`

**Done when**:

- [x] AD-012 folder + barrel export
- [x] Props match design (primitives only; `now?` for dates)
- [x] Empty labels omit badge row; comments `0` still shown
- [x] Relative date from `updatedAt` via `formatRelativeDate`
- [x] Gate: `pnpm test -- packages/ds/organisms/IssueItem packages/ds/__tests__/isolation` passes
- [x] No `@/domain` / Zustand imports

**Tests**: unit
**Gate**: quick
**Commit**: `feat(ds): add IssueItem organism` (`e00061f`)

---

### T4: IssueListItem adapter + Issues list adoption

**What**: Thin `IssueListItem` to map `Issue` → `IssueItem`; update adapter/screen tests for new fields and `updatedAt` relative date.
**Where**: `src/presentation/screens/search/IssueListItem.tsx`, `src/presentation/screens/search/__tests__/IssueListItem.test.tsx`, `src/presentation/screens/search/__tests__/RepoIssuesScreen.test.tsx` (only if Issue fixtures need fields)
**Depends on**: T1, T3
**Reuses**: Design mapping table; existing Hyperlink behavior via IssueItem
**Requirement**: DIC-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] No Card/Badge layout invented in adapter — only prop mapping
- [x] Tests assert `#number`/state/comments/`updatedAt` relative + openURL
- [x] `RepoIssuesScreen` still uses FlatList + IssueListItem
- [x] Gate: `pnpm test -- src/presentation/screens/search/__tests__/IssueListItem.test.tsx src/presentation/screens/search/__tests__/RepoIssuesScreen.test.tsx` passes

**Tests**: unit
**Gate**: quick
**Commit**: `refactor(presentation): adapt IssueListItem to IssueItem`

---

### T5: RepoDetailsScreen hero + iconed metrics

**What**: Restyle details hero (avatar lg, owner, fullName) and metrics row with `star` / `git-network` / `eye-outline`; omit whitespace description; keep CTA/Hyperlink/loading/error testIDs; assert no `packages/ds/organisms/RepoDetails`.
**Where**: `src/presentation/screens/search/RepoDetailsScreen.tsx`, `src/presentation/screens/search/__tests__/RepoDetailsScreen.test.tsx`
**Depends on**: T1 (types already green; UI-only — **Depends on: T1** for stable Fake data in tests)
**Reuses**: Avatar, Icon, Typography, Container, Hyperlink, Button, StackBackHeader
**Requirement**: DIC-01, DIC-02, DIC-03

**Tools**:

- MCP: NONE (optional Maestro inspect later — out of scope)
- Skill: `tlc-spec-driven`, `frontend-design`

**Done when**:

- [ ] Three iconed metrics with a11y labels
- [ ] Description omitted when empty/whitespace
- [ ] Existing error/retry/loading preserved
- [ ] Source inspection: no RepoDetails organism path
- [ ] Gate: `pnpm test -- src/presentation/screens/search/__tests__/RepoDetailsScreen.test.tsx` passes

**Tests**: unit
**Gate**: quick
**Commit**: `feat(presentation): restyle RepoDetails hero and metrics`

---

### T6: ConfigScreen settings rows

**What**: Rebuild Config with three `SettingsRow`s — theme (toggle), active source read-only (`GitHub`/`GitLab`), token placeholder; no source toggle / DataSourceLogo / SecureStore form.
**Where**: `src/presentation/screens/ConfigScreen.tsx`, `src/presentation/screens/__tests__/ConfigScreen.test.tsx`
**Depends on**: T2
**Reuses**: SettingsRow, session store `mode`/`toggleMode`/`dataSource`, Header
**Requirement**: DIC-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`, `frontend-design`

**Done when**:

- [ ] Three rows with icon + title + subtitle
- [ ] Theme trailing toggles and persists
- [ ] Source shows GitHub/GitLab from store; no toggle control
- [ ] Token placeholder “Em breve”; no TextInput/SecureStore/setToken
- [ ] Gate: `pnpm test -- src/presentation/screens/__tests__/ConfigScreen.test.tsx` passes
- [ ] Full gate after this task: `pnpm test` && `pnpm lint`

**Tests**: unit
**Gate**: full
**Commit**: `feat(presentation): redesign Config as settings rows`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1
Phase 2:  T2 ──→ T3
Phase 3:  T4 ──→ T5 ──→ T6
```

Extra edges from task bodies:

- T4 depends on T1 and T3
- T5 depends on T1
- T6 depends on T2

```
T1 ──→ T2 ──→ T3 ──→ T4 ──→ T5 ──→ T6
 │              │      │
 │              └──────┴── T4 also needs T1
 └──────────────────────── T5
 T2 ─────────────────────── T6
```

Simplified sequential Execute order (satisfies all deps):

```
T1 → T2 → T3 → T4 → T5 → T6
```

(T5 could run parallel to T4 after T1, but protocol is sequential — keep T4 before T5.)

Execution is strictly sequential. **6 tasks → one inline batch** (no sub-agent offer required).

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Issue domain + both ACLs + fixtures | Multi-file one data contract (cannot split without red CI) | ✅ Cohesive fat task |
| T2: SettingsRow | 1 molecule | ✅ Granular |
| T3: IssueItem | 1 organism | ✅ Granular |
| T4: IssueListItem adapter | 1 adapter + tests | ✅ Granular |
| T5: RepoDetailsScreen | 1 screen restyle | ✅ Granular |
| T6: ConfigScreen | 1 screen redesign | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows (sequential) | Status |
| ---- | ---------------------- | -------------------------- | ------ |
| T1 | None | (start) | ✅ Match |
| T2 | None (phase after T1) | T1 → T2 | ✅ Match (phase order; no code dep) |
| T3 | None (phase after T2) | T2 → T3 | ✅ Match (phase order) |
| T4 | T1, T3 | T3 → T4 and T1 available | ✅ Match |
| T5 | T1 | After T4 in sequence; T1 done | ✅ Match |
| T6 | T2 | After T5; T2 done | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Domain + ACL + Fake | unit | unit | ✅ OK |
| T2 | SettingsRow molecule | unit | unit | ✅ OK |
| T3 | IssueItem organism | unit | unit | ✅ OK |
| T4 | IssueListItem adapter (+ Issues tests) | unit | unit | ✅ OK |
| T5 | RepoDetailsScreen | unit | unit | ✅ OK |
| T6 | ConfigScreen | unit | unit | ✅ OK |

---

## Requirement Traceability (tasks)

| Requirement ID | Task(s) | Status |
| -------------- | ------- | ------ |
| DIC-01 | T5 | Pending |
| DIC-02 | T5 | Pending |
| DIC-03 | T5 | Pending |
| DIC-04 | T1 | Done (`1c7c7ee`) |
| DIC-05 | T1 | Done (`1c7c7ee`) |
| DIC-06 | T1 | Done (`1c7c7ee`) |
| DIC-07 | T3 | Done (`e00061f`) |
| DIC-08 | T4 | Done |
| DIC-09 | T6 | Pending |
| DIC-10 | T2 | Done (`8773b86`) |

**Coverage:** 10 total, 10 mapped to tasks, 0 unmapped
