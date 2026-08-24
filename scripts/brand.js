/*
 * Multi-brand (MSM) helpers.
 *
 * Content is authored per brand under /content/<brand>/… in this shared repo.
 * How the brand appears in the URL depends on environment:
 *
 *   - Local dev (`aem up --html-folder content`): the content dir is mounted at
 *     /content, so pages are at /content/<brand>/<locale>/… and the brand is
 *     the first path segment after /content.
 *   - Production (one EDS site per brand): each brand's site config maps its
 *     brand folder to the site root on its own domain (e.g. tangentenergy.com,
 *     turner-powertrain.com), so the brand is NOT in the URL path — it's the
 *     hostname. Fragments live at the root (/nav, /footer).
 *
 * getBrand() therefore resolves hostname-first, then falls back to the path,
 * and brandRoot() returns the correct fragment base for the current environment.
 */

// Known brands. Extend HOSTS when a brand gets its production domain(s).
export const BRANDS = ['tangent-energy', 'turner-powertrain'];
export const DEFAULT_BRAND = 'tangent-energy';

// Map production hostnames to a brand. Ordered most-specific first.
// Add new production domains / aliases here as brands go live.
const BRAND_HOSTS = [
  // Tangent Energy — production domain (apex + www)
  { match: /(^|\.)tangentenergy\.com$/i, brand: 'tangent-energy' },
  // Turner Powertrain — production domain (apex + www)
  { match: /(^|\.)turner-powertrain\.com$/i, brand: 'turner-powertrain' },
  // EDS preview/live hosts encode the site as {ref}--{repo}--{owner}.aem.page
  // / .aem.live. When each brand gets its own repo/site, the brand slug appears
  // in the host — match on it so preview/live resolve to the right brand.
  // (On a shared preview host that lacks the slug, the URL-path fallback in
  // getBrand() disambiguates instead.)
  { match: /turner-powertrain.*\.aem\.(page|live)$/i, brand: 'turner-powertrain' },
  { match: /(tangent-energy|tangentenergy).*\.aem\.(page|live)$/i, brand: 'tangent-energy' },
];

/**
 * Resolve the active brand.
 * 1) hostname (production, one site/domain per brand);
 * 2) URL path segment after an optional /content prefix (local dev);
 * 3) DEFAULT_BRAND.
 * @returns {string} a slug from BRANDS
 */
export function getBrand() {
  const host = window.location.hostname || '';
  const byHost = BRAND_HOSTS.find((h) => h.match.test(host));
  if (byHost) return byHost.brand;

  const segments = window.location.pathname
    .replace(/^\/content/, '')
    .split('/')
    .filter(Boolean);
  const first = (segments[0] || '').toLowerCase();
  return BRANDS.includes(first) ? first : DEFAULT_BRAND;
}

/**
 * Fragment/base path for the active brand's shared content (nav, footer, …).
 *  - Local dev: the brand IS in the path (/content/<brand>/…) → return that base.
 *  - Production: the brand folder is mapped to the site root → return '' so
 *    fragments resolve at the root (/nav, /footer).
 * @param {string} [brand] optional explicit brand
 * @returns {string} e.g. `/content/tangent-energy` locally, or `` in production
 */
export function brandRoot(brand = getBrand()) {
  const path = window.location.pathname;
  // Local dev (or any env) where the brand folder is present in the path.
  if (new RegExp(`(^|/)(content/)?${brand}(/|$)`).test(path)) {
    return path.includes('/content/') ? `/content/${brand}` : `/${brand}`;
  }
  // Production: brand folder mapped to root → fragments at the site root.
  return '';
}
