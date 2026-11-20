// Saves tweets for the timeline: `pnpm tweets:pull <id or URL>...`
// Each one lands in src/content/timeline/tweets/<id>.json, so the site never asks X
// for it again; add `tweet('<id>')` to entries.ts to show it.
import { writeFile } from 'node:fs/promises';
import { getTweet } from 'react-tweet/api';

const dir = new URL('../src/content/timeline/tweets/', import.meta.url);
const ids = process.argv.slice(2).map((arg) => arg.match(/(\d{8,})/)?.[1]).filter(Boolean);

if (!ids.length) {
  console.error('Usage: pnpm tweets:pull <id or URL>...');
  process.exit(1);
}

for (const id of ids) {
  const tweet = await getTweet(id);
  if (!tweet) {
    console.error(`${id}: not found (deleted, private or rate limited)`);
    process.exitCode = 1;
    continue;
  }
  await writeFile(new URL(`${id}.json`, dir), `${JSON.stringify(tweet, null, 2)}\n`);
  console.log(`${id}: ${tweet.created_at.slice(0, 10)} ${tweet.text.slice(0, 60).replace(/\s+/g, ' ')}`);
}
