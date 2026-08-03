# Repo Details & Issues Context

**Gathered:** 2026-08-03
**Spec:** `.specs/features/repo-details-issues/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Entregar UI completa de **detalhes do repositório** (§4.3) e **lista de issues** (§4.4), organismo **Hyperlink** (abre URL externa via `Linking`), atoms **Avatar** + **Badge**, polish hierárquico da Search, e **header com toggle de fonte** como organismo no DS (sem store) + wrapper em `presentation/components` wired ao Zustand.

---

## Implementation Decisions

### Hyperlink (organismo)

- Usa `Linking.openURL(href)` — só URL externa (não navega rotas internas).
- Visual: tipografia sublinhada com `color="primary"`.
- Wrapper novo baseado em `Pressable` (styled em `styles.tsx`).
- API: `href: string` + `children` (texto) + `style?` + a11y (`accessibilityRole="link"`, label derivada do children / prop opcional).
- Uso: link do **repo** em Details; link da **issue** em cada row de Issues; link do **repo** também no topo da tela de Issues.

### Avatar + Badge

- Criar **Avatar** e **Badge** no DS nesta fatia (não improvisar com Image/Typography soltos nas telas).
- Avatar: atom; `uri?` + `size` (tokens Size); fallback visual quando sem uri (iniciais ou placeholder neutro — Design escolhe).
- Badge: atom; label text + `color` opcional (hex da API de label quando presente; senão token de superfície/borda).

### Layout Details / Issues

- **Details:** hero com Avatar do owner + nome; métricas stars / forks / watchers em linha; description; CTA “Ver issues”; Hyperlink do repo (`htmlUrl`).
- **Issues:** lista em **Card** (mesmo padrão da Search); cada row com título (Hyperlink da issue), labels (Badge), autor, data **relativa**.
- Data relativa: helper **no DS** (`packages/ds/utils`, `Intl.RelativeTimeFormat`, default `pt-BR`) — confirmado pelo user na fase Tasks.
- Estados: loading / empty / erro+Retry; infinite scroll + pull-to-refresh nas issues (hooks já existem).
- Hooks: `useRepoDetails` / `useRepoIssues` apenas — sem adapters HTTP nas telas.

### Polish Search + Source header

- Search: só hierarquia / espaçamento / tipografia dentro do DS atual — sem redesign de marca fora do sistema.
- Toggle de **fonte** volta para o header (Search e demais telas do stack Search que usarem o header de sessão).
- **Organismo no DS** (ex. `SourceHeader`): composição visual Header + logo/toggle; props controladas (`brand` / `onToggleBrand` ou equivalente com tipo `Brand` do DS); **zero** Zustand / session store / `@/` app imports.
- **Presentation:** pasta `src/presentation/components/` com wrapper real que lê o store e passa props ao organismo DS.
- **Tema** permanece só na Config.
- **Config:** remove o seletor de fonte duplicado (fonte fica no header); mantém tema + placeholder de token. Fonte ativa continua visível via logo no header (§4.1).

### Agent's Discretion

User disse “você decide” no deep-dive do header/Hyperlink API. Defaults:

| Topic | Default |
| ----- | ------- |
| Header organism API | `title` + `brand: Brand` + `onToggleBrand: () => void` + `safe?` + `style?`; trailing = Pressable com `DataSourceLogo` |
| Toggle UX | Um botão (tap alterna GitHub ↔ GitLab), não dois chips |
| Config source | Removido (evita duplicata); tema fica |
| Hyperlink API | `href` + `children` + opcional `accessibilityLabel` |
| Avatar fallback | Iniciais a partir de `name`/`alt` quando sem `uri` |
| Badge sem cor API | Variant/surface default do tema |
| Issues repo link | Hyperlink do repo acima da lista via `useRepoDetails` (cache) |
| Data relativa | `packages/ds/utils/format-relative-date` (Intl, default pt-BR) — **não** em presentation |

### Declined / Undiscussed Gray Areas → Assumptions

Todas as áreas acima foram respondidas pelo user ou assinadas como agent discretion — registradas no spec Assumptions.

---

## Specific References

- “hiperlink é um organismo”
- “usar Linking”; “sublinhado”; “pressable fazendo um novo wrapper”
- “dentro de details e dentro das issues cada row”
- “sim criar avatar e badge”
- “tudo que você propos no 3” (hero metrics, Card issues, data relativa)
- “Só hierarquia/espçamento/tipografia dentro do DS atual”
- “mova de voltar o botão de toggle do source para o header”
- “header with toggle é um organismo” no DS sem store; implementation real em `presentation/components`

---

## Deferred Ideas

- Showcase in-app (§4.5)
- UI de token SecureStore
- Favoritos CRUD / Explore trending
- Maestro E2E
- Redesign visual agressivo fora do DS
- Theme toggle no header
