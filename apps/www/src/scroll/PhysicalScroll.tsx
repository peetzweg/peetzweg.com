import { useEffect } from 'react';

/**
 * Turns on weighted scrolling (./startPhysicalScroll.ts) for mouse and trackpad, loaded after the
 * page is up. Touch screens already scroll like this natively; with reduced motion it stays off.
 */
export function PhysicalScroll() {
  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!query.matches) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    import('./startPhysicalScroll').then(({ startPhysicalScroll }) => {
      if (!cancelled) stop = startPhysicalScroll();
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return null;
}
