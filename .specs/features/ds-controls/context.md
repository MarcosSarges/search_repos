# DS Controls Context

**Gathered:** 2026-07-31
**Spec:** `.specs/features/ds-controls/spec.md`
**Status:** Spec confirmed — Design draft ready for approval

---

## Decisions (locked)

### Atomic classification (corrected vs prior out-of-scope wording)

| Piece | Level | Rationale |
| --- | --- | --- |
| Button | **Atom** | Primitive pressable; token variants/sizes; optional `leading` / `trailing` ReactNode slots do not promote it to molecule (same idea as Icon-capable controls elsewhere) |
| Input | **Atom** | Field chrome only: bordered text host + optional `leading` / `trailing` ReactNode. No label / error / helperText on this atom |
| InputField | **Molecule** | Variation that composes Typography (label, helper/error) + Input atom — enunciado §6.2 surface API |
| Card | **Molecule** | Compound layout regions; own surface/radius/border (does **not** wrap Container) |
| Badge / Avatar | **Out of this feature** | Deferred (same as prior DS deferral) |

### Button

- Variants: `primary` | `outline` | `ghost` (enunciado)
- Sizes: `sm` | `md` | `lg` (enunciado)
- States: `loading`, `disabled` (enunciado)
- Slots: optional `leading?: ReactNode`, `trailing?: ReactNode`
- No public `style` (AD-012 / enunciado §6.3)

### Input (atom)

- Role: main text-field container (border + layout) waiting for `leading` / `trailing`
- Slots named **`leading` / `trailing`** (`ReactNode`), not prefix/suffix
- Does **not** own label / error / helperText — those belong to molecules
- Controlled value API aligned with RN TextInput (`value` + change handler via rest / explicit props)

### InputField (molecule) — “variações”

- Wraps Input atom
- Exposes enunciado props: `label`, `value`, `error`, `helperText`
- Forwards / owns leading & trailing to the inner Input
- When `error` is set, helper copy shows the error (error wins over neutral helperText)
- Sets inner Input `state="error"` when `error` is a non-empty string

### Confirmed defaults (2026-07-31)

1. Molecule name: **`InputField`**
2. Non-empty `error` wins over `helperText` + drives Input error state
3. Input atom prop: `state?: 'default' | 'error'`
4. Button `loading` → Loading atom, blocks press, keeps min size

### Card (molecule)

- **Compound API:** `Card` + `Card.Header` + `Card.Content` + `Card.Footer`
- Visual chrome (surface, radius, border) is **Card’s own** — does not re-export or require Container
- Regions are compositional slots (children), not domain-aware

### Conventions inherited

- AD-004 theme + styled-components; AD-009 Atomic folders; AD-012 folder shape; AD-013 object maps; AD-017 atom patterns (tokens define variation; no public `style`; a11y defaults in composition file)
- Colocated Storybook + Jest/RNTL per piece
- Badge / Tag / Avatar + full in-app Showcase of those: **deferred**

---

## Deferred Ideas

- Badge / Tag
- Avatar
- In-app Showcase screen covering all §6.2 controls
- Input size variants (enunciado does not require; single chrome density for now)
- Focus-ring token beyond RN / platform defaults

---

## Rejected Alternatives

| Alternative | Why rejected |
| --- | --- |
| Input as molecule owning label+error+slots in one component | User: base Input is chrome-only; variations are separate molecules |
| Card built on Container | User: Card uses its own surface/radius/border |
| Prefix/suffix naming | User: `leading` / `trailing` |
| Include Badge/Avatar in this slice | User: defer |
