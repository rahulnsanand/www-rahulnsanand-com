import type { Metadata } from "next";
import "@/styles/globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { FooterAccentProvider, SiteFooterAccent } from "@/components/layout/site-footer-accent";

const themeInitScript = `
  (() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = stored === "light" || stored === "dark" ? stored : (prefersDark ? "dark" : "light");
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
    } catch {}
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
      </head>
      <body className="site-body">
        <FooterAccentProvider>
          <div className="site-shell">
            <SiteHeader />
            <main className="site-main">{children}</main>
            <footer className="site-footer">
              <SiteFooterAccent />
            </footer>
          </div>
        </FooterAccentProvider>
      </body>
    </html>
  );
}
