# Presentation — o que NÃO entra nesta fatia (lembrete)

**Feature atual:** `presentation-layer` = **só a ponte** (providers + hooks + invalidação + mapper `AppError`).

Use este arquivo como checklist das próximas features de produto. Riscar quando virar spec própria.

---

## Produto (enunciado §4)

- [~] **Busca de repositórios** — → spec `search-and-navigation` (em Specify)
- [ ] **Detalhes do repositório** — full name, owner (avatar + nome), description, stars, forks, watchers, language + CTA para Issues _(stubs de rota já em `search-and-navigation`)_
- [ ] **Issues** — lista paginada (título, labels, autor, data relativa) + pull-to-refresh _(stubs de rota já em `search-and-navigation`)_
- [~] **Navegação de produto** — → `search-and-navigation` (tabs Search / Favoritos / Explore / Config; stack sob Search; mocks Favoritos/Explore/Config)
- [ ] **Favoritos** (AsyncStorage) — tab mock na `search-and-navigation`; CRUD depois
- [ ] **Explore trending** — tab mock na `search-and-navigation`; feature depois
- [ ] **Config** (fonte + tema + token UI) — fonte/tema movidos na `search-and-navigation`; form token depois


## Credenciais / rate limit (AD-021)

> **Já na ponte (não refazer):** slot `tokens` no Zustand + plug em `createContainer` + persistência via **`expo-secure-store`** (não AsyncStorage). Falta só UX.

- [ ] **UI de token** opcional (GitHub / GitLab) — chamar `setToken` / `setTokens` já wired
- [ ] **Copy de rate limit** usando `cause` estruturado (reset / retry) quando 429
- [ ] Opcional: `requireAuthentication` / biometria no SecureStore (fora do Expo Go sem plugin/copy)

## Design System / polish

- [ ] **Showcase in-app** (§4.5) — tela dedicada com controles em todos os estados (+ switch tema)
- [ ] **Badge / Tag / Avatar** (§6.2) se ainda faltarem no DS
- [ ] **Limpeza do template Expo** — `ExploreScreen`, `ModalScreen`, `ThemedText` / `ThemedView`, `components/ui/*` legado, hooks `use-color-scheme` / `use-theme-color` se sobrarem órfãos

## Cache / UX fina (depois da ponte)

- [ ] Wiring visual de **stale-while-revalidate** nas telas (loading discreto em refetch)
- [ ] Decisão final **infinite query vs page** na UI de busca/issues (hooks da ponte podem já expor a API; telas consomem)

## Docs / entrega

- [ ] README: declarar uso de IA + como trocar fonte / cache / tokens
- [ ] E2E Maestro nos fluxos de busca / troca de fonte (AD-006)

---

**Não esquecer decisões já tomadas que as telas devem respeitar:**

- Domínio opaco: UI passa `repo.id` cego para detalhes/issues (sem parse GitHub vs GitLab)
- Um branch de fonte: só `dataSource` no store → DI; sem `if (provider)` em telas
- `queryKey` inclui `dataSource` (AD-005 / spoiler application-layer)
- Primary do tema já segue `(mode, dataSource)` — Home Header já troca fonte/tema
