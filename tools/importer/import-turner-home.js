/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import pageHeroParser from './parsers/page-hero.js';
import cardsPromoParser from './parsers/cards-promo.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import columnsMediaParser from './parsers/columns-media.js';

// TRANSFORMER IMPORTS (shared, site-wide)
import cleanupTransformer from './transformers/tangentenergy-cleanup.js';
import dmImagesTransformer from './transformers/tangentenergy-dm-images.js';
import sectionsTransformer from './transformers/tangentenergy-sections.js';

const parsers = {
  'page-hero': pageHeroParser,
  'cards-promo': cardsPromoParser,
  'cards-feature': cardsFeatureParser,
  'columns-media': columnsMediaParser,
};

const PAGE_TEMPLATE = {
  name: 'turner-home',
  description: 'Turner Powertrain homepage: page-hero, intro (default content), 6 product cards, Why-Turner feature grid, Knowledge Hub + Contact bands.',
  urls: ['https://www.turner-powertrain.com/en_US.html'],
  blocks: [
    { name: 'page-hero', instances: ['#mainContent > div.responsivegrid:nth-of-type(2) > div > div.teaser.auth-track.media-youtube:nth-of-type(1)'] },
    { name: 'cards-promo', instances: ['#mainContent > div.responsivegrid:nth-of-type(2) > div > div.section-container.section-container--centered.section-padding-no-bottom:nth-of-type(3)'] },
    { name: 'cards-feature', instances: ['#mainContent > div.responsivegrid:nth-of-type(2) > div > div.section-container.section-container--centered:nth-of-type(4) > div.cmp-container > div.section-container__inner > div.responsivegrid > div > div.section-container.section-container--centered:nth-of-type(1)'] },
    { name: 'columns-media', instances: [
      '#mainContent > div.responsivegrid:nth-of-type(2) > div > div.section-container.section-container--centered:nth-of-type(4) > div.cmp-container > div.section-container__inner > div.responsivegrid > div > div.section-container.section-container--centered:nth-of-type(2)',
      '#mainContent > div.responsivegrid:nth-of-type(2) > div > div.teaser.auth-track.media-youtube:nth-of-type(5)',
    ] },
  ],
  sections: [
    { id: 'hero', name: 'Page Hero', selector: '#mainContent > div.responsivegrid:nth-of-type(2) > div > div.teaser.auth-track.media-youtube:nth-of-type(1)', style: null, blocks: ['page-hero'], defaultContent: [] },
    { id: 'intro', name: 'Intro', selector: '#mainContent > div.responsivegrid:nth-of-type(2) > div > div.section-container.section-container--centered.section-padding-no-bottom:nth-of-type(2)', style: null, blocks: [], defaultContent: [] },
    { id: 'products', name: 'Products', selector: '#mainContent > div.responsivegrid:nth-of-type(2) > div > div.section-container.section-container--centered.section-padding-no-bottom:nth-of-type(3)', style: 'highlight', blocks: ['cards-promo'], defaultContent: [] },
    { id: 'why', name: 'Why Turner', selector: '#mainContent > div.responsivegrid:nth-of-type(2) > div > div.section-container.section-container--centered:nth-of-type(4)', style: null, blocks: ['cards-feature', 'columns-media'], defaultContent: [] },
    { id: 'contact', name: 'Contact', selector: '#mainContent > div.responsivegrid:nth-of-type(2) > div > div.teaser.auth-track.media-youtube:nth-of-type(5)', style: 'dark', blocks: ['columns-media'], defaultContent: [] },
  ],
};

const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
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
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // MSM: land under the Turner brand folder.
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(`/turner-powertrain${rawPath === '' ? '/index' : rawPath}`);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
