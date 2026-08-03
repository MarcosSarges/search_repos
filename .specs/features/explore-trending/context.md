# Explore Trending Context

**Gathered:** 2026-08-03
**Spec:** `.specs/features/explore-trending/spec.md`
**Status:** Spec + Design + Tasks drafted — awaiting Execute approval

---

## Feature Boundary

Substituir o placeholder da tab Explore por uma lista paginada (infinite scroll) dos repositórios **trending** da data source ativa (GitHub ou GitLab), via porta de domínio + use case + adapters HTTP + hook de presentation. Layout **simples** (DS atoms existentes). Sem navegação para detalhes nesta fatia.

---

## Implementation Decisions

### Critério de ranking (“principais”)

- Usuário escolheu **trending** (não all-time por stars).
- Janela temporal e qualifiers exatos por provedor ficam na Anti-Corruption Layer (infra) — ver Assumptions no spec (default: ~30 dias).
- Domínio/UI não conhecem parâmetros GitHub/GitLab.

### Layout da Explore

- Layout **simples** por enquanto — lista com tipografia/espaçamento do DS (`Typography`, `Spacer`, `Container`, `Header` se fizer sentido).
- **Não** desenvolver organism/molecule dedicado de card de repo nesta fatia (vira feature futura do DS).
- Remover o conteúdo template Expo da `ExploreScreen` (ParallaxScrollView / ThemedText / Collapsible).

### Paginação

- **Infinite scroll** (mesmo padrão de `useSearchRepos` / `useInfiniteQuery`).
- Pull-to-refresh permitido (padrão TanStack + FlatList).

### Toque / navegação

- **Esperar a tela de detalhes** — nesta fatia, itens **não** navegam para detalhes nem abrem URL externa por obrigação.
- Lista é browse-only; wiring de `onPress` → detalhes fica fora de escopo (Deferred).

### Agent's Discretion

- Copy do título/empty/erro (PT-BR alinhado ao mapper de `AppError`).
- Densidade tipográfica da row simples (nome, owner, stars, language opcional).
- Constante de janela trending (30 dias) e query/filter por adapter.

### Declined / Undiscussed Gray Areas → Assumptions

- Janela exacta de trending (7 vs 30 dias) → **30 dias** (assumption no spec).
- Qualifier GitHub (`created` vs `pushed`) → Design/infra escolhe o melhor proxy público documentado.
- Pull-to-refresh explícito → incluso como polish mínimo junto do infinite scroll.

---

## Specific References

- APIs: GitHub [`GET /search/repositories`](https://docs.github.com/en/rest/search/search#search-repositories) (`sort=stars`); GitLab [`GET /projects`](https://docs.gitlab.com/api/projects/#list-all-projects) (`order_by=star_count`, filtros de atividade).
- Padrões existentes: AD-001…025, `useSearchRepos`, `RepoRepository`, `createContainer`.

---

## Deferred Ideas

- Organism/molecule `RepoListItem` / card rico (avatar, badges).
- Navegação lista → detalhes → issues.
- Busca na Home (feature de search UI).
- UI de token / copy rica de rate limit.
- Showcase / limpeza total do template Expo além da Explore.
