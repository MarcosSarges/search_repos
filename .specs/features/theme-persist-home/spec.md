# Theme Persist + Home Header Specification

## Problem Statement

`mode` e `dataSource` vivem só em React Context/`useState` no `AppThemeProvider`, sem sobrevivência a cold start. O enunciado exige seletor de fonte visível e switch light/dark; a Home ainda é o template Expo, sem o Header tipado do DS.

## Goals

- [ ] Um store Zustand tipado (`mode` + `dataSource`) com `persist` + AsyncStorage
- [ ] UI gated até rehydrate; fallback de `mode` = cor do sistema
- [ ] Home com `Header`: logo (tap fonte), título `Search Repos`, sol/lua (tap tema)
- [ ] Limpeza de estado alinhada à API oficial do Zustand persist

## Out of Scope

| Feature | Reason |
| --- | --- |
| Busca / lista / detalhes / issues | Features posteriores |
| Invalidação TanStack Query na troca de fonte | Sem queries de produto ainda |
| Badge / Avatar / Showcase in-app | DS posterior |
| Seguir sistema continuamente após preferência salva | Persistido prevalece; sync OS contínuo depois |
| Stories P2+ (test helpers como story separada) | Só 1 story nesta fatia; isolamento de teste fica como assumption |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| O que persistir | `mode` + `dataSource` | Discuss | y |
| Hidratação | Esperar rehydrate (splash) | Discuss — “Espera” | y |
| Toggle fonte | Tap na logo → github↔gitlab | Discuss | y |
| Toggle tema | Tap sol/lua | Discuss | y |
| Título | `Search Repos` | Discuss | y |
| Fallback AsyncStorage vazio/erro/`mode` ausente | **`mode` = esquema do sistema** (`light`/`dark` via Appearance); `dataSource` default `github` | Confirmado pelo user | y |
| Número de user stories | **1 story P1** (store + gate + Home) | Confirmado — “só 1 story” | y |
| Limpeza de estado (runtime) | API Zustand: `persist.clearStorage()` **não** reseta memória; store expõe `reset()` = `set(initialState)` **e** `persist.clearStorage()` | [Docs persist — clearStorage](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) | y |
| Limpeza entre testes (Jest) | Padrão oficial [Testing → Jest](https://zustand.docs.pmnd.rs/learn/guides/testing#jest): `__mocks__/zustand.ts` registra `storeResetFns` com `store.getInitialState()` + `setState(initialState, true)` no `afterEach` via `act` (RNTL) | Confirmado pelo user (link docs) | y |
| Forma do store | Um store; `partialize` só `mode` + `dataSource` (não persistir actions) | Docs `partialize` | n → assumption |
| Storage key | Constante tipada única | Docs `name` obrigatório | n → assumption |
| Gate de hidratação | `persist.hasHydrated` / `onFinishHydration` (ou `_hasHydrated` via `onRehydrateStorage`) | Docs FAQ hydrated | n → assumption |
| Persist nos testes | `createJSONStorage` com storage em memória (ou AsyncStorage mockado); isolamento in-memory pelo mock Jest acima; `reset()` / `clearStorage` cobertos em testes do store | Evita flaky nativo | n → assumption |
| Ícone tema | Atom `Icon`; indica próximo modo (lua em light → dark) | A11y | n → assumption |
| Body Home | Shell Header + container DS; sem lista | Chrome only | n → assumption |
| Auth / rate limit / TTL / observability / payments | N/A | Preferências locais | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Preferências persistidas + Home Header ⭐ MVP

**User Story**: As a user, I want my light/dark mode and GitHub/GitLab source remembered, and a home header to change them anytime, so the app opens on my last choices without a wrong-theme flash.

**Why P1**: Única story desta fatia — cobre store+persist, gate de hidratação e chrome da Home.

**Acceptance Criteria**:

1. WHEN the session store is used THEN it SHALL expose typed `mode` (`light` \| `dark`), `dataSource` (`github` \| `gitlab`), setters, `toggleMode`, toggle/set data source, and a `reset()` that restores defaults **and** clears persisted storage via Zustand `persist.clearStorage()` (clearStorage alone does not wipe in-memory state — reset must update both)
2. WHEN `mode` or `dataSource` changes THEN both SHALL be persisted with Zustand `persist` + `createJSONStorage(() => AsyncStorage)`, with `partialize` limited to those two fields
3. WHEN the app cold-starts with a valid persisted pair THEN after rehydrate the store SHALL restore that exact `mode` and `dataSource`
4. WHEN AsyncStorage is empty, corrupt, or read fails THEN `mode` SHALL fall back to the **system color scheme** and `dataSource` to `github`, and the store SHALL still become ready
5. WHEN rehydrate has not finished THEN product UI (navigators / Home) SHALL NOT paint; splash (or equivalent) SHALL hold until `persist.hasHydrated` / finish-hydration (no default-then-correct flash)
6. WHEN rehydrate completes THEN `AppThemeProvider` SHALL drive `StyledThemeProvider` from the store only (no parallel `useState` source of truth) and `useAppTheme` SHALL reflect store values
7. WHEN Home is shown THEN it SHALL render DS `Header` with title exactly `Search Repos`, `leading` = pressable `DataSourceLogo`, `trailing` = pressable sun/moon `Icon`
8. WHEN the user taps the leading logo THEN `dataSource` SHALL toggle `github` ↔ `gitlab` and theme primary SHALL update without remounting the app
9. WHEN the user taps the trailing theme icon THEN `mode` SHALL toggle `light` ↔ `dark` and the change SHALL persist
10. WHEN Home composes Header THEN `Header.tsx` SHALL NOT import `DataSourceLogo`

**Independent Test**: Jest com `__mocks__/zustand.ts` oficial (reset `getInitialState` após cada teste); persist com storage em memória — set gitlab+dark, rehydrate, assert restore; empty → system mode + github; `reset()` limpa storage + memória; RNTL Home — title, tap logo, tap theme icon.

---

## Edge Cases

- WHEN storage returns unknown enum values THEN system SHALL treat as missing and apply system-mode + github fallback
- WHEN user taps logo/theme rapidly THEN last write wins; no crash
- WHEN `reset()` is called THEN in-memory state AND AsyncStorage key SHALL both be cleared/defaulted (`clearStorage` + set initial)
- WHEN brand logo shows github in dark mode THEN white Invertocat rules (AD-011) SHALL hold

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| TPH-01 | P1: Store API + `reset()` with clearStorage | Design | Pending |
| TPH-02 | P1: Persist mode+dataSource via AsyncStorage | Design | Pending |
| TPH-03 | P1: Cold start restores persisted pair | Design | Pending |
| TPH-04 | P1: Fallback mode = system color; dataSource github | Design | Pending |
| TPH-05 | P1: Gate UI until hasHydrated | Design | Pending |
| TPH-06 | P1: AppThemeProvider single source from store | Design | Pending |
| TPH-07 | P1: Home Header title + leading logo + trailing icon | Design | Pending |
| TPH-08 | P1: Tap logo toggles dataSource | Design | Pending |
| TPH-09 | P1: Tap theme icon toggles mode + persist | Design | Pending |
| TPH-10 | P1: Header does not import DataSourceLogo | Design | Pending |

**Coverage:** 10 total, 0 mapped to tasks, 10 unmapped ⚠️

---

## Success Criteria

- [ ] Kill/relaunch restores last mode + dataSource; no theme flash
- [ ] Empty storage → system scheme for mode; Home toggles work and persist
- [ ] `reset()` limpa memória e storage (API Zustand)
- [ ] `pnpm test` green for store + Home

---

## References (Zustand)

- [Persisting store data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) — `persist`, `createJSONStorage`, `partialize`, `clearStorage`, `hasHydrated`, `onFinishHydration`
- [Testing — Jest](https://zustand.docs.pmnd.rs/learn/guides/testing#jest) — `__mocks__/zustand.ts` + `storeResetFns` + `getInitialState()` + `setState(initial, true)` no `afterEach`
- `clearStorage()` removes the storage key only; in-memory cache must be reset separately (`set(initialState)` / `reset()`); tests additionally rely on the Jest mock auto-reset
