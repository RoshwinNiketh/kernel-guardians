import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Identical committed playback media in development and production.
export default defineConfig({ plugins: [react()] });
