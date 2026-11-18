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
import type { Image, Media, SitePath, TimelineEntry } from './types';

const mediaFiles = import.meta.glob<string>('./media/*.webp', { eager: true, import: 'default' });

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
  papr: shot('papr', 960, 960, 'A printed calendar page made with papr'),
  'Commander Ottens Pro Longboarding': shot('copl', 960, 562, 'Pixel-art longboarder riding across a green field'),
  cairobou: shot('cairobou', 960, 437, 'Two images remixed into geometric patterns'),
  'Nuclear Power Plant Simulator 2014': shot('npps', 856, 500, 'Gauges, switches and sliders of the power plant control panel'),
  diarydash: shot('diarydash', 1088, 744, 'A diary page over a photo of the coast'),
  'Five Minute Journal': shot('five-minute-journal', 1088, 544, 'A quote and prompts for gratitude and affirmations'),
  matgen: shot('matgen', 720, 450, 'Settings above a generated cutting mat grid'),
  breathpacer: shot('breathpacer', 1088, 680, 'A single circle pacing the breath'),
  Globe: shot('globe', 222, 480, 'Transactions of an Ethereum address on an iPhone'),
  'Parcel Explorer': shot('parcel-explorer', 222, 480, 'A Decentraland parcel on an iPhone'),
  abimate: code(`import { balanceOf } from '@abimate/solmate/ERC20';

const token = getContract({ address, abi: [balanceOf] });
const balance = await token.callStatic.balanceOf(owner);`),
  notar: shot('notar', 960, 595, 'notar listing the functions of an ERC-721 contract'),
  'Crypto Address Lens': thumb('crypto-address-lens', 256, 256, 'Crypto Address Lens icon'),
  depon: code(`$ cargo install depon
$ depon ./images/*.jpg && ./minify_images.sh ./images/*.jpg`),
  'pace-rs': shot('pace-rs', 960, 600, 'pace-rs printing the pace for a 5k and a 10k'),
  dyor: shot('dyor', 1088, 612, 'The dyor logo'),
  'trmnl-cli': code(`$ trmnl plugin add home "https://trmnl.com/api/custom_plugins/YOUR_UUID"
$ trmnl send --content '<div class="layout">Hello TRMNL!</div>'`),
  'acli-skill': code(`$ git clone https://github.com/peetzweg/acli-skill.git ~/.claude/skills/acli`),
  matcrawl: code(`$ brew install peetzweg/tap/matcrawl
$ matcrawl sync --backfill
$ matcrawl search "<query>" --limit 20`),
  'Open Display': shot('open-display', 1088, 680, 'The Open Display homepage'),
  'Commit History': shot('commit-history', 1088, 680, 'Commit History with a search field and recently looked up users'),
  sonics: shot('sonics', 1088, 680, 'The sonics playground with a waveform of the selected sound'),
  Crosswind: shot('crosswind', 1088, 680, 'The Crosswind homepage: Post anywhere. Sync everywhere.'),
  calcfile: shot('calcfile', 1088, 680, 'A calcfile with travel costs and their totals'),
  bookblitz: shot('bookblitz', 800, 167, 'bookblitz showing a single word'),
};

const projects: TimelineEntry[] = [
  project('2014-06-19', 'papr', 'Command-line tool to generate PDF calendars.', 'https://peetzweg.github.io/papr', 'Rust', 41),
  project('2014-08-26', 'Commander Ottens Pro Longboarding', 'Infinite side-scroller about a longboarding friend. My first Unity game.', 'https://github.com/peetzweg/COPL', 'C#'),
  project('2014-09-25', 'cairobou', 'Creative coding with Cairo: remixes of given images.', 'https://github.com/peetzweg/cairobou', 'Python'),
  project('2014-12-06', 'Nuclear Power Plant Simulator 2014', 'My Ludum Dare 31 compo entry.', 'https://github.com/peetzweg/NPPS2014', 'C#'),
  project('2015-02-01', 'diarydash', 'Browser homepage for daily diary writing.', 'https://github.com/peetzweg/diarydash-deprecated', 'JavaScript'),
  project('2015-06-26', 'Five Minute Journal', 'The Five Minute Journal, on the web.', 'https://peetzweg.github.io/5mJ/', 'JavaScript'),
  project('2016-03-21', 'matgen', 'Cutting mat wallpaper generator.', 'https://peetzweg.github.io/matgen/', 'Processing'),
  project('2016-07-03', 'breathpacer', 'Minimalistic breathing visualisation for breath pacing.', 'https://peetzweg.github.io/breathpacer/', 'HTML'),
  project('2017-01-20', 'Aves', 'Setupless text-to-speech for blogs.', 'https://github.com/peetzweg/aves', 'JavaScript'),
  project('2017-11-23', 'Monota', 'Mono-tasking app for iOS.', 'https://itunes.apple.com/us/app/monota/id1333036184?mt=8', 'JavaScript'),
  project('2018-02-15', 'Globe', 'Etherscan-like iOS app, a connected Ethereum wallet proof of concept.', 'https://github.com/peetzweg/Globe', 'JavaScript'),
  project('2018-02-23', 'Parcel Explorer', 'Google Maps for Decentraland.', 'https://github.com/peetzweg/ParcelExplorer', 'JavaScript'),
  project('2018-05', 'Airbox', 'Audio inbox for your smart speaker.', 'https://julianlehr.medium.com/we-are-building-the-twitter-for-smart-speakers-49d70c0f2a21'),
  project('2019-01', 'Polo’s Pretty Paper', 'Print templates, as an iOS app.', 'https://itunes.apple.com/us/app/polos-pretty-paper/id1439946484?mt=8'),
  project('2019-07-10', 'loop', 'Mac app to keep track of your social interactions.'),
  project('2020-02-28', 'Offwhite', 'Store for stationery templates.', 'https://www.instagram.com/offwhiteapp'),
  project('2022-06-16', 'abimate', 'Prebuilt ABIs and TypeScript types for popular smart contracts.', 'https://github.com/peetzweg/abimate', 'TypeScript', 8),
  project('2022-07-02', 'notar', 'Interactive CLI to read and call contracts on EVM chains. Bring your own ABIs.', 'https://www.npmjs.com/package/notar-cli', 'TypeScript', 30),
  project('2022-08-05', 'Crypto Address Lens', 'VS Code extension to inspect and validate crypto addresses in your editor.', 'https://marketplace.visualstudio.com/items?itemName=peetzweg.crypto-address-lens', 'TypeScript', 11),
  project('2022-12-16', 'depon', 'Run the next command only if its dependencies changed.', 'https://crates.io/crates/depon', 'Rust'),
  project('2023-07-06', 'pace-rs', 'CLI to calculate running pace for a given time and distance.', 'https://github.com/peetzweg/pace-rs', 'Rust'),
  project('2023-11-28', 'polkadot-dapp-template', 'Frontend template for Polkadot-compatible decentralised apps.', 'https://github.com/peetzweg/polkadot-dapp-template', 'TypeScript', 3),
  project('2023-12-01', 'OpenGov Tip', 'Interface to propose tips from the Polkadot treasury.', 'https://github.com/peetzweg/polkadot-dapp-opengov-tip', 'TypeScript'),
  project('2024-03-28', 'dyor', 'React hooks for Polkadot SDK chains, inspired by wagmi.', 'https://github.com/peetzweg/dyor', 'TypeScript'),
  project('2026-01-29', 'trmnl-cli', 'CLI for your TRMNL device.', 'https://peetzweg.github.io/trmnl-cli/', 'TypeScript'),
  project('2026-02-13', 'acli-skill', 'Atlassian aCLI reference skill for Jira and Confluence.', 'https://github.com/peetzweg/acli-skill', undefined, 10),
  project('2026-05-27', 'matcrawl', 'Local-first Matrix/Element archive CLI with full-text search.', 'https://github.com/peetzweg/matcrawl', 'Go'),
  project('2026-06-10', 'Open Display', 'Use an iPhone, iPad or spare Mac as a true second display for your Mac.', 'https://opendisplay.app', 'Rust', 6037),
  project('2026-06-26', 'Commit History', 'Watch any GitHub user’s commits stack up across their whole career.', 'https://commit-history.com/', 'TypeScript', 117),
  project('2026-07-06', 'sonics', 'Tiny, dependency-free UI sound effects for the web.', 'https://peetzweg.github.io/sonics/', 'TypeScript', 3),
  project('2026-08-06', 'Crosswind', 'Minimal account-to-account mirror for X, Bluesky, LinkedIn and Instagram.', 'https://crosswind.social'),
  project('2026-08-09', 'calcfile', 'An open, local-first plain-text format and editor for calculations.', 'https://peetzweg.github.io/calcfile/', 'TypeScript'),
  project('2026-10-27', 'bookblitz', 'Speed-read your own EPUBs, one word at a time.', 'https://peetzweg.github.io/bookblitz/', 'TypeScript'),
];

/** Days with Kindle activity, from the reading log behind /punchcard. */
const readingDays = [...new Set(kindle.map((time) => new Date(time).toISOString().slice(0, 10)))].sort();

const experiments: TimelineEntry[] = [
  experiment('2023-11-09', 'Generative sketches', 'DIY Chromie Squiggle and Subscapes in p5.js.', '/p5', shot('p5', 1040, 560, 'A Chromie Squiggle drawn with p5.js')),
  experiment('2023-11-09', '3D models', '3D in the browser, starting with a tulip.', '/models', shot('models', 1088, 680, 'A bunch of tulips rendered in 3D')),
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
  experiment('2024-06-03', 'EPUB reader', 'A tiny in-browser EPUB reader.', '/epub'),
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
    media: thumb('playlist-2020-01', 300, 300, 'Playlist cover'),
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

/** Hand-picked activities, shown with Strava's own embed. */
const activities: TimelineEntry[] = [
  ['2017-09-24', '1201296650', 'BMW Berlin Marathon 2017'],
  ['2020-06-26', '3675236976', 'Nordsee Century'],
  ['2021-06-19', '5496950656', 'Wir haben keine Brötchen mehr.'],
  ['2022-09-25', '7865006227', 'Berlin Marathon 2022'],
  ['2023-07-23', '9508161008', 'UC Berkeley Fire Trail System'],
  ['2023-11-18', '10239498330', 'Berlin’s Twin Peaks'],
].map(([date, stravaId, title]) => ({ id: `strava-${stravaId}`, type: 'activity', date, stravaId, title }));

export const entries: TimelineEntry[] = [
  ...hardware,
  ...projects,
  ...experiments,
  ...playlists,
  ...writing,
  ...activities,
];

function photo(date: string, id: string, src: string, width: number, height: number, caption: string): TimelineEntry {
  return { id: `hardware-${id}`, type: 'photo', date, caption, tag: 'Made by me', image: { src, alt: caption, width, height } };
}

function project(date: string, title: string, description: string, href?: string, language?: string, stars?: number): TimelineEntry {
  const id = `project-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return { id, type: 'project', date, title, description, href, language, stars, media: projectMedia[title] };
}

function experiment(date: string, title: string, description: string, to: SitePath, media?: Media): TimelineEntry {
  return { id: `experiment-${to.slice(1)}`, type: 'experiment', date, title, description, to, media };
}

/** A screenshot or picture from ./media, shown at the width of the column. */
function shot(name: string, width: number, height: number, alt: string): Media {
  return { kind: 'image', image: mediaImage(name, width, height, alt) };
}

/** A small square picture from ./media, shown beside the text. */
function thumb(name: string, width: number, height: number, alt: string): Media {
  return { kind: 'thumb', image: mediaImage(name, width, height, alt) };
}

function code(snippet: string): Media {
  return { kind: 'code', code: snippet };
}

function mediaImage(name: string, width: number, height: number, alt: string): Image {
  const src = mediaFiles[`./media/${name}.webp`];
  if (!src) {
    throw new Error(`Missing timeline media: ./media/${name}.webp`);
  }
  return { src, alt, width, height };
}
