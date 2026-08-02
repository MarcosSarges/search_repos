# Presentation Layer (Bridge) Context

**Gathered:** 2026-08-02
**Spec:** `.specs/features/presentation-layer/spec.md`
**Status:** Locked — feeding Design

---

## Feature Boundary

Entregar **só a ponte** de presentation: `AppContainerProvider` + `QueryClientProvider` + hooks de produto (`useSearchRepos`, `useRepoDetails`, `useRepoIssues`) + isolamento de cache por `dataSource` na `queryKey` + mapper puro `AppError` → string PT-BR. Sem telas de busca/detalhes/issues, sem UI de token, sem Showcase. Follow-ups em `NEXT.md`.

---

## Implementation Decisions

### 1 — Pastas (simetria Clean Arch)

- Hooks e providers de produto vivem em **`src/presentation/providers/`** e **`src/presentation/hooks/`**
- Motivo: simetria visual com `domain` / `application` / `infrastructure`; React como casca imperativa do Functional Core
- **Não** achatar novos hooks/providers em `src/hooks/` ou `src/providers/` na raiz
- Hooks legado do template em `src/hooks/` (theme-color etc.) ficam onde estão até cleanup (`NEXT.md`)
- Telas continuam em `src/screens/` nesta fatia (move/refactor de rotas de produto = feature seguinte)
- Session store permanece em **`src/stores/`** (já entregue em theme-persist-home); só ganha o slot `tokens`

### 2 — Hooks de lista: `useInfiniteQuery` desde o dia 1

- **`useSearchRepos`** e **`useRepoIssues`**: TanStack **`useInfiniteQuery`**
- **`useRepoDetails`**: **`useQuery`** (recurso singular)
- Contrato definitivo para FlatList + infinite scroll nas telas futuras — sem reescrever assinatura/testes depois
- Paginação: páginas derivadas do infinite (`pageParam`); use cases já recebem `page` / `perPage` (defaults application)
- Hooks expõem `enabled` (ex.: não disparar search com query vazia)

### 3 — Troca de fonte: só `queryKey` (sem invalidate/remove)

- Toda `queryKey` de produto **inclui `dataSource`** (ex. `['repos', dataSource, query]`, `['repo', dataSource, repoId]`, `['issues', dataSource, repoId]`)
- No toggle GitHub↔GitLab: **não** chamar `invalidateQueries` nem `removeQueries`
- Motivo: escopos isolados; voltar à fonte anterior reaproveita cache (UX instantânea)
- Provider **recria** `createContainer({ dataSource, tokens })` ao mudar fonte/tokens (wiring imutável)

### 4 — Mapper de erro: strings PT-BR por code

- Função pura `mapAppErrorToMessage(error: unknown): string` (ou nome equivalente)
- Uma string amigável por `AppErrorCode`; non-`AppError` → copy de `unknown`
- **Sem** parsear `cause` de `rate_limit` (reset/retry) nesta fatia
- Exemplo aceitável para rate limit: *"Limite de requisições atingido. Tente novamente mais tarde."*
- Módulo sem React / RN / TanStack — testável em Node
- Polimento com `cause` → fatia credentials/polish (`NEXT.md`)

### 5 — Tokens: slot no Zustand + SecureStore + plug no DI (sem UI)

- Session store ganha `tokens: { github?: string; gitlab?: string }` (vazio por default) + setter(s) mínimos para o provider ler o bag
- `AppContainerProvider` chama `createContainer({ dataSource, tokens })` — contrato final do DI (AD-021)
- **Sem** formulário/UI de credenciais nesta fatia (setters existem p/ testes + UI futura)
- **Persistência de tokens:** **`expo-secure-store`** ([SDK 54 docs](https://docs.expo.dev/versions/v54.0.0/sdk/securestore/)) — **nunca** AsyncStorage / **nunca** `partialize` do Zustand (`mode` + `dataSource` continuam no AsyncStorage)
- Hydrate: no boot, ler SecureStore → popular `tokens` em memória **antes** do product tree pintar (gate estendido — evita flash anônimo→autenticado)
- `setToken` / `setTokens`: atualizam memória **e** gravam/apagaram chaves no SecureStore
- `reset()`: limpa memória + apaga entradas SecureStore dos tokens + `clearStorage` das prefs
- Sem token → adapters anônimos
- Web / SecureStore indisponível (`isAvailableAsync() === false`): tokens só em memória na sessão; sem throw na UI

### Agent's Discretion

- Nomes exatos das query keys (prefixos estáveis tipados, factory `queryKeys.repos.search(...)`)
- Defaults do `QueryClient` (`staleTime` / `retry`) — preferir defaults conservadores da lib ou mínimos documentados; sem retry agressivo inventado
- Shape exato do retorno dos hooks (re-exportar campos do infinite/query vs wrapper fino)
- Onde montar a árvore de providers em `App.tsx` (ordem: SafeArea → Theme → Query → Container → Nav, ou Query fora/dentro do theme — desde que product tree tenha ambos)
- Se `tokens` no store é um objeto único com `setTokens` / `setToken(dataSource, value)` — preferir API mínima tipada alinhada a `ProviderTokens` do DI
- Barrel `@/presentation` opcional nesta fatia se reduzir friction de imports
- Nomes das SecureStore keys (`searchrepos.token.github` etc.), se um JSON bag vs duas keys, e se o config plugin entra no `app.json` nesta fatia
- `requireAuthentication: false` nesta fatia (Expo Go / sem FaceID copy) — biometria = polish futuro
- Como unificar o gate (`hasHydrated` prefs + tokens SecureStore) sem flash

### Declined / Undiscussed Gray Areas → Assumptions

- Persistência de tokens em **AsyncStorage**: **rejeitada** — SecureStore only
- Move de `src/screens` → `src/presentation/screens`: **não** nesta fatia
- Move de `src/stores` → `src/presentation/stores`: **não** nesta fatia
- UI de colar token: **ainda deferred** (`NEXT.md`) — persistência SecureStore entra **nesta** ponte

---

## Specific References

- AD-002 (uma decisão de fonte), AD-005 (TanStack na borda), AD-020/021 (DI + tokens bag)
- Application context: Presentation recria container; `queryKey` com `dataSource`
- Infra: `createContainer({ dataSource, tokens? })` já existe
- Lembrete produto: `.specs/features/presentation-layer/NEXT.md`

---

## Deferred Ideas

- Telas busca / detalhes / issues + nav de produto (ver `NEXT.md`)
- **UI** de token (o storage SecureStore já fica na ponte)
- Copy rica de rate limit via `cause`
- `requireAuthentication` / biometria no SecureStore
- Showcase in-app, limpeza template Expo, Maestro E2E
- `invalidateQueries` proativo — explicitamente **rejeitado** para toggle de fonte nesta arquitetura
