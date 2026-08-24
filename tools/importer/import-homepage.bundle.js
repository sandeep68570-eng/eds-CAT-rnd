/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-media.js
  function parse(element, { document: document2 }) {
    const bgImage = element.querySelector(
      ".teaser__img-wrap img, .figure_teaserBackgroundImage img, figure img, picture img, img"
    );
    const heading = element.querySelector(
      '.teaser__text-wrap h1, .teaser__text-wrap h2, h1, h2, [class*="title"] > h1, [class*="title"] > h2'
    );
    if (!bgImage && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      cells.push([[bgImage]]);
    }
    if (heading) {
      cells.push([[heading]]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function buildVideoCell(scope, document2) {
    const ytHolder = scope.querySelector("[data-ytvideoid], [data-videoid]");
    const videoId = ytHolder ? ytHolder.getAttribute("data-ytvideoid") || ytHolder.getAttribute("data-videoid") : null;
    if (videoId) {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const a = document2.createElement("a");
      a.href = url;
      a.textContent = url;
      return a;
    }
    const img = scope.querySelector(".multimedia__slide-media img:not(.youtube-thumbnail), picture img, img");
    return img || null;
  }
  function collectColumnContent(col) {
    const nodes = [];
    col.querySelectorAll(":scope .cmp-text > *, :scope .texteditor > * , :scope > *").forEach((n) => {
      const text = n.textContent.trim();
      if (!text && !n.querySelector("img, picture, a")) return;
      if (/cookies are required|cookie settings/i.test(text)) return;
      nodes.push(n);
    });
    return nodes;
  }
  function parse2(element, { document: document2 }) {
    const gridCols = element.querySelectorAll(":scope .aem-Grid > .aem-GridColumn--default--6, :scope > .aem-Grid > .aem-GridColumn--default--6");
    let leftCol = gridCols[0] || null;
    let rightCol = gridCols[1] || null;
    if (!leftCol || !rightCol) {
      const mediaCols = element.querySelectorAll(".media-youtube");
      leftCol = leftCol || mediaCols[0] || null;
      rightCol = rightCol || mediaCols[1] || null;
    }
    let leftCell = "";
    if (leftCol) {
      const infographic = leftCol.querySelector(".multimedia__slide-media img:not(.youtube-thumbnail), .media-youtube picture img, picture img");
      if (infographic) {
        leftCell = infographic;
      } else {
        const content = collectColumnContent(leftCol);
        if (content.length) leftCell = content;
      }
    } else {
      leftCell = element.querySelector(".multimedia__slide-media img:not(.youtube-thumbnail), .media-youtube picture img") || "";
    }
    const rightCell = buildVideoCell(rightCol || element, document2) || "";
    const heading = element.querySelector(
      ":scope > .deg-title .title__wrapper h2, :scope .title__wrapper > h2.heading-size-large, :scope > .title h1"
    );
    if ((!leftCell || Array.isArray(leftCell) && !leftCell.length) && !rightCell && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (heading) cells.push([heading, ""]);
    cells.push([leftCell, rightCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse3(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".editorial-card__item"));
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const link = item.querySelector("a.editorial-card__item-container, a[href]");
      const href = link ? link.getAttribute("href") : null;
      const image = item.querySelector(
        ".editorial-card__item--img-wrap img, figure img, picture img, img"
      );
      const contentCell = [];
      const title = item.querySelector(".inner__title h3, .inner__title h2, h3, h2");
      if (title) contentCell.push(title);
      const description = item.querySelector(".inner__body p, .inner__body, p");
      if (description) contentCell.push(description);
      const ctaLabelEl = item.querySelector(".editorial-card__footer, .cat-follow");
      const ctaText = ctaLabelEl ? ctaLabelEl.textContent.trim() : "";
      if (href) {
        const cta = document2.createElement("a");
        cta.href = href;
        cta.textContent = ctaText || "Learn More";
        contentCell.push(cta);
      }
      if (image || contentCell.length) {
        cells.push([image || "", contentCell.length ? contentCell : ""]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/tangentenergy-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "div.cookie.aem-GridColumn",
        ".ot-cookie-banner",
        ".multimedia-cookie-warning",
        ".cookie-warning",
        // Source breadcrumb (interior pages) — EDS auto-generates its own
        // site-wide breadcrumb from the URL/nav, so strip the source one.
        ".cmp-breadcrumb",
        ".breadcrumb-msrp",
        // YouTube facade chrome that isn't the poster image: the material-icons
        // play glyph ("play_circle_outline") and the "<n> of <n>" slide counter.
        ".multimedia__item-count",
        ".youtube-play",
        "i.material-icons"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "div.header.aem-GridColumn",
        "header",
        "nav",
        ".skip-to-content",
        ".skip-search-crawl",
        "div.footer.aem-GridColumn",
        "iframe",
        "link",
        "noscript",
        "style"
      ]);
    }
  }

  // tools/importer/transformers/tangentenergy-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/transformers/tangentenergy-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform3(hookName, element, payload) {
    const sections = payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-media": parse,
    "columns-media": parse2,
    "cards-promo": parse3
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Tangent Energy homepage \u2014 hero teaser with video, intro title/copy block, a Why Tangent AMP section with infographic image and video, and a two-up promo cards section linking to About Us and Tangent AMP. Includes site header/navigation and footer.",
    urls: [
      "https://www.tangentenergy.com/en_US.html"
    ],
    blocks: [
      {
        name: "hero-media",
        instances: ["#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaser.auth-track.media-youtube.teaser--hero.teaser--no-accent-bar.aem-GridColumn.aem-GridColumn--default--12"]
      },
      {
        name: "columns-media",
        instances: ["#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.section-container.section-container--centered.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)"]
      },
      {
        name: "cards-promo",
        instances: ["#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.section-container.section-container--centered.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(4)"]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "Hero",
        selector: "#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.teaser.auth-track.media-youtube.teaser--hero.teaser--no-accent-bar.aem-GridColumn.aem-GridColumn--default--12",
        style: null,
        blocks: ["hero-media"],
        defaultContent: []
      },
      {
        id: "intro-title",
        name: "Intro",
        selector: "#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.deg-title.section-padding.aem-GridColumn.aem-GridColumn--default--12",
        style: null,
        blocks: [],
        defaultContent: ["#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.deg-title.section-padding.aem-GridColumn.aem-GridColumn--default--12 > div.title.auth-track > div.container > div.title__wrapper"]
      },
      {
        id: "section-3",
        name: "Why Tangent AMP",
        selector: "#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.section-container.section-container--centered.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(3)",
        style: "grey",
        blocks: ["columns-media"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Promo Cards",
        selector: "#mainContent > div.responsivegrid.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(2) > div.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.section-container.section-container--centered.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(4)",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(`/tangent-energy${rawPath === "" ? "/index" : rawPath}`);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
