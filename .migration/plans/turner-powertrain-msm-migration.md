# Remove Orphaned Pre-MSM Pages So the PR SEO Check Stops Auditing Them

## Why this is happening
- **Content ≠ code in EDS.** Your repo tracks only blocks/scripts/styles. Pages live in Document Authoring (org `sandeep68570-eng`, site `eds-cat-rnd`) and are served from the published index — independent of the git PR.
- The **build workflow** (`.github/workflows/main.yaml`) only runs `npm run lint`. It does **not** run SEO checks. The SEO/Lighthouse audit is the platform-side PR check that crawls the deployed preview and reads the site index.
- The **orphaned pages** were created at the site root before the MSM restructure. Their live counterparts now correctly live under `/tangent-energy/en-us/...`. The old copies were never removed from DA (the earlier attempt to delete under `content/` was blocked by the environment guardrail), so they remain published and keep getting crawled.

## Decisions locked in
- **Delete outright** (no redirects).
- **You perform the deletion in the Document Authoring UI**; I handle repo-side pieces and verification guidance.

## Orphaned pages to delete in Document Authoring
Site: **`sandeep68570-eng` / `eds-cat-rnd`** (open at `https://da.live/#/sandeep68570-eng/eds-cat-rnd`)

Delete these root-level (pre-brand-folder) documents:
- `/index`  *(old site root homepage)*
- `/nav`
- `/footer`
- `/en-us`
- `/en-us/about-us`
- `/en-us/meet-the-team`
- `/en-us/customer-segments`
- `/en-us/tangent-amp`

**Keep** everything under `/tangent-energy/...` and `/turner-powertrain/...` — those are the live brand pages.

## Checklist

### A. Delete stale pages in the DA UI
- [ ] Open `https://da.live/#/sandeep68570-eng/eds-cat-rnd`
- [ ] Delete each of the 8 documents listed above (root `index`, `nav`, `footer`, and the whole `en-us` folder incl. its 4 child pages)
- [ ] Do **not** touch the `tangent-energy/` and `turner-powertrain/` folders

### B. Purge them from preview + live (so the crawler/index drops them)
- [ ] After deleting in DA, ensure they're removed from **preview** and **live** (deleting the DA source alone doesn't always unpublish). Use the Sidekick's delete/unpublish on each removed path, or re-preview/re-publish the site index so the stale entries fall out of `query-index.json` / sitemap
- [ ] If any of these paths still resolve (not 404) after ~a minute, they're still in the live index — let me know and I can issue the `admin.aem.page` unpublish/delete calls (credentials inject automatically if the Settings opt-in is on)

### C. Make the git side clean (optional, not required for the SEO fix)
- [ ] Note: the local `content/en-us*`, `content/index*`, `content/nav*`, `content/footer*` files are **untracked** (never committed), so they have zero effect on the PR. No `git rm` needed
- [ ] If you want a tidy working tree, you can delete those local files yourself (the environment guardrail blocks me from deleting under `content/`); it won't change the PR

### D. Re-run and verify
- [ ] Re-trigger the PR's SEO/Lighthouse check (push a trivial commit or re-run the check)
- [ ] Confirm the audit now only covers brand pages (`/tangent-energy/...`, `/turner-powertrain/...`) and the outer-page failures are gone
- [ ] Confirm each deleted path returns 404 on the preview host

## Notes
- This is **safe** — no code or brand-folder content is affected; only the abandoned pre-MSM duplicates are removed.
- "Making the git pipeline aware" isn't applicable here: in EDS, merging `main` ships **code** and content publishes **separately** (per AGENTS.md). The SEO check reads published content, so the resolution is entirely content-side.
- If you'd rather I do Step B (and even Step A) for you via the admin API instead of clicking through the DA UI, say so and I'll run the unpublish/delete calls directly.

> **Prepared in Plan mode.** Executing the repo-side/admin pieces (or verifying via the preview host and admin API) requires exiting to Execute mode. Approve and I'll proceed with whatever parts you want me to run — or just do Steps A–B in the DA UI and I'll verify the result.

<!-- ci: re-run checks against post-MSM published content (2026-08-24) -->
