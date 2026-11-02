import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // In development, /api calls go to the local Express server (same origin -> no CORS/cookie trouble)
    proxy: { '/api': 'http://localhost:5000' },
  },
});
