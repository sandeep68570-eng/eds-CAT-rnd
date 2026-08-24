/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs. Base: tabs.
 * Source: https://www.tangentenergy.com/en_US/tangent-amp.html
 * Generated: 2026-08-21
 *
 * Structure (matches EDS "tabs" library convention): 2 columns, first row is the
 * block name (added by createBlock), then one row per tab.
 *   Cell 1: tab label (mandatory) — Lower Costs, Reliability, Simplicity, Security
 *   Cell 2: tab content (mandatory) — image (Scene7, kept as-is for the dm-images
 *           transformer) + heading + paragraph(s).
 *
 * Source DOM (validated against .tabs):
 *   .tabs__nav .tabs__nav-item h3                 → tab labels (4)
 *   .tabs__content .tabs__content-item            → panels (4), matching order
 *     .media-youtube .multimedia__slide-media img → panel image (may be absent /
 *                                                    lazy-loaded on inactive tabs)
 *     .texteditor .cmp-text                        → heading (bold span) + paragraphs
 *
 * Labels and panels are zipped by index. Inactive tab panels may be lazy-loaded
 * with a missing image in the scraped DOM — the parser extracts whatever is present.
 */
export default function parse(element, { document }) {
  const navItems = Array.from(element.querySelectorAll('.tabs__nav .tabs__nav-item, .tabs__nav-item'));
  const panels = Array.from(element.querySelectorAll('.tabs__content .tabs__content-item, .tabs__content-item'));

  const count = Math.max(navItems.length, panels.length);

  // Empty-block guard.
  if (!count) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  for (let i = 0; i < count; i += 1) {
    const navItem = navItems[i] || null;
    const panel = panels[i] || null;

    // CELL 1: tab label.
    let labelCell = '';
    if (navItem) {
      const labelEl = navItem.querySelector('h3, h2, h4');
      labelCell = labelEl ? labelEl.textContent.trim() : navItem.textContent.trim();
    }

    // CELL 2: tab content (image + heading + paragraphs).
    const contentCell = [];
    if (panel) {
      // Panel image (Scene7) — exclude youtube thumbnails; keep as-is for DM transformer.
      const image = panel.querySelector(
        '.multimedia__slide-media picture img:not(.youtube-thumbnail), .multimedia__slide-media img:not(.youtube-thumbnail), .media-youtube picture img'
      );
      if (image) contentCell.push(image);

      // Heading + paragraph copy from the rich-text editor.
      const rte = panel.querySelector('.texteditor .cmp-text, .cmp-text');
      if (rte) {
        Array.from(rte.children).forEach((child) => contentCell.push(child));
      }
    }

    if (labelCell || contentCell.length) {
      cells.push([labelCell || '', contentCell.length ? contentCell : '']);
    }
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
