# Maestro E2E Context

**Gathered:** 2026-08-03
**Spec:** `.specs/features/maestro-e2e/spec.md`
**Status:** Spec ready — awaiting execute

---

## Decisions

### Coverage set (MVP)

- **Decision:** Option B + **Explore** — README happy paths + Config (theme toggle + fonte ativa) + Explore trending (live API). Favoritos remains out (still mock).
- **Reason:** User confirmed 1B, then explicitly required Explore in scope. Favoritos still deferred.
- **Rejected:** A (too thin without Config); full tabs smoke including Favoritos.

### Network strategy

- **Decision:** Option A — real network against live GitHub/GitLab APIs.
- **Reason:** User wants true E2E proof of search → details → issues.
- **Rejected:** B (UI-only), C (hybrid).
- **Implication:** Flows need generous timeouts; query must be stable (e.g. `react`); rate-limit failures are environment issues, not soft-pass.

### Source toggle location

- **Decision:** Option A — toggle via Search `SessionSourceHeader` (`ds-source-header-toggle` / a11y “Alternar fonte de dados”).
- **Reason:** Matches current product (Config shows fonte ativa read-only).
- **Rejected:** B (would require new Config UI — out of E2E-only scope).

### Device / runner (undiscussed → assumption)

- **Decision:** Keep `pnpm test:e2e` → `maestro --device emulator-5554 test .maestro/` and Expo Go `openLink: exp://10.0.2.2:8081`.
- **Rationale:** Already documented in README/AD-006; physical device / iOS deferred.

---

## Deferred Ideas

- Favoritos tab smoke (mock placeholder)
- Maestro Cloud / EAS Workflow CI
- Empty / error reproduction without killing live API (mock server / airplane mode)
- Config source toggle UI (product feature, not E2E)

---

## Notes for Design / Execute

- Prefer Maestro selectors by `id` (RN `testID`) already present on product screens.
- Shared bootstrap subflow: open Expo Go deep link → wait for Search idle.
- Replace obsolete `home.yml` assert (`Welcome!`).
- Config theme: assert a11y label flip after toggle (`Switch to dark mode` ↔ `Switch to light mode`).
- After source toggle on Search, Config “Fonte ativa” subtitle must reflect GitHub ↔ GitLab.
- Explore: assert `explore-screen` then wait for `explore-list` (live trending); optional tap → `repo-details-content` (screen already navigates to Search stack details).
