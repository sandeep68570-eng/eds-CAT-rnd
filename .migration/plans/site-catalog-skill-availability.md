# Section Fidelity + Variant Authoring/Discovery Docs (docs-only)

## Answering your DA-authoring question first (this shapes the doc)

**How authors author a variant in DA, and how it maps to code:**
- In a Document Authoring table, the **block name cell** carries the variant in **parentheses**: the author types **`Hero (contained)`** (or `Cards (promo)`, etc.) instead of just `Hero`.
- EDS's block loader parses that: the first word → block folder/name (`hero`), and each additional word inside the parens → a **CSS class token**. `Hero (contained)` renders `<div class="hero contained">`.
- The block's **`hero.js`** reads `block.classList` (e.g. `block.classList.contains('contained')`) to branch behavior, and **`hero.css`** styles `.hero.contained { … }`. So the parenthetical label **is** the mapping — author text → class → JS/CSS branch. No separate config.
- Multiple variants combine: `Hero (contained, dark)` → `class="hero contained dark"`.

**Where variant knowledge lives (the real gap you spotted):** today variants are only discoverable by reading block code — authors can't know they exist. The fix is a **variant catalog** doc: for each block, the list of supported variants + what each does + the exact DA label to type. That's the single source authors *and* developers consult.

## What I'll add (docs-only, generic — no page/brand names)

1. **§I Section fidelity** (as agreed):
   - default content per section (keep heading/intro),
   - **block-shape / correct-block-selection** rule — pick the block whose *structure* matches the source region (a region with image+title+description+**button** is a hero/teaser-style block, **not** a two-column block). This directly covers your "Contact Us… should've been hero, not columns-media = wrong block selection" — generalized.
   - **element-completeness** rule with a **generic example**.
   - **visual variant** rule (look difference = CSS variant; port source computed styles into `.block.variant`).

2. **New `docs/block-variants.md` — the variant catalog** (authors + developers):
   - Per block: variant name, what it changes, **DA authoring label** (`Block (variant)`), and the class it produces.
   - A short **"how variant authoring works in DA"** intro (the mapping above).
   - Seeded with the current folded families (`hero`: default/media/page/contained…; `cards`: promo/feature/resource; `columns-media`) — marked which are built vs. planned.
   - Rule: **when a new variant is added in code, add it here** (and to the block-signature registry) so it's discoverable.

3. **Wiring:** `migration-conventions.md` §1d (folding) + kickoff link to `block-variants.md`; §H pre-PR gains element-completeness + correct-block-selection + variant-styling checks; AGENTS.md pointer to the variant catalog.

## Element-completeness rule (generic example, as you asked)
> *A block must capture every part the source region contains. Example: a promo/teaser region with an image, a title, a description, and a call-to-action button (linked) must import as a block that includes all four — image, heading, description, and the CTA link. If the button/link, description, or media is dropped, the block is incomplete — a fidelity defect to fix in the parser, not to ship.*

## Checklist
- [ ] Add **§I Section fidelity** to `migration-conventions.md`: default content + **correct-block-selection (shape match)** + **element-completeness (generic example)** + **visual-variant** rules — all generic
- [ ] Create **`docs/block-variants.md`**: how DA variant authoring maps to code (`Block (variant)` → class → JS/CSS), + per-block variant catalog (seed hero/cards/columns-media), + "add new variants here" rule
- [ ] Link `block-variants.md` from `migration-conventions.md` §1d, `migration-kickoff.md`, and `AGENTS.md`; add it to the starter-kit CARRY list
- [ ] Strengthen §H pre-PR checklist: per-block **element completeness + correct block selection + variant styling** vs source, both viewports
- [ ] Note in kickoff: Template Reuse Report records per-section default content, block **shape/selection**, and **variant**
- [ ] Keep all phrasing generic/forward-looking — no page/brand specifics
- [ ] `npm run lint` (docs-only → green); stage for your push
- [ ] (Deferred) any live-page re-import (e.g. re-select hero for a mis-mapped section, restore a dropped CTA) — separate approved step

## Notes
- **Docs-only, zero risk** — no content/import changes; live pages with the wrong block / dropped button stay as-is until you approve a re-import; docs prevent recurrence.
- The **variant catalog** (`block-variants.md`) is the durable answer to "how do authors/devs know variants exist and how to author them" — it's the missing discoverability layer, carried in the starter kit.
- "Wrong block selection" is folded into §I as **correct-block-selection (shape match)** — the same rule that says match structure, generalized.

> **Execution requires Execute mode.** Approve + switch to Execute and I'll: add §I (fidelity + correct-block-selection + element-completeness generic example + visual-variant), create `docs/block-variants.md` (DA authoring→code mapping + variant catalog), wire the links + §H checklist + kickoff/AGENTS/starter-kit pointers, lint, and stage. Live-page re-imports remain deferred.
