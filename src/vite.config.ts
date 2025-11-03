import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    'import.meta.env.VITE_KAKAO_JS_KEY': JSON.stringify('94e86b9b6ddf71039ab09c9902d2d79f'),
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
        },
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    cors: true
  },
  publicDir: 'public'
});
