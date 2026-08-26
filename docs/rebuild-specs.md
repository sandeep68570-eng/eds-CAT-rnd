# Rebuild Specs — reconstruct the load-bearing mechanics from docs alone

The starter kit carries **docs, not code**. This file is the build spec for the
mechanics that don't come from a stock boilerplate: brand resolution, per-brand
token loading, DM/Scene7 rendering, and block folding. A fresh session
reconstructs these in the new repo from the snippets below — no code files are
copied across.

> **Fidelity caveat:** this is a *reconstruction*, not a byte-copy. The snippets
> are faithful to the working implementation, but hand-rebuilt code can drift on
> edge cases (especially the Scene7 `$`-param handling in §3). If you need exact
> fidelity for one piece, carry that single file instead — `scripts/dm.js` is the
> recommended exception.

Prereqs the boilerplate must satisfy (verify first):
- `scripts/scripts.js` has a `buildAutoBlocks(main)` extension point (add the
  `main` param if the scaffold omits it).
- `scripts/aem.js` stays **vendored/pristine** — never edit it.
- `.eslintrc`/flat config allows `__dmRender__` (see §3).
- `.hlxignore` excludes `tools/*`.

---

## 1. `scripts/brand.js` — MSM brand + locale resolution

Purpose: resolve the active brand (hostname → path → default), give the fragment
base, and normalize `/content/<brand>` links per environment.

```js
export const BRANDS = ['brand-a', 'brand-b'];        // add each brand slug
export const DEFAULT_BRAND = 'brand-a';

// Production hostnames → brand. Most-specific first. Include the domain AND
// the EDS preview/live host substring (…--repo--owner.aem.page/.aem.live).
const BRAND_HOSTS = [
  { match: /(^|\.)brand-a\.com$/i, brand: 'brand-a' },
  { match: /(^|\.)brand-b\.com$/i, brand: 'brand-b' },
  { match: /brand-a.*\.aem\.(page|live)$/i, brand: 'brand-a' },
];

export function getBrand() {
  const host = (typeof window !== 'undefined' && window.location.hostname) || '';
  const byHost = BRAND_HOSTS.find((h) => h.match.test(host));
  if (byHost) return byHost.brand;
  const segments = window.location.pathname.replace(/^\/content/, '').split('/').filter(Boolean);
  const first = (segments[0] || '').toLowerCase();
  return BRANDS.includes(first) ? first : DEFAULT_BRAND;
}

// Fragment base for the active brand: local keeps /content/<brand>; production
// (brand folder mapped to site root) returns '' so fragments resolve at /nav.
export function brandRoot(brand = getBrand()) {
  const path = window.location.pathname;
  if (new RegExp(`(^|/)(content/)?${brand}(/|$)`).test(path)) {
    return path.includes('/content/') ? `/content/${brand}` : `/${brand}`;
  }
  return '';
}

// Fragments are authored with absolute /content/<brand>/… links; rewrite the
// prefix to the env-correct path (local keeps it, prod strips to root). Applies
// to <a href> and <img src>; leaves external/anchor URLs untouched.
export function normalizeBrandLinks(container) {
  if (!container) return;
  const prefix = new RegExp(`^/content/(${BRANDS.join('|')})(/.*|$)`, 'i');
  const rewrite = (v) => {
    const m = v.match(prefix);
    if (!m) return null;
    return `${brandRoot(m[1].toLowerCase())}${m[2] || ''}`;
  };
  container.querySelectorAll('a[href]').forEach((a) => {
    const n = rewrite(a.getAttribute('href') || ''); if (n !== null) a.setAttribute('href', n);
  });
  container.querySelectorAll('img[src]').forEach((img) => {
    const n = rewrite(img.getAttribute('src') || ''); if (n !== null) img.setAttribute('src', n);
  });
}
```

**Multi-locale:** for brands with more than one locale (e.g. Perkins en_GB +
zh_CN), fetch fragments as `` `${brandRoot()}/${locale}/nav` `` where `locale`
is the path segment after the brand. See `msm-multi-brand.md`.

**Wiring:** `header.js` and `footer.js` fetch `` `${brandRoot()}/nav` `` /
`/footer`, then call `normalizeBrandLinks(fragment)` before decorating.

---

## 2. `loadBrandTokens()` — per-brand token CSS (in `scripts.js`, eager phase)

Purpose: each page downloads only the active brand's tokens.

```js
function loadBrandTokens() {
  const brand = getBrand();
  if (brand === DEFAULT_BRAND) return;              // default tokens already in brand.css
  if (document.querySelector(`link[data-brand-tokens="${brand}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${window.hlx.codeBasePath}/styles/tokens-${brand}.css`;
  link.dataset.brandTokens = brand;
  document.head.append(link);
}
// call it early in loadEager(): loadBrandTokens();
```

**CSS load order (critical):**
1. `styles/styles.css` — structural rules only, all `var(--token)`, **no `:root`
   token values**.
2. `styles/brand.css` — `@import url('tokens-<DEFAULT_BRAND>.css');` (no-flash default).
3. `loadBrandTokens()` injects `tokens-<brand>.css` for non-default brands.

**Token contract** (define in every `tokens-<brand>.css`): base
(`--background-color`, `--text-color`, `--link-color`, `--link-hover-color`,
`--light-color`, `--dark-color`), accents (`--brand-navy` as generic primary,
`--brand-grey`, `--section-grey`), type (`--body-font-family`,
`--heading-font-family`, `--body-font-size-*`, `--heading-font-size-*` + desktop
`@media (width >= 900px)`), spacing (`--section-padding`, `--nav-height`), header
(`--nav-bar-bg`, `--nav-accent`, `--nav-link-color`, `--nav-link-hover-color`,
`--nav-link-border`, `--nav-search-border`), footer (`--footer-info-bg`,
`--footer-info-color`, `--footer-legal-bg`, `--footer-legal-color`,
`--footer-link-color`, `--footer-copyright-color`).

**Rule (see conventions §B):** block CSS consumes tokens but must **never** define
`:root` values — it loads after the token file and would override the theme.

---

## 3. DM/Scene7 rendering — `scripts/dm.js` wrapper + `__dmRender__` auto-block

Purpose: Scene7 IS/Image and DM Open API URLs carry rendition/personalization in
the **query string**; the vendored `createOptimizedPicture` is path-only and
drops it. A single chokepoint preserves the params without touching `aem.js`.

**`scripts/dm.js`** — the wrapper block decorators import instead of `aem.js`:

```js
import { createOptimizedPicture } from './aem.js';

// eslint-disable-next-line import/prefer-default-export
export function optimizedPicture(src, ...rest) {
  const alt = rest[0] || '';
  if (typeof window !== 'undefined' && typeof window.__dmRender__ === 'function') {
    const dmPicture = window.__dmRender__(src, alt);
    if (dmPicture) return dmPicture;
  }
  return createOptimizedPicture(src, ...rest);   // non-DM → untouched vendored path
}
```

**In `scripts.js`** — detection, renderers, auto-block, and the `__dmRender__`
registration:

```js
const DM_BREAKPOINTS = [{ media: '(min-width: 600px)', width: 2000 }, { width: 750 }];

function detectDynamicMediaUrl(urlStr) {
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;   // reject relative — else site links match
  let u; try { u = new URL(urlStr, 'https://x/'); } catch { return false; }
  if (u.pathname.startsWith('/is/image/')) return 'scene7'; // by path (vanity CNAMEs)
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) return 'dm-openapi';
  return false;
}

// Scene7: manipulate the query string VERBATIM — URL.searchParams percent-encodes
// `$`, but IS/Image template params ($image=, $badge=…) need the literal `$`.
function buildScene7Rendition(src, { width, format }) {
  const normalized = src.startsWith('//') ? `https:${src}` : src;
  const qIdx = normalized.indexOf('?');
  const base = qIdx >= 0 ? normalized.slice(0, qIdx) : normalized;
  const pairs = (qIdx >= 0 ? normalized.slice(qIdx + 1) : '').split('&').filter(Boolean)
    .filter((p) => { const k = p.split('=')[0]; return k !== 'wid' && k !== 'fmt'; });
  pairs.push(`wid=${width}`, `fmt=${format}`);
  return `${base}?${pairs.join('&')}`;
}
function buildDmOpenApiRendition(src, { width }) {
  const url = new URL(src, 'https://x/'); url.searchParams.set('width', String(width));
  return url.toString();
}
// renderScene7Picture(src, alt) / renderDmOpenApiPicture(src, alt): build a
// <picture> — webp+jpg <source> per DM_BREAKPOINTS, trailing <img loading="lazy">.

// Register the hook the wrapper delegates to. Non-DM → null (regression guard).
window.__dmRender__ = (src, alt) => {
  const family = detectDynamicMediaUrl(src);
  if (!family) return null;
  return family === 'scene7' ? renderScene7Picture(src, alt) : renderDmOpenApiPicture(src, alt);
};

// Auto-block: the import transformer turns <img DM> into <a href=DM-URL> (or a
// linked <a href=/page title=DM-URL>). At render, rebuild those anchors into
// <picture>. Call from buildAutoBlocks(main).
function buildDynamicMediaImages(main) { /* scan main a[href|title], detect, replace with picture */ }
```

**Wiring:** call `buildDynamicMediaImages(main)` inside `buildAutoBlocks(main)`
(alongside fragment + breadcrumb auto-blocks). **ESLint:** add
`'no-underscore-dangle': ['error', { allow: ['__dmRender__'] }]` to the rules.
**Import rule:** any block that optimizes images imports `optimizedPicture` from
`scripts/dm.js`, never `createOptimizedPicture` from `aem.js`.

> Only build this when the source uses DM/Scene7 (grep the scrape for
> `/is/image/` or `/adobe/assets/urn:`). Non-DM sources skip §3 entirely.

---

## 4. Component folding — one block, variants (hero, cards)

Purpose: one block per family; variations are variants, not new blocks (see
conventions §1d).

- **One folder, one name:** `blocks/hero/`, `blocks/cards/`. In DA authored as
  `Hero`, `Hero (media)`, `Cards (promo)`, etc. → EDS emits `class="hero media"`,
  `class="cards promo"`.
- **JS branches on the variant class; CSS scopes every rule to `.block.variant`**
  so variants don't bleed.

```js
// blocks/hero/hero.js — content-driven + variant-aware (sketch)
export default function decorate(block) {
  const media = block.querySelector('picture, video, a[href]');   // image/video/link
  const heading = block.querySelector('h1,h2,h3,h4,h5,h6');
  const cta = block.querySelector('a.button, .button-container a');
  if (media) media.closest(':scope > div > div, :scope > div')?.classList.add('hero-media');
  if (heading) heading.closest(':scope > div > div, :scope > div')?.classList.add('hero-text');
  if (cta) cta.classList.add('hero-cta');
  // variant-specific tweaks: block.classList.contains('media') / 'page' / 'carousel'
}
```

```js
// blocks/cards/cards.js — promo/feature/resource share this base; resource adds
// whole-card click. Prefix helper classes with the block name.
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      div.className = (div.children.length === 1 && div.querySelector('picture'))
        ? 'cards-card-image' : 'cards-card-body';
    });
    if (block.classList.contains('resource')) {           // variant behavior
      const link = li.querySelector('a[href]');
      if (link) { li.classList.add('cards-linked'); li.addEventListener('click', (e) => { if (!e.target.closest('a')) link.click(); }); }
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(optimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.textContent = ''; block.append(ul);
}
```

Map source classes → block+variant via `tools/importer/block-signatures.json`
(conventions §1e). A new variant that needs genuinely new *behavior* (e.g. a real
carousel) is block work even though it maps to an existing family.

---

## 5. `tools/importer/` — starts nearly empty

Ships only `block-signatures.json` (the reuse registry) + `README.md` (the
rules). Parsers, transformers, `import-*.js`, `.bundle.js`, `page-templates.json`,
and `urls-*.txt` are **generated per migration** — see `migration-workflow.md`.
