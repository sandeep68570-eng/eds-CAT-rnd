# Encode "Structure Defines the Template" + a Pre-Migration Report Gate

## Your rule, locked in
**A template is defined by page STRUCTURE, not by which blocks it contains.** Therefore:
- Blocks **added / removed / replaced / substituted** on a structurally-similar page → **SAME template** (reuse it).
- A **new template only** when the page's **structural shape** genuinely differs (homepage vs about-us vs faq vs product).
- Concretely from your examples: homepage / about-us / faq = different structures → different templates ✅. Product pages sharing a structure (even with different blocks) = **one** product template ✅. A page sharing about-us's structure but with different blocks = **reuse about-us** ✅.

This supersedes my earlier "new block ⇒ new template" framing — that was wrong. New block = build the block once (reusable); it does **not** create a template.

## What "structure" means (so it's applied consistently, not by vibe)
I'll define it operationally so future agents/parsers classify the same way:
- **Structure = the page's section skeleton / layout regions & their order** — e.g. hero-banner → intro → repeating-content-grid → CTA-band. It's about *arrangement of regions*, not the component inside each region.
- **Same structure** if regions map 1:1 even when a region's block differs (FAQ↔carousel), is added, or is dropped.
- **Different structure** if the region layout/flow itself differs (e.g. single-column article vs. two-column product-detail vs. dashboard grid).

## Two things to build

### 1. The rule — encode everywhere it's consulted
- **AGENTS.md**: one crisp line — "Templates are keyed on page **structure**, not blocks; add/remove/replace blocks ⇒ same template; new template only for a new structural shape. See migration-conventions.md."
- **docs/migration-conventions.md**: full "Template = structure, not blocks" section with the operational definition, the decision rule, and your worked examples (homepage/about/faq distinct; products shared; about-us-shaped reused).
- **Parsers/transformers/import scripts + page-templates.json**: add a header/comment convention documenting that a template maps to a *structure* and lists *optional/substitutable* blocks; ensure the "reuse-before-new-template" check is explicit. (Parsers are already per-block and structure-agnostic; the main change is documenting intent + how import scripts should list blocks as optional, so a missing/substituted block doesn't tempt a new script.)

### 2. The pre-migration **Template Reuse Report** (report-first gate)
Whenever asked to migrate a page / set / whole site, **produce this report FIRST**, before generating any importer/content:
- **Page → template** map (which existing template each URL reuses; structure match rationale).
- **Templates:** reused (existing) vs. **new** (only if structure is genuinely new) — with the structural justification for any "new".
- **Blocks to CREATE** (new components not in the library) + why.
- **Blocks USED per page** (which existing/ new blocks each page renders).
- **Reuse scorecard** (templates reused vs new; blocks reused vs new).

Before I finalize *how* this report behaves and whether to retrofit the current set, two decisions:# Encode "Structure Defines the Template" + Report-First Gate + Retrofit Audit

## The rule (locked in, authoritative)
**A template is keyed on page STRUCTURE, not on which blocks it contains.**
- Blocks **added / removed / replaced / substituted** on a structurally-similar page → **SAME template** (reuse).
- **New template only** when the page's **structural shape** genuinely differs.
- Examples: homepage / about-us / faq = distinct structures → distinct templates. Product pages sharing a structure (different blocks) → **one** product template. A page shaped like about-us with different blocks → **reuse about-us**.
- This **supersedes** my earlier "new block ⇒ new template" framing (that was wrong: a new block is build-once/reuse-forever; it does not create a template).

**Operational definition of "structure"** (so classification is consistent, not vibes): the page's **section skeleton — layout regions and their order** (e.g. hero → intro → repeating-grid → CTA band). Same structure if regions map 1:1 even when a region's block differs/added/dropped; new structure only if the region layout/flow itself differs.

## Your two decisions (confirmed)
- **Report-first = hard gate.** On any migrate request (page / set / site), produce the Template Reuse Report **and stop for approval** before creating any importer/template/content.
- **Retrofit = audit + propose.** Re-audit the existing 10 templates by structure; propose merging any that are the same shape. Propose only — no destructive change without approval.

## Deliverables

### 1. Encode the rule (docs + AGENTS.md)
- **AGENTS.md** (`## Remember`): one line — "Templates are keyed on page **structure**, not blocks; add/remove/replace blocks ⇒ same template; new template only for a new structural shape; always produce the Template Reuse Report and get approval before migrating. See `docs/migration-conventions.md`."
- **`docs/migration-conventions.md`**: add sections —
  - **"Template = structure, not blocks"** (operational definition + decision rule + your worked examples: homepage/about/faq distinct; products shared; about-shaped reused; FAQ↔carousel = same template).
  - **"Do we need `tools/`?"** (per-type-not-per-page; when it is/isn't needed) and **"What 'template' means in EDS"** (migration-time classification vs runtime = blocks+tokens+metadata; no template engine) — the earlier-planned subsections, folded in.
  - **"Report-first gate"** — the mandatory pre-migration report contract (below).

### 2. Encode the rule in the tooling (parsers/transformers/import scripts/page-templates.json)
- Add a **documented convention** (header comments) that a template maps to a **structure** and its block list is **optional/substitutable** — a missing or swapped block must **not** spawn a new import script.
- Confirm parsers stay **block-scoped & structure-agnostic** (they already are) so add/remove/replace "just works"; document that explicitly so future edits preserve it.
- Note in `page-templates.json` (via a top comment or README) that entries are **structure classifications**, blocks are the reusable parts.

### 3. The Template Reuse Report (report-first, produced BEFORE any migration)
A standard artifact I generate and **pause on** for every migrate request:
- **Page → Template** map (which existing template each URL reuses + structural-match rationale).
- **Templates:** reused vs **new** — with a structural justification required for any "new".
- **Blocks to CREATE** (new components not in the library) + why each is unavoidable.
- **Blocks USED per page** (existing/new block each page renders).
- **Reuse scorecard** (templates reused vs new; blocks reused vs new).
- Ends with: "Approve to proceed, or adjust classifications."

### 4. Retrofit audit of the existing 10 templates
- Classify current templates by **structure**; flag any that are the same shape (likely candidates: the several `page-hero + content` interior pages — about-us / customer-segments / turner-about / turner-knowledge-hub may share one structure).
- **Propose** consolidation (which to merge, projected new count) — **no changes without approval**.

## Checklist
- [ ] AGENTS.md: add the structure-first + report-first one-liner (keep terse)
- [ ] migration-conventions.md: add "Template = structure, not blocks" (definition, rule, worked examples incl. FAQ↔carousel and product-pages-shared)
- [ ] migration-conventions.md: add "Do we need `tools/`?" + "What 'template' means in EDS" subsections
- [ ] migration-conventions.md: add the **Report-first gate** contract (the exact report shape above) as a mandatory pre-migration step
- [ ] Tooling: add header-comment convention to import scripts + `page-templates.json` (template = structure; blocks optional/substitutable; reuse-before-new-template); confirm/document parsers are block-scoped & structure-agnostic
- [ ] Cross-link `block-collection` + `bulk-metadata` in Reference docs
- [ ] Produce the **retrofit audit**: classify the 10 existing templates by structure, propose consolidations (no destructive change) — write as a section in the catalog or a short `docs` note
- [ ] `npm run lint` (docs/comment-only → stays green); stage everything for your side (you push)

## Notes
- **Non-destructive:** docs + comments + a proposal. I will **not** merge/delete any existing template or regenerate content without your explicit OK on the audit.
- **Behavioral, not magic:** these docs/comments make future agents *follow* structure-first + report-first. The **report-first gate becomes a real stop** because it's written as a mandatory step I adhere to each migration.
- Accuracy: EDS has **no** template engine — reuse = shared blocks + tokens + metadata-by-path; template classification is a migration-time construct. I won't overstate it.
- Git: I stage; you commit/push (push blocked in this env). No `.agents/settings.json`/plugin changes.

> **Prepared in Plan mode — no files changed.** Approve + switch to Execute and I'll: encode the structure-first + report-first rule in AGENTS.md and `docs/migration-conventions.md`, add the tooling header-comment convention, run the retrofit structure audit of the existing 10 templates (proposal only), lint, and stage it all for your push.
