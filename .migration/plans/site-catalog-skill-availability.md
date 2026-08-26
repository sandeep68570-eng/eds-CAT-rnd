Honest answer up front: **docs + AGENTS.md can be enough — but only if the docs are written as *build specs*, not as *pointers to code that no longer exists*.** Right now several of them say things like "see `scripts/dm.js`" or "`loadBrandTokens()` injects…" — that's descriptive of code you'd be leaving behind. If you carry no code, those references dangle, and a fresh session would **regenerate** the mechanics rather than copy them. Whether that reliably reproduces what we built depends on two things:

**What regenerates reliably from rules alone:**
- **component folding** — it's a *decision rule* (structure-first, one block + variants, block-signatures registry). Docs carry this well; the agent applies it.
- **`tools/importer/*`** — parsers/transformers/import-scripts are **generated during migration anyway** (that's the whole model). Docs steer them; nothing to carry.
- **token theming / `loadBrandTokens`** — the token contract + loading mechanism are documented; an agent can rebuild it, though the exact wiring is safer with a snippet.

**What is risky to "just regenerate" from prose:**
- **`__dmRender__` / `dm.js` wrapper** — this is a specific pattern (wrapper delegates DM URLs to `window.__dmRender__`, auto-block installed in `buildAutoBlocks`, eslint allow-list, aem.js kept pristine). Our current docs describe it *conceptually*, not as a build spec. A fresh session could get it subtly wrong. (Note: in a session *with the migration skills*, the DM auto-block is installed **by the skill from its own reference** — so it'd regenerate that way, not from our docs. If you're relying purely on docs, you need the spec inlined.)

So the crux: to make **docs genuinely self-sufficient**, the load-bearing mechanics need small **"how to rebuild" spec sections** (minimal code snippets + wiring) rather than references to files you're not carrying. Let me confirm which way you want it, since it changes what I write.# Make the Docs Self-Sufficient Build Specs (no code carried)

## Decision locked in
- **Docs must be prescriptive build specs** — minimal code snippets + wiring for each load-bearing mechanic, so a fresh session reproduces them from **docs alone**. De-reference "see `scripts/x.js`" pointers into self-contained specs.
- **Same migration skills assumed present** in the new session → docs steer *decisions*; skills provide *generic mechanics*; **but** the migration-specific mechanics (DM wrapper, token loader, folded blocks, brand resolution) are **not** guaranteed by generic skills, so those get full specs. Belt-and-suspenders: even with skills, the specs make reproduction deterministic.

## Honest verdict on "will docs be enough?"
**Yes — once they're build specs, not pointers.** The gap today is that the docs *describe* the code ("`loadBrandTokens()` injects…", "see `scripts/dm.js`"). Carrying no code means those must become **"here's how to build it"** with the actual snippet. I'll add a new **"Rebuild specs"** section covering exactly the pieces you named.

## What I'll add — a "Rebuild specs" appendix (in `migration-conventions.md` or a new `docs/rebuild-specs.md`)

Each = purpose + minimal code + where it wires in:

1. **`scripts/brand.js`** — `BRANDS`/`DEFAULT_BRAND`/`BRAND_HOSTS`, `getBrand()` (hostname→path→default), `brandRoot()`, `normalizeBrandLinks()` (the `/content/{brand}` → env-correct rewrite). Full small module — it's compact and load-bearing.
2. **`loadBrandTokens()`** — the eager-phase snippet that injects `/styles/tokens-{brand}.css` (skips default), + the `styles.css`→`brand.css`→token-file load order, + the token contract list.
3. **DM/Scene7 `dm.js` + `__dmRender__`** — the wrapper (`optimizedPicture` delegates DM URLs to `window.__dmRender__`, else vendored `createOptimizedPicture`), the auto-block registered in `buildAutoBlocks(main)`, the `.eslintrc` `no-underscore-dangle` allow-list, and the **"never edit `aem.js`"** rule. This is the riskiest-to-regenerate piece → most detailed spec.
4. **Component folding (hero, cards)** — the variant pattern: one block folder, `Block (variant)` authored in DA → `class="block variant"`, JS branches on variant. Skeleton `hero.js`/`cards.js` decorate structure + the CSS-scoping rule (`.block.variant`).
5. **`tools/importer/`** — restate: ships only `block-signatures.json` + `README.md`; parsers/transformers/import-scripts generated per migration (already covered; cross-link).
6. **Prereqs the boilerplate must have** — `buildAutoBlocks(main)` hook, eslint allow-list, `.hlxignore tools/*`, pristine `aem.js`.

## Checklist
- [ ] Add **"Rebuild specs"** (new `docs/rebuild-specs.md`, linked from kickoff + starter-kit) with specs 1–6 above — minimal code + wiring, self-contained
- [ ] **De-reference dangling pointers:** update `migration-conventions.md`, `migration-workflow.md`, `starter-kit.md` so "see `scripts/dm.js`/`brand.js`" become "build per `rebuild-specs.md` §X" (since no code is carried)
- [ ] Update `starter-kit.md` **CARRY** list: **docs only** — remove the code-file rows, replace with "rebuild from `rebuild-specs.md`"; keep `block-signatures.json` (data, not code) + importer README
- [ ] Keep the "same skills assumed" note, but state specs make it skill-independent for the load-bearing pieces
- [ ] `npm run lint` (docs only → green); stage for your push

## Notes
- **Result:** the carried set is **pure docs + `block-signatures.json`** — no `.js`/`.css` files. A fresh session reads kickoff → conventions → rebuild-specs and **reconstructs** `brand.js`, `loadBrandTokens`, `dm.js`/`__dmRender__`, and the folded blocks, then migrates with structure-first + registry + report-first.
- **One caveat I won't hide:** hand-rebuilt code can drift from what we have here (e.g. a subtle DM-param edge case). Specs minimize that, but "docs-only" is inherently a reconstruction, not a copy — if you later want byte-fidelity for the trickiest piece (`dm.js`), carrying that one file is the safer exception. I'll flag it in the doc, your call.
- Docs-only; no code/content/re-import. Existing code stays in *this* repo.

> **Prepared in Plan mode — no files changed.** Approve + switch to Execute and I'll write `docs/rebuild-specs.md` (build specs for brand.js, loadBrandTokens, dm.js/__dmRender__, folded hero/cards, prereqs), de-reference the code pointers in the other docs, update `starter-kit.md` to a **docs-only** CARRY list, lint, and stage.
