# DS as Lib Specification

## Problem Statement

O Design System vive em `src/components/ds/` e vaza dependências de application/Zustand no theme layer, o que conflita com Clean Architecture (AD-001) e com a ideia de UI kit reutilizável. O `Container` atual não cobre layout real (padding só uniforme, flexbox condicional), então as telas ainda usam `View` solto. Precisamos extrair o DS como lib, enriquecer o layout box e cobrir SafeArea + teclado sem redesenhar o visual.

## Goals

- [ ] DS em `packages/ds`, importável via `@ds` / `@ds/*`, sem imports do app (`@/application`, `@/stores`, etc.)
- [ ] Bridge de tema em presentation; provider da lib recebe `theme` montado
- [ ] `Container` como layout box (shorthands de spacing, flexbox, `safe` por edges, `keyboardDismiss`)
- [ ] Molecule `KeyboardAvoid` componível com `Container`
- [ ] Migração big-bang dos consumers + testes/stories verdes; `View` de layout trivial trocado por `Container` onde drop-in

## Out of Scope

| Feature | Reason |
| --- | --- |
| pnpm workspace / package.json publicado | Escolhido alias + pasta (1A), sem monorepo formal |
| Redesign visual (novas cores, tipografia, densidades) | Fatia 4A: move + API, não polish amplo |
| Host `ScrollView` no Container | Adiado; FlatList/Scroll ficam nos consumers |
| Unificar API `safe` do Header com edges do Container | Header top-only permanece; unificação = follow-up |
| Novos atoms de produto (Badge, Avatar, …) | Features DS anteriores/seguintes |
| Trocar `Pressable` / `FlatList` por primitives DS | Só `View` de layout drop-in nesta fatia |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Path da lib | `packages/ds` | Sinaliza pacote interno sem workspace | y |
| Alias | `@ds` + `@ds/*` | Curto; separado de `@/*` → `src/*` | y |
| Assets de marca | Movem para a lib; só organism de logo importa SVGs | Lib autocontida; AD-011 relocado | y |
| Pureza da lib | Zero imports `@/application` / `@/stores` / app | Clean Arch 2A | y |
| Marca tipada | `Brand = 'github' \| 'gitlab'` na lib; app mapeia `DataSource → Brand` | Substitui acoplamento a application | y |
| Theme provider | Lib recebe `theme` pronto; bridge em presentation | 2A confirmado | y |
| `getTheme` | Fica na lib: `getTheme(mode, brand)`; `AppTheme.brand` (não `DataSource`) | Factory pura na lib | y |
| Container spacing | Shorthands `p`/`px`/…/`gap` + margins `m`/`mx`/…; só tokens `Spacing` | 3A + consistência AD | y |
| Container flex | `flex?: number` + `direction`/`justify`/`align`/`wrap` sempre aplicáveis | Substitui boolean + css condicional | y |
| SafeArea | `safe?: boolean \| ReadonlyArray<Edge>`; `true` = all edges; via `safe-area-context` | Confirmado B | y |
| Keyboard dismiss | `keyboardDismiss?: boolean` no Container | Confirmado A | y |
| Keyboard avoid | Molecule `KeyboardAvoid` separado | Confirmado A | y |
| Migração | Big-bang, sem shim `src/components/ds` | 4A | y |
| Views | Só layout `View` → `Container` drop-in | Evita wrapping incorreto de listas | y |
| Convenções AD-012/013/017 | Mantidas na lib (pasta por peça, styled só em `styles.tsx`, object maps) | Continuidade do DS | y (assumido) |
| Nome do provider da lib | `DsThemeProvider` | Discrição do agent | n (agent) |
| Defaults KeyboardAvoid | `behavior`/`offset` sensatos por plataforma | Discrição do agent | n (agent) |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Extrair DS para `packages/ds` + alias `@ds` ⭐ MVP

**User Story**: As a developer, I want the design system outside `src` as an importable lib so that presentation/domain stay Clean Arch–clean and the UI kit has a clear boundary.

**Why P1**: Sem a extração, o resto da API nova continua no lugar errado.

**Acceptance Criteria**:

1. WHEN the repository tree is inspected THEN the DS source SHALL live under `packages/ds` (tokens, atoms, molecules, organisms, theme) and SHALL NOT remain under `src/components/ds`
2. WHEN TypeScript path aliases are configured THEN `@ds` and/or `@ds/*` SHALL resolve to `packages/ds` and app code SHALL import the DS via that alias (not `@/components/ds`)
3. WHEN any file under `packages/ds` is analyzed for imports THEN it SHALL NOT import from `@/application`, `@/stores`, `@/presentation`, `@/domain`, or other `@/` app modules
4. WHEN brand SVG assets are resolved THEN they SHALL live under the lib (e.g. `packages/ds/assets/...`) and only the brand logo organism SHALL import them
5. WHEN Storybook, Jest, and app entry import the DS THEN they SHALL use `@ds` (or `@ds/...`) successfully

**Independent Test**: Grep shows zero `@/components/ds`; `packages/ds` exists; `pnpm test` includes DS tests via new paths.

---

### P1: Theme bridge puro + `Brand` ⭐ MVP

**User Story**: As a developer, I want the lib theme API free of Zustand/`DataSource` so that the app owns session wiring and the lib only renders a theme object.

**Why P1**: Fecha o vazamento Clean Arch no provider atual.

**Acceptance Criteria**:

1. WHEN `getTheme` is called with a `ThemeMode` and a `Brand` THEN it SHALL return an `AppTheme` whose `colors.primary` matches the brand×mode tokens and whose theme identity uses `brand` (not application `DataSource`)
2. WHEN the lib theme provider mounts with a `theme` prop THEN styled-components consumers inside SHALL receive that theme object
3. WHEN the app boots product UI THEN a presentation-layer bridge SHALL read session preferences, map `DataSource` → `Brand`, build theme via `getTheme`, and wrap children with the lib theme provider
4. WHEN hydration/splash/SecureStore token hydrate logic runs THEN it SHALL live in the presentation bridge (or existing app stores), not inside `packages/ds`
5. WHEN `DataSourceLogo` is rendered THEN it SHALL accept `brand` (prop and/or theme.brand) and SHALL NOT import `@/application`

**Independent Test**: Unit tests for `getTheme(brand)`; provider test with injected theme; bridge test still covers hydrate gate without DS importing stores.

---

### P1: Container layout box + SafeArea + keyboardDismiss ⭐ MVP

**User Story**: As a developer, I want `Container` to replace layout `View` with tokenized spacing, flexbox, safe edges, and optional keyboard dismiss so that screens do not drop to raw `View` for padding/layout.

**Why P1**: Dor explícita do usuário; habilita matar `View` de layout.

**Acceptance Criteria**:

1. WHEN `Container` receives spacing shorthands (`p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`, `gap`, `m`, `mx`, `my`, `mt`, `mb`, `ml`, `mr`) with `Spacing` token keys THEN it SHALL apply the corresponding theme.spacing values on the correct edges (and gap when set)
2. WHEN a spacing shorthand is omitted THEN that edge/gap SHALL not invent a default padding/margin beyond the component’s documented baseline (no forced padding)
3. WHEN `flex`, `direction`, `justify`, `align`, and/or `wrap` are set THEN they SHALL apply to the layout host regardless of a boolean flex flag (boolean `flex` API removed or superseded by `flex?: number`)
4. WHEN `safe` is `true` THEN the Container SHALL apply safe-area insets on all edges via `react-native-safe-area-context`
5. WHEN `safe` is an array of edges THEN the Container SHALL apply insets only for those edges
6. WHEN `safe` is omitted/false THEN the Container SHALL not add safe-area inset padding
7. WHEN `keyboardDismiss` is `true` THEN pressing the Container’s dismiss target (outside focused inputs, per RN dismiss pattern) SHALL dismiss the keyboard
8. WHEN `keyboardDismiss` is omitted/false THEN the Container SHALL not install keyboard-dismiss press behavior
9. WHEN public `Container` props are inspected THEN they SHALL NOT expose a free-form `style` chrome API (AD-012/017 continuity: tokenized props only for layout chrome)
10. WHEN spacing values are typed THEN they SHALL accept only `Spacing` token keys (not raw `number`)

**Independent Test**: Jest/RNTL + stories exercise shorthands, flexbox, safe edges, and keyboardDismiss; type tests reject `style` / raw number spacing if the suite already patterns that.

---

### P1: Molecule `KeyboardAvoid` ⭐ MVP

**User Story**: As a developer, I want a `KeyboardAvoid` wrapper so that form/search screens can lift content above the keyboard without baking Avoid into Container.

**Why P1**: Confirmado como complemento obrigatório desta fatia.

**Acceptance Criteria**:

1. WHEN `KeyboardAvoid` is rendered THEN it SHALL wrap children with a keyboard-avoiding host suitable for React Native (platform-aware default behavior)
2. WHEN an optional vertical `offset` (or equivalent documented prop) is provided THEN it SHALL be applied to the avoiding host
3. WHEN `KeyboardAvoid` composes with `Container` THEN both SHALL work nested (`KeyboardAvoid` outside, `Container` inside) without the lib requiring a single combined component
4. WHEN the public API is inspected THEN keyboard avoiding SHALL NOT be a required prop on `Container` (separate molecule)

**Independent Test**: Story + unit test mount `KeyboardAvoid` > `Container`; assert props/behavior defaults exist per platform (mocked OK).

---

### P2: Migrar consumers + trocar Views de layout drop-in

**User Story**: As a developer, I want all app/Storybook/test imports and trivial layout Views updated so that the old path is gone and screens demonstrate Container usage.

**Why P2**: Completa a fatia operacionalmente; depende do P1 API.

**Acceptance Criteria**:

1. WHEN app entry, presentation screens, test render helpers, and Storybook preview import theme/components THEN they SHALL use `@ds` paths only
2. WHEN `src/components/ds` is checked THEN it SHALL not exist (no reexport shim)
3. WHEN presentation screens contain a trivial layout-only `View` that Container can replace THEN it SHALL be replaced by `Container` in this feature (e.g. search list region wrapper)
4. WHEN a host is not a layout View (`FlatList`, `Pressable`, `RefreshControl`, etc.) THEN it MAY remain a RN primitive in this feature
5. WHEN README (or DS docs section) describes DS location THEN it SHALL point to `packages/ds` and `@ds`, and note the presentation theme bridge

**Independent Test**: Grep + open Search screen — no `@/components/ds`; layout View swapped where applicable; `pnpm test` / lint pass.

---

## Edge Cases

- WHEN conflicting shorthands are set (e.g. `p` and `pt`) THEN system SHALL apply a documented precedence (specific edge overrides shorthand `p`/`px`/`py` — assume CSS-like: more specific wins; logged as assumption for Design)
- WHEN `safe` edges overlap Header `safe` top on the same screen THEN consumers SHALL choose edges to avoid double inset (documented; no automatic dedupe)
- WHEN `keyboardDismiss` wraps inputs THEN taps on TextInput SHALL still focus/type normally (dismiss only on non-input press target)
- WHEN `KeyboardAvoid` runs on Android vs iOS THEN defaults MAY differ by platform but SHALL remain explicit in code/maps (no silent undefined behavior)
- WHEN `Brand` and app `DataSource` diverge in future naming THEN mapping stays in the bridge only

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| DSLIB-01 | P1: Extrair packages/ds + alias | Design | Pending |
| DSLIB-02 | P1: Extrair — zero imports app | Design | Pending |
| DSLIB-03 | P1: Extrair — assets na lib | Design | Pending |
| DSLIB-04 | P1: Theme getTheme(Brand) + provider theme prop | Design | Pending |
| DSLIB-05 | P1: Presentation theme bridge | Design | Pending |
| DSLIB-06 | P1: DataSourceLogo brand API | Design | Pending |
| DSLIB-07 | P1: Container spacing shorthands (tokens only) | Design | Pending |
| DSLIB-08 | P1: Container flexbox API | Design | Pending |
| DSLIB-09 | P1: Container safe edges | Design | Pending |
| DSLIB-10 | P1: Container keyboardDismiss | Design | Pending |
| DSLIB-11 | P1: KeyboardAvoid molecule | Design | Pending |
| DSLIB-12 | P2: Big-bang consumer migration | Design | Pending |
| DSLIB-13 | P2: Drop-in View → Container | Design | Pending |
| DSLIB-14 | P2: Docs path/@ds/bridge | Design | Pending |

**Coverage:** 14 total, 0 mapped to tasks, 14 unmapped ⚠️

---

## Success Criteria

- [ ] Nenhum consumer usa `@/components/ds`; pasta removida
- [ ] `packages/ds` não importa módulos do app
- [ ] Container cobre spacing direcional + flexbox + safe + keyboardDismiss com testes/stories
- [ ] `KeyboardAvoid` existe e compõe com Container
- [ ] Bridge de tema em presentation; hydrate/session fora da lib
- [ ] Gate de testes do DS + app verdes após a migração

---

## Implicit-Requirement Dimensions (Medium sweep)

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | Spacing só via tokens `Spacing`; `safe` edges union fechada; `flex` number |
| Failure / partial-failure | N/A — UI kit síncrono; theme bridge reusa hydrate gate existente |
| Idempotency / retry | N/A |
| Auth / rate limits | N/A |
| Concurrency / ordering | N/A |
| Data lifecycle | N/A |
| Observability | N/A |
| External-dependency failure | Safe-area/keyboard são APIs RN; sem rede |
| State-transition integrity | N/A for DS; session mode/brand mapping unchanged in store, only bridge moves |

**Remaining dimensions N/A for this scope.**
