/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-media. Base: hero.
 * Source: https://www.tangentenergy.com/en_US.html
 * Generated: 2026-08-21.
 *
 * Structure (from library-description.txt): hero is 1 column.
 *   Row 1: block name (added by createBlock)
 *   Row 2 (optional): Background Image
 *   Row 3 (optional): Title / Subheading / CTA
 *
 * In this source the teaser text cell is empty (<p></p>); the visible content
 * is a Scene7 background image inside .teaser__img-wrap. The <img>/<picture> is
 * kept as-is so the Dynamic Media (Scene7) transformer can process it downstream.
 */
export default function parse(element, { document }) {
  // Background image (validated against source: .teaser__img-wrap > figure.figure_teaserBackgroundImage > picture > img)
  const bgImage = element.querySelector(
    '.teaser__img-wrap img, .figure_teaserBackgroundImage img, figure img, picture img, img'
  );

  // Optional heading — none present in this source, but handle the variation.
  const heading = element.querySelector(
    '.teaser__text-wrap h1, .teaser__text-wrap h2, h1, h2, [class*="title"] > h1, [class*="title"] > h2'
  );

  // Empty-block guard: nothing meaningful to render.
  if (!bgImage && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (single-column cell)
  if (bgImage) {
    cells.push([[bgImage]]);
  }

  // Row 3: optional title / subheading (single-column cell)
  if (heading) {
    cells.push([[heading]]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-media', cells });
  element.replaceWith(block);
}
