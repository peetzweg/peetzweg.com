import { useEffect } from 'react';

const activities = [
  '3675236976',
  '5496950656',
  '10239498330',
  '9508161008',
  '7865006227',
  '1201296650',
];

export function StravaEmbeds() {
  useStravaScript();

  return (
    <div className="strava-strip" aria-label="Selected Strava activities">
      {activities.map((activityId) => (
        <article className="strava-card" key={activityId}>
          <StravaEmbed activityId={activityId} />
        </article>
      ))}
    </div>
  );
}

export function StravaEmbed({ activityId }: { activityId: string }) {
  return (
    <div
      className="strava-embed-placeholder"
      data-embed-id={activityId}
      data-embed-type="activity"
    />
  );
}

/**
 * Strava's script replaces every placeholder on the page once, when it loads. Pass a
 * key that changes whenever new placeholders render so the script runs again.
 */
export function useStravaScript(refreshKey?: unknown) {
  useEffect(() => {
    document
      .querySelectorAll('script[data-strava-embeds="true"]')
      .forEach((existing) => existing.remove());

    const script = document.createElement('script');
    script.async = true;
    script.dataset.stravaEmbeds = 'true';
    script.src = 'https://strava-embeds.com/embed.js';
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [refreshKey]);
}
