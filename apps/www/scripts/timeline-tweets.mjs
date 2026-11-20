// Saves tweets for the timeline. Each one lands in src/content/timeline/tweets/<id>.json, so the
// site never asks X for it again, and every saved tweet shows up on the timeline; delete its file
// to take it off.
//
//   pnpm tweets:pull <id or URL>...         these tweets
//   pnpm tweets:pull --archive <zip or dir> every tweet of yours with a photo, video or GIF, from
//                                           the archive X sends you (Settings → Your account →
//                                           Download an archive of your data). Add --dry-run to
//                                           only list them, --text to include tweets without media.
//
// Retweets and replies to other people are left out; replies in your own threads are kept.
// Tweets already saved are skipped, so the archive can be pulled again after a new export.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTweet } from 'react-tweet/api';

const dir = new URL('../src/content/timeline/tweets/', import.meta.url);
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const archiveAt = args.indexOf('--archive');

const ids = archiveAt === -1 ? args.map((arg) => arg.match(/(\d{8,})/)?.[1]).filter(Boolean) : fromArchive(args[archiveAt + 1]);

if (!ids.length) {
  console.error('Usage: pnpm tweets:pull <id or URL>... | --archive <zip or dir> [--dry-run] [--text]');
  process.exit(1);
}

const todo = ids.filter((id) => !existsSync(new URL(`${id}.json`, dir)));
console.log(`${ids.length} tweets, ${ids.length - todo.length} already saved, ${todo.length} to pull`);
if (flag('--dry-run')) {
  process.exit(0);
}

const missing = [];
for (const id of todo) {
  const tweet = await pull(id);
  if (!tweet) {
    missing.push(id);
    continue;
  }
  await writeFile(new URL(`${id}.json`, dir), `${JSON.stringify(tweet, null, 2)}\n`);
  console.log(`${id}: ${tweet.created_at.slice(0, 10)} ${tweet.text.slice(0, 60).replace(/\s+/g, ' ')}`);
}
if (missing.length) {
  console.error(`\nNot found (deleted, protected or age-restricted): ${missing.join(' ')}`);
  process.exitCode = 1;
}

/** One tweet from X's embed API, waiting and retrying when it's rate limited. */
async function pull(id) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const tweet = await getTweet(id);
      await sleep(300);
      return tweet;
    } catch (error) {
      const wait = 15_000 * 2 ** attempt;
      console.error(`${id}: ${error.message}; trying again in ${wait / 1000}s`);
      await sleep(wait);
    }
  }
  return undefined;
}

/** IDs of the tweets worth keeping from an archive, oldest first. */
function fromArchive(path) {
  if (!path || !existsSync(path)) {
    console.error(`No archive at ${path}`);
    process.exit(1);
  }
  const files = archiveFiles(path);
  const account = parse(files.read('data/account.js'))[0]?.account;
  const tweets = files
    .list()
    .filter((name) => /^data\/tweets(-part\d+)?\.js$/.test(name))
    .flatMap((name) => parse(files.read(name)))
    .map(({ tweet }) => tweet);

  const kept = tweets.filter((tweet) => {
    const retweet = tweet.retweeted || tweet.full_text.startsWith('RT @');
    const replyToOthers = tweet.in_reply_to_user_id_str && tweet.in_reply_to_user_id_str !== account?.accountId;
    const media = tweet.extended_entities?.media?.length > 0;
    return !retweet && !replyToOthers && (media || flag('--text'));
  });
  console.log(`Archive of @${account?.username ?? '?'}: ${tweets.length} tweets, keeping ${kept.length}`);
  return kept.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((tweet) => tweet.id_str);
}

/** The archive as X sends it (a zip) or unzipped. */
function archiveFiles(path) {
  if (statSync(path).isDirectory()) {
    const walk = (sub) =>
      readdirSync(join(path, sub), { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? walk(join(sub, entry.name)) : [join(sub, entry.name)],
      );
    return { list: () => walk('data'), read: (name) => readFileSync(join(path, name), 'utf8') };
  }
  return {
    list: () => execFileSync('unzip', ['-Z1', path], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n'),
    read: (name) => execFileSync('unzip', ['-p', path, name], { encoding: 'utf8', maxBuffer: 1 << 30 }),
  };
}

/** Archive files are scripts: `window.YTD.tweets.part0 = [...]`. */
function parse(script) {
  return JSON.parse(script.slice(script.indexOf('=') + 1));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
