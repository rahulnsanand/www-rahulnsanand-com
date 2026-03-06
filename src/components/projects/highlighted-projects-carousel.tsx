"use client";

import { useEffect, useMemo, useRef, useState, type TransitionEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  GithubLogo,
  GlobeHemisphereWest,
} from "@phosphor-icons/react";
import { type HighlightProject } from "@/lib/projects";

type HighlightedProjectsCarouselProps = {
  projects: HighlightProject[];
};

export function HighlightedProjectsCarousel({ projects }: HighlightedProjectsCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const total = projects.length;
  const [position, setPosition] = useState(() => (projects.length > 1 ? projects.length : 0));
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);

  const loopedProjects = useMemo<HighlightProject[]>(() => {
    if (total < 2) return projects;
    return [...projects, ...projects, ...projects];
  }, [projects, total]);

  const activeProjectIndex = total > 0 ? ((position % total) + total) % total : 0;
  const slideWidth = viewportWidth * 0.8;
  const sidePeekOffset = (viewportWidth - slideWidth) / 2;
  const trackTranslatePx = sidePeekOffset - position * slideWidth;
  const minPosition = 0;
  const maxPosition = total > 1 ? total * 3 - 1 : 0;

  useEffect(() => {
    if (total < 2) {
      setPosition(0);
      return;
    }

    setIsTransitionEnabled(false);
    setPosition(total);
  }, [total]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      setViewportWidth(viewport.getBoundingClientRect().width);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (total < 2 || isPaused || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setPosition((current) => Math.min(maxPosition, current + 1));
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused, maxPosition, prefersReducedMotion, total]);

  useEffect(() => {
    if (isTransitionEnabled) return;

    const frame = window.requestAnimationFrame(() => {
      setIsTransitionEnabled(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isTransitionEnabled]);

  if (total === 0) {
    return (
      <div className="projects-highlight-empty" role="status">
        Highlighted repositories will appear here when GitHub data is available.
      </div>
    );
  }

  if (total === 1) {
    const project = projects[0];
    if (!project) {
      return null;
    }

    return (
      <article className="project-highlight project-highlight--solo">
        <Link
          href={project.cardClickUrl}
          className="project-highlight-overlay-link"
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Open ${project.displayTitle} on ${project.cardClickTarget === "website" ? "website" : "GitHub"}`}
        />
        <div className="project-highlight-media-wrap">
          <Image
            src={project.demoGifUrl ?? project.previewImageUrl}
            alt={`Preview for ${project.displayTitle}`}
            fill
            sizes="(max-width: 640px) 100vw, 70vw"
            className="project-highlight-media"
            priority
          />
        </div>
        <div className="project-highlight-main">
          <h3 className="project-highlight-title">{project.displayTitle}</h3>
          <p className="project-highlight-description">
            {project.description ?? "A featured repository from Rahul NS Anand."}
          </p>
          <div className="project-highlight-links">
            <Link
              href={project.htmlUrl}
              className={`project-highlight-link project-highlight-link--icon project-highlight-link--github${
                project.cardClickTarget === "github" ? " project-highlight-link--active-target" : ""
              }`}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Open ${project.displayTitle} on GitHub`}
              title="GitHub"
            >
              <GithubLogo size={16} weight="duotone" aria-hidden="true" />
            </Link>
            {project.homepage ? (
              <Link
                href={project.homepage}
                className={`project-highlight-link project-highlight-link--icon project-highlight-link--website${
                  project.cardClickTarget === "website" ? " project-highlight-link--active-target" : ""
                }`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Open ${project.displayTitle} website`}
                title="Website"
              >
                <GlobeHemisphereWest size={16} weight="duotone" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  const goToPrevious = () => {
    setPosition((current) => Math.max(minPosition, current - 1));
  };

  const goToNext = () => {
    setPosition((current) => Math.min(maxPosition, current + 1));
  };

  const handleTrackTransitionEnd = (event: TransitionEvent<HTMLOListElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") {
      return;
    }

    if (position >= total * 2) {
      setIsTransitionEnabled(false);
      setPosition((current) => current - total);
      return;
    }

    if (position < total) {
      setIsTransitionEnabled(false);
      setPosition((current) => current + total);
    }
  };

  return (
    <div
      className="projects-highlight-carousel"
      data-sketch-safe-zone="hard"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goToPrevious();
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          goToNext();
        }
      }}
      aria-roledescription="carousel"
      aria-label="Highlighted projects"
    >
      <div
        ref={viewportRef}
        className={`projects-highlight-viewport${
          !isTransitionEnabled ? " projects-highlight-viewport--loop-resetting" : ""
        }`}
      >
        <ol
          className="projects-highlight-track"
          style={{
            transform: `translateX(${trackTranslatePx}px)`,
            transition: isTransitionEnabled ? "transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1)" : "none",
          }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {loopedProjects.map((project, index) => {
            const isCenterCard = index === position;
            const mediaSource = isCenterCard && project.demoGifUrl ? project.demoGifUrl : project.previewImageUrl;

            return (
              <li key={`${project.id}-${index}`} className={`project-highlight-slot${isCenterCard ? " project-highlight-slot--center" : ""}`}>
                <article className="project-highlight">
                  <Link
                    href={project.cardClickUrl}
                    className="project-highlight-overlay-link"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`Open ${project.displayTitle} on ${project.cardClickTarget === "website" ? "website" : "GitHub"}`}
                  />
                  <div className="project-highlight-media-wrap">
                    <Image
                      src={mediaSource}
                      alt={`Preview for ${project.displayTitle}`}
                      fill
                      sizes="(max-width: 640px) 34vw, (max-width: 1024px) 33vw, 31vw"
                      className="project-highlight-media"
                      priority={isCenterCard && index <= 2}
                    />
                  </div>

                  <div className="project-highlight-main">
                    <h3 className="project-highlight-title">{project.displayTitle}</h3>
                    <p className="project-highlight-description">
                      {project.description ?? "A highlighted repository from Rahul NS Anand."}
                    </p>
                    <div className="project-highlight-links">
                      <Link
                        href={project.htmlUrl}
                        className={`project-highlight-link project-highlight-link--icon project-highlight-link--github${
                          project.cardClickTarget === "github" ? " project-highlight-link--active-target" : ""
                        }`}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`Open ${project.displayTitle} on GitHub`}
                        title="GitHub"
                      >
                        <GithubLogo size={16} weight="duotone" aria-hidden="true" />
                      </Link>
                      {project.homepage ? (
                        <Link
                          href={project.homepage}
                          className={`project-highlight-link project-highlight-link--icon project-highlight-link--website${
                            project.cardClickTarget === "website" ? " project-highlight-link--active-target" : ""
                          }`}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`Open ${project.displayTitle} website`}
                          title="Website"
                        >
                          <GlobeHemisphereWest size={16} weight="duotone" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <p className="projects-highlight-progress projects-highlight-progress--inside" aria-live="polite">
          {`Project ${activeProjectIndex + 1} of ${total}`}
        </p>
      </div>
      <button
        type="button"
        className="projects-highlight-control-button projects-highlight-control-button--prev"
        onClick={goToPrevious}
        aria-label="Show previous highlighted project"
      >
        <ArrowLeft size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="projects-highlight-control-button projects-highlight-control-button--next"
        onClick={goToNext}
        aria-label="Show next highlighted project"
      >
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
