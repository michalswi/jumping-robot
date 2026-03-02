import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // Cache everything (JS, CSS, images, fonts) so the game runs offline
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,jpg,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB (Phaser is big)
      },
      manifest: {
        name: 'Jumping Robot',
        short_name: 'JumpingRobot',
        description: 'Endless runner — play offline too!',
        theme_color: '#0f3460',
        background_color: '#0f3460',
        display: 'fullscreen',
        orientation: 'landscape',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
});
