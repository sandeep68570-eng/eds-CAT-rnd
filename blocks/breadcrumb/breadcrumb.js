/*
 * Breadcrumb block — site-wide, auto-generated, brand-aware (MSM).
 *
 * Content is organized per brand under /content/<brand>/<locale>/… The trail is
 * derived from the current URL path: the brand+locale root is the "home" crumb,
 * and each interior path segment adds a crumb. Labels are resolved, in order:
 *   1. the active brand's nav fragment (matched by link pathname) — so header
 *      link labels (e.g. "Testimonials and Resources") stay authoritative, and
 *      the home crumb uses the nav's own home/brand label;
 *   2. the current page's H1 (for the final/current crumb);
 *   3. a title-cased version of the URL segment.
 *
 * Injected as an auto-block by scripts.js on interior pages only (hidden on the
 * brand homepage), so no per-page authoring is needed.
 */

import { brandRoot, getBrand } from '../../scripts/brand.js';

// Normalize a pathname for comparison: drop the local `/content` prefix,
// a trailing slash, and any `.html`/`.plain.html` suffix. Also lower-case and
// convert underscores to hyphens so a source nav's locale convention
// (`/en_US/...`) matches the migrated page paths (`/en-us/...`).
function normalizePath(pathname) {
  return (pathname
    .replace(/^\/content/, '')
    .replace(/\.plain\.html$/, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '')
    .toLowerCase()
    .replace(/_/g, '-')) || '/';
}

function titleCase(segment) {
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// Build a { normalizedPath -> label } map from the active brand's nav fragment,
// plus the home label (the brand/logo link — text, else its image alt).
async function loadNav() {
  const map = new Map();
  let homeLabel = null;
  try {
    let resp = await fetch(`${brandRoot()}/nav.plain.html`);
    if (!resp.ok) resp = await fetch('/nav.plain.html');
    if (!resp.ok) return { map, homeLabel };
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // Home-crumb label = the label of the link pointing at the brand root.
    // Prefer a TEXT link at root (e.g. "Tangent Energy Solutions"); fall back
    // to the logo link's image alt (e.g. "Turner") when the only root link is
    // the image-only logo. This is NOT the first nav item ("Products").
    const brandRootPath = normalizePath(brandRoot() || window.location.pathname.split('/').filter(Boolean).slice(0, 2).join('/'));
    let logoAltAtRoot = null;
    doc.querySelectorAll('a[href]').forEach((a) => {
      let pathname;
      try {
        ({ pathname } = new URL(a.getAttribute('href'), window.location.origin));
      } catch {
        return;
      }
      const norm = normalizePath(pathname);
      const text = a.textContent.trim();
      const alt = a.querySelector('img')?.getAttribute('alt')?.trim();
      const label = text || alt;
      if (!label) return;
      // capture the home label from the brand-root link
      if (norm === brandRootPath || (!homeLabel && norm.endsWith('/en-us'))) {
        if (text && !homeLabel) homeLabel = text; // text wins
        if (alt && !logoAltAtRoot) logoAltAtRoot = alt; // remember alt fallback
      }
      if (!map.has(norm)) map.set(norm, label);
    });
    if (!homeLabel) homeLabel = logoAltAtRoot;
  } catch {
    /* nav unavailable — fall back to title-cased segments */
  }
  return { map, homeLabel };
}

export default async function decorate(block) {
  const { map: navLabels, homeLabel } = await loadNav();
  const full = normalizePath(window.location.pathname);
  const segments = full.split('/').filter(Boolean);

  // Home crumb = brand root + locale (e.g. /tangent-energy/en-us). Fall back to
  // the first segment when the path doesn't include a recognizable brand.
  const brand = getBrand();
  let homeSegs;
  if (segments[0] === brand && segments.length >= 2) {
    homeSegs = segments.slice(0, 2); // brand + locale
  } else {
    homeSegs = segments.slice(0, 1);
  }
  const homePath = `/${homeSegs.join('/')}`;
  const interior = segments.slice(homeSegs.length);

  const crumbs = [{
    // homeLabel already applies the text-over-logo-alt preference for the root
    // link, so it's authoritative for the home crumb (map may hold the logo alt).
    label: homeLabel || navLabels.get(homePath) || titleCase(homeSegs[homeSegs.length - 1] || 'Home'),
    href: homePath,
  }];

  let acc = homePath;
  interior.forEach((seg, i) => {
    acc += `/${seg}`;
    const isLast = i === interior.length - 1;
    let label = navLabels.get(acc);
    if (!label && isLast) {
      const h1 = document.querySelector('main h1');
      label = h1 ? h1.textContent.trim() : titleCase(seg);
    }
    if (!label) label = titleCase(seg);
    crumbs.push({ label, href: isLast ? null : acc });
  });

  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-list';
  crumbs.forEach((crumb) => {
    const li = document.createElement('li');
    if (crumb.href) {
      const a = document.createElement('a');
      a.href = crumb.href;
      a.textContent = crumb.label;
      li.append(a);
    } else {
      const span = document.createElement('span');
      span.setAttribute('aria-current', 'page');
      span.textContent = crumb.label;
      li.append(span);
    }
    ol.append(li);
  });

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.append(ol);

  block.textContent = '';
  block.append(nav);
}
