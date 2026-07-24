import { createFileRoute } from '@tanstack/react-router';
import { ClientFeature } from '../components/ClientFeature';
import { legacyFeatures } from '../legacyFeatures';

export const Route = createFileRoute('/punchcard')({
  component: PunchcardPage,
});

function PunchcardPage() {
  return (
    <main>
      <ClientFeature exportName="Feature" loader={legacyFeatures.punchcard} />
    </main>
  );
}
