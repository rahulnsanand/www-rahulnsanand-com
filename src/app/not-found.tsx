import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Compass,
  EnvelopeSimple,
  House,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { notFoundContent, type NotFoundLinkIcon } from "@/lib/not-found-content";

const linkIcons = {
  house: House,
  compass: Compass,
  "arrow-left": ArrowLeft,
  "arrow-up-right": ArrowUpRight,
  envelope: EnvelopeSimple,
} satisfies Record<NotFoundLinkIcon, typeof House>;

export default function NotFound() {
  return (
    <section className="nf-page" aria-labelledby="not-found-title">
      <div className="nf-code-bg">{notFoundContent.backgroundCode}</div>

      <div className="nf-panel">
        <div className="nf-glow nf-glow--a" />
        <div className="nf-glow nf-glow--b" />
        <div className="nf-glow nf-glow--c" />

        <p className="nf-kicker u-font-heading">{notFoundContent.kicker}</p>
        <h1 id="not-found-title" className="nf-title">
          {notFoundContent.title}
        </h1>
        <p className="nf-copy">{notFoundContent.copy}</p>

        <div className="nf-pill u-font-heading">
          <WarningCircle size={16} weight="duotone" />
          <span>{notFoundContent.pillLabel}</span>
          <strong className="nf-pill-code">{notFoundContent.pillCode}</strong>
        </div>

        <nav className="nf-links" aria-label="Helpful links">
          {notFoundContent.links.map((item) => {
            const Icon = linkIcons[item.icon] ?? House;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nf-link u-theme-fade-target u-focus-ring-target"
              >
                <Icon size={16} weight="duotone" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
