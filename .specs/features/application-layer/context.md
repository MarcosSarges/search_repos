# Application Layer Context

**Gathered:** 2026-08-02
**Spec:** `.specs/features/application-layer/spec.md`
**Status:** Locked — feeding Design (Approach A)

---

## Feature Boundary

Formalizar a camada de **application** (use cases puros que orquestram o domínio via `RepoRepository`) e o **composition root** em **infrastructure/di**, com Fake in-memory como implementação provisória da porta. Sem Provider React, sem TanStack Query, sem HTTP GitHub/GitLab reais. Presentation consome o DI numa fatia posterior.

---

## Implementation Decisions

### Use cases & domain helpers (Specify Q1–Q5)

- Escopo inclui **wiring de DI** (não só use cases)
- Use cases **obrigatoriamente** usam helpers do domínio: `normalizeSearchQuery`, `assertPage`, `assertPerPage` — sem duplicar trim/`empty_query`/bounds inline
- Defaults de paginação na **application**: `page = 1`, `perPage = 20` (constantes locais; domínio continua sem default)
- `repoId` vazio/whitespace → `AppError` com code **`invalid_input`** (não `not_found`)
- Application isolada: sem React, RN, Expo, Axios, AsyncStorage, TanStack Query, Zustand, styled-components — só `@/domain` + tipos próprios; teste de imports proibidos

### A — Composition root & barrels

- **Híbrido:** factories puras em `src/application/use-cases/**`; composition root em `src/infrastructure/di/**`
- Factories recebem `RepoRepository` e retornam a **função executável** `(input) => Promise<…>` — **sem** objeto `{ execute }` / classes
- Barrel `@/application`: use-case factories, tipos de I/O, `DataSource` (+ guard). **Não** exporta DI
- Quem importa DI: **só Presentation** (App / providers / hooks) e **testes**. Use cases **nunca** importam o container (evita Service Locator)
- Fake move de `src/application/fakes/` → `src/infrastructure/` (ex. `fakes/` ou `repositories/fake/`) — é implementação concreta da porta

### B — O que o DI injeta agora

- **Fake** como protagonista provisório em runtime (permite presentation avançar sem HTTP)
- **Não** criar stubs GitHub/GitLab que só lançam erro nesta fatia
- `resolveRepository(dataSource: DataSource): RepoRepository` **já ramifica** `github` | `gitlab`; por enquanto **ambas** retornam o Fake
- Exportar `createContainer(deps)` **e** tipagens do container (testabilidade / injeção de deps)

### C — Troca de fonte em runtime

- Container e use cases **imutáveis**: ao trocar fonte, Presentation chama `createContainer({ dataSource })` de novo (novas instâncias)
- DI **não** importa Zustand; recebe `dataSource` como parâmetro
- Invalidação / `queryKey` TanStack: **fora de escopo** (spoiler: presentation usará `dataSource` na `queryKey`)

### D — Consumo pela UI nesta fatia

- **Sem** `AppContainerProvider` / `useAppContainer` — isso é Presentation (React + store); fatia seguinte
- Container expõe funções parcialmente aplicadas: `container.searchRepos(input)`, etc.
- Testes do DI: unitários puros (ramificação `resolveRepository`, isolamento de instâncias ao recriar container)
- Barrel `@/infrastructure`: API pública = `createContainer`, tipos do container, Fake (para testes). Internals protegidos

### Agent's Discretion

- Nomes exatos de arquivos (`create-container.ts` vs `container.ts`, path do Fake sob infrastructure)
- Nome das constantes de default (`DEFAULT_PAGE`, `DEFAULT_PER_PAGE`)
- Shape exato de `createContainer` deps além de `dataSource` (ex. override opcional de `repository` para testes)
- Se factories renomeiam de `createSearchReposUseCase` → `createSearchRepos` (alinhar ao estilo funcional discutido) — preferir nomes curtos funcionais se o rename for mecânico e testes acompanharem

### Declined / Undiscussed Gray Areas → Assumptions

Nenhuma área recusada. Todas A–D discutidas e confirmadas pelo usuário.

---

## Specific References

- Topologia Clean Arch confirmada pelo usuário: Domain (porta) → Application (factories) → Infrastructure adapters + DI → Presentation importa só o DI
- “Adiar decisões de infra”: Fake em runtime até feature HTTP
- “Sem `.execute`”: Functional Core — factory retorna a função final
- Spoiler cache: `queryKey` com `dataSource` (não implementar agora)

---

## Deferred Ideas

- `AppContainerProvider` + `useAppContainer` (Presentation)
- Implementações HTTP GitHub/GitLab + mappers; trocar `return fake` em `resolveRepository`
- Hooks TanStack Query + `dataSource` na `queryKey`
- Telas de busca / detalhes / issues consumindo o container
- Tokens HTTP / copy de erro amigável na UI
