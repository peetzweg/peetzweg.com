import { createFileRoute } from '@tanstack/react-router';
import { ClientFeature } from '../components/ClientFeature';
import { legacyFeatures } from '../legacyFeatures';

export const Route = createFileRoute('/models')({
  component: ModelsPage,
});

function ModelsPage() {
  return (
    <main>
      <ClientFeature exportName="FeatPortfolioModels" loader={legacyFeatures.portfolioModels} />
    </main>
  );
}
