import { createFileRoute } from '@tanstack/react-router';
import { RebuildPage } from '../components/RebuildPage';

export const Route = createFileRoute('/models')({
  component: ModelsPage,
});

function ModelsPage() {
  return (
    <RebuildPage eyebrow="visual archive" title="Models">
      <p>
        The old 3D model gallery is parked while the visual pages get rebuilt
        with isolated styles and scoped browser-only code.
      </p>
    </RebuildPage>
  );
}
