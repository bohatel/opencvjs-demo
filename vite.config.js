import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [
    solidPlugin(),
    commonjs()
  ],
  server: {
    port: 3001,
    host: true
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/src/],
    }
  },
});
