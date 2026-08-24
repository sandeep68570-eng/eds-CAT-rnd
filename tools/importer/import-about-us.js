/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import pageHeroParser from './parsers/page-hero.js';
import cardsPromoParser from './parsers/cards-promo.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/tangentenergy-cleanup.js';
import dmImagesTransformer from './transformers/tangentenergy-dm-images.js';
import linksTransformer from './transformers/tangentenergy-links.js';
import sectionsTransformer from './transformers/tangentenergy-sections.js';
import { ensureMetaDescription } from './seo-utils.js';

const parsers = {
  'page-hero': pageHeroParser,
  'cards-promo': cardsPromoParser,
};

const PAGE_TEMPLATE = {
  name: 'about-us',
  brand: 'tangent-energy',
  description: 'Interior page: page-hero banner, intro paragraph + video (default content), and a three-up promo cards row (cards-promo).',
  urls: ['https://www.tangentenergy.com/en_US/about-us.html'],
  blocks: [
    { name: 'page-hero', instances: ['.teaser--hero'] },
    { name: 'cards-promo', instances: ['.editorial-card--3-col'] },
  ],
  sections: [
    { id: 'hero', name: 'Page Hero', selector: '.teaser--hero', style: null, blocks: ['page-hero'], defaultContent: [] },
    { id: 'intro', name: 'Intro', selector: '.responsivegrid:has(.texteditor .cmp-text)', style: null, blocks: [], defaultContent: [] },
    { id: 'cards', name: 'Promo Cards', selector: '.editorial-card--3-col', style: null, blocks: ['cards-promo'], defaultContent: [] },
  ],
};

const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  linksTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
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
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    ensureMetaDescription(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(`/tangent-energy${rawPath === '' ? '/index' : rawPath}`);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
