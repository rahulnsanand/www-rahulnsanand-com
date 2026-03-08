import { expect, test, type Page } from "@playwright/test";

const BLOG_POST_PATH = "/blogs/designing-a-quiet-developer-portfolio";

const routes = [
  { id: "home", path: "/" },
  { id: "about", path: "/about" },
  { id: "projects", path: "/projects" },
  { id: "blogs", path: "/blogs" },
  { id: "blog-post", path: BLOG_POST_PATH },
  { id: "contact", path: "/contact" },
  { id: "not-found", path: "/__visual-regression-not-found__" },
] as const;

const themes = ["light", "dark"] as const;

const viewports = [
  { id: "desktop", width: 1366, height: 900 },
  { id: "mobile", width: 390, height: 844 },
] as const;

async function gotoWithTheme(page: Page, routePath: string, theme: (typeof themes)[number]) {
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
  await page.waitForTimeout(120);
}

for (const viewport of viewports) {
  for (const theme of themes) {
    for (const route of routes) {
      test(`route-${route.id}-${theme}-${viewport.id}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await gotoWithTheme(page, route.path, theme);
        await expect(page).toHaveScreenshot(`route-${route.id}-${theme}-${viewport.id}.png`, { fullPage: true });
      });
    }
  }
}

test("state-header-floating", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await gotoWithTheme(page, "/", "light");
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(220);
  await expect(page).toHaveScreenshot("state-header-floating.png", { fullPage: true });
});

test("state-mobile-menu-open", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoWithTheme(page, "/", "dark");
  await page.getByRole("button", { name: /open navigation menu/i }).click();
  await page.waitForTimeout(120);
  await expect(page).toHaveScreenshot("state-mobile-menu-open.png", { fullPage: true });
});

test("state-projects-carousel-next-prev", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await gotoWithTheme(page, "/projects", "light");
  await page.getByRole("button", { name: /show next highlighted project/i }).click();
  await page.waitForTimeout(420);
  await page.getByRole("button", { name: /show previous highlighted project/i }).click();
  await page.waitForTimeout(420);
  await expect(page).toHaveScreenshot("state-projects-carousel-next-prev.png", { fullPage: true });
});

test("state-projects-carousel-dot-progress", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await gotoWithTheme(page, "/projects", "light");
  await page.waitForTimeout(1400);
  await page.locator(".projects-highlight-viewport").hover();
  await page.waitForTimeout(120);
  await expect(page).toHaveScreenshot("state-projects-carousel-dot-progress.png", { fullPage: true });
});

test("behavior-projects-carousel-hover-pauses-dot-progress", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem("perf-mode", "full");
  });
  await gotoWithTheme(page, "/projects", "light");
  await page.waitForTimeout(700);

  const activeProgress = page.locator(".projects-highlight-dot[aria-current='true'] .projects-highlight-dot-progress");
  await expect(activeProgress).toHaveCount(1);
  await expect(activeProgress).toHaveCSS("animation-play-state", "running");

  const beforePause = await activeProgress.evaluate((node) =>
    Number.parseFloat(getComputedStyle(node).strokeDashoffset || "0"),
  );

  await page.locator(".projects-highlight-viewport").hover();
  await expect(activeProgress).toHaveCSS("animation-play-state", "paused");
  await page.waitForTimeout(750);

  const afterPause = await activeProgress.evaluate((node) =>
    Number.parseFloat(getComputedStyle(node).strokeDashoffset || "0"),
  );

  expect(Math.abs(afterPause - beforePause)).toBeLessThan(0.03);
});

test("behavior-projects-carousel-hover-exit-restarts-dot-progress", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem("perf-mode", "full");
  });
  await gotoWithTheme(page, "/projects", "light");
  await page.waitForTimeout(1600);

  const activeProgress = page.locator(".projects-highlight-dot[aria-current='true'] .projects-highlight-dot-progress");
  await expect(activeProgress).toHaveCount(1);

  const beforeHover = await activeProgress.evaluate((node) =>
    Number.parseFloat(getComputedStyle(node).strokeDashoffset || "0"),
  );
  expect(beforeHover).toBeLessThan(0.8);

  await page.locator(".projects-highlight-viewport").hover();
  await expect(activeProgress).toHaveCSS("animation-play-state", "paused");
  await page.waitForTimeout(350);
  await page.mouse.move(8, 8);
  await page.waitForTimeout(140);
  await expect(activeProgress).toHaveCSS("animation-play-state", "running");

  const afterHoverExit = await activeProgress.evaluate((node) =>
    Number.parseFloat(getComputedStyle(node).strokeDashoffset || "0"),
  );
  expect(afterHoverExit).toBeGreaterThan(0.9);
});

test("behavior-projects-carousel-autoplay-advances-on-mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("perf-mode", "full");
  });
  await gotoWithTheme(page, "/projects", "dark");

  const dotCount = await page.locator(".projects-highlight-dot").count();
  test.skip(dotCount < 2, "Requires at least 2 highlighted projects.");

  const getActiveDotIndex = async () =>
    page.evaluate(() => {
      const dots = Array.from(document.querySelectorAll<HTMLButtonElement>(".projects-highlight-dot"));
      return dots.findIndex((dot) => dot.getAttribute("aria-current") === "true");
    });

  const initialIndex = await getActiveDotIndex();
  await page.waitForTimeout(5600);
  const laterIndex = await getActiveDotIndex();

  expect(initialIndex).toBeGreaterThanOrEqual(0);
  expect(laterIndex).toBeGreaterThanOrEqual(0);
  expect(laterIndex).not.toBe(initialIndex);
});

test("state-blogs-search-active", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await gotoWithTheme(page, "/blogs", "dark");
  await page.locator("#blogs-search").fill("portfolio");
  await page.waitForTimeout(120);
  await expect(page).toHaveScreenshot("state-blogs-search-active.png", { fullPage: true });
});

test("state-contact-form-validation", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "Synthetic validation error." }),
    });
  });
  await gotoWithTheme(page, "/contact", "light");
  await page.locator("#senderEmail").fill("qa@example.com");
  await page.locator("#message").fill("This is a validation flow check for visual regression.");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByText(/Synthetic validation error/i)).toBeVisible();
  await expect(page).toHaveScreenshot("state-contact-form-validation.png", { fullPage: true });
});

test("state-blog-share-copied", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await gotoWithTheme(page, BLOG_POST_PATH, "dark");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => undefined,
      },
    });
  });
  await page.getByRole("button", { name: /share post/i }).click();
  await expect(page.getByRole("button", { name: /link copied/i })).toBeVisible();
  await expect(page).toHaveScreenshot("state-blog-share-copied.png", { fullPage: true });
});

test("state-blog-share-failed", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await gotoWithTheme(page, BLOG_POST_PATH, "light");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Clipboard failure");
        },
      },
    });
  });
  await page.getByRole("button", { name: /share post/i }).click();
  await expect(page.getByRole("button", { name: /copy failed/i })).toBeVisible();
  await expect(page).toHaveScreenshot("state-blog-share-failed.png", { fullPage: true });
});

test("state-blog-scroll-top-visible", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await gotoWithTheme(page, BLOG_POST_PATH, "dark");
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(220);
  await expect(page.getByRole("button", { name: /scroll to top/i })).toBeVisible();
  await expect(page).toHaveScreenshot("state-blog-scroll-top-visible.png", { fullPage: true });
});
