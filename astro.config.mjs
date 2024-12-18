import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import path from 'path';
import vercel from '@astrojs/vercel/serverless';
import icon from 'astro-icon';

export default defineConfig({
  integrations: [tailwind(), react(), icon()],
  output: 'server',
  adapter: vercel(),
  site: 'http://localhost:4321',
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    ssr: {
      noExternal: ['@nanostores/react'],
    },
  },
});
