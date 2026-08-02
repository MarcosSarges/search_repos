# Presentation Layer (Bridge) Specification

## Problem Statement

Domain, application e infrastructure (DI + HTTP) estão prontos, mas a árvore React ainda não injeta o `AppContainer`, não há TanStack Query, e nenhum hook de produto consome os use cases. Sem essa ponte, as telas futuras voltariam a acoplar HTTP/storage ou a inventar orquestração ad hoc — violando Clean Arch e AD-005.

## Goals

- [ ] `AppContainerProvider` em `src/presentation/providers/` recria o container a partir de `dataSource` + `tokens` do session store (sem o DI importar Zustand)
- [ ] `QueryClientProvider` + hooks em `src/presentation/hooks/` (`useInfiniteQuery` search/issues; `useQuery` details)
- [ ] `queryKey` inclui `dataSource`; toggle de fonte **não** chama invalidate/remove (cache isolado e reutilizável)
- [ ] Mapper puro `AppError` → string PT-BR por code (sem `cause`)
- [ ] Slot `tokens` no Zustand + persistência via `expo-secure-store` (sem UI); nunca AsyncStorage/`partialize`

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Telas de busca / detalhes / issues | Próxima feature — ver `NEXT.md` |
| UI + persistência de token API | Credentials — AD-021 / `NEXT.md` |
| Showcase in-app, Badge/Avatar | DS / polish — `NEXT.md` |
| Remoção completa do template Expo (Explore/Modal) | Cleanup junto das telas de produto |
| Maestro E2E dos fluxos de busca | Depois das telas |
| Retry/backoff HTTP inventado na presentation | Só defaults conservadores do QueryClient |
| `invalidateQueries` / `removeQueries` no toggle de fonte | Explicitamente rejeitado — isolamento só via `queryKey` |
| Persistência de tokens em AsyncStorage / `partialize` | Rejeitado — SecureStore only |
| UI de formulário de token | Credentials UX — `NEXT.md` |
| `requireAuthentication` / biometria no SecureStore | Polish — Expo Go limita; `NEXT.md` |
| Parse de `cause` em rate_limit para “tente em X” | Polish/credentials — `NEXT.md` |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Escopo desta fatia | Só a ponte (providers + hooks + mapper); telas em `NEXT.md` | Confirmado pelo user | y |
| Lembrete de follow-ups | `.specs/features/presentation-layer/NEXT.md` | Pedido explícito | y |
| Layout de pastas | `src/presentation/providers/` + `src/presentation/hooks/` | Discuss — simetria Clean Arch | y |
| Telas / stores path | `src/screens/` e `src/stores/` permanecem; sem move nesta fatia | Discuss / escopo | y |
| Hooks de lista | `useInfiniteQuery` para search + issues; `useQuery` para details | Discuss — contrato definitivo p/ FlatList | y |
| Troca de fonte / cache | Só `dataSource` na `queryKey`; **sem** `invalidateQueries` / `removeQueries` no toggle | Discuss — cache cross-toggle | y |
| Mapper | Função pura → strings PT-BR por `AppErrorCode`; sem parse de `cause` | Discuss — MVP simples | y |
| Tokens no DI | Slot `tokens` no session Zustand + plug em `createContainer`; **sem UI** | Discuss — contrato final do provider | y |
| Persistência de `tokens` | **`expo-secure-store`** (SDK 54); **não** AsyncStorage/`partialize` | Design review — user (SecureStore docs) | y |
| Gate com tokens | Product UI só após prefs + tokens SecureStore hidratados | Evita flash anônimo | y |
| SecureStore indisponível (web) | Memória only; sem crash | `isAvailableAsync` | y |
| Dependência TanStack Query | Adicionar `@tanstack/react-query` compatível com RN/Expo 54 | AD-005 | y |
| App wiring | Providers no entry de produto; Home chrome não quebra | Bridge live | y |
| QueryClient defaults | Defaults conservadores da lib / mínimos; sem retry policy inventada | Agent discretion (context) | n → agent |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Composition na árvore React ⭐ MVP

**User Story**: As a developer of screens, I want an `AppContainerProvider` that wires `createContainer` from the active `dataSource`, so hooks call use cases without importing adapters or branching on provider.

**Why P1**: Fecha AD-020/AD-002 na borda React; sem isso a ponte não existe.

**Acceptance Criteria**:

1. WHEN the provider mounts (after session hydrate) THEN it SHALL call `createContainer({ dataSource, tokens })` reading both from the session store and SHALL NOT import repository adapters directly
2. WHEN `dataSource` or `tokens` change THEN the provider SHALL expose a new container instance (immutable wiring; no mutating a shared repository ref)
3. WHEN a child calls `useAppContainer()` (or equivalent) outside the provider THEN it SHALL throw a clear error
4. WHEN modules under `src/infrastructure/di/` are scanned THEN they SHALL still NOT import Zustand or React
5. WHEN `tokens` fields are empty/undefined THEN adapters SHALL run anonymously (DI selects missing token as today)
6. WHEN the session store is inspected THEN it SHALL expose a typed `tokens: { github?: string; gitlab?: string }` slot (default empty) usable by the provider without any credentials UI
7. WHEN persist `partialize` runs THEN it SHALL continue to persist only `mode` and `dataSource` (tokens SHALL NOT be written to AsyncStorage)
8. WHEN `setToken` / `setTokens` update a token value THEN the implementation SHALL persist that value via `expo-secure-store` (and delete the SecureStore entry when the token is cleared)
9. WHEN the app cold-starts on a platform where SecureStore is available THEN after the session gate tokens SHALL be restored from SecureStore into the in-memory bag before product UI that depends on the container is shown
10. WHEN SecureStore is unavailable (e.g. web) OR read fails THEN the in-memory `tokens` bag SHALL default to empty and the app SHALL still become ready (anonymous adapters)
11. WHEN `reset()` runs THEN it SHALL clear in-memory tokens and remove the corresponding SecureStore entries (in addition to preferences reset)

**Independent Test**: Jest with SecureStore mocked — setToken persists; cold start restores; partialize excludes tokens; unavailable → empty; reset deletes keys; provider recreate on tokens change.

---

### P1: TanStack Query + hooks de produto ⭐ MVP

**User Story**: As a screen author, I want `useSearchRepos`, `useRepoDetails`, and `useRepoIssues` backed by TanStack Query and the container, so lists/details share cache and respect the active data source via `queryKey`.

**Why P1**: Enunciado §7 + AD-005; contrato definitivo (`useInfiniteQuery` nas listas) para as telas seguintes.

**Acceptance Criteria**:

1. WHEN the app boots THEN a `QueryClientProvider` SHALL wrap the product tree (alongside the container provider)
2. WHEN `useSearchRepos` is used THEN it SHALL be implemented with `useInfiniteQuery`, call `container.searchRepos` with page params, and its `queryKey` SHALL include the active `dataSource` and the search query
3. WHEN `useRepoDetails` runs with a `repoId` THEN it SHALL use `useQuery`, call `container.getRepoDetails`, and the `queryKey` SHALL include `dataSource` + `repoId`
4. WHEN `useRepoIssues` is used THEN it SHALL be implemented with `useInfiniteQuery`, call `container.listRepoIssues` with page params, and the `queryKey` SHALL include `dataSource` + `repoId`
5. WHEN `dataSource` changes THEN hooks SHALL read/write only the cache entry for the new `queryKey` (previous source cache may remain for later reuse); the implementation SHALL NOT call `invalidateQueries` or `removeQueries` as part of the data-source toggle
6. WHEN hooks are used THEN they SHALL NOT import `@/infrastructure/github|gitlab` or call `fetch` directly
7. WHEN a use case rejects with `AppError` THEN the Query error state SHALL surface that error (mapper available for display strings; raw `code` remains inspectable in tests)
8. WHEN product data hooks are added THEN they SHALL live under `src/presentation/hooks/` (not `src/hooks/`)

**Independent Test**: Jest + RNTL with Fake repository injected through container; toggle `dataSource` and assert distinct cache entries / no invalidate-on-toggle; import scan on presentation hooks.

---

### P1: Mapper `AppError` → mensagem de UI ⭐ MVP

**User Story**: As a UI consumer, I want a pure mapper from `AppError` (and unknown failures) to a user-facing string, so screens never hardcode domain codes as copy and the domain stays message-free.

**Why P1**: Enunciado §5 (“mensagens amigáveis”); domínio sem `message` de produto (INFRA/DOM).

**Acceptance Criteria**:

1. WHEN given an `AppError` with a known `code` THEN the mapper SHALL return a non-empty user-facing string for that code (`rate_limit`, `network`, `not_found`, `empty_query`, `invalid_input`, `unauthorized`, `forbidden`, `aborted`, `unknown`)
2. WHEN given a non-`AppError` THEN the mapper SHALL return the `unknown` (or equivalent fallback) user-facing string
3. WHEN the mapper module is imported THEN it SHALL NOT depend on React, React Native, or TanStack Query (pure / Node-testable)
4. WHEN `rate_limit` includes structured `cause` THEN the mapper SHALL still return only the static PT-BR string for `rate_limit` (no formatting from `cause` in this slice)

**Independent Test**: Pure Jest table per `AppErrorCode` + non-AppError fallback; rate_limit with/without cause → same string.

---

### P2: Smoke de wiring na Home (opcional / mínimo)

**User Story**: As a developer, I want the providers mounted in `App.tsx` without breaking Home chrome, so the bridge is live in the running app.

**Why P2**: Valida composition real; UI de busca continua out of scope.

**Acceptance Criteria**:

1. WHEN the app entry renders product mode (not Storybook) THEN `QueryClientProvider` and `AppContainerProvider` SHALL be ancestors of `RootNavigator`
2. WHEN Home renders THEN existing Header toggles (theme / data source) SHALL still work
3. WHEN this slice ships THEN it SHALL NOT require a visible search results UI on Home

**Independent Test**: Existing `HomeScreen` tests remain green; smoke test that providers wrap navigator (or render hook under providers).

---

## Edge Cases

- WHEN `dataSource` toggles mid-flight THEN in-flight queries for the old `queryKey` SHALL not be treated as the active key’s data (TanStack scopes by key; no toggle-time invalidate)
- WHEN search query is empty and a hook is disabled via `enabled: false` THEN it SHALL NOT call the use case
- WHEN `useAppContainer` is used without provider THEN fail fast (throw), not silent undefined
- WHEN mapper receives `AppError` with unexpected future code string THEN fallback to `unknown` copy (exhaustive map + default)
- WHEN user toggles A→B→A THEN cache for A MAY still be present and reusable (no remove on toggle)

---

## Implicit-requirement dimensions

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | Remains in domain/application; hooks pass input through; `enabled` avoids empty search calls |
| Failure / partial-failure | Query error state + mapper for display strings |
| Idempotency / retry | TanStack defaults only; no custom retry policy inventada nesta fatia (assumption) |
| Auth & rate limits | Anonymous DI; mapper covers `rate_limit` / `unauthorized` / `forbidden` codes; token UI deferred |
| Concurrency / ordering | New container per `dataSource`/`tokens`; queryKey includes `dataSource` |
| Data lifecycle / expiry | QueryClient defaults; tokens in SecureStore across restarts (iOS may survive reinstall — platform behavior) |
| Observability | N/A |
| External-dependency failure | Surfaced as `AppError` via use cases; mapper for copy |
| State-transition integrity | `dataSource`/`tokens` change → new container; cache isolated by key only |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| PRES-01 | P1: Provider calls createContainer from dataSource | Execute | ✅ Verified |
| PRES-02 | P1: dataSource change → new container instance | Execute | ✅ Verified |
| PRES-03 | P1: useAppContainer outside provider throws | Execute | ✅ Verified |
| PRES-04 | P1: di/ still no Zustand/React | Execute | ✅ Verified |
| PRES-05 | P1: empty tokens → anonymous adapters | Execute | ✅ Verified |
| PRES-05b | P1: store exposes tokens slot | Execute | ✅ Verified |
| PRES-05c | P1: tokens excluded from AsyncStorage partialize | Execute | ✅ Verified |
| PRES-05d | P1: setToken persists via expo-secure-store | Execute | ✅ Verified |
| PRES-05e | P1: cold start restores tokens from SecureStore before UI | Execute | ✅ Verified |
| PRES-05f | P1: SecureStore unavailable → empty tokens, still ready | Execute | ✅ Verified |
| PRES-05g | P1: reset clears SecureStore token entries | Execute | ✅ Verified |
| PRES-06 | P1: QueryClientProvider wraps product tree | Execute | ✅ Verified |
| PRES-07 | P1: useSearchRepos = infinite + queryKey dataSource | Execute | ✅ Verified |
| PRES-08 | P1: useRepoDetails + queryKey | Execute | ✅ Verified |
| PRES-09 | P1: useRepoIssues = infinite + queryKey | Execute | ✅ Verified |
| PRES-10 | P1: dataSource toggle = key isolation only (no invalidate/remove) | Execute | ✅ Verified |
| PRES-11 | P1: hooks no direct github/gitlab/fetch | — | Superseded — presentation isolation scans removed (arch by convention; domain/app/infra keep isolation) |
| PRES-12 | P1: AppError surfaces in Query error | Execute | ✅ Verified |
| PRES-13 | P1: mapper covers all AppErrorCode (PT-BR) | Execute | ✅ Verified |
| PRES-14 | P1: mapper non-AppError → unknown | Execute | ✅ Verified |
| PRES-15 | P1: mapper pure (no React/RN/Query) | Execute | ✅ Verified |
| PRES-16 | P1: rate_limit ignores cause formatting | Execute | ✅ Verified |
| PRES-17 | P2: providers in App entry under presentation/ | Execute | ✅ Verified |
| PRES-18 | P2: Home chrome still works | Execute | ✅ Verified |
| PRES-19 | P1: product hooks live under src/presentation/hooks/ | Execute | ✅ Verified |

**Coverage:** 25 total, 25 mapped to tasks (T1–T14), 0 unmapped

---

## Success Criteria

- [ ] App sobe com providers; Home Header continua ok
- [ ] Hooks de busca/detalhe/issues usam container + Query; `queryKey` inclui `dataSource`
- [ ] Troca GitHub↔GitLab usa nova `queryKey` (sem invalidate); voltar à fonte anterior pode reutilizar cache
- [ ] Mapper puro cobre todos os `AppErrorCode` + fallback; rate_limit estático
- [ ] Store tem slot `tokens` wired no container; tokens no **SecureStore** (não AsyncStorage)
- [ ] Cold start restaura tokens antes da UI de produto; web/unavailable → anônimo
- [ ] Código novo em `src/presentation/{providers,hooks}/` + adapter SecureStore; `NEXT.md` lista UI
- [ ] `pnpm test` verde na fatia

---

## References

- AD-002, AD-005, AD-020, AD-021 — `.specs/STATE.md`
- Application deferred: `AppContainerProvider` / queryKey — `.specs/features/application-layer/context.md`
- Infrastructure deferred: Presentation / token UI — `.specs/features/infrastructure-layer/spec.md`
- Follow-ups: `.specs/features/presentation-layer/NEXT.md`
