# Template Audit — structure-first re-classification

**Date:** 2026-08-25
**Rule applied:** templates are keyed on page **structure** (section skeleton /
layout regions and their order), not on which blocks they contain — see
[`migration-conventions.md`](./migration-conventions.md) §1a.

This audits the **existing 10 import templates** against the structure-first
rule and proposes consolidation. **Proposal only — no destructive change is
made here.** Applying it (merging templates, re-importing) requires explicit
approval.

## Current 10 templates, grouped by STRUCTURE

| Template | Blocks (what fills the regions) | Structure (region skeleton) |
|----------|-------------------------------|------------------------------|
| homepage | hero-media, columns-media, cards-promo | **Landing:** big hero → intro → content band(s) → promo cards |
| turner-home | page-hero, cards-promo, cards-feature, columns-media | **Landing:** hero → content band(s) → cards |
| about-us | page-hero, cards-promo | **Interior:** banner hero → content region(s) |
| meet-the-team | page-hero, profiles | **Interior:** banner hero → content region(s) |
| customer-segments | page-hero, resource-cards | **Interior:** banner hero → content region(s) |
| tangent-amp | page-hero, columns-media, tabs | **Interior:** banner hero → content region(s) |
| turner-about | page-hero, timeline | **Interior:** banner hero → content region(s) |
| turner-product-detail | page-hero, tabs, columns-media | **Interior:** banner hero → content region(s) |
| turner-knowledge-hub | page-hero, resource-cards, columns-media | **Interior:** banner hero → content region(s) |
| turner-products | resource-cards | **Listing:** single full-width card/list grid (no banner hero) |

## Structural verdict

By the structure-first rule, these 10 collapse to **3 distinct structures**:

1. **Landing** — `homepage`, `turner-home` (hero-led multi-band landing).
2. **Interior (banner hero → content regions)** — `about-us`, `meet-the-team`,
   `customer-segments`, `tangent-amp`, `turner-about`,
   `turner-product-detail`, `turner-knowledge-hub`. **7 templates, one
   structure** — they differ only in *which blocks* fill the content region
   (profiles vs resource-cards vs tabs vs timeline vs cards-promo), which under
   the rule is the **same** template.
3. **Listing** — `turner-products` (card grid, no banner hero).

## Proposal (NOT yet applied)

- [ ] **Consolidate the 7 Interior templates into one** `interior` template whose
      block list is the **union** of the blocks they use (`page-hero`,
      `cards-promo`, `resource-cards`, `tabs`, `timeline`, `profiles`,
      `columns-media`), with all blocks **optional/substitutable**. Each page
      just uses the subset it needs.
- [ ] **Keep** `landing` (merge homepage + turner-home if desired — both are
      hero-led landings; optional, lower value since there are only 2).
- [ ] **Keep** `listing` (`turner-products`) as its own structure.
- [ ] Result: **10 → ~3 templates** (or 4 if landing stays split by brand).

### Important caveats before applying

- **This is migration-time bookkeeping only.** The *output pages* and *content*
  are already correct and published; consolidating templates does **not** change
  any rendered page — it changes how future imports are classified/driven.
- **Re-import risk:** merging import scripts means re-running imports for those
  URLs. Only worth doing if you value the tidier classification or are about to
  migrate many more interior pages (where one `interior` template + a URL list
  is clearly better than seven near-duplicate scripts).
- **Recommended timing:** apply the consolidation **when the next batch of
  interior pages is migrated** (e.g. the Tangent `news`/`legal` pages and any
  new brand), so the re-classification and the new work happen in one pass —
  rather than a churn-only change now.

## Takeaway

The current set works, but it **over-templated the interior pages** (7 scripts
for 1 structure) — exactly the anti-pattern the structure-first rule prevents.
Going forward, interior pages of any brand should map to the single `interior`
template regardless of their block mix; new templates appear only for a
genuinely new structure (a new landing variant, a listing, a full-width
article, etc.).
