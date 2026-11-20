import Lenis from 'lenis';

/** How far the page can be pulled past its ends, in pixels. */
const MAX_PULL = 110;
/** How soon after the last wheel event the page springs back. */
const RELEASE_AFTER = 90;

/**
 * Scrolling with weight, for mouse and trackpad: the wheel moves the page with a little inertia
 * (Lenis), and pushing past the top or bottom pulls the page a little, with growing resistance,
 * before it springs back, like overscrolling on a phone. Returns a function that undoes it all.
 */
export function startPhysicalScroll() {
  const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9, anchors: true });
  let frame = requestAnimationFrame(function raf(time) {
    lenis.raf(time);
    frame = requestAnimationFrame(raf);
  });

  // Everything in the page's column moves; fixed parts (the year index, the top blur) stay put.
  const parts = () =>
    Array.from(document.querySelectorAll<HTMLElement>('main > :not(.tl-yearnav):not(.tl-jump)'));
  let pull = 0;
  let release: ReturnType<typeof setTimeout> | undefined;

  const setPull = (value: number, spring: boolean) => {
    pull = value;
    for (const part of parts()) {
      part.style.transition = spring ? 'translate 600ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
      part.style.translate = value ? `0 ${value.toFixed(2)}px` : '';
    }
  };

  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const end = document.documentElement.scrollHeight - window.innerHeight;
    const atTop = window.scrollY <= 0 && event.deltaY < 0;
    const atBottom = window.scrollY >= end - 1 && event.deltaY > 0;
    if (!atTop && !atBottom && !pull) return;

    // Resistance grows as the pull nears its limit, so it eases out instead of stopping hard.
    const resistance = 0.35 * (1 - Math.abs(pull) / MAX_PULL);
    const next = Math.max(-MAX_PULL, Math.min(MAX_PULL, pull - event.deltaY * resistance));
    setPull(atTop || pull > 0 ? Math.max(0, next) : Math.min(0, next), false);

    clearTimeout(release);
    release = setTimeout(() => setPull(0, true), RELEASE_AFTER);
  };

  window.addEventListener('wheel', onWheel, { passive: true });

  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(release);
    window.removeEventListener('wheel', onWheel);
    setPull(0, false);
    lenis.destroy();
  };
}
