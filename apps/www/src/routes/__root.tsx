import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width' },
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
