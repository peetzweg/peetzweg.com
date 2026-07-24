import { useEffect } from 'react';

const activities = [
  { id: '3675236976', title: 'Nordsee Century' },
  { id: '5496950656', title: 'Ostsee' },
  { id: '10239498330', title: "Berlin's Twin Peaks" },
  { id: '9508161008', title: 'Berkeley Fire Trails' },
  { id: '7865006227', title: 'Berlin Marathon 2022' },
  { id: '1201296650', title: 'Berlin Marathon 2017' },
];

export function StravaEmbeds() {
  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-strava-embeds="true"]',
    );

    if (existingScript) return;

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
      {activities.map((activity) => (
        <article className="strava-card" key={activity.id}>
          <p>{activity.title}</p>
          <div
            className="strava-embed-placeholder"
            data-embed-id={activity.id}
            data-embed-type="activity"
          />
        </article>
      ))}
    </div>
  );
}
