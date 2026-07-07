import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Standalone build that inlines all JS/CSS into a single index.html,
// used only to publish a shareable static preview of the app.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-demo',
  },
});
