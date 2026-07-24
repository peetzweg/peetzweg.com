import { createFileRoute } from '@tanstack/react-router';
import { ClientFeature } from '../components/ClientFeature';
import { legacyFeatures } from '../legacyFeatures';

export const Route = createFileRoute('/vocabulary')({
  component: VocabularyPage,
});

function VocabularyPage() {
  return (
    <main>
      <ClientFeature exportName="Feature" loader={legacyFeatures.vocabulary} />
    </main>
  );
}
