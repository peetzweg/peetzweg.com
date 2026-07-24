import { createFileRoute } from '@tanstack/react-router';
import { ClientFeature } from '../components/ClientFeature';
import { legacyFeatures } from '../legacyFeatures';

export const Route = createFileRoute('/strava')({
  component: StravaPage,
});

function StravaPage() {
  return (
    <main>
      <ClientFeature exportName="FeatStravaActivities" loader={legacyFeatures.stravaActivities} />
    </main>
  );
}
