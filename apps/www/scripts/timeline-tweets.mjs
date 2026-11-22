// Saves tweets for the timeline. Each one lands in src/content/timeline/tweets/<id>.json, so the
// site never asks X for it again, and every saved tweet shows up on the timeline; delete its file
// to take it off.
//
//   pnpm tweets:pull <id or URL>...         these tweets
//   pnpm tweets:pull --archive <zip or dir> every tweet of yours with a photo, video or GIF, from
//                                           the archive X sends you (Settings → Your account →
//                                           Download an archive of your data). Add --dry-run to
//                                           only list them, --text to include tweets without media.
//   pnpm tweets:pull --api                  the same, from the X API: your posts newer than the newest
//                                           saved one (--all for your latest 3200, the most X lists).
//                                           Needs X_BEARER_TOKEN; X bills each post it lists.
//
// Retweets and replies are left out, replies in your own threads too: those are mostly follow-ups
// to the first post, which the timeline links to anyway.
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

const ids = flag('--api')
  ? await fromApi()
  : archiveAt === -1
    ? args.map((arg) => arg.match(/(\d{8,})/)?.[1]).filter(Boolean)
    : fromArchive(args[archiveAt + 1]);

if (!ids.length) {
  console.error(flag('--api') ? 'Nothing new on X.' : 'Usage: pnpm tweets:pull <id or URL>... | --archive <zip or dir> | --api [--all] [--dry-run] [--text]');
  process.exit(flag('--api') ? 0 : 1);
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
    const media = tweet.extended_entities?.media?.length > 0;
    return !retweet && !tweet.in_reply_to_status_id_str && (media || flag('--text'));
  });
  console.log(`Archive of @${account?.username ?? '?'}: ${tweets.length} tweets, keeping ${kept.length}`);
  return kept.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((tweet) => tweet.id_str);
}

/**
 * IDs of the posts worth keeping from the X API, oldest first. The API only lists posts; each is
 * then saved from the embed API like any other, so saved tweets look the same wherever they came from.
 */
async function fromApi() {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    console.error('Set X_BEARER_TOKEN to the bearer token of your app in the X developer console.');
    process.exit(1);
  }
  const call = async (path, params) => {
    const response = await fetch(`https://api.x.com/2/${path}?${new URLSearchParams(params)}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    if (!response.ok) {
      console.error(`X API ${response.status}: ${JSON.stringify(body.errors ?? body)}`);
      process.exit(1);
    }
    return body;
  };

  const username = process.env.X_USERNAME ?? 'peetzweg';
  const { data: user } = await call(`users/by/username/${username}`, {});
  const saved = readdirSync(dir).flatMap((name) => name.match(/^(\d+)\.json$/)?.[1] ?? []);
  const newest = saved.sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1)).at(-1);

  const posts = [];
  let page;
  do {
    const body = await call(`users/${user.id}/tweets`, {
      max_results: '100',
      exclude: 'retweets,replies',
      'tweet.fields': 'created_at,attachments,in_reply_to_user_id',
      ...(newest && !flag('--all') ? { since_id: newest } : {}),
      ...(page ? { pagination_token: page } : {}),
    });
    posts.push(...(body.data ?? []));
    page = body.meta?.next_token;
  } while (page);

  const kept = posts.filter(
    (post) => !post.in_reply_to_user_id && (post.attachments?.media_keys?.length > 0 || flag('--text')),
  );
  console.log(`@${username} on X: ${posts.length} posts${newest && !flag('--all') ? ' since the newest saved' : ''}, keeping ${kept.length}`);
  return kept.reverse().map((post) => post.id);
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
