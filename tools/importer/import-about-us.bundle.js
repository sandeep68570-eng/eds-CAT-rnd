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

  // tools/importer/import-about-us.js
  var import_about_us_exports = {};
  __export(import_about_us_exports, {
    default: () => import_about_us_default
  });

  // tools/importer/parsers/page-hero.js
  function parse(element, { document: document2 }) {
    const heading = element.querySelector(
      ".teaser__text-wrap h1, .teaser__text-wrap h2, h1.teaserHeading, h1, h2"
    );
    const bgImage = element.querySelector(
      ".teaser__img-wrap img, .figure_teaserBackgroundImage img, figure img, picture img, img"
    );
    if (!heading && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (heading) {
      cells.push([heading]);
    } else {
      cells.push([""]);
    }
    if (bgImage) {
      cells.push([bgImage]);
    } else {
      cells.push([""]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "page-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse2(element, { document: document2 }) {
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
      if (image && !image.getAttribute("alt") && title) {
        image.setAttribute("alt", title.textContent.trim());
      }
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
        "i.material-icons",
        // Build-and-price / MSRP / dealer-pricing modals injected by the DEG
        // `.list` (product/article grid) component. Pure non-authorable chrome
        // ("Enter a New Location", "Suggested Retail Price", "Dealer Price").
        ".modal.build-price",
        ".modal.msrp-info",
        "#build-price-modal-productCards",
        "#dealer-price-info-modal",
        "#msrp-info-modal",
        "#msrp-pim-info-modal",
        ".modal.fade",
        // Hidden duplicate filter list the DEG list component renders alongside
        // the visible product/article cards.
        ".degFilterListItem"
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

  // tools/importer/transformers/tangentenergy-links.js
  function transform3(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const brand = payload && payload.template && payload.template.brand;
    if (!brand) return;
    element.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const m = href.match(/^\/(en[_-][a-z]{2})(\/[^?#]*?)?(?:\.html?)?([?#].*)?$/i);
      if (!m) return;
      const rest = (m[2] || "").replace(/\/$/, "");
      const suffix = m[3] || "";
      a.setAttribute("href", `/${brand}/en-us${rest}${suffix}`);
    });
  }

  // tools/importer/transformers/tangentenergy-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform4(hookName, element, payload) {
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

  // tools/importer/seo-utils.js
  function firstBodyParagraph(main) {
    const paras = main.querySelectorAll("p");
    for (let i = 0; i < paras.length; i += 1) {
      const text = paras[i].textContent.trim();
      if (text.length >= 40 && /\s/.test(text)) return text;
    }
    return "";
  }
  function truncate(text, max = 160) {
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trim()}\u2026`;
  }
  function ensureMetaDescription(main, document2) {
    const metaBlocks = main.querySelectorAll(".metadata");
    const meta = metaBlocks[metaBlocks.length - 1];
    if (!meta) return;
    const rows = [...meta.querySelectorAll(":scope > div")];
    const hasDescription = rows.some((row2) => {
      const cells = row2.querySelectorAll(":scope > div");
      return cells[0] && /^description$/i.test(cells[0].textContent.trim()) && cells[1] && cells[1].textContent.trim().length > 0;
    });
    if (hasDescription) return;
    const desc = truncate(firstBodyParagraph(main));
    if (!desc) return;
    const row = document2.createElement("div");
    const key = document2.createElement("div");
    key.textContent = "Description";
    const val = document2.createElement("div");
    val.textContent = desc;
    row.append(key, val);
    meta.append(row);
  }

  // tools/importer/import-about-us.js
  var parsers = {
    "page-hero": parse,
    "cards-promo": parse2
  };
  var PAGE_TEMPLATE = {
    name: "about-us",
    brand: "tangent-energy",
    description: "Interior page: page-hero banner, intro paragraph + video (default content), and a three-up promo cards row (cards-promo).",
    urls: ["https://www.tangentenergy.com/en_US/about-us.html"],
    blocks: [
      { name: "page-hero", instances: [".teaser--hero"] },
      { name: "cards-promo", instances: [".editorial-card--3-col"] }
    ],
    sections: [
      { id: "hero", name: "Page Hero", selector: ".teaser--hero", style: null, blocks: ["page-hero"], defaultContent: [] },
      { id: "intro", name: "Intro", selector: ".responsivegrid:has(.texteditor .cmp-text)", style: null, blocks: [], defaultContent: [] },
      { id: "cards", name: "Promo Cards", selector: ".editorial-card--3-col", style: null, blocks: ["cards-promo"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    transform2,
    transform3,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform4] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
        if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        elements.forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_about_us_default = {
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
      ensureMetaDescription(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(`/tangent-energy${rawPath === "" ? "/index" : rawPath}`);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_about_us_exports);
})();
