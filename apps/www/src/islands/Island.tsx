import { useEffect, useRef, useState, type ComponentType } from 'react';
import type { Image } from '../content/timeline/types';
import { useInView, useNear, useReducedMotion } from '../hooks';
import { islands, type IslandName, type IslandProps } from './index';

/**
 * A live piece in the page (see ./index.ts). Until it loads, and if it never does, its still
 * picture holds the space; the code is fetched when the island comes near the screen and the
 * live version fades in over the picture once it has drawn.
 */
export function Island({ className, name, poster }: { className?: string; name: IslandName; poster?: Image }) {
  const { aspect, label, load } = islands[name];
  const ref = useRef<HTMLDivElement>(null);
  const near = useNear(ref);
  const inView = useInView(ref, 0.15);
  const reducedMotion = useReducedMotion();
  const [Live, setLive] = useState<ComponentType<IslandProps>>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    load().then((module) => !cancelled && setLive(() => module.default));
    return () => {
      cancelled = true;
    };
  }, [near, load]);

  return (
    <div
      aria-label={label}
      className={className ? `tl-island ${className}` : 'tl-island'}
      data-ready={ready}
      ref={ref}
      role="img"
      style={{ aspectRatio: aspect }}
    >
      {poster ? (
        <img alt="" className="tl-island-poster" decoding="async" height={poster.height} loading="lazy" src={poster.src} width={poster.width} />
      ) : null}
      {Live ? (
        <div className="tl-island-live">
          <Live active={inView && !reducedMotion} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}
