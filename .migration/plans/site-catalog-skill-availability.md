# Refine the Starter Kit to Carry Only Forward-Looking, General Inputs

## Your points — I agree with all four; here's how each lands

**1. `tools/` (parsers/transformers/import-scripts) starts mostly empty — fine?**
✅ **Yes, that's correct and by design.** Those are **per-block / per-template artifacts generated *during* migration** — they populate as you migrate sites one by one. The starter kit deliberately ships an **empty-ish `tools/importer/`** with only the **inputs** that guide generation:
- `block-signatures.json` (seeded DEG signatures — an *input*, not generated)
- `README.md` (the rules for editors)
- *(no parsers/transformers/import-scripts, no bundles)* — created on first migration.
So a fresh repo = rules present, tooling empty, fills in as you go.

**2. `template-audit.md` is session-specific — shouldn't be a carried input.**
✅ **Fully agree.** It documents *this session's* 10-template reclassification — a **per-migration output**, not a general rule. **Exclude it from the kit.** Instead, carry the *concept*: a rule in the kickoff/conventions saying "**produce a fresh structure audit / Template Reuse Report for each site** (audit is an output you generate, not an input you copy)." The reusable part is the *method*, not this session's result.

**3. `msm-multi-brand.md` only shows en-us — add a Perkins multi-locale (zh_CN) example.**
✅ **Yes.** I'll add a **multi-locale section**: `/content/{brand}/{locale}/…` with `en-gb` + `zh-cn` (Perkins), how `brand.js` + locale resolution handle more than one locale, and per-locale nav/footer fragments. Makes the doc cover the real multi-locale case, not just single-locale.

**4. `migration-playbook.md` is retrospective ("what was built") — carry only forward-looking pointers.**
✅ **Agree.** The playbook is a *session record*. I'll **extract the forward-looking bits** (key commands, the step sequence, configs, manual tools.aem.live steps) into a general, reusable place, and **leave the retrospective playbook out of the kit**. Nothing in the kit should describe *this* migration's achievements.

## The refined kit = general, reusable inputs only

**Carry (inputs, general best-practice):**
- `docs/migration-kickoff.md` — single entry point (inputs + rules + flow)
- `docs/migration-conventions.md` — methodology §1a–1e + corrections A–H + reference links (all general rules)
- `docs/msm-multi-brand.md` — **+ new multi-locale (Perkins zh_CN) example**
- `docs/migration-workflow.md` — **new**: the forward-looking steps/commands/configs extracted from the playbook (no "what was built")
- `tools/importer/block-signatures.json` + `tools/importer/README.md`
- `scripts/brand.js`, `scripts/dm.js`; folded blocks (`hero`, `cards`, `columns-media`, `header`, `footer`, `breadcrumb`, `fragment`); token theming (`brand.css` + `tokens-{brand}.css` template)
- `AGENTS.md` pointers
- `docs/starter-kit.md` — **new**: the manifest + copy checklist + "new-repo day-1 / migrate-12-brands" sequence

**Do NOT carry (per-migration outputs, regenerate fresh):**
- `template-audit.md`, `site-catalog-*.md` (Tangent/Turner/MAK/Perkins), `migration-playbook.md` retrospective, generated parsers/transformers/import-scripts/bundles, generated `content/`.

## Checklist
- [ ] Add to `migration-conventions.md` / kickoff: **"template/structure audit is a per-migration OUTPUT you generate (Template Reuse Report), not an input to copy"** — encodes your point #2
- [ ] Edit `docs/msm-multi-brand.md`: add a **multi-locale example** — `/content/{brand}/{locale}/` with `en-gb` + `zh-cn` (Perkins), locale resolution, per-locale fragments
- [ ] Create `docs/migration-workflow.md`: forward-looking **commands + step sequence + configs + tools.aem.live manual steps** extracted from the playbook — strip all "what we built" narrative
- [ ] Create `docs/starter-kit.md`: the **manifest** — files to copy (marked *universal* vs *DEG-specific*), what each does, **excluded/regenerate-per-migration** list, copy order, prerequisites (`buildAutoBlocks` hook, `.eslintrc __dmRender__`, `.hlxignore tools/*`), and a **"migrate N new brands" day-1 sequence**
- [ ] Note the `tangentenergy-*` → optional `deg-*` rename (brand-agnostic despite the name) in the manifest
- [ ] Confirm in the manifest: fresh `tools/importer/` ships **only** signatures + README (empty of generated parsers/transformers) — your point #1
- [ ] `npm run lint`; stage the new/edited docs for your push

## Notes
- **Goal served:** a teammate drops this kit into a fresh boilerplate, and migrating **1 or 12 brands** follows the same best practices (structure-first, folding, registry-driven reuse, MSM, tokens, report-first) — because the inputs are **general and forward-looking**, not tied to this session.
- **Docs-only** changes (2 new docs, 1 edited doc, manifest); no code/content/re-import. Existing session docs (audit, catalogs, playbook) stay in *this* repo as history but are explicitly **excluded** from the kit.
- I won't fabricate — the manifest lists real files; the workflow doc extracts only what's actually in the playbook.

> **Prepared in Plan mode — no files changed.** Approve + switch to Execute and I'll: add the multi-locale Perkins example to `msm-multi-brand.md`, extract forward-looking steps into `docs/migration-workflow.md`, add the "audit is a per-migration output" rule, and write `docs/starter-kit.md` (manifest marking carried vs regenerate-per-migration) — then lint and stage. Existing `template-audit.md` / `site-catalog-*` / `migration-playbook.md` are left as session history, excluded from the kit.
