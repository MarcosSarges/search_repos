# Infra HTTP Clients & Host Context

**Gathered:** 2026-08-02
**Spec:** `.specs/features/infra-http-clients/spec.md`
**Status:** Locked — Design inline + review gaps closed; ready for Execute

---

## Feature Boundary

Refactor pequeno da infrastructure HTTP já entregue: extrair **ApiClient** por provedor (host + Bearer + fetch), deixar **repository** só com ACL (assert, map, paginação), unificar auth GitLab → Bearer, e espelhar `tokens` com bag opcional `hosts` no DI. Sem Presentation, sem application services, sem mudança de porta de domínio.

---

## Implementation Decisions

### A — Camada do “service”

- Client HTTP vive na **infrastructure** (`github` / `gitlab`), não em `application/`
- Repository não chama `jsonFetch`/`fetch` diretamente
- `jsonFetch` permanece helper fino usado pelos clients

### B — Service host

- `baseUrl?` no client; defaults oficiais se omitido
- DI: `hosts?: { github?: string; gitlab?: string }` selecionado por `dataSource` (espelha AD-021 tokens)
- **GitLab:** client **normaliza** `/api/v4` — aceita domínio raiz **ou** API base completa; não duplica o sufixo (review: DX > contrato estrito no DI)
- **URL join:** sempre Web `URL` API (`new URL(path, base)`), não regex/concat

### C — Auth

- GitHub e GitLab: apenas `Authorization: Bearer <token>`
- Remover caminho `PRIVATE-TOKEN` / `tokenHeader: 'private-token'` dos fluxos de produção

### D — MSW (review)

- Handlers host-agnostic / path wildcards para testes com `baseUrl` custom
- Proibido depender só de URLs absolutas do host default quando se testa host injetado

### Agent's Discretion

- Nomes exatos (`createGithubApiClient` vs `GithubHttpClient`)
- Helper compartilhado vs função local para normalize GitLab
- Detalhe fino de normalize quando `baseUrl` tem path de subpath install (além de root)

### Declined / Undiscussed → Assumptions

Contrato estrito “DI sempre passa `/api/v4` completo” **rejeitado** em favor da normalização no client (escolha confirmada na review).

---

## Deferred Ideas

- UI para host self-hosted
- Timeout/retry no client
- Application `RepoService`

---

## Specific References

- Chat: fetch fora do repo; service host; GitLab Bearer
- Review: GL `/api/v4` auto-append; MSW wildcards; `new URL` join
- AD-021 / AD-022; infrastructure-layer DONE
