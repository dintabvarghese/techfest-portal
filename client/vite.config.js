import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Puts the small CSS file directly inside index.html, so the browser does not wait for it
function inlineCss() {
  return {
    name: 'inline-css',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      return html.replace(
        /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
        (tag, href) => {
          const asset = ctx.bundle[href.replace(/^\//, '')];
          return asset ? `<style>${asset.source}</style>` : tag;
        }
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCss()],
  server: {
    // In development, /api calls go to the local Express server (same origin -> no CORS/cookie trouble)
    proxy: { '/api': 'http://localhost:5000' },
  },
});