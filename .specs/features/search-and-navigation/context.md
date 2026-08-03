# Search & Navigation Context

**Gathered:** 2026-08-02 (updated: tab shell Search / Favoritos / Explore / Config)  
**Spec:** `.specs/features/search-and-navigation/spec.md`  
**Status:** Approved — Ready for design


---

## Feature Boundary

Entregar a **busca de repositórios** (InputField + lista + infinite scroll + pull-to-refresh + loading/empty/erro via `useSearchRepos`) e a **navegação tipada** lista → detalhe → issues sob a tab **Search** (ex-Home). Bottom tabs com quatro abas: **Search**, **Favoritos**, **Explore**, **Config** — as três últimas como **mock screens** prontas para features seguintes. Remover Modal e o Explore/Home do **template Expo**. Details/Issues = stubs tipados.

---

## Implementation Decisions

### 1. Shell de navegação (B + detalhe do user)

- Manter **bottom tab navigator**.
- Tabs tipadas nesta fatia:
  1. **Search** — nested Native Stack: `SearchRepos` → `RepoDetails` → `RepoIssues` (Home renomeada / substituída)
  2. **Favoritos** — mock screen (lista de favoritos virá depois; persistência planejada em **AsyncStorage**)
  3. **Explore** — mock screen (repos em alta / trending — feature futura; **não** é o ExploreScreen boilerplate do Expo)
  4. **Config** — mock/settings shell onde ficam controles de sessão
- Remover **Modal** do Root stack e o chrome do template (antiga Home/Explore Expo).
- Root: Tabs como entrada (sem Modal).

### 2. Details / Issues nesta fatia (A)

- Rotas tipadas com `repoId: string` (id opaco).
- Stubs (título/back + placeholder); CTA Issues no stub Details.
- Sem UI §4.3/§4.4.

### 3. Disparo da busca (A + hook)

- Debounce tipando (~300–400ms) via hook em `src/presentation/hooks/`.
- Query vazia → idle, sem fetch.

### 4. Linha da lista (A)

- Card DS: nome, owner, stars, language, description.
- Press → `RepoDetails` com `{ repoId: repo.id }`.

### 5. Empty / erro (A)

- Idle / empty results / erro + Retry (`mapAppErrorToMessage`).

### 6. Config vs Search chrome (novo)

- **Mover** nesta fatia o seletor de **data source** e o **toggle de tema** da Home/Search header para a tab **Config**.
- Search foca em busca (Header pode ficar só com título ou mínimo — Design).
- Em Config: seção placeholder para **setup de token** (copy “em breve” / disabled) — **sem** formulário SecureStore completo nesta fatia (continua em credentials / NEXT).
- Fonte ativa continua visível de algum modo aceitável no produto (enunciado §4.1): na Config e/ou indicador discreto no Search — Design escolhe o mínimo viável (ex. label na Config + opcional chip no Search).

### 7. Favoritos / Explore mocks (novo)

- Telas com título + mensagem placeholder PT-BR + `testID`s.
- **Não** implementar store de favoritos nem API de trending nesta fatia.
- Documentar intenção: Favoritos → AsyncStorage; Explore → repos em alta (specs futuras).

### Agent's Discretion

- Cópia PT-BR de empty/idle/mocks.
- Debounce ms (300–400).
- Ícones das tabs (DS Icon / IconSymbol migration).
- Se Search Header mostra indicador leve de `dataSource` além da Config.
- Estrutura visual da Config (lista de settings vs seções).

### Declined / Undiscussed → Assumptions

- Persistência real de favoritos / trending Explore: out of scope (só mock + intenção AsyncStorage anotada).
- Form de token funcional: out of scope.

### Deferred Ideas

- UI Details (§4.3) / Issues (§4.4)
- Favoritos + AsyncStorage CRUD
- Explore trending / repos em alta
- Token UI SecureStore + rate-limit `cause`
- Showcase, Maestro E2E

---

## Actor & Tone

- Usuário do app: busca na tab Search; ajustes em Config; outras tabs anunciam o que vem.
- Tom: PT-BR; sem jargão de API.

---
