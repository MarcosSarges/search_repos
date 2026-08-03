# Favorites Context

**Gathered:** 2026-08-03  
**Spec:** `.specs/features/favorites/spec.md`  
**Status:** Approved — Ready for design (design drafted; pending design approval)

---

## Feature Boundary

Entregar **favoritos locais** com snapshot persistido (AsyncStorage), tab Favoritos com **duas listas** (uma GitHub, uma GitLab), toggle no Header de Detalhes, empty state com CTA, remoção por swipe, e **relocação** de `src/stores/` → `src/presentation/stores/` como lar canônico do estado de cliente/sessão.

---

## Implementation Decisions

### 1. Destino do store (arquitetura)

- **Original Option 2 locked (discuss):** Zustand stores vivem em **`src/presentation/stores/`**.
- Motivo à época: estado de cliente / sessão / cache local — presentation-adjacent; simetria Clean Arch; domain + application permanecem Functional Core.
- **Rejeitado no discuss:** porta `RepoRepository` + use cases + adapter AsyncStorage só para array de favoritos (overengineering).
- Migrar session-preferences (+ hydration helpers) junto; atualizar imports/`@/` alias consumers.
- **Superseded by AD-032 (favorites write-model only):** favoritos passam a entidade `Favorite` + porta `FavoritesRepository` + use cases + adapter AsyncStorage na infrastructure. Zustand em presentation fica **somente cache reativo / hydrate** (sem `persist`). Session preferences continuam Option 2 / AD-031.
### 2. Payload persistido (snapshot)

- Persistir **snapshot**, não só `repoId`.
- Campos mínimos: `id`, `name` (ou `fullName` — Design escolhe shape), `ownerName`, `ownerAvatarUrl?`, `stars`, `description?`, `language?`, `dataSource`.
- Objetivo: lista Favoritos renderiza **offline / cold start sem rede**, sem N fetches.

### 3. Escopo por fonte

- **Duas listas** na tab Favoritos — uma para **GitHub**, uma para **GitLab** (seções distintas; não misturar itens).
- Identidade estável: chave composta **`(dataSource, id)`**.
- Cabeçalho/rótulo de seção identifica a fonte (badge por linha não é obrigatório).

### 4. Onde favoritar

- **P1:** Header da tela de **Detalhes** — ícone toggle (salvar / remover).
- **P2 (se não poluir):** atalho de estrela/coração em resultados de busca via slot de ação secundária no `RepoItem` (DS store-free; wiring em presentation).

### 5. Remover / empty

- Detalhes: mesmo controle = **toggle**.
- Tab Favoritos: **swipe-to-delete**.
- Empty: copy amigável PT-BR + CTA para **Search** ou **Explore** (ex.: “Você ainda não tem favoritos. Que tal explorar alguns repositórios?”).

### 6. Happy path

- Busca → Detalhes → tocar salvar → Zustand atualiza memória + AsyncStorage → tab Favoritos mostra o item **instantaneamente** na lista da fonte correspondente, inclusive após cold start sem internet.

### Agent's Discretion

- Shape exato do snapshot type (nomear `FavoriteRepo` vs `FavoriteSnapshot`).
- Ícone filled vs outline no toggle.
- Copy PT-BR final do empty / a11y labels.
- Se CTA do empty aponta Search, Explore, ou ambos.
- Extensão mínima de `BackHeader` / `StackBackHeader` para `trailing` (padrão AD-029) — **só Detalhes**.
- Tab Favoritos: **`SessionSourceHeader`** (não `Header` simples).
- Lib de swipe (`Swipeable` RN Gesture Handler vs alternativa já no projeto).

### Declined / Undiscussed Gray Areas → Assumptions

- Tap num item → `setDataSource` para a fonte da **seção** (se ≠ ativa) e navegar para `RepoDetails` com `{ repoId }` (evita fetch na fonte errada).
- Empty **global** só quando **ambas** as listas estão vazias; seção vazia pode ocultar-se ou mostrar placeholder mínimo (Design).
- Sem sync cloud / conta; ordenação por seção = mais recente primeiro.
- Sem Maestro E2E nesta fatia (unit/component only).
- Snapshot **não** é atualizado automaticamente quando a API muda stars/description (stale-until-re-favorite ok).

---

## Specific References

- User: “Opção 2 (`src/presentation/stores/`) é o caminho mais pragmático e arquiteturalmente coeso.”
- User: snapshot obrigatório para offline + performance.
- User (revisão): **duas listas**, uma por source — não lista unificada.
- User (revisão): header da tab Favoritos = **SessionSourceHeader** (como Explore).
- User: Header Detalhes = mínimo; RepoItem shortcut se não poluir.
- User: swipe-to-delete = padrão ouro mobile; empty com CTA Explore/Busca.
- Intenção AsyncStorage já anotada em search-and-navigation / AD-026.

---

## Deferred Ideas

- Sync remoto / multi-device
- Pastas / tags / notas em favoritos
- Atualização periódica do snapshot via `getById`
- Favorite toggle também em Explore (além de Search P2)
- Maestro E2E do fluxo favoritos
