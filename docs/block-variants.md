# Block Variants — authoring & catalog

One block = one name = one folder. Visual/behavioral variations of the **same
structure** are **variants**, not separate blocks (see
[`migration-conventions.md`](./migration-conventions.md) §1d, §I). This doc is
the single place authors and developers learn **which variants exist** and
**how to author them**.

---

## How variant authoring works in DA (and how it maps to code)

- In a Document Authoring table, the **block-name cell** carries the variant in
  **parentheses**. An author types **`Hero (contained)`** instead of `Hero`.
- EDS's block loader parses that cell: the **first word** → the block
  folder/name (`hero` → `blocks/hero/`); each **word inside the parentheses** →
  a **CSS class token** on the block element.
  - `Hero` → `<div class="hero">`
  - `Hero (contained)` → `<div class="hero contained">`
  - `Hero (contained, dark)` → `<div class="hero contained dark">`
- The block's JS reads the classes to branch behavior
  (`block.classList.contains('contained')`), and its CSS styles the variant
  scope (`.hero.contained { … }`). **The parenthetical label IS the mapping** —
  author text → class → JS/CSS branch. There is no separate config.

**Rule for developers:** when you add or change a variant in a block's JS/CSS,
**update this catalog** (and the source-class mapping in
`tools/importer/block-signatures.json`) so authors can discover it and migrations
can auto-detect it.

---

## Variant catalog

Status legend: **built** = implemented in the block; **planned** = agreed
direction / go-forward fold, may not be implemented yet.

### `hero`
| Author in DA | Class | What it does | Status |
|--------------|-------|--------------|--------|
| `Hero` | `hero` | Default full-bleed banner | planned (fold) |
| `Hero (media)` | `hero media` | Media-dominant landing banner, no overlaid heading | planned (fold of `hero-media`) |
| `Hero (page)` | `hero page` | Interior banner: heading overlaid on image | planned (fold of `page-hero`) |
| `Hero (contained)` | `hero contained` | Centered, max-width (not full-bleed) — width from source computed styles | planned |
| `Hero (carousel)` | `hero carousel` | Rotating slides — **new behavior**, build before use | planned |

> Currently shipped as separate blocks `hero-media` + `page-hero`; the folded
> `hero` with variants is the go-forward standard (§1d). Until folded, author the
> existing block names.

### `cards`
| Author in DA | Class | What it does | Status |
|--------------|-------|--------------|--------|
| `Cards (promo)` | `cards promo` | Image + title + description + CTA cards | planned (fold of `cards-promo`) |
| `Cards (feature)` | `cards feature` | Borderless feature grid (image + heading + text) | planned (fold of `cards-feature`) |
| `Cards (resource)` | `cards resource` | Article/resource cards; whole card clickable | planned (fold of `resource-cards`) |

> Currently shipped as `cards-promo` / `cards-feature` / `resource-cards` (the JS
> is near-identical); the folded `cards` with variants is the go-forward
> standard.

### `columns-media`
| Author in DA | Class | What it does | Status |
|--------------|-------|--------------|--------|
| `Columns-media` | `columns-media` | Two-column media + text band | built |
| `Columns-media (checkerboard)` | `columns-media checkerboard` | Alternating image/text rows | built (via `parseTeaser`) |
| `Columns-media (full-width)` | `columns-media full-width` | Full-width CTA band | built (via `parseTeaser`) |

> Reference example of an already-flexible block — it absorbs multiple source
> patterns internally.

---

## Adding a new variant (checklist)

1. Decide it's a **variant, not a new block** — same structure, different
   look/behavior (§I rule 4). New structure ⇒ new block instead.
2. Implement: branch in the block JS on the variant class; scope CSS to
   `.block.variant`; for a visual variant, port the source's **computed styles**
   into that scope (don't guess values).
3. Register the source-markup signature → `block` + `variant` in
   `tools/importer/block-signatures.json` so migrations auto-detect it.
4. **Add a row to the catalog above** (DA label + class + what it does + status).
5. Verify in both viewports against the source.
