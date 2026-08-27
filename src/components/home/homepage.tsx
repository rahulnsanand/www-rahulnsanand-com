import "./homepage.module.css";
import {
  ArrowUpRight,
  Code,
  DevToLogo,
  GithubLogo,
  LinkedinLogo,
  MediumLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";
import Link from "next/link";
import { FooterAccentText } from "@/components/layout/site-footer-accent";
import { aboutContent, type AboutSocialIcon } from "@/lib/about";
import { homeContent } from "@/lib/home";

const socialIcons = {
  github: GithubLogo,
  youtube: YoutubeLogo,
  linkedin: LinkedinLogo,
  medium: MediumLogo,
  devto: DevToLogo,
  leetcode: Code,
} satisfies Record<AboutSocialIcon, typeof GithubLogo>;

// The handwritten background words are laid out on a fixed 760x500 canvas, stepping right and down
// per line so any number of words configured in `home.json` stays inside the artboard.
const SCRIPT_ORIGIN_X = 24;
const SCRIPT_ORIGIN_Y = 136;
const SCRIPT_STEP_X = 65;
const SCRIPT_STEP_Y = 147;

const mobileScriptDivider = String.fromCharCode(0x25cf);
const mobileScriptText = homeContent.backgroundWords.join(` ${mobileScriptDivider} `);

function scriptLetterStyle(lineIndex: number, letterIndex: number): CSSProperties {
  const base = 920 + lineIndex * 560;
  const jitterOffsets = [0, 22, 8, 29, 12] as const;
  const jitter = jitterOffsets[letterIndex % jitterOffsets.length] ?? 0;
  return {
    animationDelay: `${base + letterIndex * 86 + jitter}ms`,
  };
}

function mobileScriptCharStyle(charIndex: number): CSSProperties {
  const base = 520;
  const jitterOffsets = [0, 11, 5, 16, 8] as const;
  const jitter = jitterOffsets[charIndex % jitterOffsets.length] ?? 0;
  return {
    animationDelay: `${base + charIndex * 34 + jitter}ms`,
  };
}

export function Homepage() {
  const { profile } = aboutContent;

  return (
    <section className="home-page relative">
      <FooterAccentText text={homeContent.footerAccent} />
      <p className="home-mobile-script" aria-hidden="true">
        {Array.from(mobileScriptText).map((char, index) => {
          const isSpace = char === " ";
          const isDot = char === mobileScriptDivider;
          const className = [
            "home-mobile-script-char",
            isSpace ? "home-mobile-script-space" : "",
            isDot ? "home-mobile-script-dot" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <span
              key={`mobile-script-char-${index}`}
              className={className}
              style={isSpace ? undefined : mobileScriptCharStyle(index)}
            >
              {isSpace ? "\u00A0" : char}
            </span>
          );
        })}
      </p>
      <div className="home-script-bg" aria-hidden="true">
        <svg
          className="home-script-svg"
          viewBox="0 0 760 500"
          preserveAspectRatio="xMidYMid meet"
          focusable="false"
        >
          {homeContent.backgroundWords.map((word, lineIndex) => (
            <text
              key={`${word}-${lineIndex}`}
              className="home-script-word"
              x={SCRIPT_ORIGIN_X + lineIndex * SCRIPT_STEP_X}
              y={SCRIPT_ORIGIN_Y + lineIndex * SCRIPT_STEP_Y}
            >
              {Array.from(word).map((letter, letterIndex) => (
                <tspan
                  key={`${word}-${lineIndex}-${letterIndex}`}
                  className="home-script-letter"
                  style={scriptLetterStyle(lineIndex, letterIndex)}
                >
                  {letter}
                </tspan>
              ))}
            </text>
          ))}
        </svg>
      </div>
      <div className="home-stack relative z-10">
        <h1 className="home-title">
          {homeContent.titlePrefix}{" "}
          <span className="home-name">
            {homeContent.name}
            <svg
              className="home-name-underline"
              viewBox="0 0 460 56"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="home-name-underline-main"
                d="M10 36 C 82 50, 154 16, 226 30 C 294 43, 360 24, 450 34"
              />
              <path
                className="home-name-underline-detail"
                d="M18 40 C 88 54, 160 22, 228 34 C 296 46, 362 28, 444 38"
              />
            </svg>
          </span>
        </h1>
        <p className="home-copy home-tldr u-theme-fade-target">{homeContent.tldr}</p>
        <p className="home-copy u-theme-fade-target">{homeContent.intro}</p>
        <div className="home-cta" aria-label="Primary navigation">
          <Link
            href={homeContent.ctaHref}
            className="home-cta-link u-theme-fade-target u-focus-ring-target"
          >
            {homeContent.ctaLabel} <ArrowUpRight size={16} weight="duotone" aria-hidden="true" />
          </Link>
        </div>
        <div className="home-portals" aria-label="Digital portals">
          {profile.socialLinks.map((portal) => {
            const Icon = socialIcons[portal.icon];
            return (
              <a
                key={portal.href}
                href={portal.href}
              className="home-portal-link u-theme-fade-target u-focus-ring-target"
              target="_blank"
              rel="noreferrer noopener"
              aria-label={portal.label}
            >
                <Icon size={18} weight="duotone" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
