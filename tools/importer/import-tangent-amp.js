/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import pageHeroParser from './parsers/page-hero.js';
import columnsMediaParser from './parsers/columns-media.js';
import tabsParser from './parsers/tabs.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/tangentenergy-cleanup.js';
import dmImagesTransformer from './transformers/tangentenergy-dm-images.js';
import sectionsTransformer from './transformers/tangentenergy-sections.js';

const parsers = {
  'page-hero': pageHeroParser,
  'columns-media': columnsMediaParser,
  tabs: tabsParser,
};

const PAGE_TEMPLATE = {
  name: 'tangent-amp',
  description: 'Tangent AMP: page-hero banner, intro rich text, a What-is-DERMS section (text + columns-media video, grey), and a Why-Choose tabs block.',
  urls: ['https://www.tangentenergy.com/en_US/tangent-amp.html'],
  blocks: [
    { name: 'page-hero', instances: ['.teaser--hero'] },
    // Target only the inner two-column grid so the section H2 ("WHAT IS DERMS?")
    // and the two definition paragraphs above it survive as default content.
    { name: 'columns-media', instances: ['.section-container.section-container--centered.background-spacing-no-top:has(.deg-title) .responsivegrid:has(.aem-GridColumn--default--6)'] },
    // Target only the tabs block itself so the section H2 ("WHY CHOOSE TANGENT
    // AMP?") and its two intro paragraphs survive as default content.
    { name: 'tabs', instances: ['.section-container.section-container--centered:has(.tabs) .tabs.aem-GridColumn'] },
  ],
  sections: [
    { id: 'hero', name: 'Page Hero', selector: '.teaser--hero', style: null, blocks: ['page-hero'], defaultContent: [] },
    { id: 'intro', name: 'Intro', selector: '.deg-title.section-padding-no-bottom', style: null, blocks: [], defaultContent: [] },
    { id: 'derms', name: 'What is DERMS', selector: '.section-container.section-container--centered.background-spacing-no-top:has(.deg-title)', style: 'grey', blocks: ['columns-media'], defaultContent: [] },
    { id: 'why', name: 'Why Choose', selector: '.section-container.section-container--centered:has(.tabs)', style: null, blocks: ['tabs'], defaultContent: [] },
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
