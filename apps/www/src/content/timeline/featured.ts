import { entryPath, timeline } from '.';
import { mediaImage } from './media';
import type { Featured } from './types';

/*
 * The projects at the top of the homepage: what I'd show someone first, in two groups: products
 * people use today, and the ones on their way. Each is a project on the timeline, picked by
 * title, with a shorter line than its timeline description and its app icon (`icon-<name>.webp`
 * in ./media). Reorder, add, drop or move freely.
 */
const FEATURED: ReadonlyArray<{ title: string; tagline: string; icon: string; group: Featured['group'] }> = [
  { title: 'Open Display', tagline: 'An iPhone, iPad or spare Mac as a second display', icon: 'opendisplay', group: 'products' },
  { title: 'Commit History', tagline: 'A GitHub career, one commit at a time', icon: 'commit-history', group: 'products' },
  { title: 'Crosswind', tagline: 'Mirror posts across X, Bluesky, LinkedIn and Instagram', icon: 'crosswind', group: 'upcoming' },
  { title: 'QR Code Pocket', tagline: 'Every QR code you carry, in one offline app', icon: 'qr-code-pocket', group: 'upcoming' },
  { title: 'bookblitz', tagline: 'Speed-read your own EPUBs, one word at a time', icon: 'bookblitz', group: 'upcoming' },
  { title: 'Otomo', tagline: 'Rain radar and climbs for Tour de Friends Japan', icon: 'otomo', group: 'upcoming' },
];

export const featured: Featured[] = FEATURED.map(({ title, tagline, icon, group }) => {
  const entry = timeline.find((candidate) => candidate.type === 'project' && candidate.title === title);
  if (!entry || entry.type !== 'project') {
    throw new Error(`Featured project not on the timeline: ${title}`);
  }
  return {
    title,
    tagline,
    group,
    href: entry.href ?? entryPath(entry),
    icon: mediaImage(`icon-${icon}`, ''),
  };
});
