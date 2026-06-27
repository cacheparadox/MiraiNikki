import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mirai Nikki',
        short_name: 'Mirai Nikki',
        description: 'Privacy-first daily commitment journal',
        theme_color: '#0F1117',
        background_color: '#0F1117',
        display: 'standalone',
        icons: [] // We can add actual icons later
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
