# Timeline rework

The homepage is a single timeline of everything made, written and saved, newest first.
Entries live in `apps/www/src/content/timeline/entries.ts`; posts come from MDX.
Filters above the timeline (`?filter=writing|projects|made|experiments|sport|books|links`) narrow it down by entry type.

## Content to correct

- [ ] Approximate dates (shown with `~`): bed and Potence lamp (`2022-09`, from the commit that added them).
- [ ] Hardware dates come from photo file creation dates; check they match when each piece was made.
- [ ] Project dates are GitHub repo creation dates; some projects started earlier or shipped later.
- [ ] Repos left out because they have no description: sunshine, wavcraft, ui, obsidian-plugin, shadow-overlay, siikafish, status-saver, playgrounds. Add descriptions to include them.
- [ ] Crosswind is listed and links to crosswind.social although its repo is private. Keep?
- [ ] Star counts are a snapshot from 2026-10-29. Fetch at build time?
- [ ] Experiment descriptions (p5, models, vocabulary, punchcard, epub) still point at placeholder pages from the Start rebuild.

## Books

- [ ] Goodreads shelves need a login (profile 150027885, 472 books; RSS and shelf pages return "Sign in"). Either make the shelves public or export the library as CSV (My Books → Import and export) and commit it.
- [ ] Book entries are ready (`type: 'book'`, cover beside title and author, greyscale until hover). Covers can come from Open Library by ISBN (`covers.openlibrary.org/b/isbn/<isbn>-L.jpg`), downloaded into the repo.
- [ ] Maybe Kindle reading days from the punchcard data.

## Sport

- [ ] Hand-picked Strava activities use Strava's embed. A native card in the site's style would need the Strava API (distance, time, map polyline).
- [ ] `/running` and `/strava` are no longer linked from the homepage; merge or retire them.

## Next steps

- [ ] Load entries in pages as you scroll, rendering the first page on the server.
- [ ] Filtered URLs (`/?filter=…`) are served the unfiltered prerendered page on Netlify and filter after hydration. Server rendering on Coolify fixes this.
- [ ] SQLite (Drizzle) for entries that don't live in git.
- [ ] `POST /api/ingest` server route: Standard Webhooks signature, dedupe on `source.platform + source.id`, download media to a volume.
- [ ] Crosswind: webhook destination (`WebhookGateway`, `MirrorPostToWebhookJob`, routes `x→webhook` and `bluesky→webhook`, update `docs/mirroring-rules.md`).
- [ ] Media entries: image grids, video, GIFs (muted loop), link cards, quotes.
- [ ] iOS Shortcut that posts photos and links to the ingest API.
- [ ] Mermaid in MDX posts, loaded only on posts that use it.
- [ ] Move hosting to Coolify (Node server, SQLite on a volume). Check coollabsio/coolify#11534 before using Compose previews there.
