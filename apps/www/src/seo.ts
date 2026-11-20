export const SITE = {
  url: 'https://peetzweg.com',
  name: 'Philip Poloczek',
  title: 'Philip Poloczek: software, side projects and things I made',
  description:
    'Philip Poloczek is a software engineer in Berlin building apps, developer tools, smart contracts and small web experiments. A timeline of everything he made, wrote and shipped since 2013.',
  handle: '@peetzweg',
  /** 1200×630, in /public. */
  image: { src: '/og.png', width: 1200, height: 630, alt: 'Philip Poloczek: a timeline of everything I made' },
  video: { src: '/og.mp4', width: 1200, height: 630 },
} as const;

type Seo = {
  title: string;
  description: string;
  /** Path on this site, like `/papr`. */
  path: string;
  image?: { src: string; width: number; height: number; alt: string };
  video?: { src: string; width: number; height: number };
  type?: 'website' | 'article' | 'profile';
};

function absolute(src: string) {
  return src.startsWith('http') ? src : `${SITE.url}${src}`;
}

/** Title, description, Open Graph and Twitter tags for a page, plus its canonical link. */
export function seo({ title, description, path, image = SITE.image, video, type = 'website' }: Seo) {
  const url = `${SITE.url}${path === '/' ? '/' : path.replace(/\/$/, '')}`;

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:site_name', content: SITE.name },
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: absolute(image.src) },
      { property: 'og:image:width', content: String(image.width) },
      { property: 'og:image:height', content: String(image.height) },
      { property: 'og:image:alt', content: image.alt },
      ...(video
        ? [
            { property: 'og:video', content: absolute(video.src) },
            { property: 'og:video:type', content: 'video/mp4' },
            { property: 'og:video:width', content: String(video.width) },
            { property: 'og:video:height', content: String(video.height) },
          ]
        : []),
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: SITE.handle },
      { name: 'twitter:creator', content: SITE.handle },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: absolute(image.src) },
      { name: 'twitter:image:alt', content: image.alt },
    ],
    links: [{ rel: 'canonical', href: url }],
  };
}
