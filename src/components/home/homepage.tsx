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

export function Homepage() {
  const { profile } = aboutContent;

  return (
    <section className="home-page relative">
      <FooterAccentText text="Hello World" />
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
        <p className="home-copy u-theme-fade-target">
          Software Engineer 2 building AI and personal data tools with a focus
          on thoughtful design and reliable systems.
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
