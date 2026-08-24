/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import pageHeroParser from './parsers/page-hero.js';
import profilesParser from './parsers/profiles.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/tangentenergy-cleanup.js';
import dmImagesTransformer from './transformers/tangentenergy-dm-images.js';
import sectionsTransformer from './transformers/tangentenergy-sections.js';

const parsers = {
  'page-hero': pageHeroParser,
  profiles: profilesParser,
};

const PAGE_TEMPLATE = {
  name: 'meet-the-team',
  description: 'Interior page: page-hero banner + a profiles block listing 6 leadership team members.',
  urls: ['https://www.tangentenergy.com/en_US/meet-the-team.html'],
  blocks: [
    { name: 'page-hero', instances: ['#mainContent div.teaser.teaser--hero.media-youtube'] },
    { name: 'profiles', instances: ['#mainContent div.section-container.section-container--centered'] },
  ],
  sections: [
    { id: 'hero', name: 'Page Hero', selector: '#mainContent div.teaser.teaser--hero.media-youtube', style: null, blocks: ['page-hero'], defaultContent: [] },
    { id: 'profiles', name: 'Leadership Team', selector: '#mainContent div.section-container.section-container--centered', style: null, blocks: ['profiles'], defaultContent: [] },
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

    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(`/tangent-energy${rawPath === '' ? '/index' : rawPath}`);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
