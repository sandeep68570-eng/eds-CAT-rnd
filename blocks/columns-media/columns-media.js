function youTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const parts = u.pathname.split('/');
    return parts[parts.length - 1];
  } catch (e) {
    return null;
  }
}

function decorateVideo(col) {
  const link = col.querySelector('a[href*="youtube.com"], a[href*="youtu.be"]');
  if (!link) return;
  const id = youTubeId(link.href);
  if (!id) return;

  const video = document.createElement('div');
  video.className = 'columns-media-video';
  video.setAttribute('role', 'button');
  video.setAttribute('tabindex', '0');
  video.setAttribute('aria-label', 'Play video');

  const poster = document.createElement('img');
  poster.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  poster.alt = '';
  poster.loading = 'lazy';
  poster.addEventListener('error', () => {
    poster.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }, { once: true });

  const playBtn = document.createElement('span');
  playBtn.className = 'columns-media-video-play';
  playBtn.setAttribute('aria-hidden', 'true');

  video.append(poster, playBtn);

  const startPlayback = () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    iframe.title = 'YouTube video player';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', '');
    video.replaceChildren(iframe);
  };
  video.addEventListener('click', startPlayback);
  video.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startPlayback();
    }
  });

  link.closest('p')?.remove();
  col.append(video);
}

// Some Scene7 assets (e.g. the stats infographic, native 1309x800) get padded
// with white when the DM auto-block forces `wid=2000`. Stripping the forced
// width lets Scene7 serve the native crop so the artwork fills its cell without
// white gutters. `fmt` (webp/jpg) is preserved for format negotiation.
function dropWidParam(url) {
  // Remove only the wid parameter, keeping the query string well-formed
  // (a leftover leading "&" or a dangling "?" would 403 on Scene7).
  return url
    .replace(/([?&])wid=\d+&?/gi, '$1')
    .replace(/[?&]$/, '');
}

function stripForcedWidth(pic) {
  pic.querySelectorAll('source').forEach((s) => {
    if (s.srcset) s.srcset = dropWidParam(s.srcset);
  });
  const img = pic.querySelector('img');
  if (img && img.src) img.src = dropWidParam(img.src);
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-media-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-media-img-col');
        }
        stripForcedWidth(pic);
      }
      decorateVideo(col);
    });
  });
}
