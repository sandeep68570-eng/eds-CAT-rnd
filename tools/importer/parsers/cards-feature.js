/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards.
 * Source: https://www.turner-powertrain.com/en_US.html ("Why Turner transmissions?" section)
 * Generated: 2026-08-22
 *
 * Library convention (Cards): 2-column table, first row is the block name,
 * each subsequent row = one card with the image/icon in cell 1 and the text
 * content (heading + description [+ optional CTA]) in cell 2. This variant is
 * borderless with NO CTA per item — image + heading + description only.
 *
 * Each feature item therefore becomes one 2-cell row:
 *   cell 1 = image (Scene7 <picture>/<img>, kept as-is for the dm-images transformer)
 *   cell 2 = H3 heading + paragraph
 * The section H2 "Why Turner transmissions?" + intro paragraph are DEFAULT
 * CONTENT (handled outside this block) and are intentionally NOT included.
 *
 * Source markup: the 4 items are `.teaser--checkerboard` teasers. Each has a
 * `.teaser__img-wrap` (figure > picture > img) and a `.teaser__text-wrap`
 * (.inner > h3.teaserHeading + p.teaser-blog-content). The alternating
 * left/right ("checkerboard") layout is a CSS concern for the variant, so cell
 * order is normalized to image-then-text here regardless of source direction.
 */
export default function parse(element, { document }) {
  // Only the repeating feature items — exclude the intro title block (deg-title / H2).
  const items = element.querySelectorAll('.teaser--checkerboard');

  const cells = [];

  items.forEach((item) => {
    // Image cell: keep the picture (or bare img) as-is for the Scene7 transformer.
    const imgWrap = item.querySelector('.teaser__img-wrap');
    const picture = (imgWrap || item).querySelector('picture')
      || (imgWrap || item).querySelector('img');

    // Text cell: H3 heading + descriptive paragraph (no CTA for this variant).
    const textWrap = item.querySelector('.teaser__text-wrap') || item;
    const heading = textWrap.querySelector('h3, .teaserHeading, [class*="Heading"]');
    const paragraph = textWrap.querySelector('p.teaser-blog-content, p');

    // Skip malformed items missing all content.
    if (!heading && !paragraph && !picture) return;

    const textCell = [];
    if (heading) textCell.push(heading);
    if (paragraph) textCell.push(paragraph);

    // 2-column row: [image cell, text cell]. Pad with '' if a piece is absent.
    cells.push([picture || '', textCell.length ? textCell : '']);
  });

  // Empty-block guard: no feature items found — unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
