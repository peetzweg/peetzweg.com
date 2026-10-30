import { createFileRoute } from '@tanstack/react-router';
import { RebuildPage } from '../components/RebuildPage';
import { StravaEmbeds } from '../components/StravaEmbeds';

export const Route = createFileRoute('/strava')({
  component: StravaPage,
});

function StravaPage() {
  return (
    <RebuildPage eyebrow="activity feed" title="Adventures had">
      <p>
        Activity data can move here later as a proper server function or static
        build-time fetch, instead of a legacy client feature.
      </p>
      <StravaEmbeds />
    </RebuildPage>
  );
}
