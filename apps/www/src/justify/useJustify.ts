import { useEffect } from 'react';
import { justify } from './justify';

/** Running text on the timeline and entry pages: the intro, entry descriptions and notes. */
export const TIMELINE_TEXT = '.tl-intro p, p.tl-text, .tl-note';

type Hyphenate = (word: string) => string;
let hyphenator: Promise<Hyphenate> | undefined;

/** English hyphenation patterns (TeX's, ~22 KB), loaded once, after the page is up. */
function loadHyphenator() {
  hyphenator ??= import('hyphen/en').then((module) => {
    const { hyphenateSync } = 'hyphenateSync' in module ? module : (module as { default: typeof module }).default;
    return (word: string) => hyphenateSync(word, { minWordLength: 6 });
  });
  return hyphenator;
}

const idle = (callback: () => void) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(callback, { timeout: 500 }) : setTimeout(callback, 50);

/**
 * Justifies the elements under `ref` that match `selector`, with whole-paragraph line breaks (see
 * justify.ts). Runs when the page is idle, again when the width changes or fonts finish loading, and
 * for elements added later, like entries shown by a filter.
 */
export function useJustify(ref: React.RefObject<HTMLElement | null>, selector: string) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let stopped = false;
    let pending = false;
    let width = root.clientWidth;

    const run = () => {
      if (pending) return;
      pending = true;
      idle(() => {
        loadHyphenator().then((hyphenate) => {
          pending = false;
          if (!stopped) justify(Array.from(root.querySelectorAll<HTMLElement>(selector)), hyphenate);
        });
      });
    };

    const resize = new ResizeObserver(() => {
      if (root.clientWidth !== width) {
        width = root.clientWidth;
        run();
      }
    });
    const added = new MutationObserver(run);
    resize.observe(root);
    added.observe(root, { childList: true, subtree: true });
    document.fonts?.ready.then(run);
    run();

    return () => {
      stopped = true;
      resize.disconnect();
      added.disconnect();
    };
  }, [ref, selector]);
}
