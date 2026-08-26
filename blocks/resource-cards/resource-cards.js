import { optimizedPicture } from '../../scripts/dm.js';

/**
 * resource-cards: article/resource card grid (base block: cards).
 *
 * Each card = a thumbnail image + H3 title + short description that links to an
 * article page (/en_US/articles/testimonials/... or .../blogs/...). Visually a
 * bordered card grid; the WHOLE card is clickable. Used on the Testimonials and
 * Resources page (Testimonials + Blogs sections), each with three cards, with
 * the section H2 authored as default content above the block.
 *
 * Authored structure (per row = one card, 2 cells):
 *   cell 1: image (authored as a link; the DM/Scene7 auto-block converts it into
 *           a responsive <picture>)
 *   cell 2: body = H3 title + description paragraph. The article link is
 *           authored on the title (or anywhere in the body); the whole card is
 *           made clickable from the first anchor found.
 *
 * Authors omit/add cells, so decorate defensively.
 */
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'resource-cards-card-image';
      else div.className = 'resource-cards-card-body';
    });

    // Make the whole card clickable using the first link in the card (the
    // article link authored on the title). Keep the original anchor markup as
    // the visible title link; add a card-level class for cursor/hover styling.
    const link = li.querySelector('a[href]');
    if (link) {
      li.classList.add('resource-cards-linked');
      li.dataset.href = link.getAttribute('href');
      li.addEventListener('click', (e) => {
        // Let real clicks on the anchor itself behave normally.
        if (e.target.closest('a')) return;
        link.click();
      });
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = optimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
