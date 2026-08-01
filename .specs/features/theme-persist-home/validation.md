# Theme Persist + Home Header Validation

**Date**: 2026-07-31 (re-verify after `b6c7376`)
**Spec**: `.specs/features/theme-persist-home/spec.md`
**Diff range**: `7b664e08..b6c7376` (feature commits `5a4c342..b6c7376` on `feat/theme-persist-home`)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T1   | ✅ Done | zustand dependency |
| T2   | ✅ Done | `__mocks__/zustand.ts` |
| T3   | ✅ Done | store + unit tests (incl. fix `b6c7376`) |
| T4   | ✅ Done | AppThemeProvider bridge |
| T5   | ✅ Done | splash wiring |
| T6   | ✅ Done | nav theme sync |
| T7   | ✅ Done | HomeScreen + tests (incl. persist assert fix) |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| TPH-01: store exposes typed `mode`, `dataSource`, setters, toggles, `reset()` clears memory **and** storage | API surface + defaults restored + key cleared | `session-preferences-store.test.ts:21-32` — `expect(typeof state.reset).toBe('function')`; `:122-137` — `expect(store.getState().mode).toBe('light')` + `expect(await memory.getItem(...)).toBeNull()` | ✅ PASS |
| TPH-02: `mode`/`dataSource` persisted via `persist` + `createJSONStorage(() => AsyncStorage)`, `partialize` limited to those fields | Both fields in storage payload | `session-preferences-store.test.ts:34-48` — `expect(parsed.state.mode).toBe('dark')`; impl `session-preferences-store.ts:80-84` — `createJSONStorage(() => options.storage ?? AsyncStorage)` + `partialize: ({ mode, dataSource }) => ({ mode, dataSource })` | ✅ PASS |
| TPH-03: cold-start rehydrate restores exact persisted pair | Saved `mode`/`dataSource` restored | `session-preferences-store.test.ts:50-62` — `expect(second.getState().mode).toBe('dark')` + `expect(second.getState().dataSource).toBe('gitlab')` | ✅ PASS |
| TPH-04: empty/corrupt/read fail → system `mode` + `github`, store ready | OS scheme + `github` + hydrated/ready | `session-preferences-store.test.ts:64-72` empty; `:92-102` corrupt — `expect(store.getState().mode).toBe('dark')` + `expect(store.getState().dataSource).toBe('github')`; `:104-120` getItem throw — `expect(store.getState().hasHydrated).toBe(true)` | ✅ PASS |
| TPH-05: product UI gated until hydrated; no flash | Children not painted pre-hydrate | `AppThemeProvider.test.tsx:120-125` — source `expect(source).toMatch(/return null/)`; `:127-137` — post-hydrate `expect(screen.getByTestId('product-child')).toBeTruthy()` | ⚠️ Accepted spec-precision gap — gate verified by static source inspection; test harness seeds `hasHydrated` (`render.tsx:31`); runtime negative test intentionally deferred |
| TPH-06: `AppThemeProvider` from store only; `useAppTheme` reflects store | No parallel `useState`; hook mirrors store | `AppThemeProvider.test.tsx:113-118` — `expect(source).not.toMatch(/useState<\s*ThemeMode/)`; `:18-35` — `expect(result.current.dataSource).toBe('gitlab')` | ✅ PASS |
| TPH-07: Home `Header` title `Search Repos`, leading logo, trailing sun/moon | Exact title + interactive slots | `HomeScreen.test.tsx:14-17` — `expect(screen.getByText('Search Repos')).toBeTruthy()`; `:37` — `expect(screen.getByLabelText('Switch to dark mode')).toBeTruthy()`; `:19-31` — leading tap via `home-data-source-toggle` | ✅ PASS |
| TPH-08: tap logo toggles `github` ↔ `gitlab`; primary updates without remount | Opposite source; theme primary changes | `HomeScreen.test.tsx:19-31` — `expect(useSessionPreferencesStore.getState().dataSource).toBe('gitlab')`; `AppThemeProvider.test.tsx:38-65` — `expect(result.current.primary).toBe('#FC6D26')` + `expect(mountCount).toBe(1)` | ✅ PASS |
| TPH-09: tap theme icon toggles mode and persists | `dark` in store + storage | `HomeScreen.test.tsx:34-51` — `expect(useSessionPreferencesStore.getState().mode).toBe('dark')` + `expect(parsed.state.mode).toBe('dark')` (AsyncStorage) | ✅ PASS |
| TPH-10: `Header.tsx` does not import `DataSourceLogo` | Header source free of logo | `HomeScreen.test.tsx:53-61` — `expect(headerSource).not.toMatch(/DataSourceLogo/)`; `Header.test.tsx:50-52` | ✅ PASS |

**Status**: ✅ All ACs covered — 9 PASS, 1 accepted ⚠️ spec-precision gap (TPH-05)

---

## Prior FAIL Re-check

| Prior gap | Fix evidence | Result |
| --------- | ------------ | ------ |
| TPH-04 corrupt JSON / getItem throw | `session-preferences-store.test.ts:92-120` + `onRehydrateStorage` in `session-preferences-store.ts:99-102` | ✅ Resolved |
| TPH-09 Home theme tap persist | `HomeScreen.test.tsx:47-50` AsyncStorage assert | ✅ Resolved |
| Lint gate | `pnpm lint` → 0 errors; feature files clean (1 unused-import warning in `AppThemeProvider.test.tsx`) | ✅ Resolved |
| TPH-05 runtime gate | Documented accepted gap (see AC table) | ⚠️ Accepted |

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `session-preferences-store.ts:68-71` | `toggleDataSource` no-op | ✅ Killed — `HomeScreen.test.tsx:26` + `session-preferences-store.test.ts:147-150` |
| 2 | `session-preferences-store.ts:48` | `sanitizePersistedPreferences` returns `null` for valid enums | ✅ Killed — `session-preferences-store.test.ts:60-61` |
| 3 | `session-preferences-store.ts:75` | `reset()` skips `clearPersisted()` | ✅ Killed — `session-preferences-store.test.ts:136` |

**Sensor depth**: lightweight (3 behavior-level mutants)
**Result**: 3/3 killed — ✅ PASS

---

## Interactive UAT Results

Not performed (automated verification only).

---

## Code Quality

| Principle        | Status |
| ---------------- | ------ |
| Minimum code     | ✅ |
| Surgical changes | ✅ |
| No scope creep   | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ (TPH-05 documented exception) |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines: `AGENTS.md`, AD-006, AD-018 | ✅ |

---

## Edge Cases

- [x] Unknown enum → system mode + github (`session-preferences-store.test.ts:74-90`)
- [ ] Rapid taps — not tested (non-crash; last-write-wins; out of AC scope)
- [x] `reset()` memory + storage (`session-preferences-store.test.ts:122-137`)
- [x] GitHub white Invertocat dark (`DataSourceLogo.test.tsx:18-19`; pre-existing)

---

## Gate Check

- **Gate command**: `pnpm test && pnpm lint`
- **Result**: **141 passed**, 0 failed, 0 skipped; **lint PASS** (0 errors, 7 warnings repo-wide)
- **Test count before feature**: 125
- **Test count after feature + fix**: 141
- **Delta**: +16 tests
- **Feature lint**: 0 errors; 1 warning (`AppThemeProvider.test.tsx` unused `waitFor` import)
- **Uncommitted noise ignored**: `Teste_Tecnico_React_Native_v3.md` (outside diff range)

---

## Requirement Traceability Update

| Requirement | Status      |
| ----------- | ----------- |
| TPH-01      | ✅ Verified |
| TPH-02      | ✅ Verified |
| TPH-03      | ✅ Verified |
| TPH-04      | ✅ Verified |
| TPH-05      | ⚠️ Verified (accepted precision gap) |
| TPH-06      | ✅ Verified |
| TPH-07      | ✅ Verified |
| TPH-08      | ✅ Verified |
| TPH-09      | ✅ Verified |
| TPH-10      | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 10/10 ACs addressed (9 full PASS + 1 accepted ⚠️ TPH-05 precision gap)
**Sensor**: 3/3 mutations killed
**Gate**: 141 tests passed; lint 0 errors

**What works**: Persist store with failure fallbacks + `hasHydrated`, Home theme toggle persistence, all prior FAIL gaps closed.

**Issues found**: None blocking. Optional follow-up: remove unused `waitFor` import; add runtime pre-hydrate gate test if desired.

**Next steps**: Feature ready for merge/UAT.
