# Migration Kickoff — single entry point

**Feed this at the start of any new migration.** It lists the inputs *you* provide
and points to the rules I follow. Goal: **maximum reuse, minimum new blocks.**

This is an index, not a copy — the depth lives in the linked docs.

---

## 1. Inputs you provide at kickoff

- [ ] **Brand slug** (e.g. `mak-global`) and **production domain(s)** (apex + www).
- [ ] **Scope** — a homepage URL, an explicit URL list, or "whole site" (I'll read the sitemap).
- [ ] **Theme source** — the source site URL (I derive tokens) or an explicit token set.
- [ ] **Known source-selector → block/variant mappings** (optional but valuable) — anything you know about the CMS, e.g. "`.hero-carousel` is a hero." I add these to the block-signature registry.
- [ ] **Any page-type quirks** you already know (forms, carousels, data tables, etc.).

## 2. The kickoff flow

1. **Scope** — read sitemap, verify each URL (live vs 404), capture structure + markup per page.
2. **Detect reuse deterministically** — consult [`../tools/importer/block-signatures.json`](../tools/importer/block-signatures.json): source classes → block (+ variant). Unmatched regions → new-block candidates.
3. **Template Reuse Report (report-first gate)** — page→template map, templates reused vs new (with structural justification for any new), blocks to create, blocks used per page, reuse scorecard. **I STOP for your approval here.**
4. **On approval** — build/extend importers (per-template, reusing parsers), run import, verify both viewports, lint, stage.

## 3. The rules I apply (pointers)

All detail in [`migration-conventions.md`](./migration-conventions.md):

- **Template = STRUCTURE, not blocks** (§1a). New template ONLY for a genuinely new structural shape; add/remove/replace/substitute blocks ⇒ same template.
- **Report-first gate** (§1b) — never silently create a template; report + approval before migrating.
- **What "template" means in EDS + do we need `tools/`** (§1c) — per-type not per-page; importer is build-time tooling.
- **Block folding — one flexible block + variants** (see below and the conventions doc): `hero`, `cards`, with `columns-media` as the reference flexible block.
- **Block-signature registry** — [`../tools/importer/block-signatures.json`](../tools/importer/block-signatures.json); the operational form of reuse-before-create.
- **MSM multi-brand + theming** (§2, §4) and [`msm-multi-brand.md`](./msm-multi-brand.md) — per-brand folders, `brand.js` (`BRANDS`/`BRAND_HOSTS`), `tokens-{brand}.css`, fragment link normalization.
- **SEO / a11y / performance / responsive / pre-PR** (§5, §F, §G, §H) — incl. the staging-`noindex` cap being host-imposed.
- **Deploy model + gotchas** (§A, §7) — code ships via git→main, content via DA; DM images via `scripts/dm.js`; block CSS never defines `:root` tokens.
- **Rebuild specs** — [`rebuild-specs.md`](./rebuild-specs.md): if the repo is docs-only (no code carried), reconstruct `brand.js`, `loadBrandTokens`, `dm.js`/`__dmRender__`, and folded `hero`/`cards` from these self-contained build specs.

> Note: a **structure audit / Template Reuse Report is a per-migration OUTPUT** you
> generate for each site — not an input to copy. (This repo's `template-audit.md`
> is one such output, kept as history; don't carry it into a fresh repo.)

## 4. Blocks & variants — the naming rule (important)

**One block = one name = one folder, everywhere** (repo, DA, importer, catalog). Variations are **variants**, expressed as the block's parenthetical second word — NOT new blocks:

| Family | Block name | Authored in DA as | Variants |
|--------|-----------|-------------------|----------|
| Hero | `hero` | `Hero`, `Hero (media)`, `Hero (page)`, `Hero (carousel)` | media / page / carousel / cta |
| Cards | `cards` | `Cards (promo)`, `Cards (feature)`, `Cards (resource)` | promo / feature / resource |
| Columns/teaser bands | `columns-media` | `Columns-media` | checkerboard / full-width (already flexible) |

- A source `hero-carousel` maps to the **`hero`** block, `carousel` variant — never a `hero-carousel` block.
- Prefer **one flexible block per family** (content-driven + variants). Create a new block only when a region has **no** existing family and **no** signature match.

## 5. What "good" looks like at the end

- Template count ≈ number of distinct **structures**, not pages/brands.
- New blocks ≈ 0 for a same-platform brand (reuse via signatures); only genuinely-new patterns (e.g. a form) add a block — and only after the report-first approval.
- Clean per-brand theme (tokens) + shared blocks; clean URLs (no `/content` leak); SEO/a11y/perf checklists satisfied.

## Reference docs (authoritative EDS guidance)
See the "Reference docs" section of [`migration-conventions.md`](./migration-conventions.md) — includes `https://www.aem.live/llms.txt` and deep links (block collection, redirects, metadata, performance).
