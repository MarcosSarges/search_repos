# Domain Layer Context

**Gathered:** 2026-08-02
**Spec:** `.specs/features/domain-layer/spec.md`
**Status:** Done — Verifier PASS; README guardrails documented

---

## Feature Boundary

Formalizar a camada `src/domain/`: entidades canônicas (Repo, Issue, paginação), porta `RepoRepository`, erros tipados `AppError`, e helpers puros de validação/normalização (**Functional Core**). Zero dependência de React Native, HTTP, storage, data-fetching **e zero conhecimento de provedores** (`github`/`gitlab`). Use cases de produto ficam fora; relocação mínima de `DataSource` para `src/application/` entra nesta feature.

---

## Implementation Decisions

### A — Identidade do repo

- `id` / `repoId` é **string opaca** estável por implementação; o domínio não interpreta formato GitHub vs GitLab
- Entidades **não** carregam `source` — domínio agnóstico à fonte ativa
- `getById` e `listIssues` recebem apenas `repoId: string`
- Contrato documenta id não vazio; validação runtime de id **não** é helper obrigatório nesta fatia

### B — Modelo de erro

- Domínio exporta `AppError`, `AppErrorCode`, `createAppError`, `isAppError`
- Codes: `rate_limit` | `network` | `not_found` | `empty_query` | `invalid_input` | `unknown`
- Sem mensagem no domínio: shape = `code` + `cause?` (copy na presentation)
- Contratos da porta documentam: rejects da `Promise` são sempre `AppError`
- `empty_query` = query vazia/whitespace; `invalid_input` = bounds page/perPage (e invariantes similares); `unknown` = não classificado

### C — Paginação

- `PaginatedResult<T>`: `items`, `page`, `perPage`, `hasNextPage` — **sem** `totalCount`
- `perPage?` no input; **sem** default canônico no domínio
- `hasNextPage` preenchido pela implementação da porta (infra)
- `page` é **1-based**

### D — Validação / normalização

- Helpers puros: **trim** + validam query → `empty_query`
- Asserts: `page >= 1`; `perPage` presente ⇒ `perPage >= 1` → `invalid_input`
- Campos ausentes: opcional TS (`?:` / `undefined`), **não** `null`

### E — DataSource & Dependency Rule (review)

- `DataSource = 'github' | 'gitlab'` **não** vive em `src/domain/`
- Novo lar: módulo em `src/application/` (config/tipos de sessão); stores/theme/DI reimportam de lá
- Domínio conhece só o contrato `RepoRepository`, não quem o implementa

### F — Paradigma (review)

- **Functional Core, Imperative Shell**: types anêmicos + pure functions — intencional (não DDD OO com entity methods)

### Agent's Discretion

- Nomes exatos dos helpers e pasta (`domain/validation` vs similar)
- Path exato do módulo `DataSource` sob `application/` (ex. `application/config/data-source.ts` vs `application/types/`)
- Formato de `createdAt` / URLs como `string` sem branded types

### Declined / Undiscussed Gray Areas → Assumptions

Nenhuma área recusada. Trade-off pragmático “DataSource no domínio” **rejeitado** após review Clean Arch (2026-08-02).

---

## Specific References

- Enunciado §3.1–3.3; AD-001 / AD-002
- Review: remover `DataSource` do domínio; `invalid_input` para invariantes; Functional Core explícito
- Esqueleto atual em `src/domain/` será alinhado (incl. mover `entities/data-source.ts` para application)

---

## Deferred Ideas

- Use cases em `application/` (search / details / issues) — feature separada
- Implementações GitHub/GitLab + mappers + DI
- Tokens HTTP / rate-limit UX copy
- Branded IDs / value objects OO clássicos
