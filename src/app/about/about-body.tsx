import { AboutSeparator } from "./about-separator";
import { AboutProfileSummary } from "./about-profile-summary";

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

export function AboutBody() {
  return (
    <section className="relative pb-12 pt-2 sm:pt-4">
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 gap-10 lg:items-start lg:grid-cols-[300px_48px_1fr] lg:gap-12">
        <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="Profile summary">
          <AboutProfileSummary />
        </aside>

        <div className="relative hidden overflow-visible lg:block lg:self-stretch" aria-hidden>
          <AboutSeparator
            className="absolute inset-y-0 left-1/2 h-full w-8 -translate-x-1/2"
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

        <div className="relative space-y-14">
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
