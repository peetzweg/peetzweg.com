import { useEffect, useState, useSyncExternalStore } from 'react';

/** Whether the element is at least `threshold` visible. */
export function useInView(ref: React.RefObject<Element | null>, threshold: number) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/** Becomes true once the element comes within `margin` of the viewport, and stays true. */
export function useNear(ref: React.RefObject<Element | null>, margin = '400px') {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || near) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: margin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin, near]);

  return near;
}
