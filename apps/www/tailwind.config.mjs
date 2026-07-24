/** @type {import('tailwindcss').Config} */
import path from 'node:path';

export default {
  content: [
    path.join(__dirname, './src/**/*.{html,jsx,md,mdx,tsx}'),
    path.join(
      __dirname,
      '../../features/*/src/**/*.{jsx,tsx}',
    ),
  ],
  theme: {
    extend: {
      gridTemplateRows: {
        31: 'repeat(31, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
