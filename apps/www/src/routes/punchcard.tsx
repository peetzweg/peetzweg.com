import { createFileRoute } from '@tanstack/react-router';
import { RebuildPage } from '../components/RebuildPage';

export const Route = createFileRoute('/punchcard')({
  component: PunchcardPage,
});

function PunchcardPage() {
  return (
    <RebuildPage eyebrow="reading history" title="Punchcard">
      <p>
        The reading punchcard is kept as a concept, but it should be rebuilt
        from clean data primitives.
      </p>
    </RebuildPage>
  );
}
