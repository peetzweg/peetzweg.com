import { createFileRoute } from '@tanstack/react-router';
import { RebuildPage } from '../components/RebuildPage';

export const Route = createFileRoute('/vocabulary')({
  component: VocabularyPage,
});

function VocabularyPage() {
  return (
    <RebuildPage eyebrow="language notes" title="Vocabulary">
      <p>
        Vocabulary gets a clean rebuild later, likely as structured content
        instead of a bundled legacy widget.
      </p>
    </RebuildPage>
  );
}
