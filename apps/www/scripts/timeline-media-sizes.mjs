// Writes the pixel size of every WebP in src/content/timeline/media to sizes.json, so
// entries can give images a width and height without listing them by hand.
// Run after adding or replacing media: `pnpm media:sizes`.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../src/content/timeline/media/', import.meta.url).pathname;
const sizes = {};

for (const file of readdirSync(dir).filter((name) => name.endsWith('.webp')).sort()) {
  sizes[file.replace(/\.webp$/, '')] = webpSize(readFileSync(join(dir, file)));
}

const lines = Object.entries(sizes).map(([name, size]) => `  ${JSON.stringify(name)}: ${JSON.stringify(size)}`);
writeFileSync(join(dir, 'sizes.json'), `{\n${lines.join(',\n')}\n}\n`);
console.log(`${Object.keys(sizes).length} sizes written`);

/** Reads width and height from a WebP header (lossy, lossless or extended). */
function webpSize(data) {
  const chunk = data.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return [1 + data.readUIntLE(24, 3), 1 + data.readUIntLE(27, 3)];
  }
  if (chunk === 'VP8L') {
    const bits = data.readUInt32LE(21);
    return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
  }
  if (chunk === 'VP8 ') {
    return [data.readUInt16LE(26) & 0x3fff, data.readUInt16LE(28) & 0x3fff];
  }
  throw new Error(`Unknown WebP chunk: ${chunk}`);
}
