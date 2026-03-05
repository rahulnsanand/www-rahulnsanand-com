import {
  DiamondsFour,
  EnvelopeSimple,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/about", label: "About", icon: Sparkle },
  { href: "/projects", label: "Projects", icon: DiamondsFour },
  { href: "/contact", label: "Contact", icon: EnvelopeSimple },
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
                  <item.icon
                    size={16}
                    weight="duotone"
                    className="site-nav-icon"
                    aria-hidden="true"
                  />
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
