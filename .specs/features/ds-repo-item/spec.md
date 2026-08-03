# DS RepoItem Specification

## Problem Statement

A lista de repositórios ainda usa um `RepoListItem` de apresentação com Card + Typography soltos — sem o layout de card do mock (título capitalizado, descrição opcional, badges de linguagem, avatar, divider, stats com estrela). O DS também não tem um atom `Divider` reutilizável (horizontal/vertical) nem uma molécula de lista tipada: Search e Issues aplicam `FlatList` crua do RN com padding no Container pai (anti-pattern — o padding deve ir em `contentContainerStyle`) e repetem Separator/`Spacer`/defaults de performance à mão. Sem organisms/molecules no DS, as telas inventam layout e quebram Atomic Design (AD-009/AD-012/AD-029).

## Goals

- [ ] Atom **Divider** em `packages/ds/atoms/Divider` com orientação `horizontal` \| `vertical`, chrome via tokens
- [ ] Organism **RepoItem** em `packages/ds/organisms/RepoItem` no layout do mock (título Capitalize → descrição opcional → badges + avatar → divider → stats com estrela)
- [ ] `RepoListItem` de apresentação passa a compor o organism (adapter fino; sem estilos de card na tela)
- [ ] Molecule **FlatList** em `packages/ds/molecules/FlatList`: padding via `contentContainerStyle` (não no wrapper externo), `Spacer` como separator default, defaults de performance, restante das props RN encaminháveis
- [ ] **SearchReposScreen** e **RepoIssuesScreen** passam a usar a molécula FlatList (sem `FlatList` direto de `react-native` nessas listas)
- [ ] **ExploreScreen** usa `RepoItem` + molécula FlatList; tap no card navega para `RepoDetails`
- [ ] Pasta AD-012 + stories Storybook + testes Jest+RNTL para Divider, RepoItem e FlatList; exports no barrel do DS

## Out of Scope

| Feature | Reason |
| --- | --- |
| Novos campos no domínio `Repo` (ex.: `updatedAt`, múltiplas linguagens na API) | Domínio já tem `language?` singular; data de update não existe na entidade |
| Mapa canônico de cores por linguagem no DS | Badge já aceita `swatch?`; swatch opcional via prop, sem tabela GitHub linguist nesta fatia |
| Favoritar / botão de ação no card | Feature Favoritos é separada (AD-026) |
| Alterar radius/tokens globais do Card para “pill” do mock | RepoItem compõe Card existente; chrome do Card permanece (AD-028) |
| Divider com label/texto no meio | Atom puro de linha; sem conteúdo |
| Migração de Favoritos para FlatList ou RepoItem | Feature Favoritos separada (AD-026) |
| SectionList / FlashList | Fora do pedido; só FlatList tipada |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Capitalize do nome | Exibir `name` com Title Case na UI (primeira letra de cada palavra maiúscula); valor da prop permanece cru | Confirmado discuss (1A) | y |
| Descrição opcional | Omitir o bloco quando `description` for `undefined`, `null` ou string vazia/whitespace | Pedido explícito; alinhado ao `RepoListItem` atual | y (user) |
| Linguagens / badges | Prop `languages?: { label: string; swatch?: string }[]`; se ausente/vazia, badges somem. Adapter mapeia `repo.language` → 0\|1 item | Confirmado discuss (2A) | y |
| Avatar do owner | Incluir `Avatar` à direita da fileira de badges; `ownerName` + `ownerAvatarUrl?` (fallback iniciais) | Confirmado discuss (3A) | y |
| Footer stats | Estrela + `{stars}` sempre; fork + `{forks}` só quando `forks` estiver definido. GitHub e GitLab já mapeiam `forks_count` → `forks`; sem watchers/data | User: suporte nas duas fontes; se ausente, ocultar | y |
| Interação / press | RepoItem presentational (sem `Pressable`); `onPress` no adapter `RepoListItem` | Confirmado discuss (5A) | y |
| Contrato de props | Primitivos tipados no DS — **não** importar `Repo` de `@/domain` | Isolamento do pacote DS (`packages/ds/__tests__/isolation.test.ts`, AD-029) | y (AD) |
| Divider API | Prop `orientation?: 'horizontal' \| 'vertical'` (default `horizontal`); cor `theme.colors.border`; espessura 1px; vertical exige altura do pai (stretch) | Pedido explícito atom vertical/horizontal | y (user) |
| Composição RepoItem | RepoItem usa molecule `Card` (+ regiões) + atoms `Typography`, `Badge`, `Avatar`, `Icon`, `Divider`, `Spacer` | Reuso do DS existente; evita reinventar chrome | y |
| FlatList padding | Spacing props (`p`/`px`/`py`/…) aplicam **somente** em `contentContainerStyle`, nunca como padding do host FlatList/`style` externo | Pedido explícito — best practice de scroll | y (user) |
| FlatList separator | Default `ItemSeparatorComponent` = `<Spacer top size="lg" />`; consumer pode override via `ItemSeparatorComponent` ou desligar com `separator={false}` | Pedido “Spacer por padrão”; telas atuais já usam `lg` | y |
| FlatList performance defaults | `initialNumToRender={20}`, `onEndReachedThreshold={0.5}`, `windowSize={10}`, `maxToRenderPerBatch={10}`, `updateCellsBatchingPeriod={50}`; consumer pode sobrescrever qualquer um | Alinha ao uso atual Search/Issues + defaults RN sensatos | y |
| FlatList content padding default | Default `px="md"` (mesmo valor que os Containers das telas hoje); omitível/`px` override | Evita double-pad ao migrar: tirar `px` do Container pai da lista | y |
| FlatList prop forwarding | Tipar como genérico sobre `FlatListProps` do RN (`Omit` só do que a molécula controla internamente: merge de `contentContainerStyle` + separator default); demais props pass-through | Pedido “expor outras props para adaptar” | y (user) |
| Dimensões implícitas (auth, retry, concurrency, TTL, observability, external deps, state machine) | N/A — UI tipada no DS + adapter de lista | Sem backend/state nesta feature | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Divider atom ⭐ MVP

**User Story**: As a developer, I want a typed Divider atom with horizontal and vertical orientation so that cards and layouts share one separator instead of ad-hoc borders.

**Why P1**: Dependência direta do layout do RepoItem; pedido explícito.

**Acceptance Criteria**:

1. WHEN Divider is rendered with `orientation="horizontal"` (or omitted) THEN it SHALL render a 1px-tall full-width line using `theme.colors.border` (no hardcoded hex)
2. WHEN Divider is rendered with `orientation="vertical"` THEN it SHALL render a 1px-wide line that stretches to the cross-axis height of its parent using `theme.colors.border`
3. WHEN Divider public props are inspected THEN orientation SHALL be typed as `'horizontal' \| 'vertical'` via object-map styling (AD-013; no `switch` for chrome)
4. WHEN Divider is shipped THEN it SHALL live under `packages/ds/atoms/Divider/` with AD-012 files (`index.ts`, `Divider.tsx`, `styles.tsx`, `Divider.stories.tsx`, colocated `__tests__`) and SHALL be exported from `@ds/atoms` / package barrel
5. WHEN Divider is opened in Storybook THEN at least one story SHALL cover horizontal and vertical
6. WHEN Divider is shipped THEN colocated Jest + RNTL tests SHALL assert both orientations and `testID="ds-divider"`

**Independent Test**: Storybook Divider + `pnpm test` path for Divider alone (no RepoItem required).

---

### P1: RepoItem organism (layout do mock) ⭐ MVP

**User Story**: As a developer, I want a store-free RepoItem organism that matches the card mock so that search (and future lists) render repos consistently.

**Why P1**: Entrega visual principal da feature.

**Acceptance Criteria**:

1. WHEN RepoItem is rendered with `name` THEN it SHALL show the name in the title region using Typography heading, displayed in Capitalize (Title Case) form
2. WHEN `description` is a non-empty string THEN RepoItem SHALL show it below the title with muted body/caption tone; WHEN `description` is absent/empty/whitespace THEN the description block SHALL NOT render
3. WHEN `languages` has one or more items THEN RepoItem SHALL render each as a `Badge` (forwarding optional `swatch`); WHEN `languages` is absent or empty THEN the badges row SHALL NOT render badges (layout may still show avatar)
4. WHEN `ownerName` is provided THEN RepoItem SHALL render `Avatar` with `name={ownerName}` and `uri={ownerAvatarUrl}` aligned opposite the badges on the same row
5. WHEN the body and footer are both present THEN RepoItem SHALL separate them with the horizontal `Divider` atom
6. WHEN `stars` is provided THEN the footer SHALL show Icon star + numeric stars (accessible label including the count); WHEN `forks` is a number (including `0`) THEN the footer SHALL also show Icon fork + numeric forks after stars; WHEN `forks` is `undefined` THEN the fork stat SHALL NOT render
7. WHEN RepoItem is inspected THEN it SHALL NOT import `@/domain`, `@/stores`, or app layers; props SHALL be primitives (`name`, `description?`, `languages?`, `ownerName`, `ownerAvatarUrl?`, `stars`, `forks?`, optional `style` / `testID` per AD-028)
8. WHEN RepoItem is shipped THEN it SHALL live under `packages/ds/organisms/RepoItem/` (AD-012) and SHALL be exported from `@ds/organisms` / package barrel
9. WHEN RepoItem is opened in Storybook THEN stories SHALL cover: full props, missing description, empty languages, missing avatar uri (initials fallback)
10. WHEN RepoItem is shipped THEN colocated Jest + RNTL tests SHALL assert ACs 1–7 from these criteria (outcomes, not implementation details)

**Independent Test**: Storybook RepoItem + unit tests with fixture props; no navigation/network.

---

### P1: Presentation adapter `RepoListItem` ⭐ MVP

**User Story**: As a user on Search, I want each result row to use the new RepoItem card so that the list matches the design without duplicating layout in the screen.

**Why P1**: Fecha o uso real do organism; evita DS órfão.

**Acceptance Criteria**:

1. WHEN `RepoListItem` renders a `Repo` THEN it SHALL map domain fields into RepoItem props (`name`, `description`, `languages` from `language`, `ownerName`, `ownerAvatarUrl`, `stars`, and `forks` when present on the entity) and wrap with the existing press/`onPress(repo.id)` behavior
2. WHEN optional `description` / `language` / `ownerAvatarUrl` / `forks` are missing THEN the row SHALL still render without crashing (description/badges/fork stat omitted or avatar initials as defined by RepoItem)
3. WHEN existing `RepoListItem` tests run THEN they SHALL still pass after updating assertions to the new visible structure (name Capitalize, stars via icon+count, forks via icon+count when mapped, language via Badge when present)
4. WHEN SearchReposScreen lists repos THEN it SHALL continue using `RepoListItem` (no direct DS import of domain mapping in the screen beyond the adapter)

**Independent Test**: `RepoListItem` unit tests + SearchReposScreen list still navigates on press.

---

### P1: FlatList molecule ⭐ MVP

**User Story**: As a developer, I want a typed FlatList molecule that puts spacing on `contentContainerStyle`, defaults Spacer separators and performance props, and forwards the rest of the RN API so Search/Issues stop inventing list chrome.

**Why P1**: Pedido explícito; corrige anti-pattern de padding no Container pai; compartilhado por Search e Issues.

**Acceptance Criteria**:

1. WHEN FlatList is rendered with spacing props (`p` / `px` / `py` / `pt` / `pb` / `pl` / `pr`) THEN those values SHALL be applied via `contentContainerStyle` padding (token → px through `resolveBoxSpacing` or equivalent) and SHALL NOT set padding on the FlatList root `style`
2. WHEN spacing props are omitted THEN FlatList SHALL default horizontal content padding to `px="md"` (overridable)
3. WHEN `ItemSeparatorComponent` is omitted AND `separator` is not `false` THEN FlatList SHALL use Spacer (`top`, default size `lg`) as the item separator
4. WHEN `separator={false}` THEN FlatList SHALL not inject a default Separator (RN default / none)
5. WHEN `ItemSeparatorComponent` is provided THEN it SHALL override the default Spacer
6. WHEN FlatList mounts without overriding performance props THEN it SHALL apply defaults: `initialNumToRender={20}`, `onEndReachedThreshold={0.5}`, `windowSize={10}`, `maxToRenderPerBatch={10}`, `updateCellsBatchingPeriod={50}`
7. WHEN a consumer passes any of those performance props THEN the consumer value SHALL win
8. WHEN other RN `FlatList` props are passed (`data`, `renderItem`, `keyExtractor`, `onEndReached`, `ListHeaderComponent`, `style`, merged `contentContainerStyle`, etc.) THEN they SHALL be forwarded; consumer `contentContainerStyle` SHALL merge **after** the molecule padding (consumer can extend, not silently drop padding unless they override padding keys)
9. WHEN `loadingMore` is true THEN FlatList SHALL show a standard Loading in `ListFooterComponent` (`testID="ds-flat-list-footer-loading"`); WHEN `footerError` is a non-empty string AND not loadingMore THEN it SHALL show muted Typography with that message (`testID="ds-flat-list-footer-error"`)
10. WHEN `onRefresh` is provided THEN FlatList SHALL build `RefreshControl` internally using `refreshing` (default false) and theme primary tint; WHEN consumer passes `refreshControl` THEN that SHALL win
11. WHEN consumer passes `ListFooterComponent` THEN it SHALL override the built-in loadingMore/footerError footer
12. WHEN FlatList is shipped THEN it SHALL live under `packages/ds/molecules/FlatList/` (AD-012) and SHALL be exported from `@ds/molecules` / package barrel
13. WHEN FlatList is opened in Storybook THEN stories SHALL cover default padding+separator and at least one override (`separator={false}` or custom separator / custom `px`)
14. WHEN FlatList is shipped THEN colocated Jest + RNTL tests SHALL assert ACs 1–11 from these criteria

**Independent Test**: Storybook + unit tests with fixture data; no navigation.

---

### P1: Search + Issues adopt FlatList molecule ⭐ MVP

**User Story**: As a user on Search and Issues, I want lists to scroll with correct content padding so items aren’t clipped and spacing stays consistent.

**Why P1**: Fecha o uso real da molécula nas duas telas pedidas.

**Acceptance Criteria**:

1. WHEN `SearchReposScreen` renders the results list THEN it SHALL use `@ds/molecules` FlatList (not `FlatList` from `react-native` for that list) with Spacer/performance handled by defaults unless an override is required
2. WHEN `RepoIssuesScreen` renders the issues list THEN it SHALL use the same DS FlatList molecule
3. WHEN those screens wrap the list THEN they SHALL NOT double-apply the same horizontal padding on a parent Container **and** the list content (padding lives on the list `contentContainerStyle`)
4. WHEN existing SearchReposScreen / RepoIssuesScreen tests run THEN they SHALL still pass after updating imports/asserts as needed (`testID`s of lists preserved)

**Independent Test**: Screen unit tests for Search + Issues list paths.

---

### P1: Explore adopts RepoItem + FlatList ⭐ MVP

**User Story**: As a user on Explore, I want trending repos to use the same RepoItem card and list chrome as Search so the product feels consistent.

**Why P1**: Pedido explícito pós-ship; Explore ainda usa Typography solta + RN FlatList.

**Acceptance Criteria**:

1. WHEN `ExploreScreen` renders trending rows THEN each row SHALL use DS `RepoItem` (via shared domain→props mapping) showing Capitalize `name`, optional description, language Badge when present, owner Avatar, stars, and forks when defined
2. WHEN `ExploreScreen` renders the list THEN it SHALL use `@ds/molecules` FlatList (not RN `FlatList`) with default Spacer/perf/content padding; parent SHALL NOT double-apply horizontal `px` while the list is showing
3. WHEN a trending row is pressed THEN Explore SHALL navigate to Search stack `RepoDetails` with the opaque `repo.id` (no Linking / external URL)
4. WHEN ExploreScreen unit tests run THEN they SHALL assert RepoItem-visible outcomes (Title Case name, star/fork labels, language Badge), FlatList adoption, and press → details

**Independent Test**: `ExploreScreen.test.tsx` green.

---

## Edge Cases

- WHEN `description` is only whitespace THEN RepoItem SHALL treat it as absent (no description node)
- WHEN `languages` is `[]` THEN no Badge SHALL render
- WHEN `stars` is `0` THEN footer SHALL still show star icon + `0`
- WHEN `forks` is `0` THEN footer SHALL still show fork icon + `0`
- WHEN `forks` is `undefined` THEN footer SHALL omit the fork stat entirely (stars remain)
- WHEN `ownerAvatarUrl` fails to load THEN Avatar SHALL fall back to initials (existing Avatar behavior)
- WHEN `name` is a single token (e.g. `react`) THEN Capitalize SHALL still produce a display form with the first character uppercased
- WHEN Divider `orientation="vertical"` is used in a parent without bounded height THEN it SHALL still mount (layout stretch is consumer responsibility; tests cover horizontal primarily + vertical chrome presence)
- WHEN FlatList receives both `px="md"` and `contentContainerStyle={{ paddingHorizontal: 0 }}` THEN merged style SHALL follow RN array merge order documented in design (padding keys from consumer win if later in the array)
- WHEN FlatList has a single item THEN Separator SHALL not appear between items (RN behavior; no extra Spacer below)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| RITEM-01 | P1: Divider atom | Tasks | Pending |
| RITEM-02 | P1: Divider orientations + tokens | Tasks | Pending |
| RITEM-03 | P1: RepoItem title Capitalize | Tasks | Pending |
| RITEM-04 | P1: RepoItem optional description | Tasks | Pending |
| RITEM-05 | P1: RepoItem language Badges | Tasks | Pending |
| RITEM-06 | P1: RepoItem owner Avatar | Tasks | Pending |
| RITEM-07 | P1: RepoItem Divider + star/fork stats | Tasks | Pending |
| RITEM-08 | P1: RepoItem DS isolation props | Tasks | Pending |
| RITEM-09 | P1: Stories + unit tests Divider/RepoItem | Tasks | Pending |
| RITEM-10 | P1: RepoListItem adapter + Search wiring | Tasks | Pending |
| RITEM-11 | P1: FlatList molecule (content padding + Spacer + perf) | Tasks | Pending |
| RITEM-12 | P1: Search + Issues adopt FlatList | Tasks | Verified |
| RITEM-13 | P1: Explore adopts RepoItem + FlatList | Implementing | Pending |

**ID format:** `RITEM-NN`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 13 total (RITEM-13 amend)

---

## Success Criteria

- [ ] Divider horizontal e vertical catalogados no Storybook e cobertos por teste
- [ ] RepoItem reproduz a hierarquia do mock (título → descrição opcional → badges/avatar → divider → estrela+stars; fork+forks quando `forks` definido)
- [ ] Search lista usa RepoItem via adapter; testes de `RepoListItem` verdes
- [ ] FlatList molecule aplica padding só em `contentContainerStyle`, Spacer default, perf defaults; Search + Issues + Explore migrados
- [ ] Pacote DS continua isolado (sem imports de app/domain no organism/molecule)
