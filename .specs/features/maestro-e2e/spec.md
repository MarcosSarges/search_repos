# Maestro E2E Specification

## Problem Statement

Unit/component tests cover layers in isolation, but there is no reliable Maestro suite that proves the product chrome on a real device: Expo Go boot, Search → Details → Issues over the live API, Explore trending, source toggle, and Config theme/fonte. The existing `.maestro/home.yml` still asserts `Welcome!`, which no longer exists.

## Goals

- [ ] Maestro flows in `.maestro/` cover P1 user journeys on Expo Go (Android emulator), including Explore
- [ ] Obsolete smoke assert is replaced with product `testID`s
- [ ] `pnpm test:e2e` runs the suite against the documented device/deep link
- [ ] README E2E section matches the real flows

## Out of Scope

| Feature | Reason |
| --- | --- |
| Favoritos tab smoke | Still mock placeholder; deferred |
| iOS Simulator / physical device matrix | Script pins Android emulator |
| Maestro Cloud / EAS CI wiring | Separate ops feature |
| Injecting Fake repository / MSW into the running app | E2E uses live network (decision 2A) |
| New Config UI to change data source | Product change; toggle stays on Search header |
| Visual regression / AI Maestro asserts | Not required for MVP |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Coverage MVP | Search happy path + source toggle + Config theme/fonte + Explore trending | User chose 1B, then added Explore | y |
| Network | Live GitHub/GitLab (Search + Explore) | User chose 2A | y |
| Source toggle | Search header only | User chose 3A | y |
| Device / deep link | `emulator-5554` + `exp://10.0.2.2:8081` + Expo Go `appId: host.exp.Exponent` | Undiscussed; matches README/AD-006 | n (assumed) |
| Stable search query | `react` | High-signal public results on both providers | n (assumed) |
| Default data source at cold start | `github` (session persist may restore last) | Prefer assert after explicit toggle rather than assuming cold GitHub | n (assumed) |
| Rate limit / offline | Suite fails hard (no soft-pass); document preconditions | Real-network decision | n (assumed) |

**Open questions:** none — remaining items logged as assumptions above.

---

## User Stories

### P1: Boot + Search chrome ⭐ MVP

**User Story**: As a developer, I want a smoke flow that opens the app in Expo Go and lands on Search so that CI/local can prove the bundle boots.

**Why P1**: Without boot, no other E2E is runnable.

**Acceptance Criteria**:

1. WHEN the smoke flow starts THEN Maestro SHALL open `exp://10.0.2.2:8081` against Expo Go (`appId: host.exp.Exponent`)
2. WHEN the app finishes hydrating THEN the flow SHALL assert `search-repos-idle` is visible (copy: Digite para buscar repositórios)
3. WHEN the smoke flow completes THEN it SHALL NOT assert the obsolete string `Welcome!`

**Independent Test**: `maestro test .maestro/smoke-boot.yml` with Metro + Expo Go running.

---

### P1: Search → Details → Issues (live API) ⭐ MVP

**User Story**: As a developer, I want an E2E that searches, opens a repo, and opens issues so that the core navigation stack is proven end-to-end.

**Why P1**: Core product path from the README E2E scope.

**Acceptance Criteria**:

1. WHEN the flow types `react` into `search-repos-input` THEN the system SHALL show `search-repos-list` within a long timeout (network)
2. WHEN the flow taps the first repo list item THEN the system SHALL show `repo-details-content` and `repo-details-full-name`
3. WHEN the flow taps `repo-details-issues-cta` THEN the system SHALL show either `repo-issues-list` OR `repo-issues-empty` (both valid live outcomes)
4. WHEN navigating back from Issues THEN the system SHALL show `repo-details-content` again
5. WHEN navigating back from Details THEN the system SHALL show `search-repos-list` again

**Independent Test**: Run the search stack flow alone after boot subflow.

---

### P1: Source toggle on Search header ⭐ MVP

**User Story**: As a developer, I want an E2E that toggles GitHub ↔ GitLab from Search so that the session source switch is proven on device.

**Why P1**: README lists “troca de fonte”; AD-002/AD-026.

**Acceptance Criteria**:

1. WHEN the flow is on Search THEN it SHALL assert the source header toggle (`id: ds-source-header-toggle` OR a11y “Alternar fonte de dados”) is visible
2. WHEN the flow taps the toggle THEN Config’s `config-source-section` SHALL show the opposite provider subtitle (`GitHub` ↔ `GitLab`) relative to the value observed before the tap
3. WHEN the flow taps the toggle again THEN Config’s fonte subtitle SHALL return to the previously observed provider label

**Independent Test**: Source-toggle flow that visits Config only to read the subtitle (no Config toggle required).

---

### P1: Config theme + fonte ativa ⭐ MVP

**User Story**: As a developer, I want an E2E that opens Config, toggles theme, and reads the active source so that session chrome on Config is proven.

**Why P1**: User chose coverage option B.

**Acceptance Criteria**:

1. WHEN the flow taps the Config tab THEN it SHALL assert `config-theme-section`, `config-source-section`, and `config-token-section` are visible
2. WHEN the flow taps `config-theme-toggle` THEN the toggle’s accessibility label SHALL flip between `Switch to dark mode` and `Switch to light mode`
3. WHEN Config is visible THEN `config-source-section` SHALL include a subtitle matching `GitHub` or `GitLab`
4. WHEN `config-token-section` is visible THEN it SHALL show the placeholder subtitle containing `Em breve`

**Independent Test**: Config-only flow after boot.

---

### P1: Explore trending (live API) ⭐ MVP

**User Story**: As a developer, I want an E2E that opens Explore and shows trending repos so that discovery on the active source is proven on device.

**Why P1**: User explicitly required Explore in the Maestro suite.

**Acceptance Criteria**:

1. WHEN the flow taps the Explore tab THEN it SHALL assert `explore-screen` is visible
2. WHEN trending loads over the network THEN the flow SHALL assert `explore-list` is visible within a long timeout
3. WHEN the flow taps the first item in `explore-list` THEN the system SHALL show `repo-details-content` (cross-tab nav into Search stack)
4. WHEN the flow navigates back from that details screen THEN it SHALL return to a visible `explore-screen` (or Explore tab content still reachable)

**Independent Test**: Explore-only flow after boot subflow, with live API.

---

### P2: Empty / error paths when reproducible

**User Story**: As a developer, I want empty/error E2E coverage when we can force those states without flaky hacks.

**Why P2**: README mentions them “quando reproduzível”; live API makes error injection hard.

**Acceptance Criteria**:

1. WHEN a deterministic empty query is agreed later THEN a flow MAY assert `search-repos-empty`
2. WHEN rate-limit / offline injection is available THEN a flow MAY assert `search-repos-error` + `search-repos-retry`

**Independent Test**: Deferred until a reproducible strategy exists.

---

## Edge Cases

- WHEN Metro is down THEN the openLink/boot step SHALL fail (suite does not soft-pass)
- WHEN API rate-limits (HTTP 429) THEN the search/details/Explore flows SHALL fail visibly (no optional asserts on success path)
- WHEN session prefs restore a previous `dataSource` THEN source-toggle assertions SHALL use before/after comparison, not hard-coded cold-start GitHub
- WHEN Issues API returns zero items THEN `repo-issues-empty` SHALL count as pass (AC3 of search stack)
- WHEN Explore returns zero items THEN `explore-empty` is a live edge — success path still requires `explore-list` (fail if empty under normal conditions)
- WHEN Expo Go shows a deep-link confirmation dialog THEN the flow SHALL dismiss/confirm it if present (platform-specific optional step)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| E2E-01 | P1: Boot + Search chrome | Execute | Pending |
| E2E-02 | P1: Boot — no Welcome! | Execute | Pending |
| E2E-03 | P1: Search list after query | Execute | Pending |
| E2E-04 | P1: Open details | Execute | Pending |
| E2E-05 | P1: Open issues (list or empty) | Execute | Pending |
| E2E-06 | P1: Back stack Details/Search | Execute | Pending |
| E2E-07 | P1: Source toggle visible | Execute | Pending |
| E2E-08 | P1: Toggle flips Config fonte | Execute | Pending |
| E2E-09 | P1: Toggle twice restores fonte | Execute | Pending |
| E2E-10 | P1: Config sections visible | Execute | Pending |
| E2E-11 | P1: Theme a11y label flip | Execute | Pending |
| E2E-12 | P1: Fonte subtitle GitHub\|GitLab | Execute | Pending |
| E2E-13 | P1: Token “Em breve” | Execute | Pending |
| E2E-14 | P1: Explore screen visible | Execute | Pending |
| E2E-15 | P1: Explore list loads | Execute | Pending |
| E2E-16 | P1: Explore item → details | Execute | Pending |
| E2E-17 | P1: Back from details to Explore | Execute | Pending |
| E2E-18 | P2: Empty/error | — | Deferred |

**Coverage:** 18 total, 17 P1 mapped to execute, 1 deferred (P2).

---

## Success Criteria

- [ ] `pnpm test:e2e` exits 0 on Android emulator with Metro + Expo Go
- [ ] All P1 ACs have a Maestro assert (`id` or text) mapped in flow YAML
- [ ] README E2E section lists the real flow files (no `Welcome!`)
- [ ] No product UI changes required beyond optional tiny a11y/`testID` gaps discovered during Execute
