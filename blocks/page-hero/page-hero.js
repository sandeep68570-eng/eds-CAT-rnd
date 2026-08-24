/**
 * page-hero: interior-page banner.
 * An uppercase white H1 overlaid on the LEFT of a dark navy full-bleed Scene7
 * banner image (hexagonal energy-dashboard imagery on the right). Used by every
 * interior page.
 *
 * Authored structure (2 cells):
 *   row 1 cell 1: heading text (H1)
 *   row 1 cell 2: banner image (authored as a link; the DM/Scene7 auto-block
 *                 converts it into a responsive <picture>)
 *
 * The Scene7 "$cc-th$" (thumbnail-fit) preset bakes side-padding into the
 * delivered pixels, so we strip it here to let the artwork bleed edge-to-edge.
 */
function stripThumbnailPreset(url) {
  return url.replace('$cc-th$&', '').replace('$cc-th$', '');
}

export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];

  // Locate the image cell and the heading cell defensively (authors may omit
  // or reorder cells).
  const picture = block.querySelector('picture');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');

  if (picture) {
    const imageCell = picture.closest(':scope > div > div') || picture.parentElement;
    if (imageCell) imageCell.classList.add('page-hero-image');

    picture.querySelectorAll('source').forEach((source) => {
      if (source.srcset && source.srcset.includes('$cc-th$')) {
        source.srcset = stripThumbnailPreset(source.srcset);
      }
    });
    const img = picture.querySelector('img');
    if (img && img.src.includes('$cc-th$')) {
      img.src = stripThumbnailPreset(img.src);
    }
  } else {
    block.classList.add('no-image');
  }

  if (heading) {
    const textCell = heading.closest(':scope > div > div') || heading.parentElement;
    if (textCell) textCell.classList.add('page-hero-text');
  }

  // Any leftover cell with neither picture nor heading is treated as text.
  cells.forEach((cell) => {
    if (!cell.classList.contains('page-hero-image')
      && !cell.classList.contains('page-hero-text')) {
      cell.classList.add('page-hero-text');
    }
  });
}
