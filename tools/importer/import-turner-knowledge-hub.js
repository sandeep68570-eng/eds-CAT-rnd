/* eslint-disable */
/* global WebImporter */

import pageHeroParser from './parsers/page-hero.js';
import resourceCardsParser from './parsers/resource-cards.js';
import columnsMediaParser from './parsers/columns-media.js';
import cleanupTransformer from './transformers/tangentenergy-cleanup.js';
import dmImagesTransformer from './transformers/tangentenergy-dm-images.js';
import sectionsTransformer from './transformers/tangentenergy-sections.js';

const parsers = {
  'page-hero': pageHeroParser,
  'resource-cards': resourceCardsParser,
  'columns-media': columnsMediaParser,
};

const PAGE_TEMPLATE = {
  name: 'turner-knowledge-hub',
  description: 'Turner knowledge hub: page-hero banner + intro + Latest Articles + resource-cards + columns-media Contact CTA.',
  urls: ['https://www.turner-powertrain.com/en_US/knowledge-hub.html'],
  blocks: [
    { name: 'page-hero', instances: ['#mainContent .teaser--hero'] },
    { name: 'resource-cards', instances: ['#mainContent ul.list__items.subListItems'] },
    { name: 'columns-media', instances: ['#mainContent .teaser--full-width'] },
  ],
  sections: [
    { id: 'hero', name: 'Page Hero', selector: '#mainContent .teaser--hero', style: null, blocks: ['page-hero'], defaultContent: [] },
    { id: 'articles', name: 'Latest Articles', selector: '#mainContent .list--blog', style: null, blocks: ['resource-cards'], defaultContent: [] },
    { id: 'contact', name: 'Contact CTA', selector: '#mainContent .teaser--full-width', style: 'dark', blocks: ['columns-media'], defaultContent: [] },
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
