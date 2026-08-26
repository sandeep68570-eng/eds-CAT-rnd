/* eslint-disable */
/* global WebImporter */
/**
 * Parser for profiles. Base: cards (one profile per row).
 * Source: https://www.tangentenergy.com/en_US/meet-the-team.html
 * Generated: 2026-08-21
 *
 * Structure: 2 columns, one row per team-member profile (6 total).
 *   Cell 1: headshot image (Scene7 <img>/<picture>, kept as-is for the dm-images transformer)
 *   Cell 2: H2 name + bold role paragraph + bio paragraphs + optional
 *           "Connect with X" (LinkedIn) and "Email X" (mailto) links.
 *
 * Source DOM (validated): the section repeats three parallel component groups
 * in document order — the name lives in a `.deg-title .title__wrapper h2`,
 * the headshot in a sibling `.media-youtube .multimedia__slide-media picture img`,
 * and the role/bio/links in a sibling `.texteditor .cmp-text`. There are 6 of
 * each, so they are zipped by index.
 */
export default function parse(element, { document }) {
  const names = Array.from(element.querySelectorAll('.deg-title .title__wrapper h2, .deg-title h2'));
  const mediaBlocks = Array.from(element.querySelectorAll('.media-youtube'));
  const bios = Array.from(element.querySelectorAll('.texteditor .cmp-text'));

  const count = Math.max(names.length, mediaBlocks.length, bios.length);

  // Empty-block guard.
  if (!count) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  for (let i = 0; i < count; i += 1) {
    const nameEl = names[i] || null;
    const mediaEl = mediaBlocks[i] || null;
    const bioEl = bios[i] || null;

    // CELL 1: headshot (Scene7 gallery image) — kept as-is for the DM transformer.
    // The gallery slide-media img is the headshot; exclude any youtube thumbnail.
    const image = mediaEl
      ? mediaEl.querySelector(
          '.multimedia__slide-media picture img:not(.youtube-thumbnail), .multimedia__slide-media img:not(.youtube-thumbnail), picture img, img'
        )
      : null;

    // CELL 2: name + role + bio + optional links.
    const contentCell = [];
    if (nameEl) contentCell.push(nameEl);
    if (bioEl) {
      // Push the bio's paragraph elements (role line, bio copy, LinkedIn/email
      // links) — preserves the <a> tags with their mailto/linkedin hrefs.
      Array.from(bioEl.children).forEach((child) => contentCell.push(child));
    }

    // Only add a profile row that has meaningful content.
    if (image || contentCell.length) {
      cells.push([image || '', contentCell.length ? contentCell : '']);
    }
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'profiles', cells });
  element.replaceWith(block);
}
