# Timeline rework

The homepage is a single timeline of everything made, written and saved, newest first.
Entries live in `apps/www/src/content/timeline/entries.ts`; posts come from MDX.
Filters above the timeline are chips that switch on and off; any number can be on (`?filter=projects,work`), and with none on everything shows. `?order=oldest` flips the order.
Every entry has a page: posts, experiments and collections their existing routes, everything else `/<slug>` (from its title, see `entryPath` in `content/timeline/index.ts`), all prerendered.

## Content to correct

- [ ] Approximate dates (shown with `~`): bed and Potence lamp (`2022-09`, from the commit that added them).
- [ ] Hardware dates come from photo file creation dates; check they match when each piece was made.
- [ ] Project dates are GitHub repo creation dates; some projects started earlier or shipped later.
- [ ] Repos left out because they have no description: sunshine, wavcraft, ui, obsidian-plugin, shadow-overlay, siikafish, status-saver, playgrounds. Add descriptions to include them.
- [ ] Crosswind is listed and links to crosswind.social although its repo is private. Keep?
- [ ] Star counts are a snapshot from 2026-11-19. Fetch at build time?
- [ ] Experiment descriptions (p5, models, vocabulary, punchcard, epub) still point at placeholder pages from the Start rebuild.

## Client work

- [ ] All 13 client work dates are guesses (the Notion page has none), from the page's order, App Store IDs and screenshot dates. Please correct them, ideally with start and end months.
- [ ] tiny.ink (mentioned under Parity) doesn't respond anymore.
- [ ] Polo's Pretty Paper links to its App Store page, which answered with rate limits when checked, so it may be gone like Monota's.

## Media

- [ ] Screenshots in `apps/www/src/content/timeline/media/` were taken on 2026-11-18 (live sites, README demos, the p5 and models pages on peetzweg.com). Retake them when a project changes.
- [ ] No media yet: Aves, Polo's Pretty Paper, OpenGov Tip, polkadot-dapp-template, both TPC issues and the posts.
- [ ] Client work and side project pictures come from the Client Work and Software Side Projects Notion pages; the Notion Input and EPUB speed reader clips from their tweets.
- [ ] After adding or replacing a file in `media/`, run `pnpm media:sizes`.
- [ ] 10 of the 11 monthly Spotify playlists (2019-08 to 2020-06) return 404, so they are private or deleted. Only Hype 2020.01 is listed. Make them public again to bring them back: `4T8B45N4PfSSGGy44XapPf`, `66WfauOx6VLoaVhAD3NVOI`, `1mBpXfM0xWXyxdCcVULzR9`, `1l3h8FIMTadft71KTPGPCP`, `4bzzBlVTwvN2Rzszs4BJZJ`, `1RuE5bOqKSJ3GoXZlN6srm`, `7K8VtjkGc0hStLFkkzs4hG`, `710E0jCXYWXKXyTTRnEj8N`, `2DSDS3yNDjMogrSKwbZoC4`, `6pjzD4VwszhPdBbmsFgKEG`.
- [ ] `src/content/kindle.json` is a copy of `libs/db/src/data/kindle.json` and ships to the client (~8 KB gzipped) for the punchcard. Moves to the database later.

## Tweets and videos

- [ ] Pick the tweets that mattered and send their IDs or URLs. `pnpm tweets:pull <id or URL>` saves each one to `content/timeline/tweets/<id>.json`; then add `tweet('<id>')` to `tweets` in `entries.ts`. They render with react-tweet in X's layout, with their photos and videos, under Writing.
- [ ] Tweet media still loads from pbs.twimg.com and video.twimg.com, so it breaks if a tweet is deleted. Download it next to the JSON if that matters.
- [ ] All 7 videos from youtube.com/@peetzweg are listed (6 OpenDisplay demos and a gravel ride). Remove the ones that don't belong; new ones need a `youtube(...)` line and a `youtube-<id>.webp` thumbnail from `i.ytimg.com/vi/<id>/maxresdefault.jpg`.

## Books

- [ ] Goodreads shelves need a login (profile 150027885, 472 books; RSS and shelf pages return "Sign in"). Either make the shelves public or export the library as CSV (My Books → Import and export) and commit it.
- [ ] Book entries are ready (`type: 'book'`, cover beside title and author, greyscale until hover). Covers can come from Open Library by ISBN (`covers.openlibrary.org/b/isbn/<isbn>-L.jpg`), downloaded into the repo.

## Sport

- [ ] Activities are the site's own cards: route map, photos and stats (distance, elevation, time) from the public Strava page and Strava's embed. The TdF 9 Japan stages (Nov 2026) have no stats yet, because Strava won't embed them ("This content is unavailable") and the logged-out page has no numbers. Add them by hand, or via the Strava API, which would also make adding new activities a one-liner.
- [ ] The second Berlin Marathon 2022 photo on Strava is a watermarked Sportograf proof, so it's left out.
- [ ] `/running` and `/strava` are no longer linked from the homepage; merge or retire them.

## Typography and interaction

- [x] Running text (intro, descriptions, notes, posts) is justified with whole-paragraph line breaks and hyphenation (`src/justify`, Knuth-Plass as in bookblitz). Pretext isn't used: it measures with canvas, which is unreliable for system fonts like SF Pro.
- [x] Posts use the timeline's column and type, justified, with Share and older/newer links; `/posts` is the timeline's writing.
- [x] Pictures turn colour in the middle of the screen on every device; hover no longer does.
- [x] Galleries are a strip of pictures that slides on one at a time; swipe or scroll it, or use the buttons that appear on hover.
- [x] Weighted wheel scrolling (Lenis) and a rubber band at the page's ends, for mouse and trackpad only (`src/scroll`). Try it and decide whether it stays.
- [x] Islands (`src/islands`): live pieces that load only near the screen, over a still picture. The p5 entry and `/p5` run the sketches live. Add one by writing a component that takes `IslandProps` and listing it in `src/islands/index.ts`.
- [x] Islands work in MDX posts: `<Island name="squiggle" />`.
- [ ] The tulip from `/models` as an island (three.js, from `features/portfolio-models`).
- [ ] The homepage ships all of `hyperlinks.json` (60 KB gzipped) for a count and four titles. Precompute those.
- [ ] Some hardware photos are 450–780 KB JPEGs (bench, pillow, bike wall mount). Convert them to WebP like the rest.

## SEO and sharing

- [x] Repo description and topics updated on GitHub (2026-11-20).
- [ ] `public/og.png` is a rendered card and `public/og.mp4` a 7-second scroll through projects and client work, both taken on 2026-11-20. Retake them when the site changes much.
- [ ] Entry pages use the entry's own picture as `og:image`. Those are WebP, which X, Facebook, Slack and iMessage show but LinkedIn may not.
- [x] `/sitemap.xml` (a prerendered server route) lists every entry page; `robots.txt` points to it.

## Next steps

- [ ] Load entries in pages as you scroll, rendering the first page on the server.
- [ ] Filtered URLs (`/?filter=…`) are served the unfiltered prerendered page on Netlify and filter after hydration. Server rendering on Coolify fixes this.
- [ ] SQLite (Drizzle) for entries that don't live in git.
- [ ] `POST /api/ingest` server route: Standard Webhooks signature, dedupe on `source.platform + source.id`, download media to a volume.
- [ ] Crosswind: webhook destination (`WebhookGateway`, `MirrorPostToWebhookJob`, routes `x→webhook` and `bluesky→webhook`, update `docs/mirroring-rules.md`).
- [ ] Media entries: image grids, video, GIFs (muted loop), link cards, quotes.
- [ ] iOS Shortcut that posts photos and links to the ingest API, so a photo can go from the phone's share sheet straight onto the timeline.
- [ ] Mermaid in MDX posts, loaded only on posts that use it.
- [ ] Move hosting to Coolify: the repo is ready (`Dockerfile`, `DEPLOY_TARGET=node`); the steps are in peetzweg/devops#13.
