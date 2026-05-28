import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 3000,
    // Expose the dev server on ALL network interfaces (not just localhost).
    // This is required so Android phones on the same WiFi can reach the frontend.
    // Vite will print the network URL (e.g. http://10.92.246.202:3000) on startup.
    host: true,
    // Proxy /api requests to the backend so Android doesn't need to know the
    // backend port separately — the frontend URL is the only thing the phone needs.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});