## Teste Técnico

Desenvolvedor React Native

Expo · TypeScript · Clean Architecture · Multi-Provider Runtime · IA Integrada · Testes

## 1. Objetivo

Avaliar a capacidade do candidato de estruturar um projeto React Native com arquitetura limpa, código desacoplado, uso consciente de ferramentas modernas e senso crítico sobre o uso de IA no desenvolvimento. O teste foi desenhado para revelar o nível técnico real do candidato — não apenas o código gerado, mas as decisões por trás dele.

- Estruturar um app Expo com TypeScript seguindo princípios de Clean Architecture.

- Criar um Design System mínimo, tipado e consistente.

- Integrar com múltiplas fontes de dados públicas, com troca de fonte em tempo de execução.

- Implementar cache com boa experiência de usuário.

- Demonstrar senso crítico e responsabilidade no uso de ferramentas de IA.

## 2. Requisitos Técnicos

- Expo (SDK 50+)

- TypeScript — sem any solto, tipos bem definidos

- Cache/Data Fetching: React Query/TanStack Query, SWR, RTK Query ou similar

- Testes: Jest + React Native Testing Library

- ESLint + Prettier configurados e passando

- Desacoplamento: domínio isolado, inversão de dependências, interfaces antes de implementações

## 3. Arquitetura & Desacoplamento

O foco principal desta seção é desacoplamento. Não existe uma estrutura de pastas obrigatória — o candidato é livre para escolher a organização que julgar mais adequada. O que será avaliado é se o código respeita os princípios abaixo, independentemente de como os arquivos estão dispostos.

## 3.1 Princípios obrigatórios

- Inversão de Dependência: módulos de alto nível (regras de negócio) não devem depender de módulos de baixo nível (HTTP, Storage, bibliotecas externas). Ambos devem depender de abstrações.

- Interfaces antes de implementações: repositórios, datasources e serviços externos devem ser definidos como contratos (interfaces/types) e implementados separadamente.

- Domínio isolado: a lógica de negócio (entidades, interfaces) não deve importar nada de React Native, Axios, AsyncStorage, React Query ou qualquer framework. Deve ser testável em Node puro.

- Camada de application separada: use cases e services da aplicação ficam em uma camada própria, orquestrando o domínio sem depender de detalhes de UI ou infraestrutura.

- Camada de apresentação desacoplada: telas e componentes consomem abstrações (hooks, use cases), nunca chamam APIs ou acessam storage diretamente.

## 3.2 Exemplo de estrutura (sugestão, não obrigatória)

A seguir, um exemplo de como esses princípios podem ser organizados em pastas. Você pode seguir, adaptar ou propor uma estrutura diferente — desde que os princípios acima estejam presentes e justificados


## no README.

| Camada | Responsabilidade | Exemplos |
| --- | --- | --- |
| domain/ | Entidades e interfaces de repositório — zero dependência | Repository.ts (interface), Repo.ts, |
|   | externa, núcleo do sistema | Issue.ts |
| application/ | Use cases e services da aplicação — orquestram o | SearchReposUseCase.ts, |
|   | domínio sem depender de frameworks | GetRepoDetailsUseCase.ts, |
|   |   | RepoService.ts |
| presentation/ | Telas, componentes, hooks de UI — consome use cases | screens/, components/, |
|   | via injeção | hooks/useSearchRepos.ts |
| infrastructure/ | Implementações concretas de repositórios, config de libs, | GitHubRepositoryImpl.ts, di/, navigation/, |
|   | DI, navegação | theme/ |

Nota: neste exemplo, a camada de dados (implementações de repositório, datasources, mappers) está dentro de infrastructure/. Você pode separá-la em uma pasta própria (data/) se preferir — o que importa é que a interface esteja no domínio e a implementação concreta fique isolada do restante do código.

## 3.3 Múltiplas Fontes de Dados (Runtime)

O app deve permitir alternar, em tempo de execução, entre duas fontes de dados públicas equivalentes — GitHub e GitLab — para busca de repositórios, detalhes e issues.

## Comportamento esperado:

- Uma tela (ou componente) de seleção permite ao usuário escolher a fonte ativa: GitHub ou GitLab (ver seção 4.1).

- A troca de fonte não deve exigir reiniciar o app, recarregar a tela ou alterar qualquer código de UI.

- As telas de busca, detalhes e issues devem se comportar de forma idêntica independentemente da fonte selecionada — mesmos campos exibidos, mesmos estados de loading/erro/empty, mesma paginação.

- As duas APIs têm formatos de resposta diferentes entre si (nomes de campos, estrutura de paginação, nomenclatura de conceitos). Isso é intencional: o teste avalia como o candidato lida com a diferença sem vazá-la para o restante do app.

## O que será avaliado nesta seção:

- Se a lógica de negócio (busca, ordenação, exibição) permanece a mesma independentemente da fonte.

- Se a troca de fonte é isolada — idealmente, uma única decisão em um único lugar do código, não múltiplos if/else espalhados por telas ou hooks.

- Se cada fonte tem sua própria camada de consumo HTTP, mantendo suas particularidades de formato encapsuladas.

- Como sugestão (não obrigatória), Arquitetura Limpa se encaixa bem aqui: um contrato único de domínio para "repositório"/"issue", independente da fonte, e uma camada de infraestrutura responsável por traduzir cada API pública para esse contrato. Mas a forma exata de organizar isso fica a critério do candidato — o que importa é o resultado observável acima.

Os endpoints públicos de cada API estão detalhados na seção 5.

## 4. Funcionalidades

## 4.1 Seletor de Fonte de Dados (GitHub/GitLab)

- Tela ou componente inicial onde o usuário escolhe a fonte ativa: GitHub ou GitLab.

- A seleção deve refletir imediatamente nas telas de busca, detalhes e issues, sem reiniciar o app.


- Deve ser possível alternar a fonte novamente durante o uso (não apenas na abertura do app) — ex.: um botão ou switch acessível a qualquer momento.

- A fonte ativa deve estar visível para o usuário em algum ponto da interface (ex.: label, badge ou indicador no header).

## 4.2 Busca de Repositórios

- Campo de busca (ex.: "react native", "typescript"). • Lista paginada / infinite scroll com: nome, owner, estrelas, linguagem, descrição. • Pull-to-refresh.

- Tratamento de estados: loading, empty state, erro (rate limit, sem conexão).

## 4.3 Detalhes do Repositório

- Nome completo, owner (avatar + nome), description, stars, forks, watchers, linguagem principal.

- Ação para abrir a tela de Issues do repositório.

## 4.4 Issues do Repositório

- Lista paginada com título, labels, autor e data relativa.

- Pull-to-refresh.

## 4.5 Showcase do Design System

- Tela dedicada exibindo todos os componentes em diferentes estados (variações, tamanhos, desabilitado, loading, etc.).

- Switch de tema light/dark (recomendado).


## 5. Integração com as APIs Públicas

O app deve integrar com as duas fontes de dados descritas na seção 3.3. Não é necessário autenticação para nenhuma delas ao consultar recursos públicos, mas ambas aceitam token opcional para aumentar o limite de requisições.

## 5.1 GitHub

Rate limit: sem autenticação são 60 req/hora. Aceitar opcionalmente GITHUB_TOKEN via .env para aumentar o limite. Não commitar credenciais.

## 5.2 GitLab

```
GET https://gitlab.com/api/v4/projects?search={query}&order_by=star_count&sort=desc&page=
{n}&per_page=20
GET https://gitlab.com/api/v4/projects/{id}
GET https://gitlab.com/api/v4/projects/{id}/issues?state=opened&page={n}&per_page=20
```

Esses três endpoints são acessíveis sem autenticação para projetos públicos. O parâmetro {id} pode ser o ID numérico do projeto (retornado pela busca) ou o path completo URL-encoded (ex.: owner%2Frepo). GitLab.com aplica limites de taxa por IP para requisições não autenticadas — trate o HTTP 429 da mesma forma que o rate limit do GitHub. Aceitar opcionalmente um token via .env não é obrigatório, mas é bem-vindo.

Em ambas as APIs: exibir mensagens de erro amigáveis (rate limit excedido, sem resultados, sem conexão).

## 6. Design System

## 6.1 Tokens (tipados)

| Token | Chaves | Valores sugeridos |
| --- | --- | --- |
| spacing | xs, sm, md, lg, xl | 4, 8, 16, 24, 32 |
| sizes | xs, sm, md, lg, xl | tipografia e ícones |
| colors | primary, background, surface, text, muted, border, success, | light + dark |
|   | warning, danger |   |
| radius | sm, md, lg | 4, 8, 16 |

## 6.2 Componentes Base (tipados)

- Text / Heading: variant e size baseados nos tokens.

- Button: variants primary, outline, ghost; sizes sm, md, lg; estados loading, disabled.

- Input: label, value, error, helperText.

- Card / Surface.

- Badge / Tag.

- Avatar.

## 6.3 Restrições

- Evitar componentes não tipados na construção de telas.

- Evitar liberdade de personalização por instância via style solto.


- Preferir props controladas (variant, size, tone) em vez de estilos livres.

- Preferir ThemeProvider + hook useTheme.

## 7. Cache

Usar uma biblioteca de data fetching / cache (React Query, SWR, RTK Query, axios-cache-interceptor ou similar). O cache deve proporcionar boa experiência ao usuário: dados offline ou stale exibidos enquanto revalida, estados de loading discretos em recarregamentos subsequentes.


## 8. Uso de IA — Política e Avaliação

Este teste avalia o seu nível técnico real, não a qualidade do código gerado por IA. O uso de ferramentas de IA (Copilot, ChatGPT, Claude, Cursor etc.) é permitido, mas deve ser declarado e justificado.

## O que deve ser declarado no README:

- Quais partes do código foram geradas ou fortemente assistidas por IA.

- Quais prompts ou instruções foram utilizados.

- O que você modificou, revisou ou rejeitou do output da IA e por quê.

## O que será avaliado:

| Critério | O que buscamos |
| --- | --- |
| Raciocínio arquitetural | Você entende as decisões de design, ou apenas aplicou o que a IA sugeriu? |
| Senso crítico | Você foi capaz de identificar e corrigir problemas no código gerado? |
| Autoria real | O código reflete seu entendimento, não só um output de ferramenta. |
| Transparência | Declarar o uso de IA honestamente é valorizado, não penalizado. |

Atenção: submissões que aparentem ser integralmente geradas por IA sem nenhuma evidência de entendimento ou adaptação do candidato poderão resultar em uma entrevista técnica aprofundada sobre cada decisão do código entregue.

## 9. Entrega

- Repositório público no GitHub.

- App Expo + TypeScript funcional e iniciando sem erros.

- Busca de repositórios funcionando com paginação.

- Ao tocar em um repositório, abre a tela de detalhes.

- Seletor de fonte de dados (GitHub/GitLab) funcional, com troca em tempo de execução.

- Design System mínimo tipado (tokens + componentes base).

- Tela de Showcase exibindo todos os componentes com variações.

- Cache controlado via biblioteca.

- Testes cobrindo pelo menos os use cases da camada de domínio.

- Commits pequenos e descritivos.

## README obrigatório contendo:

- Instruções de instalação e execução.

- Explicação das decisões arquiteturais (por que Clean Architecture? quais trade-offs?).

- Explicação de como a troca de fonte de dados (GitHub/GitLab) foi resolvida sem impactar a UI.

- Declaração de uso de IA: o que foi gerado, o que foi adaptado, o que foi rejeitado.

- O que você faria diferente com mais tempo.

## 10. Critérios de Avaliação

| Dimensão | Peso | Detalhes |
| --- | --- | --- |
| Arquitetura & | Alta | Clean Architecture bem aplicada, inversão de dependências, interfaces |
| Desacoplamento |   |   |


| Dimensão | Peso | Detalhes |
| --- | --- | --- |
| Múltiplas Fontes de Dados | Alta | Troca de fonte em runtime sem impacto na UI; diferenças de formato entre |
|   |   | APIs isoladas na camada de infraestrutura; ausência de lógica condicional |
|   |   | de fonte espalhada pela aplicação |
| Qualidade do Código | Alta | TypeScript rigoroso, sem any, componentes bem tipados |
| Design System | Média | Tokens, componentes base, showcase completo |
| UX & Estados | Média | Loading, erro, empty state, pull-to-refresh |
| Testes | Média | Cobertura dos use cases, testes de componentes |
| Uso de IA | Diferencial | Transparência, senso crítico sobre o output, adaptações realizadas |
| README & Commits | Baixa | Clareza, commits atômicos e descritivos |

Boa sorte! Estamos ansiosos para ver como você pensa, organiza e constrói — não apenas o resultado final.
