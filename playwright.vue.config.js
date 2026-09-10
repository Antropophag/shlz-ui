import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tools/playwright-vue",
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4175",
    locale: "ru-RU",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "npm run generate && npm run build -w @shlz/vue && node apps/vue-consumer/server.mjs",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
