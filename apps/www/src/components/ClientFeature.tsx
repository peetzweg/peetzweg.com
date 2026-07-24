import { useEffect, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

type ClientFeatureProps = {
  exportName: string;
  fallback?: ReactNode;
  loader: () => Promise<Record<string, unknown>>;
};

export function ClientFeature({
  exportName,
  fallback = null,
  loader,
}: ClientFeatureProps) {
  const [Component, setComponent] = useState<ComponentType | null>(null);

  useEffect(() => {
    let mounted = true;

    loader()
      .then((module) => {
        if (mounted) {
          setComponent(() => (module[exportName] as ComponentType | undefined) ?? null);
        }
      })
      .catch(() => {
        if (mounted) {
          setComponent(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [exportName, loader]);

  if (!Component) {
    return <>{fallback}</>;
  }

  return <Component />;
}
