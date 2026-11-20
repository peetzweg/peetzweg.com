import { useState } from 'react';
import { entryPath, entryTitle, neighbours, type TimelineEntry } from '../../content/timeline';

/** Below an entry's own page: Share, and the entries just before and after it. */
export function EntryFooter({ entry }: { entry: TimelineEntry }) {
  const { newer, older } = neighbours(entry);

  return (
    <>
      <ShareButton title={entryTitle(entry)} />
      <nav aria-label="More from the timeline" className="tl-pager">
        {older ? <Neighbour direction="Older" entry={older} /> : <span />}
        {newer ? <Neighbour direction="Newer" entry={newer} /> : null}
      </nav>
    </>
  );
}

function Neighbour({ direction, entry }: { direction: 'Older' | 'Newer'; entry: TimelineEntry }) {
  const path = entryPath(entry);

  return (
    <a className="tl-neighbour" data-direction={direction.toLowerCase()} href={path}>
      <span className="tl-neighbour-label">{direction}</span>
      <span className="tl-neighbour-title">{entryTitle(entry)}</span>
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
