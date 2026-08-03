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

### L-017 — Lock provider-agnostic entity shapes with source-scan or fixture assertions against forbidden fields, not types alone
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `src/domain/entities` · harmful: 0
- features: domain-layer
- evidence: DOM-02 (src/domain/entities)
- last seen: 2026-08-02T19:03:35Z

### L-018 — Assert pagination result shape includes required fields and explicitly excludes totalCount when the spec forbids it
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `src/domain/entities` · harmful: 0
- features: domain-layer
- evidence: DOM-04 (src/domain/entities)
- last seen: 2026-08-02T19:03:35Z

### L-019 — When the spec requires optional fields via undefined not null, assert entity sources use ?: and reject | null unions
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `src/domain/entities` · harmful: 0
- features: domain-layer
- evidence: DOM-05 (src/domain/entities)
- last seen: 2026-08-02T19:03:35Z

### L-020 — When a port documents AppError rejects, add a fake-backed test that asserts isAppError on the rejection path
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `src/domain/repositories` · harmful: 0
- features: domain-layer
- evidence: DOM-11 (src/domain/repositories)
- last seen: 2026-08-02T19:03:35Z

### L-021 — Opaque identity contracts need an explicit string-typed fixture or assertion, not only a TypeScript field declaration
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `src/domain` · harmful: 0
- features: domain-layer
- evidence: DOM-03 (src/domain)
- last seen: 2026-08-02T19:03:35Z

### L-022 — When a spec mandates HTTP query params (sort/order), assert those params on the intercepted request — mapping assertions alone do not cover the request contract
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `infrastructure/http-adapters` · harmful: 0
- features: infrastructure-layer
- evidence: INFRA-04 (infrastructure/http-adapters) (+1 more)
- last seen: 2026-08-02T21:53:59Z

### L-023 — Run pnpm lint to zero errors before declaring a feature build gate green; prettier and typescript-eslint errors in new files count as gate failure even when Jest is green
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `tooling` · harmful: 0
- features: ds-as-lib
- evidence: validation.md Gate Check / pnpm lint exit 1 (tooling)
- last seen: 2026-08-03T11:42:01Z

### L-024 — After introducing a path alias for a lib, assert Storybook preview and app entry import via that alias only—not relative packages/ paths
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `packages/ds` · harmful: 0
- features: ds-as-lib
- evidence: DSLIB-01/12 Storybook preview ../packages/ds (packages/ds)
- last seen: 2026-08-03T11:42:01Z

### L-025 — When props must accept only token union keys, add a type-level test that raw number is not assignable—mirroring the existing style-prop exclusion pattern
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `packages/ds` · harmful: 0
- features: ds-as-lib
- evidence: DSLIB-07 Container spacing type AC (packages/ds)
- last seen: 2026-08-03T11:42:01Z

### L-026 — When the spec Independent Test requires nested composition of two components, mount both in a unit test; stories alone are not coverage
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `packages/ds` · harmful: 0
- features: ds-as-lib
- evidence: DSLIB-11 KeyboardAvoid>Container composition (packages/ds)
- last seen: 2026-08-03T11:42:01Z

### L-027 — When replacing a host element, assert the new component identity in source or queries—not only a preserved testID that would still pass on the old host
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `presentation` · harmful: 0
- features: ds-as-lib
- evidence: DSLIB-13 search-repos-list-region host (presentation)
- last seen: 2026-08-03T11:42:01Z

### L-028 — Documentation acceptance criteria need an automated assertion of the required phrases or paths, otherwise evidence-or-zero marks them uncovered
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `docs` · harmful: 0
- features: ds-as-lib
- evidence: DSLIB-14 README docs AC (docs)
- last seen: 2026-08-03T11:42:01Z

### L-029 — When the spec says only one module may import an asset set, assert a repo-wide scan for those import paths—not only that the allowed module imports them
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `packages/ds` · harmful: 0
- features: ds-as-lib
- evidence: DSLIB-03 brand SVG exclusivity (packages/ds)
- last seen: 2026-08-03T11:42:01Z

### L-030 — When keyboard-dismiss wrappers are specified, test that presses on TextInput still focus and that dismiss fires only from the non-input press target
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `packages/ds` · harmful: 0
- features: ds-as-lib
- evidence: Edge: keyboardDismiss + TextInput focus (packages/ds)
- last seen: 2026-08-03T11:42:09Z

### L-031 — Assert public component prop types reject sx with a type-level or scan test, not only README wording
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `packages/ds` · harmful: 0
- features: ds-mui-props
- evidence: PROP-21 (packages/ds)
- last seen: 2026-08-03T12:39:44Z

### L-032 — When an AC covers omitted OR explicit default prop values, assert both branches in the test
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `packages/ds` · harmful: 0
- features: ds-mui-props
- evidence: PROP-13 (packages/ds)
- last seen: 2026-08-03T12:39:45Z

## Quarantined (failed when applied — ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
