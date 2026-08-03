# DS MUI Props Validation

**Date**: 2026-08-03
**Spec**: `.specs/features/ds-mui-props/spec.md`
**Diff range**: `54ba41f^..2e14173` (T1–T13); supplemental `9acb2d9..HEAD` for packages/ds + presentation + docs
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | `54ba41f` content-color + surface |
| T2 | ✅ Done | `c2a4edc` button tokens |
| T3 | ✅ Done | `dd3bf9c` IconSize/LoadingSize/card.defaultBg |
| T4 | ✅ Done | `afeb75a` Typography color + style |
| T5 | ✅ Done | `515ef4d` Icon size/color |
| T6 | ✅ Done | `5a7aa23` Loading size |
| T7 | ✅ Done | `e3bcf15` Button MUI-like API |
| T8 | ✅ Done | `696be46` Container bg |
| T9 | ✅ Done | `e602863` Card bg |
| T10 | ✅ Done | `a68d78c` InputField colors + style |
| T11 | ✅ Done | `ce6eda1` remaining style passthrough |
| T12 | ✅ Done | `4f2fe84` consumer migration |
| T13 | ✅ Done | `2e14173` README + AD-028 |

Task body checkboxes in `tasks.md` remain unchecked; commit log + STATUS line treat Execute as complete.

---

## Spec-Anchored Acceptance Criteria

### P1: Content `color` + surface `bg` (PROP-01..08)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| PROP-01: Typography/Icon `color` muted\|primary\|danger\|text → `theme.colors` token | Foreground = theme color for that key | `Typography.test.tsx:29` — `toHaveStyleRule('color', theme.colors.muted)`; `:40` `'#0FBF3E'`; `:52` `theme.colors.danger`; `:71` `theme.colors.text`; `Icon.test.tsx:19` primary; `:27` muted | ✅ PASS |
| PROP-02: omit `color` → `theme.colors.text` | Default foreground = text | `Typography.test.tsx:59` — `toHaveStyleRule('color', theme.colors.text)`; `Icon.test.tsx:35` same | ✅ PASS |
| PROP-03: public API has no `Tone` / `SurfaceTone` / `tone` / `toneColorMap` | Those names absent from exports / call sites | `content-color.test.ts:31-33` — `'Tone'/'toneColorMap'/'SurfaceTone' in tokens` false; `surface.test.ts:31-33`; `ds-mui-props-migration.test.ts:47` — `expect(offenders).toEqual([])` | ✅ PASS |
| PROP-04: Container `bg` surface\|background → matching token fill | `background-color` = `theme.colors[bg]` | `Container.test.tsx:68-70` surface; `:83-85` background | ✅ PASS |
| PROP-05: Container omits `bg` → no implicit theme fill | Not `background`/`surface` as fill | `Container.test.tsx:99-100` — `not.toHaveStyleRule('background-color', theme.colors.background/surface)` | ✅ PASS |
| PROP-06: Card `bg` follows token; omit → card default surface | Omit → `theme.colors.surface` / `defaultBg`; explicit overrides | `Card.test.tsx:28-29` — `defaultBg === 'surface'` + surface fill; `:46` — `bg="background"` override | ✅ PASS |
| PROP-07: InputField helper muted / error danger (no `tone`) | Caption color muted vs danger | `InputField.test.tsx:30-32` — message `color` = `theme.colors.muted`; `:53-55` = `theme.colors.danger`; impl `InputField.tsx:29,42` `color={messageColor}` | ✅ PASS |
| PROP-08: big-bang consumers — no leftover `tone` | Zero `tone=` / Tone / SurfaceTone / toneColorMap in ds + presentation | `ds-mui-props-migration.test.ts:47` — `expect(offenders).toEqual([])`; `:62-63` screens `bg="background"` | ✅ PASS |

### P1: Button MUI-like (PROP-09..16)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| PROP-09: `variant` contained\|outlined\|text → chrome independent of color | Filled / bordered / transparent chrome | `Button.test.tsx:23` contained fill primary; `:36-37` outlined border + transparent bg; `:49-50` text transparent bg/border | ✅ PASS |
| PROP-10: `color` primary\|success\|warning\|danger → theme palette | Chrome from `theme.colors[color]` | `Button.test.tsx:23` primary; `:62` danger fill; `button.test.ts:35-38` token keys include success/warning | ✅ PASS (success/warning chrome only at token-union level; see edge cases) |
| PROP-11: omit variant+color → contained + primary | Default fill = primary | `Button.test.tsx:69` — `toHaveStyleRule('background-color', theme.colors.primary)` | ✅ PASS |
| PROP-12: size sm\|md\|lg → button size tokens | padding/minHeight from `button[size]` | `Button.test.tsx:81-85` sm; `:97-101` md; `:113-117` lg | ✅ PASS |
| PROP-13: omit width OR `width="full"` → full stretch | `align-self: stretch` + `width: 100%` | `Button.test.tsx:128-129` — only renders `width="full"` (omit path **not** asserted) | ⚠️ Partial — omit branch missing |
| PROP-14: `width="hug"` → content-sized | `align-self: flex-start` | `Button.test.tsx:139` — `toHaveStyleRule('align-self', 'flex-start')` | ✅ PASS |
| PROP-15: no legacy variants primary\|outline\|ghost | Not in `ButtonProps['variant']` / token map | `Button.test.tsx:161-163` — legacy type flags false; `button.test.ts:51-53` — `not.toHaveProperty('primary'/'outline'/'ghost')` | ✅ PASS |
| PROP-16: Button→Loading uses `size` (not Loading `variant`) | Loading indicator size from `loading[button[size].loadingSize]` | `Button.test.tsx:149-151` — `props.size` = `loading[button.lg.loadingSize].indicatorSize`; `button.test.ts:58-59` no `loadingVariant` | ✅ PASS |

### P1: Scale `size` + `style` (PROP-17..21)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| PROP-17: Icon `size` tokens; no size-via-`variant` | Glyph size = icon token; no `variant` prop | `Icon.test.tsx:12` — `font-size` = `icon.lg.size`; `:57-58` HasVariant false; `icon.test.ts:13` size map | ✅ PASS |
| PROP-18: Loading `size` sm\|lg; no public scale `variant` | ActivityIndicator size small/large | `Loading.test.tsx:28` `'large'`; `:34` `'small'`; `:54` HasVariant false | ✅ PASS |
| PROP-19: DataSourceLogo `size` unchanged contract | Scales to `sizes` token | `DataSourceLogo.test.tsx:49-50` xl; `:57-58` default md | ✅ PASS |
| PROP-20: public DS components accept/forward `style` | `'style' extends keyof Props`; host receives style | Typography `:134,:142`; Icon `:41,:44`; Loading `:40,:43`; Button `:237,:244`; Container `:106,:114`; Card `:52,:56`; Input `:102,:108`; InputField `:106,:110`; Header `:110,:114`; Spacer `:40,:43`; KeyboardAvoid `:50,:58`; DataSourceLogo `:88,:95-96` | ✅ PASS |
| PROP-21: no public `sx` prop | No `sx` on DS public API | **no test `file:line`** — verifier `rg` under `packages/ds` found zero `\bsx\b`; README documents “Sem prop `sx`” but that is PROP-22 | ❌ GAP |

### P2: Docs (PROP-22..23)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| PROP-22: README documents axes + motivation + big-bang | color/bg/variant/size/width/style; motivation; no tone aliases; no sx | `README.md:143` motivation + big-bang + no sx; `:147-153` axes table | ✅ PASS |
| PROP-23: STATE supersedes AD-016 / tone parts of AD-017 via new AD | AD-028 active; AD-016 superseded; AD-017 partially superseded | `.specs/STATE.md:131` AD-016 superseded by AD-028; `:139` AD-017 partially superseded; `:221-227` AD-028 active + big-bang | ✅ PASS |

**Status**: ❌ Gaps present (PROP-21); ⚠️ PROP-13 omit-width partial

---

## Discrimination Sensor

Scratch mutations via temp file backup → scoped tests → restore. Working tree sensor paths left clean (`git status` clean for mutated files).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `packages/ds/molecules/Container/styles.tsx` (`$bg === undefined` branch) | Omit-bg applies `theme.colors.background` fill | ✅ Killed — `Container.test.tsx:99` |
| 2 | `packages/ds/atoms/Typography/Typography.tsx` default | `color = 'text'` → `'muted'` | ✅ Killed — `Typography.test.tsx:59` |
| 3 | `packages/ds/atoms/Button/styles.tsx` `widthStyles.hug` | hug uses stretch + `width: 100%` | ✅ Killed — `Button.test.tsx:139` |

**Sensor depth**: lightweight (3 behavior-level faults)
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

Not performed (Verifier automated path; orchestrator may schedule UAT separately for visual Storybook review).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ (API rename/migration within feature boundary) |
| Matches patterns | ✅ (AD-012/013 object maps, colocated tests) |
| Spec-anchored outcome check | ⚠️ PROP-21 missing automated assertion; PROP-13 omit incomplete |
| Per-layer Coverage Expectation met | ⚠️ near-complete; PROP-21 gap |
| Every test maps to a spec requirement — no unclaimed tests | ✅ (legacy a11y/layout cases pre-exist; new PROP-tagged suites map cleanly) |
| Documented guidelines followed | ✅ `AGENTS.md` (Expo v54), AD-006 Jest+RNTL, AD-012/013 |

---

## Edge Cases

- [x] `color="primary"` follows active theme primary (datasource flip) — `Typography.test.tsx:74-100`
- [ ] Button `success`\|`warning`\|`danger` with `outlined`\|`text` palette chrome — only `contained`+`danger` asserted; outlined/text non-primary not covered
- [x] Container children + no `bg` still apply spacing — `Container.test.tsx` padding cases without `bg`
- [x] Explicit Card `bg` overrides default fill — `Card.test.tsx:42-46`
- [x] `style` merge left to RN (no custom resolver) — passthrough tests; no invented resolver
- [x] Legacy `tone="default"` → `color="text"` / omit — migration gate + Typography default text

---

## Gate Check

- **Gate command**: `pnpm test` && `pnpm lint`
- **Result**: **422** passed, **0** failed, **0** skipped; lint **PASSED** (0 errors, 3 warnings — pre-existing `@typescript-eslint/no-require-imports` in `storybook.requires.ts`, `src/test/setup.ts`)
- **Test count before feature** (`9acb2d9` `it(` approx): **354**
- **Test count after feature** (HEAD `it(` approx): **391** (~+37); Jest suite total **422**
- **Delta**: tests increased (no integrity decrease)
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

### Fix 1: PROP-21 — assert no public `sx`

- **Root cause**: No automated assertion that public DS prop types reject `sx`; only static grep + README.
- **Fix task**: Add a colocated or presentation gate test (mirror PROP-08) asserting `'sx' extends keyof XProps` is false for every public DS export (or scan sources for `sx?:`).
- **Verify**: `pnpm test -- <new-or-existing scoped path>`; mutate by adding `sx?:` to one Props type → test fails.
- **Priority**: Major (AC uncovered)
- **Done when**: PROP-21 has `file:line` evidence-or-zero citation

### Fix 2: PROP-13 — assert omitted `width` defaults to full

- **Root cause**: Test title claims “full or omitted” but only renders `width="full"`.
- **Fix task**: In `Button.test.tsx`, render `<Button testID="btn-default-width">` without `width` and assert stretch/`width: 100%`.
- **Verify**: Scoped Button tests; mutant flipping default `width = 'hug'` is killed.
- **Priority**: Minor
- **Done when**: omit branch has assertion

### Fix 3 (optional): Button palette × chrome edge matrix

- **Root cause**: Edge case for success/warning/danger × outlined/text not covered.
- **Fix task**: Smoke assert at least one non-primary `outlined` and `text` border/label color from `theme.colors[color]`.
- **Priority**: Minor / Cosmetic for coverage depth

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| PROP-01..12 | Design / Implementing | ✅ Verified |
| PROP-13 | Design / Implementing | ⚠️ Partial (omit width) |
| PROP-14..20 | Design / Implementing | ✅ Verified |
| PROP-21 | Design / Implementing | ❌ Needs Fix |
| PROP-22..23 | Design / Implementing | ✅ Verified |

*(Statuses recorded here only — `spec.md` not mutated by Verifier per commit scope.)*

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 21/23 ACs fully matched; 1 partial (PROP-13 omit); 1 gap (PROP-21)
**Sensor**: 3/3 mutations killed
**Gate**: 422 passed, 0 failed; lint pass

**What works**: Tone removal, color/bg APIs, Button MUI axes (incl. hug), size rename, style passthrough across public exports, consumer migration gate, README + AD-028, discrimination sensor green.

**Issues found**: PROP-21 lacks automated `sx`-absence evidence; PROP-13 omit-width untested; optional Button non-primary outlined/text edge coverage.

**Next steps**: Implement Fix 1 (and preferably Fix 2); re-verify (iteration 1 of max 3).
