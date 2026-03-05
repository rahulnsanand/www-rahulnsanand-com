import { AboutSeparator } from "./about-separator";
import { AboutProfileSummary } from "./about-profile-summary";
import { FooterAccentText } from "@/components/layout/site-footer-accent";

type ResumeNode = {
  id: string;
  title: string;
  role: string;
  period: string;
  bullets: string[];
};

type ResumeGroup = {
  id: string;
  heading?: string;
  items: ResumeNode[];
};

type ResumeSection = {
  id: string;
  heading: string;
  groups: ResumeGroup[];
};

// Add, remove, or reorder content by editing this object only.
const RESUME_SECTIONS: ResumeSection[] = [
  {
    id: "experience",
    heading: "Experience",
    groups: [
      {
        id: "product-engineering",
        items: [
          {
            id: "senior-software-engineer",
            title: "Senior Software Engineer",
            role: "Product Engineering",
            period: "2023 - Present",
            bullets: [
              "Own end-to-end feature delivery across web and platform layers.",
              "Drive architecture decisions with maintainability and clarity as constraints.",
              "Mentor engineers through design reviews and execution planning.",
            ],
          },
          {
            id: "software-engineer",
            title: "Software Engineer",
            role: "Frontend + DX",
            period: "2020 - 2023",
            bullets: [
              "Built reusable UI systems and introduced typed API boundaries.",
              "Reduced bundle and route load costs through targeted performance work.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "projects",
    heading: "Projects",
    groups: [
      {
        id: "selected-projects",
        heading: "Selected Work",
        items: [
          {
            id: "developer-portfolio-platform",
            title: "Developer Portfolio Platform",
            role: "Personal Product",
            period: "2025 - Present",
            bullets: [
              "Crafting a narrative-first site with intentional interaction design.",
              "Balancing expressive visuals with lightweight, accessible implementation.",
            ],
          },
          {
            id: "workflow-automation-toolkit",
            title: "Workflow Automation Toolkit",
            role: "Internal",
            period: "2024",
            bullets: [
              "Shipped automation scripts that cut repetitive ops tasks by over 50%.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "education",
    heading: "Education",
    groups: [
      {
        id: "formal-education",
        items: [
          {
            id: "computer-science",
            title: "Computer Science",
            role: "Engineering Foundation",
            period: "2016 - 2020",
            bullets: [
              "Focused on systems, software design, and practical product development.",
            ],
          },
        ],
      },
    ],
  },
];

export function AboutBody() {
  return (
    <section className="relative pb-12 pt-2 sm:pt-4">
      <FooterAccentText text="public void main()" />
      <div className="relative z-10 mx-auto grid max-w-[1080px] grid-cols-1 gap-10 lg:items-start lg:grid-cols-[300px_48px_1fr] lg:gap-12">
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
            <article key={section.id} aria-labelledby={`about-section-${section.id}`}>
              <h2
                id={`about-section-${section.id}`}
                className="text-4xl font-semibold leading-[1.06] tracking-[-0.03em] text-[rgb(var(--text))] sm:text-[2.85rem]"
              >
                {section.heading}
              </h2>

              <div className="mt-7 space-y-9">
                {section.groups.map((group) => (
                  <div key={group.id}>
                    <ol className="space-y-9">
                      {group.items.map((item) => (
                        <li key={item.id} className="space-y-3.5 border-t border-[rgb(var(--line))/0.34] pt-5 first:border-t-0 first:pt-0">
                          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-6">
                            <div className="space-y-1">
                              <h4 className="text-[1.9rem] font-medium leading-[1.06] tracking-[-0.02em] text-[rgb(var(--text)/0.8)] sm:text-[2rem]">
                                {item.title}
                              </h4>
                              <p className="text-sm font-medium uppercase tracking-[0.07em] text-[rgb(var(--brand)/0.78)] sm:text-[0.96rem]">
                                {item.role}
                              </p>
                            </div>
                            <p className="text-sm font-semibold uppercase tracking-[0.04em] text-[rgb(var(--brand)/0.74)] sm:pt-1 sm:text-right sm:text-[0.98rem]">
                              {item.period}
                            </p>
                          </div>

                          <ul className="space-y-2 pl-6 text-[1.03rem] font-normal leading-[1.52] text-[rgb(var(--text))/0.84] sm:text-[1.06rem] sm:leading-[1.5]">
                            {item.bullets.map((line) => (
                              <li key={line} className="list-disc marker:text-[rgb(var(--brand)/0.72)]">
                                {line}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
