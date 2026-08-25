I want to capture this correctly. There's a real decision about *where* these durable lessons should live, since it changes what I do. Let me confirm before finalizing the plan.# Persisting This Session's Migration Corrections for Future Sessions

## Short answer to your question
**Yes — AGENTS.md is exactly the right mechanism**, and there are a few complementary places too. Any future session (you or someone else, even from a totally separate machine) reads AGENTS.md automatically at startup and follows its rules. That's how the corrections we made here become durable, shared conventions rather than one-session knowledge.

You picked: **write the detail to a new `docs/migration-conventions.md`, add a short pointer in AGENTS.md, capture all corrections.** Here's the plan.

## Where the knowledge will live (and why it persists)
- **`docs/migration-conventions.md` (new)** — the full, explained conventions with the *why* behind each. Survives across sessions because it's committed to the repo. (Note: `.hlxignore` already excludes `*.md`, so it won't be served on the site — docs-only, correct.)
- **`AGENTS.md` pointer (one line)** — keeps AGENTS.md terse (matching its current style) but guarantees discovery: every agent reads AGENTS.md first, sees the pointer, and loads the conventions. This is the part that makes future migrations "remember."
- **Why this works across people/sessions:** these are **committed repo files**, so they travel with the code. (Contrast: the excat skills' *own* internal instructions and any per-session memory are **not** in your repo and won't transfer — only what's committed does.)

## The corrections to capture (all of them)
Grouped as they'll appear in `docs/migration-conventions.md`:

**A. Rendering / EDS platform quirks**
- [ ] DM/Scene7 images render via the **`scripts/dm.js` wrapper** + `window.__dmRender__` auto-block; **`scripts/aem.js` stays pristine** (never edit vendored file).
- [ ] **`applySectionMetadata()` shim** in scripts.js — vendored `aem.js` `decorateSections` omits section-metadata handling.
- [ ] **Breadcrumb guard** — only build on the real page `main` (header/footer fragments re-trigger `buildAutoBlocks`); hidden on homepage; labels normalized (`/en_US/`→`/en-us/`, lowercase).
- [ ] **Code ships on merge to `main`; content publishes separately** — a page can 200 while looking unstyled if code isn't pushed (the live-render issue we hit).

**B. Theming / MSM multi-brand**
- [ ] Per-brand token files `styles/tokens-{brand}.css`; runtime `loadBrandTokens()` injects the active brand's tokens.
- [ ] `scripts/brand.js` resolves brand by hostname→path→default; `brandRoot()` scopes nav/footer/breadcrumb fragments.
- [ ] **Block CSS must NOT define `:root` token values** — block CSS loads after the token file and would override the theme. Tokens are the sole source.

**C. Import / parser & transformer fixes**
- [ ] **CTA band two-column** — `columns-media` `parseTeaser()` branch captures text-col + image-col (fixes "image covers whole section").
- [ ] **Alt-text backfill** — resource-cards/cards-promo parsers set image `alt` from the card title (kills the "Image without alt text" sentinel).
- [ ] **Internal-link rewrite** — `tangentenergy-links.js` transformer rewrites source `/en_US/…(.html)` → `/{brand}/en-us/…` (crawlable, no 404s); wire into every import script with a `brand` field.
- [ ] **Meta descriptions** — `seo-utils.js ensureMetaDescription()` (explicit → first paragraph → headings synth). Known gap: doesn't persist on the Turner products listing page.
- [ ] **Cleanup selectors** — strip cookie/consent, build-price/MSRP modals, source breadcrumb, `.degFilterListItem`, and stray list tokens (`list-per-page`, `items-per-page`).

**D. Publishing / SEO hygiene**
- [ ] Nav/footer **fragments** must stay published but be **`noindex` + sitemap-excluded** (metadata sheet `/**/nav`, `/**/footer` → `noindex, nofollow`).
- [ ] Pre-MSM root pages must be removed from DA + sitemap after a brand-folder restructure (the orphaned-page issue).

## Are there other ways to "remember"?
- **AGENTS.md + committed docs (what we're doing)** → *shared, portable, survives across people/sessions.* Best fit for your goal. ✅
- **CLAUDE.md** → already just points to AGENTS.md; no need to duplicate.
- **Encode rules into the code itself** → strongest form of "memory" (a convention that's enforced by the parser/transformer can't be forgotten). Most of our fixes already live in code (`dm.js`, `brand.js`, the parsers/transformers) — the docs explain *why* so nobody undoes them.
- **Per-session assistant memory** → exists, but it's **local to this environment and not committed**, so it will NOT reach someone else's session. Not suitable for your "someone else uses this tool" requirement.
- **The excat skills' internal instructions** → I can't edit those, and they're not in your repo, so they can't carry your project-specific corrections. AGENTS.md is the supported override point.

## Checklist (execution)
- [ ] Create **`docs/migration-conventions.md`** with sections A–D above (each rule + short "why" + the file it lives in)
- [ ] Add a **single pointer line** to `AGENTS.md` under `## Remember`, e.g. *"Migration conventions & corrections: see `docs/migration-conventions.md` (DM images, per-brand tokens, parser/SEO fixes, fragment noindex)."*
- [ ] Cross-link the new doc to the existing `docs/migration-playbook.md` and `docs/msm-multi-brand.md` (avoid duplicating; point to them)
- [ ] Keep AGENTS.md terse — detail lives in the doc, not inline
- [ ] (To actually reach other people) **commit + push** these files so they travel with the repo — same git opt-in blocker as before
- [ ] Verify: re-read AGENTS.md → pointer resolves → doc renders

## Notes
- This makes the corrections **followed by default in future migrations**: any agent reads AGENTS.md → sees the pointer → applies the conventions.
- The only thing that stops other people from getting these is if they're **not committed/pushed** — so the git push (opt-in) matters here too, just like for the code deploy.
- I won't touch `.agents/settings.json` or any plugin here — this is purely docs + an AGENTS.md pointer.

> **Prepared in Plan mode — no files changed.** Approve and switch to Execute, and I'll create `docs/migration-conventions.md` and add the one-line AGENTS.md pointer (and, if the GitHub opt-in is on, commit/push so other sessions inherit them).
