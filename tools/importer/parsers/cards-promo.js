/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards.
 * Source: https://www.tangentenergy.com/en_US.html
 * Generated: 2026-08-21
 *
 * Structure (from library-description.txt): cards has 2 columns, one row per card.
 *   Cell 1: card image (mandatory) — Scene7, kept as-is for the DM transformer.
 *   Cell 2: text content — H3 title + description paragraph + "Learn More" CTA link.
 *
 * Each card in source is an .editorial-card__item whose <a> wraps image + text.
 * The card link (href) is applied to the "Learn More" CTA in cell 2.
 *   Card A → /en_US/about-us.html, Card B → /en_US/tangent-amp.html
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.editorial-card__item'));

  // Empty-block guard
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const link = item.querySelector('a.editorial-card__item-container, a[href]');
    const href = link ? link.getAttribute('href') : null;

    // CELL 1: card image (Scene7) — kept as-is for the DM transformer.
    const image = item.querySelector(
      '.editorial-card__item--img-wrap img, figure img, picture img, img'
    );

    // CELL 2: title + description + CTA.
    const contentCell = [];

    const title = item.querySelector('.inner__title h3, .inner__title h2, h3, h2');

    // SEO/a11y: backfill empty image alt from the card title so the DM
    // transformer doesn't emit the "Image without alt text" sentinel.
    if (image && !image.getAttribute('alt') && title) {
      image.setAttribute('alt', title.textContent.trim());
    }

    if (title) contentCell.push(title);

    const description = item.querySelector('.inner__body p, .inner__body, p');
    if (description) contentCell.push(description);

    // "Learn More" CTA — source renders it as a <span>; rebuild as a link using
    // the card's href so it becomes a proper CTA in the block.
    const ctaLabelEl = item.querySelector('.editorial-card__footer, .cat-follow');
    const ctaText = ctaLabelEl ? ctaLabelEl.textContent.trim() : '';
    if (href) {
      const cta = document.createElement('a');
      cta.href = href;
      cta.textContent = ctaText || 'Learn More';
      contentCell.push(cta);
    }

    // Only add the card row if it has meaningful content.
    if (image || contentCell.length) {
      cells.push([image || '', contentCell.length ? contentCell : '']);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
