import Image from "next/image";
import Link from "next/link";
import { AboutSeparator } from "./about-separator";

type ResumeNode = {
  title: string;
  subtitle: string;
  period: string;
  details: string[];
};

const RESUME_SECTIONS: { heading: string; items: ResumeNode[] }[] = [
  {
    heading: "Experience",
    items: [
      {
        title: "Senior Software Engineer",
        subtitle: "Product Engineering",
        period: "2023 - Present",
        details: [
          "Own end-to-end feature delivery across web and platform layers.",
          "Drive architecture decisions with maintainability and clarity as constraints.",
          "Mentor engineers through design reviews and execution planning.",
        ],
      },
      {
        title: "Software Engineer",
        subtitle: "Frontend + DX",
        period: "2020 - 2023",
        details: [
          "Built reusable UI systems and introduced typed API boundaries.",
          "Reduced bundle and route load costs through targeted performance work.",
        ],
      },
    ],
  },
  {
    heading: "Projects",
    items: [
      {
        title: "Developer Portfolio Platform",
        subtitle: "Personal Product",
        period: "2025 - Present",
        details: [
          "Crafting a narrative-first site with intentional interaction design.",
          "Balancing expressive visuals with lightweight, accessible implementation.",
        ],
      },
      {
        title: "Workflow Automation Toolkit",
        subtitle: "Internal",
        period: "2024",
        details: [
          "Shipped automation scripts that cut repetitive ops tasks by over 50%.",
        ],
      },
    ],
  },
  {
    heading: "Education",
    items: [
      {
        title: "Computer Science",
        subtitle: "Engineering Foundation",
        period: "2016 - 2020",
        details: [
          "Focused on systems, software design, and practical product development.",
        ],
      },
    ],
  },
];

const PRIMARY_LINKS = [
  { href: "/projects", label: "View Projects" },
  { href: "/blogs", label: "Read Blogs" },
  { href: "/contact", label: "Contact Rahul" },
] as const;

export function AboutBody() {
  return (
    <section className="relative pb-12 pt-2 sm:pt-4">
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 gap-10 lg:grid-cols-[300px_48px_1fr] lg:gap-12">
        <aside className="lg:self-start" aria-label="Profile summary">
          <div className="px-1 lg:w-[300px]">
            <Image
              src="https://github.com/rahulnsanand.png"
              alt="Rahul NS Anand profile photo"
              width={144}
              height={144}
              className="h-36 w-36 rounded-full border border-[rgb(var(--line))] object-cover"
              priority
            />
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[rgb(var(--text))] sm:text-4xl">
              Rahul NS Anand
            </h1>
            <p className="mt-4 text-sm leading-7 text-[rgb(var(--muted))]">
              I build software products with a product mindset, clear architecture, and an obsession for
              maintainable execution.
            </p>

            <dl className="mt-7 space-y-2 text-xs text-[rgb(var(--muted))]">
              <div className="flex gap-2">
                <dt className="font-medium text-[rgb(var(--text))]">Based:</dt>
                <dd>India</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-[rgb(var(--text))]">Focus:</dt>
                <dd>Product Engineering</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-[rgb(var(--text))]">Interests:</dt>
                <dd>Systems, UX, Developer Experience</dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap gap-2">
              {PRIMARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center rounded-full border border-[rgb(var(--line))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted))] transition hover:border-[rgb(var(--brand)/0.45)] hover:text-[rgb(var(--brand))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="relative hidden lg:flex justify-center" aria-hidden>
          <div className="relative h-full w-px">
            <AboutSeparator
              className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2"
              filterId="about-orb-glow-desktop"
              glowBlurA={2.8}
              glowBlurB={5.5}
              baseStroke="rgb(var(--brand) / 0.2)"
              baseWidth={1.4}
              activeStroke="rgb(var(--brand) / 0.94)"
              activeWidth={2.05}
              orbRadius={4.2}
            />
          </div>
        </div>

        <div className="relative space-y-14 pl-7 sm:pl-8 lg:pl-0">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-7 lg:hidden" aria-hidden>
            <div className="relative h-full">
              <AboutSeparator
                className="absolute left-3 top-0 h-full w-6 -translate-x-1/2"
                filterId="about-orb-glow-mobile"
                glowBlurA={2.4}
                glowBlurB={4.8}
                baseStroke="rgb(var(--brand) / 0.16)"
                baseWidth={1.2}
                activeStroke="rgb(var(--brand) / 0.92)"
                activeWidth={1.6}
                orbRadius={3.2}
              />
            </div>
          </div>
          {RESUME_SECTIONS.map((section) => (
            <article key={section.heading} aria-labelledby={`about-section-${section.heading.toLowerCase()}`}>
              <h2
                id={`about-section-${section.heading.toLowerCase()}`}
                className="text-3xl font-semibold tracking-[-0.03em] text-[rgb(var(--text))] sm:text-4xl"
              >
                {section.heading}
              </h2>
              <ol className="mt-8 space-y-10">
                {section.items.map((item) => (
                  <li key={`${section.heading}-${item.title}-${item.period}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[rgb(var(--text))] sm:text-3xl">
                        {item.title}
                      </h3>
                      <span className="text-base text-[rgb(var(--muted))] sm:text-lg">{item.period}</span>
                    </div>
                    <p className="mt-1 text-base text-[rgb(var(--brand))] sm:text-lg">{item.subtitle}</p>
                    <ul className="mt-5 space-y-3 text-base leading-8 text-[rgb(var(--text))]/90 sm:text-lg sm:leading-9">
                      {item.details.map((line) => (
                        <li key={line} className="list-disc pl-1 marker:text-[rgb(var(--brand))]">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
