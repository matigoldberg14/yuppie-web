import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import path from 'path';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';

export default defineConfig({
  integrations: [tailwind(), react(), icon()],
  output: 'server',
  adapter: vercel(),
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
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
