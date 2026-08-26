import { optimizedPicture } from '../../scripts/dm.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'profiles-item';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'profiles-image';
      } else {
        div.className = 'profiles-body';
        // Mark action links (Connect / Email) so CSS can style them as buttons.
        div.querySelectorAll('a').forEach((a) => {
          const p = a.closest('p');
          if (p) p.classList.add('button-container');
        });
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = optimizedPicture(img.src, img.alt, false, [{ width: '400' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
