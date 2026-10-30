import { createFileRoute } from '@tanstack/react-router';
import { RebuildPage } from '../components/RebuildPage';

export const Route = createFileRoute('/p5')({
  component: P5Page,
});

function P5Page() {
  return (
    <RebuildPage eyebrow="sketch space" title="P5">
      <p>
        Generative sketches can come back here, but without coupling the new
        site shell to the old P5 workspace.
      </p>
    </RebuildPage>
  );
}
