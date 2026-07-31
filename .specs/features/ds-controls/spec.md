# DS Controls Specification

## Problem Statement

A fatia `design-system` entregou foundation (tokens, Typography, Icon, Spacer, Loading, Container, Header, DataSourceLogo), mas o enunciado §6.2 ainda exige Button, Input (com label/error/helper) e Card/Surface tipados. Sem esses controles, telas de produto e o Showcase não conseguem montar UI sem inventar Pressable/TextInput/Views soltas — violando §6.3.

## Goals

- [ ] Atom **Button** tipado: variants `primary` \| `outline` \| `ghost`, sizes `sm` \| `md` \| `lg`, estados `loading` \| `disabled`, slots `leading`/`trailing`
- [ ] Atom **Input** tipado: chrome com borda + slots `leading`/`trailing` + value API; sem label/error/helper
- [ ] Molecule **InputField**: composição com `label`, `value`, `error`, `helperText` sobre o Input atom
- [ ] Molecule **Card** compound: `Card` + `Card.Header` + `Card.Content` + `Card.Footer` com surface/radius/border próprios
- [ ] Cada peça com pasta AD-012, stories Storybook, testes Jest+RNTL; README atualizado com a classificação Atomic

## Out of Scope

| Feature | Reason |
| --- | --- |
| Badge / Tag | Deferido (confirmado no discuss) |
| Avatar | Deferido (confirmado no discuss) |
| Showcase screen in-app dos novos controles | Feature posterior (igual deferral anterior) |
| Telas de produto (busca, detalhes, issues) | Features posteriores |
| Input size variants (`sm`/`md`/`lg`) | Enunciado não exige; densidade única no atom |
| Focus-ring tokens custom | Platform default / RN; token dedicado fica para depois |
| Reutilizar Container dentro de Card | Card tem chrome próprio |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Nome da molécula de variação do Input | `InputField` | Deixa o atom `Input` como chrome; enunciado “Input” coberto pela molécula pública + atom interno | y |
| Erro vs helperText | Se `error` (string não vazia) estiver setado, a molécula exibe a mensagem de erro no lugar do `helperText` e aplica estado de erro no Input | Padrão de form fields; evita duas linhas conflitantes | y |
| Estado visual de erro no atom Input | Prop tipada `state?: 'default' \| 'error'` (object map → border/tone); InputField seta `state="error"` quando há `error` string | Tokens definem variação (AD-017); molécula orquestra | y |
| Button loading | Substitui o conteúdo (label + slots) por atom `Loading` alinhado ao size; mantém largura mínima do botão; `disabled` implícito enquanto loading | Enunciado exige loading; evita double-tap | y |
| Button / Input slots | `leading?: ReactNode`, `trailing?: ReactNode` — livre (Icon, Typography, etc.) | Confirmado no discuss | y |
| Card compound | Static members `Card.Header`, `Card.Content`, `Card.Footer` | Confirmado no discuss | y |
| Card chrome | Surface tone + radius + border via tokens próprios do Card (não Container) | Confirmado no discuss | y |
| Dimensões implícitas (auth, retry, concurrency, TTL, observability, external deps) | N/A — DS puro de UI tipada | Sem backend/state machine nesta feature | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Button atom ⭐ MVP

**User Story**: As a developer, I want a typed Button with variants, sizes, loading/disabled, and leading/trailing slots so that screens never invent ad-hoc pressables.

**Why P1**: Enunciado §6.2 — controle base obrigatório.

**Acceptance Criteria**:

1. WHEN Button is rendered with `variant="primary"` THEN it SHALL use `theme.colors.primary` for the filled chrome (not a hardcoded hex)
2. WHEN Button is rendered with `variant="outline"` OR `variant="ghost"` THEN it SHALL apply the corresponding token-driven chrome from an object map (no `switch` lookup)
3. WHEN Button is rendered with `size` `sm` \| `md` \| `lg` THEN padding/minHeight/label metrics SHALL come from button size tokens (object map)
4. WHEN `disabled` is true THEN Button SHALL not invoke `onPress` and SHALL expose a non-interactive / disabled accessibility state
5. WHEN `loading` is true THEN Button SHALL show the Loading atom, SHALL not invoke `onPress`, and SHALL keep a stable minimum size so layout does not collapse
6. WHEN `leading` and/or `trailing` ReactNodes are passed AND `loading` is false THEN Button SHALL render them adjacent to the label in leading→label→trailing order
7. WHEN Button public props are inspected THEN they SHALL NOT include `style`
8. WHEN Button is opened in Storybook THEN at least one story SHALL cover default + key variants/sizes/states/slots
9. WHEN Button is shipped THEN colocated Jest + RNTL tests SHALL assert variant/size/loading/disabled/slot behavior from these ACs

**Independent Test**: Storybook Button stories + `pnpm test` path for Button.

---

### P1: Input atom (field chrome) ⭐ MVP

**User Story**: As a developer, I want a bordered Input atom with leading/trailing slots so that form molecules and screens share one text-field chrome.

**Why P1**: Base do enunciado; moléculas de variação dependem deste atom.

**Acceptance Criteria**:

1. WHEN Input is rendered THEN it SHALL show a bordered field chrome using theme border/surface tokens (no hardcoded colors)
2. WHEN `leading` and/or `trailing` are passed THEN Input SHALL render them inside the chrome in leading→field→trailing order
3. WHEN `value` / text-change props are used THEN Input SHALL behave as a controlled RN text input host (value reflected; change callback invoked on edit)
4. WHEN `state="error"` THEN Input border/chrome SHALL use the error token mapping (object map); WHEN `state="default"` (or omitted) THEN default border mapping SHALL apply
5. WHEN `editable={false}` or disabled-equivalent is set THEN the field SHALL not accept text edits and SHALL expose disabled/read-only accessibility accordingly
6. WHEN Input public props are inspected THEN they SHALL NOT include `style`
7. WHEN Input is opened in Storybook THEN stories SHALL cover default, with slots, and error state
8. WHEN Input is shipped THEN colocated Jest + RNTL tests SHALL assert chrome, slots, state, and controlled value from these ACs

**Independent Test**: Storybook Input + unit tests without InputField.

---

### P1: InputField molecule ⭐ MVP

**User Story**: As a developer, I want an InputField molecule with label, error, and helperText so that §6.2 Input requirements are met without bloating the Input atom.

**Why P1**: Enunciado lista label/value/error/helperText; discuss separou isso em molécula.

**Acceptance Criteria**:

1. WHEN InputField is rendered with `label` THEN it SHALL show the label above the Input atom via Typography
2. WHEN `helperText` is set AND `error` is absent/empty THEN InputField SHALL show helperText below the Input
3. WHEN `error` is a non-empty string THEN InputField SHALL show the error message below the Input (not the helperText), AND SHALL pass error state into the Input atom
4. WHEN `leading` / `trailing` are passed to InputField THEN they SHALL be forwarded to the inner Input
5. WHEN `value` / change handlers are passed THEN they SHALL be forwarded to the inner Input
6. WHEN InputField public props are inspected THEN they SHALL NOT include `style`
7. WHEN InputField is opened in Storybook THEN stories SHALL cover label+helper, error, and slots
8. WHEN InputField is shipped THEN colocated Jest + RNTL tests SHALL assert label/helper/error/forwarding from these ACs

**Independent Test**: Render InputField alone in tests/Storybook; no Button/Card required.

---

### P1: Card molecule (compound) ⭐ MVP

**User Story**: As a developer, I want a compound Card with Header/Content/Footer regions and its own surface chrome so that list/detail surfaces share structure without ad-hoc Views.

**Why P1**: Enunciado §6.2 Card/Surface; discuss locked compound + own chrome.

**Acceptance Criteria**:

1. WHEN Card is rendered THEN it SHALL apply surface background, radius, and border from Card/token maps (not by rendering Container)
2. WHEN `Card.Header` / `Card.Content` / `Card.Footer` are used as children THEN each region SHALL render its children in that order (header → content → footer)
3. WHEN only a subset of regions is used (e.g. Content only, or Header+Content) THEN Card SHALL render only the provided regions without requiring all three
4. WHEN Card public props (root and regions) are inspected THEN they SHALL NOT include `style`
5. WHEN Card is opened in Storybook THEN at least one story SHALL show all three regions composed
6. WHEN Card is shipped THEN colocated Jest + RNTL tests SHALL assert chrome ownership and compound region rendering from these ACs

**Independent Test**: Storybook Card compound story + unit tests.

---

### P1: Atomic docs + barrels ⭐ MVP

**User Story**: As a developer, I want README and DS barrels to reflect the new atoms/molecules so that imports and Atomic classification stay accurate.

**Why P1**: AD-009; evita drift “tudo é atom”.

**Acceptance Criteria**:

1. WHEN the README Design System table is read THEN it SHALL list Button + Input under atoms and InputField + Card under molecules (Badge/Avatar still deferred or absent)
2. WHEN the public DS barrel is used THEN Button, Input, InputField, and Card SHALL be importable from the documented paths
3. WHEN the DS tree is inspected THEN new pieces SHALL live under `atoms/` or `molecules/` per the classification above, each with AD-012 file shape

**Independent Test**: README review + import smoke / tree listing.

---

## Edge Cases

- WHEN Button has `loading` and `disabled` together THEN system SHALL treat as non-pressable (loading wins for content; both block press)
- WHEN Button has `leading`/`trailing` AND `loading` THEN slots/label SHALL NOT show; Loading SHALL show instead
- WHEN InputField `error=""` (empty string) THEN system SHALL treat as no error (helperText may show)
- WHEN Input has no leading/trailing THEN chrome SHALL still layout the text field without empty slot gaps that break alignment
- WHEN Card has zero region children THEN system SHALL still render the Card chrome shell (empty surface)
- WHEN invalid `variant`/`size`/`state` values are passed at type level THEN TypeScript SHALL reject them (unions from tokens)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| CTRL-01 | P1: Button atom | Tasks | Verified |
| CTRL-02 | P1: Input atom | Tasks | Verified |
| CTRL-03 | P1: InputField molecule | Tasks | Verified |
| CTRL-04 | P1: Card molecule | Tasks | Verified |
| CTRL-05 | P1: Atomic docs + barrels | Tasks | Verified |

**ID format:** `CTRL-NN`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 5 total, 5 mapped to tasks (T1–T6 done)

---

## Success Criteria

- [ ] `pnpm test` green for Button, Input, InputField, Card (+ any new token tests)
- [ ] Storybook lists the new atoms/molecules with light/dark × dataSource globals affecting primary Button
- [ ] README Atomic table matches classification (Button/Input atoms; InputField/Card molecules)
- [ ] No public `style` on the new components; lookups via object maps; styled only in `styles.tsx`
- [ ] Badge/Avatar remain unimplemented in this feature

---

## Scope sizing

**Large** — 4 UI pieces + tokens + docs; clear enunciado + discuss locked; formal Design + Tasks recommended before Execute.
