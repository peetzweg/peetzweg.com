import { createFileRoute } from '@tanstack/react-router';
import { ClientFeature } from '../components/ClientFeature';
import { legacyFeatures } from '../legacyFeatures';

export const Route = createFileRoute('/running')({
  component: RunningPage,
});

function RunningPage() {
  return (
    <main>
      <ClientFeature exportName="FeatSportTotals" loader={legacyFeatures.sportStats} />
      <ClientFeature exportName="FeatSportStats" loader={legacyFeatures.sportStats} />
    </main>
  );
}
