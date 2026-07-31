# DS Controls Validation

**Date**: 2026-07-31
**Spec**: `.specs/features/ds-controls/spec.md`
**Diff range**: `d8f2a06^..3a7a3b7` (commits: d8f2a06, 4edf1de, d455b28, 36cb998, 368df4c, 3a7a3b7)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 Control tokens + theme | ✅ Done | tokens + getTheme slice |
| T2 Button atom | ✅ Done | AD-012 + stories + tests |
| T3 Input atom | ✅ Done | AD-012 + stories + tests |
| T4 InputField molecule | ✅ Done | AD-012 + stories + tests |
| T5 Card molecule | ✅ Done | compound + chrome |
| T6 README + barrels | ✅ Done | Atomic table + re-exports |

---

## Spec-Anchored Acceptance Criteria

### P1: Button atom (CTRL-01)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN `variant="primary"` THEN filled chrome uses `theme.colors.primary` | `background-color` === `getTheme(...).colors.primary` | `Button.test.tsx:23` — `expect(...).toHaveStyleRule('background-color', theme.colors.primary)` | ✅ PASS |
| WHEN `variant="outline"` OR `ghost` THEN token-driven chrome via object map | outline: primary border + transparent fill; ghost: transparent bg/border | `Button.test.tsx:36-37`, `:49-50` — `toHaveStyleRule('border-color'/'background-color', …)`; map in `styles.tsx:14-33` `buttonVariantChrome` | ✅ PASS |
| WHEN `size` sm\|md\|lg THEN padding/minHeight from button size tokens | style metrics === `button[size].*` | `Button.test.tsx:62-66`, `:78-82`, `:94-98` — `toHaveStyleRule('min-height'/'padding-*', token.*)` | ✅ PASS |
| WHEN `disabled` THEN no `onPress` + disabled a11y | `onPress` not called; `accessibilityState.disabled === true` | `Button.test.tsx:111-112` — `expect(onPress).not.toHaveBeenCalled()`; `accessibilityState` objectContaining `{ disabled: true }` | ✅ PASS |
| WHEN `loading` THEN Loading atom, no press, stable min size | `ds-loading` present; label hidden; press blocked; `min-height` kept | `Button.test.tsx:123-129` — `getByTestId('ds-loading')`; `queryByText` null; `onPress` not called; `min-height` === `button.md.minHeight` | ✅ PASS |
| WHEN leading/trailing AND not loading THEN leading→label→trailing | text content `LLabelT` | `Button.test.tsx:139-141` — `toHaveTextContent('LLabelT')` | ✅ PASS |
| WHEN public props inspected THEN no `style` | `'style' extends keyof ButtonProps` is false | `Button.test.tsx:170-172` — `expect(hasStyle).toBe(false)` | ✅ PASS |
| WHEN opened in Storybook THEN stories cover variants/sizes/states/slots | Default, Outline, Ghost, Sizes, Loading, Disabled, WithSlots | `Button.stories.tsx:25-77` — story exports | ✅ PASS |
| WHEN shipped THEN colocated Jest+RNTL assert ACs | suite asserts variant/size/loading/disabled/slots | `Button.test.tsx` (12 cases) | ✅ PASS |

### P1: Input atom (CTRL-02)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN rendered THEN bordered chrome from theme tokens | `border-color` === `theme.colors.border` | `Input.test.tsx:20` — `toHaveStyleRule('border-color', theme.colors.border)` | ✅ PASS |
| WHEN leading/trailing THEN leading→field→trailing | 3 regions; field is middle with value | `Input.test.tsx:38-43` — `regions` length 3; `regions[1]` `testID`/`value`; `toHaveTextContent('LT')` | ✅ PASS |
| WHEN value/onChangeText THEN controlled host | value reflected; callback on edit | `Input.test.tsx:51-54` — `props.value === 'hello'`; `toHaveBeenCalledWith('hello!')` | ✅ PASS |
| WHEN `state="error"` THEN error token border; default/omitted → default map | error → `colors.danger`; default → `colors[input.state.default]` | `Input.test.tsx:63`; `:72-75` — `toHaveStyleRule('border-color', …)` | ✅ PASS |
| WHEN `editable={false}` THEN no edits + disabled a11y | `editable === false`; press/change blocked; a11y disabled | `Input.test.tsx:83-87` — `editable` false; `accessibilityState.disabled`; `onChangeText` not called | ✅ PASS |
| WHEN public props inspected THEN no `style` | `'style' extends keyof InputProps` is false | `Input.test.tsx:100-102` — `expect(hasStyle).toBe(false)` | ✅ PASS |
| WHEN Storybook THEN default, slots, error | Default, WithSlots, ErrorState | `Input.stories.tsx:26-53` | ✅ PASS |
| WHEN shipped THEN colocated tests for chrome/slots/state/value | suite covers ACs | `Input.test.tsx` (8 cases) | ✅ PASS |

### P1: InputField molecule (CTRL-03)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN `label` THEN show label above Input **via Typography** | label text visible **and** rendered through Typography | `InputField.test.tsx:18-19` — `getByText('Email')` only; does **not** assert Typography/`variant="label"` | ⚠️ Spec-precision gap |
| WHEN `helperText` AND no error THEN helper below Input | helper text visible | `InputField.test.tsx:27` — `getByText('We never share your email')` | ✅ PASS |
| WHEN non-empty `error` THEN error message (not helper) + Input error state | error text; helper absent; border danger | `InputField.test.tsx:42-46` — `getByText('Required')`; `queryByText(helper)` null; `border-color` danger | ✅ PASS |
| WHEN leading/trailing THEN forwarded to Input | both slot testIDs present | `InputField.test.tsx:78-79` — `getByTestId('leading'/'trailing')` | ✅ PASS |
| WHEN value/change handlers THEN forwarded | value + onChangeText on inner field | `InputField.test.tsx:87-90` — `value === 'hello'`; `toHaveBeenCalledWith('hello!')` | ✅ PASS |
| WHEN public props inspected THEN no `style` | `'style' extends keyof InputFieldProps` is false | `InputField.test.tsx:94-96` — `expect(hasStyle).toBe(false)` | ✅ PASS |
| WHEN Storybook THEN label+helper, error, slots | LabelAndHelper, WithError, WithSlots | `InputField.stories.tsx:26-71` | ✅ PASS |
| WHEN shipped THEN colocated tests for label/helper/error/forwarding | suite covers ACs | `InputField.test.tsx` (8 cases) | ✅ PASS |

### P1: Card molecule (CTRL-04)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN Card rendered THEN surface/radius/border from card tokens (not Container) | bg/border/radius from `theme.card.*`; no Container import | `Card.test.tsx:28-39` — `toHaveStyleRule` for surface/border/radii; `not.toMatch(/Container/)` on sources | ✅ PASS |
| WHEN Header/Content/Footer used THEN header→content→footer order | regions present; text `HeaderContentFooter` | `Card.test.tsx:58-61` — region testIDs; `toHaveTextContent('HeaderContentFooter')` | ✅ PASS |
| WHEN subset of regions THEN only those render | content only; header/footer null | `Card.test.tsx:73-76` — content present; header/footer `toBeNull()` | ✅ PASS |
| WHEN public props (root+regions) THEN no `style` | all four prop types exclude `style` | `Card.test.tsx:99-102` — `expect(*HasStyle).toBe(false)` | ✅ PASS |
| WHEN Storybook THEN all three regions composed | `AllRegions` story | `Card.stories.tsx:25-40` | ✅ PASS |
| WHEN shipped THEN colocated tests for chrome + compound | suite covers ACs | `Card.test.tsx` (6 cases) | ✅ PASS |

### P1: Atomic docs + barrels (CTRL-05)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN README DS table read THEN Button+Input atoms; InputField+Card molecules; Badge/Avatar deferred | table rows match classification | `README.md:129-130` — Atoms include Button, Input; Molecules include InputField, Card; Badge/Avatar deferred | ✅ PASS |
| WHEN public DS barrel used THEN Button, Input, InputField, Card importable | re-exported via atoms/molecules → `ds/index.ts` | `atoms/index.ts:13-17`; `molecules/index.ts:6-11`; `ds/index.ts:3-4` `export *` | ✅ PASS |
| WHEN DS tree inspected THEN atoms/molecules + AD-012 shape | folders with index/component/styles/stories/__tests__ | tree under `atoms/Button`, `atoms/Input`, `molecules/InputField`, `molecules/Card` | ✅ PASS |

**Status**: ⚠️ Spec-precision gaps flagged (1) — 33/34 ACs fully matched; CTRL-03 AC1 Typography composition not asserted

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `Button.tsx` (`isDisabled` / `onPress`) | Loading no longer OR’d into disabled; `onPress` always wired | ✅ Killed — `Button.test.tsx:128` `expect(onPress).not.toHaveBeenCalled()` |
| 2 | `InputField.tsx` (`hasError`) | `hasError` forced `false` (error never wins) | ✅ Killed — `InputField.test.tsx:42` `getByText('Required')` |
| 3 | `Card/styles.tsx` (background) | `theme.colors.background` instead of `theme.colors[chrome.surfaceTone]` | ✅ Killed — `Card.test.tsx:28` / `:85` surfaceTone style rule |

**Scratch method**: mut1 in-tree then restored from backup; mut2–3 in `git worktree` at `/tmp/ds-controls-sensor` (removed). Main tree production files match HEAD after sensor.
**Sensor depth**: lightweight (3 behavior-level faults)
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

Not performed (Verifier automated pass; Maestro/device UAT not requested). Storybook coverage verified by story file presence.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ Badge/Avatar absent |
| Matches patterns | ✅ AD-012, object maps in Button/Input styles, compound Card |
| Spec-anchored outcome check | ⚠️ CTRL-03 AC1 Typography not asserted |
| Per-layer Coverage Expectation met | ✅ tokens/theme + atoms + molecules 1:1; docs layer none (lint) |
| Every test maps to a spec requirement — no unclaimed tests | ✅ (InputField `state` omit check aligns with design assumption) |
| Documented guidelines followed: `AGENTS.md` / AD-006 Jest+RNTL, AD-012, AD-017 | ✅ |

---

## Edge Cases

- [x] Button `loading` + `disabled` → non-pressable — `Button.test.tsx:144-154`
- [x] Button loading hides leading/trailing/label — `Button.test.tsx:156-167`
- [x] InputField `error=""` → no error; helper may show — `InputField.test.tsx:49-66`
- [x] Input without slots still layouts field — `Input.test.tsx:90-97`
- [x] Card zero regions still renders chrome — `Card.test.tsx:79-86`
- [x] Invalid `variant`/`size`/`state` rejected at type level — unions from tokens (`ButtonVariant`, `ButtonSize`, `InputState`); compile-time (no runtime Jest)

---

## Gate Check

- **Gate command**: `pnpm test && pnpm lint`
- **Result**: **125** passed, **0** failed, **0** skipped; ESLint **0 errors** (5 pre-existing warnings in unrelated/storybook/styled.d files)
- **Test count before feature** (`d8f2a06^`): **80** (125 − 45 new feature-scoped cases)
- **Test count after feature** (`3a7a3b7` / current): **125**
- **Delta**: **+45** new tests (token suites + control `getTheme` case + Button/Input/InputField/Card)
- **Test integrity**: count increased; no weakened deletions observed in feature range
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans (if issues found)

### Fix 1 (optional / non-blocking): Assert Typography on InputField label

- **Root cause**: CTRL-03 AC1 requires label **via Typography**; test only asserts text presence
- **Fix task**: Strengthen `InputField.test.tsx` label case to assert Typography usage (e.g. label node `variant="label"` / component identity / role), not only `getByText`
- **Priority**: Minor (cosmetic-to-major for evidence completeness; implementation already uses `<Typography variant="label">`)

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CTRL-01 | Verified (tasks) | ✅ Verified (validation) |
| CTRL-02 | Verified (tasks) | ✅ Verified (validation) |
| CTRL-03 | Verified (tasks) | ⚠️ Verified with precision gap (label/Typography) |
| CTRL-04 | Verified (tasks) | ✅ Verified (validation) |
| CTRL-05 | Verified (tasks) | ✅ Verified (validation) |

---

## Summary

**Overall**: ✅ Ready (1 non-blocking spec-precision gap)

**Spec-anchored check**: 33/34 ACs matched spec outcome | 1 spec-precision gap
**Sensor**: 3/3 mutations killed
**Gate**: 125 passed

**What works**: Button/Input/InputField/Card tokens, atoms, molecules, stories, barrels, README Atomic classification; gate green; discrimination sensor kills loading-press, error-orchestration, and Card surface faults.

**Issues found**: InputField label AC asserts visible text but not Typography composition.

**Next steps**: Optional strengthen InputField label assertion; otherwise feature ready. No blocking fix iteration required for PASS.
