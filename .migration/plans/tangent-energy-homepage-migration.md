# Tangent Energy Site Migration Plan

## Goal
Migrate `tangentenergy.com` to AEM Edge Delivery Services with **reusable templates and infrastructure**. The homepage is done; now add a **site-wide breadcrumb** (auto-generated from site structure) and migrate the **four interior pages** linked from the header.

## On the breadcrumb question
Not skipped intentionally — breadcrumbs are a **site-wide navigation feature**, and the earlier scope was homepage body + header + footer. The homepage is the site root, so it typically shows no breadcrumb anyway. Now that interior pages are coming, a breadcrumb makes sense: build it **once** as a reusable auto-block so every current and future interior page gets it with **zero per-page authoring**.

## Breadcrumb approach (proposed — confirm options below)
- **Auto-generated** from the page's URL path (`/en_US/about-us` → Home / About Us), no per-page authoring.
- **Labels** resolved from the site nav (header links already map paths → labels, e.g. `customer-segments` → "Testimonials and Resources"), falling back to the page's H1/title.
- **Reusable auto-block**: injected into `scripts.js` `buildAutoBlocks` (like the DM auto-block) so it appears on every page automatically; hidden on the homepage.
- **Placement/style**: matched to the source — I'll inspect an interior page (e.g. about-us) to place and style it exactly.

## Interior pages to migrate (next)
1. `/en_US/about-us.html` — About Us
2. `/en_US/meet-the-team.html` — Meet the Team
3. `/en_US/customer-segments.html` — Testimonials and Resources
4. `/en_US/tangent-amp.html` — Tangent AMP

These reuse the existing `homepage` infrastructure where structure matches, and get new templates/variants only where they differ.

## Checklist

### A. Breadcrumb functionality (site-wide, reusable)
- [ ] Inspect an interior source page (about-us) to see the source breadcrumb's trail, labels, placement, and styling
- [ ] Decide trail/label source (see open question) — default: URL path + nav-label lookup, title fallback
- [ ] Create a reusable `breadcrumb` block (`blocks/breadcrumb/`) — JS builds trail from path, CSS matches source
- [ ] Wire an auto-block in `scripts/scripts.js` `buildAutoBlocks` so it renders on every interior page; hide on homepage
- [ ] Build a path→label map (seeded from nav) so labels stay correct as pages are added
- [ ] Verify on homepage (hidden) and on a migrated interior page (correct trail)

### B. Interior page migration (4 pages)
- [ ] Scrape each of the 4 URLs — cleaned HTML, metadata, images
- [ ] Analyze each page's structure; group into templates (reuse `homepage` infra where structure matches, else new template)
- [ ] Identify block variants — reuse `hero-media` / `columns-media` / `cards-promo` where they fit; create new variants only as needed
- [ ] Add block mappings for any new templates/variants
- [ ] Extend import infrastructure (parsers/transformers) for any new variants
- [ ] Generate/extend import script(s) and run the import for all 4 pages
- [ ] Confirm content files + images land under `content/`

### C. Design & styling for interior pages
- [ ] Reuse existing design tokens; style any new block variants to match source
- [ ] Ensure breadcrumb + header + footer render consistently across all 4 pages

### D. Preview & verify (all pages)
- [ ] Preview each interior page and the breadcrumb on the local dev server
- [ ] Compare each against its source (section-by-section)
- [ ] Fix divergences and re-verify

### E. Prior homepage polish (already applied — re-confirm)
- [x] Hero wide-banner art direction, intro H1 uppercase + accent bar, infographic native crop
- [ ] Re-check these still hold after interior-page work

## Open question (to confirm before executing)
- **Breadcrumb trail/label source**: (1) *Auto from URL path + nav labels, title fallback* — recommended, zero per-page authoring; (2) *Authored per page* — manual control; (3) *Auto from an EDS query-index* — robust but needs the index wired up. Also confirm whether it's **hidden on the homepage** (recommended) and whether to **match the source's exact placement** (I'll inspect an interior page).

> **Note:** This artifact is prepared in Plan mode. Executing it — inspecting interior source pages, building the breadcrumb block/auto-block, scraping and importing the 4 pages, styling, and visual verification — requires switching to **Execute mode**. I'll confirm the breadcrumb options above (via a quick question) at the start of execution if not already decided.
