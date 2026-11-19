import BathroomLamp from '../../components/hardware/assets/BathroomLamp.jpeg';
import Bed from '../../components/hardware/assets/bed.jpg';
import Bench from '../../components/hardware/assets/bench.jpeg';
import Bernd from '../../components/hardware/assets/bernd.jpg';
import Bikewallmount from '../../components/hardware/assets/bikewallmount.jpg';
import ConcreteLamp from '../../components/hardware/assets/concretelamp.jpg';
import CurtainPole from '../../components/hardware/assets/CurtainPole.jpg';
import Lamp from '../../components/hardware/assets/Lamp.jpg';
import Mirror from '../../components/hardware/assets/mirror.jpg';
import Pillow from '../../components/hardware/assets/pillow.jpeg';
import Potence01 from '../../components/hardware/assets/potence01.jpg';
import Pottery from '../../components/hardware/assets/pottery.jpg';
import Rack01 from '../../components/hardware/assets/Rack01.jpg';
import Shades from '../../components/hardware/assets/shades.jpg';
import hyperlinks from '../hyperlinks.json';
import kindle from '../kindle.json';
import { code, gallery, mediaImage, row, shot, thumb, video } from './media';
import type { ActivityStats, Media, SitePath, TimelineEntry } from './types';
import { work } from './work';

/**
 * Hand-curated history. Posts come from MDX (see ./index.ts); later, notes and media
 * pushed from Crosswind will come from SQLite and merge into the same list.
 *
 * Date sources: hardware photos use the file's creation date, projects use the GitHub
 * repo creation date (or the date from the old profile-terminal list), experiments use
 * the commit that added them. `approximate` entries are guesses to correct later.
 */

const hardware: TimelineEntry[] = [
  photo('2017-11-19', 'curtain-pole', CurtainPole, 960, 1280, 'Hangers for my curtains made from heating pipes'),
  photo('2017-11-19', 'lamp', Lamp, 960, 1280, 'Chandelier installation with an old painter’s ladder'),
  photo('2017-11-30', 'rack', Rack01, 960, 1280, 'IKEA-compatible rack welded from steel rods'),
  photo('2019-06-30', 'bernd', Bernd, 960, 1280, 'Easy chair made from an old couch, with new leather upholstery'),
  photo('2019-09-28', 'shades', Shades, 960, 720, 'Blocky paper shades, A3/A4'),
  photo('2022-02-19', 'pottery', Pottery, 960, 720, 'Wheel-thrown pottery'),
  photo('2022-08-31', 'bike-wall-mount', Bikewallmount, 960, 720, 'Simple wall mount for my bike'),
  { ...photo('2022-09', 'bed', Bed, 960, 720, 'Bed and headboard made from cheap wood laths'), approximate: true },
  { ...photo('2022-09', 'potence', Potence01, 960, 960, 'Potence-inspired concept lamp made with bronze rods'), approximate: true },
  photo('2022-09-16', 'concrete-lamp', ConcreteLamp, 960, 1280, 'Concrete lamp, cast in a used milk carton'),
  photo('2022-09-23', 'wooden-wakizashi', '/hardware/woodenwakizashi.jpg', 960, 720, 'Wooden wakizashi'),
  photo('2023-01-16', 'bathroom-lamp', BathroomLamp, 960, 1280, 'Scrapped bathroom lamp with a coffee filter diffuser'),
  photo('2024-04-14', 'mirror', Mirror, 960, 720, 'Backlit mirror'),
  photo('2025-01-24', 'pillow', Pillow, 960, 686, 'Pillow sewn from textile samples'),
  photo('2025-02-08', 'bench', Bench, 960, 686, 'Wooden bench made from my dining table'),
];

/** Screenshots, README demos and snippets, keyed by project title. */
const projectMedia: Record<string, Media> = {
  papr: gallery(
    ['papr', 'classic: a two-month foldable calendar'],
    ['papr-2', 'oneyear: the whole year on one sheet'],
    ['papr-3', 'column: a quarter on one sheet'],
  ),
  'Commander Ottens Pro Longboarding': shot('copl', 'Pixel-art longboarder riding across a green field'),
  cairobou: shot('cairobou', 'Two images remixed into geometric patterns'),
  'Nuclear Power Plant Simulator 2014': shot('npps', 'Gauges, switches and sliders of the power plant control panel'),
  diarydash: gallery(
    ['diarydash', 'A diary page over a photo of the coast'],
    ['diarydash-2', 'Writing statistics per month'],
    ['diarydash-3', 'A note that entries stay in the browser'],
  ),
  'Five Minute Journal': shot('five-minute-journal', 'A quote and prompts for gratitude and affirmations'),
  matgen: shot('matgen', 'Settings above a generated cutting mat grid'),
  breathpacer: shot('breathpacer', 'A single circle pacing the breath'),
  Monota: row(['monota-1', 'Monota showing the one task to do now'], ['monota-2', 'Adding a task with a deadline in Monota']),
  Globe: shot('globe', 'Transactions of an Ethereum address on an iPhone'),
  'Parcel Explorer': shot('parcel-explorer', 'A Decentraland parcel on an iPhone'),
  Airbox: gallery(
    ['airbox-1', 'Sketch of Airbox on a smart speaker'],
    ['airbox-2', 'Voice messages arriving on a smart speaker'],
    ['airbox-3', 'Recording a message for Airbox on the phone'],
  ),
  loop: thumb('loop', 'loop app icon'),
  Offwhite: row(
    ['offwhite-1', 'Offwhite templates to design'],
    ['offwhite-2', 'Offwhite templates to reflect'],
    ['offwhite-3', 'Offwhite templates to create'],
  ),
  'ERC721A: start minting at _startTokenId()': code(`function _startTokenId() internal view virtual returns (uint256) {
    return 0;
}`),
  'Notion Input': video('notion-input', 'Adding an entry to a Notion database from the app'),
  abimate: code(`import { balanceOf } from '@abimate/solmate/ERC20';

const token = getContract({ address, abi: [balanceOf] });
const balance = await token.callStatic.balanceOf(owner);`),
  notar: shot('notar', 'notar listing the functions of an ERC-721 contract'),
  'Crypto Address Lens': shot('crypto-address-lens-demo', 'An Ethereum address in VS Code, checked and linked inline'),
  depon: code(`$ cargo install depon
$ depon ./images/*.jpg && ./minify_images.sh ./images/*.jpg`),
  'web3 Tools': shot('web3-tools', 'A form to snapshot the holders of an NFT collection'),
  'pace-rs': shot('pace-rs', 'pace-rs printing the pace for a 5k and a 10k'),
  dyor: shot('dyor', 'The dyor logo'),
  'trmnl-cli': code(`$ trmnl plugin add home "https://trmnl.com/api/custom_plugins/YOUR_UUID"
$ trmnl send --content '<div class="layout">Hello TRMNL!</div>'`),
  'acli-skill': code(`$ git clone https://github.com/peetzweg/acli-skill.git ~/.claude/skills/acli`),
  matcrawl: code(`$ brew install peetzweg/tap/matcrawl
$ matcrawl sync --backfill
$ matcrawl search "<query>" --limit 20`),
  'Open Display': shot('open-display', 'The Open Display homepage'),
  'Commit History': shot('commit-history', 'Commit History with a search field and recently looked up users'),
  sonics: shot('sonics', 'The sonics playground with a waveform of the selected sound'),
  Crosswind: shot('crosswind', 'The Crosswind homepage: Post anywhere. Sync everywhere.'),
  calcfile: shot('calcfile', 'A calcfile with travel costs and their totals'),
  bookblitz: shot('bookblitz', 'bookblitz showing a single word'),
};

/** `repo` is the GitHub repository name under github.com/peetzweg. Stars as of 2026-11-19. */
const projects: TimelineEntry[] = [
  project('2014-06-19', 'papr', 'Command-line tool to generate printable calendars, in three layouts.', { href: 'https://peetzweg.github.io/papr', repo: 'papr', language: 'Rust', stars: 42 }),
  project('2014-08-26', 'Commander Ottens Pro Longboarding', 'Infinite side-scroller about a longboarding friend. My first Unity game.', { repo: 'COPL', language: 'C#' }),
  project('2014-09-25', 'cairobou', 'Creative coding with Cairo: remixes of given images.', { repo: 'cairobou', language: 'Python' }),
  project('2014-12-06', 'Nuclear Power Plant Simulator 2014', 'My Ludum Dare 31 compo entry.', { href: 'https://web.archive.org/web/20170811023729/http://ludumdare.com/compo/ludum-dare-31/?action=preview&uid=46047', repo: 'NPPS2014', language: 'C#' }),
  project('2015-02-01', 'diarydash', 'Browser start page for daily journaling. No backend, everything stays in the browser.', { href: 'https://diarydash.com', repo: 'diarydash-deprecated', language: 'JavaScript', stars: 5 }),
  project('2015-06-26', 'Five Minute Journal', 'The Five Minute Journal, on the web.', { href: 'https://peetzweg.github.io/5mJ/', repo: '5mJ', language: 'JavaScript' }),
  project('2016-03-21', 'matgen', 'Cutting mat wallpaper generator.', { href: 'https://peetzweg.github.io/matgen/', repo: 'matgen', language: 'Processing' }),
  project('2016-07-03', 'breathpacer', 'Minimalistic breathing visualisation for breath pacing.', { href: 'https://peetzweg.github.io/breathpacer/', repo: 'breathpacer', language: 'HTML' }),
  project('2017-01-20', 'Aves', 'Setupless text-to-speech for blogs.', { repo: 'aves', language: 'JavaScript' }),
  project('2017-11-23', 'Monota', 'Mono-tasking for iOS: one task at a time, earliest deadline first.', { repo: 'Monota', language: 'JavaScript' }),
  project('2018-02-15', 'Globe', 'Etherscan-like iOS app, a connected Ethereum wallet proof of concept.', { repo: 'Globe', language: 'JavaScript' }),
  project('2018-02-23', 'Parcel Explorer', 'Google Maps for Decentraland, in your pocket.', { repo: 'ParcelExplorer', language: 'JavaScript' }),
  { ...project('2018-05', 'Airbox', 'Audio inbox for your smart speaker.', { href: 'https://julianlehr.medium.com/we-are-building-the-twitter-for-smart-speakers-49d70c0f2a21' }), approximate: true },
  { ...project('2019-01', 'Polo’s Pretty Paper', 'Print templates, as an iOS app.', { href: 'https://apps.apple.com/us/app/polos-pretty-paper/id1439946484' }), approximate: true },
  project('2019-07-10', 'loop', 'Desktop app to keep track of your social interactions, and who to get in touch with next.', { language: 'Electron' }),
  project('2020-02-28', 'Offwhite', 'iOS app selling stationery templates to print straight from the phone.', { href: 'https://www.instagram.com/offwhiteapp' }),
  project('2022-02-26', 'ERC721A: start minting at _startTokenId()', 'Merged into chiru-labs/ERC721A, so collections can start at a token ID other than 0.', { href: 'https://github.com/chiru-labs/ERC721A/pull/66', language: 'Solidity' }),
  project('2022-06-16', 'abimate', 'Prebuilt ABIs and TypeScript types for popular smart contracts.', { repo: 'abimate', language: 'TypeScript', stars: 8 }),
  project('2022-06-20', 'Notion Input', 'Proof of concept for an app that does one thing: an instant input to a Notion database.', { href: 'https://x.com/peetzweg/status/1538999168504844288' }),
  project('2022-07-02', 'notar', 'Interactive CLI to read and call contracts on EVM chains. Bring your own ABIs.', { href: 'https://www.npmjs.com/package/notar-cli', repo: 'notar', language: 'TypeScript', stars: 30 }),
  project('2022-08-05', 'Crypto Address Lens', 'VS Code extension to inspect and validate crypto addresses in your editor.', { href: 'https://marketplace.visualstudio.com/items?itemName=peetzweg.crypto-address-lens', repo: 'vscode-crypto-address-lens', language: 'TypeScript', stars: 11 }),
  project('2022-12-16', 'depon', 'Run the next command only if its dependencies changed.', { href: 'https://crates.io/crates/depon', repo: 'depon', language: 'Rust' }),
  { ...project('2023-01', 'web3 Tools', 'Resolve ENS names and snapshot the holders of an NFT collection.'), approximate: true },
  project('2023-07-06', 'pace-rs', 'CLI to calculate running pace for a given time and distance.', { repo: 'pace-rs', language: 'Rust' }),
  project('2023-11-28', 'polkadot-dapp-template', 'Frontend template for Polkadot-compatible decentralised apps.', { repo: 'polkadot-dapp-template', language: 'TypeScript', stars: 3 }),
  project('2023-12-01', 'OpenGov Tip', 'Interface to propose tips from the Polkadot treasury.', { repo: 'polkadot-dapp-opengov-tip', language: 'TypeScript' }),
  project('2024-03-28', 'dyor', 'React hooks for Polkadot SDK chains, inspired by wagmi.', { href: 'https://www.npmjs.com/package/dyor', repo: 'dyor', language: 'TypeScript' }),
  project('2026-01-29', 'trmnl-cli', 'CLI for your TRMNL device.', { href: 'https://peetzweg.github.io/trmnl-cli/', repo: 'trmnl-cli', language: 'TypeScript' }),
  project('2026-02-13', 'acli-skill', 'Atlassian aCLI reference skill for Jira and Confluence.', { repo: 'acli-skill', stars: 10 }),
  project('2026-05-27', 'matcrawl', 'Local-first Matrix/Element archive CLI with full-text search.', { repo: 'matcrawl', language: 'Go' }),
  project('2026-06-10', 'Open Display', 'Use an iPhone, iPad or spare Mac as a true second display for your Mac.', { href: 'https://opendisplay.app', repo: 'opendisplay', language: 'Rust', stars: 6424 }),
  project('2026-06-26', 'Commit History', 'Watch any GitHub user’s commits stack up across their whole career.', { href: 'https://commit-history.com/', repo: 'commit-history', language: 'TypeScript', stars: 122 }),
  project('2026-07-06', 'sonics', 'Tiny, dependency-free UI sound effects for the web.', { href: 'https://peetzweg.github.io/sonics/', repo: 'sonics', language: 'TypeScript', stars: 4 }),
  project('2026-08-06', 'Crosswind', 'Minimal account-to-account mirror for X, Bluesky, LinkedIn and Instagram.', { href: 'https://crosswind.social' }),
  project('2026-08-09', 'calcfile', 'An open, local-first plain-text format and editor for calculations.', { href: 'https://peetzweg.github.io/calcfile/', repo: 'calcfile', language: 'TypeScript' }),
  project('2026-10-27', 'bookblitz', 'Speed-read your own EPUBs, one word at a time.', { href: 'https://peetzweg.github.io/bookblitz/', repo: 'bookblitz', language: 'TypeScript' }),
];

/** Days with Kindle activity, from the reading log behind /punchcard. */
const readingDays = [...new Set(kindle.map((time) => new Date(time).toISOString().slice(0, 10)))].sort();

const experiments: TimelineEntry[] = [
  experiment('2023-11-09', 'Generative sketches', 'DIY Chromie Squiggle and Subscapes in p5.js.', '/p5', shot('p5', 'A Chromie Squiggle drawn with p5.js')),
  experiment('2023-11-09', '3D models', '3D in the browser, starting with a tulip.', '/models', shot('models', 'A bunch of tulips rendered in 3D')),
  experiment('2024-01-26', 'Vocabulary', 'Words I looked up while reading, with translations and definitions.', '/vocabulary', {
    kind: 'words',
    words: [
      ['implore', 'beschwören'],
      ['persevere', 'ausharren'],
      ['adversity', 'Widrigkeiten'],
      ['wherewithal', 'die Mittel'],
      ['prevalent', 'weit verbreitet'],
      ['blithely', 'munter'],
    ],
  }),
  experiment('2024-03-21', 'Punchcard', `${readingDays.length} days I read on my Kindle, punched into a card.`, '/punchcard', { kind: 'punchcard', days: readingDays }),
  experiment('2024-06-03', 'EPUB speed reader', 'A tiny in-browser EPUB reader, with a Dynamic Island for navigation.', '/epub', video('epub-speed-reader', 'Speed reading an EPUB, one word at a time')),
];

/** Monthly playlists ran from 2019-08 to 2020-06; this is the only one still public. */
const playlists: TimelineEntry[] = [
  {
    id: 'playlist-2020-01',
    type: 'link',
    date: '2020-01',
    title: 'Hype 2020.01',
    href: 'https://open.spotify.com/playlist/3cPBvDG8UZmXbd8mlD213a',
    note: 'Spotify playlist',
    media: thumb('playlist-2020-01', 'Playlist cover'),
  },
];

const writing: TimelineEntry[] = [
  { id: 'tpc-1', type: 'link', date: '2020-07', title: 'The Polo Club, Issue #1', href: 'https://atemio.notion.site/TPC-Issue-1-573baef12d224d9ab3ad63bc9ef1e8bb', note: 'Newsletter' },
  { id: 'tpc-2', type: 'link', date: '2020-08', title: 'The Polo Club, Issue #2', href: 'https://atemio.notion.site/TPC-Issue-2-0e11cc0a849641cfac657e32090d0441', note: 'Newsletter' },
  {
    id: 'hyperlinks',
    type: 'collection',
    date: '2024-09-29',
    title: 'Hyperlinks',
    description: `${hyperlinks.length} nice places on the internet, collected over time.`,
    to: '/hyperlinks',
    preview: hyperlinks.slice(0, 4).map((link) => (link.ogTitle || link.title).trim()),
  },
];

/** Hand-picked activities: route map, photos and stats from their public Strava pages. */
const activities: TimelineEntry[] = [
  activity('2017-09-24', '1201296650', 'Run', 'BMW Berlin Marathon 2017', 1, { distance: 42.6, elevation: 322, time: '4h 7m' }),
  activity('2020-06-26', '3675236976', 'Ride', 'Nordsee Century', 1, { distance: 175.8, elevation: 260, time: '5h 38m' }),
  activity('2021-06-19', '5496950656', 'Ride', 'Wir haben keine Brötchen mehr.', 2, { distance: 152.3, elevation: 860, time: '5h 51m' }),
  activity('2022-09-25', '7865006227', 'Run', 'Berlin Marathon 2022', 1, { distance: 42.7, elevation: 71, time: '3h 50m' }),
  activity('2023-07-23', '9508161008', 'Run', 'UC Berkeley Fire Trail System', 2, { distance: 15.3, elevation: 398, time: '1h 38m' }),
  activity('2023-11-18', '10239498330', 'Ride', 'Berlin’s Twin Peaks', 3, { distance: 62.9, elevation: 356, time: '3h 10m' }),
  activity('2026-11-03', '20839710960', 'Ride', 'TdF 9 Japan, Stage 1', 1),
  activity('2026-11-04', '20855365799', 'Ride', 'TdF 9 Japan, Stage 2', 1),
  activity('2026-11-05', '20866813531', 'Ride', 'TdF 9 Japan, Stage 3', 1),
  activity('2026-11-06', '20878565596', 'Ride', 'TdF 9 Japan, Stage 4', 2),
];

export const entries: TimelineEntry[] = [
  ...hardware,
  ...projects,
  ...work,
  ...experiments,
  ...playlists,
  ...writing,
  ...activities,
];

function photo(date: string, id: string, src: string, width: number, height: number, caption: string): TimelineEntry {
  return { id: `hardware-${id}`, type: 'photo', date, caption, tag: 'Made by me', image: { src, alt: caption, width, height } };
}

type ProjectDetails = { href?: string; repo?: string; language?: string; stars?: number };

/** Without a site of its own, a project links to its repository. */
function project(date: string, title: string, description: string, details: ProjectDetails = {}): TimelineEntry {
  const id = `project-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  const repo = details.repo ? `https://github.com/peetzweg/${details.repo}` : undefined;
  return {
    id,
    type: 'project',
    date,
    title,
    description,
    href: details.href ?? repo,
    repo,
    language: details.language,
    stars: details.stars,
    media: projectMedia[title],
  };
}

/** Media for an activity are `strava-<id>.webp` (the map) and `strava-<id>-<n>.webp` (photos). */
function activity(
  date: string,
  stravaId: string,
  sport: 'Ride' | 'Run',
  title: string,
  photoCount: number,
  stats?: ActivityStats,
): TimelineEntry {
  return {
    id: `strava-${stravaId}`,
    type: 'activity',
    date,
    title,
    stravaId,
    sport,
    map: mediaImage(`strava-${stravaId}`, `Route map of ${title}`),
    photos: Array.from({ length: photoCount }, (_, i) => mediaImage(`strava-${stravaId}-${i + 1}`, `Photo from ${title}`)),
    stats,
  };
}

function experiment(date: string, title: string, description: string, to: SitePath, media?: Media): TimelineEntry {
  return { id: `experiment-${to.slice(1)}`, type: 'experiment', date, title, description, to, media };
}
