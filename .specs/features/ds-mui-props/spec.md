# DS MUI Props Specification

## Problem Statement

A API pública do Design System em `packages/ds` usa `tone` para dois domínios (conteúdo e superfície) e reaproveita `variant` para tamanho em Icon/Loading, o que foge do mental model do MUI e atrapalha quem monta telas. Precisamos de eixos de props claros (`color`, `bg`, `variant`, `size`, `width`) sem redesenhar o tema já criado, com migração big-bang e documentação da motivação.

## Goals

- [ ] Remover `tone` / `Tone` / `SurfaceTone` da API pública; content usa `color`, superfície usa `bg`
- [ ] Button no modelo MUI-like: `variant` (chrome) × `color` (paleta) × `size` × `width`
- [ ] Escala unificada via `size` em Icon, Loading e DataSourceLogo; Typography permanece só `variant`
- [ ] Todo componente DS aceita e repassa `style` (sem `sx`)
- [ ] Consumers, stories e testes verdes; README + STATE documentam o padrão e supersedem ADs de `tone`

## Out of Scope

| Feature | Reason |
| --- | --- |
| `sx` / system props estilo MUI Box | Confirmado no discuss — só `style` passthrough |
| Atom Pressable / BaseButton exportado | Confirmado — host do Button permanece como está |
| Redesign visual (novos hex, tipografia, spacing) | Tema atual é fonte de verdade |
| Aliases MUI (`textPrimary`, `error`, …) | Vocabulário = nomes de token |
| Prop `size` tipográfico no Typography | AD-014 mantido para tipografia |
| Novos atoms (Badge, Avatar, …) | Fora do boundary de props |
| pnpm publish / package versioning formal | Lib interna já em `packages/ds` |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Content `color` union | `text` \| `muted` \| `primary` \| `danger` | Context A | y |
| Content default | `text` (ex-`default`) | Context A | y |
| Surface prop | `bg`: `background` \| `surface` | Context B | y |
| Container sem `bg` | Sem background forçado (transparente / herda) | Context B | y |
| Card sem `bg` | Mantém chrome default do token card (`surface`) | Card é superfície nomeada; distinto do Container | y (agent, alinhado a “alinha API”) |
| Button variants | `contained` \| `outlined` \| `text` | Context C | y |
| Button colors | `primary` \| `success` \| `warning` \| `danger` | Context C | y |
| Button default | `contained` + `primary` | Context C | y |
| Button `width` | `'hug' \| 'full'`, default `full` | Context C′ | y |
| Button `size` | `sm` \| `md` \| `lg` (tokens atuais) | Context C′ | y |
| Icon/Loading/Logo escala | Prop `size`; valores de token atuais | Context D | y |
| Loading rename | `variant` → `size` | Context D | y |
| Typography | Só `variant`; + `color` (não `tone`) | Context A+D | y |
| Migração | Big-bang, sem aliases `tone` | Context E | y |
| Docs | STATE (AD supersession) + README (motivação) | Context E | y |
| `style` | Aceitar e repassar em todos os componentes DS públicos | Context E | y |
| Lookups | Continuam object maps (AD-013) | Continuidade DS | y (assumido) |
| Module shape | AD-012 mantido (`styles.tsx`, etc.) | Continuidade DS | y (assumido) |
| Nome do módulo token pós-`tone.ts` | Discrição do agent | Context Agent's Discretion | n (agent) |
| Chrome success/warning/danger no Button | Mapas em styles; primary preserva look atual | Context Agent's Discretion | n (agent) |

**Open questions:** none — all resolved or logged above.

---

## Implicit-requirement dimensions

| Dimension | Resolution |
| --- | --- |
| Input validation & bounds | Unions TypeScript nas props; valores fora do union = erro de tipo (não runtime coerce) |
| Failure / partial-failure | N/A — mudança de API de UI kit, sem I/O |
| Idempotency / retry | N/A |
| Auth / rate limits | N/A |
| Concurrency / ordering | N/A |
| Data lifecycle / expiry | N/A |
| Observability | N/A |
| External-dependency failure | N/A |
| State-transition integrity | N/A — props estáticas de apresentação |

---

## User Stories

### P1: Content `color` + surface `bg` (fim do `tone`) ⭐ MVP

**User Story**: As a developer, I want content color and surface background as separate props named like MUI/`color`+`bg` so that I stop guessing what `tone` means.

**Why P1**: Remove the worst API smell; unblocks Typography, Icon, Container, Card, InputField.

**Acceptance Criteria**:

1. WHEN Typography or Icon is rendered with `color="muted"|"primary"|"danger"|"text"` THEN the foreground SHALL resolve to `theme.colors` for that token
2. WHEN Typography or Icon omits `color` THEN the foreground SHALL use `theme.colors.text`
3. WHEN the public DS API is inspected THEN it SHALL NOT export `Tone`, `SurfaceTone`, `tone`, or `toneColorMap` under those names
4. WHEN Container is given `bg="surface"` or `bg="background"` THEN its background-color SHALL be the matching `theme.colors` token
5. WHEN Container omits `bg` THEN it SHALL NOT apply `theme.colors.background` (nor `surface`) as an implicit fill — background remains unset/transparent for composition
6. WHEN Card is given `bg` THEN its background SHALL follow that token; WHEN Card omits `bg` THEN it SHALL keep the card token default surface fill
7. WHEN InputField shows helper vs error message THEN caption color SHALL use `color="muted"` vs `color="danger"` (no `tone`)
8. WHEN app/Storybook call sites previously used `tone` THEN they SHALL be updated to `color` / `bg` in the same change set (big-bang)

**Independent Test**: Grep `tone=` / `Tone` / `SurfaceTone` under `packages/ds` + product screens → zero public usage; unit tests assert color/bg outcomes.

---

### P1: Button MUI-like (`variant` × `color` × `size` × `width`) ⭐ MVP

**User Story**: As a developer, I want Button chrome and palette as separate axes, plus explicit size and width, so that I can build primary, destructive, and non-full-width actions without fighting the API.

**Why P1**: Button is the highest-traffic interactive atom; current `primary|outline|ghost` conflates chrome and color.

**Acceptance Criteria**:

1. WHEN Button uses `variant="contained"|"outlined"|"text"` THEN chrome SHALL follow the mapped styles for that chrome (filled / bordered / ghost-like text), independent of which `color` is set
2. WHEN Button uses `color="primary"|"success"|"warning"|"danger"` THEN chrome colors SHALL derive from the corresponding `theme.colors` token
3. WHEN Button omits `variant` and `color` THEN it SHALL render as `contained` + `primary` (visual equiv. to legacy `variant="primary"`)
4. WHEN Button `size` is `sm`|`md`|`lg` THEN padding/minHeight SHALL come from existing button size tokens
5. WHEN Button omits `width` or sets `width="full"` THEN the pressable SHALL stretch to the cross-axis of its parent (full width behavior)
6. WHEN Button sets `width="hug"` THEN the pressable SHALL size to its content (not force full width)
7. WHEN the public Button API is inspected THEN it SHALL NOT accept legacy `variant` values `primary`|`outline`|`ghost`
8. WHEN Loading inside Button resolves indicator size THEN it SHALL use Loading’s `size` prop/token path (not Loading `variant`)

**Independent Test**: Button unit tests cover variant×color matrix smoke + size + width hug/full; stories updated.

---

### P1: Scale `size` + `style` passthrough ⭐ MVP

**User Story**: As a developer, I want a consistent `size` prop for scalable atoms and the ability to pass `style` through for rare escapes, without adopting `sx`.

**Why P1**: Closes Icon/Loading confusion and the composition escape hatch agreed in discuss.

**Acceptance Criteria**:

1. WHEN Icon is given `size` (`xs`…`xl` per current icon tokens) THEN glyph size SHALL match that token; Icon SHALL NOT expose size via a prop named `variant`
2. WHEN Loading is given `size` (`sm`|`lg`) THEN ActivityIndicator size SHALL match loading tokens; Loading SHALL NOT expose a public `variant` prop for scale
3. WHEN DataSourceLogo keeps `size` THEN behavior SHALL remain the existing size token mapping (already `size`)
4. WHEN any public DS component (atoms/molecules/organisms exported from `@ds`) receives `style` THEN that `style` SHALL be forwarded to the underlying styled host (composition), and TypeScript SHALL accept `style` on the public props type
5. WHEN the feature ships THEN no DS public API SHALL introduce an `sx` prop

**Independent Test**: Icon/Loading tests use `size`; grep `Omit<.*, 'style'` on public DS props → none that strip `style` from the public surface; sample test asserts `style` reaches host.

---

### P2: Docs — README + STATE (AD supersession)

**User Story**: As a developer joining the repo, I want README and STATE to explain the props pattern and why `tone` was removed so that I build screens the intended way.

**Why P2**: Required by discuss; supports onboarding without blocking code MVP if sequenced after P1 gates — still same feature delivery.

**Acceptance Criteria**:

1. WHEN README Decisions (or DS section) is read THEN it SHALL document the props axes (`color`, `bg`, `variant`, `size`, `width`) and the motivation: consistent pattern + better tools to build screens
2. WHEN `.specs/STATE.md` Decisions are updated THEN AD-016 and the `tone` / Icon-`variant`-as-size parts of AD-017 SHALL be marked superseded (or replaced) by a new AD describing the MUI-like props model
3. WHEN docs mention migration THEN they SHALL state big-bang (no `tone` aliases)

**Independent Test**: Manual read of README + STATE; links/IDs consistent with code.

---

## Edge Cases

- WHEN `color="primary"` on Typography/Icon and theme brand primary changes with data source THEN color SHALL follow the active theme primary (existing theme behavior)
- WHEN Button `color` is `success`|`warning`|`danger` with `outlined`|`text` THEN border/label/foreground SHALL use that palette token (not fall back silently to primary)
- WHEN Container has children and no `bg` THEN children layout/spacing props SHALL still apply; only fill is absent
- WHEN both Card token default and `bg` are considered THEN explicit `bg` SHALL override the token default fill
- WHEN `style` conflicts with token-driven chrome THEN host/React Native style merge rules apply (last-write / array merge as RN does) — DS does not invent a conflict resolver
- WHEN legacy call sites used `tone="default"` THEN migration SHALL map to `color="text"` (or omit `color`)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| PROP-01 | P1: content color | Design | Pending |
| PROP-02 | P1: content default text | Design | Pending |
| PROP-03 | P1: remove tone exports | Design | Pending |
| PROP-04 | P1: Container bg | Design | Pending |
| PROP-05 | P1: Container no default bg | Design | Pending |
| PROP-06 | P1: Card bg API | Design | Pending |
| PROP-07 | P1: InputField colors | Design | Pending |
| PROP-08 | P1: big-bang consumers | Design | Pending |
| PROP-09 | P1: Button variant chrome | Design | Pending |
| PROP-10 | P1: Button color palette | Design | Pending |
| PROP-11 | P1: Button defaults | Design | Pending |
| PROP-12 | P1: Button size | Design | Pending |
| PROP-13 | P1: Button width full | Design | Pending |
| PROP-14 | P1: Button width hug | Design | Pending |
| PROP-15 | P1: no legacy Button variants | Design | Pending |
| PROP-16 | P1: Button→Loading size | Design | Pending |
| PROP-17 | P1: Icon size | Design | Pending |
| PROP-18 | P1: Loading size | Design | Pending |
| PROP-19 | P1: Logo size unchanged contract | Design | Pending |
| PROP-20 | P1: style passthrough | Design | Pending |
| PROP-21 | P1: no sx | Design | Pending |
| PROP-22 | P2: README | Design | Pending |
| PROP-23 | P2: STATE AD supersession | Design | Pending |

**Coverage:** 23 total, 0 mapped to tasks, 23 unmapped ⚠️ (tasks phase next)

---

## Success Criteria

- [ ] Zero public `tone` / `Tone` / `SurfaceTone` in DS API and product call sites
- [ ] Button usable as contained/outlined/text × primary/success/warning/danger with hug|full width
- [ ] Icon/Loading use `size`; Typography uses `variant` + `color`
- [ ] `style` accepted on public DS components; no `sx`
- [ ] `pnpm test` green; stories reflect new props
- [ ] README + STATE document the pattern and supersede tone ADs
