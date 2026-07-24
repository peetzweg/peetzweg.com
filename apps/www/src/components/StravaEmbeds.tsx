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
  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-strava-embeds="true"]',
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.dataset.stravaEmbeds = 'true';
    script.src = 'https://strava-embeds.com/embed.js';
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="strava-strip" aria-label="Selected Strava activities">
      {activities.map((activityId) => (
        <article className="strava-card" key={activityId}>
          <div
            className="strava-embed-placeholder"
            data-embed-id={activityId}
            data-embed-type="activity"
          />
        </article>
      ))}
    </div>
  );
}
