# STATE

## Decisions

### AD-001
- **Decision**: Clean Architecture em camadas `domain` → `application` → `infrastructure` → `presentation`, com inversão de dependências.
- **Reason**: Requisito central do teste é desacoplamento e troca de fonte em runtime sem vazar formatos de API para a UI.
- **Trade-off**: Mais arquivos/boilerplate no início; ganho em testabilidade e isolamento de provedores.
- **Scope**: Todo o app (`src/domain`, `src/application`, `src/infrastructure`, `src/presentation`)
- **Date**: 2026-07-30
- **Status**: active

### AD-002
- **Decision**: Contrato único `RepoRepository` no domínio; GitHub e GitLab como implementações isoladas na infraestrutura, com mappers próprios.
- **Reason**: APIs têm formatos/paginação diferentes; a diferença deve ficar encapsulada; uma decisão de fonte em um único lugar (DI/store).
- **Trade-off**: Exige fábrica/DI cuidadosa; proíbe `if (provider)` espalhado em telas/hooks.
- **Scope**: Busca, detalhes, issues, seletor de fonte
- **Date**: 2026-07-30
- **Status**: active

### AD-003
- **Decision**: Navegação com React Navigation (Stack + Tabs) a partir de `App.tsx`, sem Expo Router.
- **Reason**: Familiaridade, grafo tipado explícito, navegação isolada em `src/navigation/` alinhada à apresentação desacoplada.
- **Trade-off**: Sem file-based routing / rotas tipadas “de graça” do Expo Router.
- **Scope**: `App.tsx`, `src/navigation/`, telas
- **Date**: 2026-07-30
- **Status**: superseded by AD-027 (paths moved under `src/presentation/`; React Navigation choice still stands)

### AD-004
- **Decision**: Design System próprio tipado em `src/components/ds/` com styled-components + ThemeProvider; Storybook no dispositivo via `STORYBOOK_ENABLED`.
- **Reason**: Tokens/variant/size exigidos pelo enunciado; template Expo (`ThemedText`) não atende.
- **Trade-off**: Custo de manter tokens, componentes e stories.
- **Scope**: UI de produto + Showcase + Storybook
- **Date**: 2026-07-30
- **Status**: active

### AD-005
- **Decision**: Cache/data-fetching com TanStack Query na borda presentation/infrastructure — fora do domínio e dos use cases puros.
- **Reason**: Stale-while-revalidate, loading discreto e invalidação ao trocar fonte, sem contaminar o domínio.
- **Trade-off**: Queries/orquestração de fetch ficam fora dos use cases puros.
- **Scope**: Hooks de apresentação, providers, invalidação por data source
- **Date**: 2026-07-30
- **Status**: active

### AD-006
- **Decision**: Testes unitários com Jest + RNTL (prioridade: use cases); E2E com Maestro no Expo Go.
- **Reason**: Domínio/application testáveis em Node puro; Maestro alinhado ao ecossistema Expo.
- **Trade-off**: E2E exige emulador/dispositivo e config separada do Jest.
- **Scope**: `**/__tests__/**`, `.maestro/`
- **Date**: 2026-07-30
- **Status**: active

### AD-007
- **Decision**: Expo SDK 54, TypeScript strict, alias `@/*` → `src/*`, ESLint + Prettier + Husky no pre-commit.
- **Reason**: Guardrails de qualidade exigidos pelo teste e pelo candidato para entrega consistente.
- **Trade-off**: Friction em commits se lint/format falharem — intencional.
- **Scope**: Tooling de todo o repositório
- **Date**: 2026-07-30
- **Status**: active

### AD-008
- **Decision**: Tokens opcionais via `.env` (`GITHUB_TOKEN`); nunca commitados; HTTP 429 tratado como rate limit amigável em ambas as fontes.
- **Reason**: Enunciado: auth opcional para subir rate limit; credenciais fora do git.
- **Trade-off**: Sem token, limite baixo (ex.: 60 req/h no GitHub).
- **Scope**: Infra HTTP GitHub/GitLab, mensagens de erro na UI
- **Date**: 2026-07-30
- **Status**: superseded by AD-021

### AD-009
- **Decision**: Design System em `src/components/ds/` segue Atomic Design: `tokens` → `atoms` → `molecules` → `organisms`; telas de produto são organisms quando existirem.
- **Reason**: Clareza de responsabilidade e alinhamento ao spec/README do teste.
- **Trade-off**: Mais pastas; migração do layout flat (`components/`).
- **Scope**: `src/components/ds/**`, Storybook titles, README
- **Date**: 2026-07-31
- **Status**: active

### AD-010
- **Decision**: `theme.colors.primary` resolve por `(ThemeMode, DataSource)` com hex oficiais — GitHub `#0FBF3E`/`#5FED83`, GitLab `#FC6D26`/`#FCA326`; demais tokens só por mode.
- **Reason**: Brand toolkits GitHub/GitLab; regra primary-only do discuss.
- **Trade-off**: Neutrals de marca não entram no tema nesta fatia.
- **Scope**: tokens/theme do DS, Storybook globals
- **Date**: 2026-07-31
- **Status**: active

### AD-011
- **Decision**: SVGs de marca GitHub/GitLab só podem ser importados dentro do organism `DataSourceLogo`.
- **Reason**: Regras de brand (variantes light/dark, assets oficiais) fora da iconografia de UI.
- **Trade-off**: Header/telas não importam assets direto — sempre via organism.
- **Scope**: `src/assets/github|gitlab`, `src/components/ds/organisms/**`
- **Date**: 2026-07-31
- **Status**: active

### AD-012
- **Decision**: Cada peça do DS em pasta própria com `index.ts`, `<Name>.tsx`, `<Name>.stories.tsx` e `styles.tsx`; styled-components vivem **somente** em `styles.tsx`; estilos do DS usam **sempre** `styled` (nunca `StyleSheet` / style solto para chrome do DS).
- **Reason**: Separação composição vs estilo; catálogo Storybook previsível; evita misturar markup e CSS-in-JS no mesmo arquivo.
- **Trade-off**: Mais arquivos por componente.
- **Scope**: `src/components/ds/atoms|molecules|organisms/**`
- **Date**: 2026-07-31
- **Status**: active

### AD-013
- **Decision**: Lookups de variant/tone/size no DS usam **object maps**, não `switch`/`case`.
- **Reason**: Extensão tipada mais barata; menos branches; alinhado ao padrão de tokens.
- **Trade-off**: Maps precisam ser exaustivos no tipo (ok com `satisfies` / `Record`).
- **Scope**: `src/components/ds/**` (styled layers + helpers de token)
- **Date**: 2026-07-31
- **Status**: active

### AD-014
- **Decision**: Tokens tipográficos definem a variação completa por variant (`body` | `label` | `caption` | `heading`, …): `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`. O atom Typography só seleciona `variant` (+ `color` per AD-028); **não** compõe `size` × metrics.
- **Reason**: Variações pertencem aos tokens, não aos componentes — evita lógica tipográfica no styled layer e special-cases.
- **Trade-off**: Novos tamanhos = novas variants de token (ex. `bodySm`), não prop `size` no Typography.
- **Scope**: `packages/ds/tokens/**`, atom `Typography`
- **Date**: 2026-07-31
- **Status**: active (content prop renamed `tone`→`color` by AD-028; no typography `size` still stands)

### AD-015
- **Decision**: Nesta fatia `ds-conventions`, `fontFamily` tipográfico usa família de **sistema** do RN; sem bundling `expo-font` / arquivos `.ttf` novos.
- **Reason**: Confirmado no Specify — desacopla refactor de loading de fontes custom.
- **Trade-off**: Custom typefaces ficam para feature posterior.
- **Scope**: `ds-conventions`, tokens tipográficos
- **Date**: 2026-07-31
- **Status**: active

### AD-016
- **Decision**: Variantes de `tone` (content: `default`\|`muted`\|`primary`\|`danger`; surface: `background`\|`surface`) e o mapa `toneColorMap` vivem em `tokens/tone.ts` — tipagem de definição no token, não em `styles.tsx` dos componentes.
- **Reason**: Tokens definem variações; atoms/molecules só consomem.
- **Trade-off**: Um módulo a mais em tokens; tones de surface e content compartilham o mesmo arquivo.
- **Scope**: `src/components/ds/tokens/tone.ts`, Typography, Icon, Container
- **Date**: 2026-07-31
- **Status**: superseded by AD-028

### AD-017
- **Decision**: Padrão unificado dos atoms: (1) variações tipadas nos tokens (`variant` / `tone` / `SpacerEdge`); Icon e Loading usam `variant` em vez de `size?: Size`; (2) props `Omit<Host,'style'|controlled>` + `...rest`, exceto Spacer (props fechadas edge+size); (3) styled template para CSS, `.attrs` só para props de host third-party; (4) defaults de a11y na composição (`Name.tsx`), não em `styles.tsx`; (5) `styles.tsx` não exporta unions de domínio.
- **Reason**: Eliminar divergências de tipagem/code style entre atoms e reforçar “tokens definem a variação”.
- **Trade-off**: Icon/Loading perdem a prop `size` genérica; novos tamanhos = novas variants de token.
- **Scope**: `src/components/ds/atoms/**`, `src/components/ds/tokens/**`
- **Date**: 2026-07-31
- **Status**: partially superseded by AD-028 (`tone`, Icon/Loading `variant`-as-size, and public `Omit<…,'style'>`); object maps, `styles.tsx` boundary, a11y defaults, Spacer edge exclusivity remain active

### AD-018
- **Decision**: Preferências de sessão (`mode`, `dataSource`) vivem em Zustand + `persist` (AsyncStorage); `AppThemeProvider` é bridge (hydrate gate + `StyledThemeProvider`), sem `useState` paralelo. Limpeza runtime via `reset()` (`set` initial + `persist.clearStorage()`); testes via `__mocks__/zustand.ts` (docs Jest).
- **Reason**: Único ponto de decisão de fonte (AD-002), sobrevive a cold start, sem flash (gate), alinhado ao enunciado light/dark + seletor.
- **Trade-off**: Dependência Zustand; hydrate async exige splash/gate.
- **Scope**: `src/stores/**`, `AppThemeProvider`, Home chrome, nav theme sync
- **Date**: 2026-07-31
- **Status**: active

### AD-019
- **Decision**: `DataSource` (`'github' | 'gitlab'`) vive fora de `src/domain/` (módulo em `src/application/`); domínio é Functional Core (types + pure helpers) e não nomeia provedores. `AppErrorCode` inclui `invalid_input` para violações de invariante (bounds); `unknown` só para não classificado.
- **Reason**: Dependency Rule — domínio não acopla a implementações; taxonomia de erro DDD-friendly sem misturar invariantes com falhas opacas.
- **Trade-off**: Consumers (stores/theme) importam `DataSource` de application; domínio “anêmico” de propósito (não entity methods OO).
- **Scope**: `src/domain/**`, `src/application/**` (tipo DataSource), session/theme imports
- **Date**: 2026-08-02
- **Status**: active

### AD-020
- **Decision**: Composition root em `src/infrastructure/di` (`resolveRepository` + `createContainer`); use cases em application são factories funcionais `(repo) => (input) => Promise` (sem `.execute`); implementações da porta (incl. Fake in-memory) vivem em `src/infrastructure/`; DI recebe `dataSource` por parâmetro e não importa Zustand; barrel `@/application` não exporta DI/Fake.
- **Reason**: Clean Arch + IoC (context application-layer); AD-002 (um branch de fonte); testabilidade em Node; adiar HTTP com Fake runtime.
- **Trade-off**: Presentation ainda não consome o container (Provider/hooks = fatia seguinte); ambas fontes → Fake até feature HTTP.
- **Scope**: `src/application/use-cases/**`, `src/infrastructure/di/**`, `src/infrastructure/repositories/**`, barrels
- **Date**: 2026-08-02
- **Status**: active

### AD-021
- **Decision**: Tokens de API são opcionais e injetados no DI como mapa `tokens?: { github?: string; gitlab?: string }`; `resolveRepository`/`createContainer` selecionam o token do `dataSource` ativo e passam `token?` já resolvido ao adapter. Sem token = anônimo. Fonte de verdade **não** é `.env` — UI/persistência numa fatia futura. HTTP 429 → `rate_limit` com `cause` estruturado (reset/retry headers) quando disponível.
- **Reason**: Review infrastructure-layer — Presentation injeta estado global sem microgerenciar qual string enviar; UX futura de rate limit precisa de metadados no `cause`.
- **Trade-off**: UI/persistência de token ainda não existem; até lá só wiring aceita o mapa.
- **Scope**: `src/infrastructure/di/**`, adapters HTTP, futura session/credentials; README
- **Date**: 2026-08-02
- **Status**: active

### AD-022
- **Decision**: `resolveRepository` entrega adapters HTTP nativos (`fetch`) por `DataSource`, cada um com mappers próprios; kit compartilhado `mapHttpFailure` + `hasNextPage` híbrido; Fake in-memory só para testes; gate de infra com MSW interceptando rede.
- **Reason**: Enunciado §3.3/§5; fecha o adiamento HTTP do AD-020; context E (Anti-Corruption Layer ponta a ponta).
- **Trade-off**: Setup Jest+MSW mais sensível (`customExportConditions` / globals); mais arquivos que monolito.
- **Scope**: `src/infrastructure/http|github|gitlab/**`, `src/test/msw/**`, DI, Jest
- **Date**: 2026-08-02
- **Status**: active

### AD-023
- **Decision**: Providers/hooks de dados de produto vivem em `src/presentation/`; TanStack Query na borda com `queryKey` sempre incluindo `dataSource`; toggle de fonte **não** usa `invalidateQueries`/`removeQueries` (isolamento + reuse de cache). Session store expõe `tokens: ProviderTokens` em memória para o DI.
- **Reason**: Simetria Clean Arch; AD-005; UX A→B→A com cache quente; AD-021 wiring.
- **Trade-off**: Pasta `presentation/` + stores ainda fora dela até features seguintes (screens/nav moved in AD-027).
- **Scope**: `src/presentation/**`, session store tokens slot, App providers, product query hooks
- **Date**: 2026-08-02
- **Status**: superseded by AD-025 (Context `AppContainerProvider` removed; rest still active — see AD-025); path note updated by AD-027

### AD-024
- **Decision**: Tokens de API (`ProviderTokens`) persistem **somente** via `expo-secure-store` (SDK 54); **nunca** AsyncStorage nem `partialize` do Zustand. Hydrate SecureStore → bag em memória no boot; gate de UI espera prefs + tokens; web/unavailable → memória only. Sem UI de token nesta fatia; `requireAuthentication` off.
- **Reason**: Segredos no Keystore/Keychain ([SecureStore v54](https://docs.expo.dev/versions/v54.0.0/sdk/securestore/)); prefs light/dark+fonte continuam no AsyncStorage.
- **Trade-off**: Adapter + gate mais complexo; web sem persistência de token; biometria adiada.
- **Scope**: `src/infrastructure/secure-store/**` (ou path equivalente), session store, hydrate gate, testes com mock SecureStore
- **Date**: 2026-08-02
- **Status**: active

### AD-025
- **Decision**: Não há `AppContainerProvider`/Context para o DI. `useAppContainer()` deriva `createContainer({ dataSource, tokens })` direto do Zustand (`useMemo`). Árvore de produto: Theme gate → `AppQueryProvider` → Nav. Fake em testes via `setAppContainerTestRepository` (módulo), não via prop de Provider.
- **Reason**: Zustand já é a fonte de `dataSource`/`tokens`; Context duplicava assinatura e forçava re-render em cascata (store → Provider → consumers).
- **Trade-off**: Cada caller de `useAppContainer` memoiza o próprio container (aceitável); override de Fake é global de teste (limpar entre suites).
- **Scope**: `src/presentation/hooks/use-app-container.ts`, `App.tsx`, `src/test/render.tsx`
- **Date**: 2026-08-02
- **Status**: active

### AD-026
- **Decision**: Product bottom tabs are **Search | Favoritos | Explore | Config**. Tab **Search** hosts the nested stack lista → detalhe → issues. Session chrome (**data source** + **theme**) lives on **Config** (not on Search). Favoritos persistence (AsyncStorage) and Explore trending are separate features; tabs may ship as mocks first.
- **Reason**: Product IA locked in search-and-navigation specify/discuss; keeps Search focused and reserves tabs for upcoming functions.
- **Trade-off**: Four tabs early; Config grows over time (token UI later).
- **Scope**: `src/presentation/navigation/**`, `src/presentation/screens/**`, session controls UX
- **Date**: 2026-08-02
- **Status**: active

### AD-027
- **Decision**: Product `screens/` and `navigation/` live under `src/presentation/` (`src/presentation/screens/**`, `src/presentation/navigation/**`). Imports use `@/presentation/screens` and `@/presentation/navigation`. Session Zustand stores remain in `src/stores/`. Design System stays in `src/components/ds/`.
- **Reason**: Close Clean Arch symmetry (AD-001/AD-023); search-and-navigation delivered product UI outside presentation by inertia — move completes the layer boundary.
- **Trade-off**: Longer import paths; historical specs still mention old paths.
- **Scope**: `src/presentation/screens/**`, `src/presentation/navigation/**`, `App.tsx`, README
- **Date**: 2026-08-02
- **Status**: partially superseded by AD-031 (Zustand stores path); screens/nav under presentation still stand (DS later `packages/ds`)

### AD-028
- **Decision**: Public DS props follow MUI-like axes: content `color` (`text`\|`muted`\|`primary`\|`danger`), surface `bg` (`background`\|`surface`), Button `variant` (`contained`\|`outlined`\|`text`) × `color` (`primary`\|`success`\|`warning`\|`danger`) × `size` × `width` (`hug`\|`full`), scale via `size` on Icon/Loading/Logo/Button, and `style` passthrough on every public export — **no** `sx`, **no** `tone` / `Tone` / `SurfaceTone` / `toneColorMap` aliases. Tokens: `ContentColor` + `SurfaceBg` (replace `tone.ts`); Container omits fill when `bg` omitted; Card defaults to `card.defaultBg` (`surface`). Migration is big-bang across DS + presentation.
- **Reason**: Clearer mental model and better tooling for building screens; remove overloaded `tone` and size-via-`variant`.
- **Trade-off**: Breaking API change in one cut; consumers must update in the same change set.
- **Scope**: `packages/ds/**`, `src/presentation/**`, README Design System section
- **Date**: 2026-08-03
- **Status**: active

### AD-029
- **Decision**: DS organisms that need session state (e.g. source toggle header) are **controlled and store-free** in `packages/ds` (props like `brand` + `onToggleBrand`). Real Zustand wiring lives in `src/presentation/components/` adapters (e.g. `SessionSourceHeader`) that map `DataSource` ↔ DS `Brand` and call store actions. Product screens import the presentation adapter, not the store, for that chrome. Navigation back chrome follows the same pattern (`BackHeader` + `StackBackHeader`).
- **Reason**: Preserve DS isolation (no `@/stores` / app layers in `packages/ds`) while keeping product headers reusable and testable.
- **Trade-off**: Thin adapter layer per wired organism; Brand and DataSource stay parallel unions.
- **Scope**: `packages/ds/organisms/**`, `src/presentation/components/**`, product screens using session/stack chrome
- **Date**: 2026-08-03
- **Status**: active

### AD-030
- **Decision**: `RepoRepository.listTrending` é a única porta para discovery trending; parâmetros de janela/API vivem na ACL (`infrastructure/trending` + adapters). Presentation só chama o use case via container.
- **Reason**: Mesma regra AD-002 para search; evita query mágica `stars:>1` na UI.
- **Trade-off**: Proxy “trending” ≠ algoritmo oficial GitHub Trending; GitLab usa `last_activity_after` (não created-at).
- **Scope**: Explore + futuros “featured” surfaces
- **Date**: 2026-08-03
- **Status**: active

### AD-031
- **Decision**: Zustand client/session stores live under `src/presentation/stores/` (session preferences, favorites, hydration helpers). Alias imports use `@/presentation/stores`. `src/stores/` is removed. Domain and application must not import Zustand or presentation stores.
- **Reason**: Client/UI state is presentation-adjacent (same spirit as TanStack Query / AD-005); folder symmetry with Clean Arch; favorites feature locks Option 2 from specify/discuss.
- **Trade-off**: Broader import rewrite once; stores are not a fifth business layer — do not put domain rules here.
- **Scope**: `src/presentation/stores/**`, App theme/session consumers, favorites feature, README architecture table
- **Date**: 2026-08-03
- **Status**: partially superseded by AD-032 (favorites write-model); session prefs + store folder under presentation still stand

### AD-032
- **Decision**: Favoritos seguem Clean Arch: entidade `Favorite` + porta `FavoritesRepository` no domínio (`source` opaco, sem importar `DataSource`); use cases em application (`listFavorites`, `toggleFavorite`, `removeFavorite`, `isFavorite`, `createFavoriteFromRepo`); adapter AsyncStorage (+ Fake in-memory) na infrastructure; DI em `createContainer` (repo de favoritos independente do `DataSource` HTTP). Zustand em presentation é **somente cache reativo / hydrate** — sem `persist` AsyncStorage e sem regras de toggle/sanitize.
- **Reason**: Favoritar é write-model de produto (offline snapshot, identidade composta), não chrome de sessão; Option 2 do discuss era pragmática demais e vazava I/O + regras para presentation.
- **Trade-off**: Mais arquivos que store-only; `DataSource` continua em application e é mapeado para `Favorite.source` string na borda application.
- **Scope**: `src/domain/**` (Favorite + porta), `src/application/use-cases/**` favorites, `src/infrastructure/**` favorites adapter, `src/presentation/stores` favorites cache, DI
- **Date**: 2026-08-03
- **Status**: active

## Handoff

- **Feature**: favorites — Done locally
- **Phase / Task**: Verifier PASS (re-check 1/3 after lint fix `f9008ba`)
- **Completed**: MVP P1 (FAV-01..13, FAV-15) + AD-032 CA; gate `pnpm test` 635 + `pnpm lint` exit 0; sensor 3/3 prior
- **In-progress**: none
- **Next step**: optional PR; P2 (FAV-14) deferred
- **Blockers**: none
- **Branch**: `feat/favorites`
- **Worktree**: `/Users/marcos/searchrepos-favorites`
