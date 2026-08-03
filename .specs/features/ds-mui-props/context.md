# DS MUI Props Context

**Gathered:** 2026-08-03
**Spec:** `.specs/features/ds-mui-props/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Alinhar a API pública de props do Design System em `packages/ds` ao mental model do MUI (eixos claros: `color` / `bg` / `variant` / `size` / `width`), **sem** redesenhar tokens hex, tipografia ou spacing já existentes. Remover `tone`. Migrar consumers, stories e testes em big-bang. Documentar a motivação (padrão + ferramentas para montar telas) no README e superseder ADs que fixavam `tone` / Icon `variant`=size.

---

## Implementation Decisions

### A. Cor de conteúdo (Typography / Icon / mensagens)

- Prop pública: **`color`** (não `tone`, não `textColor`)
- Valores = **tokens atuais de conteúdo**: `text` | `muted` | `primary` | `danger`
- Union **fechado** nesses quatro (não abrir para todo `ColorToken`)
- Default: **`text`** (equiv. ao antigo `tone="default"`)
- Módulo/token `tone` e tipos `Tone` saem; mapa passa a ser color → color token (identidade ou rename do map)

### B. Superfície (Container / Card)

- Prop pública: **`bg`** (não `tone`, não `bgcolor`, não `color`)
- Valores: só **`background` | `surface`**
- Container: **sem default** — sem `bg` → fundo transparente / herda (não força `background`)
- **Card** alinha à mesma API `bg` nesta fatia

### C. Button — `variant` × `color`

- **`variant`** = como é renderizado (chrome): `contained` | `outlined` | `text`
- **`color`** = paleta do botão: `primary` | `success` | `warning` | `danger` (tokens já no tema)
- Mapeamento legacy → novo:
  - `primary` → `variant="contained"` + `color="primary"`
  - `outline` → `variant="outlined"` + `color="primary"`
  - `ghost` → `variant="text"` + `color="primary"`
- Default: `contained` + `color="primary"` (equiv. ao primary atual)
- Remover variants antigas `primary` | `outline` | `ghost` da API pública

### C′. Button — size, width, host

- **`size`**: manter tokens atuais `sm` | `md` | `lg`
- **`width?: 'hug' | 'full'`** — default **`full`**
- Pressable **não** vira atom/export separado; Button continua com o host atual (Pressable RN / styled)

### D. Escala (Icon / Loading / Logo / Typography)

- Prop de escala unificada: **`size`** em Icon, Loading e DataSourceLogo
- Valores: **manter** escalas atuais de cada token (Icon `xs`…`xl`; Loading `sm`|`lg`; Logo via `Size` atual)
- Loading: trocar prop `variant` → **`size`** (mesmo significado)
- Typography: **mantém só `variant` tipográfico** — sem prop `size` (AD-014 permanece para tipografia)

### E. Breaking change, docs, `style`, verificação

- Migração **big-bang**: remover `tone` e props antigas; atualizar todos os consumers numa fatia (sem aliases deprecados)
- Documentar supersessão de ADs relevantes (ex. AD-016, partes de AD-017) no **`.specs/STATE.md`** e no **`README.md`**
- Motivação a registrar: manter um padrão claro e dar mais ferramentas para o dev criar telas
- **Sem `sx`** / system props estilo MUI Box
- **Todo componente DS** deve aceitar **`style`** e repassar adiante (composição styled-components) para escapes pontuais — deixar de `Omit<…, 'style'>` onde isso bloqueia
- Stories e testes unitários do DS + consumers atualizam na mesma fatia; gate `pnpm test` verde com a API nova

### Agent's Discretion

- Nome exato do módulo token que substitui `tone.ts` (ex. `content-color.ts` / fold em `colors`)
- Detalhe visual de `contained`/`outlined`/`text` × `success`/`warning`/`danger` (mapas de chrome em styles, preservando look do primary atual)
- Comportamento preciso de “sem `bg`” no Container (transparent vs undefined background no styled)
- Wording exato das seções README / AD supersession (desde que cubram motivação + tabela de props)

### Declined / Undiscussed Gray Areas → Assumptions

| Gray area | Chosen default | Rationale |
| --------- | -------------- | --------- |
| Aliases MUI (`textPrimary`, `error`) | Não — só nomes de token | Usuário escolheu vocabulário Tokens |
| `color` de conteúdo inclui `success`/`warning` | Não nesta fatia | A fechou nos 4 atuais; success/warning só no Button |
| Extrair Pressable como atom DS | Não | Usuário em C′: manter como está |
| Default Container `bg` | Sem default | Confirmado em B |

---

## Specific References

- “Mais próximo do MUI” = eixos de props (`variant` vs `color`, `size`, largura), **não** copiar `sx` nem o visual Material
- `tone` chamado explicitamente de prop terrível — remover
- Tema já criado (cores brand/primary por fonte, neutrals, success/warning/danger) permanece a fonte de verdade visual
- `style` passthrough porque styled-components compõe — escape para casos muito específicos

---

## Deferred Ideas

- System props / `sx` estilo MUI Box
- Atom `Pressable` / `BaseButton` exportado no barrel
- Prop `size` tipográfico no Typography
- Aliases semânticos MUI (`textSecondary`, `error`) sobre os tokens
- Novos atoms (Badge, Avatar, …)
- Redesign de hex / tipografia / spacing scale
