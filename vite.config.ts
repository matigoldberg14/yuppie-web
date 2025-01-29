import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  ssr: {
    noExternal: ['@nanostores/react'],
  },
  build: {
    rollupOptions: {
      external: [
        '@emotion/is-prop-valid',
        '@img/sharp-wasm32/versions',
        '@img/sharp-libvips-/package',
        '@img/sharp-libvips-dev/include',
        '@img/sharp-libvips-dev/cplusplus',
      ],
    },
  },
});
