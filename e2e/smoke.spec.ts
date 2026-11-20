import { expect, test } from "@playwright/test";
import { targets } from "./targets";

// Smoke tests: open each BUILT game in a real browser and make sure it actually starts.
// These catch what unit tests can't: a broken production build, a missing entry file,
// a runtime exception on load, or a game that renders nothing.
for (const target of targets) {
  test(`${target.workspace} starts without errors`, async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(`uncaught: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(`console.error: ${message.text()}`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
    });

    await page.goto(`http://localhost:${target.port}/`);

    if (target.title) await expect(page).toHaveTitle(target.title);

    // The app must have mounted something into its root element...
    // (Check for child elements: toBeEmpty() looks at text, and a Konva canvas has none.)
    await expect(page.locator(`${target.mount} > *`).first()).toBeAttached();

    // ...and Konva games must have drawn a real, non-empty canvas.
    if (target.canvas) {
      const canvas = page.locator(`${target.mount} canvas`).first();
      await expect(canvas).toBeVisible();
      const box = await canvas.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThan(0);
      expect(box?.height ?? 0).toBeGreaterThan(0);
    }

    // Let async startup work (fonts, timers, first render) finish before judging.
    await page.waitForTimeout(500);
    expect(problems, problems.join("\n")).toEqual([]);
  });
}
