# DS RepoItem Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/ds-repo-item/design.md`  
**Status**: Done — Verifier PASS (2026-08-03)

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines: `AGENTS.md` → AD-006 (Jest+RNTL), AD-012, `package.json` (`pnpm test`, `pnpm lint`), DS colocated tests, `RepoListItem` / `SearchReposScreen` / `RepoIssuesScreen` tests.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| `toTitleCase` util | unit | Capitalize edges; barrel export | `packages/ds/utils/__tests__/to-title-case.test.ts` | `pnpm test` |
| Divider atom | unit | 1:1 RITEM-01/02 + orientations + `testID` | `packages/ds/atoms/Divider/__tests__/*.test.tsx` | `pnpm test` |
| RepoItem organism | unit | 1:1 RITEM-03–08 + edges; no `@/domain` | `packages/ds/organisms/RepoItem/__tests__/*.test.tsx` | `pnpm test` |
| FlatList molecule | unit | 1:1 RITEM-11 (content padding not root; Spacer default; `separator={false}`; perf defaults; override wins; style merge) | `packages/ds/molecules/FlatList/__tests__/*.test.tsx` | `pnpm test` |
| RepoListItem adapter | unit | Mapping + press + optionals | `src/presentation/screens/search/__tests__/RepoListItem.test.tsx` | `pnpm test` |
| Search + Issues screens | unit | Lists use DS FlatList; no double pad; existing list behaviors (endReached, refresh testIDs) | `**/SearchReposScreen.test.tsx`, `**/RepoIssuesScreen.test.tsx` | `pnpm test` |
| Stories / barrels | none | Structure + exports; lint | — | `pnpm lint` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After unit-test tasks | `pnpm test` |
| Full / Build | After Phase 4 / feature end | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Foundation

```
T1 → T2
```

### Phase 2: RepoItem + adapter

```
T3 → T4
```

### Phase 3: FlatList molecule

```
T5
```

### Phase 4: Screens adopt FlatList

```
T6
```

---

## Task Breakdown

### T1: `toTitleCase` util

**What**: Add `toTitleCase` in DS utils, export from barrel, unit tests for Capitalize edges.  
**Where**: `packages/ds/utils/to-title-case.ts`, `packages/ds/utils/index.ts`, `packages/ds/utils/__tests__/to-title-case.test.ts`  
**Depends on**: None  
**Reuses**: `format-relative-date` util + test/export pattern  
**Requirement**: RITEM-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `toTitleCase('react native')` → `'React Native'`; single token; empty/whitespace → `''`
- [x] Exported from utils barrel
- [x] Gate: `pnpm test`
- [x] Test count: ≥3 tests pass (no silent deletions)

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add toTitleCase util for display labels`  
**Status**: Done (`7be1411`)

---

### T2: Divider atom

**What**: Ship `atoms/Divider` H/V, stories, unit tests, barrel export.  
**Where**: `packages/ds/atoms/Divider/` + `packages/ds/atoms/index.ts`  
**Depends on**: T1  
**Reuses**: AD-012 atom pattern; `theme.colors.border`; AD-013 maps  
**Requirement**: RITEM-01, RITEM-02, RITEM-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Horizontal/vertical chrome via object map; `testID="ds-divider"`
- [x] Stories + atoms barrel export
- [x] Gate: `pnpm test`
- [x] Test count: ≥2 orientation tests pass

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add Divider atom with horizontal and vertical orientations`  
**Status**: Done (`a56057f`)

---

### T3: RepoItem organism

**What**: Ship presentational `RepoItem` per design (Card + Capitalize + optional description + badges/avatar + Divider + stars/conditional forks), stories, tests, organisms barrel.  
**Where**: `packages/ds/organisms/RepoItem/` + `packages/ds/organisms/index.ts`  
**Depends on**: T1, T2  
**Reuses**: Card, Typography, Badge, Avatar, Icon, Divider, `toTitleCase`  
**Requirement**: RITEM-03 … RITEM-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Props primitivas; forks condicional; isolation OK
- [x] Stories: full / no description / empty languages / no avatar uri
- [x] Gate: `pnpm test`
- [x] Test count: ≥6 AC/edge tests pass

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add RepoItem organism card`  
**Status**: Done (`f3b5de9`)

---

### T4: RepoListItem adapter

**What**: `RepoListItem` compõe `RepoItem`; map `Repo` → props; keep Pressable; update tests.  
**Where**: `src/presentation/screens/search/RepoListItem.tsx`, `__tests__/RepoListItem.test.tsx`  
**Depends on**: T3  
**Reuses**: Pressable a11y/`testID`  
**Requirement**: RITEM-10

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Maps name/description/languages/owner/stars/forks; no Card layout local
- [x] Tests green (Capitalize, Badge, stats, press)
- [x] Gate: `pnpm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(search): render repo rows with RepoItem organism`  
**Status**: Done (`78e80f8`)

---

### T5: FlatList molecule

**What**: Ship `molecules/FlatList` with content-only spacing, default Spacer separator, perf defaults, prop forwarding, stories, unit tests, molecules barrel.  
**Where**: `packages/ds/molecules/FlatList/` + `packages/ds/molecules/index.ts`  
**Depends on**: None  
**Reuses**: `resolveBoxSpacing`, Spacer, RN FlatList  
**Requirement**: RITEM-11, RITEM-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Spacing props → `contentContainerStyle` only; default `px="md"`; root `style` sem padding
- [x] Default Separator = Spacer top `lg`; `separator={false}` / custom `ItemSeparatorComponent` override
- [x] Perf defaults applied; consumer overrides win; other RN props forwarded; contentContainerStyle merge
- [x] Stories + molecules barrel
- [x] Gate: `pnpm test`
- [x] Test count: ≥5 tests covering padding host, separator, perf defaults/override (no silent deletions)

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add FlatList molecule with content padding and defaults`  
**Status**: Done (`790adbd`)

---

### T6: Search + Issues adopt FlatList

**What**: Migrate `SearchReposScreen` and `RepoIssuesScreen` to DS FlatList; remove double padding and redundant separator/perf props; update screen tests.  
**Where**: `SearchReposScreen.tsx`, `RepoIssuesScreen.tsx`, respective `__tests__`  
**Depends on**: T5  
**Reuses**: Existing list wiring (onEndReached, refreshControl, testIDs)  
**Requirement**: RITEM-12

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Neither screen imports RN `FlatList` for the product lists
- [x] No duplicate horizontal padding on parent Container + list content
- [x] Screen tests pass (list testIDs, endReached, etc.)
- [x] Gate: `pnpm test` && `pnpm lint`
- [x] Test count: Search + Issues suites green (no silent deletions)

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(search): use DS FlatList on Search and Issues screens`  
**Status**: Done (`ca48e62`)

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2
Phase 2:  T3 ──→ T4
Phase 3:  T5
Phase 4:  T6
```

**6 tasks → single batch (≤ ~8)** — Execute inline.

T5 has no code dependency on T4; phases still run in order so RepoItem lands before list migration polish.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: toTitleCase | 1 util | ✅ |
| T2: Divider | 1 atom | ✅ |
| T3: RepoItem | 1 organism | ✅ |
| T4: RepoListItem | 1 adapter | ✅ |
| T5: FlatList | 1 molecule | ✅ |
| T6: Search + Issues migrate | 2 screens, same change | ⚠️ cohesive — same molecule adoption; OK if Done when covers both |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | root | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T1, T2 | after Phase 1 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | None | Phase 3 root | ✅ |
| T6 | T5 | T5 → T6 | ✅ |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| ---- | ---------- | --------------- | --------- | ------ |
| T1 | util | unit | unit | ✅ |
| T2 | Divider | unit | unit | ✅ |
| T3 | RepoItem | unit | unit | ✅ |
| T4 | RepoListItem | unit | unit | ✅ |
| T5 | FlatList | unit | unit | ✅ |
| T6 | Search + Issues screens | unit | unit | ✅ |

---

## Requirement Traceability (tasks)

| Requirement ID | Tasks |
| -------------- | ----- |
| RITEM-01 | T2 |
| RITEM-02 | T2 |
| RITEM-03 | T1, T3 |
| RITEM-04 | T3 |
| RITEM-05 | T3 |
| RITEM-06 | T3 |
| RITEM-07 | T3 |
| RITEM-08 | T3 |
| RITEM-09 | T2, T3, T5 |
| RITEM-10 | T4 |
| RITEM-11 | T5 |
| RITEM-12 | T6 |

**Coverage:** 12 total, 12 mapped, 0 unmapped
