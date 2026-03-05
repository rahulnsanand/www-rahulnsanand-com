import Link from "next/link";
import { ThemeLogo } from "@/components/layout/theme-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/" className="site-logo-link" aria-label="Rahul NS Anand home">
          <ThemeLogo />
        </Link>

        <div className="site-nav-right">
          <ul className="site-nav-links">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="site-nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
