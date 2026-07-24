import 'latex.css';
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
    <main className="latex-page">
      <ol className="gap-4">
        {(linkData as LinkInfo[]).map((link) => (
          <li key={link.url}>
            <a
              className="flex flex-col px-1 py-2 font-mono md:px-0"
              href={link.url}
              rel="noreferrer"
              target="_blank"
            >
              <div className="flex flex-row items-center gap-2">
                {link.favicon ? (
                  <img alt="" className="aspect-square w-4" src={link.favicon} />
                ) : null}
                <span className="truncate">{link.ogTitle || link.title}</span>
              </div>
              <div className="pl-6 text-sm text-gray-500">
                <span className="line-clamp-1" title={link.url}>
                  {link.url}
                </span>
              </div>
              {link.description ? (
                <div className="pl-6 pt-2">
                  <span className="line-clamp-2 text-sm text-black">
                    {link.description}
                  </span>
                </div>
              ) : null}
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
