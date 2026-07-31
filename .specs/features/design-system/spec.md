# Design System Specification

## Problem Statement

O app precisa de um Design System tipado, previsível e catalogado no Storybook, com tema claro/escuro e `primary` variando por data-source (GitHub/GitLab). Sem Atomic Design explícito e sem primitives de layout/feedback, as telas futuras voltam a `style` solto e inconsistência visual.

## Goals

- [ ] Estrutura Atomic Design no DS (`tokens` → `atoms` → `molecules` → `organisms`) documentada no README
- [ ] Tema light/dark com `primary` resolvido por data-source
- [ ] Atoms: Typography, Icon, Spacer, Loading — tipados, sem `style` solto nas APIs públicas
- [ ] Molecules: Container, Header — compostos só de tokens/atoms (+ DataSourceLogo organism no Header)
- [ ] Organism `DataSourceLogo` encapsulando regras de marca GitHub/GitLab (assets oficiais)
- [ ] Cada componente desta fatia com story no Storybook e controles de mode + data-source
- [ ] Cada peça do DS desta fatia (theme helpers + atoms + molecules + DataSourceLogo) coberta por testes unitários (Jest + RNTL)
## Out of Scope

| Feature | Reason |
| --- | --- |
| Button, Input, Card, Badge, Avatar | Feature DS seguinte (enunciado §6.2 restante) |
| Showcase in-app completo | Vai com os componentes restantes |
| Telas de produto (busca, detalhes, issues) | Features posteriores; organisms de tela depois — nesta fatia o organism entregue é o logo de marca |
| Troca de data-source de ponta a ponta na app | Feature `data-source-selector` / infra; aqui só o contrato de tema consome `DataSource` |
| Persistência de tema/fonte | Não requerido nesta fatia |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Primary por data-source | Só `primary` muda; resto do palette por mode | Decisão do discuss | y |
| GitHub brand colors | Light `#0FBF3E` / dark `#5FED83`; fonte [brand.github.com/foundations/color](https://brand.github.com/foundations/color) | Paleta oficial; Copilot/Security fora do escopo | y |
| GitLab brand colors | Light `#FC6D26` (Orange 02p) / dark `#FCA326` (Orange 01p); fonte [design.gitlab.com/brand-design/color](https://design.gitlab.com/brand-design/color/) | Hero = orange do logo; purple/secundários fora | y |
| Spacing API | Atom `Spacer` only | Decisão do discuss | y |
| Typography naming | Evoluir `Text` → `Typography` (Heading via `variant`) | Evita dois sistemas tipográficos | y |
| Icon set | `@expo/vector-icons` atrás de API tipada (`name`, `size`, `tone`) | Já na stack Expo | y |
| Header contents | Título + DataSourceLogo organism + ação opcional | Logo de marca, não ícone genérico | y |
| Organisms nesta fatia | `DataSourceLogo` (GitHub/GitLab); telas só por convenção/pasta | Logos têm regras de marca fora do app UI | y |
| Storybook globals | Controls `themeMode` + `dataSource` no preview/decorator | Cataloga as 4 combinações light/dark × github/gitlab | y |
| Testes do DS | Jest + RNTL **unitários** para theme + cada atom/molecule/organism desta fatia; stories não substituem testes | README do projeto + qualidade do teste técnico | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Atomic Design structure + README ⭐ MVP

**User Story**: As a developer, I want the DS organized by Atomic Design so that I know where each UI piece belongs.

**Why P1**: Base for todos os componentes e para a avaliação do teste (clareza arquitetural).

**Acceptance Criteria**:

1. WHEN the DS tree is inspected THEN it SHALL expose folders (or clear modules) for `tokens`, `atoms`, `molecules`, and `organisms`
2. WHEN the README Design System section is read THEN it SHALL document the Atomic Design levels and list what belongs in each (including brand data-source logos as organisms, and screens as organisms)
3. WHEN a new UI piece is added THEN it SHALL live in exactly one Atomic Design level consistent with that documentation

**Independent Test**: Open `src/components/ds` and README — structure and docs match the table in context.

---

### P1: Theme light/dark + primary by data-source ⭐ MVP

**User Story**: As a user/developer, I want the theme to support light/dark and a primary color that reflects the active data source so that branding stays coherent without forking components.

**Why P1**: Requisito explícito desta feature; alimenta Header e Typography `tone="primary"`.

**Acceptance Criteria**:

1. WHEN theme mode is `light` or `dark` THEN system SHALL resolve background/surface/text/muted/border/success/warning/danger for that mode
2. WHEN data source is `github` THEN `theme.colors.primary` SHALL equal the GitHub primary token for the current mode
3. WHEN data source is `gitlab` THEN `theme.colors.primary` SHALL equal the GitLab primary token for the current mode
4. WHEN mode or data source changes at runtime (via provider API) THEN consumers using `theme.colors.primary` SHALL re-render with the new primary without remounting the tree
5. WHEN data source is `github` and mode is `light` THEN `theme.colors.primary` SHALL be `#0FBF3E` (GitHub Green / Green 4)
6. WHEN data source is `github` and mode is `dark` THEN `theme.colors.primary` SHALL be `#5FED83` (Green 3)
7. WHEN data source is `gitlab` and mode is `light` THEN `theme.colors.primary` SHALL be `#FC6D26` (Orange 02p)
8. WHEN data source is `gitlab` and mode is `dark` THEN `theme.colors.primary` SHALL be `#FCA326` (Orange 01p)
9. WHEN `style` prop is used to override theme colors on public DS component APIs THEN TypeScript SHALL not expose a free `style` escape on those public props (controlled props only: variant/size/tone/etc.)

**Independent Test**: In Storybook, toggle mode + dataSource and assert primary on Typography/Icon/Header indicator changes; other tokens follow mode only.

---

### P1: Atoms — Typography, Icon, Spacer, Loading ⭐ MVP

**User Story**: As a developer, I want typed atoms so that screens never invent one-off text, icons, gaps, or spinners.

**Why P1**: Foundation of every screen.

**Acceptance Criteria**:

1. WHEN Typography is rendered with `variant` and `size` THEN it SHALL use theme size/color tokens (no raw px/color strings in call sites)
2. WHEN Icon is rendered with `name`, `size`, and `tone` THEN it SHALL map size/tone to tokens and render via the icon wrapper (not ad-hoc VectorIcon in product code for DS icons)
3. WHEN Spacer is rendered with a spacing edge (`top`\|`bottom`\|`left`\|`right`) and a spacing token (`xs`\|`sm`\|`md`\|`lg`\|`xl`) THEN it SHALL occupy that inset using `theme.spacing`
4. WHEN Loading is shown THEN it SHALL display an indeterminate indicator using theme primary (or muted) — no unstyled ActivityIndicator with hardcoded colors in DS Loading
5. WHEN each atom is opened in Storybook THEN at least one story SHALL exist covering default + key variants/states
6. WHEN each atom is shipped THEN it SHALL have colocated Jest + RNTL unit tests asserting token-driven behavior (not stories-only)

**Independent Test**: `pnpm test` covers Typography, Icon, Spacer, Loading; `pnpm storybook` shows Atoms stories.

---

### P1: Molecules — Container, Header ⭐ MVP

**User Story**: As a developer, I want layout Container and app Header molecules so that screens share padding and chrome.

**Why P1**: Needed before organisms/screens.

**Acceptance Criteria**:

1. WHEN Container is used THEN it SHALL apply layout + padding via spacing tokens (controlled props, not free style)
2. WHEN Header is rendered THEN it SHALL show a title and the active data-source brand via the `DataSourceLogo` organism (not a raw SVG import or generic Icon)
3. WHEN Header receives an optional trailing action slot THEN it SHALL render that action without breaking title/logo layout
4. WHEN Container/Header stories load in Storybook THEN mode and dataSource globals SHALL affect primary-driven parts of Header and which logo organism variant appears
5. WHEN Container and Header are shipped THEN each SHALL have colocated Jest + RNTL unit tests (Header asserts DataSourceLogo usage; Container asserts token padding)

**Independent Test**: `pnpm test` for Container/Header; Storybook Molecules stories.

---

### P1: Storybook mapping ⭐ MVP

**User Story**: As a developer, I want every DS piece in this feature discoverable in Storybook under Atomic Design grouping.

**Why P1**: Catálogo no dispositivo é o “Showcase” desta fatia.

**Acceptance Criteria**:

1. WHEN Storybook starts (`pnpm storybook`) THEN stories for Typography, Icon, Spacer, Loading, Container, Header, and DataSourceLogo SHALL be listed
2. WHEN the preview decorator runs THEN the developer SHALL be able to switch `themeMode` (light/dark) and `dataSource` (github/gitlab) without editing story code
3. WHEN template demo stories under `.rnstorybook/stories/` conflict with the DS catalog THEN they SHALL be removed or clearly separated so the DS catalog is the primary navigation

**Independent Test**: Launch Storybook on device/emulator; switch globals; open each listed story.

---

### P1: Organism — DataSourceLogo ⭐ MVP

**User Story**: As a developer, I want each data-source brand logo as a DS organism so that brand asset rules stay isolated from atoms/molecules and app screens.

**Why P1**: Logos are external brand material (official SVGs, light/dark variants, toolkit rules) — not in-app Icon atoms.

**Acceptance Criteria**:

1. WHEN `DataSourceLogo` is rendered with `dataSource="github"` and mode `light` THEN it SHALL use the black Invertocat asset from `src/assets/github/`
2. WHEN `DataSourceLogo` is rendered with `dataSource="github"` and mode `dark` THEN it SHALL use the white Invertocat asset from `src/assets/github/`
3. WHEN `DataSourceLogo` is rendered with `dataSource="gitlab"` THEN it SHALL use a GitLab logo SVG from `src/assets/gitlab/`
4. WHEN size is provided via controlled props (token-based) THEN the logo SHALL scale without free `style` on the public API
5. WHEN molecules/screens need a data-source mark THEN they SHALL consume `DataSourceLogo` — brand SVGs SHALL NOT be imported directly outside the organism module
6. WHEN the README documents organisms THEN it SHALL explain that brand logos are organisms because brand rules exceed in-app UI iconography; product screens are also organisms (later)
7. WHEN DataSourceLogo is shipped THEN it SHALL have colocated Jest + RNTL unit tests covering the github×mode and gitlab asset-selection matrix

**Independent Test**: `pnpm test` selection matrix; Storybook Organisms — toggle mode/dataSource.

---

### P1: Unit tests for DS pieces ⭐ MVP

**User Story**: As a developer, I want unit tests for every DS piece in this feature so that theme and component contracts are enforced without relying on Storybook alone.

**Why P1**: Qualidade exigida no teste técnico; stories catalogam, testes garantem regressão.

**Acceptance Criteria**:

1. WHEN `pnpm test` runs THEN unit tests SHALL cover `getTheme` / primary resolution for all four `(mode, dataSource)` primary hex outcomes plus default `github`
2. WHEN `pnpm test` runs THEN unit tests SHALL cover Typography, Icon, Spacer, Loading, Container, Header, and DataSourceLogo
3. WHEN a DS component is considered done THEN its unit tests SHALL live colocated with the component (or in a colocated `__tests__` folder) and SHALL pass in the same gate as the implementation
4. WHEN only Storybook stories exist for a DS component in this feature THEN that SHALL NOT satisfy this requirement

**Independent Test**: `pnpm test` lists/passes suites under `src/components/ds/**/__tests__` for theme + each component above.

---

### P2: Screens as organisms (convention)

**User Story**: As a developer, I want product screens to live as organisms under the DS in later features.

**Why P2**: Convenção documentada agora; implementação das telas depois.

**Acceptance Criteria**:

1. WHEN the DS tree is inspected THEN an `organisms` module/folder SHALL exist (contains at least `DataSourceLogo`)
2. WHEN the project README documents Atomic Design THEN it SHALL state that product screens will be organisms under the DS

**Independent Test**: Folder + DataSourceLogo + README sentence present.

---

## Edge Cases

- WHEN data source is undefined in provider THEN system SHALL default to `github` primary
- WHEN Spacer receives no edge THEN system SHALL require an explicit edge (compile-time or runtime guard) — no invisible zero-size default that hides misuse
- WHEN Loading is used on dark mode THEN indicator SHALL remain visible against `background`/`surface`
- WHEN Typography `tone="primary"` and data source flips THEN text color SHALL update to the new primary
- WHEN mode flips with GitHub logo THEN Invertocat SHALL switch black ↔ white without caller logic
- WHEN a screen imports a brand SVG from `src/assets/github|gitlab` directly THEN that is a SPEC violation — use `DataSourceLogo`

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| DS-01 | P1: Atomic structure + README | Design | Partial (T4) |
| DS-02 | P1: Theme mode + primary by data-source | Design | Partial (T1–T2) |
| DS-03 | P1: Typography atom | Design | Done |
| DS-04 | P1: Icon atom | Design | Done |
| DS-05 | P1: Spacer atom | Design | Done |
| DS-06 | P1: Loading atom | Design | Done |
| DS-07 | P1: Container molecule | Design | Pending |
| DS-08 | P1: Header molecule | Design | Pending |
| DS-09 | P1: Storybook mapping + globals | Design | Pending |
| DS-10 | P1: DataSourceLogo organism | Design | Pending |
| DS-11 | P2: Screens as organisms (convention) | Design | Pending |
| DS-12 | P1: Unit tests for DS pieces | Tasks | Pending |

**Coverage:** 12 total, mapped in tasks.md (DS-12 → T2, T5–T11)

---

## Success Criteria

- [ ] `pnpm storybook` shows atoms/molecules/organisms with working light/dark × github/gitlab primary + logos
- [ ] `pnpm test` passes unit suites for theme primary map + Typography, Icon, Spacer, Loading, Container, Header, DataSourceLogo
- [ ] README documents Atomic Design levels: brand logos + screens as organisms
- [ ] Public DS APIs for this slice use controlled props (no free `style`); brand SVGs only inside `DataSourceLogo`
- [ ] Existing `Text` is superseded or aliased cleanly by Typography without breaking the app entry that already uses `AppThemeProvider`
