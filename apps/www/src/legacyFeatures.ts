// @ts-nocheck
const emptyFeature = () => Promise.resolve({});

export const legacyFeatures = import.meta.env.SSR
  ? {
      epubReader: emptyFeature,
      portfolioModels: emptyFeature,
      portfolioP5: emptyFeature,
      profileArena: emptyFeature,
      profileTerminal: emptyFeature,
      punchcard: emptyFeature,
      sportStats: emptyFeature,
      stravaActivities: emptyFeature,
      vocabulary: emptyFeature,
    }
  : {
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
