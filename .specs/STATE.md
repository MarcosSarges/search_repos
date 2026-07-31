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
- **Status**: active

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
- **Status**: active

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
- **Decision**: Tokens tipográficos definem a variação completa por variant (`body` | `label` | `caption` | `heading`, …): `fontFamily`, `fontWeight`, `fontSize`, `lineHeight`. O atom Typography só seleciona `variant` (+ `tone`); **não** compõe `size` × metrics.
- **Reason**: Variações pertencem aos tokens, não aos componentes — evita lógica tipográfica no styled layer e special-cases.
- **Trade-off**: Novos tamanhos = novas variants de token (ex. `bodySm`), não prop `size` no Typography.
- **Scope**: `src/components/ds/tokens/**`, atom `Typography`
- **Date**: 2026-07-31
- **Status**: active

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
- **Status**: active

### AD-017
- **Decision**: Padrão unificado dos atoms: (1) variações tipadas nos tokens (`variant` / `tone` / `SpacerEdge`); Icon e Loading usam `variant` em vez de `size?: Size`; (2) props `Omit<Host,'style'|controlled>` + `...rest`, exceto Spacer (props fechadas edge+size); (3) styled template para CSS, `.attrs` só para props de host third-party; (4) defaults de a11y na composição (`Name.tsx`), não em `styles.tsx`; (5) `styles.tsx` não exporta unions de domínio.
- **Reason**: Eliminar divergências de tipagem/code style entre atoms e reforçar “tokens definem a variação”.
- **Trade-off**: Icon/Loading perdem a prop `size` genérica; novos tamanhos = novas variants de token.
- **Scope**: `src/components/ds/atoms/**`, `src/components/ds/tokens/**`
- **Date**: 2026-07-31
- **Status**: active

## Handoff

- **Feature**: ds-controls
- **Phase / Task**: Execute Batch 2 complete (phases 3–4: T4→T5→T6)
- **Completed**: T1–T6 (tokens, Button, Input, InputField, Card, README Atomic table); CTRL-01..05 Verified
- **In-progress**: none
- **Next step**: Verifier (author ≠ verifier) on ds-controls
- **Blockers**: none
- **Uncommitted files**: none expected after Batch 2 commits
- **Branch**: `feat/design-system`
