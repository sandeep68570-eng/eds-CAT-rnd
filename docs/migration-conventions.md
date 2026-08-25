# Migration Methodology & Conventions

**Read this before migrating a new site, brand, or page in this repo.** It has
two parts:

1. **Migration Methodology** — the reusable *how* for onboarding new sites and
   scaling to thousands of pages without proliferating one-off tooling. This is
   the part an agent should apply on every new migration.
2. **Corrections (A–D)** — hard-won specific fixes with the *why* behind each,
   so they are not silently undone.

Companion docs: [`migration-playbook.md`](./migration-playbook.md) (end-to-end
workflow, commands, file map) and [`msm-multi-brand.md`](./msm-multi-brand.md)
(brand folders, clean URLs, theming). Don't duplicate those — link to them.

---

# Part 1 — Migration Methodology (scaling to many sites/pages)

## 1. Scaling model: templates + a shared block library (READ FIRST)

**You do not create tooling per page.** A site of 10,000 pages maps to a handful
of *templates* and a shared set of *blocks*. Get this right and the file count
stays flat as pages grow.

- **Import scripts are per-TEMPLATE, not per-page.** `import-<template>.js`
  migrates a whole page *pattern* (e.g. every product-detail page), driven by a
  URL list. Adding 1,000 pages of an existing type = adding URLs, **not** files.
- **Parsers are per-BLOCK and reused across brands/pages.**
  `parsers/resource-cards.js` runs anywhere that block appears. A new brand
  mostly **reuses** existing parsers.
- **Transformers are site-wide and brand-parameterized.** They take a `brand`
  field (e.g. `tangentenergy-links.js`) and are written once, reused everywhere.

**Reuse before create (hard rule):** before writing a new parser, block, import
script, or transformer, check whether an existing one already covers the
pattern. Only create a new *block variant* when the structure is genuinely new;
never duplicate a block per brand. Classify pages into templates first; the
number of import scripts should track the number of distinct *page types*, not
pages or brands.

## 2. MSM multi-brand setup (new brand onboarding)

- Content lives per brand at `/content/{brand}/{locale}/…`. Each brand maps its
  folder to its own site root in production (clean URLs, no `/content`, no brand
  segment). See [`msm-multi-brand.md`](./msm-multi-brand.md).
- To add a brand: add its slug to `BRANDS` and its production domain(s) to
  `BRAND_HOSTS` in `scripts/brand.js`; add a `styles/tokens-{brand}.css`; create
  its nav/footer fragments. `brandRoot()` handles per-environment fragment
  paths.
- **Store clean, brand-relative links in fragments — never bake `/content` into
  hrefs.** Fragments authored with `/content/{brand}/…` are normalized at
  runtime by `normalizeBrandLinks()` (in `brand.js`, called by header/footer):
  local dev keeps the `/content/{brand}` prefix; production strips it to root.
  Baking a fixed prefix into stored hrefs is wrong because the *same* string
  can't be literally correct in both environments — resolve it at runtime.

## 3. Component (block) reuse first

Survey the shared block library before building anything. Prefer an existing
block/variant; extend a parser rather than fork a block. New brands should be
almost entirely **theme + content** over the *same* blocks — that's the point of
the shared repo. If you're writing brand-specific block CSS or a near-duplicate
block, stop and reuse instead.

## 4. Token-based theming (brand skins over shared blocks)

- One `styles/tokens-{brand}.css` per brand defines the brand's design tokens
  (colors, fonts, nav/footer vars). `loadBrandTokens()` loads **only the active
  brand's** tokens at runtime — no cross-brand bloat.
- Derive token values from the source site (brand extraction), not guesses.
- **Block CSS consumes `var(--token)`; it must never define `:root` token
  values** (see Correction B — load order makes block `:root` override the
  theme). Themes are applied purely by swapping the token file.

## 5. SEO / Lighthouse checklist (every page)

- Meta **description** present (see Correction C); **alt** on every image
  (backfill from title/heading — Corrections C and page-hero); **canonical** and
  crawlable, clean internal links (no source `/en_US`, no dead 404s).
- **Staging `noindex` is host-imposed, not a defect.** `*.aem.page`/`*.aem.live`
  send `x-robots-tag: noindex` + `robots.txt: Disallow: /` by design, which
  fails Lighthouse's heavily-weighted "not blocked from indexing" audit and
  **caps the SEO score in the 60s–70s on staging**. This lifts only on the
  production CDN domain (correct `x-forwarded-host`, configured at
  tools.aem.live). Measure real SEO on production, not the PR's staging run; a
  low staging SEO number with all other audits green is expected.
- Fragments (`/**/nav`, `/**/footer`) → `noindex` + sitemap-excluded
  (Correction D).

## 6. Responsive (mobile / desktop) discipline

- Design desktop first, then verify mobile explicitly — don't assume.
- Mobile-only content is hidden on desktop and shown via `@media`; desktop-only
  likewise. Never let one viewport's markup leak into the other.
- Verify **both** viewports (e.g. 1440×900 and 375×812) before sign-off —
  nav/footer especially (hamburger, accordion, stacking, touch targets).

## 7. Deploy model (code vs content)

- **Code** (blocks, `scripts/`, `styles/`) ships via **git → merge to `main`**;
  CI runs `npm run lint` on it. **Content** publishes via **Document Authoring**
  separately. A page can return `200` yet look unstyled if the code isn't merged
  (see Correction A). Always confirm both tracks when a page looks wrong.

---

# Part 2 — Corrections (specific fixes, with the *why*)

## A. Rendering / EDS platform quirks

- **Dynamic Media / Scene7 images render through `scripts/dm.js` — never edit `scripts/aem.js`.**
  `scripts/aem.js` is vendored; its `createOptimizedPicture` is path-only and
  strips Scene7 `IS/Image` template params and DM Open API rendition params.
  The wrapper `scripts/dm.js` `optimizedPicture(src, ...rest)` delegates DM URLs
  to a renderer registered at `window.__dmRender__` (installed as an auto-block
  in `scripts/scripts.js`); non-DM URLs fall through to the vendored function.
  Blocks that build pictures import from `scripts/dm.js`, **not** `aem.js`.
  *Why:* keeps the vendored file pristine (per AGENTS.md) while preserving DM
  params at a single chokepoint. If DM images stop rendering, check that
  `dm.js` shipped and `__dmRender__` is registered — not `aem.js`.

- **`applySectionMetadata()` shim lives in `scripts/scripts.js`.**
  The vendored `aem.js` `decorateSections` does **not** process the
  section-metadata block, so section styles/backgrounds are applied by our shim.
  *Why:* removing it silently drops section styling; a module-load 404 on
  section-metadata is the tell.

- **Breadcrumb only builds on the real page `main`.**
  `buildBreadcrumb()` guards with `if (main !== document.querySelector('main')) return`
  because header/footer fragments re-trigger `buildAutoBlocks` (it rendered 3×
  before the guard). It is hidden on the homepage, and labels are normalized
  (`/en_US/` → `/en-us/`, lowercased) so nav paths match migrated paths.

- **Code ships by merging to `main`; content publishes separately.**
  A published page can return `200` yet look unstyled/imageless if the **code**
  (blocks, `scripts/brand.js`, `scripts/dm.js`, `styles/tokens-*.css`) is not on
  `main`. Symptom we hit: live page with no images, no header/footer wiring, no
  brand color = boilerplate code on `main`, our branch not merged. Fix is a git
  push/merge, not a content change.

---

## B. Theming / MSM multi-brand

- **One token file per brand: `styles/tokens-{brand}.css`.** `loadBrandTokens()`
  in the eager phase of `scripts/scripts.js` injects only the active brand's
  token file (skips the default brand, which is imported by `styles/brand.css`).
  *Why:* each brand downloads only its own tokens — no cross-brand CSS bloat.

- **`scripts/brand.js` is the single source of brand resolution.**
  `getBrand()` resolves hostname → path → default; `brandRoot()` returns the
  per-brand content root used to scope nav/footer/breadcrumb fragments. Add new
  brands to `BRANDS` and `BRAND_HOSTS` there.

- **Block CSS must NOT define `:root` token values.**
  Block CSS loads *after* the brand token file, so any `:root { --token: … }` in
  a block overrides the theme. This bit us on the header/footer (grey instead of
  branded) until the `:root` blocks were removed. Blocks may *consume*
  `var(--token)` freely; they must never *define* token values. Tokens are the
  sole source, defined only in `tokens-{brand}.css`.

- **Fragment links must be normalized at runtime, not baked with `/content`.**
  Nav/footer fragments are authored with `/content/{brand}/…` hrefs and img
  srcs. `normalizeBrandLinks(fragment)` in `scripts/brand.js` (called by
  `header.js` and `footer.js` before decorating) rewrites the `/content/{brand}`
  prefix to `brandRoot() + rest`: local dev keeps `/content/{brand}` (so
  `aem up` serves it), production strips it to the site root (`/en-us/…`).
  *Why:* the same stored href can't be literally correct both locally and in
  production, so it must be resolved per environment. External/anchor URLs are
  left untouched. If production URLs show a stray `/content/…`, this normalizer
  isn't being called on that fragment.

---

## C. Import / parser & transformer fixes

Content is always regenerated via the import scripts — never hand-edit files
under `content/`. These corrections live in the parsers/transformers so
re-imports stay correct.

- **CTA / teaser bands need the two-column `parseTeaser()` branch.**
  `tools/importer/parsers/columns-media.js` has a `parseTeaser()` path for DEG
  `.teaser--checkerboard` / `.teaser--full-width`: it emits a text column +
  image column. *Why:* without it the image filled the whole section and the
  copy/CTA (e.g. the c90/pg145 "download the spec sheet" band) vanished.

- **Backfill image `alt` from the card title.**
  `resource-cards.js` and `cards-promo.js` set `image.alt` from the card title
  when the source alt is empty. *Why:* otherwise the DM transformer substitutes
  the visible "Image without alt text" sentinel — an accessibility/SEO fail.

- **Rewrite internal source links to brand paths.**
  `tools/importer/transformers/tangentenergy-links.js` rewrites internal
  `/en_US/…(.html)` → `/{brand}/en-us/…` in `afterTransform`, using
  `payload.template.brand`. Wire it into **every** import script and set a
  `brand` field on the `PAGE_TEMPLATE`. *Why:* source-path links 404 in the MSM
  structure and are flagged as non-crawlable.

- **Guarantee a meta description.**
  `tools/importer/seo-utils.js` `ensureMetaDescription(main, document, explicit)`
  runs after `createMetadata`: explicit value → first real paragraph → synthesized
  from headings, truncated ~160 chars. Call it in each import script.
  *Known gap:* it does not persist on the Turner **products** listing page
  through the live importer's metadata serialization — that one page needs a
  manual `Description` in Document Authoring, or a follow-up on the importer's
  serialization path.

- **Strip non-authorable chrome in the cleanup transformer.**
  `tools/importer/transformers/tangentenergy-cleanup.js` removes cookie/consent
  overlays, the source breadcrumb (`.cmp-breadcrumb`), build-price/MSRP/dealer
  modals, the hidden `.degFilterListItem` duplicate list, and stray list tokens
  (`list-per-page`, `items-per-page`). *Why:* this DEG boilerplate otherwise
  leaks into page content and meta descriptions.

> Note on the parser validator: it may flag `resource-cards`/`columns-media` as
> "content completeness below threshold." That is a **false negative** — the
> missing text is intentionally-excluded cookie/build-price boilerplate. The
> extracted cards are complete; the edits still apply.

---

## D. Publishing / SEO hygiene

- **Nav/footer fragments stay published but must be `noindex` + sitemap-excluded.**
  They must remain reachable (header.js/footer.js fetch `${brandRoot()}/nav` and
  `/footer`), but they are thin pages that tank the SEO audit if crawled. Add a
  Document Authoring `metadata` sheet with rows `/**/nav` and `/**/footer` →
  `robots: noindex, nofollow`; AEM then also drops them from the generated
  sitemap.

- **After a brand-folder (MSM) restructure, remove the pre-MSM root pages.**
  Old root docs (`/index`, `/nav`, `/footer`, `/en-us/*`) must be deleted from
  Document Authoring and cleared from the sitemap; otherwise the SEO check keeps
  auditing stale/duplicate paths. Verify with the sitemap + a direct fetch
  (should be `404`), not only the DA source list.

---

## E. Broken internal links / redirects policy

Migration leaves links to source pages that were never migrated. Left as-is
they 404 (bad UX and crawl quality — though *not* a Lighthouse SEO-*score*
audit). For every internal link, the target must **exist**, be **neutralized**,
or be **redirected**.

- **Audit after each migration:** crawl every published page's internal `<a
  href>` and flag any that 404. As of this session the open 404s were:
  - `tangent-energy/en-us/news`
  - `tangent-energy/en-us/articles/blogs/{delivering-excellence-energy-data-and-savings, is-your-organization-a-good-fit-or-eaas, reliability-and-resiliency-how-co-ops-can-achieve-both-affordably}`
  - `tangent-energy/en-us/articles/testimonials/{danvers-electrics-strategic-energy-storage-solution, on-site-energy-solutions-for-linamar-manufacturing-facilities, shaping-the-future-of-distributed-energy-for-liberty-new-hampshire}`
  - `turner-powertrain/en-us/contact-us`
  - `turner-powertrain/en-us/products/{compact-plus, c115, pg115, bevel}`
  - `turner-powertrain/en-us/knowledge-hub/from-transmission-concept-to-production`
- **Resolution options (pick per link):** (1) migrate the target page; (2)
  remove/neutralize the link if the page won't exist; (3) add a redirect. EDS
  redirects are configured per the platform docs (see Reference docs →
  Redirects), not in the repo.
- *Why:* dead internal links erode navigation and crawl quality and often
  indicate missing pages the stakeholder still expects.

## F. Accessibility (beyond alt)

A11y sits at ~95–96; keep it there by convention, not luck.

- **Semantic heading order** — one `h1` per page; don't skip levels.
- **Visible focus states** — never remove focus outlines; ensure keyboard focus
  is visible on links, buttons, nav, search.
- **Contrast from tokens** — text/background contrast must meet WCAG AA; drive
  colors from `tokens-{brand}.css` so brand theming stays accessible.
- **ARIA for interactive chrome** — nav toggle, search, and the mobile menu need
  correct roles/labels/`aria-expanded` (the header block already wires these).
- **Every image has meaningful `alt`** — see Corrections C and the page-hero
  backfill; decorative images get empty alt intentionally.

## G. Performance / Core Web Vitals (don't regress)

Scores are 98–100 — the goal is to *not regress*.

- **LCP image** — the hero/first image should load eagerly and be appropriately
  sized; everything below the fold stays lazy.
- **Three-phase loading** — respect `loadEager` → `loadLazy` → `loadDelayed`;
  don't move heavy work earlier than it needs to be.
- **Avoid render-blocking** — no synchronous third-party scripts in the critical
  path; defer/delay non-essential JS.
- **Keep CLS ~0** — set width/height (or aspect-ratio) on media so nothing
  shifts as it loads.
- See Reference docs → Web Performance for the platform's guidance.

## H. Pre-PR verification checklist

Run before opening or updating a PR:

- [ ] `npm run lint` is clean (CI runs exactly this — JS + CSS).
- [ ] Preview the changed pages in **both** viewports (desktop ~1440 and mobile
      ~375) — nav/footer, hero, cards.
- [ ] Compare against the original site for content/visual parity.
- [ ] The PR description includes a working
      `{branch}--{repo}--{owner}.aem.page/{path}` preview link (AGENTS.md
      requires it; a PR without one is rejected).
- [ ] Confirm code vs content: if a page looks wrong, check whether the **code**
      is merged to `main` *and* the **content** is published to DA (separate
      tracks — see Section A / Methodology 7).

## Reference docs (authoritative EDS guidance)

Consult these for platform-level questions; they back the conventions above.
The canonical index is Adobe's **llms.txt**:

- **Docs index (for agents):** https://www.aem.live/llms.txt
- **Redirects** → https://www.aem.live/docs/redirects — backs Section E (broken
  links) and the production-domain go-live.
- **Go-Live Checklist** → https://www.aem.live/docs/go-live-checklist — CDN /
  `x-forwarded-host` setup that lifts the staging `noindex` SEO cap (Methodology 5).
- **Bulk Metadata** → https://www.aem.live/docs/bulk-metadata — metadata sheet
  for descriptions and the `/**/nav`, `/**/footer` → `noindex` rows (Section D).
- **Indexing** → https://www.aem.live/developer/indexing — query-index / sitemap
  behaviour (Section D, orphaned pages).
- **Web Performance ("Keeping it 100")** → https://www.aem.live/developer/keeping-it-100 — backs Section G.
- **Block Collection** → https://www.aem.live/developer/block-collection and
  **Markup / Sections** → https://www.aem.live/developer/markup-sections-blocks —
  back "reuse before create" (Methodology 1, 3) and defensive decoration.
- **Using Sidekick** → https://www.aem.live/docs/sidekick — authoring/publishing.
- **Admin API** → https://www.aem.live/docs/admin.html and **aem CLI** →
  https://www.aem.live/developer/cli-reference — preview/publish/unpublish and
  local dev.

---

## How future sessions inherit these

These conventions are committed repo files, so they travel with the code to any
clone or session. `AGENTS.md` (read first by every agent) points here. The
strongest form of "memory" is that most fixes already live **in code**
(`dm.js`, `brand.js`, the parsers/transformers) — this doc records the *why* so
they are not reverted. Per-session assistant memory is **not** committed and
does **not** reach other people's sessions; only committed files do — so commit
and push changes for others to benefit.
