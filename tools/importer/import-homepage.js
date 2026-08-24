/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMediaParser from './parsers/hero-media.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsPromoParser from './parsers/cards-promo.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/tangentenergy-cleanup.js';
import dmImagesTransformer from './transformers/tangentenergy-dm-images.js';
import sectionsTransformer from './transformers/tangentenergy-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-media': heroMediaParser,
  'columns-media': columnsMediaParser,
  'cards-promo': cardsPromoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Tangent Energy homepage — hero teaser with video, intro title/copy block, a Why Tangent AMP section with infographic image and video, and a two-up promo cards section linking to About Us and Tangent AMP. Includes site header/navigation and footer.',
  urls: [
    'https://www.tangentenergy.com/en_US.html',
  ],
  blocks: [
    {
      name: 'hero-media',
      instances: ['#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaser.auth-track.media-youtube.teaser--hero.teaser--no-accent-bar.aem-GridColumn.aem-GridColumn--default--12'],
    },
    {
      name: 'columns-media',
      instances: ['#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.section-container.section-container--centered.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)'],
    },
    {
      name: 'cards-promo',
      instances: ['#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.section-container.section-container--centered.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(4)'],
    },
  ],
  sections: [
    {
      id: 'hero',
      name: 'Hero',
      selector: '#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaser.auth-track.media-youtube.teaser--hero.teaser--no-accent-bar.aem-GridColumn.aem-GridColumn--default--12',
      style: null,
      blocks: ['hero-media'],
      defaultContent: [],
    },
    {
      id: 'intro-title',
      name: 'Intro',
      selector: '#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.deg-title.section-padding.aem-GridColumn.aem-GridColumn--default--12',
      style: null,
      blocks: [],
      defaultContent: ['#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.deg-title.section-padding.aem-GridColumn.aem-GridColumn--default--12 > div.title.auth-track > div.container > div.title__wrapper'],
    },
    {
      id: 'section-3',
      name: 'Why Tangent AMP',
      selector: '#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.section-container.section-container--centered.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)',
      style: 'grey',
      blocks: ['columns-media'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Promo Cards',
      selector: '#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.section-container.section-container--centered.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(4)',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY
// Order: cleanup (remove chrome/consent) -> dm-images (Scene7 -> anchors) -> sections (insert <hr> + section-metadata).
// Sections run last so section breaks are inserted after parsing and cleanup.
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
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

    // 1. beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
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

    // 4. afterTransform transformers (final cleanup + DM images + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path — MSM: land under the brand folder.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(`/tangent-energy${rawPath === '' ? '/index' : rawPath}`);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
