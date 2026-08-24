import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { brandRoot } from '../../scripts/brand.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Closes the mobile menu when Escape is pressed.
 * @param {Event} e The keyboard event
 */
function closeOnEscape(e) {
  if (e.code !== 'Escape') return;
  const nav = document.getElementById('nav');
  if (!nav || isDesktop.matches) return;
  if (nav.getAttribute('aria-expanded') === 'true') {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, false);
    const hamburger = nav.querySelector('.nav-hamburger button');
    if (hamburger) hamburger.focus();
  }
}

/**
 * Toggles the mobile menu open/closed.
 * @param {Element} nav The nav element
 * @param {Boolean} [forceExpanded] Force a specific state
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? forceExpanded
    : nav.getAttribute('aria-expanded') !== 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  document.body.style.overflowY = (expanded && !isDesktop.matches) ? 'hidden' : '';
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  }
  if (expanded) {
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * Builds the search form from the search section content.
 * Copy (placeholder) is read from the nav fragment; the form controls are
 * created here per the nav.plain.html contract (no form markup in the fragment).
 * @param {Element} section The search section element
 */
function decorateSearch(section) {
  const placeholder = (section.textContent || 'Search').trim() || 'Search';
  section.textContent = '';

  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.setAttribute('role', 'search');
  form.action = '/search';
  form.method = 'get';

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'nav-search-button';
  button.setAttribute('aria-label', 'Search');
  button.innerHTML = '<span class="icon icon-search" aria-hidden="true"></span>';

  form.append(input, button);
  section.append(form);
}

/**
 * Handles viewport changes between desktop and mobile.
 * @param {Element} nav The nav element
 */
function handleViewportChange(nav) {
  if (isDesktop.matches) {
    // reset mobile state when crossing to desktop
    toggleMenu(nav, false);
    document.body.style.overflowY = '';
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment — content-first (local `aem up --html-folder content`),
  // then fall back to the metadata/default path (DA/EDS production).
  // MSM: fetch the active brand's nav (content-first), then metadata/default.
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  let fragment = await loadFragment(`${brandRoot()}/nav`);
  if (!fragment) fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'search'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand: strip any button styling applied by decorateButtons
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
      const container = brandLink.closest('p');
      if (container) container.className = '';
    }
  }

  // nav links: mark the current page as active
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const { pathname } = window.location;
    navSections.querySelectorAll('a').forEach((a) => {
      try {
        if (new URL(a.href).pathname === pathname) a.setAttribute('aria-current', 'page');
      } catch {
        /* ignore malformed hrefs */
      }
    });
  }

  // search: build the form (controls live in JS, not the fragment)
  const navSearch = nav.querySelector('.nav-search');
  if (navSearch) decorateSearch(navSearch);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // keep layout correct across viewport changes (no refresh needed)
  isDesktop.addEventListener('change', () => handleViewportChange(nav));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
