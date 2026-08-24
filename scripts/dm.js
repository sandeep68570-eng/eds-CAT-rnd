/*
 * Dynamic Media / Scene7 aware picture helper.
 *
 * EDS's vendored `createOptimizedPicture` (scripts/aem.js) is path-only: it
 * rebuilds the srcset from the URL pathname and DROPS every query parameter.
 * For Scene7 IS/Image template URLs and DM Open API URLs that is destructive —
 * the rendition/personalization lives in the query string.
 *
 * Rather than patch the vendored aem.js (which AGENTS.md forbids — it would be
 * lost on re-vendoring), block decorators import `optimizedPicture` from here.
 * It delegates DM URLs to the auto-block's renderer (window.__dmRender__,
 * registered in scripts.js) and everything else to the untouched vendored
 * createOptimizedPicture. Drop-in signature match, so callers only change the
 * import and the function name.
 */

import { createOptimizedPicture } from './aem.js';

/**
 * Build an optimized <picture> for src, preserving Dynamic Media params.
 * Variadic pass-through (alt, eager, breakpoints) so the vendored
 * createOptimizedPicture applies its own defaults for any omitted args.
 * @param {string} src image URL
 * @param {...*} rest alt, eager, breakpoints — forwarded to createOptimizedPicture
 * @returns {HTMLPictureElement}
 */
// eslint-disable-next-line import/prefer-default-export
export function optimizedPicture(src, ...rest) {
  const alt = rest[0] || '';
  if (typeof window !== 'undefined' && typeof window.__dmRender__ === 'function') {
    const dmPicture = window.__dmRender__(src, alt);
    if (dmPicture) return dmPicture;
  }
  return createOptimizedPicture(src, ...rest);
}
