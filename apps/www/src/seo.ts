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

/** Profiles elsewhere, linked from the homepage with rel="me" and listed as `sameAs` for search engines. */
export const PROFILES = [
  { label: 'X', href: 'https://x.com/peetzweg' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/peetzweg.com' },
  { label: 'GitHub', href: 'https://github.com/peetzweg' },
  { label: 'Strava', href: 'https://www.strava.com/athletes/18353420' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/peetzweg/' },
] as const;

/** Ways to support the work, after the profiles. */
export const SUPPORT = [
  { label: 'Sponsor', href: 'https://github.com/sponsors/peetzweg' },
  { label: 'Donate', href: 'https://ko-fi.com/peetzweg' },
] as const;

/**
 * Who the site is about, as schema.org data for search engines. Other pages point at it by
 * its `@id` as their author.
 */
export const PERSON = {
  '@type': 'Person',
  '@id': `${SITE.url}/#person`,
  name: SITE.name,
  alternateName: 'peetzweg',
  url: `${SITE.url}/`,
  jobTitle: 'Software engineer',
  description: SITE.description,
  homeLocation: { '@type': 'Place', name: 'Berlin, Germany' },
  knowsAbout: ['Software engineering', 'Web development', 'iOS apps', 'Developer tools', 'Smart contracts', 'Generative art'],
  sameAs: PROFILES.map(({ href }) => href),
} as const;

const AUTHOR = { '@id': PERSON['@id'], '@type': 'Person', name: SITE.name, url: PERSON.url };

type Seo = {
  title: string;
  description: string;
  /** Path on this site, like `/papr`. */
  path: string;
  image?: { src: string; width: number; height: number; alt: string };
  video?: { src: string; width: number; height: number };
  type?: 'website' | 'article' | 'profile';
  /** When an article was first published, `YYYY-MM-DD` or a shorter date. */
  published?: string;
  /** schema.org data for the page (JSON-LD); see PERSON and creativeWork. */
  data?: Record<string, unknown>;
};

function absolute(src: string) {
  return src.startsWith('http') ? src : `${SITE.url}${src}`;
}

/** Title, description, Open Graph and Twitter tags for a page, plus its canonical link. */
export function seo({ title, description, path, image = SITE.image, video, type = 'website', published, data }: Seo) {
  const url = `${SITE.url}${path === '/' ? '/' : path.replace(/\/$/, '')}`;

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:site_name', content: SITE.name },
      { property: 'og:locale', content: 'en_US' },
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
      ...(type === 'profile'
        ? [
            { property: 'profile:first_name', content: 'Philip' },
            { property: 'profile:last_name', content: 'Poloczek' },
            { property: 'profile:username', content: 'peetzweg' },
          ]
        : []),
      ...(type === 'article'
        ? [
            { property: 'article:author', content: `${SITE.url}/` },
            ...(published ? [{ property: 'article:published_time', content: published }] : []),
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
    scripts: data ? [{ type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', ...data }) }] : [],
  };
}

/** schema.org data for an entry's own page: a post as a BlogPosting, anything else as a CreativeWork. */
export function creativeWork({
  kind,
  title,
  description,
  path,
  date,
  image,
}: {
  kind: 'post' | 'other';
  title: string;
  description: string;
  path: string;
  date: string;
  image?: { src: string };
}) {
  const url = `${SITE.url}${path}`;
  return {
    '@type': kind === 'post' ? 'BlogPosting' : 'CreativeWork',
    '@id': url,
    url,
    [kind === 'post' ? 'headline' : 'name']: title,
    description,
    [kind === 'post' ? 'datePublished' : 'dateCreated']: date,
    author: AUTHOR,
    ...(image ? { image: absolute(image.src) } : {}),
    isPartOf: { '@type': 'WebSite', '@id': `${SITE.url}/#website`, name: SITE.name, url: `${SITE.url}/` },
  };
}

/** The homepage: a profile page about the person, on the website. */
export function profilePage() {
  return {
    '@graph': [
      { '@type': 'WebSite', '@id': `${SITE.url}/#website`, name: SITE.name, url: `${SITE.url}/`, inLanguage: 'en', publisher: { '@id': PERSON['@id'] } },
      { '@type': 'ProfilePage', '@id': `${SITE.url}/`, url: `${SITE.url}/`, name: SITE.title, isPartOf: { '@id': `${SITE.url}/#website` }, mainEntity: PERSON },
    ],
  };
}
