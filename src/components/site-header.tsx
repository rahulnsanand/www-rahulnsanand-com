import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/" className="site-logo-link" aria-label="Rahul NS Anand home">
          <Image
            src="/logo-placeholder.png"
            alt="Placeholder logo for Rahul NS Anand"
            width={32}
            height={32}
            priority
          />
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
