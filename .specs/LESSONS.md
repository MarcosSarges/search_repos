# LESSONS — auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation — do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 — Run the Build gate lint command before marking a feature done; prettier/eslint errors in touched files fail the gate even when tests pass
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `lint` · harmful: 0
- features: design-system
- evidence: validation.md Gate Check — 5 prettier/prettier errors in Icon/Spacer/Container/Header (lint)
- last seen: 2026-07-31T13:50:22Z

### L-002 — When a provider API changes theme values at runtime, assert the resolved consumer value (e.g. theme.colors.primary), not only the setter state field
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `theme` · harmful: 0
- features: design-system
- evidence: DS-02 AC4 — AppThemeProvider.test.tsx lacks theme.colors.primary after setDataSource (theme)
- last seen: 2026-07-31T13:50:22Z

### L-003 — When a component reads a theme token that depends on context, assert it updates after the context value that drives that token changes
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `ds-atoms` · harmful: 0
- features: design-system
- evidence: Edge case Typography tone=primary + dataSource flip — no file:line evidence (ds-atoms)
- last seen: 2026-07-31T13:50:22Z

### L-004 — Spec outcomes that offer alternative values (A or B) without a decision rule must be tightened before Execute so tests know which to assert
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec` · harmful: 0
- features: design-system
- evidence: Atoms Loading AC — primary (or muted) without when-muted rule (spec)
- last seen: 2026-07-31T13:50:22Z

### L-005 — Every DS component folder must ship index.ts, Component.tsx, Component.stories.tsx, and styles.tsx with styled-components defined only in styles.tsx
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `src/components/ds` · harmful: 0
- features: design-system
- evidence: src/components/ds/atoms/Typography/Typography.tsx:15 (src/components/ds)
- last seen: 2026-07-31T14:04:20Z

### L-006 — DS visual styles must always use styled-components; never StyleSheet.create or free style props for DS chrome
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `src/components/ds` · harmful: 0
- features: design-system
- evidence: src/components/ds/atoms/Typography/Typography.tsx:15 (src/components/ds)
- last seen: 2026-07-31T14:04:20Z

### L-007 — Resolve DS variant/tone/size lookups with object maps, not switch/case, in styled layers and token helpers
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `src/components/ds` · harmful: 0
- features: design-system
- evidence: src/components/ds/atoms/Typography/Typography.tsx:22 (src/components/ds)
- last seen: 2026-07-31T14:04:20Z

### L-008 — Typography variant tokens must include fontFamily, fontWeight, and lineHeight; RN text only respects a family when fontFamily is declared
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `src/components/ds/tokens` · harmful: 0
- features: design-system
- evidence: src/components/ds/atoms/Typography/Typography.tsx:34 (src/components/ds/tokens)
- last seen: 2026-07-31T14:04:21Z

### L-009 — When asserting asset/logo selection, verify the mapped component identity (or rendered SVG source), not only a testID derived from the lookup key
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `ds/organisms` · harmful: 0
- features: ds-conventions
- evidence: DataSourceLogo.test.tsx:logoComponentMap swap mutant (ds/organisms)
- last seen: 2026-07-31T14:24:58Z

### L-010 — Assert exact per-variant token metric values (e.g. body fontWeight '400'), not a union regex that accepts every legal enum member
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `ds/tokens` · harmful: 0
- features: ds-conventions
- evidence: tokens/typography.ts body fontWeight 400→600; typography.test.ts:12 (ds/tokens)
- last seen: 2026-07-31T14:33:47Z

### L-011 — When the spec requires precise token values, pin each variant field to its defined literal in unit tests
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `ds/tokens` · harmful: 0
- features: ds-conventions
- evidence: DSC-03 AC6 precise token values; typography.test.ts:12 (ds/tokens)
- last seen: 2026-07-31T14:33:47Z

### L-012 — When an AC requires a specific DS atom (e.g. Typography), assert that component or its variant props, not only the rendered text string
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `src/components/ds` · harmful: 0
- features: ds-controls
- evidence: CTRL-03 AC1 / InputField.test.tsx:18 (src/components/ds)
- last seen: 2026-07-31T19:40:55Z

### L-013 — Add store tests for corrupt JSON and storage read failures asserting system mode plus github fallback.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `stores/persist` · harmful: 0
- features: theme-persist-home
- evidence: TPH-04 | session-preferences-store.test.ts (no corrupt/read-fail test) (stores/persist)
- last seen: 2026-07-31T21:10:04Z

### L-014 — After UI toggle actions assert the persist storage key contains the new mode or dataSource value.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `screens/persist` · harmful: 0
- features: theme-persist-home
- evidence: TPH-09 | HomeScreen.test.tsx:30-40 (mode toggle only in-memory) (screens/persist)
- last seen: 2026-07-31T21:10:04Z

### L-015 — Hydration gates need a runtime test that children are absent before onFinishHydration not only static source regex.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `providers/hydration` · harmful: 0
- features: theme-persist-home
- evidence: TPH-05 | AppThemeProvider.test.tsx:120-125 (source inspection only) (providers/hydration)
- last seen: 2026-07-31T21:10:05Z

### L-016 — Run pnpm lint before Verifier gate or exclude auto-generated storybook requires from eslint until formatted.
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `tooling/lint` · harmful: 0
- features: theme-persist-home
- evidence: validation.md gate | .rnstorybook/storybook.requires.ts prettier 13 errors (tooling/lint)
- last seen: 2026-07-31T21:10:05Z

## Quarantined (failed when applied — ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
