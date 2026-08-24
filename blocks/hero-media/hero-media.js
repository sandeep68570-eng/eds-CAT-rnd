/**
 * hero-media: full-bleed dark media banner.
 * The authored anchor is turned into a responsive <picture> by the DM/Scene7
 * auto-block. The import applied the "$cc-th$" (thumbnail-fit) Scene7 preset,
 * which bakes white side-padding INTO the delivered pixels so object-fit can
 * never fill edge-to-edge. Strip that preset here so the artwork bleeds to the
 * container edges on the navy background.
 *
 * Art direction: the source page shows a WIDE banner crop (4:1) on desktop and
 * a taller crop on mobile via a <source media> swap. The import only captured
 * the mobile crop, so on desktop we add a <source> pointing at the source's
 * wide banner asset to reproduce that responsive art direction.
 */
const WIDE_BANNER = 'https://s7d2.scene7.com/is/image/Caterpillar/CM20220927-b13b1-ee21e';

function stripThumbnailPreset(url) {
  return url.replace('$cc-th$&', '').replace('$cc-th$', '');
}

export default function decorate(block) {
  const picture = block.querySelector(':scope > div:first-child picture');

  if (!picture) {
    block.classList.add('no-image');
    return;
  }

  picture.querySelectorAll('source').forEach((source) => {
    if (source.srcset && source.srcset.includes('$cc-th$')) {
      source.srcset = stripThumbnailPreset(source.srcset);
    }
  });

  const img = picture.querySelector('img');
  if (img && img.src.includes('$cc-th$')) {
    img.src = stripThumbnailPreset(img.src);
  }

  // Desktop art direction: prepend a wide-banner <source> that matches the
  // source page's 4:1 desktop crop, so the wordmark + hexagons show uncropped.
  const wideSource = document.createElement('source');
  wideSource.media = '(min-width: 900px)';
  wideSource.setAttribute('srcset', `${WIDE_BANNER}?wid=2500&fmt=webp`);
  wideSource.type = 'image/webp';
  picture.prepend(wideSource);
}
