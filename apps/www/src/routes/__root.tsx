import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { PhysicalScroll } from '../scroll/PhysicalScroll';
import { SITE, seo } from '../seo';
import appCss from '../styles.css?url';

/**
 * Defaults for every page; routes override them tag by tag. The URL and canonical link
 * come from each route, since a default would point every page at the homepage.
 */
const defaults = seo({ title: SITE.title, description: SITE.description, path: '/' }).meta.filter(
  (tag) => !('property' in tag && tag.property === 'og:url'),
);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'author', content: SITE.name },
      ...defaults,
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'me', href: 'https://github.com/peetzweg' },
      { rel: 'me', href: 'https://bsky.app/profile/peet.sh' },
      { rel: 'stylesheet', href: appCss },
    ],
    scripts: [
      {
        defer: true,
        'data-domain': 'peetzweg.com',
        src: 'https://analytics.drdrip.xyz/js/script.file-downloads.outbound-links.js',
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Written out here: route head tags keep only one meta per name, and there are two. */}
        <meta content="#f7f7f2" media="(prefers-color-scheme: light)" name="theme-color" />
        <meta content="#10120f" media="(prefers-color-scheme: dark)" name="theme-color" />
        <HeadContent />
      </head>
      <body>
        {children}
        <PhysicalScroll />
        <Scripts />
      </body>
    </html>
  );
}

export function Root() {
  return <Outlet />;
}
