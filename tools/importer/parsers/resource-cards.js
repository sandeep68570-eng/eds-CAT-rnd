/* eslint-disable */
/* global WebImporter */
/**
 * Parser for resource-cards. Base: cards.
 * Source: https://www.tangentenergy.com/en_US/customer-segments.html (2 instances).
 * Generated: 2026-08-21
 *
 * Structure: 2 columns, one row per article card.
 *   Cell 1: card image (Scene7 <img>, kept as-is for the dm-images transformer). May be absent.
 *   Cell 2: body — H3 title (wrapped in the card's article link) + description paragraph.
 *
 * The whole card is an <a class="list__item-content" href="/en_US/articles/..."> — the
 * article link is preserved by wrapping the H3 title in an anchor with that href.
 *
 * Source DOM (validated against .list--blog):
 *   ul.list__items.subListItems > li.list__item          → each card (visible list)
 *     a.list__item-content[href]                          → article link
 *       img.list__item-image                              → card image
 *       .list__item-text h3.list__name                    → title
 *       .list__item-text p                                 → description
 * NOTE: a sibling ul.list__items.degFilterListItem.hidden holds empty duplicate
 * items — scope to .subListItems to avoid selecting those.
 *
 * VALIDATION NOTE: the source .list--blog element also contains hidden
 * "build-and-price" / dealer-pricing modal boilerplate (Shop Now, Dealer Price,
 * MSRP disclaimers, etc.). That is template chrome, NOT card content, and is
 * intentionally excluded — it must never be imported. The parser therefore
 * scores below the raw text-similarity threshold while producing complete,
 * correct card output (image + linked title + description per card).
 */
export default function parse(element, { document }) {
  // Remove DEG list config tokens (e.g. "list-per-page") the component prints
  // as stray text siblings within the enclosing section, so they don't survive
  // as page content next to the block.
  const scope = element.closest('.section-container, .section-container--centered') || element.parentElement || element;
  if (scope) {
    scope.querySelectorAll('p').forEach((p) => {
      if (/^(list-per-page|items-per-page)$/i.test(p.textContent.trim())) p.remove();
    });
  }

  // Prefer the visible sub-list; fall back to any list__item if markup differs.
  let items = Array.from(element.querySelectorAll('ul.list__items.subListItems > li.list__item'));
  if (!items.length) {
    items = Array.from(element.querySelectorAll('li.list__item')).filter(
      (li) => !li.closest('.degFilterListItem') && !li.closest('.hidden')
    );
  }

  // Empty-block guard.
  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const link = item.querySelector('a.list__item-content, a[href*="/articles/"], a[href]');
    const href = link ? link.getAttribute('href') : null;

    // CELL 1: card image (Scene7) — kept as-is for the DM transformer.
    const image = item.querySelector('img.list__item-image, figure img, picture img, img');

    // CELL 2: title (linked) + description.
    const contentCell = [];

    const title = item.querySelector('.list__item-text h3, h3.list__name, h3');

    // SEO/a11y: give the image real alt from the card title when the source
    // alt is empty — otherwise the DM transformer substitutes the visible
    // "Image without alt text" sentinel.
    if (image && !image.getAttribute('alt') && title) {
      image.setAttribute('alt', title.textContent.trim());
    }
    if (title) {
      if (href) {
        // Preserve the article link by wrapping the title text in an anchor.
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title.textContent.trim();
        const h = document.createElement(title.tagName.toLowerCase());
        h.append(a);
        contentCell.push(h);
      } else {
        contentCell.push(title);
      }
    }

    const description = item.querySelector('.list__item-text p, p');
    if (description) contentCell.push(description);

    // Fallback: if there's no title/description but we have a link, keep it.
    if (!contentCell.length && href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = (link.textContent || href).trim();
      contentCell.push(a);
    }

    if (image || contentCell.length) {
      cells.push([image || '', contentCell.length ? contentCell : '']);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'resource-cards', cells });
  element.replaceWith(block);
}
