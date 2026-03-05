import Link from "next/link";
import { ArrowLeft, Compass, House, WarningCircle } from "@phosphor-icons/react/dist/ssr";

const quickLinks = [
  { href: "/", label: "Back Home", icon: House },
  { href: "/projects", label: "See Projects", icon: Compass },
  { href: "/contact", label: "Contact", icon: ArrowLeft },
] as const;

export default function NotFound() {
  return (
    <section
      className="relative flex min-h-[70vh] items-center"
      aria-labelledby="not-found-title"
    >
      <div className="pointer-events-none absolute left-1/2 top-14 -translate-x-1/2 text-[28vw] font-semibold leading-none tracking-[-0.08em] text-[rgb(var(--brand)/0.12)] sm:text-[12rem]">
        404
      </div>

      <div className="relative w-full max-w-3xl py-8 sm:py-10">
        <div className="pointer-events-none absolute -left-10 -top-8 h-40 w-40 rounded-full bg-[rgb(var(--grid-p1)/0.2)] blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-4 h-36 w-36 rounded-full bg-[rgb(var(--grid-p2)/0.16)] blur-3xl" />
        <div className="pointer-events-none absolute left-1/4 top-1/2 h-44 w-44 rounded-full bg-[rgb(var(--grid-p3)/0.14)] blur-3xl" />

        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
          Error 404
        </p>
        <h1
          id="not-found-title"
          className="relative mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl"
        >
          Page not found
        </h1>
        <p className="relative mt-4 max-w-2xl text-base leading-8 text-[rgb(var(--muted))] sm:text-lg">
          The path you opened does not exist or may have moved. Jump to a valid
          page below.
        </p>

        <div className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line)/0.65)] bg-[rgb(var(--bg)/0.36)] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[rgb(var(--brand))]">
          <WarningCircle size={16} weight="duotone" />
          <span>NOT_FOUND</span>
          <strong className="text-sm tracking-[0.06em]">404</strong>
        </div>

        <nav
          className="relative mt-7 flex flex-wrap items-center gap-3"
          aria-label="Helpful links"
        >
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--line)/0.7)] bg-[rgb(var(--bg)/0.34)] px-4 py-2 text-sm font-medium text-[rgb(var(--brand))] transition hover:-translate-y-px hover:border-[rgb(var(--muted)/0.52)] hover:bg-[rgb(var(--bg)/0.52)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]"
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
