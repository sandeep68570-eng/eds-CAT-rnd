# Tangent Energy + Turner Powertrain — EDS Migration Playbook

A record of everything done in this repo: the migration steps, the multi-brand
(MSM) architecture, the theming/token practices, key configs, and where the
manual (tools.aem.live) pieces live. Written so the work can be followed,
audited, or repeated for a new brand/page.

---

## 1. What was built

- **Two brands** in one shared code repo:
  - **Tangent Energy** — homepage + 4 interior pages (About Us, Meet the Team,
    Testimonials & Resources, Tangent AMP), nav, footer.
  - **Turner Powertrain** — homepage, nav, footer.
- **Shared block library** reused across both brands (see §5).
- **Per-brand theming** via design tokens — same blocks, different look.
- **Site-wide breadcrumb**, auto-generated, brand-aware.
- **MSM folder structure** with clean-URL strategy (one EDS site per brand).

Project type: **`da`** (Document Authoring). No build step; `devDependencies`
only. `fstab.yaml` / `helix-query.yaml` / `paths.json` are retired — site config
lives at **tools.aem.live** (see `AGENTS.md`).

---

## 2. Migration workflow (the steps we followed)

Each page/site went through this pipeline (orchestrated by the excat skills):

1. **Project setup** — detect project type + block library endpoint →
   `.migration/project.json`.
2. **Site analysis** — scrape the page (Playwright), extract a structural
   skeleton, group URLs into page templates → `tools/importer/page-templates.json`
   (skeleton with empty `blocks[]`).
3. **Page analysis** — per page: cleaned HTML, metadata, downloaded images,
   section boundaries, and per-sequence decisions (default content vs. block).
   Artifacts under `migration-work/` (and `migration-work/pages/<page>/` for
   interior/second-brand pages). Produces `authoring-analysis.json`.
4. **Block mapping** — add DOM selectors for each block variant into
   `page-templates.json`; cache per-block source HTML.
5. **Import infrastructure** — generate **parsers** (`tools/importer/parsers/*.js`,
   one per block variant, HTML→block-table) and **transformers**
   (`tools/importer/transformers/*.js`, site-wide DOM cleanup / sections /
   Dynamic-Media handling).
6. **Import script** — `tools/importer/import-<template>.js` orchestrates
   parsers + transformers for a template; bundled to `.bundle.js` and run to
   produce `content/**.plain.html`.
7. **Design migration** — extract brand tokens; style each block to match the
   source; visual-verify against the original.
8. **Nav + footer** — brand `nav.plain.html` / `footer.plain.html` fragments +
   shared `header`/`footer` blocks.
9. **Preview & verify** — local dev server + screenshot comparison; fix
   divergences.

**Content is never hand-authored.** All `content/**.plain.html` is produced by
the import scripts. To change content, adjust the parser/transformer and re-run
the import (also enforced by a repo guardrail that blocks deleting content).

### Key commands

```bash
# Local dev server (serves content/ at /content, prefers .plain.html)
npx @adobe/aem-cli up --html-folder content --prefer-plain-html --no-open --port 3000

# Bundle an import script
<excat>/excat-content-import/scripts/aem-import-bundle.sh --importjs tools/importer/import-<t>.js

# Run an import
node <excat>/excat-content-import/scripts/run-bulk-import.js \
  --import-script tools/importer/import-<t>.bundle.js \
  --urls tools/importer/urls-<t>.txt

# Lint before PR
npx eslint <files>        # JS (airbnb-base)
npx stylelint <files>     # CSS
```

---

## 3. Content structure (MSM)

```
content/
  tangent-energy/
    en-us.plain.html                 # brand homepage
    en-us/about-us.plain.html        # interior pages
    en-us/meet-the-team.plain.html
    en-us/customer-segments.plain.html
    en-us/tangent-amp.plain.html
    nav.plain.html  footer.plain.html  images/
  turner-powertrain/
    en-us.plain.html
    nav.plain.html  footer.plain.html  images/
```

> Note: the original single-brand files (`content/en-us.*`, `content/nav.*`,
> `content/footer.*`, `content/images/`) remain as **orphans** — the environment
> guardrail forbids deleting under `content/`. Remove them with `git rm` outside
> the guardrail; nothing live references them.

---

## 4. Clean URLs — the EDS model (no Sling)

Edge Delivery has **no Sling / dispatcher rewrite**. The URL path maps directly
to the content-source path. Two things strip the prefixes:

1. **`/content` is a local-dev artifact** of `aem up --html-folder content`. It
   is never in the production URL.
2. **The brand folder is removed by folder mapping** — the EDS equivalent of a
   Sling vanity mapping — configured per site at **tools.aem.live**
   (one site per brand, each mapping `/` ⇒ `/<brand>`).

| Author path (repo)                | Local dev URL                        | Production URL                        |
|-----------------------------------|--------------------------------------|---------------------------------------|
| `content/tangent-energy/en-us`    | `/content/tangent-energy/en-us`      | `https://tangentenergy.com/en-us`     |
| `content/turner-powertrain/en-us` | `/content/turner-powertrain/en-us`   | `https://turner-powertrain.com/en-us` |

### Two halves that must agree

- **tools.aem.live (manual, NOT in repo):** routes a domain → the brand content
  folder mapped to root. This is the "domain thing."
- **`scripts/brand.js` (code):** once the page loads, decides *which brand* it is
  so it can fetch the right nav/footer and theme. Resolution order:
  1. **hostname** — `BRAND_HOSTS` maps each domain / EDS preview host to a brand;
  2. **URL path** — first segment after optional `/content` (local dev);
  3. `DEFAULT_BRAND`.

  `brandRoot()` returns `/content/<brand>` locally and `''` (root) in production,
  so nav/footer resolve as `/content/<brand>/nav` locally and `/nav` in prod.

If you add a domain at tools.aem.live but not to `BRAND_HOSTS`, the page loads
from the right folder but falls back to the **default** theme. Keep both in sync.

---

## 5. Shared block library (reuse)

All blocks live once in `/blocks` and are shared across brands.

| Block           | Purpose                                             | Used by                                  |
|-----------------|-----------------------------------------------------|------------------------------------------|
| `header`        | Site header/nav (fetches brand `nav.plain.html`)    | both brands                              |
| `footer`        | Site footer (fetches brand `footer.plain.html`)     | both brands                              |
| `breadcrumb`    | Auto-generated, brand-aware trail                   | both brands (interior pages)             |
| `page-hero`     | White heading over dark banner image                | Tangent interiors, Turner home           |
| `cards-promo`   | Image + title + desc + "Learn More" cards           | Tangent home/about, Turner home          |
| `columns-media` | Side-by-side media/text (image or video)            | Tangent home/tangent-amp, Turner home    |
| `cards-feature` | Borderless feature grid (image + heading + text)    | Turner "Why Turner" (new, now shared)    |
| `hero-media`    | Text-less full-bleed hero                           | Tangent home                             |
| `profiles`      | Team member list (headshot + bio + links)           | Tangent meet-the-team                    |
| `resource-cards`| Article cards (linked title + desc)                 | Tangent customer-segments                |
| `tabs`          | Tabbed panels (label + image + text)                | Tangent tangent-amp                      |

Turner reused **page-hero, cards-promo, columns-media** + shared
header/footer/breadcrumb, and contributed one new shared block (`cards-feature`).

---

## 6. Styling & design-token practice (IMPORTANT)

The rule: **structural CSS is brand-neutral and token-driven; only token VALUES
differ per brand.** Swapping the token file re-themes every block with zero
block-CSS changes.

### Files

```
styles/
  styles.css                    # shared structural CSS — NO :root token values
  brand.css                     # imports the DEFAULT brand's tokens (no-flash default)
  tokens-tangent-energy.css     # :root token VALUES for Tangent
  tokens-turner-powertrain.css  # :root token VALUES for Turner
scripts/
  brand.js                      # getBrand() / brandRoot()
  scripts.js                    # loadBrandTokens() injects the active token file
```

### How the right CSS loads per brand (only one brand's tokens ship)

1. `styles.css` (loaded once, cached) holds all structural rules; it references
   `var(--token)` and defines **no** token values itself.
2. `brand.css` (`@import`ed by styles.css) imports the **default** brand's
   tokens, so the page is themed before JS runs (no flash).
3. `scripts.js` `loadBrandTokens()` runs in the eager phase, calls `getBrand()`,
   and **injects `<link rel="stylesheet" href="/styles/tokens-<brand>.css">`**
   for the active brand — skipped when the brand IS the default (already loaded).
   So each page downloads **only its own** brand tokens.
4. CSS custom properties cascade at runtime, so the injected token file (loaded
   after) supplies the values the shared CSS reads.

### Token contract (defined in every `tokens-<brand>.css`)

- **Base:** `--background-color`, `--text-color`, `--link-color`,
  `--link-hover-color`, `--light-color`, `--dark-color`.
- **Brand accents:** `--brand-navy` (used generically as the primary accent —
  Turner aliases it to green), `--brand-grey`, `--section-grey`.
- **Type:** `--body-font-family`, `--heading-font-family`, `--body-font-size-*`,
  `--heading-font-size-*` (with a desktop `@media (width >= 900px)` override).
- **Spacing:** `--section-padding`, `--nav-height`.
- **Header (shared block):** `--nav-bar-bg`, `--nav-accent`, `--nav-link-color`,
  `--nav-link-hover-color`, `--nav-link-border`, `--nav-search-border`.
- **Footer (shared block):** `--footer-info-bg`, `--footer-info-color`,
  `--footer-legal-bg`, `--footer-legal-color`, `--footer-link-color`,
  `--footer-copyright-color`.

### Practices / gotchas we followed

- **No `:root` token values in block CSS.** Block CSS loads *after* the token
  file, so any `:root` defaults there would override the brand tokens in the
  cascade. Header/footer originally had `:root` blocks — removed; all their
  colors now come from the token files. (This was the fix that made Turner's
  white header + green accents actually apply.)
- **No token values in `styles.css`** either, for the same cascade reason.
- **Brand token example** — Tangent = navy `#001e62` / blue `#0067b8`, grey
  header; Turner = green `#3aaa35` / blue `#2679b8`, white header + dark footer.
- **Section styles:** `section-metadata` maps to section classes
  (`.section.grey`, `.section.dark`, `.section.highlight`) styled in `styles.css`
  using tokens.
- **Dynamic Media / Scene7:** the Caterpillar DEG source serves Scene7 image
  URLs. A transformer rewrites `<img>`→carrier `<a>` at import; an auto-block in
  `scripts.js` rebuilds them into responsive `<picture>` at render (registering
  `window.__dmRender__`). Block decorators that need an optimized picture import
  `optimizedPicture` from **`scripts/dm.js`** (a thin wrapper that delegates DM
  URLs to `__dmRender__`, else calls the vendored `createOptimizedPicture`) —
  **NOT** `createOptimizedPicture` from `aem.js` directly. This keeps the
  vendored `scripts/aem.js` pristine per AGENTS.md (an earlier inline patch to
  `createOptimizedPicture` was removed in favor of this wrapper). If you add a
  block that optimizes DM images, import from `scripts/dm.js`.

---

## 7. Breadcrumb (site-wide, brand-aware)

- `blocks/breadcrumb/` auto-generates the trail from the URL; injected by
  `scripts.js` `buildAutoBlocks` on interior pages only, **hidden on the brand
  homepage** (`isHomePage()`).
- Labels resolve from the active brand's nav fragment (so header labels stay
  authoritative), then the page H1, then a title-cased segment.
- Brand-aware: the home crumb is the brand root (local: `/<brand>/<locale>`;
  prod: `/<locale>`); path normalization lower-cases and maps `_`→`-` so source
  `/en_US/…` matches migrated `/en-us/…`.
- Guard: only builds on the real page `<main>`, not on header/footer fragment
  mains (which are decorated via `loadFragment`).

---

## 8. Key configs & files

| File | Role |
|------|------|
| `.migration/project.json` | project type (`da`) + block library endpoint |
| `tools/importer/page-templates.json` | all templates (5 Tangent + Turner) with block mappings |
| `tools/importer/parsers/*.js` | per-block HTML→table parsers |
| `tools/importer/transformers/*.js` | cleanup / sections / dm-images (site-wide) |
| `tools/importer/import-*.js` (+ `.bundle.js`) | per-template import orchestrators |
| `scripts/brand.js` | brand resolution + fragment base |
| `scripts/scripts.js` | token loader, breadcrumb auto-block, DM auto-block, section-metadata |
| `styles/brand.css` + `styles/tokens-*.css` | theming |
| `docs/msm-multi-brand.md` | MSM setup + tools.aem.live config |

---

## 9. Manual steps (at tools.aem.live — cannot be done from the repo)

For each brand, create an EDS **site** pointing at this shared repo + content
source, bound to the brand domain, with a **folder mapping**:

- Site **tangent-energy**: `/` ⇒ `/tangent-energy`, domain `tangentenergy.com`
- Site **turner-powertrain**: `/` ⇒ `/turner-powertrain`, domain
  `turner-powertrain.com`

Then ensure each domain is present in `BRAND_HOSTS` (`scripts/brand.js`) — done
for both current brands.

---

## 10. Adding a new brand (checklist)

1. Author content under `content/<brand>/…` (+ `nav.plain.html`,
   `footer.plain.html`, `images/`) — via import scripts, not by hand.
2. Create `styles/tokens-<brand>.css` (copy an existing one; change values).
3. In `scripts/brand.js`: add the slug to `BRANDS` and a hostname rule to
   `BRAND_HOSTS`.
4. At tools.aem.live: create the brand's site with `/` ⇒ `/<brand>` mapping and
   its domain.
5. Reuse existing blocks; add new block variants to `/blocks` only where the
   structure genuinely differs (new blocks are automatically shared).

---

## 11. Known follow-ups / honest caveats

- **Orphaned pre-MSM content files** under `content/` need a manual `git rm`.
- **Production URL behavior** (root folder mapping, hostname-based theming) is
  written and locally validated but only *activates* once the per-brand sites
  exist at tools.aem.live — it can't be end-to-end tested from local dev.
- **Turner "Products"** nav is a plain link; the source megamenu isn't
  instrumented (homepage-scope only).
- **Turner Knowledge Hub / Contact** dark bands import via `columns-media` but
  are visually sparse vs. the source's dark gradient + green CTA — a styling
  pass would tighten them.
- **Fonts** render as Arial locally (source font service is domain-locked);
  expected in preview.
- Some pages import below the 90% completeness heuristic due to legitimately
  excluded source chrome (cookie/consent boilerplate, build-and-price modals,
  lazy-loaded inactive tab panels) — not real content loss.
