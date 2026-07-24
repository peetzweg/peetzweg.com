import { createFileRoute } from '@tanstack/react-router';
import { ClientFeature } from '../components/ClientFeature';
import { legacyFeatures } from '../legacyFeatures';

export const Route = createFileRoute('/p5')({
  component: P5Page,
});

function P5Page() {
  return (
    <main>
      <ClientFeature exportName="Feature" loader={legacyFeatures.portfolioP5} />
    </main>
  );
}
