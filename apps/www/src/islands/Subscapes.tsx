import type p5 from 'p5';
import type { IslandProps } from './index';
import { useP5 } from './useP5';

/**
 * A DIY Subscape (after Matt DesLauriers' Art Blocks project): a block of terrain from Perlin
 * noise, in isometric 3D. Ported from the old site's Subscapes.tsx. Drawn once; tap for a new one.
 */
function sketch(p: p5) {
  const step = 3;
  const foundation = -10;
  let start = 0;
  let end = 0;
  let blue = 0;
  let green = 0;

  const reseed = () => {
    blue = p.random(255);
    green = p.random(255);
    p.noiseSeed(p.random(1e6));
  };

  const pillar = (height: number) => {
    p.push();
    p.translate(0, foundation / 2 + height / 2, 0);
    p.plane(1, foundation + height, 1);
    p.pop();
  };

  p.setup = () => {
    p.createCanvas(630, 800, p.WEBGL);
    start = -p.width / 2 + p.width * 0.15;
    end = p.width * 0.35;
    p.noStroke();
    p.noiseDetail(2, 0.2);
    reseed();
  };

  p.draw = () => {
    p.clear();
    p.push();
    p.translate(0, 0, -200);
    p.rotateX(-p.PI / 6);
    p.rotateY(p.PI / 4);

    for (let z = start; z < end; z += step) {
      p.push();
      p.translate(0, 0, z);
      for (let x = start; x < end; x += step) {
        p.fill(p.color(green, p.map(z, start, end, 0, 255), blue));
        const height = p.map(p.noise((x + start) / 100, (z + start) / 100), 0, 1, 0, p.height / 3);
        p.push();
        p.translate(x, -height);
        // Walls along the front edges, so the block reads as solid.
        if (x === start || z + step >= end) pillar(height);
        p.box(1);
        p.pop();
      }
      p.pop();
    }
    p.pop();
  };

  p.mousePressed = (event?: object) => {
    const target = (event as MouseEvent | undefined)?.target;
    if (target instanceof HTMLCanvasElement && target === (p as unknown as { canvas: HTMLCanvasElement }).canvas) {
      reseed();
      p.redraw();
    }
  };
}

export default function Subscapes(props: IslandProps) {
  const { container } = useP5(sketch, props, { animate: false });
  return <div className="tl-island-canvas" ref={container} />;
}
