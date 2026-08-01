# Theme Persist + Home Header Context

**Gathered:** 2026-07-31
**Spec:** `.specs/features/theme-persist-home/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Migrar `mode` + `dataSource` para Zustand com persistência AsyncStorage; aguardar rehydrate antes de pintar o app; montar a Home inicial com `Header` — logo (fonte) à esquerda, título `Search Repos`, toggle sol/lua à direita.

---

## Implementation Decisions

### Persistência

- Persistir **os dois**: `mode` (`light` | `dark`) e `dataSource` (`github` | `gitlab`)
- Último estado do usuário sobrevive a cold start / kill do app
- **Só 1 user story** nesta fatia (store + gate + Home)

### Fallback AsyncStorage

- Vazio / erro / dados inválidos → **`mode` = cor do sistema** (Appearance); `dataSource` = `github`

### Limpeza de estado (Zustand docs)

- **Runtime:** `persist.clearStorage()` só apaga a key no storage — **não** zera memória; store expõe `reset()` = `set(initialState)` + `persist.clearStorage()`
- **Jest:** padrão oficial https://zustand.docs.pmnd.rs/learn/guides/testing#jest — `__mocks__/zustand.ts` com `storeResetFns`, `getInitialState()`, `setState(initialState, true)` no `afterEach` dentro de `act` (usar `@testing-library/react-native`)
- Gate: `hasHydrated` / `onFinishHydration` (FAQ oficial)

### Hidratação

- **Espera** rehydrate terminar antes de renderizar a árvore do app (sem flash de tema/fonte errados)
- Usar mecanismo já disponível no projeto (ex. `expo-splash-screen`) enquanto aguarda — detalhe no Design

### Toggle de DataSource (leading)

- **Tap na logo** (`DataSourceLogo`) alterna `github` ↔ `gitlab`
- Logo continua refletindo a fonte ativa (e mode light/dark para assets GitHub)

### Toggle de tema (trailing)

- **Tap no ícone sol/lua** chama `toggleMode` / `setMode`
- Ícone mostra o modo *atual* ou o *alvo* — agent discretion no Design (preferência: ícone indica ação/próximo modo ou modo atual; documentar na UI de a11y)

### Título do Header

- Texto fixo: **`Search Repos`**

### Home

- Tela inicial usa o molecule `Header` com slots `leading` / `trailing` (sem acoplar logo dentro do Header)
- Conteúdo do body da Home além do Header: mínimo nesta fatia (shell) — agent discretion; sem busca/listas ainda

### Agent's Discretion

- Um store Zustand vs dois (recomendado: um store de preferências de sessão)
- Nome da storage key e shape do persist
- Como `AppThemeProvider` lê o store e alimenta `StyledThemeProvider`
- Persist storage em memória nos testes de rehydrate; Storybook seed/overrides
- Escolha exata dos ícones sol/lua no atom `Icon` existente
- Body placeholder da Home (vazio vs tipografia mínima)

### Declined / Undiscussed Gray Areas → Assumptions

- Storybook/test overrides: memory storage + seed/`setState` sem AsyncStorage real — ver Assumptions no spec
- Invalidação TanStack Query ao trocar fonte: fora desta fatia (ainda sem queries de produto)

---

## Specific References

- Header slots: `leading` | title | `trailing` (refactor recente)
- AD-010: primary por `(mode, dataSource)`
- AD-011: SVGs de marca só em `DataSourceLogo`
- AsyncStorage e `expo-splash-screen` já no `package.json`

---

## Deferred Ideas

- Tela de busca / infinite scroll / detalhes / issues
- Invalidação de cache Query na troca de `dataSource`
- Badge / Avatar
- Seguir automaticamente o `useColorScheme` do sistema após o usuário já ter escolhido um mode (persistido prevalece)
