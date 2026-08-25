Good idea — let me verify the resource is real and useful before recommending it, rather than guessing.# Adding `aem.live/llms.txt` (and Key Doc Links) to the Repo Docs

## Verified — and yes, it helps
I fetched `https://www.aem.live/llms.txt`: it's a **valid, curated index of ~34 official EDS documentation links** (developer guides, block collection, performance, metadata, publishing, CDN/redirects/go-live, sidekick, admin/CLI APIs). It's specifically the "for LLMs" entry point Adobe publishes, so it's an ideal thing for an agent to consult during migration.

**Why it helps here:**
- A future agent reading AGENTS.md → sees the link → can pull authoritative EDS guidance (e.g. redirects, CDN/go-live, metadata) instead of guessing. It directly backs several of our conventions with the canonical source.
- It complements (doesn't replace) our repo docs: `llms.txt` = *platform* best practices; `docs/migration-conventions.md` = *this project's* methodology + corrections.

**One caveat (honest):** a link in AGENTS.md is a **pointer, not auto-loaded context** — I can `WebFetch` it on demand, but it isn't pulled in automatically every turn. So it's useful as a "consult this" reference, and I should cite the *specific* deep links our conventions rely on (redirects, CDN/go-live, metadata, performance) rather than only the index, so an agent doesn't have to crawl all 34.

## What I'll add
- **AGENTS.md** (`## Remember`): one line pointing to `https://www.aem.live/llms.txt` as the canonical EDS doc index.
- **`docs/migration-conventions.md`**: a short **"Reference docs"** section linking `llms.txt` **plus** the handful of deep links that map to our conventions:
  - Redirects & go-live → ties to the broken-links / CDN-`noindex` items
  - Metadata / SEO → ties to meta-description & fragment `noindex`
  - Performance → ties to the CWV guardrail
  - Block collection & markup → ties to "reuse before create"
  - Sidekick / publishing → ties to the content-lifecycle note

Let me confirm scope so I write the right amount (this also picks up the earlier "any other best practices?" question):# Add aem.live Doc References + Best-Practice Sections to Migration Docs

## Confirmed scope
- **Doc links:** add `llms.txt` **+ curated deep links** (annotated with which convention each backs).
- **Extra sections:** add **all three** — Broken-links/redirects policy, Pre-PR checklist, A11y + performance guardrails.

I verified `https://www.aem.live/llms.txt` is a valid, curated index of ~34 official EDS doc links — a legitimate reference for agents. Note: an AGENTS.md link is a *pointer* I can `WebFetch` on demand, not auto-loaded every turn — so citing the specific deep links (not just the index) is what makes it actionable.

## What I'll write

### 1. AGENTS.md (`## Remember`)
- One line: canonical EDS docs index → `https://www.aem.live/llms.txt` (agents consult on demand).

### 2. `docs/migration-conventions.md` — new sections
- **Reference docs** — `llms.txt` index plus deep links mapped to our conventions:
  - Redirects & go-live → broken-links / CDN-`noindex`
  - Metadata / SEO → meta-description & fragment `noindex`
  - Performance → CWV guardrail
  - Block collection & markup → "reuse before create"
  - Sidekick / publishing → content lifecycle
  - *(deep-link URLs will be taken from the verified `llms.txt`; I'll fetch it again at write time to copy exact paths rather than invent them)*
- **Broken links / redirects policy** — the concrete ~13 internal 404s we found (`/news`, 6 `/articles/*`, `/contact-us`, `/products/{compact-plus,c115,pg115,bevel}`, `/knowledge-hub/...`); policy = migrate target, neutralize link, or add a redirect (link to the aem.live redirects doc). Flagged as a real UX/crawl defect, not an SEO-score item.
- **Pre-PR verification checklist** — `npm run lint` clean; preview **both** viewports; compare to original; confirm PR has its `*.aem.page` preview link (AGENTS.md requires it).
- **A11y + performance guardrails** — a11y: semantic heading order, visible focus, token-driven contrast, `aria` for nav/search/mobile-menu. Perf ("don't regress 98–100"): LCP image handling, three-phase loading (eager/lazy/delayed), avoid render-blocking, keep CLS ~0.

## Checklist

### A. Write the additions
- [ ] Re-fetch `llms.txt` at write time; copy **exact** deep-link URLs (no invented paths)
- [ ] Add **Reference docs** section to `docs/migration-conventions.md`, each link annotated with the convention it supports
- [ ] Add **Broken links / redirects policy** with the concrete ~13-URL worked example
- [ ] Add **Pre-PR verification checklist**
- [ ] Add **A11y + performance guardrails**
- [ ] Add the one-line `llms.txt` pointer to AGENTS.md `## Remember` (keep it terse)
- [ ] Phrase everything as imperative, agent-followable rules (rule + *why* + source link)

### B. Verify & land
- [ ] `npm run lint` (docs-only change → should stay green; confirms nothing else broke)
- [ ] Commit the doc + AGENTS.md changes
- [ ] **Push** — blocked by the GitHub git opt-in (same as prior commits)

### C. Still-open, higher priority than docs (unchanged)
- [ ] **CI red:** `.eslintrc.js` `__dmRender__` allow-list commit (`eddba9d`) still not on origin → `npm run lint` fails in CI. Land first.
- [ ] Four local commits (ESLint fix, alt fix, `/content` normalization, methodology docs) are **committed but unpushed** — need the opt-in or your own push.

## Notes
- **Verification discipline:** I'll copy deep-link URLs straight from the live `llms.txt` at write time so no link is fabricated.
- **Docs vs. capability:** these links make an agent *able to consult* authoritative guidance; they don't auto-load or change tooling.
- **Biggest lever remains the unpushed commits** — more docs don't turn CI green or render the live site; the push does.
- Docs-only change; I won't touch `.agents/settings.json` or plugins.

> **Prepared in Plan mode — no files changed.** Approve + switch to Execute and I'll: re-fetch `llms.txt`, add the Reference-docs + broken-links + pre-PR + a11y/perf sections to `docs/migration-conventions.md`, and add the `llms.txt` pointer to AGENTS.md. Pushing to the PR still needs the git opt-in or your own push.
