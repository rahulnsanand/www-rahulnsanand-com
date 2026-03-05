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
    <section className="about-page">
      <FooterAccentText text="public void main()" />
      <div className="about-layout">
        <aside className="about-sidebar" aria-label="Profile summary">
          <AboutProfileSummary />
        </aside>

        <div className="about-separator-wrap" aria-hidden>
          <AboutSeparator
            className="about-separator"
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

        <div className="about-content">
          {RESUME_SECTIONS.map((section) => (
            <article key={section.id} aria-labelledby={`about-section-${section.id}`}>
              <h2
                id={`about-section-${section.id}`}
                className="about-section-title"
              >
                {section.heading}
              </h2>

              <div className="about-section-block">
                {section.groups.map((group) => (
                  <div key={group.id}>
                    <ol className="about-items">
                      {group.items.map((item) => (
                        <li key={item.id} className="about-item">
                          <div className="about-item-header">
                            <div className="about-item-main">
                              <h4 className="about-item-title">
                                {item.title}
                              </h4>
                              <p className="about-item-role">
                                {item.role}
                              </p>
                            </div>
                            <p className="about-item-period">
                              {item.period}
                            </p>
                          </div>

                          <ul className="about-item-bullets">
                            {item.bullets.map((line) => (
                              <li key={line} className="about-item-bullet">
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
