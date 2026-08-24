/* eslint-disable */
/* global WebImporter */

import resourceCardsParser from './parsers/resource-cards.js';
import cleanupTransformer from './transformers/tangentenergy-cleanup.js';
import dmImagesTransformer from './transformers/tangentenergy-dm-images.js';
import sectionsTransformer from './transformers/tangentenergy-sections.js';

// The product grid renders as the DEG `.list` component (ul.list__items >
// li.list__item), which is exactly what the resource-cards parser handles
// (image + title + card link; description simply absent here).
const parsers = { 'resource-cards': resourceCardsParser };

const PAGE_TEMPLATE = {
  name: 'turner-products',
  description: 'Turner products listing: H1 (default content) + 6-item product cards grid (resource-cards, no description).',
  urls: ['https://www.turner-powertrain.com/en_US/products.html'],
  blocks: [
    // Target the visible list, not the hidden degFilterListItem duplicate.
    { name: 'resource-cards', instances: ['#mainContent ul.list__items.subListItems'] },
  ],
  sections: [
    { id: 'products', name: 'Products', selector: '#mainContent .section-container--centered', style: null, blocks: ['resource-cards'], defaultContent: [] },
  ],
};

const transformers = [cleanupTransformer, dmImagesTransformer, ...(PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : [])];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((t) => { try { t.call(null, hookName, element, enhancedPayload); } catch (e) { console.error(`Transformer failed at ${hookName}:`, e); } });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        // avoid duplicate matches across fallback selectors
        if (pageBlocks.some((b) => b.element === element)) return;
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) { try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name}:`, e); } }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(`/turner-powertrain${rawPath === '' ? '/index' : rawPath}`);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
