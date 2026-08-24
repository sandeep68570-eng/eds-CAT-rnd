/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Tangent Energy (Caterpillar DEG) site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. Header/nav and footer are auto-populated by the EDS
 * header/footer blocks, so they must be stripped from the body content.
 *
 * All selectors below were verified by reading migration-work/cleaned.html:
 *   - #onetrust-consent-sdk        (cleaned.html:710) OneTrust consent overlay
 *   - #onetrust-banner-sdk         (cleaned.html:713) OneTrust banner
 *   - div.cookie.aem-GridColumn    (cleaned.html:12)  DEG cookie clientlib block
 *   - .ot-cookie-banner            (cleaned.html:14)
 *   - .multimedia-cookie-warning   (cleaned.html:367,421) YouTube cookie blockers
 *   - .cookie-warning              (cleaned.html:368,422,626) inline cookie notices
 *
 * NOTE: .video-blocker (#multimedia-Po3mDk2hgf8BIkA-gallery, cleaned.html:408)
 * is intentionally NOT removed — despite the name it is the authorable YouTube
 * video poster (youtube-thumbnail img + play button), which the columns-media
 * parser extracts. Only the cookie-consent gates below are stripped.
 *   - div.header.aem-GridColumn    (cleaned.html:18)  DEG header/nav grid block
 *   - header.mega--nav             (cleaned.html:24)
 *   - .skip-to-content             (cleaned.html:20)  skip link
 *   - .skip-search-crawl           (cleaned.html:23)  search + mega nav wrapper
 *   - div.footer.aem-GridColumn    (cleaned.html:546) DEG footer grid block
 *   - iframe.ot-text-resize        (cleaned.html:977) OneTrust helper iframe
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent overlays / banners and the YouTube cookie-blockers that
    // sit in front of the real video content. Remove before block parsing so
    // parsers see the underlying media, not the consent gate.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      'div.cookie.aem-GridColumn',
      '.ot-cookie-banner',
      '.multimedia-cookie-warning',
      '.cookie-warning',
      // Source breadcrumb (interior pages) — EDS auto-generates its own
      // site-wide breadcrumb from the URL/nav, so strip the source one.
      '.cmp-breadcrumb',
      '.breadcrumb-msrp',
      // YouTube facade chrome that isn't the poster image: the material-icons
      // play glyph ("play_circle_outline") and the "<n> of <n>" slide counter.
      '.multimedia__item-count',
      '.youtube-play',
      'i.material-icons',
      // Build-and-price / MSRP / dealer-pricing modals injected by the DEG
      // `.list` (product/article grid) component. Pure non-authorable chrome
      // ("Enter a New Location", "Suggested Retail Price", "Dealer Price").
      '.modal.build-price',
      '.modal.msrp-info',
      '#build-price-modal-productCards',
      '#dealer-price-info-modal',
      '#msrp-info-modal',
      '#msrp-pim-info-modal',
      '.modal.fade',
      // Hidden duplicate filter list the DEG list component renders alongside
      // the visible product/article cards.
      '.degFilterListItem',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome: header/nav, skip links, site search, footer.
    // These are provided by the EDS header/footer blocks, not authored content.
    WebImporter.DOMUtils.remove(element, [
      'div.header.aem-GridColumn',
      'header',
      'nav',
      '.skip-to-content',
      '.skip-search-crawl',
      'div.footer.aem-GridColumn',
      'iframe',
      'link',
      'noscript',
      'style',
    ]);

    // Stray config/empty-state tokens the DEG list component prints as text
    // (e.g. "list-per-page"). Remove any paragraph whose entire text is one of
    // these so it doesn't pollute page content or meta descriptions.
    const NOISE_TOKENS = /^(list-per-page|items-per-page)$/i;
    element.querySelectorAll('p').forEach((p) => {
      if (NOISE_TOKENS.test(p.textContent.trim())) p.remove();
    });
  }
}
