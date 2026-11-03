import { cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: { copyPublicDir: false },
  plugins: [
    react(),
    {
      name: 'publish-playback-assets',
      apply: 'build',
      writeBundle({ dir }) {
        const publicDir = resolve('public');
        const sourceFolders = new Set(['local-voices', 'local-sound'].map(name => resolve(publicDir, name)));
        cpSync(publicDir, dir ?? 'dist', {
          recursive: true,
          filter: path => !sourceFolders.has(resolve(path)),
        });
      },
    },
  ],
});
