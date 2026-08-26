# Migration Starter Kit — manifest for a fresh boilerplate repo

Lift these files into a fresh EDS boilerplate so a new repo starts with all the
best-practice decisions baked in: structure-first templates, block folding,
signature-driven reuse, MSM multi-brand + multi-locale, token theming,
report-first gate. Then migrating **1 or 12 brands** follows the same rules, and
any teammate can drive it.

**Target source platform:** DEG / Caterpillar (same CMS as Tangent / Turner /
MAK / Perkins). Items marked **[DEG]** are source-specific; **[universal]** items
apply to any source.

---

## 1. CARRY — durable inputs (copy into the new repo)

### Rule docs (`docs/`)
| File | What it gives you | Scope |
|------|-------------------|-------|
| `docs/migration-kickoff.md` | Single entry point: inputs you provide + rules + flow | universal |
| `docs/migration-conventions.md` | Methodology §1a–1e (structure-first, report-first, template=EDS, folding, registry) + corrections A–H + reference links | universal (corrections C-cleanup are [DEG]) |
| `docs/migration-workflow.md` | The repeatable pipeline, commands, clean-URL model, token contract, manual steps | universal |
| `docs/msm-multi-brand.md` | Brand folders, clean URLs, theming, **multi-locale (en_GB + zh_CN) example** | universal |
| `docs/rebuild-specs.md` | **Build specs** to reconstruct the code mechanics (brand.js, loadBrandTokens, dm.js/`__dmRender__`, folded hero/cards) from docs alone | universal (§3 is [DEG]) |

### Reusable code — DO NOT copy code files; REBUILD from specs

Per the docs-only decision, **no `.js`/`.css` files are carried.** The
load-bearing mechanics are reconstructed in the new repo from
[`rebuild-specs.md`](./rebuild-specs.md) (minimal snippets + wiring):

| Mechanic | Rebuild spec |
|----------|--------------|
| `scripts/brand.js` — brand/locale resolution, `brandRoot`, `normalizeBrandLinks` | rebuild-specs §1 |
| `loadBrandTokens()` + token load order + token contract | rebuild-specs §2 |
| DM/Scene7 `dm.js` wrapper + `__dmRender__` auto-block + eslint | rebuild-specs §3 [DEG] |
| Folded blocks `hero` / `cards` (variants); `columns-media` pattern | rebuild-specs §4 |
| Chrome (`header`/`footer`/`breadcrumb`/`fragment`), token files (`brand.css` + `tokens-<brand>.css`) | rebuild-specs §1–§4 + workflow token contract |

> **Optional byte-fidelity exception:** if you want an exact copy of the trickiest
> piece rather than a rebuild, carry just `scripts/dm.js` (the Scene7 `$`-param
> handling is the most error-prone to reconstruct). Everything else rebuilds
> cleanly from specs.

### Importer inputs (`tools/importer/`) — starts nearly empty
| File | What it gives you | Scope |
|------|-------------------|-------|
| `tools/importer/block-signatures.json` | Source-class → block(+variant) registry (deterministic reuse) | [DEG] seed — keep for DEG; empty it for a new platform |
| `tools/importer/README.md` | Structure-first + registry-first + reuse-before-create rules for editors | universal |

> **`tools/importer/` ships with ONLY those two files.** Parsers, transformers,
> `import-*.js`, `.bundle.js`, `page-templates.json`, `urls-*.txt` are
> **generated as you migrate** — do not copy this repo's generated ones into a
> fresh kit.

### AGENTS.md pointers
Copy the `## Remember` pointers that make a fresh session *find* the above:
kickoff-first, structure-first + report-first, block-signatures, one-block/
variants, `llms.txt`, DM via `dm.js`, block CSS never sets `:root`. (Merge into
the new repo's AGENTS.md; don't overwrite its boilerplate lines.)

---

## 2. DO NOT CARRY — per-migration outputs (regenerate fresh)

These are records/artifacts of *this* migration, not reusable inputs:
- `docs/template-audit.md` — this repo's structure reclassification (regenerate per site as the Template Reuse Report).
- `docs/site-catalog-*.md` (Tangent/Turner/MAK/Perkins) — per-site scope outputs.
- `docs/migration-playbook.md` — retrospective "what was built" (its forward-looking parts already live in `migration-workflow.md`).
- Generated `tools/importer/parsers/*`, `transformers/*`, `import-*.js`, `*.bundle.js`, `page-templates.json`, `urls-*.txt`.
- All generated `content/**`.

---

## 3. New-repo prerequisites (verify in the boilerplate before porting)

- `scripts/scripts.js` has a `buildAutoBlocks(main)` extension point (for the DM
  + breadcrumb auto-blocks). Standard scaffolds do; xwalk boilerplate may omit
  the `main` param — add it.
- `.eslintrc` (or flat config) allows `__dmRender__` in `no-underscore-dangle`.
- `.hlxignore` excludes `tools/*` (importer is build-time, not served).
- `scripts/aem.js` stays **vendored/pristine** — never edit; DM handling goes
  through `scripts/dm.js`.

---

## 4. Naming note (when transformers get generated)

The DEG transformers this migration generated were named `tangentenergy-*`
(cleanup/links/dm-images/sections) but are **brand-agnostic**. Since nothing is
carried, name them `deg-*` from the start in the new repo for clarity.

---

## 5. Day-1 in the new repo (migrate N brands, best-practice)

1. Drop in the CARRY **docs** (§1); verify prerequisites (§3).
2. **Reconstruct the mechanics** from [`rebuild-specs.md`](./rebuild-specs.md):
   `scripts/brand.js`, `loadBrandTokens()` + token load order, DM `dm.js` +
   `__dmRender__` auto-block (only if the source uses DM/Scene7), the folded
   `hero`/`cards` blocks, and `styles/brand.css` + a `tokens-<brand>.css`.
3. Read [`migration-kickoff.md`](./migration-kickoff.md); provide inputs (brand
   slug, domains, locales, URL list/sitemap, any known source-class→block
   mappings, theme source).
4. For each brand/site: **scope → Template Reuse Report → get approval** (§1b),
   then generate importers (reusing blocks via the registry) → import → theme →
   nav/footer → verify (both viewports) → pre-PR checklist.
5. Add the brand to `BRANDS`/`BRAND_HOSTS`, create `tokens-<brand>.css`, and set
   the tools.aem.live folder mapping + domain.
6. New blocks only when a region has no signature match and no existing family —
   and only after report approval; add its signature to the registry afterward.

Result: template count ≈ distinct **structures**; new blocks ≈ 0 for a
same-platform brand; clean URLs, per-brand themes, shared code.
