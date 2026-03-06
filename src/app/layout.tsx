import type { Metadata } from "next";
import "@/styles/globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { FooterAccentProvider, SiteFooterAccent } from "@/components/layout/site-footer-accent";
import { PageTransition } from "@/components/layout/page-transition";

const themeInitScript = `
  (() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
      const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
      const lowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
      const saveData = Boolean(navigator.connection && navigator.connection.saveData);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
      if (lowMemory || lowCpu || saveData || prefersReducedMotion) {
        document.documentElement.classList.add("perf-lite");
      } else {
        document.documentElement.classList.remove("perf-lite");
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
