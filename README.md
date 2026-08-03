# SearchRepos

App React Native (Expo + TypeScript) para buscar repositórios em **GitHub** e **GitLab**, com troca de fonte em tempo de execução, Design System tipado, cache e Clean Architecture.

> Teste técnico — Desenvolvedor React Native (`Teste_Tecnico_React_Native_v3.md`).

## Stack

- Expo SDK 54 · TypeScript (strict) — alias `@/*` → `src/*`
- React Navigation (Stack + Tabs) — ponto de entrada em `App.tsx`
- styled-components (ThemeProvider do Design System)
- [Storybook](https://storybookjs.github.io/react-native/) (Showcase do Design System no dispositivo)
- Jest + React Native Testing Library (unitário / componente / integração)
- [Maestro](https://docs.maestro.dev/) (testes ponta a ponta via Expo Go)
- ESLint + Prettier (+ Husky no pre-commit)

## Instalação e execução

### Pré-requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/)
- Expo Go (dispositivo) ou emulador iOS/Android

### Setup rápido

```bash
pnpm install
pnpm start              # Metro; abra no Expo Go / emulador
```

### Tokens de API (opcionais)

Tokens GitHub/GitLab são **opcionais** e **não** usam `.env` como fonte de verdade (AD-021). O composition root (`createContainer`) recebe um mapa `tokens?: { github?: string; gitlab?: string }` e encaminha só o token da fonte ativa aos adapters HTTP.

Sem token, as APIs públicas funcionam anonimamente (limites mais baixos — HTTP 429 vira `rate_limit` na UI). Persistência via SecureStore e o mapa no DI já existem; a UI de Config para informar o token ainda é placeholder.

### Scripts

```bash
pnpm start              # servidor de desenvolvimento Expo (app)
pnpm storybook          # Showcase / Storybook no dispositivo (Design System)
pnpm storybook:android  # Storybook no Android
pnpm storybook:ios      # Storybook no iOS
pnpm android            # Android
pnpm ios                # iOS
pnpm web                # Web
pnpm lint               # ESLint
pnpm test               # Jest (domínio, use cases, componentes)
pnpm test:e2e           # Maestro (ver “Como rodar os testes”)
```

### Storybook (= Showcase do Design System)

O enunciado pede uma tela Showcase com variações dos componentes (§4.5 / §9). Aqui o catálogo vive no **Storybook for React Native** (`pnpm storybook`), com stories colocadas ao lado de cada peça em `packages/ds/**/*.stories.tsx` (títulos `DS/Atoms|Molecules|Organisms/...`), controles globais `themeMode` (claro/escuro) e `dataSource`, e entrada separada via `STORYBOOK_ENABLED` — sem embutir o Storybook no bundle de produção.

```bash
pnpm storybook
# depois abra no Expo Go / emulador
```

## Funcionalidades (enunciado §4)

| Requisito | Como está no app |
| --- | --- |
| §4.1 Seletor GitHub/GitLab | Toggle no header (`SessionSourceHeader`) + label da fonte ativa em Config; troca em runtime sem restart |
| §4.2 Busca | Query + infinite scroll (nome, owner, stars, linguagem, descrição) + pull-to-refresh; idle / loading / empty / erro (rate limit, rede) |
| §4.3 Detalhes | Nome completo, owner (avatar + nome), description, stars, forks, watchers, linguagem; ação para Issues |
| §4.4 Issues | Lista paginada (título, labels, autor, data relativa) + pull-to-refresh |
| §4.5 Showcase DS | Storybook no dispositivo (`pnpm storybook`) — variações, tamanhos, disabled, loading, tema claro/escuro |
| §7 Cache | TanStack Query (stale-while-revalidate; `queryKey` com `dataSource`) |

Além do escopo mínimo: **Favoritos** (persistidos) e **Explore** (trending da fonte ativa).

## Checklist de entrega (§9)

- [x] App Expo + TypeScript sobe sem erros (`pnpm start`)
- [x] Busca com paginação / infinite scroll
- [x] Detalhes ao tocar em um repositório
- [x] Seletor de fonte GitHub/GitLab em runtime
- [x] Design System tipado (tokens + componentes base)
- [x] Showcase (Storybook) com variações
- [x] Cache via biblioteca (TanStack Query)
- [x] Testes cobrindo domínio + use cases de application
- [x] Commits pequenos e descritivos

## Decisões

Seção dedicada às escolhas técnicas do projeto — o *porquê*, não só o *o quê* (README obrigatório do enunciado).

### Arquitetura (Clean Architecture)

Optei por Clean Architecture porque o requisito central é **desacoplamento** e **troca de fonte em tempo de execução** (§3 / §3.3):

1. O **domínio** define contratos (`RepoRepository`, entidades `Repo` / `Issue` / `Favorite`) sem depender de React Native, HTTP ou bibliotecas de cache.
2. Os **casos de uso** orquestram a regra de negócio sem saber se a fonte é GitHub ou GitLab.
3. A **infraestrutura** traduz cada API (formatos e paginação diferentes) para o mesmo contrato — Anti-Corruption Layer.
4. A **apresentação** consome hooks e o composition root — nunca `fetch`/Axios direto nas telas.

Assim, a interface permanece idêntica ao trocar a fonte: mesmos campos, mesmos estados, mesma paginação.

#### Camadas

| Camada | Responsabilidade |
| --- | --- |
| `domain/` | Entidades e interfaces de repositório — zero dependência externa |
| `application/` | Use cases (busca, detalhes, issues, trending, favoritos) + tipo `DataSource` |
| `infrastructure/` | Adapters GitHub/GitLab, HTTP, mappers, DI (`createContainer`), SecureStore, AsyncStorage de favoritos |
| `presentation/` | Telas, navegação, hooks, providers, stores Zustand, bridge de tema |
| `packages/ds/` | Design System (lib `@ds`) — tokens, atoms, molecules, organisms |

Diferença em relação ao exemplo do enunciado: **navegação e tema** ficam em `presentation/` + `packages/ds/`, não em `infrastructure/` — a infra só implementa ports e wiring. O que importa é a inversão de dependências: alto nível não importa baixo nível concreto.

#### Domínio — contratos e testes como guarda de camada (obrigatório para humanos e IA)

O domínio é **Functional Core**: types + funções puras em `src/domain/`. Ele **não** conhece provedores (`github` / `gitlab` — isso vive em `src/application/`), **não** importa UI/HTTP/storage/cache, e **não** carrega copy de erro de produto.

Para que agentes e contribuidores **não quebrem a Dependency Rule** nem reintroduzam vazamentos, a suite Jest do domínio é **decisão de arquitetura**, não só cobertura:

| Guarda | Onde | O que impede |
| --- | --- | --- |
| Isolamento de imports | `src/domain/__tests__/isolation.test.ts` | Importar React, React Native, Expo, Axios, AsyncStorage, TanStack Query, Zustand, styled-components (e afins) em arquivos de produção do domínio |
| API pública | `src/domain/__tests__/public-api.test.ts` | Exportar `DataSource` / literais de provedor pelo barrel `@/domain`; garante o contrato público esperado |
| Shapes de entidades | `src/domain/entities/__tests__/entity-shapes.test.ts` | Campo `source` em `Repo`/`Issue`; `totalCount` em `PaginatedResult`; opcionais como `\| null` em vez de `?:` |
| Erros / validação | `src/domain/errors/__tests__`, `src/domain/validation/__tests__` | Taxonomia `AppError` e helpers (`normalizeSearchQuery`, asserts de página) fora do contrato |

**Regra para IA / PRs que tocam `src/domain/`:**

1. Antes de alterar o domínio, leia `.specs/features/domain-layer/` (spec + design) e esta seção.
2. Não adicione imports de framework nem nomes de provedor no domínio.
3. Rode `pnpm test -- src/domain` — se isolation / public-api / entity-shapes falharem, a mudança **viola a camada**; corrija o design, não enfraqueça o teste.
4. Tipos de sessão/provedor (`DataSource`) importam de `@/application`, nunca de `@/domain`.

### Navegação — por que sair do Expo Router

O projeto usa **React Navigation** (Stack + Tabs) a partir do `App.tsx`, sem roteamento baseado em arquivos. Motivos:

1. **Familiaridade** — o fluxo de navegadores tipados (`createNativeStackNavigator`, `createBottomTabNavigator`, listas de parâmetros) é o que já domino no dia a dia; menos atrito para montar fluxos (busca → detalhes → issues, abas) sem renegociar convenções de rotas por arquivo.
2. **Acoplamento** — o Expo Router amarra o ponto de entrada, a estrutura de pastas (`app/`), deep linking e layouts ao sistema de arquivos. Com React Navigation a navegação fica em `src/presentation/navigation/`, as telas em `src/presentation/screens/`, e o ponto de entrada (`App.tsx`) só compõe provedores e o navegador — alinhado à apresentação desacoplada.
3. **Gestão de telas e controle** — com stacks aninhadas e nomes repetidos, listas de parâmetros explícitas e `navigate` / `goBack` tipados dão mais controle do que rotas implícitas por caminho.

Compromisso consciente: perdemos o roteamento baseado em arquivos e as rotas tipadas “de graça” do Expo Router; ganhamos previsibilidade e um grafo de navegação explícito, fácil de ler e de testar.

### Troca de fonte (GitHub / GitLab) sem impactar a interface

Alinhado ao §3.3 — diferença de formato encapsulada; UI idêntica:

1. **Contrato único** no domínio (`RepoRepository`: `search`, `getById`, `listIssues`, `listTrending`).
2. **Duas implementações** na infraestrutura (`createGithubRepoRepository`, `createGitlabRepoRepository`), cada uma com HTTP e mappers próprios.
3. **Uma decisão em um único lugar** — `dataSource` na session store → `createContainer({ dataSource, tokens })` escolhe o adapter.
4. Telas e hooks dependem do **contrato** / hooks de presentation, não de `if (provider === 'github')` espalhados.
5. Cache isolado por fonte: `queryKey` sempre inclui `dataSource` (sem `invalidateQueries` no toggle — caches A e B convivem).

Resultado: trocar GitHub ↔ GitLab não exige reiniciar o app nem alterar a UI; a fonte ativa fica visível no header e pode ser alterada a qualquer momento.

### Design System (§6)

O Design System vive em **`packages/ds`**, importado via alias **`@ds`** / **`@ds/*`**. Segue **Atomic Design**. Tokens tipados cobrem spacing, sizes, colors (light/dark + primary por marca), radius — conforme §6.1. Componentes base tipados (§6.2): Typography, Button, Input / InputField, Card, Badge, Avatar, mais Spacer, Loading, Icon, Header, etc.

**Restrições do enunciado (§6.3):** props controladas (`variant` / `size` / `color` / `bg`) em vez de estilo solto ad hoc; ThemeProvider + `useTheme`; `style` existe como escape tipado no host, sem sistema `sx`.

**Motivação das props (AD-028):** eixos claros no mental model do MUI (`color` / `bg` / `variant` × paleta / `size` / `width` / `style`) para montar telas sem adivinhar o que `tone` significava. Migração **big-bang** (sem aliases `tone`).

| Eixo | Prop | Onde | Valores |
| --- | --- | --- | --- |
| Conteúdo | `color` | Typography, Icon, captions | `text` \| `muted` \| `primary` \| `danger` (default `text`) |
| Superfície | `bg` | Container, Card | `background` \| `surface` — Container sem default (sem fill); Card default `surface` via `card.defaultBg` |
| Chrome | `variant` | Button; Typography (papel tipográfico) | Button: `contained` \| `outlined` \| `text` |
| Paleta ação | `color` | Button | `primary` \| `success` \| `warning` \| `danger` |
| Escala | `size` | Icon, Loading, Logo, Button, Spacer, Avatar | tokens atuais por peça (`AvatarSize` próprio: sm/md/lg/xl) |
| Largura | `width` | Button | `hug` \| `full` (default `full`) |
| Escape | `style` | Todo export público DS | RN `StyleProp` → host styled (sem `sx`) |

| Nível | Pasta | O que entra |
| --- | --- | --- |
| Tokens | `tokens/` | `spacing` (+ `SpacerEdge`), `sizes`, `colors`, `radius`, `ContentColor` / `SurfaceBg`, tipografia / `IconSize` / `LoadingSize` / `AvatarSize` / badge metrics / button (`variant`×`color`×`width`) / input / card (`defaultBg`), mapa de `primary` por **`Brand`** (`github` \| `gitlab`) |
| Atoms | `atoms/` | Typography (`variant` + `color`), Icon (`size` + `color`), Spacer, Loading (`size`), Button (`variant`×`color`×`size`×`width`), Input, Avatar (`uri?` + `name` + `size`), Badge (`swatch?`) — `style` público em todos |
| Molecules | `molecules/` | Container (`bg` opcional), KeyboardAvoid, Header, InputField (helper `muted` / error `danger`), Card (`bg`), SettingsRow, FlatList |
| Organisms | `organisms/` | `DataSourceLogo`; `Hyperlink`; `SourceHeader` (toggle fonte, store-free); `BackHeader`; `RepoItem`; `IssueItem`; assets em `packages/ds/assets/` |
| Utils | `utils/` | `formatRelativeDate` (puro, sem `Intl` — Hermes; default `pt-BR`; inválido → `—`) |
| Theme (lib) | `theme/` | `getTheme(mode, brand)`, `DsThemeProvider({ theme })`, `useTheme` — **sem** Zustand |

**Bridge de tema (app):** `src/presentation/theme` — `AppThemeProvider` / `useAppTheme` leem a session store, mapeiam `DataSource` → `Brand`, montam o tema e wrapam `DsThemeProvider`.

**Shape de cada componente** (`atoms` / `molecules` / `organisms`):

| Arquivo | Papel |
| --- | --- |
| `index.ts` | export público (`Name` + `NameProps`) |
| `<Name>.tsx` | composição + defaults de a11y + `...rest` (Spacer: edges exclusivos + `style`) |
| `<Name>.stories.tsx` | Storybook / Showcase |
| `styles.tsx` | **único** lugar que instancia `styled(...)` — sem unions de domínio |

Estilos do DS usam sempre `styled-components` (template para CSS; `.attrs` só para props de host third-party como Ionicons/ActivityIndicator). Lookups via object maps nos tokens, não `switch`.

**Por que logos de marca são organisms:** assets oficiais (GitHub Invertocat claro/escuro, GitLab SVG) e regras de marca não são ícones de UI genéricos. Imports de SVG de marca ficam **somente** em `DataSourceLogo`.

Não reaproveitei o tema do template Expo (`ThemedText` com override de cor por instância) como Design System final — não atende tokens / props controladas do enunciado.

### Cache (§7)

TanStack Query na borda presentation:

- stale-while-revalidate (dados exibidos enquanto revalida)
- loading discreto em refetch / páginas seguintes
- isolamento por fonte: toda `queryKey` inclui `dataSource` — toggle não chama `invalidateQueries` / `removeQueries`; voltar à fonte anterior reaproveita cache quente

A biblioteca fica fora do domínio: use cases puros; orquestração de fetch nos hooks.

### Testes

| Camada | Ferramenta | Motivo |
| --- | --- | --- |
| Domínio + use cases | Jest (Node puro) | Exigência §9 — cobertura mínima dos use cases; guardas de camada no domínio |
| Componente | Jest + RNTL | Design System e telas críticas |
| Ponta a ponta | [Maestro](https://docs.maestro.dev/) | Fluxos YAML no Expo Go (`openLink` + `appId: host.exp.Exponent`) |

Prioridade: **guarda do domínio** + use cases de application (`searchRepos`, detalhes, issues, trending, favoritos). E2E: troca de fonte, busca → detalhes → issues, config/tema, explore.

### Compromissos (trade-offs)

| Escolher | Prós | Contras |
| --- | --- | --- |
| Clean Architecture | Testável, troca de provedor isolada, interface estável | Mais arquivos e boilerplate no início |
| React Navigation (sem Expo Router) | Familiaridade, menos acoplamento ao sistema de arquivos, controle tipado de stacks | Sem roteamento por arquivo / rotas tipadas do Expo Router |
| Interfaces no domínio + implementações na infraestrutura | Diferenças de API encapsuladas em mappers | Precisa de DI / fábrica cuidadosa |
| Testes de isolation / shapes no domínio | IA e PRs não reintroduzem frameworks ou `DataSource` no núcleo | Source-scan é frágil a renomes extremos |
| TanStack Query + `queryKey` com fonte | Cache e UX boas; toggle sem wipe | Consultas fora dos use cases puros |
| Design System próprio + Storybook como Showcase | Tipagem, consistência e catálogo no dispositivo | Sem aba Showcase dentro do app de produto |
| Maestro para ponta a ponta | Fluxos YAML simples, alinhado ao Expo | Precisa de emulador ou dispositivo; config separada do Jest |

## Como rodar os testes

### Unitário / componente (Jest)

```bash
pnpm test
# foco domínio / use cases:
pnpm test -- src/domain src/application
```

### Ponta a ponta (Maestro)

Fluxos em `.maestro/` no **Expo Go**, no padrão da [documentação do Maestro](https://docs.maestro.dev/get-started/supported-platform/react-native#expo-go-vs.-standalone-builds): use `openLink` (não `launchApp` com o pacote do projeto).

1. Expo Go instalado no **emulador Android**
2. Metro no ar: `pnpm start`
3. Rode (o script força o dispositivo Android — sem isso o Maestro pode cair no iOS e falhar com *Package host.exp.Exponent is not installed*):

```bash
pnpm test:e2e
# maestro --device emulator-5554 test .maestro/
```

O fluxo usa `openLink: exp://10.0.2.2:8081` (host do Mac visto do emulador Android). Em dispositivo físico, troque pelo endereço IP do Metro (ex.: `exp://192.168.x.x:8081`).

| Flow | Arquivo | O que prova |
| --- | --- | --- |
| Boot / smoke | `.maestro/00-smoke-boot.yml` | Expo Go abre e cai em Search (`search-repos-idle`) |
| Shared boot | `.maestro/shared/boot.yml` | Subfluxo reutilizado pelos demais |
| Search → Details → Issues | `.maestro/10-search-details-issues.yml` | Busca live `react` → detalhe → issues |
| Source toggle | `.maestro/20-source-toggle.yml` | Toggle no header Search; Config fonte GitHub ↔ GitLab |
| Config | `.maestro/30-config-theme.yml` | Seções Config + flip de tema |
| Explore | `.maestro/40-explore.yml` | Trending live → detalhe |

Pré-condições: rede ok (APIs GitHub/GitLab); rate limit pode falhar o suite (sem soft-pass).

## Declaração de uso de IA (§8)

O projeto foi desenvolvido com o **Cursor** como editor e assistente de código. Após o setup inicial, as funcionalidades passaram a seguir o processo de **Spec-Driven Development (SDD)** da skill [`tlc-spec-driven`](.cursor/skills/tlc-spec-driven/SKILL.md): especificação → desenho quando necessário → tarefas → implementação → verificação.

O foco do desenvolvimento é definir regras de negócio, critérios de aceitação, decisões e trade-offs. A IA acelera a escrita e a estruturação do código, mas cada entrega é revisada e validada contra a especificação; a responsabilidade pelas decisões e pelo resultado final permanece humana.

### Seleção de modelos por afinidade

- **Claude Opus 4.8:** planejamento, análise de requisitos e desenho de soluções que exigem mais raciocínio.
- **Cursor Auto:** implementação das tarefas especificadas, priorizando eficiência de tokens e execução no contexto do repositório.
- **GPT:** documentação e redação técnica, por melhor adequação a conteúdo textual estruturado.

Essa seleção é pragmática: o modelo é escolhido conforme a natureza da etapa, não como substituto da validação técnica.

### Otimização de contexto

O ambiente de desenvolvimento também possui o [RTK (Rust Token Killer)](https://github.com/rtk-ai/rtk) instalado e integrado ao Cursor. A ferramenta intercepta e compacta a saída de comandos de terminal — como `git`, testes, lint e logs — antes de ela entrar no contexto do agente, reduzindo ruído e o consumo de tokens de entrada.

O RTK não reduz diretamente os tokens gerados pelo modelo nem garante a mesma redução no custo total: sua atuação é limitada à saída de comandos do shell. Quando for necessária uma investigação detalhada, o output completo continua disponível para consulta.

### O que foi gerado / fortemente assistido

- Scaffold inicial do projeto Expo e ajustes de tooling (ESLint, Prettier, Jest, Husky)
- Setup do Storybook (React Native) e estrutura inicial do Design System
- Planejamento da arquitetura e do Design System a partir do enunciado
- Especificações, critérios de aceitação e planos das features em `.specs/features/`
- Implementação de funcionalidades a partir dessas especificações
- Estrutura e redação deste README alinhada aos requisitos do teste

### O que foi adaptado / revisado

- Decisões de camadas (domínio isolado, mappers por API, injeção de dependências em um ponto só)
- Escopo do Design System (tokens e props controladas conforme a seção 6 do teste; remoção de `tone` / `sx`)
- Escolha do Maestro como executor dos testes ponta a ponta
- Cache por `queryKey` + `dataSource` em vez de invalidar no toggle
- Scripts e pacotes alinhados ao Expo SDK 54 e ao uso de pnpm
- Código e testes confrontados com os critérios de aceitação definidos antes da implementação

### O que foi rejeitado / evitado

- Aceitar o tema e componentes do template Expo como Design System final
- Expo Router — navegação ficou em React Navigation (Stack + Tabs) a partir do `App.tsx`
- Espalhar `if (github|gitlab)` na interface (e `DataSource` / nomes de provedor no domínio)
- Domínio DDD OO (classes / entity methods) — Functional Core: types + helpers puros
- Use cases com `.execute` — factories `(input) => Promise`; DI sem importar Zustand e sem `AppContainerProvider`
- Tokens via `.env` como fonte de verdade; tokens no AsyncStorage — só SecureStore + mapa no DI
- `invalidateQueries` / `removeQueries` no toggle de fonte — isolamento por `queryKey` com `dataSource`
- Prop `tone` (e aliases) e `sx` no Design System; lookups com `switch` — object maps + eixos `color` / `bg` / `variant` / `size`
- Importar SVG de marca fora de `DataSourceLogo`; organisms do DS com Zustand (adapters em presentation)
- Query mágica de trending na UI; favoritos com `persist` no Zustand (I/O no adapter AsyncStorage)
- Detalhes/Issues como organisms do DS (DS não conhece `Repo`/`Issue`); campos extras de Issue (assignees, body, milestone…)
- N+1 HTTP para gaps do GitLab; pacote pnpm workspace formal do DS; biometria / `requireAuthentication` no SecureStore
- Commitar tokens de API ou `.env` com credenciais
- Entregar código de IA sem entendimento, revisão e validação das decisões (inversão de dependência, contratos, cache)

### Prompts / instruções típicas

- Analisar o enunciado (`Teste_Tecnico_React_Native_v3.md`) e extrair requisitos / critérios de aceite
- Spec → design → tasks em `.specs/features/` (SDD) antes de implementar
- Plano por fatias: Design System → domínio → application → infra multi-provider → presentation → e2e
- Implementar só o escopo da task; confrontar com ACs; não enfraquecer testes de guarda de camada
- Redigir/atualizar o README com as seções obrigatórias do §8–§9

## O que eu faria diferente com mais tempo

O ganho maior seria **estender o modelo de `dataSource`**, não reescrever a app:

- Novos provedores (ex.: **Bitbucket**) como mais uma implementação do mesmo contrato `RepoRepository` + mapper + entrada no DI / seletor — UI e use cases intactos
- **Repositórios privados**: completar a UI de tokens na Config (SecureStore + DI já prontos) e autenticar as buscas/detalhes/issues por fonte
- Generalizar o seletor e o tema de marca para N fontes, sem `if (provider)` na presentation

## Status

Entrega alinhada ao escopo do teste técnico (busca, detalhes, issues, favoritos, troca de fonte, Design System, cache, testes). Itens acima são evoluções pós-entrega.

## Licença

Uso privado / avaliação técnica.
