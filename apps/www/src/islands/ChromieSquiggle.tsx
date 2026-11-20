import type p5 from 'p5';
import type { IslandProps } from './index';
import { useP5 } from './useP5';

/**
 * A DIY Chromie Squiggle (after Snowfro's Art Blocks project): a row of circles riding Perlin
 * noise, drifting in colour. Ported from the old site's ChromieSquiggle.tsx; it restarts once
 * the circles have grown into a blur.
 */
function sketch(p: p5) {
  let start = 0;
  let end = 0;
  let offset = 0;

  p.setup = () => {
    p.createCanvas(960, 768);
    start = p.width * 0.1;
    end = p.width * 0.9;
    p.noStroke();
    p.frameRate(60);
    p.noiseDetail(2, 0.9);
  };

  p.draw = () => {
    p.clear();
    offset += 0.015;
    if (offset > 12) offset = 0;

    const blue = p.map(p.noise(offset), 0, 1, 0, 255);
    const green = p.map(p.noise(offset), 0, 1, 0, 255);

    for (let x = start; x < end; x += 1 + offset * 3) {
      const value = p.noise(x / 100 + offset);
      const y = p.map(value, 0, 1, -p.height / 2, p.height / 2);
      p.fill(p.color(p.map(x, start, end, 0, 255), green, blue));
      p.circle(x, p.height / 2 + y, Math.min(p.width * 0.09 + offset * 3, 200));
    }
  };
}

export default function ChromieSquiggle(props: IslandProps) {
  const { container } = useP5(sketch, props);
  return <div className="tl-island-canvas" ref={container} />;
}
