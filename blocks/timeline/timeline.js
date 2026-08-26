/**
 * timeline: a vertical company-history timeline (base block: timeline — new).
 *
 * Built for the Turner "Our history" section: a list of milestone entries, each
 * a year plus a short description, rendered down a vertical spine with markers
 * and cards that alternate left/right on desktop. The section H2 ("Our history")
 * is authored as default content above the block; the block itself carries no
 * heading and no images.
 *
 * Authored structure (per row = one entry, 2 cells):
 *   cell 1: the year (e.g. "1859") — rendered as the prominent marker label
 *   cell 2: the description text — one short paragraph
 *
 * Authors omit/add cells, so decorate defensively: a row with a single cell is
 * treated as year-only; the year is read from the first cell's text.
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  ol.className = 'timeline-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');
    li.className = 'timeline-entry';

    const yearCell = cells[0];
    const bodyCell = cells[1] || cells[0];

    const year = document.createElement('div');
    year.className = 'timeline-year';
    year.textContent = yearCell ? yearCell.textContent.trim() : '';

    const body = document.createElement('div');
    body.className = 'timeline-body';
    if (bodyCell && bodyCell !== yearCell) {
      // Move the authored body content (paragraph[s]) into the card.
      while (bodyCell.firstChild) body.append(bodyCell.firstChild);
    }

    const marker = document.createElement('span');
    marker.className = 'timeline-marker';
    marker.setAttribute('aria-hidden', 'true');

    li.append(marker, year);
    // Append the body only when the row actually had a description (defensive:
    // single-cell rows produce a year-only entry).
    if (body.textContent.trim() || body.children.length) {
      li.append(body);
    }
    ol.append(li);
  });

  block.textContent = '';
  block.append(ol);
}
