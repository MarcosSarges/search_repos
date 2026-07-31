# Design System Conventions — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement with the `tlc-spec-driven` skill Execute flow. One atomic commit per task. Gate before commit. Tests from spec ACs.

**If the skill cannot be activated, STOP and tell the user.**

---

**Design**: `.specs/features/ds-conventions/design.md`  
**Status**: Complete (T1–T10; T9 N/A — Text already migrated in design-system scaffold)

---

## Test Coverage Matrix

> Guidelines: `AGENTS.md`, `README.md` (Jest + RNTL for DS), `jest.config.ts`. AD-012..014.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Typography tokens / theme.typography | unit | Variants expose fontFamily, fontWeight, lineHeight; theme wires them | `src/components/ds/tokens/__tests__/*` or `theme/__tests__/*` | `pnpm test` |
| Typography atom | unit | Applies token fontFamily/weight/lineHeight; tone map; no public style; primary flip preserved | `atoms/Typography/__tests__/*.test.tsx` | `pnpm test` |
| Icon / Spacer / Loading / Container / Header / DataSourceLogo | unit | Existing ACs still pass after styles migration; logo asset matrix unchanged | colocated `__tests__` | `pnpm test` |
| Module shape / README | none | — (structure + docs; lint) | — | `pnpm lint` |

## Gate Check Commands

| Gate Level | When | Command |
| ---------- | ---- | ------- |
| Quick | After unit-test tasks | `pnpm test` |
| Full / Build | After structure/docs or phase end | `pnpm test` && `pnpm lint` |

---

## Execution Plan

### Phase 1: Tokens + Typography

```
T1 → T2
```

### Phase 2: Remaining atoms

```
T3 → T4 → T5
```

### Phase 3: Molecules + organism

```
T6 → T7 → T8
```

### Phase 4: Cleanup + docs

```
T9 → T10
```

---

## Task Breakdown

### T1: Typography tokens + theme wire

**What**: Add `tokens/typography.ts` with per-variant `fontFamily`, `fontWeight`, `lineHeight` (system family); export from barrel; expose on `AppTheme` via `getTheme`.  
**Where**: `src/components/ds/tokens/typography.ts`, `tokens/index.ts`, `theme/theme.ts`, `theme/styled.d.ts` if needed  
**Depends on**: None  
**Requirement**: DSC-03

**Done when**:
- [ ] Variants `body` | `label` | `caption` | `heading` each have the three fields
- [ ] `getTheme().typography` exposes the map
- [ ] Unit tests assert token shape / theme wiring
- [ ] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(ds): add typography tokens to theme`

---

### T2: Typography atom — styles.tsx + object maps

**What**: Split Typography into composition + `styles.tsx`; tone/variant via object maps; consume typography tokens; update tests for fontFamily/weight/lineHeight.  
**Where**: `atoms/Typography/`  
**Depends on**: T1  
**Requirement**: DSC-01, DSC-02, DSC-03

**Done when**:
- [ ] Folder has `styles.tsx`; no `styled(` in `Typography.tsx`
- [ ] No tone/variant `switch` for style resolution
- [ ] Tests assert token-driven fontFamily, fontWeight, lineHeight
- [ ] Public API still no `style`
- [ ] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): align Typography with styles and token maps`

---

### T3: Icon — styles.tsx + tone map

**What**: Migrate Icon to `styles.tsx` + tone object map; keep size tokens; no public `style`.  
**Where**: `atoms/Icon/`  
**Depends on**: None (after T2 preferred for pattern)  
**Requirement**: DSC-01, DSC-02, DSC-04

**Done when**:
- [ ] `styles.tsx` present; composition clean
- [ ] Tone via object map
- [ ] Existing Icon tests pass (update if needed)
- [ ] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): migrate Icon to styles and tone map`

---

### T4: Spacer — styles.tsx + edge map

**What**: Migrate Spacer chrome to styled; edge→dimension via map; keep exclusive-edge API.  
**Where**: `atoms/Spacer/`  
**Depends on**: None  
**Requirement**: DSC-01, DSC-02, DSC-04

**Done when**:
- [ ] No chrome `style={{` in `Spacer.tsx`
- [ ] `styles.tsx` + map
- [ ] Tests pass
- [ ] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): migrate Spacer to styled edge map`

---

### T5: Loading — styles.tsx + size map

**What**: Wrap ActivityIndicator with styled; primary from theme; size via object map.  
**Where**: `atoms/Loading/`  
**Depends on**: None  
**Requirement**: DSC-01, DSC-02, DSC-04

**Done when**:
- [ ] `styles.tsx`; color from theme primary
- [ ] Size map not if/else chain for indicator size (object map)
- [ ] Tests pass
- [ ] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): migrate Loading to styled size map`

---

### T6: Container — styles.tsx

**What**: Migrate Container padding/tone/flex to styled props.  
**Where**: `molecules/Container/`  
**Depends on**: None  
**Requirement**: DSC-01, DSC-04

**Done when**:
- [ ] No chrome style object in composition
- [ ] Tests pass
- [ ] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): migrate Container to styles.tsx`

---

### T7: Header — styles.tsx

**What**: Migrate Header layout chrome to `styles.tsx`; keep Typography + DataSourceLogo.  
**Where**: `molecules/Header/`  
**Depends on**: T2 (Typography stable)  
**Requirement**: DSC-01, DSC-04

**Done when**:
- [ ] No chrome style object in `Header.tsx`
- [ ] No brand SVG imports
- [ ] Tests pass
- [ ] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): migrate Header to styles.tsx`

---

### T8: DataSourceLogo — asset map + styles

**What**: Replace asset `switch` with object map; add `styles.tsx` if size wrapper needed; preserve selection matrix.  
**Where**: `organisms/DataSourceLogo/`  
**Depends on**: None  
**Requirement**: DSC-01, DSC-02, DSC-04

**Done when**:
- [ ] No asset `switch`/`case`
- [ ] Module shape includes `styles.tsx`
- [ ] Selection matrix tests pass
- [ ] Gate: `pnpm test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `refactor(ds): migrate DataSourceLogo to asset map`

---

### T9: Remove legacy Text dual source

**What**: Delete or thin-re-export `components/Text*` → Typography; fix any imports.  
**Where**: `src/components/ds/components/`, barrels  
**Depends on**: T2  
**Requirement**: DSC-04

**Done when**:
- [ ] Single typography source of truth
- [ ] Gate: `pnpm test` && `pnpm lint`

**Tests**: none (compile/import)  
**Gate**: full  
**Commit**: `refactor(ds): remove legacy Text dual source`

---

### T10: README document component file shape

**What**: Document per-component files + styles-only rule under Design System section.  
**Where**: `README.md`  
**Depends on**: T3–T8 (shape exists)  
**Requirement**: DSC-05

**Done when**:
- [ ] README lists `index`, `Name.tsx`, stories, `styles.tsx`
- [ ] Gate: `pnpm test` && `pnpm lint`

**Tests**: none  
**Gate**: build  
**Commit**: `docs(ds): document component module file shape`

---

## Phase Execution Map

```
Phase 1: T1 → T2
Phase 2: T3 → T4 → T5
Phase 3: T6 → T7 → T8
Phase 4: T9 → T10
```

**Batch packing (Execute):** 10 tasks → 2 batches  
- Batch 1: Phases 1–2 (T1–T5, 5 tasks)  
- Batch 2: Phases 3–4 (T6–T10, 5 tasks)  

Offer sub-agents at Execute (> ~8 tasks).

---

## Requirement Traceability (tasks)

| ID | Tasks |
| -- | ----- |
| DSC-01 | T2–T8 |
| DSC-02 | T2–T5, T8 |
| DSC-03 | T1, T2 |
| DSC-04 | T3–T9 |
| DSC-05 | T10 |
