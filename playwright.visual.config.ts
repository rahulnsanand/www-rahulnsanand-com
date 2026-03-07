import { defineConfig } from "@playwright/test";

const baseURL = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 90_000,
  retries: process.env.CI ? 2 : 0,
  fullyParallel: false,
  outputDir: ".docs/visual-test-results",
  snapshotPathTemplate: ".docs/visual-baseline/{testFilePath}/{arg}{ext}",
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.0035,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: process.env.VISUAL_BASE_URL
    ? undefined
    : {
        command: "node ./node_modules/next/dist/bin/next start -p 3000",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
