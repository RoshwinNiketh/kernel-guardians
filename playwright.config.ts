import { defineConfig } from "@playwright/test";
const port = process.env.KG_PORT ?? "5182";
const url = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  use: { baseURL: url, channel: "chrome", headless: true },
  webServer: {
    command: `npm run dev -- --port ${port} --strictPort`,
    url,
    reuseExistingServer: true,
  },
  reporter: "list",
});
