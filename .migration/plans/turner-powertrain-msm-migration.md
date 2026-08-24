Let me investigate the likely SEO issues read-only before writing the plan.Bash is disabled in plan mode. Let me use the read-only tools.I have enough to build an accurate plan. Key SEO findings from inspection:

1. **No `<meta name="description">` support in `head.html`** and the products page has **no Description** in its metadata block (only Title) — a Lighthouse SEO auto-fail.
2. **Images with alt="Image without alt text"** on the products PLP (the sentinel leaked as visible alt) — accessibility/SEO alt-text failure.
3. **Interior page links point to source paths** (`/en_US/products/c90.html`) instead of migrated brand paths (`/turner-powertrain/en-us/...`) — crawlable-links / valid-hrefs concern, and they 404 in this structure.
4. **Nav/footer links** on Tangent still mix `/en_US/...` source paths.
5. No canonical/lang confirmation, no `robots`/sitemap.

Let me check one more thing — whether the EDS `aem.js` auto-emits title/description/canonical from the metadata block (it does via `decorateTemplateAndTheme`/head handling), to be precise about what's actually missing vs. what the platform provides.# Turner + Tangent — SEO Score Remediation Plan

## Goal
Diagnose why the PR's Lighthouse/PSI **SEO score dropped to ~45/100** and fix what's fixable in this repo (content + code), so both brands pass the SEO audit. This is a focused SEO pass on top of the completed multi-brand migration.

## Findings (from read-only inspection)

EDS generates `<title>`, `<meta name="description">`, canonical, and lang **at publish time** from each page's **metadata block** + `head.html`. So SEO failures trace to (a) missing/empty metadata in content, (b) missing alt text, (c) invalid/uncrawlable links, and (d) `head.html` gaps. What I found:

1. **Missing meta descriptions** — the **Products PLP** (`products.plain.html`) has a `metadata` block with **Title only, no Description**. Lighthouse "Document does not have a meta description" is a hard SEO fail. Need to audit every page; any without a Description fails.
2. **Bad alt text** — the Products PLP images render `alt="Image without alt text"` (the empty-alt **sentinel leaked as visible alt**). Lighthouse "image elements do not have `[alt]`" / poor-quality alt. Product images should have real alt (e.g. "C90").
3. **Links to non-existent source paths** — interior links point at `/en_US/products/c90.html`, `/en_US/knowledge-hub.html`, etc. In the MSM structure the real paths are `/turner-powertrain/en-us/products/c90`. These are **broken/uncrawlable links** (Lighthouse "links are not crawlable" + they 404), which drags SEO and is a real navigation defect. Applies to nav, footer, cards-promo/resource-cards CTAs, and CTA-band links across both brands.
4. **`head.html` is minimal** — no `<meta name="description">` placeholder, **no canonical link**, no lang attribute wiring, no Open Graph/Twitter tags. EDS injects title/description from metadata, but confirm the description path works and add canonical/OG for a fuller score.
5. **`<html lang>`** — set to hardcoded `'en'` in `scripts.js`; fine for en_US, but worth confirming it's present at first paint for the "html has lang" audit.
6. **Stray non-content text** — "list-per-page" leaked into the Products PLP body (minor content-quality noise).

> Note: the PR's SEO number is measured against the **deployed preview URL**, which I can't run Lighthouse against from here. This plan fixes the concrete, known SEO-failing items found in the source; the exact score delta is confirmed by re-running the PR check after the fixes.

## Approach
- Prefer fixing **at the source** (parsers/transformers + metadata generation in the import scripts) so re-imports stay correct — not hand-editing `.plain.html` (also blocked by the content guardrail; content is regenerated via import).
- Ensure every page's import emits a **Description** (fall back to first paragraph / page intro when the source lacks one).
- Fix the **alt sentinel** → use real alt (product/name) in the resource-cards/cards parsers.
- Normalize **internal link hrefs** to migrated brand paths at import (transformer), so links resolve and are crawlable.
- Enhance `head.html` with canonical + description + basic OG, if not already emitted by the pipeline.

## Checklist

### A. Diagnose precisely
- [ ] Audit every `content/**.plain.html` for a `metadata` block **with a non-empty Description** (list the misses)
- [ ] Audit for `alt="Image without alt text"` / empty alt across all pages
- [ ] Audit internal link hrefs that still point to source paths (`/en_US/...`, `*.html`) vs migrated brand paths
- [ ] Confirm what the EDS pipeline auto-emits (title/description/canonical) vs what `head.html` must add
- [ ] (If possible) re-run the PR's Lighthouse/PSI SEO check to capture the baseline breakdown

### B. Metadata / descriptions
- [ ] Ensure each import script emits a **Title + Description** metadata block; add a Description fallback (first intro paragraph) where the source has none — fixes Products PLP and any others
- [ ] Re-import affected pages; verify Description present

### C. Alt text
- [ ] Fix the resource-cards/cards parsers so images get **real alt** (product name / card title), not the empty-alt sentinel
- [ ] Re-import; verify no `alt="Image without alt text"` remains

### D. Crawlable / valid internal links
- [ ] Add/extend a transformer (or parser step) to rewrite internal `/en_US/…(.html)` hrefs → `/{brand}/en-us/…` migrated paths at import
- [ ] Apply across nav, footer, cards-promo, resource-cards, columns-media CTA bands (both brands)
- [ ] Re-import; verify links resolve (no 404) and are static `<a href>` (crawlable)

### E. `head.html` SEO tags
- [ ] Add canonical link + confirm `<meta name="description">` is emitted; add basic Open Graph/Twitter tags
- [ ] Confirm `<html lang>` is set early
- [ ] Keep the existing CSP/Trusted-Types intact

### F. Verify
- [ ] Re-preview representative pages (Turner home, products, c90, knowledge-hub; a Tangent page) — check meta description, alt text, working links in DOM
- [ ] Lint clean (eslint/stylelint) on any changed JS/CSS
- [ ] Re-run the PR SEO check and confirm the score recovers; note any platform-level items (measured on deploy) that can't be verified locally

## Open questions (to confirm before executing)
- **Internal link strategy:** rewrite source `/en_US/...` links to **migrated brand paths** (`/turner-powertrain/en-us/...`) so they work in this repo/preview? (Recommended — fixes both SEO crawlability and real 404s.) Or leave hrefs as-is because a redirect/rewrite will be configured at tools.aem.live?
- **Scope now:** fix **all** SEO items (metadata + alt + links + head.html), or only the highest-impact subset first (descriptions + alt + links) and defer OG/canonical?

## Notes
- The `aem.js` DM-dispatcher question from the previous plan is resolved separately (moved to `scripts/dm.js`; `aem.js` pristine) — not part of this SEO pass.
- Orphaned pre-MSM `content/` files still await a manual `git rm` (guardrail blocks deletion here); they shouldn't affect the PR's SEO score but should be removed to avoid duplicate-content noise.

> **This artifact is prepared in Plan mode.** Executing the fixes (updating parsers/transformers/import scripts, `head.html`, re-importing, and re-verifying) requires **Execute mode**. Confirm the two open questions above (or say "proceed with recommendations") and approve to begin.
