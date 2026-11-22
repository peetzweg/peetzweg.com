import type p5 from 'p5';
import { useEffect, useRef } from 'react';
import type { IslandProps } from './index';

/**
 * Runs a p5 sketch in instance mode inside the returned element. Animated sketches loop only
 * while `active`; still ones (`animate: false`) draw once. The canvas is scaled by CSS to the
 * island's width.
 */
export function useP5(sketch: (p: p5) => void, { active, onReady }: IslandProps, { animate = true } = {}) {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<p5 | undefined>(undefined);
  const looping = useRef(active);
  looping.current = animate && active;

  useEffect(() => {
    let removed = false;
    import('p5').then(({ default: P5 }) => {
      if (removed || !container.current) return;
      instance.current = new P5((p: p5) => {
        sketch(p);
        const { draw, setup } = p;
        p.setup = () => {
          setup?.();
          if (!looping.current) p.noLoop();
        };
        let first = true;
        p.draw = () => {
          draw?.();
          if (first) {
            first = false;
            onReady();
          }
        };
      }, container.current);
    });
    return () => {
      removed = true;
      instance.current?.remove();
    };
    // One sketch per island, started once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!animate) return;
    if (active) instance.current?.loop();
    else instance.current?.noLoop();
  }, [active, animate]);

  return { container, instance };
}
