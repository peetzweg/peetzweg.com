import { useState } from 'react';
import type { Neighbour } from '../../content/timeline/types';

/** Below an entry's own page: Share, and the entries just before and after it. */
export function EntryFooter({ newer, older, title }: { newer?: Neighbour; older?: Neighbour; title: string }) {
  return (
    <>
      <ShareButton title={title} />
      <nav aria-label="More from the timeline" className="tl-pager">
        {older ? <NeighbourLink direction="Older" entry={older} /> : <span />}
        {newer ? <NeighbourLink direction="Newer" entry={newer} /> : null}
      </nav>
    </>
  );
}

function NeighbourLink({ direction, entry }: { direction: 'Older' | 'Newer'; entry: Neighbour }) {
  return (
    <a className="tl-neighbour" data-direction={direction.toLowerCase()} href={entry.path}>
      <span className="tl-neighbour-label">{direction}</span>
      <span className="tl-neighbour-title">{entry.title}</span>
    </a>
  );
}

/** Opens the share sheet where there is one, and copies the link everywhere else. */
function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href.split('#')[0];
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className="tl-share" data-copied={copied} onClick={share} type="button">
      <span aria-live="polite">{copied ? 'Link copied' : 'Share'}</span>
    </button>
  );
}
