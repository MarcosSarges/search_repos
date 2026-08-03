# Maestro E2E — Tasks

**Spec:** `.specs/features/maestro-e2e/spec.md`  
**Context:** `.specs/features/maestro-e2e/context.md`  
**Design:** skipped (YAML-only; Expo Go pattern already in README/AD-006)

## Test Coverage Matrix

> Guidelines found: `README.md` (Maestro E2E section), AD-006, `package.json` `test:e2e`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Maestro flows (product journeys) | e2e | Every P1 AC (E2E-01…17) mapped to assert; live network happy paths | `.maestro/**/*.yml` | `pnpm test:e2e` |
| App product code | none | No product changes unless testID/a11y gap blocks a flow | — | — |
| README E2E docs | none | Build/docs gate — match real flow files | `README.md` | — |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | N/A (no unit work) | — |
| Full | After each flow task | `pnpm test:e2e` (requires Metro + Expo Go + emulator) |
| Build | After last task | `pnpm test:e2e` + README spot-check |

**Preconditions:** Metro (`pnpm start`), Expo Go on Android emulator, device id matching script (`emulator-5554` or update script).

---

## Phase 1 — Bootstrap & smoke

### T1: Shared boot subflow + smoke boot
**What:** Create `.maestro/shared/boot.yml` (openLink + wait `search-repos-idle`); replace obsolete `home.yml` with smoke that uses boot and forbids `Welcome!`.  
**Done when:** E2E-01, E2E-02 covered; smoke file runs.  
**Tests:** e2e (the YAML itself)  
**Gate:** full (smoke file only if possible: `maestro --device <id> test .maestro/00-smoke-boot.yml`)  
**Commit:** `test(e2e): add Expo Go boot subflow and smoke`

---

## Phase 2 — Product journeys

### T2: Search → Details → Issues flow
**What:** `.maestro/10-search-details-issues.yml` — query `react`, list, first item, details, issues (list\|empty), back×2.  
**Done when:** E2E-03…06 covered.  
**Depends:** T1  
**Gate:** full  
**Commit:** `test(e2e): add search details issues flow`

### T3: Source toggle flow
**What:** `.maestro/20-source-toggle.yml` — toggle on Search header; Config fonte flips and restores (before/after).  
**Done when:** E2E-07…09 covered.  
**Depends:** T1  
**Gate:** full  
**Commit:** `test(e2e): add data source toggle flow`

### T4: Config theme + sections flow
**What:** `.maestro/30-config-theme.yml` — Config sections, theme a11y flip, fonte label, token Em breve.  
**Done when:** E2E-10…13 covered.  
**Depends:** T1  
**Gate:** full  
**Commit:** `test(e2e): add config theme and sections flow`

### T5: Explore trending flow
**What:** `.maestro/40-explore.yml` — Explore tab, list, tap → details, return via Explore tab.  
**Done when:** E2E-14…17 covered.  
**Depends:** T1  
**Gate:** full  
**Commit:** `test(e2e): add explore trending flow`

---

## Phase 3 — Docs

### T6: README E2E section
**What:** Update README Maestro section — list real flows, remove `Welcome!`, note preconditions.  
**Done when:** Success criterion docs met.  
**Depends:** T1–T5  
**Gate:** build (docs + full suite)  
**Commit:** `docs(e2e): align README with Maestro flows`

---

## Execution Plan

| Batch | Tasks | Worker |
| --- | --- | --- |
| 1 (inline) | T1–T6 (6 tasks ≤8) | Orchestrator inline — no sub-agent offer |

**Status:** T1–T6 pending
