import type { FileRouteTypes } from '../../routeTree.gen';

/** A path inside this site, checked against the route tree. */
export type SitePath = FileRouteTypes['to'];

/**
 * One thing that happened, shown on the homepage timeline. Every entry has a date;
 * `approximate` marks dates that were guessed (file metadata, git history, IDs)
 * and still want a human to confirm them.
 */
type EntryBase = {
  id: string;
  /** ISO date: `YYYY-MM-DD`, `YYYY-MM` or `YYYY`. Precision follows the format. */
  date: string;
  approximate?: boolean;
};

export type Image = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Something to look at beside an entry's text: a screenshot, a small cover, a code
 * snippet, or data the entry is about, drawn by the timeline itself.
 */
export type Media =
  | { kind: 'image'; image: Image }
  | { kind: 'thumb'; image: Image }
  | { kind: 'code'; code: string }
  | { kind: 'words'; words: ReadonlyArray<readonly [word: string, translation: string]> }
  /** ISO dates (`YYYY-MM-DD`) to punch into a week-by-day card. */
  | { kind: 'punchcard'; days: ReadonlyArray<string> };

export type TimelineEntry = EntryBase &
  (
    | { type: 'post'; title: string; slug: string; excerpt: string }
    | {
        type: 'project';
        title: string;
        description: string;
        href?: string;
        language?: string;
        stars?: number;
        media?: Media;
      }
    | { type: 'photo'; image: Image; caption: string; tag?: string }
    | { type: 'experiment'; title: string; description: string; to: SitePath; media?: Media }
    | { type: 'link'; title: string; href: string; note?: string; media?: Media }
    | { type: 'collection'; title: string; description: string; to: SitePath; preview: string[] }
    | { type: 'note'; text: string }
    | { type: 'activity'; title: string; stravaId: string }
    | { type: 'book'; title: string; author: string; cover?: Image; href?: string }
  );

export type EntryType = TimelineEntry['type'];
