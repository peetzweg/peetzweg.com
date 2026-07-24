import { createFileRoute } from '@tanstack/react-router';
import { ClientFeature } from '../components/ClientFeature';
import { legacyFeatures } from '../legacyFeatures';

export const Route = createFileRoute('/epub')({
  component: EpubPage,
});

function EpubPage() {
  return (
    <main>
      <ClientFeature exportName="EpubReader" loader={legacyFeatures.epubReader} />
    </main>
  );
}
