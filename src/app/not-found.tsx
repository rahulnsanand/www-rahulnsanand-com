import Link from "next/link";
import { ArrowLeft, Compass, House, WarningCircle } from "@phosphor-icons/react/dist/ssr";

const quickLinks = [
  { href: "/", label: "Back Home", icon: House },
  { href: "/projects", label: "See Projects", icon: Compass },
  { href: "/contact", label: "Contact", icon: ArrowLeft },
] as const;

export default function NotFound() {
  return (
    <section className="nf-page" aria-labelledby="not-found-title">
      <div className="nf-code-bg">
        404
      </div>

      <div className="nf-panel">
        <div className="nf-glow nf-glow--a" />
        <div className="nf-glow nf-glow--b" />
        <div className="nf-glow nf-glow--c" />

        <p className="nf-kicker">
          Error 404
        </p>
        <h1 id="not-found-title" className="nf-title">
          Page not found
        </h1>
        <p className="nf-copy">
          The path you opened does not exist or may have moved. Jump to a valid
          page below.
        </p>

        <div className="nf-pill">
          <WarningCircle size={16} weight="duotone" />
          <span>NOT_FOUND</span>
          <strong className="nf-pill-code">404</strong>
        </div>

        <nav className="nf-links" aria-label="Helpful links">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nf-link u-theme-fade-target u-focus-ring-target"
            >
              <item.icon size={16} weight="duotone" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
