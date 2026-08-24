/* eslint-disable */
/* global WebImporter */
/**
 * Parser for timeline. Base: timeline (new block).
 * Source: https://www.turner-powertrain.com/en_US/about-us.html ("Our history").
 * Generated: 2026-08-24
 *
 * Source structure: the instance selector matches the "Our history"
 * .section-container. Inside it are:
 *   - a .deg-title holding the H2 "Our history" (DEFAULT CONTENT — excluded here,
 *     it is authored as a heading above the block)
 *   - 7 .teaser entries, each with:
 *       h2.teaserHeading         -> the year (e.g. "1859")
 *       p.teaser-blog-content    -> the description paragraph
 *     (an empty .teaser__img-wrap / .teaser-multimedia__slide-media carries no
 *      content and is ignored)
 *
 * Block model (matches blocks/timeline/timeline.js decorate):
 *   one row per entry, 2 cells: cell 1 = year (text), cell 2 = description.
 */
export default function parse(element, { document }) {
  // Each timeline entry is a .teaser. Scope to teasers only so the "Our history"
  // .deg-title heading (default content) is never pulled into the block.
  const entries = element.querySelectorAll('.teaser');

  const cells = [];
  entries.forEach((entry) => {
    // Year: the teaser's prominent heading.
    const yearEl = entry.querySelector('.teaserHeading, h2, h3, [class*="Heading"]');
    // Description: the teaser body paragraph.
    const descEl = entry.querySelector('.teaser-blog-content, .inner p, p');

    const year = yearEl ? yearEl.textContent.trim() : '';
    // Skip empty/non-entry teasers defensively.
    if (!year && !(descEl && descEl.textContent.trim())) return;

    // cell 1 = year (plain text); cell 2 = description paragraph element (preserved).
    cells.push([year, descEl || '']);
  });

  // Empty-block guard: if no entries were found, unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'timeline', cells });
  element.replaceWith(block);
}
