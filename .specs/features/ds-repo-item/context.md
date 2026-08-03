# DS RepoItem Context

**Gathered:** 2026-08-03
**Spec:** `.specs/features/ds-repo-item/spec.md`
**Status:** Done — Verifier PASS

---

## Feature Boundary

Atom `Divider` + organism `RepoItem` + molecule `FlatList` (padding em `contentContainerStyle`, Spacer default, perf defaults) em `packages/ds`; adapter `RepoListItem`; Search e Issues consomem a FlatList do DS.

---

## Implementation Decisions

### Capitalize do nome

- Title Case na UI (primeira letra de cada palavra maiúscula)
- Prop `name` permanece crua; transformação só na apresentação

### Badges de linguagem

- Prop DS `languages?: { label: string; swatch?: string }[]`
- Array vazio/ausente → nenhum Badge
- Adapter: `repo.language` → `[{ label }]` ou `undefined` (0\|1 item); domínio não muda

### Avatar do owner

- Incluir Avatar alinhado à direita da fileira de badges (como o mock)
- Props: `ownerName` + `ownerAvatarUrl?` (fallback iniciais do atom Avatar)

### Footer stats

- Estrela + `{stars}` sempre
- Fork + `{forks}` **condicional**: prop DS `forks?: number` — renderiza só quando `forks !== undefined` (inclui `0`); se ausente, omite o stat
- GitHub e GitLab já mapeiam `forks_count` → `Repo.forks`; adapter passa o valor quando a entidade o tiver
- Ordem quando ambos: stars → forks, à esquerda do footer
- Sem watchers ou data nesta fatia

### Press / interação

- RepoItem 100% presentational — sem `Pressable` / `onPress` interno
- `RepoListItem` continua wrapping press e chama `onPress(repo.id)`

### FlatList molecule (amend 2026-08-03)

- Padding **só** em `contentContainerStyle` (nunca no `style`/host externo) — best practice pedida
- `Spacer` como `ItemSeparatorComponent` default (`top`, size `lg`); `separator={false}` ou `ItemSeparatorComponent` custom override
- Defaults de performance pré-setados; props RN restantes encaminháveis
- Default `px="md"` no content; telas removem padding duplicado do Container pai da lista
- Usar em **SearchReposScreen** e **RepoIssuesScreen**

### Agent's Discretion

- Helper de Title Case (util DS vs inline): escolha na Design/Execute, desde que o AC de Capitalize passe
- Ícones Ionicons: estrela preenchida (`star`); fork via `git-network` ou `git-branch` (escolher o mais legível em sm)
- Densidade/spacing interno do RepoItem via tokens existentes (`spacing`, Card regions)
- Merge order de `contentContainerStyle`: `[moleculePadding, consumerStyle]`

### Declined / Undiscussed Gray Areas → Assumptions

- Separator size `lg`, perf numbers, default `px="md"`: confirmados na aprovação para Execute

---

## Specific References

- Mock visual: card arredondado, título bold, descrição muted, badge + avatar, divider horizontal, footer com ícone+número
- Screenshot em assets da sessão (Slack Integration card)
- Telas atuais: `ItemSeparatorComponent={() => <Spacer top size="lg" />}`, `initialNumToRender={20}`, `onEndReachedThreshold={0.5}`, parent `px="md"`

---

## Deferred Ideas

- Footer com watchers / data relativa (data exigiria `updatedAt` no domínio)
- Tabela canônica de cores por linguagem (GitHub linguist)
- Migração de Favoritos para RepoItem ou FlatList
- FlashList / SectionList
