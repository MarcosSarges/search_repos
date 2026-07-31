# Design System Context

**Gathered:** 2026-07-30
**Spec:** `.specs/features/design-system/spec.md`
**Status:** Spec confirmed — Design draft ready for approval

---

## Decisions (locked)

### Atomic Design structure

| Level | Contents |
| --- | --- |
| tokens | spacing, colors, sizes, radius |
| atoms | Typography, Icon, Spacer, Loading |
| molecules | Container (layout + padding), Header |
| organisms | **Data-source brand logos** (GitHub / GitLab); product screens (later features) |

**Why logos are organisms (not Icon atoms):** brand assets live outside app UI iconography — official SVGs, light/dark variants, clearspace, and brand-toolkit rules that are not “just” in-app chrome. Encapsulating those rules in an organism keeps atoms/molecules free of brand policy.

### Theme × data-source

Only the `primary` color token changes by active data source (`github` | `gitlab`). Light/dark modes keep the rest of the palette; primary resolves as `(mode, dataSource)`.

### GitHub brand palette (source of truth)

Official docs: [GitHub Brand — Color](https://brand.github.com/foundations/color).  
Primary palette anchors on neutrals + singular hero **GitHub Green**; green is the key player, neutrals/black/white ground it. Assets: `src/assets/github/` (Invertocat black + white).

| Name | Hex | Role in DS |
| --- | --- | --- |
| GitHub Green / Green 4 | `#0FBF3E` | `primary` in **light** when data-source = github |
| Green 3 | `#5FED83` | `primary` in **dark** when data-source = github (readable on dark surfaces) |
| Green 1–2, 5–6 | `#BFFFD1` … `#0A241B` | brand scale reference only (not separate DS tokens in this slice) |
| Gray 1–6 | `#F2F5F3` … `#101411` | brand neutrals reference only (primary-only rule for data-source) |

**Out of this slice:** Copilot Purple / Security Blue secondary themes from the same brand page — not used for data-source theming.

**Logo organism assets:** `src/assets/github/GitHub_Invertocat_Black.svg`, `GitHub_Invertocat_White_Clearspace.svg` — black on light, white on dark.

### GitLab brand palette (source of truth)

Official docs: [Pajamas — Brand Color](https://design.gitlab.com/brand-design/color/).  
Primary palette: White, Charcoal, signature oranges + purples from the core logo. Hero accent for our DS = **Orange 02p** (logo orange).

| Name | Hex | Role in DS |
| --- | --- | --- |
| Orange 02p | `#FC6D26` | `primary` in **light** when data-source = gitlab |
| Orange 01p | `#FCA326` | `primary` in **dark** when data-source = gitlab (lighter orange for contrast) |
| Orange 03p | `#E24329` | brand reference only |
| Purple 01p / 02p | `#A989F5` / `#7759C2` | brand reference (Pajamas uses these for links; not our data-source primary) |
| White / Charcoal | `#FFFFFF` / `#171321` | brand neutrals reference only |
| Secondary (teals, grays, pinks, gradients) | — | out of this slice |

**Logo organism assets:** `src/assets/gitlab/gitlab-logo-500-rgb.svg`, `gitlab-logo-600-rgb.svg`.

### DataSourceLogo organism

- Single organism API keyed by `DataSource` (+ theme mode) that picks the correct brand SVG and size.
- Call sites (e.g. Header) MUST use this organism — never import brand SVGs ad hoc in molecules/screens.
- Likely the only organism shipped in this DS slice; product screens remain organisms by convention but land in later features.

### Spacing utilities

Atom `Spacer` only — gap/margin via spacing tokens (`top` / `bottom` / `left` / `right` or equivalent size prop). No margin prop system on Box in this feature.

### Scope vs tech-test base components

Button, Input, Card, Badge, Avatar (and full in-app Showcase of those) are **out of this feature** — deferred to a follow-up DS feature. This slice delivers the foundation + Storybook mapping for the listed atoms/molecules/logo organism.

### Storybook

Stories colocated (or mirrored) by Atomic Design level; global controls for theme mode (light/dark) and data source (github/gitlab) so primary variation and logo organism are visible without code changes.

### README

Document Atomic Design separation (levels + what belongs where) in the project README under Design System — including why brand logos are organisms.

### Unit tests (locked)

Every DS piece in this feature — theme/`getTheme`, Typography, Icon, Spacer, Loading, Container, Header, DataSourceLogo — MUST have colocated Jest + RNTL **unit** tests. Storybook stories catalog behavior; they do **not** replace unit tests.

### DS component module shape (locked — AD-012)

Each atom/molecule/organism folder:

| File | Role |
| --- | --- |
| `index.ts` | public barrel export |
| `<Name>.tsx` | composition only (no styled factory) |
| `<Name>.stories.tsx` | Storybook |
| `styles.tsx` | **only** place that instantiates `styled(...)` |

Always use `styled-components` for DS visual styles — no `StyleSheet.create` / free `style` for DS chrome.

### Object maps over switch (locked — AD-013)

Variant/tone/size resolution in styled layers and token helpers uses object maps (`Record` / `satisfies`), not `switch`/`case`.

### Typography tokens (locked — AD-014)

Per-variant font tokens must include `fontFamily`, `fontWeight`, and `lineHeight`. React Native only respects a typeface when `fontFamily` is set. Hardcoded weight/line-height in `Typography.tsx` is a violation to fix.

---

## Deferred ideas

- Button, Input, Card, Badge, Avatar + in-app Showcase screen
- Full product screens as organisms (search, details, issues) — structure reserved; screens built in later features
