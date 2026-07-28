import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages sirve este repo bajo /Escuelaamplifica/, no en la raíz del dominio.
  base: process.env.GH_PAGES ? '/Escuelaamplifica/' : '/',
});
