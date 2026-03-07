"use client";

import "./highlighted-projects-carousel.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowLeft,
  ArrowRight,
  GithubLogo,
  GlobeHemisphereWest,
} from "@phosphor-icons/react/dist/ssr";
import { type HighlightProject } from "@/lib/projects";

type HighlightedProjectsCarouselProps = {
  projects: HighlightProject[];
};

const AUTOPLAY_DELAY_MS = 4600;
const AUTOPLAY_PROGRESS_PATH =
  "M4 8 C15.5 5.6, 26.5 10.4, 38 8 C49.5 5.9, 60.5 10.1, 72 8 C83.5 6, 94.5 10, 106 8 C117 6.4, 128.5 9.6, 144 8";
const HAND_DRAWN_DOT_PATHS = [
  "M9.3 2.1 C6 1.6, 2.4 3.4, 2 7 C1.6 11.1, 4.7 15, 9.2 15.2 C13.3 15.4, 16.5 12.3, 15.9 8.1 C15.5 5.1, 13.8 2.7, 9.3 2.1 Z",
  "M8.2 1.9 C4.9 2, 2 4.4, 2.5 8.1 C2.9 11.5, 4.8 14.9, 8.5 15.1 C12.5 15.3, 16.4 12.7, 15.5 8.8 C14.7 5.2, 12.8 1.8, 8.2 1.9 Z",
  "M9.8 2.5 C6.8 1.7, 3.3 2.7, 2.4 6.2 C1.3 10.1, 3.6 14.4, 7.9 15 C12 15.6, 15.7 13.4, 15.9 9.1 C16.1 5.6, 14 3.1, 9.8 2.5 Z",
  "M8.5 2.3 C5.3 1.8, 2.8 4.1, 2.1 7.5 C1.4 11.1, 4.5 14.4, 8.2 14.8 C11.8 15.1, 15.6 13.8, 15.8 10.1 C16 6.6, 13.6 2.7, 8.5 2.3 Z",
  "M9.1 2.1 C6.6 2, 3.4 3, 2.8 5.9 C2.1 9.5, 2.8 13.8, 7 14.9 C11.1 16, 15.2 13.8, 15.6 10 C16 6.5, 13.8 2.8, 9.1 2.1 Z",
  "M8.7 2.1 C5.8 2, 2.7 3.7, 2.4 6.8 C2 10.4, 4.1 14.9, 8.4 15.2 C12.6 15.5, 15.8 13.1, 15.5 9 C15.2 5.5, 13 2.2, 8.7 2.1 Z",
];

export function HighlightedProjectsCarousel({ projects }: HighlightedProjectsCarouselProps) {
  const total = projects.length;
  const autoplayPluginRef = useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY_MS,
      playOnInit: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
      stopOnInteraction: false,
    }),
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allowAutoplay, setAllowAutoplay] = useState(false);
  const [isAutoplayTimerRunning, setIsAutoplayTimerRunning] = useState(false);
  const [progressCycle, setProgressCycle] = useState(0);
  const [progressDurationMs, setProgressDurationMs] = useState(AUTOPLAY_DELAY_MS);

  const plugins = useMemo(() => {
    if (total < 2) {
      return [];
    }

    return [autoplayPluginRef.current];
  }, [total]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: total > 1,
      align: "center",
      skipSnaps: false,
    },
    plugins,
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const syncSelectedIndex = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    syncSelectedIndex();
    emblaApi.on("select", syncSelectedIndex);
    emblaApi.on("reInit", syncSelectedIndex);

    return () => {
      emblaApi.off("select", syncSelectedIndex);
      emblaApi.off("reInit", syncSelectedIndex);
    };
  }, [emblaApi]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateAllowAutoplay = () => {
      const isPerfLite = document.documentElement.classList.contains("perf-lite");
      setAllowAutoplay(!mediaQuery.matches && !isPerfLite);
    };

    updateAllowAutoplay();
    mediaQuery.addEventListener("change", updateAllowAutoplay);

    return () => {
      mediaQuery.removeEventListener("change", updateAllowAutoplay);
    };
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    if (allowAutoplay && total > 1) {
      autoplayPluginRef.current.play();
      return;
    }

    autoplayPluginRef.current.stop();
  }, [allowAutoplay, emblaApi, total]);

  useEffect(() => {
    if (!emblaApi || total < 2) {
      return;
    }

    const autoplay = autoplayPluginRef.current;

    const onTimerSet = () => {
      const timeUntilNext = autoplay.timeUntilNext();
      setProgressDurationMs(Math.max(1, Math.round(timeUntilNext ?? AUTOPLAY_DELAY_MS)));
      setProgressCycle((current) => current + 1);
      setIsAutoplayTimerRunning(true);
    };

    const onTimerStopped = () => {
      setIsAutoplayTimerRunning(false);
    };

    emblaApi.on("autoplay:timerset", onTimerSet);
    emblaApi.on("autoplay:timerstopped", onTimerStopped);

    if (allowAutoplay && autoplay.isPlaying()) {
      onTimerSet();
    } else {
      onTimerStopped();
    }

    return () => {
      emblaApi.off("autoplay:timerset", onTimerSet);
      emblaApi.off("autoplay:timerstopped", onTimerStopped);
    };
  }, [allowAutoplay, emblaApi, total]);

  if (total === 0) {
    return (
      <div className="projects-highlight-empty" role="status">
        Highlighted repositories will appear here when GitHub data is available.
      </div>
    );
  }

  const goToPrevious = () => {
    if (!emblaApi) {
      return;
    }

    emblaApi.scrollPrev();
    if (total > 1) {
      autoplayPluginRef.current.reset();
    }
  };

  const goToNext = () => {
    if (!emblaApi) {
      return;
    }

    emblaApi.scrollNext();
    if (total > 1) {
      autoplayPluginRef.current.reset();
    }
  };

  const goToIndex = (index: number) => {
    if (!emblaApi) {
      return;
    }

    emblaApi.scrollTo(index);
    if (total > 1) {
      autoplayPluginRef.current.reset();
    }
  };

  return (
    <div
      className="projects-highlight-carousel"
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
      <div ref={emblaRef} className="projects-highlight-viewport">
        <ol className="projects-highlight-track">
          {projects.map((project, index) => {
            const isCenterCard = index === selectedIndex;

            return (
              <li
                key={project.id}
                className={`project-highlight-slot${isCenterCard ? " project-highlight-slot--center" : ""}`}
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${total}`}
              >
                <article className="project-highlight">
                  <Link
                    href={project.cardClickUrl}
                    className="project-highlight-overlay-link u-focus-ring-target"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`Open ${project.displayTitle} on ${project.cardClickTarget === "website" ? "website" : "GitHub"}`}
                    tabIndex={isCenterCard ? 0 : -1}
                  />
                  <div className="project-highlight-media-wrap">
                    <Image
                      src={project.previewImageUrl}
                      alt={`Preview for ${project.displayTitle}`}
                      fill
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 82vw, 76vw"
                      className="project-highlight-media"
                      priority={index === 0}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      loading={index === 0 ? "eager" : "lazy"}
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
                        className={`project-highlight-link project-highlight-link--icon project-highlight-link--github u-theme-fade-target u-focus-ring-target${
                          project.cardClickTarget === "github" ? " project-highlight-link--active-target" : ""
                        }${!isCenterCard ? " project-highlight-link--disabled" : ""}`}
                        aria-disabled={!isCenterCard}
                        tabIndex={isCenterCard ? 0 : -1}
                        title={isCenterCard ? "GitHub" : undefined}
                        onClick={(event) => {
                          if (!isCenterCard) {
                            event.preventDefault();
                          }
                        }}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`Open ${project.displayTitle} on GitHub`}
                      >
                        <GithubLogo size={16} weight="duotone" aria-hidden="true" />
                      </Link>
                      {project.homepage ? (
                        <Link
                          href={project.homepage}
                          className={`project-highlight-link project-highlight-link--icon project-highlight-link--website u-theme-fade-target u-focus-ring-target${
                            project.cardClickTarget === "website" ? " project-highlight-link--active-target" : ""
                          }${!isCenterCard ? " project-highlight-link--disabled" : ""}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`Open ${project.displayTitle} website`}
                          title={isCenterCard ? "Website" : undefined}
                          aria-disabled={!isCenterCard}
                          tabIndex={isCenterCard ? 0 : -1}
                          onClick={(event) => {
                            if (!isCenterCard) {
                              event.preventDefault();
                            }
                          }}
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
      </div>
      {total > 1 ? (
        <div className="projects-highlight-navigation">
          <div
            className={`projects-highlight-autoplay${
              isAutoplayTimerRunning ? " projects-highlight-autoplay--active" : ""
            }`}
            aria-hidden="true"
          >
            <div className="projects-highlight-autoplay-shell">
              <svg className="projects-highlight-autoplay-svg" viewBox="0 0 148 16" preserveAspectRatio="none">
                <path
                  d={AUTOPLAY_PROGRESS_PATH}
                  className="projects-highlight-autoplay-track"
                  pathLength={1}
                />
                <path
                  key={progressCycle}
                  d={AUTOPLAY_PROGRESS_PATH}
                  className="projects-highlight-autoplay-progress"
                  pathLength={1}
                  style={{
                    animationDuration: `${progressDurationMs}ms`,
                    animationPlayState: isAutoplayTimerRunning ? "running" : "paused",
                  }}
                />
              </svg>
            </div>
          </div>
          <div className="projects-highlight-center-controls">
            <button
              type="button"
              className="projects-highlight-control-button projects-highlight-control-button--prev u-theme-fade-target u-focus-ring-target"
              onClick={goToPrevious}
              aria-label="Show previous highlighted project"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <div className="projects-highlight-dots" aria-label="Select highlighted project">
              {projects.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  className={`projects-highlight-dot u-theme-fade-target u-focus-ring-target${
                    index === selectedIndex ? " projects-highlight-dot--active" : ""
                  }`}
                  onClick={() => {
                    goToIndex(index);
                  }}
                  aria-label={`Go to highlighted project ${index + 1}`}
                  aria-current={index === selectedIndex ? "true" : undefined}
                >
                  <svg className="projects-highlight-dot-svg" viewBox="0 0 18 18" aria-hidden="true">
                    <path
                      className="projects-highlight-dot-outline"
                      d={HAND_DRAWN_DOT_PATHS[index % HAND_DRAWN_DOT_PATHS.length] ?? HAND_DRAWN_DOT_PATHS[0]}
                    />
                    <path
                      className="projects-highlight-dot-fill"
                      d={HAND_DRAWN_DOT_PATHS[index % HAND_DRAWN_DOT_PATHS.length] ?? HAND_DRAWN_DOT_PATHS[0]}
                    />
                  </svg>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="projects-highlight-control-button projects-highlight-control-button--next u-theme-fade-target u-focus-ring-target"
              onClick={goToNext}
              aria-label="Show next highlighted project"
            >
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          <p className="projects-highlight-progress" aria-live="polite">
            {`Project ${selectedIndex + 1} of ${total}`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
