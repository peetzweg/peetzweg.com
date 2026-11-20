import type { ComponentType } from 'react';

/** What every island gets: whether it's on screen and may move, and a way to say it has drawn. */
export type IslandProps = {
  /** On screen and motion allowed. Off screen, islands pause their loops. */
  active: boolean;
  /** Called after the first frame, so the still picture underneath can fade away. */
  onReady: () => void;
};

type IslandModule = Promise<{ default: ComponentType<IslandProps> }>;

/**
 * Interactive pieces that can sit in an entry or an MDX post. Each one is its own chunk, loaded
 * only when it comes near the screen, so p5, three.js and the like never touch the first load.
 * `aspect` is the shape it draws in, so the space is held before it loads.
 */
export const islands = {
  squiggle: { load: (): IslandModule => import('./ChromieSquiggle'), aspect: '5 / 4', label: 'A Chromie Squiggle, drawn live with p5.js' },
  subscapes: { load: (): IslandModule => import('./Subscapes'), aspect: '63 / 80', label: 'A Subscape, drawn live with p5.js' },
} as const;

export type IslandName = keyof typeof islands;
