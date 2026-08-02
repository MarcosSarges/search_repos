# Infrastructure Layer Context

**Gathered:** 2026-08-02
**Spec:** `.specs/features/infrastructure-layer/spec.md`
**Status:** Locked — feeding Spec / Design

---

## Feature Boundary

Implementar a Anti-Corruption Layer HTTP: adapters `RepoRepository` para GitHub e GitLab (fetch nativo + mappers), classificação de erros HTTP → `AppError`, extensão mínima de `AppErrorCode` no domínio, e `resolveRepository` entregando adapters reais em runtime. Fake in-memory sai do caminho de produção/dev e fica só para testes. Sem UI de token, sem persistência de credenciais, sem Presentation/TanStack Query, sem copy amigável na UI.

---

## Implementation Decisions

### A — Tokens & autenticação opcional

- Tokens **GitHub e GitLab**, ambos opcionais; sem token o adapter opera **anonimamente** (sobe rate limit quando presente)
- **Não** usar `.env` como fonte de verdade (revisa AD-008): o usuário informará token depois e persistirá localmente — **fora desta fatia**
- Nesta fatia: DI recebe **mapa de credenciais** `tokens?: { github?: string; gitlab?: string }`; `resolveRepository` escolhe o token do `dataSource` ativo (Presentation não microgerencia qual string enviar)
- Adapters ainda recebem `token?: string` **já resolvido** na factory; auth genérica e opcional no **wiring da porta**, **não** nas entidades de domínio (`Repo` / `Issue`)
- UI + AsyncStorage/Zustand para tokens: **Deferred** (feature de sessão/credenciais)
- Persistência pode no futuro viver ao lado de `dataSource` no storage — não bloqueia infra HTTP agora

### B — Taxonomia HTTP → `AppError`

- Mapa fechado:
  - `429` → `rate_limit` com `cause` estruturado contendo metadados de retry quando a Response estiver disponível (ex. `X-RateLimit-Reset`, `Retry-After`) — Presentation pode formatar “tente em X” depois
  - rede / timeout / offline → `network`
  - `404` → `not_found`
  - `401` → `unauthorized` (**novo** `AppErrorCode`)
  - `403` → `forbidden` (**novo** `AppErrorCode`)
  - abort / cancelamento de request → `aborted` (**novo** `AppErrorCode`)
  - demais (5xx, body inválido, etc.) → `unknown`
- Shape do domínio permanece `code` + `cause?` — sem mensagem user-facing no domínio; `cause` de `rate_limit` é tipado/documentado na infra (não vaza string de UI)
- Extensão de `AppErrorCode` é mudança mínima permitida no domínio **dentro desta feature** (infra precisa mapear)

### C — Identidade `repoId` opaca

- **GitHub:** `Repo.id` / `repoId` = `owner/repo` (full name); usado direto em `/repos/{owner}/{repo}` e issues
- **GitLab:** `Repo.id` / `repoId` = `String(project.id)` (id numérico imutável); path encoded não é a moeda desta fatia
- Fluxo lista → detalhe/issues: o `id` retornado na busca **é** o repassado cego pela UI (`getById` / `listIssues`) — zero acoplamento na Presentation
- Formato nativamente incompatível com o adapter (**Fail Fast**, sem HTTP):
  - GitHub sem `/` → `invalid_input`
  - GitLab não-numérico → `invalid_input`

### D — `hasNextPage` (sem vazar `totalCount`)

- Estratégia **híbrida**: headers como fonte de verdade (GitHub `Link: rel="next"`; GitLab `X-Next-Page` / equivalentes); fallback `items.length === perPage` se headers ausentes (proxy/anomalia)
- Página vazia (`items = []`) → sempre `hasNextPage: false`
- Helper compartilhado de paginação é **agnóstico**: aceita flag genérica `resolvedHasNext?` (ou equivalente) quando o caller já calculou o next — **sem** campo `totalCount*` no kit HTTP
- Search GitHub: calcular `hasNextPage` **dentro do mapper/adapter** com `(page * perPage) < Math.min(total_count, 1000)` (hard limit da Search API = 1000 resultados); passar só o boolean resolvido ao helper; **não** expor `totalCount` no domínio

### E — Testes & Fake no DI

- Gate principal: teste do **fluxo adapter completo** (adapter → rede → mapper ou classificador), não só mapper isolado como único gate
- HTTP nos testes: adapters usam **`fetch` nativo**; **MSW** intercepta a rede e devolve fixtures (adicionar `msw` — ainda não está no `package.json`)
- **Não** introduzir cliente HTTP injetável só para testabilidade; **não** mock frágil de `global.fetch` como estratégia preferida
- `resolveRepository('github' | 'gitlab')` → adapters HTTP reais em runtime; Fake **só** importado em testes (use cases / UI)
- Fixtures com **cobertura ampla**: `null` e chaves omitidas → mapeadas para `undefined` (DOM-05 / opcionalidade estrita)

### Agent's Discretion

- Layout de pastas sob `src/infrastructure/` (ex. `github/`, `gitlab/`, `http/`, `mappers/`)
- Shape exato do tipo `RateLimitCause` (campos reset/retry) e parsing de headers GitHub vs GitLab
- Parsing fino de `Link` / `X-Next-Page` e ordem empty → `resolvedHasNext` → headers → length fallback
- Organização de handlers/fixtures MSW e setup Jest
- Se mappers também têm unit tests pontuais além do gate E2E-of-adapter (complementares, não substitutos do gate)
- Atualização pontual do README (tokens locais futuros vs remoção da ênfase em `.env`) — se entrar no escopo Execute ou ficar para a feature de credenciais

### Declined / Undiscussed Gray Areas → Assumptions

Nenhuma área A–E recusada. Todas discutidas e confirmadas pelo usuário.

---

## Specific References

- Enunciado §3.3 / §5 (GitHub + GitLab; 429; formatos distintos encapsulados na infra)
- AD-001 / AD-002 / AD-020 (Clean Arch, contrato único, composition root); AD-008 a **superseder** (token via env → token do usuário + persist local, UI depois)
- Opaque ID + Fail Fast no adapter (discuss C)
- Anti-Corruption Layer validada ponta a ponta com MSW (discuss E)
- DOM-05: opcionais `?:` / `undefined`, nunca `null` vazando do mapper

---

## Deferred Ideas

- UI para pedir token ao usuário + persistência (AsyncStorage / session store ao lado de `dataSource`)
- `AppContainerProvider` / hooks Presentation / TanStack Query + `queryKey` com `dataSource`
- Telas de busca / detalhes / issues
- Copy de erro amigável na UI (`unauthorized` / `forbidden` / `aborted` / rate limit)
- Aceitar path URL-encoded no GitLab além do id numérico (não necessário se a busca sempre devolver id numérico)
- Cliente HTTP compartilhado injetável (rejeitado de propósito nesta fatia)
