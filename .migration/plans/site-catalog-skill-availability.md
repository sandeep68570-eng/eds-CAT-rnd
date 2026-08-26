# Confirm Variant Naming + Consolidate All Migration Inputs into One Kickoff Spec

## Q — "variants = still one block called `hero`, and in DA still `hero`?" — Yes, exactly right

- **One block, one folder:** `blocks/hero/` (`hero.js` + `hero.css`). There is a **single block named `hero`**.
- **In DA authoring it's still `hero`.** Variants are expressed as the **second word in the block name**, EDS's built-in mechanism: an author types the block as **`Hero`**, or **`Hero (media)`**, **`Hero (carousel)`**, **`Hero (page)`**. EDS turns that into classes `class="hero media"`, `class="hero carousel"`, etc., and `hero.js`/`hero.css` branch on the variant.
- So: **same block name everywhere** (folder, DA table, importer, catalog). Variant is just a parenthetical modifier — never a separate block. `hero-carousel` in the *source* site maps to the `hero` block with the `carousel` variant, **not** a new `hero-carousel` block.
- (Same for the cards fold: one `cards` block, authored `Cards (promo)` / `Cards (feature)` / `Cards (resource)`.)

## The bigger ask — a single "migration kickoff" input you feed at the start

You want everything we've discussed captured so that on a **fresh migration** you hand me these inputs up front and get **maximum reuse / minimum blocks**. Right now it's spread across several docs. I'll consolidate into **one authoritative kickoff spec** that references (not duplicates) the detail docs, so there's a single thing to feed me.

### What it will consolidate (everything relevant)
1. **Structure-first templates** — template = page structure, not blocks (§1a); new template only for a new structural shape.
2. **Report-first gate** — always produce the Template Reuse Report and stop for approval before migrating (§1b).
3. **Block folding rules** — one flexible block per family with variants: `hero` (media/page/carousel/CTA), `cards` (promo/feature/resource); `columns-media` as the reference flexible block. Variants ≠ new blocks.
4. **Block-signature registry** — `tools/importer/block-signatures.json`: source-selectors → block + variant (deterministic reuse detection); unmatched → new-block candidate.
5. **Reuse-before-create** — check registry + existing templates/blocks/parsers first.
6. **MSM/brand + theming** — per-brand folders, `brand.js`, tokens, fragment link normalization.
7. **SEO / a11y / perf / responsive / pre-PR** — the checklists already in the conventions doc.
8. **Deploy model + gotchas** — code vs content, DM images via `dm.js`, block CSS never sets `:root`, etc.

### The "feed me at kickoff" format
A concise **`docs/migration-kickoff.md`** = a checklist + the *inputs you provide* (brand slug, domains, URL list or sitemap, any source-selector→block mappings you know) + pointers to the detail docs. So starting a fresh migration = "read `migration-kickoff.md`, here are my inputs" → I run scope → report-first → you approve → migrate with max reuse.

One decision on how much to build now vs. leave as pointers:# Consolidated Migration Kickoff Spec + Block-Signature Registry

## Confirmed on naming (your first question)
- **One block, one name — everywhere.** `blocks/hero/` = a single `hero` block. In **DA it's authored as `Hero`**, with variants as the parenthetical second word: `Hero (media)`, `Hero (page)`, `Hero (carousel)`. EDS renders `class="hero media"` etc.; `hero.js`/`hero.css` branch on it.
- **Variants are never separate blocks.** A source `hero-carousel` → the `hero` block, `carousel` variant. Same rule for `cards` → `Cards (promo/feature/resource)`.
- The registry will encode source-class → **block + variant** on that basis.

## Confirmed approach (your two picks)
- **One kickoff spec that references detail docs** (no duplication) — the single thing you feed me at the start of a fresh migration.
- **Seed the block-signature registry now**, alongside the kickoff doc.

## What I'll create

### 1. `docs/migration-kickoff.md` — the single entry point
- **"Inputs you provide at kickoff"** checklist: brand slug + production domains, URL list or sitemap, any known source-selector→block/variant mappings, theme source (URL/tokens), scope (which pages).
- **The rules (as pointers, not copies):** structure-first templates (§1a) · report-first gate (§1b) · folding = one flexible block + variants (hero, cards; columns-media as reference) · block-signature registry · reuse-before-create · MSM/brand + theming · SEO/a11y/perf/responsive/pre-PR · deploy model + gotchas — each linking to the section/file with the detail.
- **The kickoff flow:** feed inputs → I scope + consult registry → **Template Reuse Report** → you approve → migrate with max reuse / min new blocks.

### 2. `tools/importer/block-signatures.json` — deterministic reuse detection
Seeded from **verified** DEG markup across Tangent/Turner/MAK: `hero` (page/media variants), `cards-*`→`cards` (promo/feature/resource), `columns-media` (checkerboard/full-width), `tabs`, `resource/list` (`.list--blog`, `subListItems`), `timeline`, `profiles`. Plus `_meta` (signatures qualify family; `instances` still address per page; unmatched → new-block candidate) and a marked **"add your selectors here"** area (e.g. `hero-carousel`).

### 3. Small wiring notes
- `docs/migration-conventions.md`: add the **block-signature registry** section + confirm the **variant naming** rule (one block, `Block (variant)` in DA).
- `tools/importer/README.md`: "scoping consults `block-signatures.json` first (reuse-before-create, deterministic)."

## Checklist
- [ ] Write `docs/migration-kickoff.md` (inputs-you-provide checklist + rule pointers + kickoff flow) — single entry point, references detail docs
- [ ] Create `tools/importer/block-signatures.json` seeded from verified markup; variants where folding applies (hero, cards); `_meta` + "add your selectors here"
- [ ] Add **Block-signature registry** + **variant-naming** (one block, `Block (variant)` in DA) sections to `docs/migration-conventions.md`
- [ ] Note registry-first scoping in `tools/importer/README.md`
- [ ] Include honest limits: registry flags *family*, not new *behavior* (a genuinely new variant like carousel may still need block work); signatures must be accurate; report-first gate still governs
- [ ] `npm run lint` (docs/JSON only → green); stage everything for your push

## Notes
- **Additive, zero risk:** new docs + JSON only. No block/importer/content changes, **no re-import**. Existing pages untouched. This purely sets up the *next* migration to maximize reuse.
- Only **verified** signatures seeded; anything uncertain marked `TODO` rather than guessed.
- This directly serves your goal: at restart you hand me `migration-kickoff.md` + your inputs, I apply structure-first + registry + folding + report-first → **maximum reuse, minimum new blocks**.
- Git: I stage; you commit/push. No `.agents/settings.json`/plugin changes.

> **Prepared in Plan mode — no files changed.** Approve + switch to Execute and I'll create `docs/migration-kickoff.md` and `tools/importer/block-signatures.json`, add the registry + variant-naming sections to the conventions doc and README, lint, and stage it all — so your next-from-scratch migration starts with these inputs baked in.
