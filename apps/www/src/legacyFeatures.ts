// @ts-nocheck
export const legacyFeatures = {
  epubReader: clientOnly(() => import('feature-epub-reader')),
  portfolioModels: clientOnly(() => import('feature-portfolio-models')),
  portfolioP5: clientOnly(() => import('feature-portfolio-p5')),
  profileArena: clientOnly(() => import('feature-profile-arena')),
  profileTerminal: clientOnly(() => import('feature-profile-terminal')),
  punchcard: clientOnly(() => import('feature-punchcard')),
  sportStats: clientOnly(() => import('feature-sport-stats')),
  stravaActivities: clientOnly(() => import('feature-strava-activities')),
  vocabulary: clientOnly(() => import('feature-vocabulary')),
};

function clientOnly(loader) {
  if (import.meta.env.SSR) {
    return () => Promise.resolve({});
  }

  return loader;
}
