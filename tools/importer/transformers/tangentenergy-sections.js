/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Tangent Energy section breaks + section metadata.
 *
 * Template "homepage" has 4 sections (page-templates.json):
 *   1. hero          (style: null)
 *   2. intro-title   (style: null)
 *   3. section-3     (style: "grey")  → Why Tangent AMP light-grey background
 *   4. section-4     (style: null)
 *
 * Expected outputs on the test page:
 *   - Section breaks (<hr>): sections.length - 1 = 3
 *   - Section Metadata blocks: 1 (only section-3 has a style)
 *
 * Follows the reference implementation exactly: insert <hr> in beforeTransform
 * (while every section element still exists, before parsers replace them),
 * using a marker attribute to anchor styled sections' metadata; insert the
 * Section Metadata block in afterTransform. Iterate in reverse in both hooks so
 * live-element insertions never disturb not-yet-processed section positions.
 * Section selectors are taken verbatim from page-templates.json (DOM-verified).
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = payload.template.sections || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata needed
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess a replacement

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker inserted) the
    // original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — selector didn't match post-parse; skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
