/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: rewrite internal source links to migrated MSM brand paths.
 *
 * The source markup links to live-site paths like `/en_US/products/c90.html`.
 * In this repo those pages live under `/content/<brand>/en-us/...` and publish
 * (via folder mapping) at `/<brand>/en-us/...`. Left unrewritten, every
 * internal link is broken (404) and flagged by Lighthouse as uncrawlable —
 * a major SEO hit.
 *
 * This runs in afterTransform (after parsers have built blocks, so it also
 * catches links inside block cells) and rewrites, for the CURRENT brand:
 *   /en_US            → /<brand>/en-us
 *   /en_US/x/y.html   → /<brand>/en-us/x/y
 * Locale case/underscore is normalized (en_US → en-us). External links
 * (http(s), mailto, tel, #fragments) and Scene7/DM asset URLs are left alone.
 *
 * Brand comes from payload.template.brand (set in each import script).
 */

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const brand = payload && payload.template && payload.template.brand;
  if (!brand) return; // no brand → leave links untouched

  element.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    // Only internal source paths that start with the locale segment.
    // Match /en_US or /en-us (any case), optional trailing path, optional .html.
    const m = href.match(/^\/(en[_-][a-z]{2})(\/[^?#]*?)?(?:\.html?)?([?#].*)?$/i);
    if (!m) return;
    // Skip Scene7 / DM asset links (they're absolute http, won't match anyway).
    const rest = (m[2] || '').replace(/\/$/, ''); // interior path, no trailing slash
    const suffix = m[3] || ''; // preserved query/fragment
    a.setAttribute('href', `/${brand}/en-us${rest}${suffix}`);
  });
}
