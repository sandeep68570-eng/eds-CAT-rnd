# Multi-brand (MSM) setup

This one code repo serves multiple brands from a shared block library and a
per-brand design-token theming system. Content is authored per brand under
`content/<brand>/…`; the shared code re-themes and re-navigates per brand.

Brands today: **tangent-energy**, **turner-powertrain**.

## Content layout

```
content/
  tangent-energy/
    en-us.plain.html            # brand homepage
    en-us/<page>.plain.html     # interior pages
    nav.plain.html  footer.plain.html  images/
  turner-powertrain/
    en-us.plain.html
    nav.plain.html  footer.plain.html  images/
```

## Clean URLs — how the `/content` and brand folders disappear

There is **no Sling / dispatcher rewrite** in Edge Delivery. The URL path maps
directly to the content-source path. Two layers strip the prefixes:

1. **`/content` is a local-dev artifact only.** The dev server is started with
   `aem up --html-folder content`, which mounts `content/` at `/content`. In
   production the content source is the repo/DA folder itself, so `/content`
   never appears in the public URL.

2. **The brand folder is stripped by folder mapping (one EDS site per brand).**
   Each brand is its **own EDS site** on its **own domain**, with its site
   config **mapping the brand folder to the site root**. This is the EDS
   equivalent of an AEMaaCS Sling mapping / vanity path.

Result:

| Author path (repo)                         | Local dev URL                                | Production URL                         |
|--------------------------------------------|----------------------------------------------|----------------------------------------|
| `content/tangent-energy/en-us`             | `/content/tangent-energy/en-us`              | `https://tangentenergy.com/en-us`      |
| `content/turner-powertrain/en-us`          | `/content/turner-powertrain/en-us`           | `https://turner-powertrain.com/en-us`  |

## Production config (at tools.aem.live — NOT in the repo)

`fstab.yaml` / `paths.json` are retired for this project (see `AGENTS.md`); site
config lives at **tools.aem.live**. For each brand's site, set a **folder
mapping** so the brand folder serves at root, e.g.:

- Site **tangent-energy** → mapping `/` ⇒ `/tangent-energy`
- Site **turner-powertrain** → mapping `/` ⇒ `/turner-powertrain`

Each site points at this same code repo (shared code) and the shared content
source, and is bound to the brand's domain. A single site can only map **one**
folder to root — hence one site per brand.

## Brand resolution in code

`scripts/brand.js` `getBrand()` resolves the active brand in this order:

1. **Hostname** (production) — `BRAND_HOSTS` maps each domain (and EDS
   preview/live host substrings) to a brand. Add new domains/aliases there.
2. **URL path** (local dev) — the first segment after an optional `/content`.
3. `DEFAULT_BRAND` fallback.

`brandRoot()` returns the base for shared fragments (nav/footer):
- local dev → `/content/<brand>` (brand is in the path);
- production → `''` (brand folder is mapped to root, so `/nav`, `/footer`).

Because resolution is hostname-first, **no code change is needed** when the
brand folders are mapped to root in production — only the `BRAND_HOSTS` entries
must list the real domains.

## Theming

- Shared, brand-neutral structural CSS: `styles/styles.css` + block CSS (all
  `var(--token)`).
- Per-brand token values: `styles/tokens-<brand>.css` (colors, fonts, spacing,
  plus header/footer tokens `--nav-*`, `--footer-*`).
- `styles/brand.css` imports the DEFAULT brand's tokens (no-flash default);
  `scripts.js` `loadBrandTokens()` injects the active brand's token file at load
  time (skipped for the default brand, already loaded).

## Adding a new brand

1. Author content under `content/<new-brand>/…` (+ `nav.plain.html`,
   `footer.plain.html`, `images/`).
2. Create `styles/tokens-<new-brand>.css` (copy an existing one, change values).
3. Add the slug to `BRANDS` and a hostname rule to `BRAND_HOSTS` in
   `scripts/brand.js`.
4. Create the brand's EDS site at tools.aem.live with `/` ⇒ `/<new-brand>`
   folder mapping, bound to its domain.
