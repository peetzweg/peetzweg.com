import { createFileRoute } from '@tanstack/react-router';
import { RebuildPage } from '../components/RebuildPage';

export const Route = createFileRoute('/running')({
  component: RunningPage,
});

function RunningPage() {
  return (
    <RebuildPage eyebrow="running stats" title="Running">
      <p>
        This should become a server-backed stats page again once the database
        dependency is wired up for build/runtime data.
      </p>
    </RebuildPage>
  );
}
