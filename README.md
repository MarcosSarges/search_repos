# SearchRepos

App React Native (Expo + TypeScript) para buscar repositórios em **GitHub** e **GitLab**, com troca de fonte em tempo de execução, Design System tipado, cache e Clean Architecture.

> Teste técnico — Desenvolvedor React Native.

## Stack

- Expo SDK 54 · TypeScript (strict) — alias `@/*` → `src/*`
- React Navigation (Stack + Tabs) — ponto de entrada em `App.tsx`
- styled-components (ThemeProvider do Design System)
- [Storybook](https://storybookjs.github.io/react-native/) (Design System no dispositivo)
- Jest + React Native Testing Library (unitário / componente / integração)
- [Maestro](https://docs.maestro.dev/) (testes ponta a ponta via Expo Go)
- ESLint + Prettier (+ Husky no pre-commit)

## Instalação e execução

### Pré-requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/)
- Expo Go (dispositivo) ou emulador iOS/Android

### Setup

```bash
pnpm install
```

### Variáveis de ambiente (opcional)

Crie um arquivo `.env` na raiz (não commitar tokens):

```bash
GITHUB_TOKEN=ghp_xxx   # opcional — aumenta o limite de requisições da API do GitHub
```

Sem token, as APIs públicas funcionam com limites mais baixos (trate o código HTTP 429 na interface).

### Scripts

```bash
pnpm start              # servidor de desenvolvimento Expo (app)
pnpm storybook          # Storybook no dispositivo (Design System)
pnpm storybook:android  # Storybook no Android
pnpm storybook:ios      # Storybook no iOS
pnpm android            # Android
pnpm ios                # iOS
pnpm web                # Web
pnpm lint               # ESLint
pnpm test               # Jest (unitário / componente / integração)
# ponta a ponta: ver “Como rodar os testes”
```

### Storybook (Design System)

Desenvolvimento isolado dos componentes do Design System com [Storybook for React Native](https://storybookjs.github.io/react-native/) (troca do ponto de entrada via `STORYBOOK_ENABLED`):

```bash
pnpm storybook
# depois abra no Expo Go / emulador
```

Stories do Design System em `src/components/ds/**/*.stories.tsx` (títulos `DS/Atoms|Molecules|Organisms/...`). Controles globais `themeMode` e `dataSource` no preview.

## Funcionalidades

- Seletor de fonte de dados (GitHub / GitLab) em tempo de execução
- Busca de repositórios com paginação / rolagem infinita e pull-to-refresh
- Detalhes do repositório
- Lista de issues paginada
- Design System tipado + tela Showcase (claro/escuro)
- Cache via biblioteca de data fetching (TanStack Query)
- Estados de carregamento, vazio e erro (limite de taxa, sem conexão)

## Decisões

Seção dedicada às escolhas técnicas do projeto — o *porquê*, não só o *o quê*.

### Arquitetura (Clean Architecture)

Optei por Clean Architecture porque o requisito central é **desacoplamento** e **troca de fonte em tempo de execução**:

1. O **domínio** define contratos (`Repository`, entidades `Repo` / `Issue`) sem depender de React Native, HTTP ou bibliotecas de cache.
2. Os **casos de uso** orquestram a regra de negócio sem saber se a fonte é GitHub ou GitLab.
3. A **infraestrutura** traduz cada API (formatos e paginação diferentes) para o mesmo contrato.
4. A **apresentação** consome hooks e casos de uso — nunca Axios ou fetch direto.

Assim, a interface permanece idêntica ao trocar a fonte: mesma lista, mesmos estados, mesma paginação.

#### Camadas

| Camada | Responsabilidade |
| --- | --- |
| `domain/` | Entidades e interfaces de repositório — zero dependência externa |
| `application/` | Casos de uso (busca, detalhes, issues) |
| `infrastructure/` | Implementações GitHub/GitLab, HTTP, mappers, injeção de dependências, tema |
| `presentation/` | Telas, hooks de interface, Design System |

A estrutura de pastas pode evoluir; o que importa é a inversão de dependências: alto nível não importa baixo nível concreto.

### Navegação — por que sair do Expo Router

O projeto usa **React Navigation** (Stack + Tabs) a partir do `App.tsx`, sem roteamento baseado em arquivos. Motivos:

1. **Familiaridade** — o fluxo de navegadores tipados (`createNativeStackNavigator`, `createBottomTabNavigator`, listas de parâmetros) é o que já domino no dia a dia; menos atrito para montar fluxos (busca → detalhes → issues, modal, abas) sem renegociar convenções de rotas por arquivo.
2. **Acoplamento** — o Expo Router amarra o ponto de entrada, a estrutura de pastas (`app/`), deep linking e layouts ao sistema de arquivos. Com React Navigation a navegação fica isolada em `src/navigation/`, as telas em `src/screens/`, e o ponto de entrada (`App.tsx`) só compõe provedores e o navegador — alinhado à ideia de apresentação desacoplada da infraestrutura de roteamento do Expo.
3. **Gestão de telas e controle** — com nomes repetidos (por exemplo, várias stacks com “Details” / “Issues”) e fluxos aninhados, listas de parâmetros explícitas e `navigate` / `goBack` tipados dão mais controle do que rotas implícitas por caminho. Evita ambiguidade de `href` iguais em grupos diferentes e deixa claro *qual* navegador recebe a ação.

Compromisso consciente: perdemos o roteamento baseado em arquivos e as rotas tipadas “de graça” do Expo Router; ganhamos previsibilidade e um grafo de navegação explícito, fácil de ler e de testar.

### Troca de fonte (GitHub / GitLab) sem impactar a interface

1. **Contrato único** no domínio (ex.: `RepoRepository` com `search`, `getById`, `listIssues`).
2. **Duas implementações** na infraestrutura (`GitHubRepositoryImpl`, `GitLabRepositoryImpl`), cada uma com HTTP e mappers próprios.
3. **Uma decisão em um único lugar** (fábrica / store / injeção de dependências) escolhe a implementação ativa.
4. Telas e hooks dependem do **contrato**, não de `if (provider === 'github')` espalhados.

Resultado: trocar GitHub ↔ GitLab não exige reiniciar o aplicativo nem alterar a interface; a fonte ativa fica visível (rótulo ou indicador no cabeçalho) e pode ser alterada a qualquer momento.

### Design System

O Design System em `src/components/ds/` segue **Atomic Design**:

| Nível | Pasta | O que entra |
| --- | --- | --- |
| Tokens | `tokens/` | `spacing`, `sizes`, `colors` (claro/escuro), `radius`, tipografia (`fontFamily` / `fontWeight` / `lineHeight` por variant), mapa de `primary` por data-source |
| Atoms | `atoms/` | Typography, Icon, Spacer, Loading — props controladas (`variant` / `size` / `tone` / edge); sem `style` público |
| Molecules | `molecules/` | Container, Header — compostos de tokens/atoms (+ organism de logo no Header) |
| Organisms | `organisms/` | `DataSourceLogo` nesta fatia; **telas de produto** (busca, detalhes, issues) serão organisms sob o DS nas features seguintes |

**Shape de cada componente** (`atoms` / `molecules` / `organisms`):

| Arquivo | Papel |
| --- | --- |
| `index.ts` | export público |
| `<Name>.tsx` | composição apenas |
| `<Name>.stories.tsx` | Storybook |
| `styles.tsx` | **único** lugar que instancia `styled(...)` |

Estilos do DS usam sempre `styled-components` (sem `StyleSheet` / `style` solto para chrome). Lookups de variant/tone/size/asset usam object maps, não `switch`.

**Por que logos de marca são organisms:** assets oficiais (GitHub Invertocat claro/escuro, GitLab SVG) e regras de marca não são ícones de UI genéricos. Imports de SVG de marca ficam **somente** em `DataSourceLogo` — molecules/telas consomem o organism, nunca o arquivo SVG direto.

**Tema:** `AppThemeProvider` + `getTheme(mode, dataSource)` — light/dark para o restante da paleta; só `primary` muda entre GitHub e GitLab.

**Storybook** no dispositivo (`pnpm storybook`): catálogo Atomic ao lado dos componentes; toolbar/globals para `themeMode` e `dataSource`. Não embute a UI do Storybook no pacote de produção (`STORYBOOK_ENABLED`).

Não reaproveitei o tema do template Expo (`ThemedText` com override de cor por instância) como Design System final — não atende tokens / props controladas do enunciado.

### Cache

TanStack Query para:

- exibir dados desatualizados enquanto revalida
- carregamento discreto em nova busca
- invalidação coerente ao trocar a fonte de dados

A biblioteca fica fora do domínio: casos de uso puros; cache e orquestração de fetch na borda presentation / infrastructure.

### Testes

| Camada | Ferramenta | Motivo |
| --- | --- | --- |
| Unitário / componente | Jest + React Native Testing Library | Casos de uso em Node puro; componentes do Design System |
| Ponta a ponta | [Maestro](https://docs.maestro.dev/) | Fluxos em YAML; no Expo Go usa `openLink` + `appId: host.exp.Exponent` (indicado no ecossistema Expo) |

Prioridade unitária: casos de uso de domínio / application. Escopo ponta a ponta previsto: troca de fonte, busca → detalhes → issues, vazio / erro quando reproduzível.

### Compromissos (trade-offs)

| Escolher | Prós | Contras |
| --- | --- | --- |
| Clean Architecture | Testável, troca de provedor isolada, interface estável | Mais arquivos e boilerplate no início |
| React Navigation (sem Expo Router) | Familiaridade, menos acoplamento ao sistema de arquivos, controle tipado de stacks | Sem roteamento por arquivo / rotas tipadas do Expo Router |
| Interfaces no domínio + implementações na infraestrutura | Diferenças de API encapsuladas em mappers | Precisa de injeção de dependências / fábrica cuidadosa |
| TanStack Query em presentation / infrastructure | Cache e experiência de uso boas | Não “vaza” para o domínio — consultas fora dos casos de uso puros |
| Design System próprio + Storybook | Tipagem, consistência e catálogo no dispositivo | Custo de manter tokens e stories |
| Maestro para ponta a ponta | Fluxos YAML simples, alinhado ao Expo | Precisa de emulador ou dispositivo; configuração separada do Jest |

## Como rodar os testes

### Unitário / componente (Jest)

```bash
pnpm test
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

Smoke: `.maestro/home.yml` — abre o projeto e verifica que `Welcome!` está visível.

Integração contínua / insights: [testes ponta a ponta no EAS](https://docs.expo.dev/eas/workflows/examples/e2e-tests/) · [Maestro insights](https://docs.expo.dev/eas-insights/maestro/).

## Declaração de uso de IA

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
- Escopo do Design System (tokens e props controladas conforme a seção 6 do teste)
- Escolha do Maestro como executor dos testes ponta a ponta
- Scripts e pacotes alinhados ao Expo SDK 54 e ao uso de pnpm
- Código e testes confrontados com os critérios de aceitação definidos antes da implementação

### O que foi rejeitado / evitado

- Aceitar o tema e componentes do template Expo como Design System final
- Espalhar `if (github|gitlab)` na interface
- Commitar tokens de API ou `.env` com credenciais
- Entregar código de IA sem entendimento, revisão e validação das decisões (inversão de dependência, contratos, cache)

Instruções típicas: análise do enunciado, especificação de regras e critérios de aceitação, plano de passos (Design System → arquitetura → múltiplos provedores), implementação de tarefas e redação do README com as seções obrigatórias do teste.

## O que eu faria diferente com mais tempo

- Persistência da fonte ativa e do tema (AsyncStorage)
- Autenticação opcional GitLab via `.env` com a mesma experiência de desenvolvimento do GitHub
- Cobertura de testes mais ampla (mappers, hooks de interface, fluxos de erro)
- Suite Maestro mais completa (smoke + regressão crítica) e integração contínua com Maestro Cloud / GitHub Actions
- Acessibilidade (rótulos, contraste, tamanhos de toque)
- Offline-first mais agressivo e tratamento fino de limite de taxa por provedor
- Integração contínua (lint + Jest + ponta a ponta) no GitHub Actions

## Status

Projeto em evolução a partir do template Expo. A seção **Decisões** descreve as escolhas-alvo do teste; funcionalidades e pastas serão preenchidas conforme a implementação (começando pelo Design System).

## Licença

Uso privado / avaliação técnica.
