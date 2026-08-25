# Migration Conventions & Corrections

Hard-won corrections from migrating the Tangent Energy and Turner Powertrain
brands to EDS. **Read this before migrating another page or brand in this repo.**
Each rule records *what to do* and *why* — the "why" is what stops a future
session (or another person) from silently undoing the fix.

Companion docs: [`migration-playbook.md`](./migration-playbook.md) (end-to-end
workflow, commands, file map) and [`msm-multi-brand.md`](./msm-multi-brand.md)
(brand folders, clean URLs, theming). This file is the *corrections* layer on
top of those.

---

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

## How future sessions inherit these

These conventions are committed repo files, so they travel with the code to any
clone or session. `AGENTS.md` (read first by every agent) points here. The
strongest form of "memory" is that most fixes already live **in code**
(`dm.js`, `brand.js`, the parsers/transformers) — this doc records the *why* so
they are not reverted. Per-session assistant memory is **not** committed and
does **not** reach other people's sessions; only committed files do — so commit
and push changes for others to benefit.
