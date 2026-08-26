# Where to Encode "Hero Variants → One `hero` Block" for Future Migrations

## Direct answer: three layers, each read at a different point in the migration

During a migration, the decision "this source region is a hero → map it to the one flexible `hero` block (author-configured variation)" happens at the **page-analysis / block-mapping** step. To make future runs do that automatically, the instruction must live where an agent actually looks at that moment — which is **committed repo docs**, in three complementary places:

### 1. `AGENTS.md` — the always-read entry point (one line)
Every agent reads this first. Add a terse pointer so the rule is *discovered*:
> "Heroes: use the single flexible `hero` block for all hero variations (media-only / media+text / heading+subheading+button+media / video) — author-configured, not per-variant blocks. See `docs/migration-conventions.md`."

This is the trigger; the detail lives in the doc.

### 2. `docs/migration-conventions.md` — the "how to recognize & map" detail
A **"Hero mapping"** subsection giving the agent a recognition recipe it can apply to any source site:
- **Recognize a hero** = a top-of-page banner region (image/video background, often with heading/subheading/CTA). In DEG/Caterpillar source that's `.teaser--hero`, `.teaser`, `.media-youtube`, full-bleed banner teasers.
- **Always map to the one `hero` block** — never invent `page-hero-2`, `hero-video`, etc.
- **Map the parts to cells:** heading → H-cell; subheading/description → text cell; CTA link → button cell; image/video → media cell. Omit absent parts.
- **The block auto-adapts** (content-driven), so the parser's job is just to extract whatever parts exist.

### 3. `tools/importer/README.md` + the `hero` parser header — the migration-tooling instruction
This is where the person/agent *building the importer* looks:
- README rule: "Any source hero/banner region → the `hero` block; extract heading/subheading/button/media into cells; do not create per-variant hero blocks."
- The `hero.js` parser's own header comment documents the source selectors it recognizes and the cell layout it emits — so it's self-describing for the next migration.

## Why all three (not just one)
- **AGENTS.md** = guarantees *discovery* (read every session) but must stay terse.
- **conventions doc** = the *recognition + mapping recipe* (the actual how).
- **importer README / parser header** = the instruction at the *point of building the importer*, plus a reusable parser that encodes the mapping in **code** (the most reliable "memory" — it just runs).

The strongest form is #3's **parser**: once `tools/importer/parsers/hero.js` exists and encodes "hero region → flexible cell layout," future migrations *reuse it* rather than re-deriving — the code is the instruction.

## Checklist
- [ ] `AGENTS.md` (`## Remember`): add the one-line hero rule + pointer to the conventions doc
- [ ] `docs/migration-conventions.md`: add a **"Hero mapping"** subsection — how to recognize a source hero (incl. DEG `.teaser--hero`/`.media-youtube` cues), the "always one `hero` block" rule, and the part→cell mapping (heading/subheading/button/media)
- [ ] `tools/importer/README.md`: add the hero-mapping rule for importer authors
- [ ] (When the block is built) `tools/importer/parsers/hero.js` header: document recognized source selectors + emitted cell layout — the executable version of the instruction
- [ ] Cross-link `block-collection` (aem.live) in Reference docs for the variant/authoring pattern
- [ ] `npm run lint` (docs-only → green); stage for your push

## Notes
- This is **docs + (later) a parser** — no content/`.agents/settings.json` changes; existing pages untouched.
- **Order of operations:** these instructions pair with the flexible `hero` block from the previous plan. The instruction says "map to `hero`"; that only pays off once the block + parser exist. So ideally build the block/parser (previous plan) **and** add these instructions together — otherwise the instruction points at a block that isn't ready.
- Accuracy: EDS block identification during migration is done by the analysis/mapping step reading the source DOM; these docs steer *that* decision. The parser is what makes it deterministic.

> **Prepared in Plan mode — no files changed.** Two ways to proceed on approval + Execute: **(A)** add just these hero-mapping instructions (AGENTS.md + conventions + importer README) now, or **(B, recommended)** do it together with building the flexible `hero` block + `hero.js` parser from the previous plan, so the instruction and the block it points to land as one coherent change. Tell me A or B.
