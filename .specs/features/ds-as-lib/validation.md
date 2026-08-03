# ds-as-lib Validation

**Date**: 2026-08-03
**Spec**: `.specs/features/ds-as-lib/spec.md`
**Diff range**: `9c98fa4..bed8b99` (HEAD `bed8b99b45b083c319fc22f6eb98bdbcd1809a2d`)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | `@ds` aliases + Storybook glob |
| T2 | ✅ Done | Tree under `packages/ds` |
| T3 | ✅ Done | Consumers on `@ds` (Storybook preview exception — see gaps) |
| T4 | ✅ Done | `Brand` + `getTheme` |
| T5 | ✅ Done | `DsThemeProvider` |
| T6 | ✅ Done | Presentation bridge |
| T7 | ✅ Done | `DataSourceLogo` brand API |
| T8 | ✅ Done | `resolveBoxSpacing` |
| T9 | ✅ Done | Container layout box |
| T10 | ✅ Done | `KeyboardAvoid` (composition unit test missing) |
| T11 | ✅ Done | Search list region uses `Container` (test does not discriminate host) |
| T12 | ⚠️ Partial | README updated; isolation test present; **build lint gate fails** |

---

## Spec-Anchored Acceptance Criteria

### P1: Extrair DS + alias (DSLIB-01..03)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN tree inspected THEN DS lives under `packages/ds` and NOT `src/components/ds` | `src/components/ds` absent | `packages/ds/__tests__/isolation.test.ts:83` — `expect(fs.existsSync(...'src/components/ds')).toBe(false)` | ✅ PASS |
| WHEN TS aliases configured THEN `@ds`/`@ds/*` resolve; app imports via alias | App/Jest import `@ds`; paths map to `packages/ds` | `src/presentation/theme/__tests__/AppThemeProvider.test.tsx:7` — `import { useTheme } from '@ds/theme'` (suite green); structural `tsconfig.json:8-9` | ✅ PASS |
| WHEN `packages/ds` analyzed THEN no `@/application|stores|presentation|domain|…` imports | `violations === []` | `packages/ds/__tests__/isolation.test.ts:79` — `expect(violations).toEqual([])` | ✅ PASS |
| WHEN brand SVGs resolved THEN under lib; only logo organism imports them | Assets under `packages/ds/assets/...`; logo imports them | `packages/ds/organisms/DataSourceLogo/__tests__/DataSourceLogo.test.tsx:63-74` — `expect(source).toContain(".../assets/github/...")` | ⚠️ Spec-precision gap — logo import path asserted; **exclusivity** (“only organism”) has no assertion |
| WHEN Storybook, Jest, app entry import DS THEN use `@ds` successfully | All three use `@ds` / `@ds/...` | Jest/app: PASS via `@ds` imports. Storybook: `.rnstorybook/preview.tsx:4` — `from '../packages/ds'` (relative, not `@ds`) | ❌ GAP |

### P1: Theme bridge + Brand (DSLIB-04..06)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN `getTheme(mode, brand)` THEN `colors.primary` matches brand×mode; identity uses `brand` | github/gitlab × light/dark hexes; `theme.brand` set | `packages/ds/theme/__tests__/getTheme.test.ts:9` — `toBe('#0FBF3E')`; `:12` `#5FED83`; `:17` `#FC6D26`; `:21` `#FCA326`; `:34` `theme.brand` | ✅ PASS |
| WHEN lib provider mounts with `theme` prop THEN consumers receive that object | Injected dark/gitlab primary `#FCA326`, brand `gitlab` | `packages/ds/theme/__tests__/DsThemeProvider.test.tsx:33-34` — `toBe('#FCA326')` / `toBe('gitlab')` | ✅ PASS |
| WHEN app boots product UI THEN presentation bridge maps DataSource→Brand, `getTheme`, wraps `DsThemeProvider` | Bridge uses store + map + `DsThemeProvider`; primary updates with dataSource | `src/presentation/theme/__tests__/AppThemeProvider.test.tsx:118-119` — `toMatch(/mapDataSourceToBrand|DsThemeProvider/)`; `:63` `primary` → `#FC6D26`; `map-data-source-to-brand.test.ts:5-9` | ✅ PASS |
| WHEN hydrate/splash/SecureStore hydrate runs THEN outside `packages/ds` | Provider source has no Zustand/SecureStore; session-gate in presentation | `DsThemeProvider.test.tsx:40` — `not.toMatch(/zustand|SecureStore/i)`; `session-gate.test.tsx:66` — `expect(hydrate).toHaveBeenCalledTimes(1)` | ✅ PASS |
| WHEN `DataSourceLogo` rendered THEN accepts `brand`; no `@/application` | `brand?:`; no application import | `DataSourceLogo.test.tsx:81-83` — `not.toMatch(/@\/application|…/)` / `toMatch(/brand\?:/)` | ✅ PASS |

### P1: Container layout box (DSLIB-07..10)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN spacing shorthands with Spacing tokens THEN theme.spacing on correct edges (+ gap) | Token px on edges; gap mapped | `resolveBoxSpacing.test.ts:9-12` — padding edges `spacing.md`; `:79` `gap` → `spacing.lg`; `Container.test.tsx:24-27` | ✅ PASS |
| WHEN shorthand omitted THEN no invented padding/margin (baseline 0) | All edges/gap `0` | `resolveBoxSpacing.test.ts:63-73` — `expect(result).toEqual({…:0})` | ✅ PASS |
| WHEN flex/direction/justify/align/wrap set THEN apply without boolean flex flag | `flexGrow/Shrink/Basis`, row, space-between, center, wrap | `Container.test.tsx:52-57` — `toHaveStyle` / `toHaveStyleRule` | ✅ PASS |
| WHEN `safe` is `true` THEN insets all edges via safe-area-context | Additive: token + inset on all edges | `Container.test.tsx:113-116` — `spacing.md + 47/34/11/13` (conjunction) | ✅ PASS |
| WHEN `safe` is edge array THEN only those edges | Only listed edges get insets | `Container.test.tsx:129-132` — bottom `sm+34`; other edges `sm` only | ✅ PASS |
| WHEN `safe` omitted/false THEN no safe-area padding | Padding equals token only | `Container.test.tsx:99-100` — `padding-top/bottom` = `spacing.md` (omit covered; explicit `false` not asserted) | ✅ PASS (omit); ⚠️ `false` not explicit |
| WHEN `keyboardDismiss` true THEN press dismisses keyboard | `Keyboard.dismiss` called | `Container.test.tsx:145` — `expect(dismissSpy).toHaveBeenCalled()` | ✅ PASS |
| WHEN `keyboardDismiss` omitted/false THEN no dismiss behavior | `Keyboard.dismiss` not called | `Container.test.tsx:160` — `not.toHaveBeenCalled()` | ✅ PASS |
| WHEN public Container props inspected THEN no free-form `style` | `'style' extends keyof ContainerProps` is false | `Container.test.tsx:167-168` — `expect(hasStyle).toBe(false)` | ✅ PASS |
| WHEN spacing typed THEN only Spacing keys (not raw `number`) | Type rejects raw number | — no type-level assertion | ❌ GAP |

### P1: KeyboardAvoid (DSLIB-11)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN rendered THEN keyboard-avoiding host; platform-aware defaults | Mounts; ios=`padding`, android=`height` | `KeyboardAvoid.test.tsx:23` — `getByTestId('ds-keyboard-avoid')`; `:34-37` behavior map | ✅ PASS |
| WHEN optional `offset` provided THEN applied to host | `$offset={offset}` / `keyboardVerticalOffset: $offset` | `KeyboardAvoid.test.tsx:29-30` — `toMatch(/\$offset=\{offset\}/)` etc. | ✅ PASS |
| WHEN composes with Container THEN nested Avoid>Container works without combined component | Unit mount nested composition | — no unit test (story only; matrix: stories ≠ test substitute) | ❌ GAP |
| WHEN public API inspected THEN avoiding NOT required prop on Container | Container source has no `keyboardAvoid` / `KeyboardAvoid` | `KeyboardAvoid.test.tsx:57-58` — `not.toMatch(/keyboardAvoid\?:|KeyboardAvoid/)` | ✅ PASS |

### P2: Migrate consumers + View drop-in (DSLIB-12..14)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN app/screens/helpers/Storybook preview import THEN `@ds` paths only | No non-`@ds` DS imports in those surfaces | Isolation clears `@/components/ds` (`isolation.test.ts:104`). Preview uses `../packages/ds` | ❌ GAP (Storybook preview) |
| WHEN `src/components/ds` checked THEN does not exist | Directory absent | `isolation.test.ts:83` — `toBe(false)` | ✅ PASS |
| WHEN trivial layout-only View replaceable THEN replaced by Container (search list region) | List region is `Container`; `testID` preserved | Implementation: `SearchReposScreen.tsx:119`. Test: `SearchReposScreen.test.tsx:76` only `getByTestId('search-repos-list-region')` — **does not assert Container vs View** | ❌ GAP |
| WHEN host not layout View (FlatList/Pressable/…) THEN MAY remain RN primitive | FlatList/RefreshControl remain | Structural: `SearchReposScreen.tsx` still imports/uses `FlatList`/`RefreshControl` (soft MAY) | ✅ PASS |
| WHEN README describes DS location THEN `packages/ds`, `@ds`, presentation bridge | Docs mention those three | README content present (`README.md:141-151`) but **no automated assertion** | ❌ GAP |

### Edge cases

| Criterion | Spec-defined outcome | Evidence | Result |
| --------- | -------------------- | -------- | ------ |
| Conflicting shorthands (`p`+`pt`) | Specific overrides shorthand | `resolveBoxSpacing.test.ts:18` — `paddingTop`=`spacing.xl` | ✅ PASS |
| `safe` overlaps Header top | Consumers choose edges; no auto-dedupe | Documented assumption; no auto-dedupe code required | ⚠️ Spec-precision / docs-only |
| `keyboardDismiss` with TextInput | Tap on TextInput still focuses; dismiss only non-input | — no test | ❌ GAP |
| KeyboardAvoid Android vs iOS defaults | Explicit platform map | `KeyboardAvoid.test.tsx:34-35` | ✅ PASS |
| Brand vs DataSource naming | Mapping stays in bridge only | `map-data-source-to-brand.test.ts` + isolation on `packages/ds` | ✅ PASS |

**Status**: ❌ Gaps present (also ⚠️ exclusivity / `safe:false` / Header-overlap docs)

**Story ACs matched with spec-anchored evidence**: **22 / 29** (7 gaps)  
**Edge cases covered**: **3 / 5** applicable (+1 docs-only ⚠️)

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `packages/ds/molecules/Container/resolveBoxSpacing.ts:61-66` | Precedence fault: ignore edge-specific overrides (`top: y ?? base` only) | ✅ Killed — `resolveBoxSpacing.test.ts` failed (e.g. `paddingTop`/`marginTop` expected xl) |
| 2 | `packages/ds/tokens/brand-primary.ts` github.light | Primary hex `#0FBF3E` → `#DEAD00` | ✅ Killed — `getTheme.test.ts:9/25` expected `#0FBF3E` |
| 3 | `packages/ds/molecules/Container/Container.tsx:31-33` | `safe === true` returns empty edge set (no insets) | ✅ Killed — `Container.test.tsx:113` expected `spacing.md+47` got `16` |

**Sensor depth**: lightweight (3 behavior faults)  
**Scratch protocol**: temp-dir backups → mutate → scoped `pnpm test` → restore. Working tree for mutated paths clean after (`git diff` empty).  
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

Not performed — infrastructure / lib-boundary feature; automated checks + sensor sufficient per validate.md.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ (within feature design) |
| Matches patterns | ✅ (AD-012 folder shape, colocated tests) |
| Spec-anchored outcome check | ❌ gaps above |
| Per-layer Coverage Expectation | ⚠️ KeyboardAvoid composition + Spacing type + View host under-tested |
| Every test maps to a spec requirement | ✅ DS feature tests map to DSLIB / edges |
| Documented guidelines followed | ✅ `AGENTS.md` Expo v54; AD-006 Jest+RNTL |

---

## Edge Cases

- [x] Conflicting spacing shorthands — precedence tested
- [x] KeyboardAvoid platform defaults explicit
- [x] Brand↔DataSource mapping confined to bridge
- [ ] `keyboardDismiss` + TextInput focus preserved — **not tested**
- [~] Header/`safe` double inset — documented consumer responsibility only

---

## Gate Check

- **Gate command**: `pnpm test && pnpm lint`
- **Result**: **tests** 377 passed, 0 failed, 0 skipped; **lint** **FAILED** — 7 errors, 10 warnings (exit 1)
- **Lint hotspots (feature-touched)**: `Container.tsx` (prettier/array-type), `KeyboardAvoid.test.tsx`, `KeyboardAvoid.stories.tsx`, `AppThemeProvider.test.tsx`; also `storybook.requires.ts`, `index.ts` import/export, `styled.d.ts`, `src/test/setup.ts`
- **Test count before feature**: N/A exact (base `9c98fa4` had no `packages/ds`); DS/theme test files largely relocated/added under new paths (~+1809 lines in DS/theme `__tests__` vs base)
- **Test count after feature**: 377
- **Delta**: suite green numerically; count not decreased vs prior green runs in this branch
- **Skipped tests**: none
- **Failures**: lint non-zero → **build gate FAIL**

---

## Fix Plans

### Fix 1: Build lint gate

- **Root cause**: Prettier/`@typescript-eslint` errors in Container + KeyboardAvoid (+ other reported files)
- **Fix task**: Run eslint --fix on feature files; clear remaining errors until `pnpm lint` exits 0
- **Priority**: Blocker (gate)

### Fix 2: Storybook preview must import via `@ds`

- **Root cause**: `.rnstorybook/preview.tsx` uses `../packages/ds`
- **Fix task**: Switch to `@ds`; assert in isolation or a small config test if desired
- **Priority**: Major (DSLIB-01/12 AC)

### Fix 3: Spacing type-only assertion

- **Root cause**: No type test that raw `number` is not assignable to spacing props
- **Fix task**: Mirror `HasStyle` pattern — prove `number` not assignable to `p` / `BoxSpacingInput`
- **Priority**: Major (DSLIB-07 AC10)

### Fix 4: KeyboardAvoid > Container composition unit test

- **Root cause**: Spec Independent Test requires nested mount; only story exists
- **Fix task**: RNTL test render `<KeyboardAvoid><Container /></KeyboardAvoid>` and assert both testIDs
- **Priority**: Major (DSLIB-11)

### Fix 5: Discriminating Search list-region host assertion

- **Root cause**: testID-only check survives if host were still `View`
- **Fix task**: Source inspect `SearchReposScreen.tsx` for `Container testID="search-repos-list-region"` (and no layout `View` for that region)
- **Priority**: Major (DSLIB-13)

### Fix 6: README assertion / docs gate

- **Root cause**: DSLIB-14 has no automated check
- **Fix task**: Lightweight test or script asserting README mentions `packages/ds`, `@ds`, presentation theme bridge
- **Priority**: Minor

### Fix 7: keyboardDismiss + TextInput edge

- **Root cause**: Edge case untested
- **Fix task**: Mount Container+Input; press input path does not call dismiss incorrectly (per RN pattern)
- **Priority**: Minor

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| DSLIB-01 | Implementing | ❌ Needs Fix (Storybook `@ds`) |
| DSLIB-02 | Implementing | ✅ Verified |
| DSLIB-03 | Implementing | ⚠️ Partial (exclusivity unasserted) |
| DSLIB-04 | Implementing | ✅ Verified |
| DSLIB-05 | Implementing | ✅ Verified |
| DSLIB-06 | Implementing | ✅ Verified |
| DSLIB-07 | Implementing | ❌ Needs Fix (Spacing type AC) |
| DSLIB-08 | Implementing | ✅ Verified |
| DSLIB-09 | Implementing | ✅ Verified |
| DSLIB-10 | Implementing | ✅ Verified |
| DSLIB-11 | Implementing | ❌ Needs Fix (composition unit) |
| DSLIB-12 | Implementing | ❌ Needs Fix (Storybook preview) |
| DSLIB-13 | Implementing | ❌ Needs Fix (weak host evidence) |
| DSLIB-14 | Implementing | ❌ Needs Fix (no README assertion) |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 22/29 story ACs matched | 7 gaps | 2–3 ⚠️ precision flags  
**Sensor**: 3/3 mutations killed  
**Gate**: 377 tests passed; **lint failed** (7 errors)

**What works**: Lib extraction + isolation, Brand/`getTheme`/`DsThemeProvider`, presentation bridge + hydrate gate, Container spacing/flex/safe/dismiss (strong conjunction on safe additive), KeyboardAvoid defaults/offset, sensor discrimination on precedence/primary/safe.

**Issues found**: Lint gate red; Storybook relative import; missing Spacing type test; missing Avoid>Container unit composition; View→Container not discriminating; README untested; TextInput+dismiss edge untested.

**Next steps**: Fix lint first (blocker), then AC gaps Fix 2–5, optionally Fix 6–7; re-verify.
