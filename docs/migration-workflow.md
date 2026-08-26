# Migration Workflow (general, forward-looking)

The repeatable pipeline, commands, and configs for migrating **any** brand/site
to EDS on this shared codebase. This is a *how-to*, not a record of past work —
for the rules that govern decisions see [`migration-conventions.md`](./migration-conventions.md);
to start a migration see [`migration-kickoff.md`](./migration-kickoff.md).

Project type: **`da`** (Document Authoring). No build step; `devDependencies`
only. `fstab.yaml` / `helix-query.yaml` / `paths.json` are retired — site config
lives at **tools.aem.live** (see `AGENTS.md`).

---

## The pipeline (per page-type / template)

1. **Scope + Template Reuse Report first** — discover URLs, classify by
   **structure** (§1a), consult `tools/importer/block-signatures.json` for block
   reuse, and produce the report. **Get approval before generating anything**
   (§1b). Never silently create a template.
2. **Project setup** (first time / new repo) — detect project type + block
   library endpoint → `.migration/project.json`.
3. **Page analysis** — per representative page: cleaned HTML, metadata,
   downloaded images, section boundaries, per-sequence decisions (default
   content vs. block) → `authoring-analysis.json` under `migration-work/`.
4. **Block mapping** — add the per-page DOM `instances` selectors for each block
   into `tools/importer/page-templates.json`. (Signatures qualify the block
   family; `instances` address it on the page — see §1e.)
5. **Import infrastructure** — generate **parsers** (`tools/importer/parsers/*.js`,
   one per block, HTML→block-table) and **transformers**
   (`tools/importer/transformers/*.js`, site-wide cleanup / sections / DM). Reuse
   existing ones first; only create when no signature matches.
6. **Import script** — `tools/importer/import-<template>.js` orchestrates parsers
   + transformers for a template; bundle → `.bundle.js` → run → `content/**.plain.html`.
7. **Design migration** — extract brand tokens; theme blocks via
   `tokens-<brand>.css` (no block-CSS `:root`); visual-verify vs. source.
8. **Nav + footer** — per-brand (and per-locale) `nav`/`footer` fragments +
   shared `header`/`footer` blocks.
9. **Preview & verify** — local dev + screenshot comparison, both viewports; fix
   divergences. Then the pre-PR checklist (§H).

**Content is never hand-authored.** All `content/**.plain.html` is produced by
the import scripts; to change content, adjust the parser/transformer and re-run
(a repo guardrail blocks editing/deleting under `content/`).

> `tools/importer/` starts **mostly empty** in a fresh repo — only
> `block-signatures.json` + `README.md` (inputs). Parsers, transformers, import
> scripts, and bundles are **generated as you migrate**, per template/block.
> File count tracks *page-types + blocks*, not pages.

---

## Key commands

```bash
# Local dev server (serves content/ at /content, prefers .plain.html)
npx @adobe/aem-cli up --html-folder content --prefer-plain-html --no-open --port 3000

# Bundle an import script (bundler ships with the import tooling, not the repo)
<import-tooling>/aem-import-bundle.sh --importjs tools/importer/import-<t>.js

# Run an import
node <import-tooling>/run-bulk-import.js \
  --import-script tools/importer/import-<t>.bundle.js \
  --urls tools/importer/urls-<t>.txt

# Lint before PR (CI runs exactly this)
npm run lint            # eslint (airbnb-base) + stylelint
```

---

## Clean URLs — the EDS model (no Sling)

Edge Delivery has **no Sling / dispatcher rewrite**; the URL path maps directly
to the content-source path. Two things strip the prefixes:

1. **`/content` is a local-dev artifact** of `aem up --html-folder content` —
   never in the production URL.
2. **The brand folder is removed by folder mapping** (EDS equivalent of a Sling
   vanity mapping) — configured per site at **tools.aem.live** (one site per
   brand, mapping `/` ⇒ `/<brand>`).

| Author path (repo) | Local dev URL | Production URL |
|---|---|---|
| `content/<brand>/<locale>` | `/content/<brand>/<locale>` | `https://<brand-domain>/<locale>` |

**Two halves must agree:** the tools.aem.live folder mapping (routes domain →
brand folder) and `scripts/brand.js` `BRAND_HOSTS` (so the loaded page resolves
the right brand for theme + nav/footer). Add a domain to both, or the page loads
from the right folder but falls back to the **default** theme. See
[`msm-multi-brand.md`](./msm-multi-brand.md).

---

## Token-theming contract (define in every `tokens-<brand>.css`)

Structural CSS is brand-neutral and token-driven; only **token values** differ
per brand. Swapping the token file re-themes every block with zero block-CSS
changes. Block CSS must **never** define `:root` token values (load order would
override the theme — see §B).

Tokens each brand file should define:
- **Base:** `--background-color`, `--text-color`, `--link-color`, `--link-hover-color`, `--light-color`, `--dark-color`.
- **Accents:** `--brand-navy` (generic primary accent — alias to the brand's color), `--brand-grey`, `--section-grey`.
- **Type:** `--body-font-family`, `--heading-font-family`, `--body-font-size-*`, `--heading-font-size-*` (+ desktop `@media (width >= 900px)` overrides).
- **Spacing:** `--section-padding`, `--nav-height`.
- **Header:** `--nav-bar-bg`, `--nav-accent`, `--nav-link-color`, `--nav-link-hover-color`, `--nav-link-border`, `--nav-search-border`.
- **Footer:** `--footer-info-bg`, `--footer-info-color`, `--footer-legal-bg`, `--footer-legal-color`, `--footer-link-color`, `--footer-copyright-color`.

Loading: `styles.css` (structural, cached, no token values) → `brand.css`
imports the DEFAULT brand's tokens (no-flash) → `scripts.js loadBrandTokens()`
injects `/styles/tokens-<brand>.css` for the active brand at load (skipped for
the default). Each page downloads only its own brand tokens.

---

## Manual steps (tools.aem.live — cannot be done from the repo)

For each brand: create an EDS **site** pointing at this shared repo + content
source, bound to the brand domain, with a **folder mapping** `/` ⇒ `/<brand>`.
Then ensure the domain is listed in `BRAND_HOSTS` (`scripts/brand.js`).
Index/sitemap and redirects config also live here (see conventions §D and the
Reference docs).

---

## Per-migration OUTPUTS (generate fresh each time — do NOT treat as inputs)

Each migration *produces* these; they are records of that migration, not rules
to copy into the next one:
- **Template Reuse Report** / structure audit (per site).
- **Site catalog** (`docs/site-catalog-<brand>.md`).
- Generated `parsers/`, `transformers/`, `import-*.js`, `.bundle.js`, and
  `content/`.

The durable **inputs** you carry forward are the rules
([`migration-conventions.md`](./migration-conventions.md)), the kickoff spec,
the block-signature registry, and the shared code — not any one migration's
outputs.
