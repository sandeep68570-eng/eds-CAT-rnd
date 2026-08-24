/* eslint-disable */
/* global WebImporter */

import pageHeroParser from './parsers/page-hero.js';
import timelineParser from './parsers/timeline.js';
import cleanupTransformer from './transformers/tangentenergy-cleanup.js';
import dmImagesTransformer from './transformers/tangentenergy-dm-images.js';
import linksTransformer from './transformers/tangentenergy-links.js';
import sectionsTransformer from './transformers/tangentenergy-sections.js';
import { ensureMetaDescription } from './seo-utils.js';

const parsers = { 'page-hero': pageHeroParser, timeline: timelineParser };

const PAGE_TEMPLATE = {
  name: 'turner-about',
  brand: 'turner-powertrain',
  description: 'Turner about: page-hero + What-we-do + Our-history (default content) + timeline.',
  urls: ['https://www.turner-powertrain.com/en_US/about-us.html'],
  blocks: [
    { name: 'page-hero', instances: ['#mainContent > div.responsivegrid:nth-of-type(2) > div > div.teaser.auth-track.media-youtube.teaser--hero', '#mainContent .teaser--hero'] },
    { name: 'timeline', instances: ['#mainContent > div.responsivegrid:nth-of-type(4) > div > div.section-container.section-container--centered:nth-of-type(2)'] },
  ],
  sections: [
    { id: 'hero', name: 'Page Hero', selector: '#mainContent .teaser--hero', style: null, blocks: ['page-hero'], defaultContent: [] },
    { id: 'what-we-do', name: 'What We Do', selector: '#mainContent > div.responsivegrid:nth-of-type(4) > div > div.section-container.section-container--centered:nth-of-type(1)', style: null, blocks: [], defaultContent: [] },
    { id: 'history', name: 'Our History', selector: '#mainContent > div.responsivegrid:nth-of-type(4) > div > div.section-container.section-container--centered:nth-of-type(2)', style: 'highlight', blocks: ['timeline'], defaultContent: [] },
  ],
};

const transformers = [cleanupTransformer, dmImagesTransformer, linksTransformer, ...(PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : [])];

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
    ensureMetaDescription(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(`/turner-powertrain${rawPath === '' ? '/index' : rawPath}`);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
