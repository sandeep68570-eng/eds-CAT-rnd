# AGENTS.md

Edge Delivery Services. Read a block first. Omissions are in the repo or known.

## Avoid
- `scripts/aem.js` is vendored. Never edit.
- Markup comes from the backend. `curl localhost:3000/x.plain.html` first.
- `buildAutoBlocks` rewrites content before your block runs.
- Authors omit and add cells. Decorate defensively.
- No build step; devDependencies only.
- Scope CSS to `.blockname`; `-wrapper`/`-container` are section classes.
- `fragment/fragment.js` is the only cross-block import. Otherwise use `/scripts/`.

## Outdated
- `fstab.yaml`, `helix-query.yaml`, `paths.json` are retired. Config lives at tools.aem.live.

## Remember
- `npx -y @adobe/aem-cli up`: local code, previewed content.
- Merging `main` ships code; content publishes separately.
- A PR without a `{branch}--{repo}--{owner}.aem.page/{path}` link is rejected.
- All committed files are served. Use `.hlxignore`.
- Skills: `/plugin marketplace add adobe/skills`, then `aem-edge-delivery-services` (24 skills, incl. `docs-search`).
- Canonical EDS docs index (consult on demand): https://www.aem.live/llms.txt
- Migration methodology + conventions: see `docs/migration-conventions.md`. Follow it for every new site/brand/page — templates+reusable-blocks (don't create tooling per page), MSM brand folders, token theming, SEO/Lighthouse (staging `noindex` is host-imposed), responsive, plus specific corrections (DM images via `dm.js`, block CSS never sets `:root`, fragment link normalization).
- Starting a new migration? Read `docs/migration-kickoff.md` first (single entry point: inputs + rules + flow). Reuse detection: `tools/importer/block-signatures.json` (source-class → block+variant). One block, one name — variations are variants (`Hero (media)`, `Cards (promo)`), never new blocks.
- Block variants: one block, authored in DA as `Block (variant)` → `class="block variant"`; catalog + authoring/how-it-maps-to-code in `docs/block-variants.md`. Look differences = variants, not new blocks. Section/block fidelity rules (keep default content, correct block selection, element completeness, variants) in `docs/migration-conventions.md` §I.
- Templates are keyed on page **structure**, not blocks: add/remove/replace/substitute blocks ⇒ **same template**; new template ONLY for a genuinely new structural shape (a new block is build-once/reuse, never a new template). Before migrating any page/set/site, produce the **Template Reuse Report** and get approval first — never silently create a template. See `docs/migration-conventions.md` §1a–1c.
