"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { ThemeLogo } from "@/components/layout/theme-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact", label: "Contact" },
] as const;

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
}

type NavClickHandler = (event: MouseEvent<HTMLAnchorElement>, href: string) => void;

function isNavItemActive(currentPath: string, href: string) {
  const normalizedHref = normalizePath(href);
  if (normalizedHref === "/") {
    return currentPath === "/";
  }

  return currentPath === normalizedHref || currentPath.startsWith(`${normalizedHref}/`);
}

function NavLinks({
  onNavClick,
  currentPath,
  id,
}: {
  onNavClick: NavClickHandler;
  currentPath: string;
  id?: string;
}) {
  return (
    <ul className="site-nav-links" id={id}>
      {navItems.map((item) => {
        const isActive = isNavItemActive(currentPath, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`site-nav-link${isActive ? " site-nav-link--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={(event) => onNavClick(event, item.href)}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function HeaderNav({ onNavClick, currentPath }: { onNavClick: NavClickHandler; currentPath: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 640) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleNavClick: NavClickHandler = (event, href) => {
    setIsMenuOpen(false);
    onNavClick(event, href);
  };

  return (
    <nav className={`site-nav${isMenuOpen ? " site-nav--menu-open" : ""}`} aria-label="Primary navigation">
      <Link
        href="/"
        className="site-logo-link"
        aria-label="Rahul NS Anand home"
        onClick={(event) => handleNavClick(event, "/")}
      >
        <ThemeLogo />
      </Link>

      <div className="site-nav-right">
        <ThemeToggle />
        <button
          type="button"
          className="site-nav-menu-toggle"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="primary-nav-links"
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          {isMenuOpen ? <X size={16} weight="bold" aria-hidden="true" /> : <List size={16} weight="bold" aria-hidden="true" />}
        </button>
      </div>
      <NavLinks onNavClick={handleNavClick} currentPath={currentPath} id="primary-nav-links" />
    </nav>
  );
}

function FloatingNav({ onNavClick, currentPath }: { onNavClick: NavClickHandler; currentPath: string }) {
  return (
    <nav className="site-nav site-nav--floating-mini" aria-label="Floating navigation">
      <div className="site-nav-right site-nav-right--floating">
        <NavLinks onNavClick={onNavClick} currentPath={currentPath} />
        <ThemeToggle />
      </div>
    </nav>
  );
}

export function SiteHeader() {
  const staticHeaderRef = useRef<HTMLElement | null>(null);
  const [isFloating, setIsFloating] = useState(false);
  const pathname = usePathname();
  const currentPath = normalizePath(pathname);

  const handleSamePageClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (currentPath !== normalizePath(href)) {
      return;
    }

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  useEffect(() => {
    const floatTriggerOffset = 16;
    let ticking = false;

    const updateHeaderState = () => {
      const staticHeader = staticHeaderRef.current;
      if (!staticHeader) {
        return;
      }

      const headerBottom = staticHeader.getBoundingClientRect().bottom;
      const isHeaderAlmostOut = headerBottom <= floatTriggerOffset;

      setIsFloating(isHeaderAlmostOut);
    };

    const onScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        updateHeaderState();
        ticking = false;
      });
    };
    updateHeaderState();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [currentPath]);

  return (
    <>
      <header ref={staticHeaderRef} className="site-header">
        <HeaderNav key={currentPath} onNavClick={handleSamePageClick} currentPath={currentPath} />
      </header>
      <header
        className={`site-header-floating${isFloating ? " site-header-floating--visible" : ""}`}
        aria-hidden={!isFloating}
      >
        <FloatingNav onNavClick={handleSamePageClick} currentPath={currentPath} />
      </header>
    </>
  );
}
