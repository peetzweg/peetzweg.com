import type { Tweet } from 'react-tweet/api';
import type { IslandName } from '../../islands';
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
  | { kind: 'gallery'; images: ReadonlyArray<Image> }
  | { kind: 'row'; images: ReadonlyArray<Image> }
  | { kind: 'video'; src: string; poster: Image }
  | { kind: 'code'; code: string }
  | { kind: 'words'; words: ReadonlyArray<readonly [word: string, translation: string]> }
  /** ISO dates (`YYYY-MM-DD`) to punch into a week-by-day card. */
  | { kind: 'punchcard'; days: ReadonlyArray<string> }
  /** Something live (see src/islands), with a still picture until it loads. */
  | { kind: 'live'; island: IslandName; poster?: Image };

export type ActivityStats = {
  /** Kilometres */
  distance: number;
  /** Metres climbed */
  elevation: number;
  /** As Strava shows it, like `4h 7m` */
  time: string;
};

export type TimelineEntry = EntryBase &
  (
    | { type: 'post'; title: string; slug: string; excerpt: string }
    | {
        type: 'project';
        title: string;
        description: string;
        /** The project itself: the deployed site, store page or package. */
        href?: string;
        /** The GitHub repository, linked beside the project when `href` points elsewhere. */
        repo?: string;
        stars?: number;
        media?: Media;
      }
    | {
        type: 'work';
        client: string;
        role: string;
        description: string;
        href?: string;
        stack: ReadonlyArray<string>;
        media?: Media;
      }
    | { type: 'photo'; image: Image; caption: string; tag?: string }
    | { type: 'experiment'; title: string; description: string; to: SitePath; media?: Media }
    | { type: 'link'; title: string; href: string; note?: string; media?: Media }
    | { type: 'collection'; title: string; description: string; to: SitePath; preview: string[] }
    | { type: 'note'; text: string }
    | {
        type: 'activity';
        title: string;
        stravaId: string;
        sport: 'Ride' | 'Run';
        map: Image;
        photos: ReadonlyArray<Image>;
        /** From Strava's embed; newer activities can't be embedded and have none yet. */
        stats?: ActivityStats;
      }
    | { type: 'book'; title: string; author: string; cover?: Image; href?: string }
    /** A YouTube video, played in place once you press play. Duration in seconds. */
    | { type: 'video'; title: string; youtubeId: string; duration: number; thumbnail: Image }
    /** A post on X, saved by `pnpm tweets:pull` and drawn like the real thing. */
    | { type: 'tweet'; tweet: Tweet }
  );

export type EntryType = TimelineEntry['type'];

/*
 * What the browser gets. The entries stay on the server (see api.ts) and come over a page at a
 * time, with where each one lives on the site worked out already.
 */

/** An entry as the timeline draws it. */
export type TimelineItem = TimelineEntry & {
  /** Its own page, like `/papr` or `/posts/hello`. */
  path: string;
  /** Its id on the homepage, for `/#<anchor>`. */
  anchor: string;
};

/** Up to a page of one year's entries, loaded when it scrolls near. */
export type TimelinePageRef = {
  key: string;
  count: number;
  /** Roughly how tall its entries are, in rem, so the space is held until they load. */
  height: number;
};

/** Everything about a (filtered, ordered) timeline except most of its entries. */
export type TimelineIndex = {
  filters: ReadonlyArray<{ id: string; label: string; count: number }>;
  total: number;
  years: ReadonlyArray<{ year: string; count: number; pages: ReadonlyArray<TimelinePageRef> }>;
  /** The pages loaded right away: the first screen or two. */
  pages: Record<string, ReadonlyArray<TimelineItem>>;
};

/** An entry just before or after another, linked below an entry's page. */
export type Neighbour = { path: string; title: string };
