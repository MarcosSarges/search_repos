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

## Handoff

- **Feature**: design-system (`.specs/features/design-system/`)
- **Phase / Task**: Tasks — `tasks.md` Draft; aguardando aprovação do usuário
- **Completed**: Spec + context confirmados; Design Approach A aprovado; AD-009..011 gravados
- **In-progress**: none
- **Next step**: User aprova tasks → Execute (offer sub-agents se >~8 tasks)
- **Blockers**: none — waiting on tasks approval
- **Uncommitted files**: `.specs/`, `src/domain/`, `src/application/`, `src/assets/`, DS parcial
- **Branch**: current working branch
