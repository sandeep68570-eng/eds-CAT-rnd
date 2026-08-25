# Importer — conventions for editors

Build-time migration tooling (NOT served — excluded via `.hlxignore`). Converts
source-site HTML into EDS content. Read
[`../../docs/migration-conventions.md`](../../docs/migration-conventions.md)
first; this README is the short operating rule for the files in this folder.

## The structure-first template rule (read before adding anything here)

**A template is keyed on page STRUCTURE (section skeleton / layout regions and
their order), NOT on which blocks it contains.**

- Blocks **added / removed / replaced / substituted** on a page whose region
  layout matches an existing template → **reuse that template**. Do **not** add
  a new `page-templates.json` entry or a new `import-*.js`.
- Create a **new template only when the page's structural shape is genuinely
  different** (different region layout/flow).
- A **new block is not a new template** — build the block + its parser once
  (reused everywhere) and add it to an existing template's block list.

## How the pieces map (per-type, not per-page)

- **`page-templates.json`** — one entry per **structure** (page-type). Its
  `blocks` list is the set of blocks that structure *may* use; blocks are
  **optional/substitutable** (a missing block is simply not emitted). Its `urls`
  list can hold **many** pages of that structure — 1 entry ⇒ N pages.
- **`import-<template>.js`** — one per template (structure), driven by a URL
  list. Adding more same-structure pages = add URLs, **not** a new script.
- **`parsers/<block>.js`** — one per **block**, block-scoped and
  structure-agnostic; runs wherever that block appears, across brands. Keep them
  defensive (tolerate absent/extra cells) so add/remove/replace "just works".
- **`transformers/*.js`** — site-wide, brand-parameterized (`payload.template.brand`).

## Report-first (mandatory)

Before generating importers/content for a page, set, or site, produce the
**Template Reuse Report** and get approval (see `migration-conventions.md`
§1b): page→template map, templates reused vs new (with structural justification
for any new one), blocks to create, blocks used per page, and a reuse scorecard.
Never silently create a template.

## Reuse before create

Survey existing templates, blocks, parsers, and transformers first. Only create
a new block when no existing one covers the structure; never duplicate a block
per brand.
