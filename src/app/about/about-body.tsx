import { AboutSeparator } from "./about-separator";
import { AboutProfileSummary } from "./about-profile-summary";
import { FooterAccentText } from "@/components/layout/site-footer-accent";
import { aboutContent } from "@/lib/about";

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
          {aboutContent.sections.map((section) => (
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
