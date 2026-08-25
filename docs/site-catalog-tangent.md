# Site Catalog — tangentenergy.com

**Source:** `https://www.tangentenergy.com/`
**Captured:** 2026-08-25 (live crawl + sitemap)
**Purpose:** migration-ready inventory of every page, grouped into templates, with
block analysis and a reuse-vs-new verdict per template. Applies the
templates+reusable-blocks methodology in
[`migration-conventions.md`](./migration-conventions.md); see also
[`migration-playbook.md`](./migration-playbook.md).

> **How this was gathered:** the site is behind a WAF that blocks scripted
> `curl` (403), so URLs were read from the published sitemap and every page was
> status-checked and structurally inspected through a real browser. Each URL
> below was individually fetched and its HTTP status + `h1` verified — nothing
> here is inferred from the sitemap alone.

---

## 1. Headline finding: the sitemap is stale

The sitemap (`/sitemaps/sitemap_en_US.xml`) lists **18 URLs**, but **8 of them
404** — they are aspirational/retired paths still in the sitemap. Only **10
resolve**. This matters for SEO (a sitemap advertising 404s is a crawl-quality
hit) and for migration scope (don't build importers for pages that don't exist).

**Recommend:** regenerate the source sitemap to drop the dead URLs (or, post-
migration, ensure the EDS sitemap only lists live pages — see
[`migration-conventions.md`](./migration-conventions.md) Section D).

---

## 2. URL inventory (all 18 sitemap URLs, verified)

| # | Path | HTTP | Live? | Page (h1/title) |
|---|------|------|-------|-----------------|
| 1 | `/en_US.html` | 200 | ✅ | Homepage — "Who is Tangent Energy Solutions?" |
| 2 | `/en_US/about-us.html` | 200 | ✅ | About Us |
| 3 | `/en_US/customer-segments.html` | 200 | ✅ | Testimonials and Resources |
| 4 | `/en_US/news.html` | 200 | ✅ | News |
| 5 | `/en_US/tangent-privacy.html` | 200 | ✅ | Privacy notice |
| 6 | `/en_US/tangent-privacy/tangent-privacy.html` | 200 | ✅ | Privacy (duplicate/nested) |
| 7 | `/en_US/sitemap.html` | 200 | ✅ | Site Map (link list) |
| 8 | `/en_US/search.html` | 200 | ✅ | Search (functional page) |
| 9 | `/en_US/search/search-results.html` | 200 | ✅ | Search results (functional) |
| 10 | `/en_US/404-error.html` | 200 | ⚠️ | 404 template page |
| 11 | `/en_US/eaas-solutions.html` | 404 | ❌ | dead |
| 12 | `/en_US/eaas-solutions/demand-design.html` | 404 | ❌ | dead |
| 13 | `/en_US/eaas-solutions/project-financing.html` | 404 | ❌ | dead |
| 14 | `/en_US/eaas-solutions/demand-design-plus.html` | 404 | ❌ | dead |
| 15 | `/en_US/eaas-solutions/tangent-amp.html` | 404 | ❌ | dead (note: live AMP page is `/en_US/tangent-amp.html`) |
| 16 | `/en_US/markets.html` | 404 | ❌ | dead |
| 17 | `/en_US/contact-us.html` | 404 | ❌ | dead (still linked from footer) |
| 18 | `/en_US/careers.html` | 404 | ❌ | dead |

**Not in the sitemap but referenced elsewhere** (from the earlier link audit):
`/en_US/meet-the-team.html` (live, already migrated), `/en_US/tangent-amp.html`
(live, already migrated), and the `/en_US/articles/blogs/*` +
`/en_US/articles/testimonials/*` detail pages linked from customer-segments
(these are dynamically listed, not in the sitemap — treat as a separate
article template if/when needed).

---

## 3. Template classification (live pages only)

| Template | Pages it covers | Status | Importer |
|----------|-----------------|--------|----------|
| `homepage` | `/en_US.html` | ✅ migrated | `import-homepage.js` |
| `about-us` | `/en_US/about-us.html` | ✅ migrated | `import-about-us.js` |
| `meet-the-team` | `/en_US/meet-the-team.html` | ✅ migrated | `import-meet-the-team.js` |
| `customer-segments` | `/en_US/customer-segments.html` | ✅ migrated | `import-customer-segments.js` |
| `tangent-amp` | `/en_US/tangent-amp.html` | ✅ migrated | `import-tangent-amp.js` |
| **`news`** | `/en_US/news.html` | ⬜ **new** | — |
| **`legal` (privacy)** | `/en_US/tangent-privacy.html` (+ nested dup) | ⬜ **new** | — |
| `sitemap` / `search` | `/en_US/sitemap.html`, `/search*` | ➖ platform pages | n/a — EDS generates sitemap; search is a feature, not authored content |
| `404` | `/en_US/404-error.html` | ➖ platform page | n/a — EDS has its own 404 handling |

**Bottom line:** 5 of the ~7 real content templates are **already migrated**.
Only **2 genuinely new content templates** remain (`news`, `legal`), and both
reuse existing blocks (see §4). The 8 dead URLs need **no** migration.

---

## 3b. Block library (shared, across both brands)

The full block inventory in the repo. Blocks split into three roles: **content
blocks** (authored into pages, have an import parser), **structural blocks**
(chrome/utility — no parser, built from fragments or the framework), and the
**base blocks** the boilerplate ships. "Used by" is from `page-templates.json`
(both Tangent + Turner templates, since the library is shared).

### Content blocks (have an import parser)

| Block | Parser | Used by templates |
|-------|--------|-------------------|
| `page-hero` | ✅ | about-us, meet-the-team, customer-segments, tangent-amp, turner-home, turner-product-detail, turner-about, turner-knowledge-hub |
| `columns-media` | ✅ | homepage, tangent-amp, turner-home, turner-product-detail, turner-knowledge-hub |
| `cards-promo` | ✅ | homepage, about-us, turner-home |
| `resource-cards` | ✅ | customer-segments, turner-products, turner-knowledge-hub |
| `tabs` | ✅ | tangent-amp, turner-product-detail |
| `cards-feature` | ✅ | turner-home |
| `hero-media` | ✅ | homepage |
| `profiles` | ✅ | meet-the-team |
| `timeline` | ✅ | turner-about |

### Structural / chrome blocks (no import parser — built from fragments or framework)

| Block | Role |
|-------|------|
| `header` | Nav — decorated from the per-brand `nav` fragment |
| `footer` | Footer — decorated from the per-brand `footer` fragment |
| `breadcrumb` | Site-wide breadcrumb, auto-built from URL/nav |
| `fragment` | Cross-block fragment loader (the one allowed cross-block import) |

### Base blocks (boilerplate defaults, retained)

| Block | Note |
|-------|------|
| `cards` | Base for `cards-promo` / `cards-feature` / `resource-cards` |
| `columns` | Base for `columns-media` |
| `hero` | Base for `hero-media` / `page-hero` |
| `widget` | Boilerplate utility block |

**Totals:** 17 blocks — **9 content (all with parsers)**, 4 structural, 4 base.
Every content block is already reused across ≥1 template, several across both
brands — confirming the shared library is doing its job.

---

## 4. Block analysis for the new templates

### `news` — `/en_US/news.html`
Structure observed:
- **page-hero** — "News" heading over a banner image. → **reuse** `page-hero`
  parser (exists).
- **article-teaser list** — ~9 items, each = `h2` headline + one or more body
  paragraphs + an external "Read Full Article / Read the full story" link.
  → **reuse** `cards-promo` (heading + text + CTA) or `columns-media` depending
  on desired layout; no new parser needed. Links are **external** (equipmentjournal,
  utilitydive, greentechmedia, etc.), so the internal-link rewrite doesn't apply
  — verify they're preserved as absolute `http(s)` links.

**Verdict:** new **import script only** (`import-news.js`); **0 new blocks**.

### `legal` — `/en_US/tangent-privacy.html`
Structure observed:
- Long-form prose: `h1` + headings + paragraphs (default content), no cards,
  no teasers, no tables. The two `<form>` hits are the site search + cookie
  widget (chrome, stripped by the cleanup transformer), **not** page content.

**Verdict:** new **import script only** (`import-legal.js`), essentially default
content (headings + paragraphs). **0 new blocks.** The nested
`/tangent-privacy/tangent-privacy.html` is a duplicate — migrate once.

> Note: `sitemap.html`, `search*.html`, and `404-error.html` are **platform
> concerns**, not authored pages — EDS generates its own sitemap, search is a
> feature, and 404 handling is built in. Do not migrate them as content.

---

## 5. New work required (honest, minimal)

To complete tangentenergy.com beyond what's already migrated:

- [ ] `import-news.js` — new template; reuses `page-hero` + `cards-promo`/`columns-media`. **No new block.**
- [ ] `import-legal.js` — new template; mostly default content. **No new block.**
- [ ] (Optional) article-detail template for `/articles/blogs/*` and
      `/articles/testimonials/*` **if** those pages should exist as destinations
      (they're currently linked but were flagged as 404s in the link audit —
      decide migrate vs. redirect vs. remove per
      [`migration-conventions.md`](./migration-conventions.md) Section E).
- [ ] Fix the source/EDS **sitemap** to stop advertising the 8 dead URLs.
- [ ] Decide the fate of dead-but-linked `/contact-us` (footer links to it) —
      migrate a contact page or repoint the footer link.

**Effort:** ~2 small import scripts, **zero new blocks/parsers** — the existing
shared library covers everything. This is the templates+reusable-blocks model
working as intended: the whole remaining site is theme + content over blocks
that already exist.

---

## 6. Reuse scorecard

- **Templates:** 5 existing / 2 new (both reuse blocks) / 8 dead (skip) / 4 platform (skip).
- **Blocks:** 17 in the shared library (9 content w/ parsers, 4 structural, 4
  base — see §3b). **0 new** required for this site — `page-hero`, `cards-promo`,
  `columns-media`, and default content cover the new pages.
- **Transformers:** reuse `tangentenergy-cleanup` (strips the cookie/search
  chrome seen on every page) and `tangentenergy-links` (news links are external,
  so mostly a no-op there).

This confirms the scaling premise: onboarding the rest of this site is a couple
of URL-list-driven import scripts, not a proliferation of tooling.
