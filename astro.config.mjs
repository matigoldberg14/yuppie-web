import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import path from 'path';
import vercel from '@astrojs/vercel/serverless';
import icon from 'astro-icon';

export default defineConfig({
  integrations: [tailwind(), react(), icon()],
  output: 'server',
  adapter: vercel({
    analytics: true,
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 60,
    regions: ['iad1'],
  }),
  site: 'https://yuppiecx.com.ar',
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
