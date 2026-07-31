# Theme Persist + Home Header Validation

**Date**: 2026-07-31
**Spec**: `.specs/features/theme-persist-home/spec.md`
**Diff range**: `7b664e08..d6ffac5` (feature commits `5a4c342..d6ffac5` on `feat/theme-persist-home`)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T1   | ✅ Done | zustand in `package.json` |
| T2   | ✅ Done | `__mocks__/zustand.ts` |
| T3   | ✅ Done | store + unit tests |
| T4   | ✅ Done | AppThemeProvider bridge + tests |
| T5   | ✅ Done | splash wiring in `App.tsx` |
| T6   | ✅ Done | nav theme sync |
| T7   | ✅ Done | HomeScreen + tests |

---

## Spec-Anchored Acceptance Criteria

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| TPH-01: store exposes typed `mode`, `dataSource`, setters, toggles, `reset()` clears memory **and** storage | API surface + `reset()` → defaults + `clearStorage` | `session-preferences-store.test.ts:21-32` — `expect(typeof state.toggleMode).toBe('function')`; `:92-107` — `expect(store.getState().mode).toBe('light')` + `expect(await memory.getItem(...)).toBeNull()` | ✅ PASS |
| TPH-02: `mode`/`dataSource` persisted via `persist` + `createJSONStorage(() => AsyncStorage)`, `partialize` limited to those fields | Both fields in storage payload only | `session-preferences-store.test.ts:34-48` — `expect(parsed.state.mode).toBe('dark')` + `expect(parsed.state.dataSource).toBe('gitlab')`; impl `session-preferences-store.ts:74-78` — `createJSONStorage(() => options.storage ?? AsyncStorage)` + `partialize: ({ mode, dataSource }) => ({ mode, dataSource })` | ✅ PASS |
| TPH-03: cold-start rehydrate restores exact persisted pair | `mode`/`dataSource` match last saved | `session-preferences-store.test.ts:50-62` — `expect(second.getState().mode).toBe('dark')` + `expect(second.getState().dataSource).toBe('gitlab')` | ✅ PASS |
| TPH-04: empty/corrupt/read fail → system `mode` + `github`, store ready | `Appearance` scheme + `dataSource: 'github'` | `session-preferences-store.test.ts:64-72` — empty storage + dark OS → `expect(store.getState().mode).toBe('dark')`; `:74-90` — invalid enums → `expect(store.getState().dataSource).toBe('github')` | ❌ GAP — corrupt JSON / storage read failure not asserted |
| TPH-05: product UI gated until `hasHydrated`; no default-then-correct flash | Navigators/Home not painted pre-hydrate; splash holds | `AppThemeProvider.test.tsx:120-125` — source `expect(source).toMatch(/return null/)`; `:127-139` — post-hydrate `expect(screen.getByTestId('product-child')).toBeTruthy()` | ⚠️ Spec-precision gap — no runtime assertion that children are absent before hydrate |
| TPH-06: `AppThemeProvider` drives theme from store only; `useAppTheme` reflects store | No parallel `useState`; store values in hook | `AppThemeProvider.test.tsx:113-118` — `expect(source).not.toMatch(/useState<\s*ThemeMode/)`; `:18-35` — `expect(result.current.dataSource).toBe('gitlab')` after `setDataSource` | ✅ PASS |
| TPH-07: Home renders DS `Header` title `Search Repos`, leading logo, trailing sun/moon | Exact title + pressable slots | `HomeScreen.test.tsx:10-13` — `expect(screen.getByText('Search Repos')).toBeTruthy()`; `:33` — `expect(screen.getByLabelText('Switch to dark mode')).toBeTruthy()` (trailing icon in light mode) | ⚠️ Spec-precision gap — leading `DataSourceLogo` slot not explicitly asserted (inferred from tap testID) |
| TPH-08: tap leading logo toggles `github` ↔ `gitlab`; primary updates without remount | Opposite source after tap; theme primary changes | `HomeScreen.test.tsx:15-28` — `expect(useSessionPreferencesStore.getState().dataSource).toBe('gitlab')`; `AppThemeProvider.test.tsx:38-65` — `expect(result.current.primary).toBe('#FC6D26')` + `expect(mountCount).toBe(1)` | ✅ PASS |
| TPH-09: tap trailing theme icon toggles `light` ↔ `dark` and persists | Opposite mode + survives storage | `HomeScreen.test.tsx:30-40` — `expect(useSessionPreferencesStore.getState().mode).toBe('dark')` | ❌ GAP — no assertion that tap persists to storage key (only in-memory store state) |
| TPH-10: `Header.tsx` does not import `DataSourceLogo` | Header source free of logo import | `HomeScreen.test.tsx:42-50` — `expect(headerSource).not.toMatch(/DataSourceLogo/)`; `Header.test.tsx:50-52` — same | ✅ PASS |

**Status**: ❌ Gaps present (TPH-04 partial, TPH-09 persist); ⚠️ spec-precision gaps (TPH-05 runtime gate, TPH-07 leading slot)

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `session-preferences-store.ts:63-66` | `toggleDataSource` no-op (always keeps current `dataSource`) | ✅ Killed — `HomeScreen.test.tsx:22` + `session-preferences-store.test.ts:117-120` |
| 2 | `session-preferences-store.ts:45` | `sanitizePersistedPreferences` returns `null` even for valid enums | ✅ Killed — `session-preferences-store.test.ts:60-61` (rehydrate restore) |
| 3 | `AppThemeProvider.tsx:57-59` | Removed `if (!hydrated) return null` hydration gate | ✅ Killed — `AppThemeProvider.test.tsx:123` (source inspection for `return null`) |

**Sensor depth**: lightweight (3 behavior-level mutants)
**Result**: 3/3 killed — ✅ PASS

---

## Interactive UAT Results (if performed)

Not performed (automated verification only).

---

## Code Quality

| Principle        | Status |
| ---------------- | ------ |
| Minimum code     | ✅ |
| Surgical changes | ✅ |
| No scope creep   | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ⚠️ gaps on TPH-04/05/09 |
| Per-layer Coverage Expectation met | ⚠️ store/provider/home layers present; TPH-04/09 gaps |
| Every test maps to a spec requirement | ✅ feature tests tagged TPH-01..10 |
| Documented guidelines followed: `AGENTS.md`, AD-006, AD-018, tasks.md matrix | ✅ |

---

## Edge Cases

- [x] Unknown enum values → system mode + github (`session-preferences-store.test.ts:74-90`)
- [ ] Rapid logo/theme taps → not covered (no test)
- [x] `reset()` clears memory AND storage (`session-preferences-store.test.ts:92-107`)
- [x] GitHub logo white Invertocat in dark mode (pre-existing `DataSourceLogo.test.tsx:18-19`; not re-tested via Home integration)

---

## Gate Check

- **Gate command**: `pnpm test && pnpm lint` (tasks.md Full / Build)
- **Result**: 139 passed, 0 failed, 0 skipped; **lint FAILED** (exit 1)
- **Test count before feature**: 125 (estimated: 139 − 7 store − 4 Home − 3 AppThemeProvider)
- **Test count after feature**: 139
- **Delta**: +14 new tests
- **Skipped tests**: none
- **Failures**:
  - **Tests**: none
  - **Lint**: 13 errors in `.rnstorybook/storybook.requires.ts` (prettier/prettier) — file is **modified locally** and **outside** feature diff `5a4c342..d6ffac5`; all feature-scoped files (`src/stores/*`, `AppThemeProvider.tsx`, `HomeScreen.tsx`, `__mocks__/zustand.ts`, nav, `App.tsx`) lint clean

---

## Fix Plans (if issues found)

### Fix 1: TPH-04 — corrupt / read-fail fallback

- **Root cause**: No test seeds invalid JSON or mocks `getItem` rejection
- **Fix task**: Add store test: corrupt JSON string in memory storage → after `rehydrate()`, assert `mode === systemThemeMode()` and `dataSource === 'github'`
- **Priority**: Major

### Fix 2: TPH-09 — Home theme toggle persist

- **Root cause**: HomeScreen test asserts in-memory `mode` only
- **Fix task**: After `fireEvent.press(home-theme-toggle)`, read memory storage key and assert persisted `mode === 'dark'`
- **Priority**: Major

### Fix 3: TPH-05 — runtime hydration gate

- **Root cause**: Gate covered by static source inspection only; `render()` helper always waits for hydration (`render.tsx:45-56`), masking pre-hydrate behavior
- **Fix task**: Add provider test with deferred hydration mock: assert `product-child` absent before `onFinishHydration`, present after
- **Priority**: Major

### Fix 4: Build gate lint

- **Root cause**: Uncommitted prettier drift in auto-generated `.rnstorybook/storybook.requires.ts`
- **Fix task**: Run prettier on storybook requires or exclude from lint; restore/commit formatted file
- **Priority**: Blocker (gate command)

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status   |
| ----------- | --------------- | ------------ |
| TPH-01      | Pending         | ✅ Verified  |
| TPH-02      | Pending         | ✅ Verified  |
| TPH-03      | Pending         | ✅ Verified  |
| TPH-04      | Pending         | ❌ Needs Fix |
| TPH-05      | Pending         | ⚠️ Partial   |
| TPH-06      | Pending         | ✅ Verified  |
| TPH-07      | Pending         | ⚠️ Partial   |
| TPH-08      | Pending         | ✅ Verified  |
| TPH-09      | Pending         | ❌ Needs Fix |
| TPH-10      | Pending         | ✅ Verified  |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 7/10 ACs fully matched; 2 gaps (TPH-04 corrupt/read-fail, TPH-09 persist on Home tap); 2 spec-precision gaps (TPH-05 runtime gate, TPH-07 leading slot explicit)
**Sensor**: 3/3 mutations killed
**Gate**: 139 tests passed; lint failed (13 errors, storybook file outside feature diff)

**What works**: Zustand persist store with reset/clearStorage, rehydrate restore, invalid-enum fallback, AppThemeProvider store bridge, Home Header toggles (in-memory), Header composition boundary, nav theme sync.

**Issues found**: Missing tests for corrupt storage and Home theme persist; hydration gate not runtime-tested; lint gate red on unrelated storybook file.

**Next steps**: Add Fix 1–3 tests; resolve lint on storybook requires (Fix 4); re-run Verifier.
