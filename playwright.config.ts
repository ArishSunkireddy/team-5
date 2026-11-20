import { defineConfig, devices } from "@playwright/test";
import { targets } from "./e2e/targets";

// Run with `npm run test:e2e` (builds every game first, then serves each build and tests it).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: targets.map((target) => ({
    command: `npm run preview -w ${target.workspace} -- --port ${target.port} --strictPort`,
    url: `http://localhost:${target.port}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  })),
});
