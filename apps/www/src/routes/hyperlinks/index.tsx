import { createFileRoute } from '@tanstack/react-router';
import linkData from '../../content/hyperlinks.json';

type LinkInfo = {
  url: string;
  title: string;
  description: string | null;
  ogTitle: string | null;
  favicon: string | null;
};

export const Route = createFileRoute('/hyperlinks/')({
  component: HyperlinksPage,
});

function HyperlinksPage() {
  return (
    <main className="link-page">
      <ol>
        {(linkData as LinkInfo[]).map((link) => (
          <li key={link.url}>
            <a
              className="link-item"
              href={link.url}
              rel="noreferrer"
              target="_blank"
            >
              <div className="link-title">
                {link.favicon ? (
                  <img alt="" src={link.favicon} />
                ) : null}
                <span>{link.ogTitle || link.title}</span>
              </div>
              <div className="link-url" title={link.url}>
                {link.url}
              </div>
              {link.description ? (
                <p>{link.description}</p>
              ) : null}
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
