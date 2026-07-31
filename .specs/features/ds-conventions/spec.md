# Design System Conventions Alignment Specification

## Problem Statement

A fatia `design-system` entregou atoms/molecules/organisms funcionais, mas a estrutura e o estilo violam as regras de projeto AD-012..014: falta `styles.tsx`, há `switch`/style solto, e Typography hardcoda `fontWeight`/`lineHeight` sem tokens tipográficos com `fontFamily`. Sem alinhar agora, cada componente novo replica o anti-padrão.

## Goals

- [ ] Toda peça DS (atoms/molecules/organisms desta fatia) segue o shape `index.ts` + `<Name>.tsx` + `<Name>.stories.tsx` + `styles.tsx`
- [ ] Estilos do DS usam sempre `styled-components` definidos só em `styles.tsx` (sem `StyleSheet` / style object de chrome)
- [ ] Lookups de variant/tone/size/asset usam object maps, não `switch`/`case`
- [ ] Tokens tipográficos por variant incluem `fontFamily`, `fontWeight`, `lineHeight` (+ size); Typography consome esses tokens
- [ ] Testes unitários existentes passam e cobrem o contrato tipográfico / maps onde o AC exige

## Out of Scope

| Feature | Reason |
| --- | --- |
| Novos atoms (Button, Input, Card, Badge, Avatar) | Feature DS seguinte |
| Tela Showcase in-app | Feature posterior |
| Carregar famílias custom via `expo-font` / bundling de arquivos `.ttf` | Nesta fatia: tokens apontam para family de sistema; load custom é follow-up |
| Troca de data-source / tema de produto | Já coberto em `design-system` |
| Redesign visual (novas cores, spacing scale) | Só estrutura + tipografia tokenizada; valores atuais preservados salvo tipografia |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Module shape | AD-012: `index` + `Name.tsx` + `Name.stories.tsx` + `styles.tsx` | Já decidido | y |
| Always styled | AD-012: chrome via `styled(...)` em `styles.tsx` | Já decidido; Icon/Loading/Spacer/Container/Header/Logo wrappers incluídos | y |
| Object maps | AD-013: sem `switch`/`case` em lookups DS | Já decidido | y |
| Typography tokens | AD-014: por variant com `fontFamily`, `fontWeight`, `lineHeight` | Já decidido | y |
| `fontFamily` values | Tokens usam famílias de sistema do RN (ex. plataforma default / stack do tema); **sem** novos assets de fonte nesta feature | Evita acoplar refactor a expo-font; family custom = follow-up | y |
| Size vs variant | Variant tipográfica carrega weight/lineHeight/family; `size` prop continua mapeando `theme.sizes` (ou size tipográfico no token se conflitar — preferir: token variant define lineHeight/weight/family; size prop override de font-size via `sizes`) | Mantém API pública Typography (`variant`, `size`, `tone`) estável | y |
| Legacy `components/Text` | Remover ou re-export deprecated → Typography; sem dual source | Evita drift | y |
| DataSourceLogo | Seleção de asset via object map `Record<LogoAsset, Component>`; size via styled ou props no map | AD-013 + AD-011 (SVG só no organism) | y |
| Spacer / Container / Header | Migrar de `style={{...}}` para styled em `styles.tsx` | AD-012 | y |
| Unit tests | Atualizar/adicionar asserts de tokens tipográficos e ausência de `switch` não é requisito de teste; contrato: Typography aplica fontFamily/weight/lineHeight do token; gate `pnpm test` | Qualidade + AD-006 | y |

**Open questions:** none — user confirmed system `fontFamily` (2026-07-31).

---

## User Stories

### P1: Module shape + styles.tsx for all DS pieces ⭐ MVP

**User Story**: As a developer, I want every DS component folder to follow the same file layout so that styled code never mixes with composition.

**Why P1**: AD-012; base para qualquer peça nova.

**Acceptance Criteria**:

1. WHEN any atom/molecule/organism folder under `src/components/ds/{atoms,molecules,organisms}/` is inspected THEN it SHALL contain `index.ts`, `<Name>.tsx`, `<Name>.stories.tsx`, and `styles.tsx`
2. WHEN styled factories are searched in that tree THEN they SHALL exist only inside `styles.tsx` files (no `styled(` in `<Name>.tsx`)
3. WHEN DS chrome is styled THEN it SHALL use `styled-components` — no `StyleSheet.create` and no free `style={{...}}` objects for layout/chrome on `View` wrappers of Typography, Icon, Spacer, Loading, Container, Header, DataSourceLogo (controlled size/color props on third-party leaves may pass through styled attrs)
4. WHEN the public barrel exports a component THEN it SHALL continue to export from `index.ts` without changing the public import path consumers already use (`@/components/ds/...`)

**Independent Test**: Tree listing + grep for `styled(` / `StyleSheet` / chrome `style={{` under ds atoms/molecules/organisms.

---

### P1: Object maps instead of switch ⭐ MVP

**User Story**: As a developer, I want variant/tone/size/asset lookups as object maps so that extending tokens is typed and consistent.

**Why P1**: AD-013.

**Acceptance Criteria**:

1. WHEN tone → color is resolved (Typography, Icon, etc.) THEN resolution SHALL use an object map keyed by tone, not `switch`/`case`
2. WHEN typography variant → font metrics is resolved THEN resolution SHALL use an object map (or direct token record), not `switch`/`case`
3. WHEN DataSourceLogo picks an SVG asset THEN selection SHALL use an object map from key → component (or equivalent map), not `switch`/`case`
4. WHEN Spacer edge → dimension axis is resolved THEN it SHALL use a map (or typed edge→style map), not a multi-branch `switch` for styling

**Independent Test**: Grep `switch` under `src/components/ds/atoms|molecules|organisms` returns none for lookup logic (runtime throw guards for invalid Spacer edge may remain as guard, not style lookup).

---

### P1: Typography tokens + Typography atom ⭐ MVP

**User Story**: As a developer, I want typography metrics tokenized per variant (including `fontFamily`) so that RN text actually respects the typeface and screens never hardcode weight/line-height.

**Why P1**: AD-014; Typography atual é o pior ofensor.

**Acceptance Criteria**:

1. WHEN tokens are inspected THEN a typography token module SHALL expose per-variant entries for at least `body`, `label`, `caption`, `heading`, each with `fontFamily`, `fontWeight`, and `lineHeight`
2. WHEN `getTheme` / theme consumers need typography THEN theme SHALL expose those typography tokens (or Typography SHALL read them from the tokens module via theme consistently with other token families)
3. WHEN Typography renders with a `variant` THEN it SHALL apply that variant’s `fontFamily`, `fontWeight`, and `lineHeight` from tokens (not literals in the component/styles file beyond reading the token)
4. WHEN Typography renders with `size` THEN font-size SHALL come from size tokens (`theme.sizes`), except where heading rules already defined in prior spec remain token-driven
5. WHEN Typography renders with `tone` THEN color SHALL resolve via tone→color object map into theme colors
6. WHEN unit tests for Typography run THEN they SHALL assert token-driven `fontFamily` / weight / lineHeight behavior for variants (precise token values as defined in the token module)
7. WHEN public Typography props are typed THEN they SHALL still exclude free `style`

**Independent Test**: `pnpm test` Typography suite; inspect token file + styles.tsx.

---

### P1: Migrate remaining DS pieces to conventions ⭐ MVP

**User Story**: As a developer, I want Icon, Spacer, Loading, Container, Header, and DataSourceLogo migrated so the catalog is consistent.

**Why P1**: AD-012 applies to all pieces of the prior feature, not only Typography.

**Acceptance Criteria**:

1. WHEN Icon is rendered THEN color/size mapping SHALL use tokens + object maps; visual wrapper via `styles.tsx` (`styled` around the vector icon host)
2. WHEN Spacer is rendered THEN edge inset SHALL be applied via styled styles from spacing tokens (no chrome `style={{ height|width }}` in the composition file)
3. WHEN Loading is rendered THEN indicator color SHALL remain `theme.colors.primary` via styled attrs/theme; size mapping via object map
4. WHEN Container is rendered THEN padding/tone/flex SHALL be expressed via styled props + tokens
5. WHEN Header is rendered THEN layout chrome SHALL be styled in `styles.tsx`; still uses Typography + DataSourceLogo; no brand SVG imports
6. WHEN DataSourceLogo is rendered THEN asset matrix (github×mode, gitlab) SHALL still hold; implementation uses object map + styles as needed for size
7. WHEN legacy `src/components/ds/components/Text*` remains THEN it SHALL be removed or become a thin re-export of Typography only (single source of truth)

**Independent Test**: `pnpm test` for each component suite; folder shape check.

---

### P2: README / Storybook titles unchanged where possible

**User Story**: As a developer, I want the README Atomic Design section to mention the per-component file shape so onboarding matches AD-012.

**Why P2**: Docs catch-up; behavior already covered by P1.

**Acceptance Criteria**:

1. WHEN the README Design System section is read THEN it SHALL document the per-component files (`index`, component, stories, `styles.tsx`) and that styled lives only in `styles.tsx`
2. WHEN Storybook titles are checked THEN existing `DS/Atoms|Molecules|Organisms/...` titles SHALL remain valid (no catalog regression)

**Independent Test**: README grep + `pnpm storybook` smoke (manual).

---

## Edge Cases

- WHEN a typography variant key is missing from the token map THEN TypeScript SHALL prevent invalid variant at compile time (public props union = token keys)
- WHEN Spacer is called without an edge THEN system SHALL still reject (type-level exclusive props and/or runtime guard) — unchanged contract
- WHEN Icon/Loading wrap third-party components THEN styled wrapper SHALL not reintroduce public `style` prop on the DS API
- WHEN theme mode/dataSource flips THEN Typography `tone="primary"` SHALL still follow primary (existing AC preserved)
- WHEN DataSourceLogo size token changes THEN rendered width/height SHALL follow `theme.sizes` / size token map

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| DSC-01 | P1: Module shape + styles.tsx | Tasks | ✅ Verified |
| DSC-02 | P1: Object maps | Tasks | ✅ Verified |
| DSC-03 | P1: Typography tokens + atom | Tasks | ✅ Verified |
| DSC-04 | P1: Migrate remaining pieces | Tasks | ✅ Verified |
| DSC-05 | P2: README module shape | Tasks | ✅ Verified |

**Coverage:** 5 total, mapped in `tasks.md` (T1–T10)

---

## Success Criteria

- [ ] Grep/`find` shows every DS component folder has `styles.tsx`; no `styled(` outside `styles.tsx` in atoms/molecules/organisms
- [ ] No chrome `StyleSheet` / free layout `style={{` in composition files for the listed components
- [ ] No lookup `switch`/`case` for tone/variant/asset in those components (guards OK)
- [ ] Typography tokens include `fontFamily`, `fontWeight`, `lineHeight` per variant; tests assert them
- [ ] `pnpm test` && `pnpm lint` green; Storybook catalog still lists all seven components

---

## Closure notes (Medium)

- **Dimensions**: remaining implicit-requirement dimensions N/A for this refactor scope (no persistence, auth, payments, concurrency, external API).
- **Confirmed**: system `fontFamily` without expo-font in this slice (2026-07-31).
