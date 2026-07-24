import { createFileRoute } from '@tanstack/react-router';
import { RebuildPage } from '../components/RebuildPage';

export const Route = createFileRoute('/epub')({
  component: EpubPage,
});

function EpubPage() {
  return (
    <RebuildPage eyebrow="reader experiment" title="EPUB Reader">
      <p>
        The old reader is parked. This route stays as the place to rebuild it as
        an MDX-friendly reading block with modern Start data/loading boundaries.
      </p>
    </RebuildPage>
  );
}
