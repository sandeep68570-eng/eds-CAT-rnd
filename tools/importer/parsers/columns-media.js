/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: https://www.tangentenergy.com/en_US.html
 * Generated: 2026-08-21
 *
 * Structure (from library-description.txt): columns has multiple columns,
 * one row per layout. Here: a single content row with 2 cells.
 *   Cell 1: infographic Scene7 image (alt "Cat AMP Infographic - 7,200 MW managed")
 *   Cell 2: YouTube video — placed as a bare link so EDS auto-blocks it to an embed.
 *
 * The Scene7 <img>/<picture> is kept as-is for the Dynamic Media transformer.
 */
// Build the video representation for a column: prefer a real YouTube embed
// (bare watch URL auto-embeds), else fall back to the Scene7 poster image.
function buildVideoCell(scope, document) {
  const ytHolder = scope.querySelector('[data-ytvideoid], [data-videoid]');
  const videoId = ytHolder
    ? (ytHolder.getAttribute('data-ytvideoid') || ytHolder.getAttribute('data-videoid'))
    : null;
  if (videoId) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const a = document.createElement('a');
    a.href = url;
    a.textContent = url;
    return a;
  }
  // No YouTube id — use the poster/still image (Scene7), kept as-is for the DM transformer.
  const img = scope.querySelector('.multimedia__slide-media img:not(.youtube-thumbnail), picture img, img');
  return img || null;
}

// Collect the meaningful rich-text/media nodes from a text column, dropping
// empty paragraphs and cookie-consent boilerplate.
function collectColumnContent(col) {
  const nodes = [];
  col.querySelectorAll(':scope .cmp-text > *, :scope .texteditor > * , :scope > *').forEach((n) => {
    const text = n.textContent.trim();
    if (!text && !n.querySelector('img, picture, a')) return;
    if (/cookies are required|cookie settings/i.test(text)) return;
    nodes.push(n);
  });
  return nodes;
}

// Teaser layout (DEG `.teaser--checkerboard` / `.teaser--full-width`): a
// text-wrap column (heading + copy + CTA) beside an image-wrap column. Build a
// clean [textNodes, image] pair. Returns null if this isn't a teaser.
function parseTeaser(element, document) {
  if (!element.matches('.teaser') && !element.querySelector('.teaser__text-wrap, .teaser__img-wrap')) {
    return null;
  }
  const textWrap = element.querySelector('.teaser__text-wrap');
  const imgWrap = element.querySelector('.teaser__img-wrap');
  if (!textWrap && !imgWrap) return null;

  const textNodes = [];
  if (textWrap) {
    // Heading (h1–h4) + body paragraphs + CTA link. Pull from .inner if present.
    const scope = textWrap.querySelector('.inner') || textWrap;
    scope.querySelectorAll(':scope h1, :scope h2, :scope h3, :scope h4, :scope p, :scope a[href]').forEach((n) => {
      // Skip standalone CTA anchors here; we re-add a cleaned one below.
      if (n.tagName === 'A') return;
      const text = n.textContent.trim();
      // drop empty paragraphs and stray ISO date stamps the component injects
      if (!text) return;
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return;
      textNodes.push(n);
    });
    // CTA link — strip the leading material-icons glyph text ("call…") so the
    // label reads cleanly ("Download Now", "Get in Touch").
    const cta = textWrap.querySelector('a[href]');
    if (cta) {
      cta.querySelectorAll('i, .material-icons, [aria-hidden="true"]').forEach((g) => g.remove());
      const label = cta.textContent.trim().replace(/^call/i, '').trim();
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = label || cta.getAttribute('href');
      const p = document.createElement('p');
      p.append(a);
      textNodes.push(p);
    }
  }

  // Image cell (Scene7 img/picture kept as-is for the DM transformer).
  const img = imgWrap ? imgWrap.querySelector('picture img, img') : null;

  if (!textNodes.length && !img) return null;
  return [textNodes.length ? textNodes : '', img || ''];
}

export default function parse(element, { document }) {
  // Teaser CTA bands (checkerboard / full-width): text-wrap | image-wrap.
  const teaserCells = parseTeaser(element, document);
  if (teaserCells) {
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'columns-media',
      cells: [teaserCells],
    });
    element.replaceWith(block);
    return;
  }

  // Two-column grid: prefer the explicit aem grid columns (default--6). This
  // matches both the homepage (image | video) and interior pages (text | video).
  const gridCols = element.querySelectorAll(':scope .aem-Grid > .aem-GridColumn--default--6, :scope > .aem-Grid > .aem-GridColumn--default--6');
  let leftCol = gridCols[0] || null;
  let rightCol = gridCols[1] || null;

  // Fallback for the homepage layout where the two media cells are the
  // .media-youtube columns directly under the block.
  if (!leftCol || !rightCol) {
    const mediaCols = element.querySelectorAll('.media-youtube');
    leftCol = leftCol || mediaCols[0] || null;
    rightCol = rightCol || mediaCols[1] || null;
  }

  // LEFT CELL: infographic image (homepage) OR rich text (interior pages).
  let leftCell = '';
  if (leftCol) {
    const infographic = leftCol.querySelector('.multimedia__slide-media img:not(.youtube-thumbnail), .media-youtube picture img, picture img');
    if (infographic) {
      leftCell = infographic;
    } else {
      const content = collectColumnContent(leftCol);
      if (content.length) leftCell = content;
    }
  } else {
    // No grid detected — legacy homepage path: first infographic image.
    leftCell = element.querySelector('.multimedia__slide-media img:not(.youtube-thumbnail), .media-youtube picture img') || '';
  }

  // RIGHT CELL: video (YouTube embed or poster image).
  const rightCell = buildVideoCell(rightCol || element, document) || '';

  // Optional section heading ("Why Tangent® AMP?") that lives inside this block
  // element (homepage). On interior pages the heading stays as default content
  // outside the block, so this simply finds nothing.
  const heading = element.querySelector(
    ':scope > .deg-title .title__wrapper h2, :scope .title__wrapper > h2.heading-size-large, :scope > .title h1',
  );

  // Empty-block guard
  if ((!leftCell || (Array.isArray(leftCell) && !leftCell.length)) && !rightCell && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (heading) cells.push([heading, '']);
  cells.push([leftCell, rightCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
