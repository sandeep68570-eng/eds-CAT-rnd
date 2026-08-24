/* eslint-disable */
/* global WebImporter */

/**
 * SEO helpers for the import pipeline.
 *
 * `ensureMetaDescription(main, document)` runs AFTER WebImporter.rules.createMetadata
 * and guarantees the page's Metadata block has a non-empty Description — a hard
 * Lighthouse SEO requirement. When the source page lacked a meta description,
 * createMetadata emits a Metadata block with only a Title; this backfills a
 * Description from the first meaningful body paragraph (truncated to ~160 chars).
 */

// Ignore stray component tokens the DEG list/teaser components emit as text.
const NOISE = /^(list-per-page|of|play_circle_outline|\d{4}-\d{2}-\d{2})$/i;

function firstBodyParagraph(main) {
  const paras = main.querySelectorAll('p');
  for (let i = 0; i < paras.length; i += 1) {
    const text = paras[i].textContent.trim();
    // skip empties, single-word labels, and stray tokens
    if (text.length >= 40 && /\s/.test(text) && !NOISE.test(text)) return text;
  }
  return '';
}

// Fallback description for listing-style pages with no prose: combine the H1
// with the card/section headings (e.g. "Products: C90, Compact Plus, C115…").
function synthesizeFromHeadings(main) {
  const h1 = main.querySelector('h1');
  const lead = h1 ? h1.textContent.trim() : '';
  const items = [...main.querySelectorAll('h3')]
    .map((h) => h.textContent.trim())
    .filter((t) => t && !NOISE.test(t));
  if (lead && items.length) return `${lead}: ${items.join(', ')}.`;
  return lead || '';
}

function truncate(text, max = 160) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trim()}…`;
}

// eslint-disable-next-line import/prefer-default-export
export function ensureMetaDescription(main, document, explicit) {
  // The metadata block createMetadata appends is the last .metadata table.
  const metaBlocks = main.querySelectorAll('.metadata');
  const meta = metaBlocks[metaBlocks.length - 1];
  if (!meta) return;

  // Does a Description row already exist with a non-empty value?
  const rows = [...meta.querySelectorAll(':scope > div')];
  const hasDescription = rows.some((row) => {
    const cells = row.querySelectorAll(':scope > div');
    return cells[0] && /^description$/i.test(cells[0].textContent.trim())
      && cells[1] && cells[1].textContent.trim().length > 0;
  });
  if (hasDescription) return;

  // Priority: explicit template value → first body paragraph → headings synth.
  const desc = truncate((explicit && explicit.trim())
    || firstBodyParagraph(main)
    || synthesizeFromHeadings(main));
  if (!desc) return;

  const row = document.createElement('div');
  const key = document.createElement('div');
  key.textContent = 'Description';
  const val = document.createElement('div');
  val.textContent = desc;
  row.append(key, val);
  meta.append(row);
}
