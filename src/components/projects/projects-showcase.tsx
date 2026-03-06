import Link from "next/link";
import Image from "next/image";
import { GithubLogo, GlobeHemisphereWest } from "@phosphor-icons/react/dist/ssr";
import { FooterAccentText } from "@/components/layout/site-footer-accent";
import { HighlightedProjectsCarousel } from "@/components/projects/highlighted-projects-carousel";
import { type GithubProject, type HighlightProject } from "@/lib/projects";

type ProjectsShowcaseProps = {
  highlightedProjects: HighlightProject[];
  otherProjects: GithubProject[];
};

export function ProjectsShowcase({ highlightedProjects, otherProjects }: ProjectsShowcaseProps) {
  return (
    <section className="projects-page" aria-label="Projects">
      <FooterAccentText text="src/deployed" />

      <section className="projects-section" aria-labelledby="projects-highlight-heading">
        <div className="projects-section-head" data-sketch-safe-zone="hard">
          <h2 id="projects-highlight-heading" className="projects-section-sr-title">
            Highlighted projects
          </h2>
          <p className="projects-section-copy projects-section-copy--kicker">Projects that make an impact</p>
        </div>

        <HighlightedProjectsCarousel projects={highlightedProjects} />
      </section>

      <section className="projects-section" aria-labelledby="projects-other-heading">
        <div className="projects-section-head" data-sketch-safe-zone="hard">
          <h2 id="projects-other-heading" className="projects-section-sr-title">
            Other projects
          </h2>
          <p className="projects-section-copy projects-section-copy--kicker">
            Less glamorous, but part of my journey
          </p>
        </div>

        {otherProjects.length === 0 ? (
          <p className="projects-empty-state">Unable to load repositories from GitHub right now.</p>
        ) : (
          <ol className="projects-grid" aria-label="Other GitHub repositories" data-sketch-safe-zone="hard">
            {otherProjects.map((project) => (
              <li key={project.id} className="projects-grid-item">
                <article className="project-card">
                  <Link
                    href={project.cardClickUrl}
                    className="project-card-overlay-link"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`Open ${project.displayTitle} on ${project.cardClickTarget === "website" ? "website" : "GitHub"}`}
                  />
                  <div className="project-card-media-wrap">
                    <Image
                      src={project.previewImageUrl}
                      alt={`Preview for ${project.displayTitle}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="project-card-media"
                    />
                  </div>

                  <div className="project-card-main">
                    <h3 className="project-card-title">{project.displayTitle}</h3>
                    <p className="project-card-description">{project.description ?? "Repository on GitHub."}</p>
                  </div>

                  <div className="project-card-links">
                    <Link
                      href={project.htmlUrl}
                      className={`project-card-link project-card-link--icon project-card-link--github${
                        project.cardClickTarget === "github" ? " project-card-link--active-target" : ""
                      }`}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`Open ${project.displayTitle} on GitHub`}
                      title="GitHub"
                    >
                      <GithubLogo size={15} weight="duotone" aria-hidden="true" />
                    </Link>
                    {project.homepage ? (
                      <Link
                        href={project.homepage}
                        className={`project-card-link project-card-link--icon project-card-link--website${
                          project.cardClickTarget === "website" ? " project-card-link--active-target" : ""
                        }`}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`Open ${project.displayTitle} website`}
                        title="Website"
                      >
                        <GlobeHemisphereWest size={15} weight="duotone" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
