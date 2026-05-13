// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sentry from '@sentry/astro';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  server: {
    port: 8080,
  },
  integrations: [
    react(),
    sentry({
      project: "kiorapp-frontend",
      org: "kiora-bv",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    })
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Forzar sourcemaps si estamos en producción para que Sentry pueda procesarlos
      sourcemap: true,
      cssMinify: true,
      minify: 'esbuild',
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
});