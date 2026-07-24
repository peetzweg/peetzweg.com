import { createFileRoute } from '@tanstack/react-router';
import { ClientFeature } from '../components/ClientFeature';
import { legacyFeatures } from '../legacyFeatures';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <main>
      <div style={{ height: '105vh' }}>
        <ClientFeature exportName="FeatProfileArena" loader={legacyFeatures.profileArena} />
      </div>

      <FeatureSection title="Days spent reading">
        <ClientFeature exportName="Feature" loader={legacyFeatures.punchcard} />
      </FeatureSection>

      <FeatureSection title="Collected words along the way" />

      <FeatureSection title="Adventures had">
        <ClientFeature exportName="FeatStravaActivities" loader={legacyFeatures.stravaActivities} />
      </FeatureSection>

      <FeatureSection title="Kilometers conquered">
        <ClientFeature exportName="FeatSportStats" loader={legacyFeatures.sportStats} />
        <ClientFeature exportName="FeatSportTotals" loader={legacyFeatures.sportStats} />
      </FeatureSection>

      <div className="relative">
        <h1 className="absolute left-[10vw] top-[10vh] z-10 break-words text-4xl md:text-6xl">
          ❀{' '}
          <a
            className="underline"
            href="https://x.com/peetzweg/status/1625962357967945733"
            rel="noreferrer"
            target="_blank"
          >
            handmade
          </a>{' '}
          flowers ✿
        </h1>
        <ClientFeature exportName="FeatPortfolioModels" loader={legacyFeatures.portfolioModels} />
      </div>

      <div className="relative">
        <h1 className="sticky top-[10vh] break-words pl-[10vw] text-2xl md:text-6xl">
          much nfts, such wow •ᴗ•
        </h1>
        <ClientFeature exportName="Feature" loader={legacyFeatures.portfolioP5} />
      </div>

      <div className="relative">
        <h1 className="absolute left-[20vw] top-[30vh] break-all bg-yellow-600 text-2xl md:text-6xl">
          old, but still cool ☞☜
        </h1>
        <ClientFeature exportName="TerminalComponent" loader={legacyFeatures.profileTerminal} />
      </div>
    </main>
  );
}

function FeatureSection({
  children,
  title,
}: {
  children?: React.ReactNode;
  title: string;
}) {
  return (
    <div className="relative">
      <h1 className="sticky top-0 z-50 w-full border-b bg-background/95 pb-2 pl-4 pt-1 text-xl opacity-90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {title}
      </h1>
      {children}
    </div>
  );
}
