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

const socialIcons = {
  github: GithubLogo,
  youtube: YoutubeLogo,
  linkedin: LinkedinLogo,
  medium: MediumLogo,
  devto: DevToLogo,
  leetcode: Code,
} satisfies Record<AboutSocialIcon, typeof GithubLogo>;

type ScriptLine = {
  id: string;
  text: string;
  x: number;
  y: number;
  lineIndex: number;
};

const scriptLines: readonly ScriptLine[] = [
  { id: "explore", text: "explore", x: 24, y: 136, lineIndex: 0 },
  { id: "engineer", text: "engineer", x: 90, y: 286, lineIndex: 1 },
  { id: "evolve", text: "evolve", x: 154, y: 430, lineIndex: 2 },
];

const mobileScriptDivider = String.fromCharCode(0x25cf);
const mobileScriptText = ["explore", "engineer", "evolve"].join(` ${mobileScriptDivider} `);

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
      <FooterAccentText text="Hello World" />
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
          {scriptLines.map((line) => (
            <text key={line.id} className="home-script-word" x={line.x} y={line.y}>
              {Array.from(line.text).map((letter, letterIndex) => (
                <tspan
                  key={`${line.id}-${letterIndex}`}
                  className="home-script-letter"
                  style={scriptLetterStyle(line.lineIndex, letterIndex)}
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
          I&apos;m{" "}
          <span className="home-name">
            Rahul Anand
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
        <p className="home-copy home-tldr u-theme-fade-target">
          TL;DR: I write code, value privacy, and build apps that respect it.
        </p>
        <p className="home-copy u-theme-fade-target">
          I build enterprise platforms for global banking and FINCrime teams as my day job and run Lyfie.org, where I ship open-source software like zero-lock-in notes, AI-friendly editors, and local-first automation with clean UX, sharp architecture, and boring reliability.
        </p>
        <div className="home-cta" aria-label="Primary navigation">
          <Link href="/about" className="home-cta-link u-theme-fade-target u-focus-ring-target">
            see more about me{" "}
            <ArrowUpRight size={16} weight="duotone" aria-hidden="true" />
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
