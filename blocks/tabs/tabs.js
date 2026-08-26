// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel (the row); the content cell is the tab label's sibling
    const tabpanel = block.children[i];
    const contentCell = tab.nextElementSibling;
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // Restructure the panel content into an image column + a text column so it
    // renders side-by-side like the source. Imported markup nests the picture
    // and the text paragraphs together inside the content cell.
    if (contentCell) {
      const picture = contentCell.querySelector('picture');
      const imageWrap = document.createElement('div');
      imageWrap.className = 'tabs-panel-image';
      const contentWrap = document.createElement('div');
      contentWrap.className = 'tabs-panel-content';

      if (picture) imageWrap.append(picture);

      // move all meaningful text blocks (skip picture-only wrappers)
      contentCell.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach((el) => {
        if (el.querySelector('picture')) return;
        if (el.textContent.trim()) contentWrap.append(el);
      });

      contentCell.textContent = '';
      if (picture) contentCell.append(imageWrap);
      contentCell.append(contentWrap);
    }

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);
}
