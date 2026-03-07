import { expect, test, type Page } from "@playwright/test";

async function gotoWithTheme(page: Page, routePath: string, theme: "light" | "dark") {
  await page.addInitScript((preferredTheme) => {
    localStorage.setItem("theme", preferredTheme);
  }, theme);

  await page.goto(routePath, { waitUntil: "networkidle" });
  await page.evaluate((preferredTheme) => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(preferredTheme);
    document.documentElement.style.colorScheme = preferredTheme;
    document.documentElement.setAttribute("data-theme-ready", "true");
  }, theme);
}

test("home-name-underline-renders-after-animation", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await gotoWithTheme(page, "/", "light");
  await page.waitForTimeout(2300);

  const underline = page.locator(".home-name-underline-main");
  await expect(underline).toBeVisible();

  const dashOffset = await underline.evaluate((node) => {
    const style = getComputedStyle(node);
    return Number.parseFloat(style.strokeDashoffset);
  });

  expect(dashOffset).toBeLessThanOrEqual(1);
});

test("about-skill-tooltip-appears-on-hover", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await gotoWithTheme(page, "/about", "light");

  const badge = page.locator(".about-tool-badge").first();
  await expect(badge).toBeVisible();
  await badge.hover();
  await page.waitForTimeout(320);

  const tooltip = await badge.evaluate((node) => {
    const style = getComputedStyle(node, "::after");
    return {
      opacity: Number.parseFloat(style.opacity),
      content: style.content,
    };
  });

  expect(tooltip.opacity).toBeGreaterThanOrEqual(0.95);
  expect(tooltip.content).not.toBe("none");
});
