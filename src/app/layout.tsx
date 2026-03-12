import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import "./root-layout.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { FooterAccentProvider, SiteFooterAccent } from "@/components/layout/site-footer-accent";
import { PageTransition } from "@/components/layout/page-transition";
import { codeFont, headingFont, textFont } from "@/app/fonts";

const themeInitScript = `
  (() => {
    try {
      const PERF_MODE_KEY = "perf-mode";
      const stored = localStorage.getItem("theme");
      const perfMode = localStorage.getItem(PERF_MODE_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
      const deviceMemory = typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : null;
      const cpuCores = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : null;
      const userAgent = navigator.userAgent || "";
      const uaDataMobile =
        navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean"
          ? navigator.userAgentData.mobile
          : null;
      const isMobile =
        uaDataMobile === true ||
        /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
      const lowMemory = deviceMemory !== null && deviceMemory <= 2;
      const veryLowCpu = cpuCores !== null && cpuCores <= 2;
      const constrainedMobile = isMobile && deviceMemory !== null && cpuCores !== null && deviceMemory <= 4 && cpuCores <= 4;
      const hasTouchInput = (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 0) || "ontouchstart" in window;
      const shortestScreenSide = Math.min(window.screen.width || 0, window.screen.height || 0);
      const isSmallTouchScreen = hasTouchInput && shortestScreenSide > 0 && shortestScreenSide <= 1024;
      const hasMobileHardwareSignal = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
      const hasDesktopUserAgentSignal = /Macintosh|Windows NT|X11|Linux x86_64|CrOS/i.test(userAgent);
      const likelyDesktopRequestOnMobile =
        isSmallTouchScreen &&
        hasMobileHardwareSignal &&
        (hasDesktopUserAgentSignal || uaDataMobile === false);
      const viewportContent = likelyDesktopRequestOnMobile
        ? "width=1280, initial-scale=1, viewport-fit=cover"
        : "width=device-width, initial-scale=1, viewport-fit=cover";
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement("meta");
        viewportMeta.setAttribute("name", "viewport");
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute("content", viewportContent);
      document.documentElement.classList.toggle("desktop-requested-mobile", likelyDesktopRequestOnMobile);
      const saveData = Boolean(navigator.connection && navigator.connection.saveData);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const perfReasons = [];
      if (prefersReducedMotion) perfReasons.push("reduced-motion");
      if (saveData) perfReasons.push("save-data");
      if (lowMemory) perfReasons.push("low-memory");
      if (veryLowCpu) perfReasons.push("very-low-cpu");
      if (constrainedMobile) perfReasons.push("constrained-mobile");
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;

      const perfLiteEnabled =
        perfMode === "lite" ? true : perfMode === "full" ? false : perfReasons.length > 0;

      if (perfLiteEnabled) {
        document.documentElement.classList.add("perf-lite");
        document.documentElement.setAttribute("data-perf-lite-reasons", perfReasons.join(","));
      } else {
        document.documentElement.classList.remove("perf-lite");
        document.documentElement.removeAttribute("data-perf-lite-reasons");
      }
    } catch {}
    document.documentElement.setAttribute("data-theme-ready", "true");
  })();
`;

export const metadata: Metadata = {
  title: {
    default: "Rahul NS Anand",
    template: "%s | Rahul NS Anand",
  },
  description:
    "Rahul NS Anand — Software Engineer 2. Open-source contributor. Building AI + personal data tools (Lyfie, Luthor). Blogs, projects, and profiles.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${textFont.variable} ${codeFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <noscript>
          <style>{`html:not([data-theme-ready="true"]) body { visibility: visible; }`}</style>
        </noscript>
      </head>
      <body className="site-body">
        <FooterAccentProvider>
          <div className="site-shell">
            <SiteHeader />
            <main className="site-main">
              <PageTransition>{children}</PageTransition>
            </main>
            <footer className="site-footer">
              <SiteFooterAccent />
            </footer>
          </div>
        </FooterAccentProvider>
      </body>
    </html>
  );
}
