/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react';

  export const frontmatter: Record<string, unknown>;
  const Component: ComponentType;
  export default Component;
}
/// <reference types="astro/client" />
