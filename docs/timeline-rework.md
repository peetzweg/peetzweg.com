# Timeline rework

The homepage is a single timeline of everything made, written and saved, newest first.
Entries live in `apps/www/src/content/timeline/entries.ts`; posts come from MDX.
Filters above the timeline are chips that switch on and off; any number can be on (`?filter=projects,work`), and with none on everything shows. `?order=oldest` flips the order.
Every entry has a page: posts, experiments and collections their existing routes, everything else `/<slug>` (from its title, see `entryPath` in `content/timeline/index.ts`), all prerendered.

## Content to correct

- [ ] Approximate dates (shown with `~`): bed and Potence lamp (`2022-09`, from the commit that added them).
- [ ] Hardware dates come from photo file creation dates; check they match when each piece was made.
- [ ] Project dates are GitHub repo creation dates; some projects started earlier or shipped later.
- [ ] Repos left out because they have no description: wavcraft, ui, obsidian-plugin, shadow-overlay, siikafish, status-saver, playgrounds. Add descriptions to include them.
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

## Homepage top

- [x] Projects under the intro, as icon, name and one line, linking to their sites, in two groups (`content/timeline/featured.ts`; icons are `media/icon-<name>.webp`). Products: Open Display, Commit History, Sunshine. Upcoming Products: Crosswind, QR Code Pocket, bookblitz, Otomo.
- [x] The redesign entry scrolls through the old peetzweg.com, captured on desktop (1440 × 900 at 2×) from production on 2026-11-21, before the switch (`media/redesign-site.webp`, its first screen as `-poster`). A full-page screenshot leaves the Strava embeds blank, so that section was shot on screen and put in its place. Lossless copy: `docs/archive/peetzweg.com-2026-11-21-desktop.webp`.
- [x] Sponsor link to github.com/sponsors/peetzweg beside the profiles.

## Search engines and the IndieWeb

- [x] schema.org data (JSON-LD, `apps/www/src/seo.ts`): the homepage is a ProfilePage about a Person (profiles as `sameAs`), entry pages are CreativeWorks and posts BlogPostings, all with the person as author.
- [x] h-card on the intro (name, note, site, profiles, Berlin) and `rel="me"` on every profile link.
- [x] `/feed.xml`: RSS of the newest 50 entries, tweets left out, linked from every page's head.
- [x] `og:locale`, `profile:*` on the homepage, `article:published_time` on entries, `color-scheme`, Apple touch icon and web manifest.
- [ ] A downloadable vCard (`.vcf`) only makes sense with contact details (an email); add one once there's an address to publish.
- [x] New share image: `peetzweg` over `Philip Poloczek` in white, the X profile picture and the GitHub avatar's ochre (#CDA763), from `apps/www/scripts/og/card.html` (`scripts/og/render.sh`). The old `og.mp4` preview video is gone.

## Tweets and videos

- [x] Tweets with media from the X API: `pnpm tweets:pull --api` (needs `X_BEARER_TOKEN`; X bills each post it lists). On 2026-11-21 it listed 1113 posts back to July 2021 and saved the 288 with a photo, video or GIF, leaving out retweets and replies to other people. Run it again now and then: it only lists posts newer than the newest saved one (`--all` lists everything again). Every saved tweet is on the timeline, under Writing, in X's layout (react-tweet). Delete its file in `content/timeline/tweets/` to drop one. Single tweets: `pnpm tweets:pull <id or URL>`.
- [ ] Tweets before July 2021: X lists only the latest posts, so older ones need the archive. Request it on X (Settings → Your account → Download an archive of your data; it takes a day or so), then `pnpm tweets:pull --archive <zip>` (`--dry-run` to count first). Tweets already saved are skipped.
- [ ] Tweets that repeat a project (the Notion Input video is both) can go either way; delete the tweet's file or the project's media.
- [x] Tweets cost the homepage nothing up front: the timeline loads in pages as you scroll (below).
- [ ] Text-only tweets later, behind an approval gate in Crosswind like the one for LinkedIn: a post goes to the site's webhook only once approved. `--text` already pulls them from an archive.
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
- [x] Tried weighted wheel scrolling (Lenis) with an edge rubber band on desktop; removed, it felt odd.
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

- [x] Load entries in pages as you scroll, rendering the first page on the server. Entries stay on the server (`content/timeline/api.ts`); the homepage gets the years, counts and first 24 entries, and pages of up to 24 (never spanning two years) load within two screens of the viewport. Unloaded pages hold an estimated height, so the scrollbar, year links and `/#entry` links reach everything; `useKeepPlace` holds what's on screen while pages and their pictures fill in above it.
- [x] Filtered URLs (`/?filter=…`) are rendered filtered by the server.
- [ ] SQLite (Drizzle) for entries that don't live in git.
- [ ] `POST /api/ingest` server route: Standard Webhooks signature, dedupe on `source.platform + source.id`, download media to a volume.
- [ ] Crosswind: webhook destination (`WebhookGateway`, `MirrorPostToWebhookJob`, routes `x→webhook` and `bluesky→webhook`, update `docs/mirroring-rules.md`).
- [ ] Media entries: image grids, video, GIFs (muted loop), link cards, quotes.
- [ ] iOS Shortcut that posts photos and links to the ingest API, so a photo can go from the phone's share sheet straight onto the timeline.
- [ ] Mermaid in MDX posts, loaded only on posts that use it.
- [ ] Move hosting to Coolify: the repo is ready (`Dockerfile`; Netlify support is gone, so merge after the switch); the steps are in peetzweg/devops#13. Preview locally with `pnpm build && pnpm preview`.
- [ ] Three entry pages aren't prerendered (their neighbours are pages without the Older/Newer footer, so the crawler doesn't reach them); the server renders them on request.
