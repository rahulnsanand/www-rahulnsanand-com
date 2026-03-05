"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeLogo } from "@/components/layout/theme-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsCondensed(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className={`site-header ${isCondensed ? "site-header-condensed" : ""}`}>
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
