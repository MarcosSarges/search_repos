# Design System Design

**Spec**: `.specs/features/design-system/spec.md`  
**Context**: `.specs/features/design-system/context.md`  
**Status**: Approved

---

## Approach exploration

| # | Approach | Pros | Cons |
| --- | --- | --- | --- |
| **A (recommended)** | Atomic folders under `src/components/ds/` + extend `AppThemeProvider` with `dataSource` + load brand SVGs via `react-native-svg-transformer/expo` (composed with Storybook metro) | Matches locked Atomic Design; single theme API; SVGs as typed components with width/height | Metro config must merge Storybook + SVG transformer carefully (Expo 54) |
| B | Same Atomic + theme, but logos via `expo-image` + `require()` assets | Zero transformer risk with Storybook | Weaker sizing/tint control; less “component-like” logos |
| C | Separate `BrandThemeProvider` beside `AppThemeProvider` | Clear separation of mode vs brand | Two providers to nest everywhere; more boilerplate for little gain |

**Recommendation: A.** Conform to AD-004 (styled-components + ThemeProvider in `src/components/ds/`). Theme stays one provider; `primary` resolves from `(mode, dataSource)`. Logos stay organism-only.

---

## Architecture Overview

```mermaid
graph TD
  subgraph providers [Theme boundary]
    ATP[AppThemeProvider]
    ATP --> GT[getTheme mode + dataSource]
    GT --> TOK[tokens: colors / spacing / sizes / radius]
    GT --> PRI[primaryBrandMap github|gitlab]
  end

  subgraph atoms [atoms]
    TY[Typography]
    IC[Icon]
    SP[Spacer]
    LD[Loading]
  end

  subgraph molecules [molecules]
    CO[Container]
    HD[Header]
  end

  subgraph organisms [organisms]
    LOGO[DataSourceLogo]
  end

  ATP --> atoms
  ATP --> molecules
  ATP --> organisms
  HD --> LOGO
  HD --> TY
  LOGO --> ASSETS["src/assets/github|gitlab/*.svg"]
  SB[Storybook preview globals] --> ATP
```

**Folder target**

```
src/components/ds/
  tokens/          # spacing, colors, sizes, radius (+ brand primary maps)
  theme/           # getTheme, AppThemeProvider, useTheme, useAppTheme
  atoms/
    Typography/
    Icon/
    Spacer/
    Loading/
  molecules/
    Container/
    Header/
  organisms/
    DataSourceLogo/
  index.ts         # public barrel
```

Stories: `*.stories.tsx` colocated next to each component. Titles: `DS/Atoms/...`, `DS/Molecules/...`, `DS/Organisms/...`.

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component | Location | How to Use |
| --- | --- | --- |
| Tokens | `src/components/ds/tokens/*` | Keep values; extend colors with brand primary maps |
| Theme helpers | `src/components/ds/theme/*` | Extend `getTheme` + `AppThemeProvider` for `dataSource` |
| Text | `src/components/ds/components/Text.tsx` | Move → `atoms/Typography`; alias `Text` deprecated or re-export |
| Text stories | `Text.stories.tsx` | Migrate title/path to Typography |
| AppThemeProvider wiring | `App.tsx` | Keep; later features pass/set dataSource |
| Domain `DataSource` | `src/domain/entities/data-source.ts` | Import type in theme + DataSourceLogo (presentation → domain OK per AD-001) |
| Brand SVGs | `src/assets/github/*`, `src/assets/gitlab/*` | Consumed **only** by `DataSourceLogo` |
| Storybook config | `.rnstorybook/main.ts`, `preview.tsx` | Extend stories glob (already covers `ds/**`); add globals decorator |
| `react-native-svg` | `package.json` | Already installed; add transformer as dependency |

### Integration Points

| System | Integration Method |
| --- | --- |
| App entry | `AppThemeProvider` wraps navigators (unchanged shell) |
| Storybook | Preview decorator injects `themeMode` + `dataSource` into provider |
| Future data-source selector | Will call `setDataSource` from provider API — not built here |
| Metro | Compose SVG transformer **inside** config before `withStorybook` |

---

## Components

### tokens / brand primary map

- **Purpose**: Mode palette + per-data-source primary hexes from brand docs.
- **Location**: `src/components/ds/tokens/colors.ts` (+ optional `brand-primary.ts`)
- **Interfaces**:
  - `primaryByDataSource: Record<DataSource, Record<ThemeMode, string>>`
  - GitHub light `#0FBF3E` / dark `#5FED83`; GitLab light `#FC6D26` / dark `#FCA326`
- **Dependencies**: `DataSource` type from domain
- **Reuses**: Existing `colors.light|dark` for non-primary tokens

### theme / getTheme + AppThemeProvider

- **Purpose**: Resolve `AppTheme` and expose mode + dataSource controls.
- **Location**: `src/components/ds/theme/`
- **Interfaces**:
  - `getTheme(mode: ThemeMode, dataSource: DataSource): AppTheme`
  - `AppThemeProvider({ initialMode?, initialDataSource?, children })`
  - `useAppTheme(): { mode, setMode, toggleMode, dataSource, setDataSource }`
  - `useTheme(): AppTheme` (styled-components)
- **Dependencies**: tokens, domain `DataSource`
- **Reuses**: Current provider pattern; default `dataSource = 'github'`

### atom — Typography

- **Purpose**: Typed text (body/label/caption/heading) via tokens.
- **Location**: `src/components/ds/atoms/Typography/`
- **Interfaces**: `TypographyProps` — `variant`, `size`, `tone`; **no** public `style`
- **Dependencies**: theme
- **Reuses**: Current `Text` implementation (rename + variants)

### atom — Icon

- **Purpose**: In-app vector icons (not brand logos).
- **Location**: `src/components/ds/atoms/Icon/`
- **Interfaces**: `name`, `size: Size`, `tone` → maps to `@expo/vector-icons`
- **Dependencies**: theme tokens
- **Reuses**: Expo vector icons package

### atom — Spacer

- **Purpose**: Tokenized inset on one edge.
- **Location**: `src/components/ds/atoms/Spacer/`
- **Interfaces**: exactly one of `top|bottom|left|right` + `size: Spacing` (required)
- **Dependencies**: theme.spacing
- **Reuses**: none (new)

### atom — Loading

- **Purpose**: Indeterminate spinner using theme primary.
- **Location**: `src/components/ds/atoms/Loading/`
- **Interfaces**: optional `size`; color from `theme.colors.primary`
- **Dependencies**: theme
- **Reuses**: RN `ActivityIndicator` wrapped

### molecule — Container

- **Purpose**: Layout surface with token padding.
- **Location**: `src/components/ds/molecules/Container/`
- **Interfaces**: `padding?: Spacing`, optional `flex`; background from `theme.colors.background|surface` via prop `tone`
- **Dependencies**: theme
- **Reuses**: none (new)

### molecule — Header

- **Purpose**: Title chrome + brand mark + optional trailing action.
- **Location**: `src/components/ds/molecules/Header/`
- **Interfaces**: `title: string`, `trailing?: ReactNode`; logo from `useAppTheme().dataSource` via `DataSourceLogo`
- **Dependencies**: Typography, DataSourceLogo, theme
- **Reuses**: none (new)

### organism — DataSourceLogo

- **Purpose**: Encapsulate brand logo rules (asset pick by source + mode).
- **Location**: `src/components/ds/organisms/DataSourceLogo/`
- **Interfaces**:
  - `dataSource?: DataSource` (default: context)
  - `size?: Size` (maps to px)
  - No public `style`; no SVG imports outside this module
- **Dependencies**: theme mode/source, SVG components from `src/assets/...`
- **Reuses**: brand asset files only

### Storybook preview globals

- **Purpose**: Switch mode + dataSource without editing stories.
- **Location**: `.rnstorybook/preview.tsx`
- **Interfaces**: global types / toolbar or on-device controls for `themeMode`, `dataSource`
- **Dependencies**: `AppThemeProvider`
- **Reuses**: existing decorator shell

### README Atomic Design section

- **Purpose**: Document levels + why logos are organisms.
- **Location**: `README.md` (Design System section update)

---

## Data Models

```typescript
type ThemeMode = 'light' | 'dark';
// from domain:
type DataSource = 'github' | 'gitlab';

type AppTheme = {
  mode: ThemeMode;
  dataSource: DataSource;
  colors: Record<ColorToken, string>; // primary already resolved
  spacing: typeof spacing;
  sizes: typeof sizes;
  radius: typeof radius;
};

type PrimaryBrandMap = Record<DataSource, Record<ThemeMode, string>>;
```

**Relationships**: `AppTheme.colors.primary` is derived from `PrimaryBrandMap[dataSource][mode]`; other color tokens come only from `mode`.

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
| --- | --- | --- |
| Missing Theme provider | `useAppTheme` / `useTheme` throw clear Error | Dev-time fail fast |
| Invalid / missing dataSource | Default `'github'` | Stable primary + logo |
| SVG transformer misconfig | Build/Storybook fail at bundle | Fix metro compose (documented in tasks) |
| Spacer without edge | TypeScript exclusive props (or runtime throw) | Compile-time guard |

---

## Risks & Concerns

| Concern | Location | Impact | Mitigation |
| --- | --- | --- | --- |
| Metro: Storybook `withStorybook` + SVG transformer conflict | `metro.config.js` | Storybook or SVG import breaks | Compose SVG resolver/transformer on base Expo config, then wrap with `withStorybook`; pin `react-native-svg-transformer` ≥ 1.5.2 for Expo 54 |
| Flat `components/` vs Atomic folders | `src/components/ds/components/Text.tsx` | Drift / duplicate exports | Migrate Text → atoms/Typography in same feature; barrel only exports Atomic paths |
| DS importing domain type | theme / logo | Layer purity debate | Allowed: presentation depends on domain; do **not** import infrastructure |
| Template Storybook demos noise | `.rnstorybook/stories/*` | Confuses catalog | Remove or quarantine; DS stories are primary |
| No component tests yet for DS | `src/components/ds` | Regressions on primary hex / Spacer | Add RNTL tests for theme primary resolution + Spacer + DataSourceLogo asset selection |
| GitLab logo light/dark | single RGB SVGs | May look weak on dark | Use as-is in v1; note in README; follow-up if tanuki dark variant appears |

---

## Tech Decisions (non-obvious)

| Decision | Choice | Rationale |
| --- | --- | --- |
| Theme + dataSource | Single `AppThemeProvider` | One decision point; matches “primary-only” brand swap |
| Brand SVGs | `react-native-svg-transformer/expo` | Typed components, size control; assets stay under organism |
| Icon vs Logo | Icon = vector-icons atom; Logo = organism | Brand rules ≠ UI glyphs |
| DataSource type | Import from `@/domain` | Single source of truth (AD-001/002) |
| Typography vs Text | Rename to Typography; optional `Text` re-export one release | Spec naming; avoid dual APIs long-term |
| Story titles | `DS/Atoms|Molecules|Organisms/...` | Atomic nav in Storybook |

### Project-level decisions to append (on design approval)

- **AD-009**: DS tree follows Atomic Design under `src/components/ds/` (`tokens` / `atoms` / `molecules` / `organisms`); product screens are organisms when built.
- **AD-010**: `theme.colors.primary` resolves from brand maps by `(ThemeMode, DataSource)` using official GitHub/GitLab hexes locked in context.
- **AD-011**: Brand SVGs for GitHub/GitLab may only be imported inside `DataSourceLogo` organism.

---

## Confirm before Tasks

Approve this design (Approach A) to proceed to `tasks.md`? If you prefer Approach B (Image assets, no SVG transformer), say so before Tasks.
