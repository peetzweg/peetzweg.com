import sizes from './media/sizes.json';
import type { Image, Media } from './types';

const files = import.meta.glob<string>('./media/*.{webp,mp4}', { eager: true, import: 'default' });

/** A file name in ./media without its extension, and what the picture shows. */
type Picture = readonly [name: string, alt: string];

/**
 * A picture from ./media. Its size comes from media/sizes.json; run
 * `pnpm media:sizes` after adding or replacing a file.
 */
export function mediaImage(name: string, alt: string): Image {
  const src = files[`./media/${name}.webp`];
  const size = (sizes as Record<string, number[] | undefined>)[name];
  if (!src || !size) {
    throw new Error(`Missing timeline media: ./media/${name}.webp (run pnpm media:sizes)`);
  }
  return { src, alt, width: size[0], height: size[1] };
}

/** One picture at the width of the column. */
export function shot(name: string, alt: string): Media {
  return { kind: 'image', image: mediaImage(name, alt) };
}

/** A small square picture beside the text: an icon, logo or cover. */
export function thumb(name: string, alt: string): Media {
  return { kind: 'thumb', image: mediaImage(name, alt) };
}

/** Several pictures, shown one at a time. */
export function gallery(...pictures: Picture[]): Media {
  return { kind: 'gallery', images: pictures.map(([name, alt]) => mediaImage(name, alt)) };
}

/** Several tall pictures side by side, like phone screenshots. */
export function row(...pictures: Picture[]): Media {
  return { kind: 'row', images: pictures.map(([name, alt]) => mediaImage(name, alt)) };
}

/** A silent looping clip, with `<name>-poster.webp` as its still frame. */
export function video(name: string, alt: string): Media {
  const src = files[`./media/${name}.mp4`];
  if (!src) {
    throw new Error(`Missing timeline media: ./media/${name}.mp4`);
  }
  return { kind: 'video', src, poster: mediaImage(`${name}-poster`, alt) };
}

export function code(snippet: string): Media {
  return { kind: 'code', code: snippet };
}
