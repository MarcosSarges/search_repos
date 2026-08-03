# DS as Lib Context

**Gathered:** 2026-08-02
**Spec:** `.specs/features/ds-as-lib/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Extrair o Design System de `src/components/ds/` para `packages/ds` como lib tipada (alias `@ds`, sem pnpm workspace), desacoplada de application/Zustand; enriquecer `Container` como layout box (shorthand spacing, flexbox, SafeArea por edges, keyboard dismiss); adicionar molecule `KeyboardAvoid`; bridge de tema em presentation. Sem redesign visual amplo.

---

## Implementation Decisions

### Forma da lib (1A + recomendações)

- Path: `packages/ds`
- Alias: `@ds` (barrel) e `@ds/*` para deep imports se necessário
- Sem monorepo workspace formal — pasta + `tsconfig` paths
- Assets de marca GitHub/GitLab movem para a lib (ex. `packages/ds/assets/...`); organism `DataSourceLogo` continua o único importador de SVGs de marca (AD-011 relocado)

### Fronteira Clean Arch (2A + recomendações)

- Lib pura: zero imports de `@/application`, `@/stores`, `@/presentation`, `@/*` do app
- Tipo de marca na lib: `Brand = 'github' | 'gitlab'` (não `DataSource` de application)
- `getTheme(mode, brand)` e tokens ficam na lib; `AppTheme` usa `brand`, não `DataSource`
- Provider da lib (`DsThemeProvider` ou equivalente) recebe **`theme` já montado** + `children`
- Bridge `AppThemeProvider` em `presentation`: lê Zustand/hydration/splash, mapeia `DataSource → Brand`, chama `getTheme`, wrapa o provider da lib
- `DataSourceLogo` usa prop `brand` (e/ou brand do tema); app mapeia data source → brand

### Container layout API (3A + SafeArea + keyboard dismiss)

- Shorthand tipado só com tokens `Spacing`: `p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`, `gap`, e margin `m` / `mx` / `my` / `mt` / `mb` / `ml` / `mr`
- Flexbox: `flex?: number`, `direction`, `justify`, `align`, `wrap` — aplicáveis sem depender de flag booleana
- `tone` de surface mantém-se
- Host base: `View`
- `safe?: boolean | ReadonlyArray<'top' | 'bottom' | 'left' | 'right'>` via `react-native-safe-area-context`; `true` = todos os lados; array = edges escolhidas (evita double-padding com Header)
- `keyboardDismiss?: boolean` — tap fora fecha o teclado (comportamento no Container)

### KeyboardAvoid (novo molecule)

- Molecule separado `KeyboardAvoid` (não prop do Container)
- Wrapa children; defaults de `behavior` sensatos por plataforma; `offset?` tipado
- Composição documentada: `<KeyboardAvoid><Container …>`

### Migração (4A + recomendações)

- Big-bang: remover `src/components/ds`; sem shim de reexport
- Atualizar App, presentation, stores types, Storybook, testes para `@ds`
- Trocar só `View` de layout por `Container` onde for drop-in; não wrapping de `FlatList` / `Pressable` / hosts especiais nesta fatia

---

## Agent's Discretion

- Nome exato do provider da lib (`DsThemeProvider` vs `ThemeProvider`) e shape dos barrels `@ds`
- Defaults precisos de `KeyboardAvoid` `behavior` / `keyboardVerticalOffset` por iOS vs Android
- Organização interna de pastas em `packages/ds` (manter Atomic Design `tokens` / `atoms` / `molecules` / `organisms` / `theme`)
- Como tipar `safe` edges (`'top' | …` union reutilizável)

---

## Declined / Undiscussed Gray Areas → Assumptions

- Nenhuma área macro declinada — usuário confirmou recomendações + SafeArea B + dismiss A + Avoid A
- Workspace pnpm formal: fora (explícito 1A)
- Redesign visual / novos atoms: fora (4A)

---

## Specific References

- Dor atual: `SearchReposScreen` ainda usa `View` solto; Container sem padding direcional / layout completo
- AD-004 / AD-027 (DS em `src/components/ds`) e acoplamento `AppThemeProvider` → Zustand/`DataSource` serão supersedidos por esta feature
- Header mantém `safe?: boolean` (top); Container `safe` por edges complementa sem obrigar mudar Header nesta fatia

---

## Deferred Ideas

- `ScrollView` / host variants no Container
- pnpm workspace package.json formal com peerDeps
- Redesign visual amplo / polish de todos os atoms
- Unificar Header `safe` com a API de edges do Container
- Remover `Pressable` solto via átomo de press (fora do escopo layout)
