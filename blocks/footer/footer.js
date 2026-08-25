import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { brandRoot, normalizeBrandLinks } from '../../scripts/brand.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // MSM: fetch the active brand's footer (content-first), then metadata/default.
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  let fragment = await loadFragment(`${brandRoot()}/footer`);
  if (!fragment) fragment = await loadFragment(footerPath);
  if (!fragment) return;

  // normalize brand-relative links/assets (/content/<brand>/… → env-correct path)
  normalizeBrandLinks(fragment);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Label bands by CONTENT, not position, so this works for any brand shape:
  //  - an "info" band contains social icon links (image links) + company text;
  //  - a "legal" band contains a link list + a copyright line.
  // Tangent has both bands; Turner has only a legal band.
  const bands = [...footer.querySelectorAll(':scope > div')];
  const hasImageLink = (band) => !!band.querySelector('a img');
  bands.forEach((band) => {
    if (hasImageLink(band)) band.classList.add('footer-info');
    else band.classList.add('footer-legal');
  });

  // info band — group company text into a column so social icons sit opposite.
  const infoBand = footer.querySelector('.footer-info');
  if (infoBand) {
    const socialList = infoBand.querySelector('ul');
    if (socialList) socialList.classList.add('footer-social');
    const textNodes = [...infoBand.children].filter((el) => el.tagName === 'P');
    if (textNodes.length) {
      const textCol = document.createElement('div');
      textCol.className = 'footer-info-text';
      textNodes.forEach((p) => textCol.append(p));
      infoBand.prepend(textCol);
    }
  }

  // legal band — link list + copyright (last paragraph).
  const legalBand = footer.querySelector('.footer-legal');
  if (legalBand) {
    const legalList = legalBand.querySelector('ul');
    if (legalList) legalList.classList.add('footer-links');
    const paras = legalBand.querySelectorAll(':scope p');
    const copyright = paras[paras.length - 1];
    if (copyright) copyright.classList.add('footer-copyright');
  }

  block.append(footer);
}
