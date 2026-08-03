# ds-as-lib Validation

**Date**: 2026-08-03
**Spec**: `.specs/features/ds-as-lib/spec.md`
**Diff range**: `9c98fa4..84a139d` (HEAD `84a139d8b191c510b54ee750dcbae421b29e0074`; includes fix `84a139d`)
**Verifier**: independent sub-agent (author ≠ verifier) — re-validation after fix commit

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | `@ds` aliases + Storybook glob |
| T2 | ✅ Done | Tree under `packages/ds` |
| T3 | ✅ Done | Consumers on `@ds` (preview now `@ds`) |
| T4 | ✅ Done | `Brand` + `getTheme` |
| T5 | ✅ Done | `DsThemeProvider` |
| T6 | ✅ Done | Presentation bridge |
| T7 | ✅ Done | `DataSourceLogo` brand API |
| T8 | ✅ Done | `resolveBoxSpacing` |
| T9 | ✅ Done | Container layout box |
| T10 | ✅ Done | `KeyboardAvoid` + nested Container unit |
| T11 | ✅ Done | Search list region `Container` + host assert |
| T12 | ✅ Done | README + isolation + lint green |

---

## Spec-Anchored Acceptance Criteria

### P1: Extrair DS + alias (DSLIB-01..03)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN tree inspected THEN DS lives under `packages/ds` and NOT `src/components/ds` | `src/components/ds` absent | `packages/ds/__tests__/isolation.test.ts:83` — `expect(fs.existsSync(...'src/components/ds')).toBe(false)` | ✅ PASS |
| WHEN TS aliases configured THEN `@ds`/`@ds/*` resolve; app imports via alias | Paths map to `packages/ds`; app imports `@ds` | Structural `tsconfig.json:8-9`; e.g. `AppThemeProvider.test.tsx` imports `@ds/theme` (suite green) | ✅ PASS |
| WHEN `packages/ds` analyzed THEN no `@/application|stores|presentation|domain|…` imports | `violations === []` | `isolation.test.ts:79` — `expect(violations).toEqual([])` | ✅ PASS |
| WHEN brand SVGs resolved THEN under lib; only logo organism imports them | Assets under `packages/ds/assets/...`; exclusivity | `DataSourceLogo.test.tsx:63-74` — asset import paths; `isolation.test.ts:130-132` — `toEqual(['organisms/DataSourceLogo/styles.tsx'])` | ✅ PASS |
| WHEN Storybook, Jest, app entry import DS THEN use `@ds` successfully | Preview uses `@ds` not relative | `isolation.test.ts:110-111` — `toMatch(/from ['"]@ds['"]/)` / `not.toMatch(/..\/packages\/ds/)`; preview source line 4 `from '@ds'` | ✅ PASS |

### P1: Theme bridge + Brand (DSLIB-04..06)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN `getTheme(mode, brand)` THEN `colors.primary` matches brand×mode; identity uses `brand` | github/gitlab × light/dark hexes; `theme.brand` | `getTheme.test.ts:9` `#0FBF3E`; `:13` `#5FED83`; `:17` `#FC6D26`; `:21` `#FCA326`; `:34` `theme.brand` | ✅ PASS |
| WHEN lib provider mounts with `theme` prop THEN consumers receive that object | Injected dark/gitlab primary `#FCA326`, brand `gitlab` | `DsThemeProvider.test.tsx:33-34` — `toBe('#FCA326')` / `toBe('gitlab')` | ✅ PASS |
| WHEN app boots product UI THEN presentation bridge maps DataSource→Brand, `getTheme`, wraps `DsThemeProvider` | Bridge uses store + map + provider | `AppThemeProvider.test.tsx:116-118` — `mapDataSourceToBrand` / `DsThemeProvider`; `:62` primary `#FC6D26`; `map-data-source-to-brand.test.ts:5-9` | ✅ PASS |
| WHEN hydrate/splash/SecureStore hydrate runs THEN outside `packages/ds` | No Zustand/SecureStore in lib provider; session-gate in presentation | `DsThemeProvider.test.tsx:40` — `not.toMatch(/zustand|SecureStore/i)`; `session-gate.test.tsx:66` — `hydrate` called once | ✅ PASS |
| WHEN `DataSourceLogo` rendered THEN accepts `brand`; no `@/application` | `brand?:`; no application import | `DataSourceLogo.test.tsx:81-83` — `not.toMatch(/@\/application|…/)` / `toMatch(/brand\?:/)` | ✅ PASS |

### P1: Container layout box (DSLIB-07..10)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN spacing shorthands with Spacing tokens THEN theme.spacing on correct edges (+ gap) | Token px on edges; gap mapped | `resolveBoxSpacing.test.ts:9-12`; `:79` gap; `Container.test.tsx:24-27` | ✅ PASS |
| WHEN shorthand omitted THEN no invented padding/margin (baseline 0) | All edges/gap `0` | `resolveBoxSpacing.test.ts:63-73` — `toEqual({…:0})` | ✅ PASS |
| WHEN flex/direction/justify/align/wrap set THEN apply without boolean flex flag | flexGrow/row/space-between/center/wrap | `Container.test.tsx:52-57` | ✅ PASS |
| WHEN `safe` is `true` THEN insets all edges via safe-area-context | Additive token + inset | `Container.test.tsx:113-116` — `spacing.md + 47/34/11/13` | ✅ PASS |
| WHEN `safe` is edge array THEN only those edges | Only listed edges get insets | `Container.test.tsx:129-132` | ✅ PASS |
| WHEN `safe` omitted/false THEN no safe-area padding | Padding equals token only | `Container.test.tsx:99-100` (omit); `:175-176` (`safe={false}`) | ✅ PASS |
| WHEN `keyboardDismiss` true THEN press dismisses keyboard | `Keyboard.dismiss` called | `Container.test.tsx:145` | ✅ PASS |
| WHEN `keyboardDismiss` omitted/false THEN no dismiss behavior | `Keyboard.dismiss` not called | `Container.test.tsx:160` | ✅ PASS |
| WHEN public Container props inspected THEN no free-form `style` | `'style' extends keyof ContainerProps` false | `Container.test.tsx:207-208` | ✅ PASS |
| WHEN spacing typed THEN only Spacing keys (not raw `number`) | `number` not assignable to `Spacing` | `Container.test.tsx:196-198` — `RejectsNumber = false` (`number extends Spacing` is false) | ✅ PASS |

### P1: KeyboardAvoid (DSLIB-11)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN rendered THEN keyboard-avoiding host; platform-aware defaults | Mounts; ios=`padding`, android=`height` | `KeyboardAvoid.test.tsx:24`; `:35-36` behavior map | ✅ PASS |
| WHEN optional `offset` provided THEN applied to host | `$offset` / `keyboardVerticalOffset` | `KeyboardAvoid.test.tsx:30-31` | ✅ PASS |
| WHEN composes with Container THEN nested Avoid>Container works | Unit mount nested composition | `KeyboardAvoid.test.tsx:68-70` — both `ds-keyboard-avoid` and `nested-container` | ✅ PASS |
| WHEN public API inspected THEN avoiding NOT required prop on Container | No `keyboardAvoid` / `KeyboardAvoid` on Container | `KeyboardAvoid.test.tsx:55-56` | ✅ PASS |

### P2: Migrate consumers + View drop-in (DSLIB-12..14)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN app/screens/helpers/Storybook preview import THEN `@ds` paths only | Preview `@ds`; no `@/components/ds` | `isolation.test.ts:104` leftover `[]`; `:110-111` preview `@ds` | ✅ PASS |
| WHEN `src/components/ds` checked THEN does not exist | Directory absent | `isolation.test.ts:83` | ✅ PASS |
| WHEN trivial layout-only View replaceable THEN replaced by Container | List region is `Container`; `testID` preserved | `SearchReposScreen.test.tsx:310-311` — Container match / not View; impl `:119` | ✅ PASS |
| WHEN host not layout View (FlatList/Pressable/…) THEN MAY remain RN primitive | FlatList/RefreshControl remain | `SearchReposScreen.test.tsx:312-313` — `\bFlatList\b` / `\bRefreshControl\b` | ✅ PASS |
| WHEN README describes DS location THEN `packages/ds`, `@ds`, presentation bridge | Docs mention those three | `isolation.test.ts:117-119` — `packages/ds`, `` `@ds` ``, `presentation/theme\|AppThemeProvider` | ✅ PASS |

### Edge cases

| Criterion | Spec-defined outcome | Evidence | Result |
| --------- | -------------------- | -------- | ------ |
| Conflicting shorthands (`p`+`pt`) | Specific overrides shorthand | `resolveBoxSpacing.test.ts:18` — `paddingTop`=`spacing.xl` | ✅ PASS |
| `safe` overlaps Header top | Consumers choose edges; no auto-dedupe | Spec assumption; no auto-dedupe in Container (consumer responsibility) | ✅ PASS (by design) |
| `keyboardDismiss` with TextInput | Focus/type without dismiss | `Container.test.tsx:179-190` — focus + `changeText`; `dismissSpy` not called | ✅ PASS |
| KeyboardAvoid Android vs iOS defaults | Explicit platform map | `KeyboardAvoid.test.tsx:35-36` | ✅ PASS |
| Brand vs DataSource naming | Mapping stays in bridge only | `map-data-source-to-brand.test.ts` + lib isolation | ✅ PASS |

**Status**: ✅ All ACs covered

**Story ACs matched with spec-anchored evidence**: **29 / 29**  
**Edge cases covered**: **5 / 5**

### Prior FAIL gaps — re-check

| # | Prior gap | Re-check | Result |
| - | --------- | -------- | ------ |
| 1 | `pnpm lint` exit 1 | Lint exit 0 (0 errors, 3 warnings) | ✅ Closed |
| 2 | Storybook preview relative `../packages/ds` | `@ds` + isolation assert | ✅ Closed |
| 3 | Spacing type-only AC | `Container.test.tsx:195-198` | ✅ Closed |
| 4 | KeyboardAvoid > Container nest | `KeyboardAvoid.test.tsx:59-70` | ✅ Closed |
| 5 | View→Container Search host | `SearchReposScreen.test.tsx:308-313` | ✅ Closed |
| 6 | README automated assertion | `isolation.test.ts:114-119` | ✅ Closed |
| 7 | TextInput + keyboardDismiss edge | `Container.test.tsx:179-190` | ✅ Closed |
| — | Brand SVG exclusivity | `isolation.test.ts:122-132` | ✅ Closed |

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `packages/ds/tokens/brand-primary.ts` github.light | Primary hex `#0FBF3E` → `#DEAD00` | ✅ Killed — `getTheme.test.ts:9/25` expected `#0FBF3E` |
| 2 | `.rnstorybook/preview.tsx:4` | `@ds` → `../packages/ds` | ✅ Killed — `isolation.test.ts:110` |
| 3 | `SearchReposScreen.tsx:119` | List region `Container` → `View` | ✅ Killed — `SearchReposScreen.test.tsx:310` |

**Sensor depth**: lightweight (3 behavior faults)  
**Scratch protocol**: temp-dir backups → mutate → scoped `pnpm test` → restore. Mutated paths clean after (`git diff` empty).  
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
| No scope creep | ✅ |
| Matches patterns | ✅ (AD-012 folder shape, colocated tests) |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation | ✅ |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines followed | ✅ `AGENTS.md` Expo v54; AD-006 Jest+RNTL |

---

## Edge Cases

- [x] Conflicting spacing shorthands — precedence tested
- [x] KeyboardAvoid platform defaults explicit
- [x] Brand↔DataSource mapping confined to bridge
- [x] `keyboardDismiss` + TextInput focus/type does not call dismiss
- [x] Header/`safe` double inset — consumer responsibility (no auto-dedupe)

---

## Gate Check

- **Gate command**: `pnpm test` && `pnpm lint`
- **Result**: **tests** 385 passed, 0 failed, 0 skipped; **lint** **PASSED** — 0 errors, 3 warnings (exit 0)
- **Lint warnings (non-blocking)**: `storybook.requires.ts` (2× `no-require-imports`), `src/test/setup.ts` (1×) — outside feature hot path
- **Test count before feature**: N/A exact at `9c98fa4` (no `packages/ds`)
- **Test count after prior FAIL**: 377
- **Test count after fix**: 385 (+8 vs prior validation; suite green)
- **Delta**: count increased; no silent deletions observed
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

None — all prior gaps closed; no new gaps.

---

## Requirement Traceability Update

| Requirement | Previous Status (prior FAIL) | New Status |
| ----------- | ---------------------------- | ---------- |
| DSLIB-01 | ❌ Needs Fix (Storybook `@ds`) | ✅ Verified |
| DSLIB-02 | ✅ Verified | ✅ Verified |
| DSLIB-03 | ⚠️ Partial (exclusivity) | ✅ Verified |
| DSLIB-04 | ✅ Verified | ✅ Verified |
| DSLIB-05 | ✅ Verified | ✅ Verified |
| DSLIB-06 | ✅ Verified | ✅ Verified |
| DSLIB-07 | ❌ Needs Fix (Spacing type) | ✅ Verified |
| DSLIB-08 | ✅ Verified | ✅ Verified |
| DSLIB-09 | ✅ Verified | ✅ Verified |
| DSLIB-10 | ✅ Verified | ✅ Verified |
| DSLIB-11 | ❌ Needs Fix (composition) | ✅ Verified |
| DSLIB-12 | ❌ Needs Fix (Storybook preview) | ✅ Verified |
| DSLIB-13 | ❌ Needs Fix (weak host evidence) | ✅ Verified |
| DSLIB-14 | ❌ Needs Fix (README assert) | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 29/29 ACs matched | 0 gaps  
**Sensor**: 3/3 mutations killed  
**Gate**: 385 tests passed; lint exit 0

**What works**: Lib extraction + isolation (incl. SVG exclusivity + Storybook `@ds` + README assert), Brand/`getTheme`/`DsThemeProvider`, presentation bridge + hydrate gate, Container spacing/flex/safe/dismiss (incl. type reject + TextInput edge), KeyboardAvoid defaults/offset/composition, Search View→Container host discrimination, sensor on primary/preview/host.

**Issues found**: none

**Next steps**: Feature ready to close; commit `validation.md` if desired (left uncommitted per Verifier instructions).
