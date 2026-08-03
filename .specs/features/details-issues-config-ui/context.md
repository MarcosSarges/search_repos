# Details / Issues / Config UI Context

**Gathered:** 2026-08-03
**Spec:** `.specs/features/details-issues-config-ui/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Reestilizar `RepoDetailsScreen`, componentizar a lista de issues no padrão `RepoItem` (com domínio enriquecido a partir das APIs), e redesenhar `ConfigScreen` em settings rows — sem form de token SecureStore, sem mover o toggle de fonte para Config, sem novo organismo de details no DS.

---

## Implementation Decisions

### Details — composição (hero denso)

- Layout **na tela** (`RepoDetailsScreen`) — **não** vira organismo no DS
- Hero: avatar grande + `fullName` + owner
- Métricas: **stars + forks + watchers**, cada uma com ícone + label/count
- Ícones alinhados ao `RepoItem`: `star`, `git-network`; watchers usa ícone de olho do set Ionicons já suportado pelo atom `Icon` (ex. `eye` / `eye-outline` — Design escolhe o nome exato)
- Description quando presente; Hyperlink “Abrir no site”; CTA “Ver issues”
- Loading / error / retry existentes permanecem

### Issues — IssueItem + domínio

- Organismo DS **`IssueItem`** no **mesmo padrão visual/composição do `RepoItem`** (Card + body + divider + footer stats; props primitivas; store-free; AD-012/AD-029)
- Adapter fino em presentation (`IssueListItem`) mapeia `Issue` → props do organism
- **Mais infos** exigem enriquecer o domínio com campos disponíveis nas duas APIs (ver Specific References)
- Título continua abrindo URL externa via `Hyperlink` (composição DS, como hoje)
- Sem expandir para body completo / assignees nesta fatia

### Config — settings rows

- Layout tipo **settings row**: ícone + título + subtítulo + controle/trailing
- Row de **tema** (toggle light/dark — comportamento atual)
- Row **só leitura** da **fonte ativa** (GitHub / GitLab label); **sem toggle** — toggle permanece no `SessionSourceHeader`
- Row de **token** continua **placeholder** “Em breve” (sem SecureStore / TextInput / setToken)
- Molecule reutilizável de settings row no DS fica a critério do Design (preferível para AD-009)

### Aesthetic

- Dentro dos tokens/tema atuais (primary por fonte, light/dark)
- Hierarquia mais clara e denser chrome de produto — não redesign de marca global
- Evitar estética genérica “AI purple”; manter linguagem do DS existente

---

## Agent's Discretion

- Nome exato do ícone Ionicons para watchers (`eye` vs `eye-outline`)
- Se Config extrai molecule `SettingsRow` (ou nome equivalente) vs composição só na tela — preferir molecule se reduzir duplicação
- Layout interno exato do hero Details (gap/spacing) desde que cumpra hero + métricas com ícones
- Como renderizar `state` no IssueItem (Badge vs Typography + swatch) desde que open/closed fiquem distinguíveis
- Filtrar PRs do endpoint GitHub de issues (recomendado — ver assumptions)

---

## Declined / Undiscussed Gray Areas → Assumptions

| Area | Chosen default | Rationale |
| ---- | -------------- | --------- |
| Aesthetic extremo / tipografia custom | Manter tokens tipográficos atuais (AD-015) | Fora do pedido; polish dentro do DS |
| Assignees / body / milestone na Issue | Fora desta fatia | Escopo “mais infos” limitado a campos de lista densos e cross-provider |
| Data relativa no row | Preferir `updatedAt` relativo no meta; `createdAt` permanece na entidade | “Mais infos”; updated é o sinal mais útil em listas |

---

## Specific References

### APIs — campos confirmados (amostra live 2026-08-03)

**GitHub** `GET /repos/{owner}/{repo}/issues` inclui (além do que já mapeamos): `state` (`open`\|`closed`), `comments` (number), `updated_at`, `closed_at`, `assignees`, `pull_request?` (presente em PRs misturados na lista).

**GitLab** `GET /projects/:id/issues` inclui: `state` (`opened`\|`closed`), `user_notes_count`, `updated_at`, `closed_at`, `assignees`, `upvotes`/`downvotes` (GitLab-only).

**Mapeamento de domínio nesta feature (mínimo comum):**

| Domain | GitHub | GitLab |
| ------ | ------ | ------ |
| `state: 'open' \| 'closed'` | `state` (`open`/`closed`) | `state` (`opened`→`open`, `closed`→`closed`) |
| `comments: number` | `comments` | `user_notes_count` |
| `updatedAt: string` | `updated_at` | `updated_at` |

Referências: [GitHub Issues REST](https://docs.github.com/en/rest/issues/issues), [GitLab Issues API](https://docs.gitlab.com/api/issues/).

### Product references

- `RepoItem` (`packages/ds/organisms/RepoItem`) — padrão de card/lista a espelhar
- Config atual: tema + placeholder token; fonte **não** é toggle na Config (RDI-04 / AD-026)

---

## Deferred Ideas

- UI real de token SecureStore (credentials feature)
- Assignees / body / reactions / upvotes no Issue
- Organismo `RepoDetails` no DS (explicitamente rejeitado)
- Toggle de fonte na Config (rejeitado — fica no header)
- Tipografia custom / expo-font
