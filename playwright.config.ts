import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', timeout: 60000, use: { baseURL: 'http://127.0.0.1:5182', channel: 'chrome', headless: true }, webServer: { command: 'npm run dev -- --port 5182 --strictPort', url: 'http://127.0.0.1:5182', reuseExistingServer: true }, reporter: 'list' });
