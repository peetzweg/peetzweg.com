import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#f7f7f2', media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: '#10120f', media: '(prefers-color-scheme: dark)' },
      {
        name: 'description',
        content: 'This is the personal website of Philip Poloczek',
      },
      { name: 'keywords', content: 'developer, profile, resume' },
      { title: 'peet.sh / Philip Poloczek' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
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
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export function Root() {
  return <Outlet />;
}
