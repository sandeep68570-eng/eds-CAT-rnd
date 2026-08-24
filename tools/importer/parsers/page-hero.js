/* eslint-disable */
/* global WebImporter */
/**
 * Parser for page-hero. Base: hero.
 * Source: https://www.tangentenergy.com/en_US/about-us.html (and all interior pages).
 * Generated: 2026-08-21
 *
 * Structure: page-hero is a 1-column block used as the interior-page banner —
 * an uppercase white H1 title overlaid on a dark navy Scene7 banner image.
 *   Row 1: heading text (the H1, e.g. "About Us")
 *   Row 2: banner image (Scene7 <img>/<picture>, kept as-is for the dm-images transformer)
 *
 * Source DOM (validated against .teaser--hero):
 *   .teaser__text-wrap .inner > h1.teaserHeading  → heading
 *   .teaser__img-wrap figure.figure_teaserBackgroundImage > picture > img  → banner image
 */
export default function parse(element, { document }) {
  // Row 1: heading (the H1 title). Fall back across heading levels / class.
  const heading = element.querySelector(
    '.teaser__text-wrap h1, .teaser__text-wrap h2, h1.teaserHeading, h1, h2'
  );

  // Row 2: banner image (Scene7) — kept as-is for the DM transformer.
  const bgImage = element.querySelector(
    '.teaser__img-wrap img, .figure_teaserBackgroundImage img, figure img, picture img, img'
  );

  // Empty-block guard.
  if (!heading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: heading text. Preserve as an element so its semantics survive.
  if (heading) {
    cells.push([heading]);
  } else {
    cells.push(['']);
  }

  // Row 2: banner image.
  if (bgImage) {
    cells.push([bgImage]);
  } else {
    cells.push(['']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'page-hero', cells });
  element.replaceWith(block);
}
