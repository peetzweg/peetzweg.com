// @ts-nocheck
export const legacyFeatures = {
  epubReader: () => import('feature-epub-reader'),
  portfolioModels: () => import('feature-portfolio-models'),
  portfolioP5: () => import('feature-portfolio-p5'),
  profileArena: () => import('feature-profile-arena'),
  profileTerminal: () => import('feature-profile-terminal'),
  punchcard: () => import('feature-punchcard'),
  sportStats: () => import('feature-sport-stats'),
  stravaActivities: () => import('feature-strava-activities'),
  vocabulary: () => import('feature-vocabulary'),
};
